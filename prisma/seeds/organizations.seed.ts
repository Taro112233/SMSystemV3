// prisma/seeds/organizations.seed.ts
// Phase 1: Organizations - Create organizations and assign members

import { PrismaClient, ColorTheme, IconType, OrganizationStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export async function seedOrganizations(users: any[]) {
  console.log('🌱 Seeding Organizations...');

  const organizations = [
    {
      name: 'โรงพยาบาลศิริราช',
      slug: 'siriraj',
      description: 'โรงพยาบาลมหาวิทยาลัยแห่งแรกของประเทศไทย',
      email: 'contact@siriraj.com',
      phone: '02-419-7000',
      color: ColorTheme.BLUE,
      icon: IconType.HOSPITAL,
      status: OrganizationStatus.ACTIVE,
      timezone: 'Asia/Bangkok',
      inviteCode: generateInviteCode(),
      inviteEnabled: true,
    },
    {
      name: 'โรงพยาบาลรามาธิบดี',
      slug: 'ramathibodi',
      description: 'โรงพยาบาลศูนย์การแพทย์ระดับตติยภูมิ',
      email: 'contact@ramathibodi.com',
      phone: '02-201-1000',
      color: ColorTheme.GREEN,
      icon: IconType.HOSPITAL,
      status: OrganizationStatus.ACTIVE,
      timezone: 'Asia/Bangkok',
      inviteCode: generateInviteCode(),
      inviteEnabled: true,
    },
  ];

  const createdOrgs = [];
  
  // Organization 1: Siriraj
  const siriraj = await prisma.organization.upsert({
    where: { slug: organizations[0].slug },
    update: {},
    create: organizations[0],
  });
  createdOrgs.push(siriraj);
  console.log(`  ✅ Org: ${siriraj.name} (${siriraj.slug}) - Code: ${siriraj.inviteCode}`);

  // Assign members to Siriraj
  await prisma.organizationUser.upsert({
    where: {
      organizationId_userId: {
        organizationId: siriraj.id,
        userId: users[0].id,
      },
    },
    update: {},
    create: {
      organizationId: siriraj.id,
      userId: users[0].id,
      roles: 'OWNER',
      isOwner: true,
      isActive: true,
    },
  });
  console.log(`    👤 ${users[0].username} → OWNER`);

  await prisma.organizationUser.upsert({
    where: {
      organizationId_userId: {
        organizationId: siriraj.id,
        userId: users[1].id,
      },
    },
    update: {},
    create: {
      organizationId: siriraj.id,
      userId: users[1].id,
      roles: 'ADMIN',
      isOwner: false,
      isActive: true,
    },
  });
  console.log(`    👤 ${users[1].username} → ADMIN`);

  await prisma.organizationUser.upsert({
    where: {
      organizationId_userId: {
        organizationId: siriraj.id,
        userId: users[2].id,
      },
    },
    update: {},
    create: {
      organizationId: siriraj.id,
      userId: users[2].id,
      roles: 'MEMBER',
      isOwner: false,
      isActive: true,
    },
  });
  console.log(`    👤 ${users[2].username} → MEMBER`);

  // Organization 2: Ramathibodi
  const ramathibodi = await prisma.organization.upsert({
    where: { slug: organizations[1].slug },
    update: {},
    create: organizations[1],
  });
  createdOrgs.push(ramathibodi);
  console.log(`  ✅ Org: ${ramathibodi.name} (${ramathibodi.slug}) - Code: ${ramathibodi.inviteCode}`);

  // Assign members to Ramathibodi
  await prisma.organizationUser.upsert({
    where: {
      organizationId_userId: {
        organizationId: ramathibodi.id,
        userId: users[3].id,
      },
    },
    update: {},
    create: {
      organizationId: ramathibodi.id,
      userId: users[3].id,
      roles: 'ADMIN',
      isOwner: true,
      isActive: true,
    },
  });
  console.log(`    👤 ${users[3].username} → ADMIN (Owner)`);

  await prisma.organizationUser.upsert({
    where: {
      organizationId_userId: {
        organizationId: ramathibodi.id,
        userId: users[4].id,
      },
    },
    update: {},
    create: {
      organizationId: ramathibodi.id,
      userId: users[4].id,
      roles: 'MEMBER',
      isOwner: false,
      isActive: true,
    },
  });
  console.log(`    👤 ${users[4].username} → MEMBER`);

  console.log(`✅ Created ${createdOrgs.length} organizations\n`);
  return createdOrgs;
}