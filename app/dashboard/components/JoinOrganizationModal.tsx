// app/dashboard/components/JoinOrganizationModal.tsx
// JoinOrganizationModal - Modal for joining existing organization

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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Loader2, AlertTriangle, Search, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface JoinOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JoinByCodeForm {
  inviteCode: string;
}

interface JoinByRequestForm {
  organizationSlug: string;
  message: string;
}

export const JoinOrganizationModal = ({ open, onOpenChange }: JoinOrganizationModalProps) => {
  const [activeTab, setActiveTab] = useState('code');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Join by invite code
  const [codeForm, setCodeForm] = useState<JoinByCodeForm>({
    inviteCode: ''
  });

  // Join by request
  const [requestForm, setRequestForm] = useState<JoinByRequestForm>({
    organizationSlug: '',
    message: ''
  });

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCodeForm({ inviteCode: e.target.value });
    if (error) setError('');
  };

  const handleRequestChange = (field: keyof JoinByRequestForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRequestForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
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

  const validateRequestForm = (): boolean => {
    if (!requestForm.organizationSlug.trim()) {
      setError('กรุณากรอกชื่อหรือ URL ขององค์กร');
      return false;
    }
    
    if (!requestForm.message.trim()) {
      setError('กรุณาเขียนข้อความขอเข้าร่วม');
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

  const handleJoinByRequest = async () => {
    if (!validateRequestForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/organizations/join-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationSlug: requestForm.organizationSlug.trim(),
          message: requestForm.message.trim()
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถส่งคำขอได้');
      }

      toast.success('ส่งคำขอเรียบร้อย!', {
        description: 'รอผู้ดูแลองค์กรอนุมัติคำขอของคุณ'
      });

      onOpenChange(false);

    } catch (error) {
      console.error('Join request error:', error);
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      setError(errorMsg);
      
      toast.error('ส่งคำขอไม่สำเร็จ', {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setCodeForm({ inviteCode: '' });
      setRequestForm({ organizationSlug: '', message: '' });
      setError('');
      setActiveTab('code');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            เข้าร่วมองค์กร
          </DialogTitle>
          <DialogDescription>
            เข้าร่วมองค์กรที่มีอยู่แล้วด้วยรหัสเชิญหรือส่งคำขอเข้าร่วม
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">รหัสเชิญ</TabsTrigger>
            <TabsTrigger value="request">ขอเข้าร่วม</TabsTrigger>
          </TabsList>

          {/* Join by Invite Code */}
          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="invite-code">รหัสเชิญ *</Label>
              <Input
                id="invite-code"
                placeholder="เช่น ABC123XYZ"
                value={codeForm.inviteCode}
                onChange={handleCodeChange}
                disabled={isLoading}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                กรอกรหัสเชิญที่ได้รับจากผู้ดูแลองค์กร
              </p>
            </div>

            {error && activeTab === 'code' && (
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
                disabled={isLoading}
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
          </TabsContent>

          {/* Join by Request */}
          <TabsContent value="request" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="org-search">ชื่อองค์กรหรือ URL *</Label>
              <Input
                id="org-search"
                placeholder="เช่น siriraj-hospital หรือ โรงพยาบาลศิริราช"
                value={requestForm.organizationSlug}
                onChange={handleRequestChange('organizationSlug')}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                ค้นหาด้วยชื่อองค์กรหรือ URL slug
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="join-message">ข้อความขอเข้าร่วม *</Label>
              <Textarea
                id="join-message"
                placeholder="เช่น สวัสดีครับ ผมเป็นเภสัชกรที่โรงพยาบาลศิริราช อยากขอเข้าร่วมระบบจัดการสต็อกยาครับ"
                value={requestForm.message}
                onChange={handleRequestChange('message')}
                disabled={isLoading}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                อธิบายว่าทำไมต้องการเข้าร่วมองค์กรนี้
              </p>
            </div>

            {error && activeTab === 'request' && (
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
                onClick={handleJoinByRequest}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังส่งคำขอ...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    ส่งคำขอ
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};