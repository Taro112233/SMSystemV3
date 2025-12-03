// components/DepartmentDashboard/DepartmentActions.tsx
// DepartmentView/DepartmentActions - Department management action buttons

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Eye,
  Calendar,
  TrendingUp,
  FileText,
  ShoppingCart,
  FileCheck,
  Package,
  PlaneTakeoff,
} from "lucide-react";

export const DepartmentActions = () => {
  const params = useParams();
  const router = useRouter();

  const orgSlug = params.orgSlug as string;
  const deptSlug = params.deptSlug as string;

  const actionGroups = [
    {
      title: "การจัดการสต็อก",
      icon: ClipboardList,
      actions: [
        {
          icon: Eye,
          label: "รายการสต็อกสินค้า*",
          onClick: () => router.push(`/${orgSlug}/${deptSlug}/stocks`),
        },
        {
          icon: Calendar,
          label: "นับสต็อกสินค้า",
          onClick: () => console.log("Expiring items"),
        },
      ],
    },
    {
      title: "การเบิก-จ่าย",
      icon: TrendingUp,
      actions: [
        {
          icon: FileText,
          label: "สร้างใบเบิก*",
          onClick: () =>
            router.push(`/${orgSlug}/${deptSlug}/transfers/create`),
        },
        {
          icon: PlaneTakeoff,
          label: "จัดการใบเบิก*",
          onClick: () => router.push(`/${orgSlug}/${deptSlug}/transfers`),
        },
      ],
    },
    {
      title: "ระบบงานจัดซื้อ (Mockup)",
      icon: ShoppingCart,
      actions: [
        {
          icon: FileCheck,
          label: "ใบขอซื้อ",
          onClick: () => console.log("Purchase requests"),
        },
        {
          icon: Package,
          label: "ใบสั่งซื้อ",
          onClick: () => console.log("Purchase orders"),
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
                <GroupIcon className="w-5 h-5" />
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