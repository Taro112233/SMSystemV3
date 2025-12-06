// components/TransferManagement/index.tsx
// UPDATED: Add TransferDetail2 exports

// ===== Main Views =====
export { default as OrganizationTransfersView } from './TransferOverview/OrganizationTransfersView';
export { default as DepartmentTransfersView } from './TransferList/DepartmentTransfersView';
export { default as CreateTransferForm } from './CreateTransfer/CreateTransferForm';

// ===== Transfer Detail (Original) =====
export { default as TransferDetailView } from './TransferDetail/TransferDetailView';

// ===== Transfer Detail2 (New Redesigned) =====
export { TransferDetailView as TransferDetailView2 } from './TransferDetail2';
export { TransferHeader as TransferHeader2 } from './TransferDetail2';
export { TransferTimeline as TransferTimeline2 } from './TransferDetail2';
export { TransferItemsTable as TransferItemsTable2 } from './TransferDetail2';
export { TransferActivityLog as TransferActivityLog2 } from './TransferDetail2';

// ===== Overview Components =====
export { default as OverviewStats } from './TransferOverview/OverviewStats';
export { default as OverviewFilters } from './TransferOverview/OverviewFilters';

// ===== Transfer List Components =====
export { default as TransferTable } from './TransferList/TransferTable';
export { default as TransferFilters } from './TransferList/TransferFilters';

// ===== Transfer Detail Components (Original) =====
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
export { default as DepartmentSelectionDialog } from './shared/DepartmentSelectionDialog';

// ===== Item Action Dialog Components =====
export { default as ApproveItemDialog } from './ItemActions/ApproveItemDialog';
export { default as PrepareItemDialog } from './ItemActions/PrepareItemDialog';
export { default as DeliverItemDialog } from './ItemActions/DeliverItemDialog';
export { default as CancelItemDialog } from './ItemActions/CancelItemDialog';
export { default as BatchSelectionTable } from './ItemActions/BatchSelectionTable';
export { default as BatchInfoDisplay } from './ItemActions/BatchInfoDisplay';