// components/TransferManagement/index.tsx
// Main export file - UPDATED with Dialog exports

export { default as OrganizationTransfersView } from './TransferOverview/OrganizationTransfersView';
export { default as DepartmentTransfersView } from './TransferList/DepartmentTransfersView';
export { default as CreateTransferForm } from './CreateTransfer/CreateTransferForm';
export { default as TransferDetailView } from './TransferDetail/TransferDetailView';

// Shared components
export { default as TransferStatusBadge } from './shared/TransferStatusBadge';
export { default as TransferPriorityBadge } from './shared/TransferPriorityBadge';
export { default as QuantityDisplay } from './shared/QuantityDisplay';
export { default as DepartmentBadge } from './shared/DepartmentBadge';
export { default as TransferCodeDisplay } from './shared/TransferCodeDisplay';

// ✅ NEW: Dialog components exports
export { default as ApproveItemDialog } from './ItemActions/ApproveItemDialog';
export { default as PrepareItemDialog } from './ItemActions/PrepareItemDialog';
export { default as DeliverItemDialog } from './ItemActions/DeliverItemDialog';
export { default as CancelItemDialog } from './ItemActions/CancelItemDialog';
export { default as BatchSelectionTable } from './ItemActions/BatchSelectionTable';
export { default as BatchInfoDisplay } from './ItemActions/BatchInfoDisplay';