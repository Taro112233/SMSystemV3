// components/OrganizationDashboard/RecentActivity.tsx
// OrganizationOverview/RecentActivity - Real-time activity feed from audit logs

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Dot, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ✅ Activity interface matching transformed audit log format
export interface ActivityItem {
  id: string;
  type: string;
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'info' | 'error';
  user: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

export const RecentActivity = ({ 
  activities = [], 
  isLoading = false 
}: RecentActivityProps) => {
  
  const getStatusColor = (status: string) => {
    const colors = {
      success: 'bg-green-100 text-green-600',
      warning: 'bg-orange-100 text-orange-600',
      info: 'bg-blue-100 text-blue-600',
      error: 'bg-red-100 text-red-600',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>กิจกรรมล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>กิจกรรมล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ยังไม่มีกิจกรรม
            </h3>
            <p className="text-gray-600">
              เมื่อมีการเคลื่อนไหวในระบบ กิจกรรมจะแสดงที่นี่
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Activity list
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>กิจกรรมล่าสุด</CardTitle>
          <span className="text-sm text-gray-500">
            {activities.length} รายการล่าสุด
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            const statusColor = getStatusColor(activity.status);
            
            return (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-8 h-8 ${statusColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{activity.time}</span>
                    <Dot className="w-3 h-3" />
                    <span>{activity.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};