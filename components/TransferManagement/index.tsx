// components/TransferManagement/index.tsx
// Main exports for TransferManagement components

// ===== Main Views =====
export { default as OrganizationTransfersView } from './TransferOverview/OrganizationTransfersView';
export { default as DepartmentTransfersView } from './TransferList/DepartmentTransfersView';
export { default as CreateTransferForm } from './CreateTransfer/CreateTransferForm';

// ===== Transfer Detail =====
export { default as TransferDetailView } from './TransferDetail/TransferDetailView';
export { default as TransferHeader } from './TransferDetail/TransferHeader';
export { default as TransferTimeline } from './TransferDetail/TransferTimeline';
export { default as TransferItemsTable } from './TransferDetail/TransferItemsTable';
export { default as TransferActivityLog } from './TransferDetail/TransferActivityLog';
export { default as BatchDetailsRow } from './TransferDetail/BatchDetailsRow';

// ===== Overview Components =====
export { default as OverviewStats } from './TransferOverview/OverviewStats';
export { default as OverviewFilters } from './TransferOverview/OverviewFilters';

// ===== Transfer List Components =====
export { default as TransferTable } from './TransferList/TransferTable';
export { default as TransferFilters } from './TransferList/TransferFilters';

// ===== Shared Components =====
export { default as TransferStatusBadge } from './shared/TransferStatusBadge';
export { default as TransferPriorityBadge } from './shared/TransferPriorityBadge';
export { default as QuantityDisplay } from './shared/QuantityDisplay';
export { default as DepartmentBadge } from './shared/DepartmentBadge';
export { default as TransferCodeDisplay } from './shared/TransferCodeDisplay';
export { default as DepartmentSelectionDialog } from './shared/DepartmentSelectionDialog';

// ===== Item Action Dialog Components =====
export { default as ApproveItemDialog } from './ItemActions/ApproveItemDialog';
export { default as PrepareItemDialog } from './ItemActions/PrepareItemDialog';
export { default as DeliverItemDialog } from './ItemActions/DeliverItemDialog';
export { default as CancelItemDialog } from './ItemActions/CancelItemDialog';
export { default as BatchSelectionTable } from './ItemActions/BatchSelectionTable';
export { default as BatchInfoDisplay } from './ItemActions/BatchInfoDisplay';