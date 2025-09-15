// lib/auth.ts - SIMPLIFIED 3-ROLE SYSTEM (FIXED TYPESCRIPT ERRORS)
// InvenStock - Server-side Authentication Utilities

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// JWT Secret
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

const JWT_EXPIRES_IN = '7d';

// ===== TYPE DEFINITIONS =====

// Simplified to match 3-Role System
export interface UserPayload {
  userId: string;
  email: string;
  username?: string;          // Optional
  firstName: string;
  lastName: string;
  organizationId?: string;    // Current active organization
  role?: 'MEMBER' | 'ADMIN' | 'OWNER';  // Simple role enum
}

export interface JWTUser extends UserPayload {
  iat?: number;
  exp?: number;
}

// Define proper type for user data
interface UserData {
  id: string;
  email?: string | null;
  username?: string | null;
  firstName: string;
  lastName: string;
  status: string;
  isActive: boolean;
}

// ===== AUTH ERROR CONSTANTS =====

export const AuthError = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  USER_NOT_FOUND: 'User not found',
  USER_NOT_APPROVED: 'User account pending approval',
  USER_SUSPENDED: 'User account suspended',
  USER_INACTIVE: 'User account inactive',
  INVALID_TOKEN: 'Invalid or expired token',
  ORGANIZATION_NOT_FOUND: 'Organization not found',
  NO_ORGANIZATION_ACCESS: 'No access to organization'
} as const;

// ===== JWT FUNCTIONS =====

/**
 * Create JWT Token with organization context
 */
export async function createToken(user: UserPayload): Promise<string> {
  const payload: Record<string, unknown> = { // Fixed: use unknown instead of any
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  // Add optional fields only if they exist
  if (user.username) payload.username = user.username;
  if (user.organizationId) payload.organizationId = user.organizationId;
  if (user.role) payload.role = user.role;

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

/**
 * Verify JWT Token using Jose
 */
export async function verifyToken(token: string): Promise<JWTUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    const result: JWTUser = {
      userId: payload.userId as string,
      email: payload.email as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      iat: payload.iat,
      exp: payload.exp
    };

    // Add optional fields only if they exist
    if (payload.username) result.username = payload.username as string;
    if (payload.organizationId) result.organizationId = payload.organizationId as string;
    if (payload.role) result.role = payload.role as 'MEMBER' | 'ADMIN' | 'OWNER';

    return result;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Create token with organization context
 */
export async function createTokenWithOrganization(
  user: UserPayload,
  organizationId: string,
  role?: 'MEMBER' | 'ADMIN' | 'OWNER'
): Promise<string> {
  return createToken({
    ...user,
    organizationId,
    role
  });
}

/**
 * Alias functions for backward compatibility
 */
export async function verifyJWT(token: string): Promise<JWTUser | null> {
  return verifyToken(token);
}

export async function signJWT(payload: UserPayload): Promise<string> {
  return createToken(payload);
}

// ===== PASSWORD FUNCTIONS =====

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return comparePassword(password, hashedPassword);
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
 * Convert user object to JWT payload (simplified for 3-Role System)
 */
export function userToPayload(
  user: UserData, // Fixed: use proper type instead of any
  organizationId?: string, 
  role?: 'MEMBER' | 'ADMIN' | 'OWNER'
): UserPayload {
  const payload: UserPayload = {
    userId: user.id,
    email: user.email || '',
    firstName: user.firstName,
    lastName: user.lastName,
  };

  if (user.username) payload.username = user.username;
  if (organizationId) payload.organizationId = organizationId;
  if (role) payload.role = role;

  return payload;
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

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  
  return authHeader;
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

// ===== SIMPLE PERMISSION CHECKING =====

export function hasPermission(
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER',
  permission: string
): boolean {
  switch (permission) {
    // MEMBER permissions
    case 'stocks.read':
    case 'stocks.adjust':
    case 'products.read':
    case 'transfers.create':
    case 'transfers.receive':
      return ['MEMBER', 'ADMIN', 'OWNER'].includes(userRole);
    
    // ADMIN permissions
    case 'products.create':
    case 'products.update':
    case 'products.delete':
    case 'categories.create':
    case 'users.invite':
    case 'transfers.approve':
      return ['ADMIN', 'OWNER'].includes(userRole);
    
    // OWNER permissions
    case 'departments.create':
    case 'departments.update':
    case 'departments.delete':
    case 'organization.settings':
    case 'users.manage':
      return userRole === 'OWNER';
    
    default:
      return false;
  }
}

export function requireRole(
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER',
  minimumRole: 'MEMBER' | 'ADMIN' | 'OWNER'
): boolean {
  const roleHierarchy = {
    MEMBER: 1,
    ADMIN: 2,
    OWNER: 3
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[minimumRole];
}

// ===== RATE LIMITING =====

export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }
    
    if (record.count >= this.maxAttempts) {
      return false;
    }
    
    record.count++;
    return true;
  }
  
  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    return Math.max(0, record.resetTime - Date.now());
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

// ===== REFRESH TOKEN FUNCTIONS =====

export async function generateRefreshToken(userId: string): Promise<string> {
  return await new SignJWT({ userId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'refresh') {
      return null;
    }
    return { userId: payload.userId as string };
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
}

export function generateRandomPassword(length = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure we have at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}