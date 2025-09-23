// components/MembersManagement/EditMemberModal.tsx
// MembersManagement/EditMemberModal - Modal for editing member details

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Edit, 
  User, 
  Mail, 
  Phone, 
  Crown, 
  Shield, 
  AlertTriangle,
  Save,
  Calendar
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Member } from './index';

interface EditMemberModalProps {
  isOpen: boolean;
  member: Member;
  onClose: () => void;
  onSave: (memberData: Partial<Member>) => void;
  currentUserRole: 'MEMBER' | 'ADMIN' | 'OWNER';
}

export const EditMemberModal = ({ 
  isOpen, 
  member, 
  onClose, 
  onSave, 
  currentUserRole 
}: EditMemberModalProps) => {
  const [firstName, setFirstName] = useState(member.firstName);
  const [lastName, setLastName] = useState(member.lastName);
  const [email, setEmail] = useState(member.email);
  const [phone, setPhone] = useState(member.phone || '');
  const [role, setRole] = useState(member.role);
  const [isActive, setIsActive] = useState(member.isActive);
  const [status, setStatus] = useState(member.status);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Reset form when member changes
    setFirstName(member.firstName);
    setLastName(member.lastName);
    setEmail(member.email);
    setPhone(member.phone || '');
    setRole(member.role);
    setIsActive(member.isActive);
    setStatus(member.status);
    setErrors({});
  }, [member]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'กรุณากรอกชื่อ';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'กรุณากรอกนามสกุล';
    }

    if (!email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    if (phone && phone.length > 0 && phone.length < 10) {
      newErrors.phone = 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const updateData: Partial<Member> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        isActive,
        status,
      };

      // Only allow role changes if current user has permission
      if (canChangeRole()) {
        updateData.role = role;
      }

      await onSave(updateData);
    } catch (error) {
      console.error('Update member error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canChangeRole = () => {
    // Only OWNER can change roles, and ADMIN can demote other members (not owners)
    if (currentUserRole === 'OWNER') return true;
    if (currentUserRole === 'ADMIN' && member.role !== 'OWNER') return true;
    return false;
  };

  const canChangeStatus = () => {
    // ADMIN and OWNER can change status, but ADMIN cannot suspend owners
    if (currentUserRole === 'OWNER') return true;
    if (currentUserRole === 'ADMIN' && member.role !== 'OWNER') return true;
    return false;
  };

  const getRoleInfo = (roleType: string) => {
    switch (roleType) {
      case 'OWNER':
        return {
          icon: Crown,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          title: 'เจ้าขององค์กร'
        };
      case 'ADMIN':
        return {
          icon: Shield,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          title: 'ผู้ดูแลระบบ'
        };
      default:
        return {
          icon: User,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          title: 'สมาชิกทั่วไป'
        };
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            แก้ไขข้อมูลสมาชิก
          </DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลส่วนตัวและสิทธิ์การใช้งานของสมาชิก
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Member Info Card */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {getInitials(member.firstName, member.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">@{member.username}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    เข้าร่วมเมื่อ {formatDate(member.joinedAt)}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ข้อมูลส่วนตัว</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={errors.firstName ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={errors.lastName ? 'border-red-500' : ''}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
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

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="08x-xxx-xxxx"
                    disabled={isLoading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role and Permissions */}
          {canChangeRole() && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">บทบาทและสิทธิ์</CardTitle>
                <CardDescription>
                  กำหนดบทบาทและสิทธิ์การเข้าถึงในองค์กร
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>บทบาท</Label>
                  <Select 
                    value={role} 
                    onValueChange={(value: 'MEMBER' | 'ADMIN' | 'OWNER') => setRole(value)}
                  >
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
                      {currentUserRole === 'OWNER' && (
                        <SelectItem value="OWNER">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-yellow-600" />
                            เจ้าขององค์กร
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  {/* Current Role Display */}
                  <div className={`p-3 rounded-lg border ${getRoleInfo(role).bgColor}`}>
                    <div className={`flex items-center gap-2 ${getRoleInfo(role).color} text-sm font-medium`}>
                      {React.createElement(getRoleInfo(role).icon, { className: "w-4 h-4" })}
                      {getRoleInfo(role).title}
                    </div>
                  </div>
                </div>

                {role === 'OWNER' && member.role !== 'OWNER' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>คำเตือน:</strong> การเปลี่ยนเป็น "เจ้าขององค์กร" จะให้สิทธิ์เต็มในการจัดการองค์กร 
                      รวมถึงการลบองค์กรและจัดการผู้ใช้ทุกคน
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Account Status */}
          {canChangeStatus() && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">สถานะบัญชี</CardTitle>
                <CardDescription>
                  จัดการสถานะการใช้งานและการเข้าถึงระบบ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>เปิดใช้งานบัญชี</Label>
                    <p className="text-sm text-gray-500">
                      เมื่อปิดการใช้งาน สมาชิกจะไม่สามารถเข้าสู่ระบบได้
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>สถานะบัญชี</Label>
                  <Select 
                    value={status} 
                    onValueChange={(value: 'ACTIVE' | 'PENDING' | 'SUSPENDED') => setStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          ใช้งานได้
                        </Badge>
                      </SelectItem>
                      <SelectItem value="PENDING">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          รออนุมัติ
                        </Badge>
                      </SelectItem>
                      <SelectItem value="SUSPENDED">
                        <Badge variant="destructive">
                          ระงับการใช้งาน
                        </Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isActive && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      บัญชีนี้จะถูกปิดการใช้งาน สมาชิกจะไม่สามารถเข้าสู่ระบบได้
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Permission Summary (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">สิทธิ์การใช้งาน</CardTitle>
              <CardDescription>
                สิทธิ์ที่จะได้รับตามบทบาทที่กำหนด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {role === 'OWNER' && (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      จัดการองค์กรและตั้งค่า
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      จัดการสมาชิกทุกคน
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      สร้างและลบแผนก
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      จัดการสินค้าและสต็อก
                    </div>
                  </>
                )}
                
                {role === 'ADMIN' && (
                  <>
                    <div className="flex items-center gap-2 text-purple-600">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      จัดการสมาชิกทั่วไป
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      สร้างและแก้ไขแผนก
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      จัดการสินค้าและหมวดหมู่
                    </div>
                    <div className="flex items-center gap-2 text-purple-600">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      อนุมัติการเบิกจ่าย
                    </div>
                  </>
                )}

                {role === 'MEMBER' && (
                  <>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      ดูข้อมูลสต็อกทุกแผนก
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      เบิกจ่ายสินค้า
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      ปรับปรุงสต็อก
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      รับสินค้าที่เบิก
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

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
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการเปลี่ยนแปลง
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};