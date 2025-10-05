// // prisma/seeds/demo-data.seed.ts - Demo Data for Testing
// // InvenStock Multi-Tenant System - Additional Demo Data

// import { PrismaClient } from "@prisma/client";

// interface DemoDataResult {
//   message: string;
//   additionalUsers: number;
//   additionalAuditLogs: number;
// }

// export async function seedDemoData(prisma: PrismaClient): Promise<DemoDataResult> {
//   console.log("🎭 Creating additional demo data...");

//   // Get existing organizations
//   const organizations = await prisma.organization.findMany({
//     include: { departments: true }
//   });

//   if (organizations.length === 0) {
//     throw new Error("No organizations found. Run organization seed first.");
//   }

//   // ===== CREATE ADDITIONAL TEST USERS =====
  
//   const additionalUsers = await createTestUsers(prisma);
//   console.log(`✅ Created ${additionalUsers.length} additional test users`);

//   // ===== CREATE SAMPLE AUDIT ACTIVITIES =====
  
//   const auditLogs = await createSampleAuditLogs(prisma, organizations);
//   console.log(`✅ Created ${auditLogs.length} sample audit logs`);

//   // ===== ADD USERS TO ORGANIZATIONS FOR TESTING =====
  
//   await assignUsersToOrganizations(prisma, organizations, additionalUsers);
//   console.log("✅ Assigned users to organizations for testing");

//   return {
//     message: "Demo data created successfully",
//     additionalUsers: additionalUsers.length,
//     additionalAuditLogs: auditLogs.length,
//   };
// }

// async function createTestUsers(prisma: PrismaClient) {
//   const { hashPassword } = await import("../../lib/auth");
//   const testPassword = await hashPassword("test123");

//   const testUsers = [
//     {
//       username: "test.member",
//       password: testPassword,
//       firstName: "สมาชิก",
//       lastName: "ทดสอบ",
//       email: "test.member@demo.com",
//       phone: "0801111111",
//       status: "ACTIVE",
//       isActive: true,
//       emailVerified: true,
//     },
//     {
//       username: "test.admin",
//       password: testPassword,
//       firstName: "ผู้ดูแล",
//       lastName: "ทดสอบ",
//       email: "test.admin@demo.com",
//       phone: "0802222222",
//       status: "ACTIVE",
//       isActive: true,
//       emailVerified: true,
//     },
//     {
//       username: "guest.user",
//       password: testPassword,
//       firstName: "แขก",
//       lastName: "ผู้เยี่ยม",
//       email: "guest@demo.com",
//       phone: "0803333333",
//       status: "PENDING",
//       isActive: true,
//       emailVerified: false,
//     },
//     {
//       username: "supplier.contact",
//       password: testPassword,
//       firstName: "ติดต่อ",
//       lastName: "ผู้จำหน่าย",
//       email: "supplier@demo.com",
//       phone: "0804444444",
//       status: "ACTIVE",
//       isActive: true,
//       emailVerified: true,
//     },
//     {
//       username: "audit.reviewer",
//       password: testPassword,
//       firstName: "ผู้ตรวจ",
//       lastName: "สอบ",
//       email: "audit@demo.com",
//       phone: "0805555555",
//       status: "ACTIVE",
//       isActive: true,
//       emailVerified: true,
//     },
//   ];

//   const createdUsers = [];

//   for (const userData of testUsers) {
//     try {
//       const user = await prisma.user.upsert({
//         where: { username: userData.username },
//         update: {},
//         create: userData,
//       });
//       createdUsers.push(user);
//     } catch (error) {
//       console.warn(`⚠️  Could not create user ${userData.username}:`, error);
//     }
//   }

//   return createdUsers;
// }

// async function createSampleAuditLogs(prisma: PrismaClient, organizations: any[]) {
//   const adminUser = await prisma.user.findUnique({
//     where: { username: "admin" }
//   });

//   if (!adminUser) {
//     return [];
//   }

//   const auditLogs = [];
//   const now = new Date();

//   // Sample audit activities for each organization
//   for (const org of organizations) {
//     // Recent login activities
//     auditLogs.push(
//       {
//         organizationId: org.id,
//         userId: adminUser.id,
//         action: "users.login",
//         payload: {
//           username: "admin",
//           loginTime: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
//           ipAddress: "192.168.1.100",
//           userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
//         },
//       },
//       {
//         organizationId: org.id,
//         userId: adminUser.id,
//         action: "organizations.settings_viewed",
//         payload: {
//           organizationName: org.name,
//           settingsSection: "general",
//           timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
//         },
//       },
//       {
//         organizationId: org.id,
//         userId: adminUser.id,
//         action: "departments.viewed",
//         payload: {
//           organizationName: org.name,
//           departmentCount: org.departments.length,
//           timestamp: new Date(now.getTime() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
//         },
//       }
//     );

//     // Department specific activities
//     if (org.departments.length > 0) {
//       const firstDept = org.departments[0];
//       auditLogs.push({
//         organizationId: org.id,
//         userId: adminUser.id,
//         action: "departments.activity_viewed",
//         resourceId: firstDept.id,
//         payload: {
//           departmentName: firstDept.name,
//           departmentCode: firstDept.code,
//           organizationName: org.name,
//           timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
//         },
//       });
//     }

//     // System maintenance logs
//     auditLogs.push({
//       organizationId: org.id,
//       userId: adminUser.id,
//       action: "system.health_check",
//       payload: {
//         status: "healthy",
//         organizationName: org.name,
//         checksPerformed: ["database", "permissions", "departments"],
//         timestamp: new Date(now.getTime() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
//       },
//     });
//   }

