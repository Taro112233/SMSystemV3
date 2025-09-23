// components/OrganizationDashboard/RecentActivity.tsx
// OrganizationOverview/RecentActivity - Activity feed with status indicators

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Dot } from 'lucide-react';

interface RecentActivityProps {
  activities: Array<{
    id: number;
    type: string;
    icon: any;
    title: string;
    description: string;
    time: string;
    status: string;
    user: string;
  }>;
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'warning':
        return 'bg-orange-100 text-orange-600';
      case 'completed':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>กิจกรรมล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            const statusColor = getStatusColor(activity.status);
            
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-8 h-8 ${statusColor} rounded-full flex items-center justify-center`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{activity.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
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