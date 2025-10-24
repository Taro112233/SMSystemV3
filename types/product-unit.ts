// types/product-unit.ts
// Shared types for Product Units
// ============================================

export interface ProductUnit {
  id: string;
  organizationId: string;
  name: string;
  symbol?: string | null;
  description?: string | null;
  conversionRatio: number;  // Decimal as number in frontend
  isBaseUnit: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Form data (simplified for UI)
export interface UnitFormData {
  name: string;
  symbol: string;
  description: string;
  conversionRatio: number;
  isBaseUnit: boolean;
  displayOrder: number;
  isActive: boolean;
}

// ✅ API request types
export interface CreateUnitData {
  name: string;
  symbol?: string;
  description?: string;
  conversionRatio: number;
  isBaseUnit?: boolean;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateUnitData {
  name?: string;
  symbol?: string;
  description?: string;
  conversionRatio?: number;
  displayOrder?: number;
  isActive?: boolean;
  // Cannot change isBaseUnit after creation
}

// ✅ Conversion utilities
export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  ratio: number;
}