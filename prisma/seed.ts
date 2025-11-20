// prisma/seed.ts
// Main Seed Orchestrator - Executes all seed modules in sequence

import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/users.seed';
import { seedOrganizations } from './seeds/organizations.seed';
import { seedDepartments } from './seeds/departments.seed';
import { seedProductUnits } from './seeds/product-units.seed';
import { seedProductCategories } from './seeds/product-categories.seed';
import { seedProducts } from './seeds/products.seed';
import { seedStocks } from './seeds/stocks.seed';
import { seedAuditLogs } from './seeds/audit-logs.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 InvenStock Database Seeding Started...\n');
  console.log('=' .repeat(60));

  try {
    // Phase 1: Foundation
    console.log('\n📍 PHASE 1: FOUNDATION\n');
    const users = await seedUsers();
    const organizations = await seedOrganizations(users);

    // Phase 2: Structure
    console.log('\n📍 PHASE 2: STRUCTURE\n');
    const departments = await seedDepartments(organizations, users);
    await seedProductUnits(organizations, users);
    await seedProductCategories(organizations, users);

    // Phase 3: Products
    console.log('\n📍 PHASE 3: PRODUCTS\n');
    await seedProducts(organizations, users);

    // Phase 4: Inventory
    console.log('\n📍 PHASE 4: INVENTORY\n');
    await seedStocks(organizations, departments, users);

    // Phase 5: History
    console.log('\n📍 PHASE 5: AUDIT HISTORY\n');
    await seedAuditLogs(organizations, departments, users);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Database seeding completed successfully!');
    console.log('=' .repeat(60) + '\n');

    // Summary
    console.log('📊 SEED SUMMARY:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Organizations: ${organizations.length}`);
    console.log(`   Departments: ${departments.length}`);
    console.log(`   Products: ${await prisma.product.count()}`);
    console.log(`   Stock Batches: ${await prisma.stockBatch.count()}`);
    console.log(`   Audit Logs: ${await prisma.auditLog.count()}`);
    console.log('\n🔐 Default Login:');
    console.log('   Username: owner01');
    console.log('   Password: password123\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });