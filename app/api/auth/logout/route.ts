// app/api/auth/logout/route.ts - SIMPLIFIED (NO AUDIT LOG)
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // ✅ Logout: ลบ cookie และ return success (ไม่ต้อง audit log)
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout successful' 
    });
    
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
    
    // ✅ แม้เกิด error ก็ต้องลบ cookie
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