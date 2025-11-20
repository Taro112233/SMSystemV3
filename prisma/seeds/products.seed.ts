// prisma/seeds/products.seed.ts
// Phase 3: Products - Create sample pharmaceutical products

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

export async function seedProducts(organizations: any[], users: any[]) {
  console.log('🌱 Seeding Products...');

  const productsData = [
    {
      code: 'PARA500',
      name: 'Paracetamol 500mg',
      genericName: 'Acetaminophen',
      description: 'ยาแก้ปวดลดไข้',
      baseUnit: 'เม็ด',
      attributes: {
        dosage_form: 'ยาเม็ด',
        drug_type: 'ยาแก้ปวด',
        manufacturer_country: 'ไทย',
      },
    },
    {
      code: 'AMOX250',
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      description: 'ยาปฏิชีวนะ',
      baseUnit: 'เม็ด',
      attributes: {
        dosage_form: 'ยาเม็ด',
        drug_type: 'ยาปฏิชีวนะ',
        manufacturer_country: 'ไทย',
      },
    },
    {
      code: 'VITB100',
      name: 'Vitamin B Complex',
      genericName: 'B-Complex',
      description: 'วิตามินบีรวม',
      baseUnit: 'เม็ด',
      attributes: {
        dosage_form: 'ยาเม็ด',
        drug_type: 'วิตามิน',
        manufacturer_country: 'ญี่ปุ่น',
      },
    },
    {
      code: 'CETI10',
      name: 'Cetirizine 10mg',
      genericName: 'Cetirizine HCl',
      description: 'ยาแก้แพ้',
      baseUnit: 'เม็ด',
      attributes: {
        dosage_form: 'ยาเม็ด',
        drug_type: 'ยาแก้แพ้',
        manufacturer_country: 'อินเดีย',
      },
    },
    {
      code: 'GENTA30',
      name: 'Gentamicin Cream 0.1%',
      genericName: 'Gentamicin Sulfate',
      description: 'ยาครีมปฏิชีวนะ',
      baseUnit: 'หลอด',
      attributes: {
        dosage_form: 'ยาครีม',
        drug_type: 'ยาทาผิว',
        manufacturer_country: 'เยอรมัน',
      },
    },
    {
      code: 'SALBU2',
      name: 'Salbutamol Syrup 2mg/5ml',
      genericName: 'Salbutamol',
      description: 'ยาน้ำขยายหลอดลม',
      baseUnit: 'ขวด',
      attributes: {
        dosage_form: 'ยาน้ำ',
        drug_type: 'ยาแก้แพ้',
        manufacturer_country: 'สหรัฐอเมริกา',
      },
    },
    {
      code: 'DICLO75',
      name: 'Diclofenac 75mg Injection',
      genericName: 'Diclofenac Sodium',
      description: 'ยาแก้ปวดฉีด',
      baseUnit: 'แอมพูล',
      attributes: {
        dosage_form: 'ยาฉีด',
        drug_type: 'ยาแก้ปวด',
        manufacturer_country: 'เยอรมัน',
      },
    },
    {
      code: 'OMEP20',
      name: 'Omeprazole 20mg',
      genericName: 'Omeprazole',
      description: 'ยาลดกรดในกระเพาะ',
      baseUnit: 'เม็ด',
      attributes: {
        dosage_form: 'ยาเม็ด',
        drug_type: 'ยาแก้ปวด',
        manufacturer_country: 'อินเดีย',
      },
    },
  ];

  const createdProducts = [];

  for (const org of organizations) {
    const ownerUser = users[0];

    for (const prod of productsData) {
      // Create product
      const product = await prisma.product.upsert({
        where: {
          organizationId_code: {
            organizationId: org.id,
            code: prod.code,
          },
        },
        update: {},
        create: {
          organizationId: org.id,
          code: prod.code,
          name: prod.name,
          genericName: prod.genericName,
          description: prod.description,
          baseUnit: prod.baseUnit,
          isActive: true,
          createdBy: ownerUser.id,
          createdBySnapshot: createUserSnapshot(ownerUser, 'OWNER'),
        },
      });
      createdProducts.push(product);
      console.log(`  ✅ ${org.name} → ${product.code}: ${product.name}`);

      // Link attributes
      for (const [catKey, optValue] of Object.entries(prod.attributes)) {
        const category = await prisma.productAttributeCategory.findUnique({
          where: {
            organizationId_key: {
              organizationId: org.id,
              key: catKey,
            },
          },
        });

        if (category) {
          const option = await prisma.productAttributeOption.findUnique({
            where: {
              categoryId_value: {
                categoryId: category.id,
                value: optValue,
              },
            },
          });

          if (option) {
            await prisma.productAttribute.upsert({
              where: {
                productId_categoryId: {
                  productId: product.id,
                  categoryId: category.id,
                },
              },
              update: {},
              create: {
                productId: product.id,
                categoryId: category.id,
                optionId: option.id,
              },
            });
          }
        }
      }
    }
  }

  console.log(`✅ Created ${createdProducts.length} products\n`);
  return createdProducts;
}