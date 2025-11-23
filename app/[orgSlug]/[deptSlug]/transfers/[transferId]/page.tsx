// app/[orgSlug]/[deptSlug]/transfers/[transferId]/page.tsx
// Transfer Detail Page

'use client';

import { use } from 'react';
import { TransferDetailView } from '@/components/TransferManagement';

export default function TransferDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; deptSlug: string; transferId: string }>;
}) {
  const resolvedParams = use(params);
  const { orgSlug, deptSlug, transferId } = resolvedParams;

  // In real implementation, get userDepartmentId from auth
  const userDepartmentId = 'temp-dept-id';

  return (
    <TransferDetailView
      transferId={transferId}
      orgSlug={orgSlug}
      deptSlug={deptSlug}
      userDepartmentId={userDepartmentId}
    />
  );
}