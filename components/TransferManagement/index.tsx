// components/TransferManagement/index.tsx
// Main export file - COMPLETE exports

// ===== Main Views =====
export { default as OrganizationTransfersView } from './TransferOverview/OrganizationTransfersView';
export { default as DepartmentTransfersView } from './TransferList/DepartmentTransfersView';
export { default as CreateTransferForm } from './CreateTransfer/CreateTransferForm';
export { default as TransferDetailView } from './TransferDetail/TransferDetailView';

// ===== Overview Components =====
export { default as OverviewStats } from './TransferOverview/OverviewStats';
export { default as OverviewFilters } from './TransferOverview/OverviewFilters';

// ===== Transfer List Components =====
export { default as TransferTable } from './TransferList/TransferTable';

// ===== Transfer Detail Components =====
export { default as TransferDetailHeader } from './TransferDetail/TransferDetailHeader';
export { default as TransferNotes } from './TransferDetail/TransferNotes';
export { default as TransferItemsTab } from './TransferDetail/TransferItemsTab';
export { default as TransferHistoryTab } from './TransferDetail/TransferHistoryTab';
export { default as TransferHistoryTable } from './TransferDetail/TransferHistoryTable';
export { default as TransferItemCard } from './TransferDetail/TransferItemCard';
export { default as TransferStatusTimeline } from './TransferDetail/TransferStatusTimeline';

// ===== Shared Components =====
export { default as TransferStatusBadge } from './shared/TransferStatusBadge';
export { default as TransferPriorityBadge } from './shared/TransferPriorityBadge';
export { default as QuantityDisplay } from './shared/QuantityDisplay';
export { default as DepartmentBadge } from './shared/DepartmentBadge';
export { default as TransferCodeDisplay } from './shared/TransferCodeDisplay';

// ===== Item Action Dialog Components =====
export { default as ApproveItemDialog } from './ItemActions/ApproveItemDialog';
export { default as PrepareItemDialog } from './ItemActions/PrepareItemDialog';
export { default as DeliverItemDialog } from './ItemActions/DeliverItemDialog';
export { default as CancelItemDialog } from './ItemActions/CancelItemDialog';
export { default as BatchSelectionTable } from './ItemActions/BatchSelectionTable';
export { default as BatchInfoDisplay } from './ItemActions/BatchInfoDisplay';