// components/OrganizationList/OrganizationCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, ChevronRight } from 'lucide-react'; // ✅ ลบ Activity ออก

interface OrganizationCardProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    memberCount?: number;
    departmentCount?: number;
    userRole?: string;
  };
  onSelect: () => void;
}

export const OrganizationCard = ({ organization, onSelect }: OrganizationCardProps) => {
  const logo = organization.name.substring(0, 2).toUpperCase();

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              {logo}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{organization.name}</h3>
              <p className="text-sm text-gray-500">/{organization.slug}</p>
            </div>
          </div>
          {organization.userRole && (
            <Badge variant="secondary">{organization.userRole}</Badge>
          )}
        </div>

        {organization.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {organization.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{organization.memberCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              <span>{organization.departmentCount || 0}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};