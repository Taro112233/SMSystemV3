// types/product.ts
// Centralized Product Types - Single Source of Truth

export interface ProductAttribute {
  categoryId: string;
  optionId: string;
  option: {
    label: string | null;
    value: string;
  };
}

export interface ProductData {
  id: string;
  code: string;
  name: string;
  genericName?: string;
  description?: string;
  baseUnit: string;
  isActive: boolean;
  attributes?: ProductAttribute[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryFiltersState {
  [key: string]: string | undefined;
  category1?: string;
  category2?: string;
  category3?: string;
}