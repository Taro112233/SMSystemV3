// components/MembersManagement/InviteMemberModal.tsx
// MembersManagement/InviteMemberModal - Modal for inviting new members

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, UserPlus, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (inviteData: any) => void;
}

export const InviteMemberModal = ({
  isOpen,
  onClose,
  onInvite
}: InviteMemberModalProps) => {
  const [inviteMethod, setInviteMethod] = useState<'email' | 'code'>('email');
  const [formData, setFormData] = useState({
    email: '',
    role: 'MEMBER',
    departments: [] as string[],
    message: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const mockInviteCode = 'ORG-ABC123'; // Mock invite code

  const departments = [
    'คลังยาหลัก',
    'ห้องฉุกเฉิน (ER)', 
    'หอผู้ป่วยใน (IPD)',
    'ผู้ป่วยนอก (OPD)',
    'ห้องผ่าตัด (OR)',
    'ห้องปฏิบัติการ (LAB)',
    'ร้านยา (PHARMACY)',
    'ICU'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (inviteMethod === 'email') {
        onInvite({
          method: 'email',
          email: formData.email,
          role: formData.role,
          departments: formData.departments,
          message: formData.message
        });
        toast.success('ส่งคำเชิญทางอีเมลแล้ว');
      } else {
        toast.success('คัดลอกโค้ดเชิญแล้ว');
      }
      
      onClose();
      setFormData({ email: '', role: 'MEMBER', departments: [], message: '' });
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(mockInviteCode);
    toast.success('คัดลอกโค้ดเชิญแล้ว');
  };

  const handleDepartmentChange = (deptName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      departments: checked
        ? [...prev.departments, deptName]
        : prev.departments.filter(d => d !== deptName)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            เชิญสมาชิกใหม่
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Invite Method Selection */}
          <div className="space-y-3">
            <Label>วิธีการเชิญ</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="inviteMethod"
                  value="email"
                  checked={inviteMethod === 'email'}
                  onChange={(e) => setInviteMethod(e.target.value as 'email' | 'code')}
                />
                <Mail className="w-4 h-4" />
                ส่งอีเมลเชิญ
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="inviteMethod"
                  value="code"
                  checked={inviteMethod === 'code'}
                  onChange={(e) => setInviteMethod(e.target.value as 'email' | 'code')}
                />
                <Copy className="w-4 h-4" />
                โค้ดเชิญ
              </label>
            </div>
          </div>

          {inviteMethod === 'email' ? (
            <>
              {/* Email Invite Form */}
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">บทบาท</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">สมาชิก</SelectItem>
                    <SelectItem value="ADMIN">ผู้จัดการ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>แผนกที่สามารถเข้าถึง</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                  {departments.map((dept) => (
                    <label key={dept} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={formData.departments.includes(dept)}
                        onCheckedChange={(checked) => handleDepartmentChange(dept, checked as boolean)}
                      />
                      {dept}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">ข้อความ (ไม่บังคับ)</Label>
                <Textarea
                  id="message"
                  placeholder="ข้อความเชิญเพิ่มเติม..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={3}
                />
              </div>
            </>
          ) : (
            // Invite Code Display
            <div className="space-y-4 text-center p-4 bg-gray-50 rounded-lg">
              <div>
                <Label>โค้ดเชิญองค์กร</Label>
                <div className="mt-2 p-3 bg-white border rounded-lg">
                  <code className="text-lg font-bold">{mockInviteCode}</code>
                </div>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCopyInviteCode}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                คัดลอกโค้ด
              </Button>
              <p className="text-xs text-gray-600">
                แชร์โค้ดนี้ให้ผู้ที่ต้องการเข้าร่วมองค์กร
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isLoading || (inviteMethod === 'email' && !formData.email)}
              className="flex-1"
            >
              {isLoading ? (
                'กำลังส่ง...'
              ) : (
                inviteMethod === 'email' ? 'ส่งคำเชิญ' : 'สร้างโค้ด'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};