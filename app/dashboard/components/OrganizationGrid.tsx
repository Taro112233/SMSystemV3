// app/dashboard/components/OrganizationGrid.tsx
// OrganizationGrid - Grid display of user's organizations

import React from 'react';
import { OrganizationCard } from './OrganizationCard';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  color: string;
  userRole: string;
  stats: {
    departments: number;
    products: number;
    lowStock: number;
    activeUsers: number;
  };
  notifications: number;
  isActive: boolean;
}

interface OrganizationGridProps {
  organizations: Organization[];
  onOrganizationClick: (slug: string) => void;
}

export const OrganizationGrid = ({ organizations, onOrganizationClick }: OrganizationGridProps) => {
  return (
    <>
      {organizations.map((org) => (
        <OrganizationCard
          key={org.id}
          organization={org}
          onClick={() => onOrganizationClick(org.slug)}
        />
      ))}
    </>
  );
};