// components/SettingsManagement/OrganizationSettings.tsx
// SettingsManagement/OrganizationSettings - Organization info editor

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  AlertTriangle, 
  Copy, 
  CheckCircle2, 
  RefreshCw,
  Lock,
  Globe,
  Mail,
  Phone,
  Clock,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationSettingsProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    email?: string;
    phone?: string;
    timezone: string;
    inviteCode?: string;
    inviteEnabled?: boolean;
    status: string;
  };
  userRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  onUpdate: (data: any) => Promise<any>;
}

export const OrganizationSettings = ({ 
  organization, 
  userRole, 
  onUpdate 
}: OrganizationSettingsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [formData, setFormData] = useState({
    name: organization.name,
    slug: organization.slug,
    description: organization.description || '',
    email: organization.email || '',
    phone: organization.phone || '',
    timezone: organization.timezone,
    inviteEnabled: organization.inviteEnabled ?? true,
  });

  const isOwner = userRole === 'OWNER';
  const canEdit = ['ADMIN', 'OWNER'].includes(userRole);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, inviteEnabled: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEdit) {
      toast.error('คุณไม่มีสิทธิ์แก้ไขข้อมูล');
      return;
    }

    setIsSaving(true);

    try {
      await onUpdate(formData);
      setIsEditing(false);
      toast.success('บันทึกการเปลี่ยนแปลงสำเร็จ');
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: organization.name,
      slug: organization.slug,
      description: organization.description || '',
      email: organization.email || '',
      phone: organization.phone || '',
      timezone: organization.timezone,
      inviteEnabled: organization.inviteEnabled ?? true,
    });
    setIsEditing(false);
  };

  const handleCopyInviteCode = () => {
    if (organization.inviteCode) {
      navigator.clipboard.writeText(organization.inviteCode);
      setCopiedCode(true);
      toast.success('คัดลอกรหัสเชิญสำเร็จ');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleGenerateNewCode = async () => {
    if (!isOwner) {
      toast.error('เฉพาะ OWNER เท่านั้นที่สามารถสร้างรหัสเชิญใหม่ได้');
      return;
    }

    try {
      const response = await fetch(`/api/${organization.slug}/settings/generate-invite-code`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite code');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('สร้างรหัสเชิญใหม่สำเร็จ', {
          description: `รหัสใหม่: ${data.inviteCode}`
        });
        
        // Refresh page data
        window.location.reload();
      }
    } catch (error) {
      toast.error('ไม่สามารถสร้างรหัสเชิญใหม่ได้');
      console.error('Generate invite code failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Permission Alert */}
      {!canEdit && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            คุณมีสิทธิ์ดูข้อมูลเท่านั้น ต้องเป็น ADMIN หรือ OWNER จึงจะแก้ไขได้
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
          <CardDescription>
            ข้อมูลหลักขององค์กร
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Organization Name */}
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อองค์กร *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                URL Slug *
              </Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                disabled={!isEditing || !isOwner}
                placeholder="organization-name"
                pattern="[a-z0-9-]+"
                required
              />
              <p className="text-xs text-gray-500">
                ใช้ตัวอักษรพิมพ์เล็ก ตัวเลข และเครื่องหมาย - เท่านั้น
              </p>
              {!isOwner && (
                <p className="text-xs text-orange-600">
                  เฉพาะ OWNER เท่านั้นที่แก้ไข URL Slug ได้
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={3}
                placeholder="อธิบายเกี่ยวกับองค์กรของคุณ..."
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                อีเมลองค์กร
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="contact@organization.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                เบอร์โทรศัพท์
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="02-xxx-xxxx"
              />
            </div>

            {/* Timezone */}
            <div className="space-y-2">
              <Label htmlFor="timezone" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                เขตเวลา
              </Label>
              <Input
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={!canEdit}
                >
                  แก้ไขข้อมูล
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Save className="w-4 h-4 mr-2 animate-spin" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        บันทึก
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    ยกเลิก
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Invite Code Settings */}
      {(userRole === 'ADMIN' || userRole === 'OWNER') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              รหัสเชิญเข้าองค์กร
            </CardTitle>
            <CardDescription>
              ใช้รหัสนี้เพื่อเชิญสมาชิกใหม่เข้าองค์กร
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Invite Code Display */}
            {organization.inviteCode && (
              <div className="flex items-center gap-2">
                <Input
                  value={organization.inviteCode}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyInviteCode}
                >
                  {copiedCode ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}

            {/* Invite Enabled Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">เปิดใช้งานรหัสเชิญ</div>
                <div className="text-sm text-gray-600">
                  อนุญาตให้ผู้อื่นเข้าร่วมด้วยรหัสเชิญ
                </div>
              </div>
              <Switch
                checked={organization.inviteEnabled ?? true}
                onCheckedChange={async (checked) => {
                  try {
                    await onUpdate({ inviteEnabled: checked });
                    toast.success(checked ? 'เปิดใช้งานรหัสเชิญแล้ว' : 'ปิดใช้งานรหัสเชิญแล้ว');
                  } catch (error) {
                    toast.error('ไม่สามารถเปลี่ยนการตั้งค่าได้');
                  }
                }}
                disabled={!canEdit}
              />
            </div>

            {/* Generate New Code */}
            {isOwner && (
              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGenerateNewCode}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  สร้างรหัสเชิญใหม่
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  รหัสเก่าจะไม่สามารถใช้งานได้หลังจากสร้างรหัสใหม่
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>สถานะองค์กร</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">สถานะ</div>
              <div className={`font-medium ${
                organization.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {organization.status === 'ACTIVE' ? 'ใช้งานได้' : organization.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">บทบาทของคุณ</div>
              <div className="font-medium text-blue-600">
                {userRole === 'OWNER' ? 'เจ้าของ' : userRole === 'ADMIN' ? 'ผู้จัดการ' : 'สมาชิก'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};