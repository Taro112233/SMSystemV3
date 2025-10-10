// FILE: components/ProfileSettings/ProfileInfo.tsx
// ProfileSettings/ProfileInfo - Display current profile information
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, Calendar, Edit, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface UserProfile {
  id: string;
  email: string | null;
  username: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileInfoProps {
  user: UserProfile;
  onEdit: () => void;
}

export const ProfileInfo = ({ user, onEdit }: ProfileInfoProps) => {
  const getUserInitials = () => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusBadge = () => {
    const statusMap = {
      ACTIVE: { label: 'ใช้งาน', color: 'bg-green-500' },
      PENDING: { label: 'รอยืนยัน', color: 'bg-yellow-500' },
      SUSPENDED: { label: 'ระงับการใช้งาน', color: 'bg-red-500' },
      INACTIVE: { label: 'ไม่ใช้งาน', color: 'bg-gray-500' },
    };
    
    const status = statusMap[user.status as keyof typeof statusMap] || statusMap.ACTIVE;
    
    return (
      <Badge className={`${status.color} hover:${status.color} text-white`}>
        {status.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            แก้ไขข้อมูล
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-gray-600 font-mono text-sm mb-2">@{user.username}</p>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {user.emailVerified ? (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  อีเมลยืนยันแล้ว
                </Badge>
              ) : (
                <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
                  <XCircle className="w-3 h-3 mr-1" />
                  ยังไม่ยืนยันอีเมล
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <InfoItem 
            icon={User} 
            label="ชื่อผู้ใช้" 
            value={user.username}
          />
          <InfoItem 
            icon={Mail} 
            label="อีเมล" 
            value={user.email || '-'}
          />
          <InfoItem 
            icon={Phone} 
            label="เบอร์โทรศัพท์" 
            value={user.phone || '-'}
          />
        </div>

        {/* Account Information */}
        <div className="space-y-4 pt-4 border-t">
          <InfoItem 
            icon={Calendar} 
            label="วันที่สร้างบัญชี" 
            value={format(new Date(user.createdAt), 'dd MMMM yyyy, HH:mm', { locale: th })}
          />
          {user.lastLogin && (
            <InfoItem 
              icon={Calendar} 
              label="เข้าสู่ระบบล่าสุด" 
              value={format(new Date(user.lastLogin), 'dd MMMM yyyy, HH:mm', { locale: th })}
            />
          )}
          <InfoItem 
            icon={Calendar} 
            label="อัพเดทล่าสุด" 
            value={format(new Date(user.updatedAt), 'dd MMMM yyyy, HH:mm', { locale: th })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for info items
interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
    <div className="flex-1">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  </div>
);