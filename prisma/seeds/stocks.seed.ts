// prisma/seeds/stocks.seed.ts
// Phase 4: Stocks & Batches - Create inventory

import { PrismaClient, BatchStatus, Prisma } from '@prisma/client';

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

export async function seedStocks(
  organizations: any[],
  departments: any[],
  users: any[]
) {
  console.log('🌱 Seeding Stocks & Batches...');

  const ownerUser = users[0];

  for (const org of organizations) {
    const orgDepts = departments.filter((d) => d.organizationId === org.id);
    const products = await prisma.product.findMany({
      where: { organizationId: org.id },
      take: 5,
    });

    for (const dept of orgDepts) {
      for (const product of products) {
        const stock = await prisma.stock.upsert({
          where: {
            departmentId_productId: {
              departmentId: dept.id,
              productId: product.id,
            },
          },
          update: {},
          create: {
            organizationId: org.id,
            departmentId: dept.id,
            productId: product.id,
            location: `ชั้น ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}-${Math.floor(Math.random() * 10) + 1}`,
            minStockLevel: 50,
            maxStockLevel: 1000,
            reorderPoint: 100,
            defaultWithdrawalQty: 10,
            createdBy: ownerUser.id,
            createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
          },
        });

        console.log(`  ✅ Stock: ${org.name} / ${dept.name} / ${product.code}`);

        const batches = [
          {
            lotNumber: `LOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            manufactureDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            supplier: 'บริษัทยาไทย จำกัด',
            costPrice: 5.0,
            sellingPrice: 10.0,
            totalQuantity: 500,
            availableQuantity: 450,
            reservedQuantity: 0,
            incomingQuantity: 0,
            location: stock.location,
            status: BatchStatus.AVAILABLE,
          },
          {
            lotNumber: `LOT-${Date.now() + 1}-${Math.floor(Math.random() * 1000)}`,
            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            manufactureDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
            supplier: 'บริษัทเภสัช จำกัด',
            costPrice: 4.5,
            sellingPrice: 9.0,
            totalQuantity: 200,
            availableQuantity: 150,
            reservedQuantity: 0,
            incomingQuantity: 0,
            location: stock.location,
            status: BatchStatus.AVAILABLE,
          },
        ];

        for (const batch of batches) {
          await prisma.stockBatch.upsert({
            where: {
              stockId_lotNumber: {
                stockId: stock.id,
                lotNumber: batch.lotNumber,
              },
            },
            update: {},
            create: {
              stockId: stock.id,
              ...batch,
              isActive: true,
              createdBy: ownerUser.id,
              createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
            },
          });
          console.log(`    📦 Batch: ${batch.lotNumber} (${batch.availableQuantity} available)`);
        }
      }
    }
  }

  console.log(`✅ Stocks & Batches seeded\n`);
}