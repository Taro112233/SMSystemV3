// FILE: app/api/dashboard/route.ts
// Dashboard API - UPDATED to return Icon & Color
// ============================================

import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's organizations with full data
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
            status: true,
            color: true,         // ✅ CRITICAL: Include color
            icon: true,          // ✅ CRITICAL: Include icon
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                users: { where: { isActive: true } },
                departments: { where: { isActive: true } }
              }
            }
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // Transform data for frontend
    const organizations = organizationUsers.map(orgUser => {
      const org = orgUser.organization;
      
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description || `องค์กร ${org.name}`,
        
        // ✅ CRITICAL: Pass color and icon to frontend
        color: org.color || 'BLUE',
        icon: org.icon || 'BUILDING',
        
        // Keep old logo for backward compatibility (2-letter abbreviation)
        logo: org.name.substring(0, 2).toUpperCase(),
        
        userRole: orgUser.roles,
        isOwner: orgUser.isOwner,
        joinedAt: orgUser.joinedAt.toISOString(),
        lastActivity: orgUser.lastActiveAt?.toISOString() || org.updatedAt.toISOString(),
        
        stats: {
          departments: org._count.departments,
          products: 0, // TODO: Count products
          lowStock: 0, // TODO: Count low stock items
          activeUsers: org._count.users,
          pendingTransfers: 0, // TODO: Count pending transfers
        },
        
        notifications: 0, // TODO: Count notifications
        isActive: org.status === 'ACTIVE',
        status: org.status,
      };
    });

    return NextResponse.json({
      success: true,
      organizations,
      count: organizations.length,
      user: {
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email || '',
      }
    });

  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}