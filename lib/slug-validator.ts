// lib/slug-validator.ts
// Slug Validation Helper - Prevent route collision
// ============================================

import { 
  getSystemReservedSlugs, 
  isOrgLevelPage,
  getAllReservedSlugs 
} from './reserved-routes';

/**
 * Check if slug is reserved and cannot be used
 */
export function isReservedSlug(slug: string): boolean {
  const normalizedSlug = slug.toLowerCase().trim();
  const systemReserved = getSystemReservedSlugs();
  return systemReserved.includes(normalizedSlug);
}

/**
 * Check if slug is reserved for organization-level pages
 * (Can be used as department slug, but not org slug)
 */
export function isReservedOrgPage(slug: string): boolean {
  const normalizedSlug = slug.toLowerCase().trim();
  return isOrgLevelPage(normalizedSlug);
}

/**
 * Validate organization slug
 * Returns: { isValid: boolean; error?: string }
 */
export function validateOrgSlug(slug: string): { 
  isValid: boolean; 
  error?: string;
} {
  const normalizedSlug = slug.toLowerCase().trim();

  // Check empty
  if (!normalizedSlug) {
    return { isValid: false, error: 'Slug ไม่สามารถเว้นว่างได้' };
  }

  // Check length
  if (normalizedSlug.length < 3) {
    return { isValid: false, error: 'Slug ต้องมีอย่างน้อย 3 ตัวอักษร' };
  }

  if (normalizedSlug.length > 50) {
    return { isValid: false, error: 'Slug ต้องไม่เกิน 50 ตัวอักษร' };
  }

  // Check format (only lowercase, numbers, hyphens)
  if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
    return { 
      isValid: false, 
      error: 'Slug สามารถใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น' 
    };
  }

  // Check reserved slugs
  if (isReservedSlug(normalizedSlug)) {
    return { 
      isValid: false, 
      error: `"${normalizedSlug}" เป็นคำสงวนของระบบ กรุณาเลือกชื่ออื่น` 
    };
  }

  // Check reserved org pages (also can't be org slug)
  if (isReservedOrgPage(normalizedSlug)) {
    return { 
      isValid: false, 
      error: `"${normalizedSlug}" เป็นหน้าของระบบ กรุณาเลือกชื่ออื่น` 
    };
  }

  // Check starts/ends with hyphen
  if (normalizedSlug.startsWith('-') || normalizedSlug.endsWith('-')) {
    return { 
      isValid: false, 
      error: 'Slug ต้องไม่ขึ้นต้นหรือลงท้ายด้วยเครื่องหมาย -' 
    };
  }

  // Check consecutive hyphens
  if (normalizedSlug.includes('--')) {
    return { 
      isValid: false, 
      error: 'Slug ต้องไม่มีเครื่องหมาย - ติดกันมากกว่า 1 ตัว' 
    };
  }

  return { isValid: true };
}

/**
 * Validate department slug
 * Returns: { isValid: boolean; error?: string }
 */
export function validateDeptSlug(slug: string): { 
  isValid: boolean; 
  error?: string;
} {
  const normalizedSlug = slug.toLowerCase().trim();

  // Check empty
  if (!normalizedSlug) {
    return { isValid: false, error: 'Slug ไม่สามารถเว้นว่างได้' };
  }

  // Check length
  if (normalizedSlug.length < 2) {
    return { isValid: false, error: 'Slug ต้องมีอย่างน้อย 2 ตัวอักษร' };
  }

  if (normalizedSlug.length > 50) {
    return { isValid: false, error: 'Slug ต้องไม่เกิน 50 ตัวอักษร' };
  }

  // Check format
  if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
    return { 
      isValid: false, 
      error: 'Slug สามารถใช้ได้เฉพาะตัวพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น' 
    };
  }

  // Check reserved slugs (departments can't use system reserved words)
  if (isReservedSlug(normalizedSlug)) {
    return { 
      isValid: false, 
      error: `"${normalizedSlug}" เป็นคำสงวนของระบบ กรุณาเลือกชื่ออื่น` 
    };
  }

  // ✅ Department CAN use reserved org page names
  // (e.g., "settings" is fine for dept, but not for org)

  // Check starts/ends with hyphen
  if (normalizedSlug.startsWith('-') || normalizedSlug.endsWith('-')) {
    return { 
      isValid: false, 
      error: 'Slug ต้องไม่ขึ้นต้นหรือลงท้ายด้วยเครื่องหมาย -' 
    };
  }

  // Check consecutive hyphens
  if (normalizedSlug.includes('--')) {
    return { 
      isValid: false, 
      error: 'Slug ต้องไม่มีเครื่องหมาย - ติดกันมากกว่า 1 ตัว' 
    };
  }

  return { isValid: true };
}

/**
 * Generate safe slug from name
 */
export function generateSafeSlug(name: string, isOrganization: boolean = false): string {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens

  // If generated slug is reserved, add suffix
  const validator = isOrganization ? validateOrgSlug : validateDeptSlug;
  const validation = validator(baseSlug);
  
  if (!validation.isValid) {
    // Try adding suffix
    let counter = 1;
    let newSlug = `${baseSlug}-${counter}`;
    
    while (!validator(newSlug).isValid && counter < 100) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }
    
    return newSlug;
  }

  return baseSlug;
}

/**
 * Get list of reserved slugs (for UI display)
 */
export function getReservedSlugsList(): string[] {
  return getAllReservedSlugs();
}

/**
 * Check if slug needs warning (reserved org page used as dept slug)
 */
export function shouldWarnDeptSlug(slug: string): { 
  shouldWarn: boolean; 
  message?: string;
} {
  const normalizedSlug = slug.toLowerCase().trim();
  
  if (isReservedOrgPage(normalizedSlug)) {
    return {
      shouldWarn: true,
      message: `⚠️ "${normalizedSlug}" เป็นชื่อหน้าของระบบ อาจทำให้สับสนได้ แนะนำให้เลือกชื่ออื่น`
    };
  }

  return { shouldWarn: false };
}

// ===== EXAMPLE USAGE =====
/*
// In Organization Form
import { validateOrgSlug, generateSafeSlug } from '@/lib/slug-validator';

const handleNameChange = (name: string) => {
  const generatedSlug = generateSafeSlug(name, true); // true = organization
  const validation = validateOrgSlug(generatedSlug);
  
  if (!validation.isValid) {
    setError(validation.error);
  }
};

// In Department Form
import { validateDeptSlug, shouldWarnDeptSlug } from '@/lib/slug-validator';

const handleSlugChange = (slug: string) => {
  const validation = validateDeptSlug(slug);
  if (!validation.isValid) {
    setError(validation.error);
  }
  
  const warning = shouldWarnDeptSlug(slug);
  if (warning.shouldWarn) {
    setWarning(warning.message);
  }
};
*/