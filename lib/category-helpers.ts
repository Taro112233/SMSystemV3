// lib/category-helpers.ts
// Category helper functions for product management

import { prisma } from '@/lib/prisma';

export interface CategoryWithOptions {
  id: string;
  key: string;
  label: string;
  displayOrder: number;
  isRequired: boolean;
  options: {
    id: string;
    value: string;
    label: string | null;
    sortOrder: number;
  }[];
}

interface ProductAttribute {
  categoryId: string;
  optionId: string;
  option: {
    label: string | null;
    value: string;
  };
}

interface ProductWithAttributes {
  attributes?: ProductAttribute[];
  [key: string]: unknown;
}

/**
 * Get top 3 categories by display order
 */
export async function getTop3Categories(organizationId: string): Promise<CategoryWithOptions[]> {
  const categories = await prisma.productAttributeCategory.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { displayOrder: 'asc' },
    take: 3,
  });

  return categories;
}

/**
 * Get all active categories
 */
export async function getAllCategories(organizationId: string): Promise<CategoryWithOptions[]> {
  const categories = await prisma.productAttributeCategory.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    include: {
      options: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  return categories;
}

/**
 * Get category value from product attributes
 */
export function getCategoryValue(
  attributes: ProductAttribute[],
  categoryId: string
): string {
  const attr = attributes.find(a => a.categoryId === categoryId);
  return attr ? (attr.option.label || attr.option.value) : '-';
}

/**
 * Get category option by id
 */
export function getCategoryOptionById(
  categories: CategoryWithOptions[],
  categoryId: string,
  optionId: string
): string {
  const category = categories.find(c => c.id === categoryId);
  if (!category) return '-';
  
  const option = category.options.find(o => o.id === optionId);
  return option ? (option.label || option.value) : '-';
}

/**
 * Format attributes for form (array of {categoryId, optionId})
 */
export function formatAttributesForForm(attributes: ProductAttribute[]): { categoryId: string; optionId: string }[] {
  return attributes.map(attr => ({
    categoryId: attr.categoryId,
    optionId: attr.optionId,
  }));
}

/**
 * Group products by category option
 */
export function groupProductsByCategory(
  products: ProductWithAttributes[],
  categoryId: string
): Record<string, ProductWithAttributes[]> {
  const groups: Record<string, ProductWithAttributes[]> = {};
  
  products.forEach(product => {
    const attr = product.attributes?.find((a) => a.categoryId === categoryId);
    const key = attr ? (attr.option.label || attr.option.value) : 'ไม่ระบุ';
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(product);
  });
  
  return groups;
}