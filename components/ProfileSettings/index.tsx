// FILE: components/ProfileSettings/index.tsx
// ProfileSettings - Main profile management container
// ============================================

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock } from 'lucide-react';
import { toast } from 'sonner';

import { ProfileInfo } from './ProfileInfo';
import { ProfileForm } from './ProfileForm';
import { PasswordChange } from './PasswordChange';
import { useAuth } from '@/app/utils/auth';

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

export const ProfileSettings = () => {
  const { refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setUserProfile(data.user);
    } catch (error) {
      console.error('Load profile error:', error);
      toast.error('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (formData: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setUserProfile(data.user);
      setIsEditing(false);
      
      // Refresh auth context
      await refreshUser();
      
      toast.success('อัพเดทโปรไฟล์สำเร็จ');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('ไม่สามารถอัพเดทโปรไฟล์ได้');
      throw error;
    }
  };

  const handlePasswordChange = async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      setIsChangingPassword(false);
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ', {
        description: 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง'
      });

      // Logout after password change
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('ไม่สามารถเปลี่ยนรหัสผ่านได้');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12 text-gray-600">
        ไม่พบข้อมูลโปรไฟล์
      </div>
    );
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>ข้อมูลส่วนตัว</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span>ความปลอดภัย</span>
        </TabsTrigger>
      </TabsList>

      {/* Profile Tab */}
      <TabsContent value="profile" className="space-y-6">
        {!isEditing ? (
          <ProfileInfo
            user={userProfile}
            onEdit={() => setIsEditing(true)}
          />
        ) : (
          <ProfileForm
            user={userProfile}
            onSave={handleProfileUpdate}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </TabsContent>

      {/* Security Tab */}
      <TabsContent value="security" className="space-y-6">
        <PasswordChange
          isChanging={isChangingPassword}
          onPasswordChange={handlePasswordChange}
          onToggle={() => setIsChangingPassword(!isChangingPassword)}
        />
      </TabsContent>
    </Tabs>
  );
};