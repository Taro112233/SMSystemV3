// FILE: components/OrganizationList/OrganizationCard.tsx
// OrganizationCard - Individual organization display card with Icon & Color
// ============================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Users, Crown, Shield, User, ChevronRight } from 'lucide-react';
import { getIconComponent, mapColorThemeToTailwind } from '@/lib/department-helpers';

interface Organization {
  id: string;
  name: string;
  description: string;
  logo?: string;         // ✅ Keep for backward compatibility
  color?: string;        // ✅ NEW - ColorTheme enum value
  icon?: string;         // ✅ NEW - IconType enum value
  userRole: string;
  stats: {
    departments: number;
    products: number;
    lowStock: number;
    activeUsers: number;
  };
  notifications: number;
  isActive: boolean;
  status?: string;
}

interface OrganizationCardProps {
  organization: Organization;
  onClick: () => void;
}

export const OrganizationCard = ({ organization: org, onClick }: OrganizationCardProps) => {
  // ✅ Get icon component and color class from database values
  const IconComponent = getIconComponent(org.icon || 'BUILDING');
  const colorClass = mapColorThemeToTailwind(org.color || 'BLUE');

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
      case 'OWNER': return 'OWNER';
      case 'ADMIN': return 'ADMIN';
      case 'MEMBER': return 'MEMBER';
      default: return 'MEMBER';
    }
  };

  const getStatusBadge = (status?: string, isActive: boolean = true) => {
    if (!isActive || status === 'SUSPENDED') {
      return (
        <Badge variant="destructive" className="text-xs">
          ระงับ
        </Badge>
      );
    }
    
    if (status === 'TRIAL') {
      return (
        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
          ทดลอง
        </Badge>
      );
    }
    
    if (status === 'ACTIVE') {
      return (
        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
          ใช้งาน
        </Badge>
      );
    }
    
    return null;
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
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
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* ✅ UPDATED: Use icon from database instead of text logo */}
            <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center shadow-md`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-tight truncate">{org.name}</CardTitle>
              <p className="text-sm text-gray-500 truncate" title={org.description}>
                {truncateText(org.description)}
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0 ml-2">
            {getStatusBadge(org.status, org.isActive)}
          </div>
        </div>
        
        {org.notifications > 0 && (
          <div className="flex justify-end mt-2">
            <Badge variant="destructive" className="h-5 text-xs px-1">
              {org.notifications}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <IconComponent className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">{org.stats.departments}</p>
              <p className="text-xs text-gray-500">หน่วยงาน</p>
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

        {/* Footer - User Position */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            {getRoleIcon(org.userRole)}
            <span>ตำแหน่ง: {getRoleText(org.userRole)}</span>
          </div>
          
          {org.isActive && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <ChevronRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};