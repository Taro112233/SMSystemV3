// components/DepartmentDashboard/index.tsx
// DepartmentView - Individual department dashboard

import React from 'react';
import { DepartmentActions } from './DepartmentActions';
import { DepartmentInfo } from './DepartmentInfo';
import { DepartmentStats } from './DepartmentStats';
import { type FrontendDepartment } from '@/lib/department-helpers';

interface DepartmentViewProps {
  department: FrontendDepartment;
}

export const DepartmentView = ({ department }: DepartmentViewProps) => {
  return (
    <div className="space-y-6">
      <DepartmentStats department={department} />
      
      <DepartmentActions />
      
      <DepartmentInfo department={department} />
    </div>
  );
};