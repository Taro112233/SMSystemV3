// // prisma/seeds/users.seed.ts - Hospital Pharmacy V3.0 User Management (Single User)
// // ระบบจัดการผู้ใช้งานสำหรับโรงพยาบาล - เฉพาะผู้ใช้เดียว

// import { PrismaClient } from "@prisma/client";
// import { hashPassword } from "../../lib/auth";

// interface UserSeedData {
//   username: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   position?: string;
//   status: "UNAPPROVED" | "APPROVED" | "SUSPENDED" | "INACTIVE";
//   isActive: boolean;
// }

// export async function seedUsers(prisma: PrismaClient) {
//   console.log("👥 Creating Hospital Pharmacy V3.0 Single User...");
//   console.log("🏥 Single Hospital - Single Developer User");

//   const users: UserSeedData[] = [
//     // 👨‍💻 Developer User (เพียงคนเดียว)
//     {
//       username: "0234",
//       password: "123456",
//       firstName: "นักศึกษา",
//       lastName: "เภสัช",
//       position: "ผู้พัฒนา (Dev)",
//       status: "APPROVED",
//       isActive: true,
//     }
//   ];

//   console.log(`📊 Creating ${users.length} user...`);
  
//   const results = {
//     created: 0,
//     updated: 0,
//     byRole: {} as Record<string, number>,
//     byStatus: {} as Record<string, number>,
//   };

//   for (const userData of users) {
//     try {
//       // Hash password
//       const hashedPassword = await hashPassword(userData.password);
      
//       // Create or update user
//       const user = await prisma.user.upsert({
//         where: { username: userData.username },
//         update: {
//           firstName: userData.firstName,
//           lastName: userData.lastName,
//           position: userData.position,
//           status: userData.status,
//           isActive: userData.isActive,
//           lastLogin: userData.status === "APPROVED" ? new Date() : null,
//         },
//         create: {
//           username: userData.username,
//           password: hashedPassword,
//           firstName: userData.firstName,
//           lastName: userData.lastName,
//           position: userData.position || null,
//           status: userData.status,
//           isActive: userData.isActive,
//           lastLogin: userData.status === "APPROVED" ? new Date() : null,
//         },
//       });

//       // ตรวจสอบว่าเป็น user ใหม่หรือไม่
//       const existingUser = await prisma.user.findUnique({ 
//         where: { username: userData.username } 
//       });
      
//       if (existingUser) {
//         results.updated++;
//       } else {
//         results.created++;
//       }

//       // นับสถิติ
//       const role = "DEVELOPER";
//       results.byRole[role] = (results.byRole[role] || 0) + 1;
//       results.byStatus[userData.status] = (results.byStatus[userData.status] || 0) + 1;

//       console.log(`  ✅ ${userData.firstName} ${userData.lastName} (${userData.username})`);
//       console.log(`      Role: Developer | Status: ${userData.status} | Position: ${userData.position || 'N/A'}`);

//     } catch (error) {
//       console.error(`  ❌ Failed to create user ${userData.username}:`, error);
//     }
//   }

//   // แสดงสถิติสรุป
//   console.log(`\n📊 User Creation Summary:`);
//   console.log(`  ✅ Created: ${results.created} user`);
//   console.log(`  🔄 Updated: ${results.updated} user`);
//   console.log(`  👥 Total: ${results.created + results.updated} user`);

//   console.log(`\n📋 User Details:`);
//   Object.entries(results.byRole).forEach(([role, count]) => {
//     console.log(`  - ${role}: ${count} คน`);
//   });

//   console.log(`\n📈 User Status:`);
//   Object.entries(results.byStatus).forEach(([status, count]) => {
//     const statusDescriptions: Record<string, string> = {
//       "APPROVED": "อนุมัติแล้ว",
//       "UNAPPROVED": "รอการอนุมัติ",
//       "SUSPENDED": "ระงับการใช้งาน",
//       "INACTIVE": "ไม่ใช้งาน"
//     };
//     console.log(`  - ${status} (${statusDescriptions[status] || status}): ${count} คน`);
//   });

//   console.log(`\n🔐 Login Information:`);
//   console.log(`  👨‍💻 Developer: 0234 / 123456`);
//   console.log(`  📝 ชื่อ: นักศึกษา เภสัช`);
//   console.log(`  💼 ตำแหน่ง: ผู้พัฒนา (Dev)`);
//   console.log(`  ✅ สถานะ: อนุมัติแล้ว`);

//   console.log(`\n🎯 Ready for Hospital Pharmacy V3.0 Development!`);
//   console.log(`   📱 Mobile-first design testing`);
//   console.log(`   🔄 Receive-only workflow testing`);
//   console.log(`   📊 System functionality testing`);
//   console.log(`   🔐 Single user authentication testing`);

//   return {
//     totalUsers: results.created + results.updated,
//     created: results.created,
//     updated: results.updated,
//     byRole: results.byRole,
//     byStatus: results.byStatus,
//     success: true
//   };
// }