// prisma/seeds/audit-logs.seed.ts
// Phase 5: Sample Audit Logs

import { PrismaClient, AuditCategory, AuditSeverity, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

function createUserSnapshot(user: any, role: string = 'OWNER'): Prisma.InputJsonValue {
  return {
    userId: user.id,
    username: user.username,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role,
  };
}

export async function seedAuditLogs(
  organizations: any[],
  departments: any[],
  users: any[]
) {
  console.log('🌱 Seeding Audit Logs...');

  const ownerUser = users[0];
  const adminUser = users[1];

  for (const org of organizations) {
    const orgDepts = departments.filter((d) => d.organizationId === org.id);
    const products = await prisma.product.findMany({
      where: { organizationId: org.id },
      take: 3,
    });

    const logs = [
      {
        organizationId: org.id,
        userId: ownerUser.id,
        userSnapshot: createUserSnapshot(ownerUser, 'OWNER'),
        departmentId: orgDepts[0]?.id,
        action: 'products.create',
        category: AuditCategory.PRODUCT,
        severity: AuditSeverity.INFO,
        description: `${ownerUser.firstName} สร้างสินค้า ${products[0]?.name}`,
        resourceId: products[0]?.id,
        resourceType: 'Product',
        payload: {
          productCode: products[0]?.code,
          productName: products[0]?.name,
        } as Prisma.InputJsonValue,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
      {
        organizationId: org.id,
        userId: adminUser.id,
        userSnapshot: createUserSnapshot(adminUser, 'ADMIN'),
        departmentId: orgDepts[0]?.id,
        action: 'stocks.batch_add',
        category: AuditCategory.STOCK,
        severity: AuditSeverity.INFO,
        description: `${adminUser.firstName} เพิ่ม Batch สินค้า ${products[0]?.name}`,
        resourceId: products[0]?.id,
        resourceType: 'StockBatch',
        payload: {
          lotNumber: 'LOT-2024-001',
          quantity: 500,
        } as Prisma.InputJsonValue,
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0',
      },
      {
        organizationId: org.id,
        userId: ownerUser.id,
        userSnapshot: createUserSnapshot(ownerUser, 'OWNER'),
        departmentId: orgDepts[1]?.id,
        action: 'departments.create',
        category: AuditCategory.DEPARTMENT,
        severity: AuditSeverity.INFO,
        description: `${ownerUser.firstName} สร้างหน่วยงาน ${orgDepts[1]?.name}`,
        resourceId: orgDepts[1]?.id,
        resourceType: 'Department',
        payload: {
          departmentName: orgDepts[1]?.name,
          departmentSlug: orgDepts[1]?.slug,
        } as Prisma.InputJsonValue,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
      },
    ];

    for (const log of logs) {
      if (log.resourceId) {
        await prisma.auditLog.create({
          data: log,
        });
        console.log(`  ✅ ${org.name}: ${log.action}`);
      }
    }
  }

  console.log(`✅ Audit logs seeded\n`);
}