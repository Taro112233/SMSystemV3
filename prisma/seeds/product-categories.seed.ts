// prisma/seeds/product-categories.seed.ts
// Phase 2: Product Attribute Categories & Options

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

export async function seedProductCategories(organizations: any[], users: any[]) {
  console.log('🌱 Seeding Product Categories...');

  const categories = [
    {
      key: 'dosage_form',
      label: 'รูปแบบยา',
      description: 'รูปแบบของยา เช่น เม็ด น้ำ ฉีด',
      displayOrder: 1,
      isRequired: true,
      options: [
        { value: 'ยาเม็ด', label: 'ยาเม็ด', sortOrder: 1 },
        { value: 'ยาน้ำ', label: 'ยาน้ำ', sortOrder: 2 },
        { value: 'ยาฉีด', label: 'ยาฉีด', sortOrder: 3 },
        { value: 'ยาครีม', label: 'ยาครีม', sortOrder: 4 },
        { value: 'ยาหยอด', label: 'ยาหยอด', sortOrder: 5 },
      ],
    },
    {
      key: 'drug_type',
      label: 'ประเภทยา',
      description: 'ประเภทของยาตามกลุ่มการรักษา',
      displayOrder: 2,
      isRequired: true,
      options: [
        { value: 'ยาแก้ปวด', label: 'ยาแก้ปวดลดไข้', sortOrder: 1 },
        { value: 'ยาปฏิชีวนะ', label: 'ยาปฏิชีวนะ', sortOrder: 2 },
        { value: 'วิตามิน', label: 'วิตามินและอาหารเสริม', sortOrder: 3 },
        { value: 'ยาแก้แพ้', label: 'ยาแก้แพ้', sortOrder: 4 },
        { value: 'ยาทาผิว', label: 'ยาทาภายนอก', sortOrder: 5 },
      ],
    },
    {
      key: 'manufacturer_country',
      label: 'ประเทศผู้ผลิต',
      description: 'ประเทศที่ผลิตยา',
      displayOrder: 3,
      isRequired: false,
      options: [
        { value: 'ไทย', label: 'ประเทศไทย', sortOrder: 1 },
        { value: 'ญี่ปุ่น', label: 'ญี่ปุ่น', sortOrder: 2 },
        { value: 'เยอรมัน', label: 'เยอรมนี', sortOrder: 3 },
        { value: 'สหรัฐอเมริกา', label: 'สหรัฐอเมริกา', sortOrder: 4 },
        { value: 'อินเดีย', label: 'อินเดีย', sortOrder: 5 },
      ],
    },
  ];

  const createdCategories = [];

  for (const org of organizations) {
    const ownerUser = users[0];

    for (const cat of categories) {
      const category = await prisma.productAttributeCategory.upsert({
        where: {
          organizationId_key: {
            organizationId: org.id,
            key: cat.key,
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          key: cat.key,
          label: cat.label,
          description: cat.description,
          displayOrder: cat.displayOrder,
          isRequired: cat.isRequired,
          isActive: true,
          createdBy: ownerUser.id,
          createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
        },
      });
      createdCategories.push(category);
      console.log(`  ✅ ${org.name} → ${category.label} (${category.key})`);

      // Create options
      for (const opt of cat.options) {
        await prisma.productAttributeOption.upsert({
          where: {
            categoryId_value: {
              categoryId: category.id,
              value: opt.value,
            },
          },
          update: {},
          create: {
            categoryId: category.id,
            value: opt.value,
            label: opt.label,
            sortOrder: opt.sortOrder,
            isActive: true,
          },
        });
        console.log(`    → ${opt.label}`);
      }
    }
  }

  console.log(`✅ Created ${createdCategories.length} categories\n`);
  return createdCategories;
}