// components/MembersManagement/InviteMemberModal.tsx
// MembersManagement/InviteMemberModal - Modal for inviting new members

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  User, 
  Crown, 
  Shield, 
  UserPlus,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (memberData: {
    email: string;
    username?: string;
    role: 'MEMBER' | 'ADMIN' | 'OWNER';
    message?: string;
  }) => void;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export const InviteMemberModal = ({ 
  isOpen, 
  onClose, 
  onInvite, 
  organization 
}: InviteMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'ADMIN' | 'OWNER'>('MEMBER');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (username && username.length < 3) {
      newErrors.username = 'Username ต้องมีอย่างน้อย 3 ตัวอักษร';
    }

    if (username && !/^[a-zA-Z0-9._-]+$/.test(username)) {
      newErrors.username = 'Username ใช้ได้เฉพาะ a-z, 0-9, ., _, -';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await onInvite({
        email: email.trim().toLowerCase(),
        username: username.trim() || undefined,
        role,
        message: message.trim() || undefined,
      });

      // Reset form
      setEmail('');
      setUsername('');
      setRole('MEMBER');
      setMessage('');
      setErrors({});
    } catch (error) {
      console.error('Invite error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleInfo = (roleType: string) => {
    switch (roleType) {
      case 'OWNER':
        return {
          icon: Crown,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          title: 'เจ้าขององค์กร',
          description: 'สิทธิ์เต็มทุกอย่าง รวมถึงการจัดการองค์กรและลบองค์กร'
        };
      case 'ADMIN':
        return {
          icon: Shield,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 border-purple-200',
          title: 'ผู้ดูแลระบบ',
          description: 'จัดการสมาชิก แผนก สินค้า และอนุมัติการเบิกจ่าย'
        };
      default:
        return {
          icon: User,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          title: 'สมาชิกทั่วไป',
          description: 'ดูข้อมูล เบิกจ่ายสินค้า และปรับปรุงสต็อก'
        };
    }
  };

  const selectedRoleInfo = getRoleInfo(role);
  const SelectedIcon = selectedRoleInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            เชิญสมาชิกใหม่เข้าร่วม {organization.name}
          </DialogTitle>
          <DialogDescription>
            ส่งคำเชิญให้บุคคลที่ต้องการเข้าร่วมองค์กร พวกเขาจะได้รับอีเมลแจ้งเตือนพร้อมลิงค์ยืนยัน
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              อีเมล *
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username (ไม่บังคับ)
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                placeholder="username (ถ้าไม่ระบุ ผู้ใช้จะตั้งเองได้)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-red-600">{errors.username}</p>
            )}
            <p className="text-xs text-gray-500">
              Username จะใช้สำหรับเข้าสู่ระบบ ถ้าไม่ระบุ ผู้ใช้จะสามารถตั้งเองได้ตอนสมัครสมาชิก
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label>บทบาทในองค์กร *</Label>
            <Select value={role} onValueChange={(value: 'MEMBER' | 'ADMIN' | 'OWNER') => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    สมาชิกทั่วไป
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    ผู้ดูแลระบบ
                  </div>
                </SelectItem>
                <SelectItem value="OWNER">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    เจ้าขององค์กร
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Role Info Card */}
            <Card className={`border-2 ${selectedRoleInfo.bgColor}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-sm ${selectedRoleInfo.color}`}>
                  <SelectedIcon className="w-4 h-4" />
                  {selectedRoleInfo.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription>{selectedRoleInfo.description}</CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Personal Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              ข้อความส่วนตัว (ไม่บังคับ)
            </Label>
            <Textarea
              id="message"
              placeholder="เขียนข้อความต้อนรับหรือคำแนะนำสำหรับสมาชิกใหม่..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isLoading}
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              ข้อความนี้จะปรากฏในอีเมลเชิญ ({message.length}/500 ตัวอักษร)
            </p>
          </div>

          {/* Warning for OWNER role */}
          {role === 'OWNER' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>คำเตือน:</strong> บทบาท "เจ้าขององค์กร" จะมีสิทธิ์เต็มในการจัดการองค์กร 
                รวมถึงการลบองค์กรและจัดการผู้ใช้ทุกคน กรุณาพิจารณาอย่างรอบคอบ
              </AlertDescription>
            </Alert>
          )}

          {/* Success Info */}
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ผู้ที่ได้รับเชิญจะได้รับอีเมลพร้อมลิงค์สำหรับสร้างบัญชีและเข้าร่วมองค์กร 
              คำเชิญจะหมดอายุใน 7 วัน
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  กำลังส่งคำเชิญ...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  ส่งคำเชิญ
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};