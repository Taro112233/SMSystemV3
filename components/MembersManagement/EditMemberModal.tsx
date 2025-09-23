// components/MembersManagement/EditMemberModal.tsx
// MembersManagement/EditMemberModal - Modal for editing member details

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Save } from 'lucide-react';
import { toast } from 'sonner';

// Complete Member interface to match main component
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  status: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
  lastActiveAt?: Date | null;
  departmentAccess: string[];
  invitedBy?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  isOwner: boolean;
  avatar?: string | null;
  lastLogin?: Date | null;
  permissions: string[];
  createdBy: string;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (memberId: string, updatedData: any) => void;
}

export const EditMemberModal = ({
  isOpen,
  onClose,
  member,
  onSave
}: EditMemberModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'MEMBER' as 'OWNER' | 'ADMIN' | 'MEMBER',
    departmentAccess: [] as string[]
  });
  
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        phone: member.phone || '',
        role: member.role,
        departmentAccess: [...member.departmentAccess]
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(member.id, formData);
      toast.success('บันทึกข้อมูลสมาชิกแล้ว');
      onClose();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentChange = (deptName: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      departmentAccess: checked
        ? [...prev.departmentAccess, deptName]
        : prev.departmentAccess.filter(d => d !== deptName)
    }));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (!member) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            แก้ไขข้อมูลสมาชิก
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Member Avatar & Username */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.firstName} {member.lastName}</div>
              <div className="text-sm text-gray-500">@{member.username}</div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">ชื่อ</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">นามสกุล</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="081-234-5678"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">บทบาท</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
              disabled={member.role === 'OWNER'} // Can't change owner role
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">สมาชิก</SelectItem>
                <SelectItem value="ADMIN">ผู้จัดการ</SelectItem>
                {member.role === 'OWNER' && (
                  <SelectItem value="OWNER">เจ้าของ</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Department Access */}
          <div className="space-y-2">
            <Label>แผนกที่สามารถเข้าถึง</Label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded">
              {departments.map((dept) => (
                <label key={dept} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={formData.departmentAccess.includes(dept)}
                    onCheckedChange={(checked) => handleDepartmentChange(dept, checked as boolean)}
                  />
                  {dept}
                </label>
              ))}
            </div>
          </div>

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
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                'กำลังบันทึก...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึก
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}