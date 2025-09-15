// app/api/auth/register/route.ts - FIXED ARCJET PROPERTIES
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createToken, getCookieOptions, userToPayload } from '@/lib/auth';
import { z } from 'zod';
import arcjet, { shield, tokenBucket, slidingWindow } from "@arcjet/next";

// ===== ARCJET CONFIGURATION FOR REGISTER ENDPOINT =====
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    // Enhanced protection for registration endpoint
    shield({ mode: "LIVE" }),
    
    // Rate limiting for registration (prevent spam accounts)
    tokenBucket({
      mode: "LIVE",
      characteristics: ["ip.src"], // Track by IP
      refillRate: 2,        // Only 2 registrations per interval
      interval: "10m",      // 10 minute intervals
      capacity: 3,          // Max 3 registrations in bucket
    }),
    
    // Additional sliding window protection
    slidingWindow({
      mode: "LIVE",
      characteristics: ["ip.src"],
      interval: "1h",       // 1 hour window
      max: 5,               // Max 5 registrations per hour per IP
    }),
  ],
});

const RegisterSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(6).max(100),
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  organizationName: z.string().max(100).optional().or(z.literal('')),
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
        console.log(`🚨 Registration rate limit exceeded from IP: ${clientIp}`);
        return NextResponse.json(
          { 
            success: false,
            error: "Too many registration attempts", 
            message: "Please wait 10 minutes before trying again",
            retryAfter: 600 // 10 minutes in seconds
          },
          { 
            status: 429,
            headers: { 'Retry-After': '600' }
          }
        );
      }
      
      if (decision.reason.isShield()) {
        console.log(`🛡️ Registration attempt blocked by shield from IP: ${clientIp}`);
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

    // ===== STANDARD REGISTRATION LOGIC =====
    const body = await request.json();
    const validation = RegisterSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, error: 'Invalid input data',
          details: validation.error.issues.map((err: any) => ({
            field: err.path.join('.'), message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { username, password, firstName, lastName, email, phone, organizationName } = validation.data;
    const cleanEmail = email?.trim() || null;
    const cleanPhone = phone?.trim() || null;
    const cleanOrgName = organizationName?.trim() || null;

    // Log registration attempt
    console.log(`📝 Registration attempt: ${username} from IP: ${clientIp}`);

    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingUser) {
      console.log(`❌ Registration failed - username exists: ${username} from IP: ${clientIp}`);
      return NextResponse.json({ success: false, error: 'Username already exists' }, { status: 409 });
    }

    if (cleanEmail) {
      const existingEmailUser = await prisma.user.findFirst({
        where: { email: cleanEmail.toLowerCase() }
      });
      if (existingEmailUser) {
        console.log(`❌ Registration failed - email exists: ${cleanEmail} from IP: ${clientIp}`);
        return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 });
      }
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: username.toLowerCase(), password: hashedPassword,
          firstName: firstName.trim(), lastName: lastName.trim(),
          email: cleanEmail?.toLowerCase(), phone: cleanPhone,
          status: 'ACTIVE', isActive: true, emailVerified: false,
        },
        select: {
          id: true, username: true, email: true, firstName: true, lastName: true,
          phone: true, status: true, isActive: true, emailVerified: true,
          createdAt: true, updatedAt: true,
        }
      });

      let organization = null;

      if (cleanOrgName) {
        const baseSlug = cleanOrgName.toLowerCase()
          .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        
        let slug = baseSlug, counter = 1;
        while (await tx.organization.findUnique({ where: { slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        organization = await tx.organization.create({
          data: {
            name: cleanOrgName, slug, 
            description: `Organization created by ${newUser.firstName} ${newUser.lastName}`,
            status: 'ACTIVE', timezone: 'Asia/Bangkok',
            allowDepartments: true,
            email: cleanEmail?.toLowerCase(),
            phone: cleanPhone,
          },
          select: {
            id: true, name: true, slug: true, description: true,
            status: true, timezone: true, email: true, phone: true, allowDepartments: true,
          }
        });

        // Create OrganizationUser with simple role
        await tx.organizationUser.create({
          data: {
            organizationId: organization.id, userId: newUser.id,
            roles: 'OWNER', isOwner: true, isActive: true, joinedAt: new Date(),
          }
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            organizationId: organization.id, userId: newUser.id, action: 'users.register',
            payload: {
              username: newUser.username, organizationCreated: true,
              organizationName: organization.name, timestamp: new Date().toISOString(),
              ip: request.headers.get('x-forwarded-for') || clientIp
            }
          }
        });
      }

      return { newUser, organization };
    });

    // ===== SUCCESSFUL REGISTRATION =====
    console.log(`✅ Registration successful: ${username} from IP: ${clientIp}`);

    const userPayload = userToPayload(result.newUser);
    const token = result.organization ? 
      await createToken({ ...userPayload, organizationId: result.organization.id, role: 'OWNER' }) :
      await createToken(userPayload);

    const userResponse = {
      id: result.newUser.id, username: result.newUser.username, email: result.newUser.email,
      firstName: result.newUser.firstName, lastName: result.newUser.lastName,
      fullName: `${result.newUser.firstName} ${result.newUser.lastName}`,
      phone: result.newUser.phone, status: result.newUser.status, isActive: result.newUser.isActive,
      emailVerified: result.newUser.emailVerified, createdAt: result.newUser.createdAt, 
      updatedAt: result.newUser.updatedAt,
    };

    const response = NextResponse.json({
      success: true, message: 'Registration successful', user: userResponse,
      token, organization: result.organization, requiresApproval: false,
    });

    response.cookies.set('auth-token', token, getCookieOptions());
    return response;

  } catch (error) {
    console.error('Registration error:', error);
    if ((error as any)?.code === 'P2002') {
      const target = (error as any)?.meta?.target;
      if (target?.includes('username')) {
        return NextResponse.json({ success: false, error: 'Username already exists' }, { status: 409 });
      }
      if (target?.includes('email')) {
        return NextResponse.json({ success: false, error: 'Email already exists' }, { status: 409 });
      }
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}