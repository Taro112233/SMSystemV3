// prisma/seeds/product-units.seed.ts
// Phase 2: Product Units - Create unit conversion system

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function createUserSnapshot(user: any, role: string = 'OWNER') {
  return {
    userId: user.id,
    username: user.username,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role,
  };
}

export async function seedProductUnits(organizations: any[], users: any[]) {
  console.log('🌱 Seeding Product Units...');

  const units = [
    { name: 'เม็ด', ratio: 1 },
    { name: 'แผง', ratio: 10 },
    { name: 'กล่อง', ratio: 100 },
    { name: 'โหล', ratio: 120 },
    { name: 'ขวด', ratio: 1 },
    { name: 'ลัง', ratio: 24 },
    { name: 'หลอด', ratio: 1 },
    { name: 'แพ็ค', ratio: 6 },
  ];

  const createdUnits = [];

  for (const org of organizations) {
    const ownerUser = users[0]; // Use first user for snapshot
    
    for (const unit of units) {
      const created = await prisma.productUnit.upsert({
        where: {
          organizationId_name: {
            organizationId: org.id,
            name: unit.name,
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          name: unit.name,
          conversionRatio: unit.ratio,
          isActive: true,
          createdBy: ownerUser.id,
          createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
        },
      });
      createdUnits.push(created);
      console.log(`  ✅ ${org.name} → ${created.name} (1:${created.conversionRatio})`);
    }
  }

  console.log(`✅ Created ${createdUnits.length} product units\n`);
  return createdUnits;
}