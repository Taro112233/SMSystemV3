// types/product-unit.ts
// Shared types for Product Units (SIMPLIFIED)
// ============================================

export interface ProductUnit {
  id: string;
  organizationId: string;
  name: string;
  conversionRatio: number;  // Decimal as number in frontend
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Form data (simplified for UI)
export interface UnitFormData {
  name: string;
  conversionRatio: number;
  isActive: boolean;
}

// ✅ API request types
export interface CreateUnitData {
  name: string;
  conversionRatio: number;
  isActive?: boolean;
}

export interface UpdateUnitData {
  name?: string;
  conversionRatio?: number;
  isActive?: boolean;
}

// ✅ Conversion utilities
export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  ratio: number;
}