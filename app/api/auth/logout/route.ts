// app/api/auth/logout/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders } from '@/lib/auth-server';
import { createAuditLog, getRequestMetadata } from '@/lib/audit-logger';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userInfo = getUserFromHeaders(request.headers);

    if (userInfo) {
      try {
        const userOrg = await prisma.organizationUser.findFirst({
          where: { userId: userInfo.userId, isActive: true },
          select: { organizationId: true }
        });

        if (userOrg) {
          // ✅ FIXED: ใช้ createAuditLog helper แทนการ create โดยตรง
          const { ipAddress, userAgent } = getRequestMetadata(request);
          
          await createAuditLog({
            organizationId: userOrg.organizationId,
            userId: userInfo.userId,
            action: 'auth.logout',
            category: 'AUTH',              // ✅ Required field
            severity: 'INFO',               // ✅ Required field (default)
            description: `${userInfo.username} ออกจากระบบ`, // ✅ Required field
            ipAddress,
            userAgent,
            payload: {
              timestamp: new Date().toISOString(),
              username: userInfo.username
            }
          });
        }
      } catch (auditError) {
        console.warn('Failed to log logout audit:', auditError);
      }
    }

    const response = NextResponse.json({ success: true, message: 'Logout successful' });
    response.cookies.set('auth-token', '', {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 0, 
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
    
    response.cookies.set('auth-token', '', {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 0, 
      path: '/',
    });
    
    return response;
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed' 
  }, { status: 405 });
}