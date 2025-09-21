// app/dashboard/components/JoinOrganizationModal.tsx
// JoinOrganizationModal - Modal for joining by invite code only

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface JoinOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JoinByCodeForm {
  inviteCode: string;
}

export const JoinOrganizationModal = ({ open, onOpenChange }: JoinOrganizationModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Join by invite code only
  const [codeForm, setCodeForm] = useState<JoinByCodeForm>({
    inviteCode: ''
  });

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeForm({ inviteCode: e.target.value });
    if (error) setError('');
  };

  const validateCodeForm = (): boolean => {
    if (!codeForm.inviteCode.trim()) {
      setError('กรุณากรอกรหัสเชิญ');
      return false;
    }
    
    if (codeForm.inviteCode.length < 6) {
      setError('รหัสเชิญต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }

    return true;
  };

  const handleJoinByCode = async () => {
    if (!validateCodeForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/organizations/join-by-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteCode: codeForm.inviteCode.trim() }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถเข้าร่วมองค์กรได้');
      }

      toast.success('เข้าร่วมองค์กรสำเร็จ!', {
        description: `ยินดีต้อนรับเข้าสู่ ${data.organization.name}`
      });

      onOpenChange(false);
      
      // Refresh page to show new organization
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Join by code error:', error);
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      setError(errorMsg);
      
      toast.error('เข้าร่วมองค์กรไม่สำเร็จ', {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCodeForm({ inviteCode: '' });
      setError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            เข้าร่วมองค์กร
          </DialogTitle>
          <DialogDescription>
            กรอกรหัสเชิญที่ได้รับจากผู้ดูแลองค์กรเพื่อเข้าร่วม
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">รหัสเชิญ *</Label>
            <Input
              id="invite-code"
              placeholder="เช่น ABC123XYZ"
              value={codeForm.inviteCode}
              onChange={handleCodeChange}
              disabled={isLoading}
              className="font-mono text-center text-lg h-12 m-2"
            />
            <p className="text-xs text-gray-500 text-center">
              กรอกรหัสเชิญที่ได้รับจากผู้ดูแลองค์กร (อย่างน้อย 6 ตัวอักษร)
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleJoinByCode}
              disabled={isLoading || !codeForm.inviteCode.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังเข้าร่วม...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  เข้าร่วมองค์กร
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};