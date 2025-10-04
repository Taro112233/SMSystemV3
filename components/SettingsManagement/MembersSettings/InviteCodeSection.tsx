// FILE: components/SettingsManagement/MembersSettings/InviteCodeSection.tsx
// MembersSettings/InviteCodeSection - WITH UPDATED BADGE COLORS
// ============================================

import React, { useState, useEffect, useCallback } from 'react';  // ✅ เพิ่ม useCallback
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle2, Key, Info, Edit, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { InviteCodeEditModal } from './InviteCodeEditModal';

interface InviteCodeSectionProps {
  organizationSlug: string;
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
}

export const InviteCodeSection = ({
  organizationSlug,
  userRole
}: InviteCodeSectionProps) => {
  const [inviteCode, setInviteCode] = useState('');
  const [inviteEnabled, setInviteEnabled] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const isOwner = userRole === 'OWNER';

  // ✅ ใช้ useCallback เพื่อ memoize function
  const loadInviteCode = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/${organizationSlug}/settings`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setInviteCode(data.organization.inviteCode || '');
        setInviteEnabled(data.organization.inviteEnabled ?? true);
      }
    } catch (error) {
      console.error('Failed to load invite code:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationSlug]);  // ✅ เพิ่ม dependency

  useEffect(() => {
    loadInviteCode();
  }, [loadInviteCode]);  // ✅ ใช้ loadInviteCode แทน organizationSlug

  const handleCopyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      toast.success('คัดลอกรหัสเชิญสำเร็จ');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSaveInviteCode = async () => {  // ✅ ลบ parameters ที่ไม่ได้ใช้
    await loadInviteCode();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* ✅ UPDATED: Status Badge with Colors */}
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-600" />
          <span className="font-medium">รหัสเชิญปัจจุบัน</span>
          {inviteEnabled ? (
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              <CheckCircle className="w-3 h-3 mr-1" />
              เปิดใช้งาน
            </Badge>
          ) : (
            <Badge className="bg-red-500 hover:bg-red-600 text-white">
              <XCircle className="w-3 h-3 mr-1" />
              ปิดใช้งาน
            </Badge>
          )}
        </div>

        {/* Invite Code Display */}
        {inviteCode ? (
          <div className="flex items-center gap-2">
            <Input
              value={inviteCode}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyInviteCode}
            >
              {copiedCode ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            {isOwner && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              ยังไม่มีรหัสเชิญ {isOwner && 'คลิกปุ่มด้านล่างเพื่อสร้างรหัสใหม่'}
            </AlertDescription>
          </Alert>
        )}

        {/* Create Button for no code */}
        {!inviteCode && isOwner && (
          <Button
            onClick={() => setShowEditModal(true)}
            className="w-full"
          >
            <Key className="w-4 h-4 mr-2" />
            สร้างรหัสเชิญ
          </Button>
        )}

        {/* Info */}
        <p className="text-sm text-gray-600">
          รหัสเชิญใช้สำหรับเชิญสมาชิกใหม่เข้าร่วมองค์กร 
          {isOwner ? ' คุณสามารถแก้ไขรหัสหรือปิดใช้งานได้' : ' ติดต่อเจ้าขององค์กรเพื่อแก้ไขรหัส'}
        </p>
      </div>

      {/* Edit Modal */}
      {isOwner && (
        <InviteCodeEditModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          organizationSlug={organizationSlug}
          currentCode={inviteCode}
          currentEnabled={inviteEnabled}
          onSave={handleSaveInviteCode}  // ✅ ส่ง function ที่ไม่รับ parameters
        />
      )}
    </>
  );
};