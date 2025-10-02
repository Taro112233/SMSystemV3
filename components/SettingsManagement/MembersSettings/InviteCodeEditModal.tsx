// FILE: components/SettingsManagement/MembersSettings/InviteCodeEditModal.tsx
// MembersSettings/InviteCodeEditModal - Edit Modal with Form
// ============================================

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface InviteCodeEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationSlug: string;
  currentCode: string;
  currentEnabled: boolean;
  onSave: (newCode: string, newEnabled: boolean) => Promise<void>;
}

export const InviteCodeEditModal = ({
  open,
  onOpenChange,
  organizationSlug,
  currentCode,
  currentEnabled,
  onSave,
}: InviteCodeEditModalProps) => {
  const [inviteCode, setInviteCode] = useState(currentCode);
  const [inviteEnabled, setInviteEnabled] = useState(currentEnabled);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setInviteCode(currentCode);
      setInviteEnabled(currentEnabled);
    }
  }, [open, currentCode, currentEnabled]);

  const handleGenerateNewCode = async () => {
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
        toast.success('สุ่มรหัสใหม่สำเร็จ', {
          description: `รหัสใหม่: ${data.inviteCode}`
        });
      }
    } catch (error) {
      toast.error('ไม่สามารถสุ่มรหัสได้');
      console.error('Generate invite code failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update organization settings
      const response = await fetch(`/api/${organizationSlug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          inviteCode,
          inviteEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update invite code settings');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('บันทึกการตั้งค่ารหัสเชิญสำเร็จ');
        await onSave(inviteCode, inviteEnabled);
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('ไม่สามารถบันทึกการตั้งค่าได้');
      console.error('Save invite code settings failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขรหัสเชิญเข้าองค์กร</DialogTitle>
          <DialogDescription>
            สร้างรหัสใหม่หรือแก้ไขการตั้งค่ารหัสเชิญ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Invite Code Input */}
          <div className="space-y-2">
            <Label htmlFor="inviteCode">รหัสเชิญ</Label>
            <div className="flex items-center gap-2">
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="font-mono"
                placeholder="ระบุรหัสเชิญ"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateNewCode}
                disabled={isGenerating || isSaving}
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              คลิกปุ่ม <RefreshCw className="w-3 h-3 inline" /> เพื่อสุ่มรหัสใหม่
            </p>
          </div>

          {/* Enable/Disable Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <div className="font-medium">เปิดใช้งานรหัสเชิญ</div>
              <div className="text-sm text-gray-600">
                อนุญาตให้สมาชิกใหม่เข้าร่วมผ่านรหัสเชิญ
              </div>
            </div>
            <Switch
              checked={inviteEnabled}
              onCheckedChange={setInviteEnabled}
              disabled={isSaving}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              ยกเลิก
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !inviteCode.trim()}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการเปลี่ยนแปลง
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};