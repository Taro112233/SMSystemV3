// lib/product-helpers.ts
// Product utility functions and types - UPDATED

import { Product, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// ===== TYPE EXTENSIONS =====

/**
 * Product with JSON attributes (for legacy/flexible attributes)
 */
export interface ProductWithJsonAttributes extends Product {
  attributes?: Record<string, unknown>;
}

// ===== EXISTING FUNCTIONS (Keep compatibility with JSON attributes) =====

export function getProductAttribute(
  product: ProductWithJsonAttributes, 
  key: string
): string | number | boolean | null {
  if (!product.attributes) return null;
  const attrs = product.attributes as Record<string, unknown>;
  return attrs[key] as string | number | boolean | null ?? null;
}

export function setProductAttribute(
  product: ProductWithJsonAttributes, 
  key: string, 
  value: Prisma.InputJsonValue
): Prisma.InputJsonValue {
  const attrs = (product.attributes as Prisma.JsonObject) || {};
  return {
    ...attrs,
    [key]: value
  };
}

export function getAllAttributeKeys(products: ProductWithJsonAttributes[]): string[] {
  const keys = new Set<string>();
  
  products.forEach(product => {
    if (product.attributes) {
      const attrs = product.attributes as Record<string, unknown>;
      Object.keys(attrs).forEach(key => keys.add(key));
    }
  });
  
  return Array.from(keys).sort();
}

export function filterProductsByAttribute(
  products: ProductWithJsonAttributes[],
  key: string,
  value: string
): ProductWithJsonAttributes[] {
  return products.filter(product => {
    const attrValue = getProductAttribute(product, key);
    return attrValue?.toString().toLowerCase().includes(value.toLowerCase());
  });
}

export function groupProductsByAttribute(
  products: ProductWithJsonAttributes[],
  key: string
): Record<string, ProductWithJsonAttributes[]> {
  return products.reduce((groups, product) => {
    const value = getProductAttribute(product, key)?.toString() || 'ไม่ระบุ';
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(product);
    return groups;
  }, {} as Record<string, ProductWithJsonAttributes[]>);
}

export const COMMON_ATTRIBUTE_KEYS = {
  DOSAGE_FORM: 'รูปแบบยา',
  DRUG_TYPE: 'ประเภทยา',
  STRENGTH: 'ความแรง',
  MANUFACTURER: 'ผู้ผลิต',
  ROUTE: 'วิธีใช้',
  VOLUME: 'ปริมาตร',
  CERTIFICATION: 'ใบรับรอง',
} as const;

export function getAttributeOptions(
  products: ProductWithJsonAttributes[],
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

export async function getAttributeCategories(organizationId: string) {
  return await prisma.productAttributeCategory.findMany({
    where: { organizationId, isActive: true },
    include: { options: true },
    orderBy: { displayOrder: 'asc' }
  });
}

export async function deleteAttributeCategory(categoryId: string) {
  return await prisma.productAttributeCategory.update({
    where: { id: categoryId },
    data: { isActive: false }
  });
}

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
    },
    include: { options: true }
  });
  
  if (!category || !category.options) return [];
  
  return category.options.map(opt => opt.value);
}

// ===== NEW TYPES FOR PRODUCT MANAGEMENT UI =====

export interface ProductAttribute {
  id: string;
  productId: string;
  categoryId: string;
  optionId: string;
  category: {
    id: string;
    key: string;
    label: string;
  };
  option: {
    id: string;
    value: string;
    label: string | null;
  };
}

export interface ProductWithRelations extends Product {
  attributes: ProductAttribute[];
}

export type SortableProductField = 
  | 'code' 
  | 'name' 
  | 'genericName' 
  | 'baseUnit' 
  | 'isActive' 
  | 'createdAt' 
  | 'updatedAt';

export type SortOrder = 'asc' | 'desc';

export interface ProductFilters {
  search?: string;
  isActive?: boolean | null;
  sortBy?: SortableProductField;
  sortOrder?: SortOrder;
}

export function formatProductAttributes(attributes: ProductAttribute[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  attributes.forEach(attr => {
    formatted[attr.category.label] = attr.option.label || attr.option.value;
  });
  
  return formatted;
}

export function getAttributeValue(
  attributes: ProductAttribute[],
  categoryKey: string
): string | null {
  const attr = attributes.find(a => a.category.key === categoryKey);
  return attr ? (attr.option.label || attr.option.value) : null;
}

export function getProductDisplayName(product: Product): string {
  if (product.genericName) {
    return `${product.name} (${product.genericName})`;
  }
  return product.name;
}

export function isValidProductCode(code: string): boolean {
  return /^[A-Z0-9-_]+$/i.test(code);
}

export function buildProductQueryParams(filters: ProductFilters): string {
  const params = new URLSearchParams();
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.isActive !== undefined && filters.isActive !== null) {
    params.append('isActive', filters.isActive.toString());
  }
  
  if (filters.sortBy) {
    params.append('sortBy', filters.sortBy);
  }
  
  if (filters.sortOrder) {
    params.append('sortOrder', filters.sortOrder);
  }
  
  return params.toString();
}

export function getProductStatusColor(isActive: boolean): string {
  return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
}

export function getProductStatusText(isActive: boolean): string {
  return isActive ? 'ใช้งาน' : 'ไม่ใช้งาน';
}