//   // Create all audit logs
//   await prisma.auditLog.createMany({
//     data: auditLogs,
//     skipDuplicates: true,
//   });

//   return auditLogs;
// }

// async function assignUsersToOrganizations(
//   prisma: PrismaClient,
//   organizations: any[],
//   testUsers: any[]
// ) {
//   const memberships = [];

//   // Get hospital and pharmacy orgs
//   const hospital = organizations.find(org => org.slug === "siriraj-hospital");
//   const pharmacy = organizations.find(org => org.slug === "city-pharmacy");
//   const clinic = organizations.find(org => org.slug === "demo-clinic");

//   if (!hospital || !pharmacy || !clinic) {
//     console.warn("⚠️  Some organizations not found for user assignment");
//     return;
//   }

//   // Assign test users to different organizations with different roles
//   const testMember = testUsers.find(u => u.username === "test.member");
//   const testAdmin = testUsers.find(u => u.username === "test.admin");
//   const guestUser = testUsers.find(u => u.username === "guest.user");
//   const supplierUser = testUsers.find(u => u.username === "supplier.contact");
//   const auditUser = testUsers.find(u => u.username === "audit.reviewer");

//   if (testMember) {
//     // Test member in hospital as MEMBER
//     memberships.push({
//       organizationId: hospital.id,
//       userId: testMember.id,
//       roles: "MEMBER",
//       isOwner: false,
//       isActive: true,
//     });

//     // Also member of pharmacy
//     memberships.push({
//       organizationId: pharmacy.id,
//       userId: testMember.id,
//       roles: "MEMBER",
//       isOwner: false,
//       isActive: true,
//     });
//   }

//   if (testAdmin) {
//     // Test admin in clinic as ADMIN
//     memberships.push({
//       organizationId: clinic.id,
//       userId: testAdmin.id,
//       roles: "ADMIN",
//       isOwner: false,
//       isActive: true,
//     });
//   }

//   if (guestUser) {
//     // Guest user in clinic as MEMBER but inactive (pending approval)
//     memberships.push({
//       organizationId: clinic.id,
//       userId: guestUser.id,
//       roles: "MEMBER",
//       isOwner: false,
//       isActive: false, // Pending
//     });
//   }

//   if (supplierUser) {
//     // Supplier contact in hospital as MEMBER
//     memberships.push({
//       organizationId: hospital.id,
//       userId: supplierUser.id,
//       roles: "MEMBER",
//       isOwner: false,
//       isActive: true,
//     });
//   }

//   if (auditUser) {
//     // Audit reviewer in all organizations as MEMBER
//     memberships.push(
//       {
//         organizationId: hospital.id,
//         userId: auditUser.id,
//         roles: "MEMBER",
//         isOwner: false,
//         isActive: true,
//       },
//       {
//         organizationId: pharmacy.id,
//         userId: auditUser.id,
//         roles: "MEMBER",
//         isOwner: false,
//         isActive: true,
//       },
//       {
//         organizationId: clinic.id,
//         userId: auditUser.id,
//         roles: "ADMIN", // Admin in clinic for audit purposes
//         isOwner: false,
//         isActive: true,
//       }
//     );
//   }

//   // Create memberships
//   if (memberships.length > 0) {
//     await prisma.organizationUser.createMany({
//       data: memberships,
//       skipDuplicates: true,
//     });
//   }

//   console.log(`✅ Created ${memberships.length} test user memberships`);
// }

// // Export helper functions for additional demo data creation

// export async function createDemoInviteCodeUsage(prisma: PrismaClient) {
//   // Simulate invite code usage
//   const organizations = await prisma.organization.findMany();
//   const auditLogs = [];

//   for (const org of organizations) {
//     if (org.inviteCode) {
//       auditLogs.push({
//         organizationId: org.id,
//         userId: null, // System generated
//         action: "organizations.invite_code_used",
//         payload: {
//           inviteCode: org.inviteCode,
//           organizationName: org.name,
//           usageCount: Math.floor(Math.random() * 5), // Random usage count
//           timestamp: new Date().toISOString(),
//         },
//       });
//     }
//   }

//   if (auditLogs.length > 0) {
//     await prisma.auditLog.createMany({
//       data: auditLogs,
//       skipDuplicates: true,
//     });
//   }

//   return auditLogs.length;
// }

// export async function generateRandomActivities(prisma: PrismaClient, count: number = 20) {
//   const users = await prisma.user.findMany({ take: 5 });
//   const organizations = await prisma.organization.findMany();
  
//   if (users.length === 0 || organizations.length === 0) {
//     return 0;
//   }

//   const activities = [
//     "users.profile_updated",
//     "departments.created",
//     "organizations.settings_changed",
//     "users.password_changed",
//     "departments.member_added",
//     "system.backup_completed",
//     "organizations.invite_sent",
//   ];

//   const auditLogs = [];

//   for (let i = 0; i < count; i++) {
//     const randomUser = users[Math.floor(Math.random() * users.length)];
//     const randomOrg = organizations[Math.floor(Math.random() * organizations.length)];
//     const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
//     auditLogs.push({
//       organizationId: randomOrg.id,
//       userId: randomUser.id,
//       action: randomActivity,
//       payload: {
//         timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString(), // Random time in last 24h
//         note: `Demo activity: ${randomActivity}`,
//       },
//     });
//   }

//   await prisma.auditLog.createMany({
//     data: auditLogs,
//     skipDuplicates: true,
//   });

//   return auditLogs.length;
// }