// components/TransferManagement/index.tsx
// Main export file

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