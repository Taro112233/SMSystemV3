// prisma/seeds/users.seed.ts
// Phase 1: Users - Create demo users with different roles

import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('🌱 Seeding Users...');

  const users = [
    {
      username: 'owner01',
      password: await bcrypt.hash('password123', 12),
      email: 'owner@siriraj.com',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      phone: '081-234-5678',
      status: 'ACTIVE' as UserStatus,
      isActive: true,
      emailVerified: true,
    },
    {
      username: 'admin01',
      password: await bcrypt.hash('password123', 12),
      email: 'admin@siriraj.com',
      firstName: 'สมหญิง',
      lastName: 'รักดี',
      phone: '081-234-5679',
      status: 'ACTIVE' as UserStatus,
      isActive: true,
      emailVerified: true,
    },
    {
      username: 'member01',
      password: await bcrypt.hash('password123', 12),
      email: 'member@siriraj.com',
      firstName: 'สมศักดิ์',
      lastName: 'มีสุข',
      phone: '081-234-5680',
      status: 'ACTIVE' as UserStatus,
      isActive: true,
      emailVerified: true,
    },
    {
      username: 'admin02',
      password: await bcrypt.hash('password123', 12),
      email: 'admin@ramathibodi.com',
      firstName: 'สมพร',
      lastName: 'ดีมาก',
      phone: '081-234-5681',
      status: 'ACTIVE' as UserStatus,
      isActive: true,
      emailVerified: true,
    },
    {
      username: 'member02',
      password: await bcrypt.hash('password123', 12),
      email: 'member@ramathibodi.com',
      firstName: 'สมหมาย',
      lastName: 'เจริญ',
      phone: '081-234-5682',
      status: 'ACTIVE' as UserStatus,
      isActive: true,
      emailVerified: true,
    },
  ];

  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { username: userData.username },
      update: {},
      create: userData,
    });
    createdUsers.push(user);
    console.log(`  ✅ User: ${user.username} (${user.firstName} ${user.lastName})`);
  }

  console.log(`✅ Created ${createdUsers.length} users\n`);
  return createdUsers;
}