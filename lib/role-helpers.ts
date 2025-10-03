// lib/role-helpers.ts
// Role Management Helper Functions - Centralized Role Validation
// ============================================

export const VALID_ROLES = ['MEMBER', 'ADMIN', 'OWNER'] as const;
export type OrganizationRole = typeof VALID_ROLES[number];

// Configuration
export const MAX_ADMINS = 10; // จำกัดจำนวน ADMIN สูงสุดต่อองค์กร

/**
 * Validate if role is valid
 */
export function isValidRole(role: string): role is OrganizationRole {
  return VALID_ROLES.includes(role as OrganizationRole);
}

/**
 * Get role hierarchy level (higher = more power)
 */
export function getRoleHierarchy(role: OrganizationRole): number {
  const hierarchy = { 
    MEMBER: 1, 
    ADMIN: 2, 
    OWNER: 3 
  };
  return hierarchy[role];
}

/**
 * Check if manager can manage target role
 * Rule: Can only manage roles below their level
 */
export function canManageRole(
  managerRole: OrganizationRole, 
  targetRole: OrganizationRole
): boolean {
  return getRoleHierarchy(managerRole) > getRoleHierarchy(targetRole);
}

/**
 * Check if role change is allowed
 * OWNER can manage anyone (including promoting to OWNER and demoting other OWNERs)
 * ADMIN can manage MEMBER and other ADMINs (but cannot promote to OWNER or touch OWNERs)
 */
export function canChangeRole(
  managerRole: OrganizationRole,
  targetCurrentRole: OrganizationRole,
  targetNewRole: OrganizationRole
): boolean {
  // OWNER has full control
  // ✅ Can promote anyone to OWNER (create co-owners)
  // ✅ Can demote OWNER → ADMIN or OWNER → MEMBER
  // ✅ Can promote/demote ADMIN ↔ MEMBER
  if (managerRole === 'OWNER') {
    return true; // ✅ Allow all changes
  }
  
  // ADMIN can manage MEMBERs and other ADMINs
  // ✅ Can promote MEMBER → ADMIN
  // ✅ Can demote ADMIN → MEMBER
  // ❌ Cannot touch OWNER
  // ❌ Cannot promote anyone to OWNER
  if (managerRole === 'ADMIN') {
    // Cannot touch OWNER
    if (targetCurrentRole === 'OWNER') {
      return false;
    }
    
    // Cannot promote to OWNER
    if (targetNewRole === 'OWNER') {
      return false;
    }
    
    // ✅ Allow ADMIN to manage MEMBER and other ADMINs
    return true;
  }
  
  // MEMBER cannot manage anyone
  return false;
}

/**
 * Get role display information
 */
export function getRoleInfo(role: OrganizationRole) {
  const roleInfo = {
    OWNER: {
      label: 'OWNER',
      color: 'bg-purple-500 hover:bg-purple-600',
      textColor: 'text-purple-600',
      icon: 'Crown',
      description: 'เจ้าขององค์กร - สิทธิ์สูงสุด'
    },
    ADMIN: {
      label: 'ADMIN',
      color: 'bg-blue-500 hover:bg-blue-600',
      textColor: 'text-blue-600',
      icon: 'Shield',
      description: 'ผู้ดูแลระบบ - จัดการสมาชิกและหน่วยงาน'
    },
    MEMBER: {
      label: 'MEMBER',
      color: 'bg-gray-500 hover:bg-gray-600',
      textColor: 'text-gray-600',
      icon: 'UserCircle',
      description: 'สมาชิกทั่วไป - เข้าถึงข้อมูลพื้นฐาน'
    }
  };
  
  return roleInfo[role];
}