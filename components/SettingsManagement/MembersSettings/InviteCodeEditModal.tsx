// FILE: components/SettingsManagement/MembersSettings/InviteCodeEditModal.tsx
// MembersSettings/InviteCodeEditModal - Edit Modal with Frontend Random Code Generation
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

// ✅ NEW: Frontend-only random code generator (ไม่เรียก API)
function generateRandomInviteCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  
  // Use crypto.getRandomValues for secure random generation
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  
  return result;
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

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setInviteCode(currentCode);
      setInviteEnabled(currentEnabled);
    }
  }, [open, currentCode, currentEnabled]);

  // ✅ UPDATED: สุ่มรหัสใหม่ใน Frontend เท่านั้น (ไม่เรียก API)
  const handleGenerateNewCode = () => {
    const newCode = generateRandomInviteCode(8);
    setInviteCode(newCode);
    toast.success('สุ่มรหัสใหม่สำเร็จ', {
      description: `รหัสใหม่: ${newCode} (ยังไม่ได้บันทึก)`
    });
  };

  // ✅ UPDATED: บันทึกรหัสเชิญไปยัง database (เมื่อผู้ใช้กดปุ่มบันทึก)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate invite code
      if (!inviteCode.trim()) {
        toast.error('กรุณาระบุรหัสเชิญ');
        return;
      }

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
          {/* Invite Code Input - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="inviteCode">รหัสเชิญ</Label>
            <div className="flex items-center gap-2">
              <Input
                id="inviteCode"
                value={inviteCode}
                readOnly
                className="font-mono bg-gray-50"
                placeholder="คลิกปุ่มเพื่อสุ่มรหัส"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGenerateNewCode}
                disabled={isSaving}
                title="สุ่มรหัสใหม่"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              คลิกปุ่ม <RefreshCw className="w-3 h-3 inline" /> เพื่อสุ่มรหัสใหม่ (ยังไม่บันทึก)
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