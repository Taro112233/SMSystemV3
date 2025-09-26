// prisma/seeds/users.seed.ts - Users Management Seed
// InvenStock Multi-Tenant System - User Creation

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../lib/auth";

interface UserSeedResult {
  totalUsers: number;
  adminUser: any;
  demoUsers: any[];
}

export async function seedUsers(prisma: PrismaClient): Promise<UserSeedResult> {
  console.log("👥 Seeding users...");

  const hashedPassword = await hashPassword("admin123");
  const demoPassword = await hashPassword("demo123");

  // Create system admin user
  const adminUser = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: hashedPassword, // Update password if user exists
    },
    create: {
      username: "admin",
      password: hashedPassword,
      firstName: "ผู้ดูแล",
      lastName: "ระบบ",
      email: "admin@inventock.com",
      phone: "0800000000",
      status: "ACTIVE",
      isActive: true,
      emailVerified: true,
    },
  });

  // Create demo users for testing
  const demoUsers = await Promise.all([
    // Hospital Staff
    prisma.user.upsert({
      where: { username: "dr.somchai" },
      update: {},
      create: {
        username: "dr.somchai",
        password: demoPassword,
        firstName: "สมชาย",
        lastName: "ใจดี",
        email: "dr.somchai@siriraj.ac.th",
        phone: "0812345678",
        status: "ACTIVE",
        isActive: true,
        emailVerified: true,
      },
    }),

    prisma.user.upsert({
      where: { username: "nurse.malee" },
      update: {},
      create: {
        username: "nurse.malee",
        password: demoPassword,
        firstName: "มาลี",
        lastName: "รักษา",
        email: "nurse.malee@siriraj.ac.th",
        phone: "0823456789",
        status: "ACTIVE",
        isActive: true,
        emailVerified: true,
      },
    }),

    prisma.user.upsert({
      where: { username: "pharmacist.suree" },
      update: {},
      create: {
        username: "pharmacist.suree",
        password: demoPassword,
        firstName: "สุรีย์",
        lastName: "จ่ายยา",
        email: "pharmacist.suree@siriraj.ac.th",
        phone: "0834567890",
        status: "ACTIVE",
        isActive: true,
        emailVerified: true,
      },
    }),

    // Pharmacy Staff
    prisma.user.upsert({
      where: { username: "owner.somying" },
      update: {},
      create: {
        username: "owner.somying",
        password: demoPassword,
        firstName: "สมหญิง",
        lastName: "ขายยา",
        email: "owner@citypharmacy.com",
        phone: "0845678901",
        status: "ACTIVE",
        isActive: true,
        emailVerified: true,
      },
    }),

    prisma.user.upsert({
      where: { username: "assistant.niran" },
      update: {},
      create: {
        username: "assistant.niran",
        password: demoPassword,
        firstName: "นิรัน",
        lastName: "ช่วยงาน",
        email: "assistant@citypharmacy.com",
        phone: "0856789012",
        status: "ACTIVE",
        isActive: true,
        emailVerified: false, // Some users may not verify email
      },
    }),

    // Test users with different statuses
    prisma.user.upsert({
      where: { username: "intern.kanya" },
      update: {},
      create: {
        username: "intern.kanya",
        password: demoPassword,
        firstName: "กัญญา",
        lastName: "ฝึกงาน",
        email: "intern.kanya@demo.com",
        phone: "0867890123",
        status: "PENDING", // Pending approval
        isActive: true,
        emailVerified: false,
      },
    }),

    prisma.user.upsert({
      where: { username: "temp.worker" },
      update: {},
      create: {
        username: "temp.worker",
        password: demoPassword,
        firstName: "ชั่วคราว",
        lastName: "พนักงาน",
        email: "temp@demo.com",
        status: "INACTIVE", // Inactive user
        isActive: false,
        emailVerified: false,
      },
    }),
  ]);

  // Create audit log for user creation
  await createUserAuditLogs(prisma, adminUser.id, {
    totalCreated: demoUsers.length + 1,
    adminCreated: true,
  });

  console.log(`✅ Created ${demoUsers.length + 1} users`);
  console.log(`🔑 Admin: admin / admin123`);
  console.log(`🎭 Demo users: */demo123`);

  return {
    totalUsers: demoUsers.length + 1,
    adminUser,
    demoUsers,
  };
}

async function createUserAuditLogs(
  prisma: PrismaClient,
  adminUserId: string,
  stats: { totalCreated: number; adminCreated: boolean }
) {
  try {
    // This will be used once organizations are created
    // For now, just prepare the audit data
    console.log(`📋 User creation stats: ${stats.totalCreated} users`);
  } catch (error) {
    console.warn("⚠️  Could not create user audit logs:", error.message);
  }
}

// Export user creation utilities
export async function createUser(
  prisma: PrismaClient,
  userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    status?: string;
  }
) {
  const hashedPassword = await hashPassword(userData.password);
  
  return prisma.user.create({
    data: {
      username: userData.username,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      status: (userData.status as any) || "ACTIVE",
      isActive: true,
      emailVerified: !!userData.email,
    },
  });
}

// Helper to get default admin user
export async function getAdminUser(prisma: PrismaClient) {
  return prisma.user.findUnique({
    where: { username: "admin" },
  });
}