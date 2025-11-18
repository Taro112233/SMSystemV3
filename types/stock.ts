// types/stock.ts
// Centralized Stock Types - Single Source of Truth

export interface StockBatch {
  id: string;
  stockId: string;
  lotNumber: string;
  expiryDate?: Date;
  manufactureDate?: Date;
  supplier?: string;
  costPrice?: number;
  sellingPrice?: number;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  incomingQuantity: number;
  location?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'QUARANTINE' | 'DAMAGED' | 'EXPIRED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  receivedAt: Date;
}

export interface DepartmentStock {
  id: string;
  organizationId: string;
  departmentId: string;
  productId: string;
  product: {
    id: string;
    code: string;
    name: string;
    genericName?: string;
    baseUnit: string;
    attributes?: Array<{
      categoryId: string;
      optionId: string;
      option: {
        label: string | null;
        value: string;
      };
    }>;
  };
  location?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  defaultWithdrawalQty?: number;
  lastStockCheck?: Date;
  lastMovement?: Date;
  batches: StockBatch[];
  // Aggregated quantities
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  incomingQuantity: number;
}

export interface StockFilters {
  search?: string;
  showLowStock?: boolean;
  showExpiring?: boolean;
  sortBy?: 'productName' | 'productCode' | 'quantity' | 'expiryDate';
  sortOrder?: 'asc' | 'desc';
}

export interface BatchFormData {
  lotNumber: string;
  expiryDate?: Date;
  manufactureDate?: Date;
  supplier?: string;
  costPrice?: number;
  sellingPrice?: number;
  quantity: number;
  location?: string;
}