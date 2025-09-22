// app/api/dashboard/organizations/route.ts - FIXED FOR NEW SCHEMA
// Dashboard Organizations API - Get user's organizations with stats

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth-server';

// Get user's organizations with statistics
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // ✅ FIXED: Updated organization select to match new schema
    const organizationUsers = await prisma.organizationUser.findMany({
      where: {
        userId: user.userId,
        isActive: true,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            email: true,
            phone: true,
            status: true,
            timezone: true,
            inviteCode: true,      // ✅ new field
            inviteEnabled: true,   // ✅ new field
            createdAt: true,
            updatedAt: true,
            // Count departments (if departments exist in new schema)
            departments: {
              select: { id: true },
              where: { isActive: true }
            },
            // Count users
            users: {
              select: { id: true },
              where: { isActive: true }
            }
            // ❌ REMOVED: allowDepartments (doesn't exist in new schema)
          }
        }
      },
      orderBy: {
        joinedAt: 'desc' // Most recent first
      }
    });

    // Build response with statistics
    const organizations = await Promise.all(
      organizationUsers.map(async (orgUser) => {
        const org = orgUser.organization;
        
        // Generate logo from organization name
        const generateLogo = (name: string): string => {
          const words = name.split(' ');
          if (words.length >= 2) {
            return words[0].charAt(0) + words[1].charAt(0);
          }
          return name.substring(0, 2);
        };

        // Generate color based on organization ID
        const colors = [
          'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
          'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500'
        ];
        const colorIndex = parseInt(org.id.slice(-1), 16) % colors.length;

        // Get basic counts
        const departmentCount = org.departments.length;
        const userCount = org.users.length;

        // For now, set placeholder values for products and notifications
        // These would require additional queries to product/stock tables
        const stats = {
          departments: departmentCount,
          products: 0, // TODO: Count products when product schema is implemented
          lowStock: 0, // TODO: Count low stock items
          activeUsers: userCount,
          pendingTransfers: 0 // TODO: Count pending transfers
        };

        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          description: org.description || `องค์กร ${org.name}`,
          logo: generateLogo(org.name).toUpperCase(),
          color: colors[colorIndex],
          userRole: orgUser.roles,
          isOwner: orgUser.isOwner,
          joinedAt: orgUser.joinedAt,
          lastActivity: org.updatedAt,
          stats,
          notifications: 0, // TODO: Count notifications
          isActive: org.status === 'ACTIVE',
          
          // ✅ NEW: Include invite code info (for admins/owners)
          inviteInfo: (orgUser.roles === 'ADMIN' || orgUser.roles === 'OWNER') ? {
            inviteCode: org.inviteCode,
            inviteEnabled: org.inviteEnabled
          } : null
        };
      })
    );

    return NextResponse.json({
      success: true,
      organizations,
      count: organizations.length,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Get dashboard organizations error:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}