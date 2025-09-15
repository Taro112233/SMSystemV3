// app/api/auth/login/route.ts - FIXED ARCJET PROPERTIES
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken, getCookieOptions, userToPayload } from '@/lib/auth';
import { z } from 'zod';
import arcjet, { shield, tokenBucket, slidingWindow } from "@arcjet/next";

// ===== ARCJET CONFIGURATION FOR LOGIN ENDPOINT =====
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Enhanced protection for login endpoint
    shield({ mode: "LIVE" }),
    
    // Strict rate limiting for login attempts (prevent brute force)
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"], // Track by IP
      refillRate: 3,        // Only 3 login attempts per interval
      interval: "5m",       // 5 minute intervals
      capacity: 5,          // Max 5 attempts in bucket
    }),
    
    // Additional sliding window protection
    slidingWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      interval: "1h",       // 1 hour window
      max: 10,              // Max 10 login attempts per hour
    }),
  ],
});

const LoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // ===== ARCJET PROTECTION CHECK =====
    const decision = await aj.protect(request, { requested: 1 });
    
    // Get IP from request headers as fallback
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        console.log(`🚨 Login rate limit exceeded from IP: ${clientIp}`);
        return NextResponse.json(
          { 
            success: false,
            error: "Too many login attempts", 
            message: "Please wait 5 minutes before trying again",
            retryAfter: 300 // 5 minutes in seconds
          },
          { 
            status: 429,
            headers: { 'Retry-After': '300' }
          }
        );
      }
      
      if (decision.reason.isShield()) {
        console.log(`🛡️ Login attempt blocked by shield from IP: ${clientIp}`);
        return NextResponse.json(
          { success: false, error: "Request blocked by security filter" },
          { status: 403 }
        );
      }

      // General denial
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    // ===== STANDARD LOGIN LOGIC =====
    const body = await request.json();
    const validation = LoginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid input data',
          details: validation.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true, username: true, email: true, password: true,
        firstName: true, lastName: true, status: true, isActive: true,
        emailVerified: true, lastLogin: true, createdAt: true, updatedAt: true,
      }
    });

    if (!user) {
      // Log failed attempt for monitoring
      console.log(`❌ Login failed - user not found: ${username} from IP: ${clientIp}`);
      return NextResponse.json({ success: false, error: 'Username not found' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      // Log failed attempt for monitoring
      console.log(`❌ Login failed - invalid password: ${username} from IP: ${clientIp}`);
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE' || !user.isActive) {
      console.log(`❌ Login failed - inactive account: ${username} from IP: ${clientIp}`);
      return NextResponse.json({ success: false, error: 'User account not active' }, { status: 403 });
    }

    // ===== SUCCESSFUL LOGIN =====
    console.log(`✅ Login successful: ${username} from IP: ${clientIp}`);

    const userOrganizations = await prisma.organizationUser.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        organization: {
          select: {
            id: true, name: true, slug: true, description: true,
            status: true, timezone: true, email: true, phone: true, allowDepartments: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    const userPayload = userToPayload(user);
    let token: string;

    if (userOrganizations.length > 0) {
      const defaultOrg = userOrganizations[0];
      const userRole = defaultOrg.roles;

      token = await createToken({
        ...userPayload,
        organizationId: defaultOrg.organizationId,
        role: userRole as 'MEMBER' | 'ADMIN' | 'OWNER'
      });
    } else {
      token = await createToken(userPayload);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const userResponse = {
      id: user.id, username: user.username, email: user.email,
      firstName: user.firstName, lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      status: user.status, isActive: user.isActive,
      emailVerified: user.emailVerified, createdAt: user.createdAt, updatedAt: user.updatedAt,
    };

    const response = NextResponse.json({
      success: true, message: 'Login successful',
      user: userResponse, token: token, organizations: userOrganizations
    });

    response.cookies.set('auth-token', token, getCookieOptions());
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}