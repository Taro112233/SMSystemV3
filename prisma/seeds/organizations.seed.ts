// prisma/seeds/organizations.seed.ts - Organizations & Departments Seed
// InvenStock Multi-Tenant System - Organization Structure

import { PrismaClient } from "@prisma/client";
import { generateInviteCode } from "../../lib/invite-code";

interface OrganizationSeedResult {
  totalOrganizations: number;
  totalDepartments: number;
  totalMemberships: number;
  organizations: any[];
}

export async function seedOrganizations(prisma: PrismaClient): Promise<OrganizationSeedResult> {
  console.log("🏢 Seeding organizations...");

  // Get admin user for ownership assignments
  const adminUser = await prisma.user.findUnique({
    where: { username: "admin" }
  });

  if (!adminUser) {
    throw new Error("Admin user not found. Run user seed first.");
  }

  // Get demo users
  const hospitalUsers = await Promise.all([
    prisma.user.findUnique({ where: { username: "dr.somchai" } }),
    prisma.user.findUnique({ where: { username: "nurse.malee" } }),
    prisma.user.findUnique({ where: { username: "pharmacist.suree" } }),
  ]);

  const pharmacyUsers = await Promise.all([
    prisma.user.findUnique({ where: { username: "owner.somying" } }),
    prisma.user.findUnique({ where: { username: "assistant.niran" } }),
  ]);

  // ===== CREATE ORGANIZATIONS =====

  // 1. Siriraj Hospital
  const sirirajHospital = await prisma.organization.upsert({
    where: { slug: "siriraj-hospital" },
    update: {},
    create: {
      name: "โรงพยาบาลศิริราช",
      slug: "siriraj-hospital",
      description: "โรงพยาบาลมหาวิทยาลัยมหิดล คณะแพทยศาสตร์ศิริราชพยาบาล",
      email: "info@si.mahidol.ac.th",
      phone: "024197000",
      status: "ACTIVE",
      timezone: "Asia/Bangkok",
      inviteCode: generateInviteCode(),
      inviteEnabled: true,
    },
  });

  // 2. City Pharmacy
  const cityPharmacy = await prisma.organization.upsert({
    where: { slug: "city-pharmacy" },
    update: {},
    create: {
      name: "ร้านยาเมือง",
      slug: "city-pharmacy", 
      description: "ร้านยาชุมชนใจกลางเมือง บริการครบครันด้านยาและเวชภัณฑ์",
      email: "info@citypharmacy.com",
      phone: "025551234",
      status: "ACTIVE",
      timezone: "Asia/Bangkok",
      inviteCode: generateInviteCode(),
      inviteEnabled: true,
    },
  });

  // 3. Demo Clinic (for testing)
  const demoClinic = await prisma.organization.upsert({
    where: { slug: "demo-clinic" },
    update: {},
    create: {
      name: "คลินิกเดโม",
      slug: "demo-clinic",
      description: "คลินิกสำหรับทดสอบระบบ",
      email: "demo@clinic.com",
      phone: "021234567",
      status: "TRIAL", // Trial status
      timezone: "Asia/Bangkok",
      inviteCode: generateInviteCode(),
      inviteEnabled: true,
    },
  });

  console.log("✅ Created 3 organizations");

  // ===== CREATE ORGANIZATION MEMBERSHIPS =====

  const memberships = [];

  // Admin as owner of all organizations
  memberships.push(
    {
      organizationId: sirirajHospital.id,
      userId: adminUser.id,
      roles: "OWNER",
      isOwner: true,
      isActive: true,
    },
    {
      organizationId: cityPharmacy.id,
      userId: adminUser.id,
      roles: "OWNER", 
      isOwner: true,
      isActive: true,
    },
    {
      organizationId: demoClinic.id,
      userId: adminUser.id,
      roles: "OWNER",
      isOwner: true,
      isActive: true,
    }
  );

  // Hospital staff memberships
  if (hospitalUsers[0]) { // Dr. Somchai as Admin
    memberships.push({
      organizationId: sirirajHospital.id,
      userId: hospitalUsers[0].id,
      roles: "ADMIN",
      isOwner: false,
      isActive: true,
    });
  }

  if (hospitalUsers[1]) { // Nurse Malee as Member
    memberships.push({
      organizationId: sirirajHospital.id,
      userId: hospitalUsers[1].id,
      roles: "MEMBER",
      isOwner: false,
      isActive: true,
    });
  }

  if (hospitalUsers[2]) { // Pharmacist as Admin
    memberships.push({
      organizationId: sirirajHospital.id,
      userId: hospitalUsers[2].id,
      roles: "ADMIN",
      isOwner: false,
      isActive: true,
    });
  }

  // Pharmacy staff memberships
  if (pharmacyUsers[0]) { // Owner Somying as Owner
    memberships.push({
      organizationId: cityPharmacy.id,
      userId: pharmacyUsers[0].id,
      roles: "OWNER",
      isOwner: true,
      isActive: true,
    });
  }

  if (pharmacyUsers[1]) { // Assistant as Member
    memberships.push({
      organizationId: cityPharmacy.id,
      userId: pharmacyUsers[1].id,
      roles: "MEMBER", 
      isOwner: false,
      isActive: true,
    });
  }

  // Create all memberships
  await prisma.organizationUser.createMany({
    data: memberships,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${memberships.length} organization memberships`);

  // ===== CREATE DEPARTMENTS =====

  const departments = [];

  // Siriraj Hospital Departments
  const hospitalDepts = [
    {
      organizationId: sirirajHospital.id,
      name: "คลังยาหลัก",
      slug: "MAIN_PHARM",
      description: "คลังยาหลักของโรงพยาบาล จัดเก็บยาทุกประเภท",
      color: "BLUE",
      icon: "WAREHOUSE",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: sirirajHospital.id,
      name: "ห้องฉุกเฉิน",
      slug: "ER",
      description: "หน่วยงานฉุกเฉินและการแพทย์ฉุกเฉิน ดูแลผู้ป่วยฉุกเฉิน 24 ชั่วโมง",
      color: "RED",
      icon: "HOSPITAL",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: sirirajHospital.id,
      name: "หอผู้ป่วยใน",
      slug: "IPD",
      description: "หอผู้ป่วยในทั่วไป ดูแลผู้ป่วยที่ต้องพักรักษาในโรงพยาบาล",
      color: "GREEN",
      icon: "BUILDING",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: sirirajHospital.id,
      name: "ผู้ป่วยนอก",
      slug: "OPD",
      description: "หน่วยงานผู้ป่วยนอก บริการตรวจรักษาทั่วไป",
      color: "PURPLE",
      icon: "PERSON",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: sirirajHospital.id,
      name: "ห้องผ่าตัด",
      slug: "OR",
      description: "ห้องผ่าตัดและอุปกรณ์การแพทย์ สำหรับการผ่าตัดทุกประเภท",
      color: "ORANGE",
      icon: "HEART",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: sirirajHospital.id,
      name: "หน่วยแรงดัน",
      slug: "ICU",
      description: "หน่วยแรงดันผู้ป่วยวิกฤต",
      color: "INDIGO",
      icon: "STETHOSCOPE",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: sirirajHospital.id,
      name: "ห้องปฏิบัติการ",
      slug: "LAB",
      description: "ห้องปฏิบัติการตรวจวิเคราะห์ทางการแพทย์",
      color: "TEAL",
      icon: "LABORATORY",
      isActive: true,
      createdBy: adminUser.id,
    },
  ];

  // City Pharmacy Departments
  const pharmacyDepts = [
    {
      organizationId: cityPharmacy.id,
      name: "ห้องจ่ายยา",
      slug: "DISPENSE",
      description: "ห้องจ่ายยาให้ผู้ป่วยและลูกค้าทั่วไป",
      color: "TEAL",
      icon: "PHARMACY",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: cityPharmacy.id,
      name: "คลังสินค้า",
      slug: "STORAGE",
      description: "คลังเก็บยาและอุปกรณ์การแพทย์",
      color: "GRAY",
      icon: "BOX",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: cityPharmacy.id,
      name: "ห้องปรึกษา",
      slug: "CONSULT",
      description: "ห้องให้คำปรึกษาทางเภสัชกรรม",
      color: "BLUE",
      icon: "PERSON",
      isActive: true,
      createdBy: adminUser.id,
    },
  ];

  // Demo Clinic Departments
  const clinicDepts = [
    {
      organizationId: demoClinic.id,
      name: "ห้องตรวจ",
      slug: "EXAM",
      description: "ห้องตรวจผู้ป่วยทั่วไป",
      color: "GREEN",
      icon: "STETHOSCOPE",
      isActive: true,
      createdBy: adminUser.id,
    },
    {
      organizationId: demoClinic.id,
      name: "ห้องยา",
      slug: "PHARMACY",
      description: "ห้องเก็บและจ่ายยา",
      color: "PINK",
      icon: "PILL",
      isActive: true,
      createdBy: adminUser.id,
    },
  ];

  departments.push(...hospitalDepts, ...pharmacyDepts, ...clinicDepts);

  // Create all departments
  await prisma.department.createMany({
    data: departments,
    skipDuplicates: true,
  });

  console.log(`✅ Created ${departments.length} departments`);
  console.log(`   - Hospital: ${hospitalDepts.length} departments`);
  console.log(`   - Pharmacy: ${pharmacyDepts.length} departments`);
  console.log(`   - Clinic: ${clinicDepts.length} departments`);

  // ===== CREATE AUDIT LOGS =====
  await createOrganizationAuditLogs(prisma, {
    organizations: [sirirajHospital, cityPharmacy, demoClinic],
    adminUserId: adminUser.id,
    totalDepartments: departments.length,
    totalMemberships: memberships.length,
  });

  return {
    totalOrganizations: 3,
    totalDepartments: departments.length,
    totalMemberships: memberships.length,
    organizations: [sirirajHospital, cityPharmacy, demoClinic],
  };
}

async function createOrganizationAuditLogs(
  prisma: PrismaClient,
  data: {
    organizations: any[];
    adminUserId: string;
    totalDepartments: number;
    totalMemberships: number;
  }
) {
  try {
    const auditLogs = [];

    for (const org of data.organizations) {
      auditLogs.push({
        organizationId: org.id,
        userId: data.adminUserId,
        action: "organizations.seed_created",
        payload: {
          organizationName: org.name,
          slug: org.slug,
          status: org.status,
          inviteCode: org.inviteCode,
          departmentCount: data.totalDepartments,
          membershipCount: data.totalMemberships,
          timestamp: new Date().toISOString(),
        },
      });
    }

    await prisma.auditLog.createMany({
      data: auditLogs,
      skipDuplicates: true,
    });

    console.log("✅ Created organization audit logs");
  } catch (error) {
    console.warn("⚠️  Could not create organization audit logs:", error.message);
  }
}

// Helper functions for testing and additional setup

export async function getOrganizationBySlug(prisma: PrismaClient, slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
      departments: true,
      users: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function addUserToOrganization(
  prisma: PrismaClient,
  data: {
    organizationId: string;
    userId: string;
    role: "MEMBER" | "ADMIN" | "OWNER";
    isOwner?: boolean;
  }
) {
  return prisma.organizationUser.create({
    data: {
      organizationId: data.organizationId,
      userId: data.userId,
      roles: data.role,
      isOwner: data.isOwner || false,
      isActive: true,
    },
  });
}

export async function createDepartment(
  prisma: PrismaClient,
  data: {
    organizationId: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    icon?: string;
    createdBy: string;
  }
) {
  return prisma.department.create({
    data: {
      organizationId: data.organizationId,
      name: data.name,
      slug: data.slug.toUpperCase(),
      description: data.description,
      color: (data.color as any) || "BLUE",
      icon: (data.icon as any) || "FOLDER",
      isActive: true,
      createdBy: data.createdBy,
    },
  });
}