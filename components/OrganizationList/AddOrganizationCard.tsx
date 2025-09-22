// app/dashboard/components/AddOrganizationCard.tsx
// AddOrganizationCard - Card for creating or joining organizations

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus, Building2 } from 'lucide-react';
import { CreateOrganizationModal } from './CreateOrganizationModal';
import { JoinOrganizationModal } from './JoinOrganizationModal';

export const AddOrganizationCard = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  const handleCreateOrg = () => {
    setCreateModalOpen(true);
  };

  const handleJoinOrg = () => {
    setJoinModalOpen(true);
  };

  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200">
      <CardHeader className="text-center pb-3">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <Plus className="w-6 h-6 text-gray-400" />
        </div>
        <CardTitle className="text-base text-gray-700">เพิ่มองค์กร</CardTitle>
        <p className="text-sm text-gray-500">สร้างใหม่หรือเข้าร่วมองค์กรที่มีอยู่</p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={handleCreateOrg}
          >
            <Building2 className="w-4 h-4 mr-3" />
            <div className="text-left">
              <div className="text-sm font-medium">สร้างองค์กรใหม่</div>
              <div className="text-xs text-gray-500">เป็นเจ้าของและจัดการเอง</div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start h-12"
            onClick={handleJoinOrg}
          >
            <UserPlus className="w-4 h-4 mr-3" />
            <div className="text-left">
              <div className="text-sm font-medium">เข้าร่วมองค์กร</div>
              <div className="text-xs text-gray-500">ใช้รหัสเชิญหรือขอเข้าร่วม</div>
            </div>
          </Button>
        </div>
      </CardContent>

      <CreateOrganizationModal 
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
      
      <JoinOrganizationModal 
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
      />
    </Card>
  );
};