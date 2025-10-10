// FILE: components/ProfileSettings/PasswordChange.tsx
// ProfileSettings/PasswordChange - Password change form
// ============================================

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface PasswordChangeProps {
  isChanging: boolean;
  onPasswordChange: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
  onToggle: () => void;
}

export const PasswordChange = ({ isChanging, onPasswordChange, onToggle }: PasswordChangeProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasLetter: false,
    hasNumber: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Check password strength for new password
    if (name === 'newPassword') {
      setPasswordStrength({
        hasMinLength: value.length >= 6,
        hasLetter: /[A-Za-z]/.test(value),
        hasNumber: /[0-9]/.test(value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      alert('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    // Validate password strength
    if (!passwordStrength.hasMinLength || !passwordStrength.hasLetter || !passwordStrength.hasNumber) {
      alert('รหัสผ่านไม่ปลอดภัยเพียงพอ');
      return;
    }

    setIsSubmitting(true);
    try {
      await onPasswordChange({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    onToggle();
  };

  if (!isChanging) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            รหัสผ่าน
          </CardTitle>
          <CardDescription>
            เปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onToggle}>
            เปลี่ยนรหัสผ่าน
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
        <CardDescription>
          กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน *</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={handleInputChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">รหัสผ่านใหม่ *</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={handleInputChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password Strength Indicators */}
          {formData.newPassword && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">ความแข็งแรงของรหัสผ่าน:</p>
              <div className="space-y-1">
                <PasswordRequirement 
                  met={passwordStrength.hasMinLength} 
                  text="อย่างน้อย 6 ตัวอักษร" 
                />
                <PasswordRequirement 
                  met={passwordStrength.hasLetter} 
                  text="มีตัวอักษร (A-Z, a-z)" 
                />
                <PasswordRequirement 
                  met={passwordStrength.hasNumber} 
                  text="มีตัวเลข (0-9)" 
                />
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่ *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-sm text-red-600">รหัสผ่านไม่ตรงกัน</p>
            )}
          </div>

          {/* Warning Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              หลังจากเปลี่ยนรหัสผ่าน คุณจะต้องเข้าสู่ระบบใหม่อีกครั้ง
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formData.newPassword !== formData.confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Lock className="w-4 h-4 mr-2 animate-spin" />
                  กำลังเปลี่ยนรหัสผ่าน...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  เปลี่ยนรหัสผ่าน
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Helper component for password requirements
interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

const PasswordRequirement = ({ met, text }: PasswordRequirementProps) => (
  <div className="flex items-center gap-2 text-sm">
    {met ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    )}
    <span className={met ? 'text-green-600' : 'text-gray-600'}>{text}</span>
  </div>
);