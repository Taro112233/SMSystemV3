// components/OrganizationDashboard/DepartmentOverview.tsx - With Empty State
// OrganizationOverview/DepartmentOverview - Grid of departments with stats and click handler

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Building, Plus } from 'lucide-react';
import { 
  Hospital, Warehouse, TestTube, Pill,
  Activity, Stethoscope, Users, Package, Shield,
  Circle, Square, Triangle, Star, Heart, Crown,
  Eye, Settings, Folder, Tag, Box
} from 'lucide-react';

interface DepartmentOverviewProps {
  departments: any[];
  onSelectDepartment: (dept: any) => void;
}

export const DepartmentOverview = ({ 
  departments, 
  onSelectDepartment 
}: DepartmentOverviewProps) => {
  
  // ✅ FIXED: Safe icon component resolver
  const getIconComponent = (iconType: any) => {
    // Handle various icon formats that might come from API
    let iconString = '';
    
    if (typeof iconType === 'string') {
      iconString = iconType;
    } else if (typeof iconType === 'function') {
      // Already a React component
      return iconType;
    } else if (iconType?.name) {
      iconString = iconType.name;
    } else if (iconType?.type?.name) {
      iconString = iconType.type.name;
    } else {
      console.warn('Unknown icon type:', iconType);
      return Building;
    }
    
    // Icon mapping
    const iconMap: Record<string, any> = {
      'BUILDING': Building,
      'HOSPITAL': Hospital,
      'PHARMACY': Pill,
      'WAREHOUSE': Warehouse,
      'LABORATORY': TestTube,
      'PILL': Pill,
      'BOTTLE': Package,
      'SYRINGE': Activity,
      'BANDAGE': Shield,
      'STETHOSCOPE': Stethoscope,
      'CROWN': Crown,
      'SHIELD': Shield,
      'PERSON': Users,
      'EYE': Eye,
      'GEAR': Settings,
      'BOX': Box,
      'FOLDER': Folder,
      'TAG': Tag,
      'STAR': Star,
      'HEART': Heart,
      'CIRCLE': Circle,
      'SQUARE': Square,
      'TRIANGLE': Triangle,
    };
    
    return iconMap[iconString.toUpperCase()] || Building;
  };

  // ✅ Safe rendering with error boundaries
  const renderDepartmentIcon = (dept: any) => {
    try {
      const IconComponent = getIconComponent(dept.icon);
      return <IconComponent className="w-5 h-5 text-white" />;
    } catch (error) {
      console.error('Error rendering department icon:', error, dept);
      return <Building className="w-5 h-5 text-white" />;
    }
  };

  // ✅ Empty state for no departments
  if (!departments || !Array.isArray(departments) || departments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            หน่วยงานทั้งหมด
            <Badge variant="secondary">0 หน่วยงาน</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ยังไม่มีหน่วยงาน
            </h3>
            <p className="text-gray-600 mb-4">
              เริ่มต้นการจัดการสต็อกโดยการสร้างหน่วยงานแรกขององค์กร
            </p>
            <Button 
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => console.log('Create department clicked')}
            >
              <Plus className="w-4 h-4 mr-2" />
              สร้างหน่วยงานแรก
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          หน่วยงานทั้งหมด
          <Badge variant="secondary">{departments.length} หน่วยงาน</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {departments.map((dept) => {
            return (
              <div 
                key={dept.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => onSelectDepartment(dept)}
              >
                <div className={`w-10 h-10 ${dept.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                  {renderDepartmentIcon(dept)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">{dept.name}</h3>
                    {dept.notifications > 0 && (
                      <Badge variant="destructive" className="h-5 min-w-5 text-xs px-1">
                        {dept.notifications}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{dept.stockItems || 0} สินค้า</span>
                    <span>{dept.memberCount || 0} คน</span>
                    <span className={(dept.lowStock || 0) > 0 ? 'text-orange-600' : 'text-green-600'}>
                      {(dept.lowStock || 0) > 0 ? `${dept.lowStock} ใกล้หมด` : 'สต็อกปกติ'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};