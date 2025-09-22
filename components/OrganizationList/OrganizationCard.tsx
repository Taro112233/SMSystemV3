// app/dashboard/components/OrganizationCard.tsx
// OrganizationCard - Individual organization display card

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Package, AlertTriangle, Users, Crown, Shield, User, Activity, ChevronRight } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
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

interface OrganizationCardProps {
  organization: Organization;
  onClick: () => void;
}

export const OrganizationCard = ({ organization: org, onClick }: OrganizationCardProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'ADMIN': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'MEMBER': return <User className="w-4 h-4 text-gray-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'OWNER': return 'เจ้าของ';
      case 'ADMIN': return 'ผู้ดูแล';
      case 'MEMBER': return 'สมาชิก';
      default: return 'สมาชิก';
    }
  };

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1
        ${!org.isActive ? 'opacity-60' : ''}
      `}
      onClick={() => org.isActive && onClick()}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${org.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
              {org.logo}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-tight truncate">{org.name}</CardTitle>
              <p className="text-sm text-gray-500 truncate">{org.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              {getRoleIcon(org.userRole)}
              <span className="text-xs text-gray-600">{getRoleText(org.userRole)}</span>
            </div>
            {org.notifications > 0 && (
              <Badge variant="destructive" className="h-5 text-xs px-1">
                {org.notifications}
              </Badge>
            )}
          </div>
        </div>
        
        {!org.isActive && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              ระงับการใช้งาน
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{org.stats.departments}</p>
              <p className="text-xs text-gray-500">แผนก</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{org.stats.products.toLocaleString()}</p>
              <p className="text-xs text-gray-500">สินค้า</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-orange-600">{org.stats.lowStock}</p>
              <p className="text-xs text-gray-500">ใกล้หมด</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-600">{org.stats.activeUsers}</p>
              <p className="text-xs text-gray-500">ผู้ใช้งาน</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
          {org.isActive && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <span>เข้าสู่ระบบ</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};