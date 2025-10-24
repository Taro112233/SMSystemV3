// lib/unit-helpers.ts
// Product unit conversion helpers (SIMPLIFIED)
// ============================================

import { prisma } from '@/lib/prisma';
import type { ProductUnit } from '@/types/product-unit';

/**
 * Get all active units for an organization
 */
export async function getOrganizationUnits(organizationId: string): Promise<ProductUnit[]> {
  const units = await prisma.productUnit.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: [
      { name: 'asc' }
    ],
  });

  return units.map(unit => ({
    ...unit,
    conversionRatio: Number(unit.conversionRatio),
  }));
}

/**
 * Convert quantity from one unit to base unit
 * Example: convertToBaseUnit(5, "โหล", units) → 60 (if โหล = 12)
 */
export function convertToBaseUnit(
  quantity: number,
  unitName: string,
  units: ProductUnit[]
): number {
  const unit = units.find(u => u.name === unitName);
  
  if (!unit) {
    console.warn(`Unit not found: ${unitName}, using quantity as-is`);
    return quantity;
  }

  return quantity * unit.conversionRatio;
}

/**
 * Convert quantity from base unit to target unit
 * Example: convertFromBaseUnit(60, "โหล", units) → 5 (if โหล = 12)
 */
export function convertFromBaseUnit(
  baseQuantity: number,
  targetUnitName: string,
  units: ProductUnit[]
): number {
  const unit = units.find(u => u.name === targetUnitName);
  
  if (!unit) {
    console.warn(`Unit not found: ${targetUnitName}, using quantity as-is`);
    return baseQuantity;
  }

  return baseQuantity / unit.conversionRatio;
}

/**
 * Convert between two units
 * Example: convertBetweenUnits(2, "ลัง", "โหล", units) 
 *          → 40 หน่วย → 3.33 โหล
 */
export function convertBetweenUnits(
  quantity: number,
  fromUnitName: string,
  toUnitName: string,
  units: ProductUnit[]
): number {
  // Convert to base unit first
  const baseQuantity = convertToBaseUnit(quantity, fromUnitName, units);
  
  // Then convert to target unit
  return convertFromBaseUnit(baseQuantity, toUnitName, units);
}

/**
 * Format quantity with unit
 * Example: formatQuantityWithUnit(5, "โหล") → "5 โหล"
 */
export function formatQuantityWithUnit(quantity: number, unitName: string): string {
  return `${quantity.toLocaleString('th-TH')} ${unitName}`;
}

/**
 * Validate unit name is unique in organization
 */
export async function isUnitNameUnique(
  organizationId: string,
  name: string,
  excludeUnitId?: string
): Promise<boolean> {
  const existing = await prisma.productUnit.findFirst({
    where: {
      organizationId,
      name: name.trim(),
      ...(excludeUnitId && { id: { not: excludeUnitId } })
    }
  });

  return !existing;
}

/**
 * Get unit by name
 */
export async function getUnitByName(
  organizationId: string,
  name: string
): Promise<ProductUnit | null> {
  const unit = await prisma.productUnit.findFirst({
    where: {
      organizationId,
      name: name.trim(),
      isActive: true,
    }
  });

  if (!unit) return null;

  return {
    ...unit,
    conversionRatio: Number(unit.conversionRatio),
  };
}

/**
 * Calculate total base quantity from multiple units
 * Example: [{ qty: 2, unit: "ลัง" }, { qty: 3, unit: "โหล" }]
 *          → (2 × 20) + (3 × 12) = 76 หน่วย
 */
export function calculateTotalBaseQuantity(
  items: Array<{ quantity: number; unitName: string }>,
  units: ProductUnit[]
): number {
  return items.reduce((total, item) => {
    return total + convertToBaseUnit(item.quantity, item.unitName, units);
  }, 0);
}