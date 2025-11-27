// components/OrganizationDashboard/QuickActions.tsx
// OrganizationOverview/QuickActions - Quick action buttons grouped by function

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  FolderTree,
  Calculator,
  BarChart3,
  TrendingUp,
  Activity,
  FileText,
  Users,
  Building2,
  Settings,
  Building,
} from "lucide-react";

export const QuickActions = () => {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;

  const actionGroups = [
    {
      title: "จัดการสินค้า",
      icon: Package,
      iconColor: "text-blue-500",
      actions: [
        {
          icon: Package,
          label: "รายการสินค้าทั้งหมด*",
          onClick: () => router.push(`/${orgSlug}/products`),
        },
        {
          icon: FolderTree,
          label: "หมวดหมู่สินค้า*",
          onClick: () => router.push(`/${orgSlug}/settings/categories`),
        },
        {
          icon: Calculator,
          label: "ตั้งค่าหน่วยนับ*",
          onClick: () => router.push(`/${orgSlug}/settings/units`),
        },
      ],
    },
    {
      title: "การจัดการองค์กร",
      icon: Settings,
      iconColor: "text-purple-500",
      actions: [
        {
          icon: Building2,
          label: "ตั้งค่าองค์กร*",
          onClick: () => router.push(`/${orgSlug}/settings`),
        },
        {
          icon: Building,
          label: "ตั้งค่าหน่วยงาน*",
          onClick: () => router.push(`/${orgSlug}/settings`),
        },
        {
          icon: Users,
          label: "จัดการสมาชิก*",
          onClick: () => router.push(`/${orgSlug}/settings`),
        },
      ],
    },
    {
      title: "รายงานและสถิติ",
      icon: BarChart3,
      iconColor: "text-green-500",
      actions: [
        {
          icon: TrendingUp,
          label: "รายงานสต็อก",
          onClick: () => console.log("Stock reports"),
        },
        {
          icon: Activity,
          label: "รายงานการเคลื่อนไหวสินค้า",
          onClick: () => console.log("Movement reports"),
        },
        {
          icon: FileText,
          label: "รายงานการเบิกจ่าย*",
          onClick: () => router.push(`/${orgSlug}/transfers`),
        },
        {
          icon: FileText,
          label: "รายงานกิจกรรม",
          onClick: () => console.log("Activity reports"),
        },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {actionGroups.map((group, groupIndex) => {
        const GroupIcon = group.icon;
        return (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GroupIcon className={`w-5 h-5 ${group.iconColor}`} />
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {group.actions.map((action, actionIndex) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={actionIndex}
                      className="w-full justify-start"
                      variant="outline"
                      onClick={action.onClick}
                    >
                      <ActionIcon className="w-4 h-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
