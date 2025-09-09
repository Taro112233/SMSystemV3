// app/api/auth/logout/route.ts - WORKING VERSION  
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromHeaders } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userInfo = getUserFromHeaders(request.headers);
    const cookieStore = await cookies();

    if (userInfo) {
      try {
        const userOrg = await prisma.organizationUser.findFirst({
          where: { userId: userInfo.userId, isActive: true },
          select: { organizationId: true }
        });

        if (userOrg) {
          await prisma.auditLog.create({
            data: {
              organizationId: userOrg.organizationId,
              userId: userInfo.userId,
              action: 'users.logout',
              payload: {
                timestamp: new Date().toISOString(),
                ip: request.headers.get('x-forwarded-for') || 'unknown'
              }
            }
          });
        }
      } catch (auditError) {
        console.warn('Failed to log logout audit:', auditError);
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logout successful' });
    response.cookies.set('auth-token', '', {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 0, path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    response.cookies.set('auth-token', '', {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 0, path: '/',
    });
    return response;
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}