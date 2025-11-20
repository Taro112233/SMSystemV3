// prisma/seeds/departments.seed.ts
// Phase 2: Departments - Create department structure with hierarchy

import { PrismaClient, ColorTheme, IconType, Prisma } from '@prisma/client';

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

export async function seedDepartments(organizations: any[], users: any[]) {
  console.log('🌱 Seeding Departments...');

  const siriraj = organizations[0];
  const ramathibodi = organizations[1];
  const ownerUser = users[0];

  // Siriraj Departments
  const sirirajDepts = [
    {
      organizationId: siriraj.id,
      name: 'OPD',
      slug: 'opd',
      description: 'แผนกผู้ป่วยนอก',
      color: ColorTheme.GREEN,
      icon: IconType.BUILDING,
      isActive: true,
      createdBy: ownerUser.id,
      createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
    },
    {
      organizationId: siriraj.id,
      name: 'คลังยากลาง',
      slug: 'central-pharmacy',
      description: 'คลังยาหลักของโรงพยาบาล',
      color: ColorTheme.PURPLE,
      icon: IconType.PHARMACY,
      isActive: true,
      createdBy: ownerUser.id,
      createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
    },
    {
      organizationId: siriraj.id,
      name: 'ห้องฉุกเฉิน',
      slug: 'emergency',
      description: 'ห้องฉุกเฉิน 24 ชั่วโมง',
      color: ColorTheme.RED,
      icon: IconType.HOSPITAL,
      isActive: true,
      createdBy: ownerUser.id,
      createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
    },
    {
      organizationId: siriraj.id,
      name: 'IPD',
      slug: 'ipd',
      description: 'แผนกผู้ป่วยใน',
      color: ColorTheme.BLUE,
      icon: IconType.BUILDING,
      isActive: true,
      createdBy: ownerUser.id,
      createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
    },
  ];

  const createdDepts = [];

  for (const dept of sirirajDepts) {
    const created = await prisma.department.upsert({
      where: {
        organizationId_slug: {
          organizationId: dept.organizationId,
          slug: dept.slug,
        },
      },
      update: {},
      create: dept,
    });
    createdDepts.push(created);
    console.log(`  ✅ ${siriraj.name} → ${created.name} (${created.slug})`);
  }

  // Ramathibodi Departments
  const ramathibodiDepts = [
    {
      organizationId: ramathibodi.id,
      name: 'OPD',
      slug: 'opd',
      description: 'แผนกผู้ป่วยนอก',
      color: ColorTheme.GREEN,
      icon: IconType.BUILDING,
      isActive: true,
      createdBy: users[3].id,
      createdBySnapshot: createUserSnapshot(users[3], 'ADMIN'),
    },
    {
      organizationId: ramathibodi.id,
      name: 'คลังยา',
      slug: 'pharmacy',
      description: 'คลังยาหลัก',
      color: ColorTheme.PURPLE,
      icon: IconType.PHARMACY,
      isActive: true,
      createdBy: users[3].id,
      createdBySnapshot: createUserSnapshot(users[3], 'ADMIN'),
    },
    {
      organizationId: ramathibodi.id,
      name: 'ห้องผ่าตัด',
      slug: 'operating-room',
      description: 'ห้องผ่าตัดและคลังวัสดุ',
      color: ColorTheme.ORANGE,
      icon: IconType.HOSPITAL,
      isActive: true,
      createdBy: users[3].id,
      createdBySnapshot: createUserSnapshot(users[3], 'ADMIN'),
    },
  ];

  for (const dept of ramathibodiDepts) {
    const created = await prisma.department.upsert({
      where: {
        organizationId_slug: {
          organizationId: dept.organizationId,
          slug: dept.slug,
        },
      },
      update: {},
      create: dept,
    });
    createdDepts.push(created);
    console.log(`  ✅ ${ramathibodi.name} → ${created.name} (${created.slug})`);
  }

  console.log(`✅ Created ${createdDepts.length} departments\n`);
  return createdDepts;
}