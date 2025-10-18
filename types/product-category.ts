// types/product-category.ts
// Shared types for Product Attribute Categories
// ============================================

// ✅ Relational data from database
export interface ProductAttributeOption {
  id: string;
  value: string;
  label?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductAttributeCategory {
  id: string;
  key: string;
  label: string;
  description?: string | null;
  options: ProductAttributeOption[];  // ✅ Relational
  displayOrder: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Form data (simplified for UI)
export interface CategoryFormData {
  key: string;
  label: string;
  description: string;
  options: string[];  // ✅ String array for form
  displayOrder: number;
  isRequired: boolean;
  isActive: boolean;
  organizationId?: string;
}

// ✅ API request types
export interface CreateCategoryData {
  key: string;
  label: string;
  description?: string;
  options: string[];
  displayOrder?: number;
  isRequired?: boolean;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  key?: string;
  label?: string;
  description?: string;
  options?: string[];
  displayOrder?: number;
  isRequired?: boolean;
  isActive?: boolean;
}