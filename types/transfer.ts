// types/transfer.ts
// Transfer System Types - Single Source of Truth

export type TransferStatus = 
  | 'PENDING'
  | 'APPROVED' 
  | 'PREPARED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PARTIAL'
  | 'COMPLETED';

export type TransferItemStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PREPARED'
  | 'DELIVERED'
  | 'CANCELLED';

export type TransferPriority = 'NORMAL' | 'URGENT' | 'CRITICAL';

export interface Transfer {
  id: string;
  code: string;
  title: string;
  organizationId: string;
  requestingDepartmentId: string;
  requestingDepartment: {
    id: string;
    name: string;
    slug: string;
  };
  supplyingDepartmentId: string;
  supplyingDepartment: {
    id: string;
    name: string;
    slug: string;
  };
  status: TransferStatus;
  priority: TransferPriority;
  requestReason?: string;
  notes?: string;
  totalItems: number;
  requestedAt: Date;
  approvedAt?: Date;
  preparedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  requestedBy: string;
  requestedBySnapshot?: any;
  createdAt: Date;
  updatedAt: Date;
  items: TransferItem[];
  statusHistory?: TransferHistory[]; // ✅ เพิ่มบรรทัดนี้
}

export interface TransferItem {
  id: string;
  transferId: string;
  productId: string;
  product: {
    id: string;
    code: string;
    name: string;
    genericName?: string;
    baseUnit: string;
  };
  status: TransferItemStatus;
  requestedQuantity: number;
  approvedQuantity?: number;
  preparedQuantity?: number;
  receivedQuantity?: number;
  notes?: string;
  approvedAt?: Date;
  preparedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  batches?: TransferBatch[];
}

export interface TransferBatch {
  id: string;
  transferItemId: string;
  batchId: string;
  batch: {
    id: string;
    lotNumber: string;
    expiryDate?: Date;
  };
  quantity: number;
}

export interface TransferFiltersState {
  search?: string;
  status?: TransferStatus | 'all';
  priority?: TransferPriority | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'requestedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTransferData {
  transferCode: string;
  title: string;
  supplyingDepartmentId: string;
  requestReason?: string;
  priority: TransferPriority;
  notes?: string;
  items: {
    productId: string;
    requestedQuantity: number;
    notes?: string;
  }[];
}

export interface ApproveItemData {
  approvedQuantity: number;
  notes?: string;
}

export interface PrepareItemData {
  preparedQuantity: number;
  batches: {
    batchId: string;
    quantity: number;
  }[];
  notes?: string;
}

export interface DeliverItemData {
  receivedQuantity: number;
  notes?: string;
}

export interface CancelItemData {
  reason: string;
}

export interface TransferHistory {
  id: string;
  transferId: string;
  itemId?: string; // ✅ เพิ่ม itemId
  action: string;
  fromStatus?: string;
  toStatus?: string;
  changedBy: string;
  changedBySnapshot?: any;
  notes?: string;
  createdAt: Date;
}