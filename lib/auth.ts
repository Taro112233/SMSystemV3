// lib/auth.ts - SIMPLIFIED JWT (USER IDENTITY ONLY)
// InvenStock - Server-side Authentication Utilities

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// JWT Secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

const JWT_EXPIRES_IN = '7d';

// ===== TYPE DEFINITIONS =====

// ✅ Simplified - Only user identity, no organization context
export interface UserPayload {
  userId: string;
  email?: string;             // Optional
  username: string;           // Primary credential
  firstName: string;
  lastName: string;
  phone?: string;
  // ❌ REMOVED: organizationId, role (will be checked dynamically)
}

export interface JWTUser extends UserPayload {
  iat?: number;
  exp?: number;
}

// Define proper type for user data
interface UserData {
  id: string;
  email?: string | null;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: string;
  isActive: boolean;
}

// ===== JWT FUNCTIONS =====

/**
 * ✅ Create lightweight JWT - only user identity
 */
export async function createToken(user: UserPayload): Promise<string> {
  return await new SignJWT({
    userId: user.userId,
    email: user.email || '',
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || null,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

/**
 * ✅ Verify JWT Token - returns user identity only
 */
export async function verifyToken(token: string): Promise<JWTUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      userId: payload.userId as string,
      email: payload.email as string || undefined,
      username: payload.username as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      phone: payload.phone as string || undefined,
      iat: payload.iat,
      exp: payload.exp
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// ===== PASSWORD FUNCTIONS =====

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ===== UTILITY FUNCTIONS =====

export function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

/**
 * ✅ Convert user object to JWT payload - no organization context
 */
export function userToPayload(user: UserData): UserPayload {
  return {
    userId: user.id,
    email: user.email || undefined,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || undefined,
  };
}

export function isUserActive(user: { status: string; isActive: boolean }): boolean {
  return user.status === 'ACTIVE' && user.isActive;
}

export function shouldRefreshToken(user: JWTUser): boolean {
  if (!user.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  const timeToExpiry = user.exp - now;
  return timeToExpiry < 24 * 60 * 60; // Refresh if expires within 24 hours
}

// ===== VALIDATION FUNCTIONS =====

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function isValidUserStatus(status: string): boolean {
  return ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'].includes(status);
}