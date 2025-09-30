// FILE: components/SettingsManagement/MembersSettings/InviteCodeSection.tsx
// MembersSettings/InviteCodeSection - Generate invite code UI
// ============================================

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle2, RefreshCw, Key, Info } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isOwner = userRole === 'OWNER';

  useEffect(() => {
    loadInviteCode();
  }, [organizationSlug]);

  const loadInviteCode = async () => {
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
  };

  const handleCopyInviteCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      toast.success('คัดลอกรหัสเชิญสำเร็จ');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleGenerateNewCode = async () => {
    if (!isOwner) {
      toast.error('เฉพาะ OWNER เท่านั้นที่สามารถสร้างรหัสเชิญใหม่ได้');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/${organizationSlug}/settings/generate-invite-code`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }

      const data = await response.json();
      
      if (data.success) {
        setInviteCode(data.inviteCode);
        toast.success('สร้างรหัสเชิญใหม่สำเร็จ', {
          description: `รหัสใหม่: ${data.inviteCode}`
        });
      }
    } catch (error) {
      toast.error('ไม่สามารถสร้างรหัสเชิญใหม่ได้');
      console.error('Generate invite code failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Key className="w-4 h-4 text-gray-600" />
        <span className="font-medium">รหัสเชิญปัจจุบัน</span>
        {inviteEnabled ? (
          <Badge variant="default">เปิดใช้งาน</Badge>
        ) : (
          <Badge variant="secondary">ปิดใช้งาน</Badge>
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
              onClick={handleGenerateNewCode}
              disabled={isGenerating}
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
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

      {/* Generate Button for no code */}
      {!inviteCode && isOwner && (
        <Button
          onClick={handleGenerateNewCode}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              กำลังสร้างรหัส...
            </>
          ) : (
            <>
              <Key className="w-4 h-4 mr-2" />
              สร้างรหัสเชิญ
            </>
          )}
        </Button>
      )}

      {/* Info */}
      <p className="text-sm text-gray-600">
        รหัสเชิญใช้สำหรับเชิญสมาชิกใหม่เข้าร่วมองค์กร 
        {isOwner ? ' คุณสามารถสร้างรหัสใหม่ได้ตลอดเวลา' : ' ติดต่อเจ้าขององค์กรเพื่อสร้างรหัสใหม่'}
      </p>
    </div>
  );
};