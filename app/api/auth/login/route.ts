// app/api/auth/login/route.ts - FIXED FOR 3-ROLE SYSTEM
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken, getCookieOptions, userToPayload } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json({ success: false, error: 'Username not found' }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE' || !user.isActive) {
      return NextResponse.json({ success: false, error: 'User account not active' }, { status: 403 });
    }

    const userOrganizations = await prisma.organizationUser.findMany({
      where: { userId: user.id, isActive: true },
      include: {
        organization: {
          select: {
            id: true, name: true, slug: true, description: true, logo: true,
            status: true, timezone: true, currency: true,
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    const userPayload = userToPayload(user);
    let token: string;

    if (userOrganizations.length > 0) {
      const defaultOrg = userOrganizations[0];
      // Use simple role from OrganizationUser instead of complex role system
      const userRole = defaultOrg.roles; // This is the simple 'MEMBER' | 'ADMIN' | 'OWNER'

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