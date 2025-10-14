// lib/product-helpers.ts
// Product attribute helpers for flexible JSON schema

import { Product, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';  // ✅ เพิ่ม import
import { createUserSnapshot } from '@/lib/user-snapshot';  // ✅ เพิ่ม import

/**
 * Get product attribute value
 */
export function getProductAttribute(
  product: Product, 
  key: string
): string | number | boolean | null {
  if (!product.attributes) return null;
  const attrs = product.attributes as Record<string, any>;
  return attrs[key] ?? null;
}

/**
 * Set product attribute value
 */
export function setProductAttribute(
  product: Product, 
  key: string, 
  value: any
): Prisma.InputJsonValue {
  const attrs = (product.attributes as Record<string, any>) || {};
  return {
    ...attrs,
    [key]: value
  };
}

/**
 * Get all attribute keys for products
 */
export function getAllAttributeKeys(products: Product[]): string[] {
  const keys = new Set<string>();
  
  products.forEach(product => {
    if (product.attributes) {
      const attrs = product.attributes as Record<string, any>;
      Object.keys(attrs).forEach(key => keys.add(key));
    }
  });
  
  return Array.from(keys).sort();
}

/**
 * Search products by attribute
 */
export function filterProductsByAttribute(
  products: Product[],
  key: string,
  value: string
): Product[] {
  return products.filter(product => {
    const attrValue = getProductAttribute(product, key);
    return attrValue?.toString().toLowerCase().includes(value.toLowerCase());
  });
}

/**
 * Group products by attribute value
 */
export function groupProductsByAttribute(
  products: Product[],
  key: string
): Record<string, Product[]> {
  return products.reduce((groups, product) => {
    const value = getProductAttribute(product, key)?.toString() || 'ไม่ระบุ';
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(product);
    return groups;
  }, {} as Record<string, Product[]>);
}

/**
 * ✅ Example: Get common attribute categories
 */
export const COMMON_ATTRIBUTE_KEYS = {
  DOSAGE_FORM: 'รูปแบบยา',      // ยาเม็ด, ยาทา, ยาน้ำ
  DRUG_TYPE: 'ประเภทยา',        // ยาแก้ปวด, ยาปฏิชีวนะ
  STRENGTH: 'ความแรง',           // 500mg, 10%
  MANUFACTURER: 'ผู้ผลิต',       // GPO, GSK
  ROUTE: 'วิธีใช้',              // รับประทาน, ใช้ภายนอก
  VOLUME: 'ปริมาตร',             // 60ml, 100ml
  CERTIFICATION: 'ใบรับรอง',     // FDA, อย.
} as const;

/**
 * ✅ Example: Get attribute options from existing products
 */
export function getAttributeOptions(
  products: Product[],
  attributeKey: string
): string[] {
  const options = new Set<string>();
  
  products.forEach(product => {
    const value = getProductAttribute(product, attributeKey);
    if (value) {
      options.add(value.toString());
    }
  });
  
  return Array.from(options).sort();
}

/**
 * ✅ Get attribute categories for organization
 */
export async function getAttributeCategories(organizationId: string) {
  return await prisma.productAttributeCategory.findMany({
    where: { organizationId, isActive: true },
    orderBy: { displayOrder: 'asc' }
  });
}

/**
 * ✅ Create new attribute category
 */
export async function createAttributeCategory(data: {
  organizationId: string;
  key: string;
  label: string;
  options: string[];
  userId: string;
}) {
  const snapshot = await createUserSnapshot(data.userId, data.organizationId);
  
  return await prisma.productAttributeCategory.create({
    data: {
      ...data,
      createdBy: data.userId,
      createdBySnapshot: snapshot,
    }
  });
}

/**
 * ✅ Update attribute category
 */
export async function updateAttributeCategory(
  categoryId: string,
  data: {
    label?: string;
    options?: string[];
    displayOrder?: number;
    isRequired?: boolean;
    userId: string;
    organizationId: string;
  }
) {
  const snapshot = await createUserSnapshot(data.userId, data.organizationId);
  
  const { userId, organizationId, ...updateData } = data;
  
  return await prisma.productAttributeCategory.update({
    where: { id: categoryId },
    data: {
      ...updateData,
      updatedBy: userId,
      updatedBySnapshot: snapshot,
    }
  });
}

/**
 * ✅ Delete attribute category
 */
export async function deleteAttributeCategory(categoryId: string) {
  return await prisma.productAttributeCategory.update({
    where: { id: categoryId },
    data: { isActive: false }
  });
}

/**
 * ✅ Get attribute options from category
 */
export async function getAttributeCategoryOptions(
  organizationId: string,
  key: string
): Promise<string[]> {
  const category = await prisma.productAttributeCategory.findUnique({
    where: { 
      organizationId_key: {
        organizationId,
        key
      }
    }
  });
  
  if (!category || !category.options) return [];
  
  return category.options as string[];
}