// components/OrganizationDashboard/OrganizationPerformance.tsx
// OrganizationOverview/OrganizationPerformance - Performance metrics and charts

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// ✅ FIXED: Make stats optional to match index.tsx
interface OrganizationPerformanceProps {
  organization: {
    stats?: {
      totalValue?: string;
    };
  };
}

export const OrganizationPerformance = ({ organization }: OrganizationPerformanceProps) => {
  // ✅ Safe access with defaults
  const totalValue = organization.stats?.totalValue || '0';

  const performanceMetrics = [
    {
      label: 'อัตราการใช้สต็อก',
      value: 87,
      color: 'text-green-600'
    },
    {
      label: 'ความถูกต้องสต็อก',
      value: 95,
      color: 'text-blue-600'
    },
    {
      label: 'ประสิทธิภาพการเบิกจ่าย',
      value: 92,
      color: 'text-purple-600'
    }
  ];

  const summaryCards = [
    {
      title: 'มูลค่าสต็อกรวม',
      value: totalValue,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'การเบิกจ่ายวันนี้',
      value: '156',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'ความพึงพอใจ',
      value: '98.2%',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'วันเฉลี่ยการเบิก',
      value: '2.3',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>ประสิทธิภาพองค์กร</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {performanceMetrics.map((metric, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                <span className={`text-sm font-bold ${metric.color}`}>{metric.value}%</span>
              </div>
              <Progress value={metric.value} className="h-2" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          {summaryCards.map((card, index) => (
            <div key={index} className={`p-4 ${card.bgColor} rounded-lg`}>
              <div className={`text-2xl font-bold ${card.textColor}`}>{card.value}</div>
              <div className="text-sm text-gray-600">{card.title}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};