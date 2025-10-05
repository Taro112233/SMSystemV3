// FILE: components/OrganizationList/CreateOrganizationModal.tsx
// CreateOrganizationModal - Modal for creating new organization with Icon & Color selection
// ============================================

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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getAvailableColors, getAvailableIcons, getIconComponent } from '@/lib/department-helpers';

interface CreateOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OrganizationForm {
  name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  timezone: string;
  color: string;       // ✅ NEW
  icon: string;        // ✅ NEW
}

export const CreateOrganizationModal = ({ open, onOpenChange }: CreateOrganizationModalProps) => {
  const [formData, setFormData] = useState<OrganizationForm>({
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    timezone: 'Asia/Bangkok',
    color: 'BLUE',       // ✅ NEW - Default color
    icon: 'BUILDING',    // ✅ NEW - Default icon
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = getAvailableColors();
  const icons = getAvailableIcons();

  // ✅ Get current selected for preview
  const selectedColor = colors.find(c => c.value === formData.color);
  const SelectedIcon = getIconComponent(formData.icon);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };

  const handleInputChange = (field: keyof OrganizationForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    if (error) setError('');
  };

  const handleSelectChange = (field: keyof OrganizationForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('กรุณากรอกชื่อองค์กร');
      return false;
    }
    
    if (!formData.slug.trim()) {
      setError('กรุณากรอก URL slug');
      return false;
    }
    
    if (formData.slug.length < 3) {
      setError('URL slug ต้องมีอย่างน้อย 3 ตัวอักษร');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'ไม่สามารถสร้างองค์กรได้');
      }

      toast.success('สร้างองค์กรสำเร็จ!', {
        description: 'กำลังนำไปยังหน้าจัดการองค์กร...'
      });

      onOpenChange(false);
      setTimeout(() => {
        window.location.href = `/${data.organization.slug}`;
      }, 1000);

    } catch (error) {
      console.error('Create organization error:', error);
      const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      setError(errorMsg);
      
      toast.error('สร้างองค์กรไม่สำเร็จ', {
        description: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        slug: '',
        description: '',
        email: '',
        phone: '',
        timezone: 'Asia/Bangkok',
        color: 'BLUE',
        icon: 'BUILDING',
      });
      setError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            สร้างองค์กรใหม่
          </DialogTitle>
          <DialogDescription>
            กรอกข้อมูลเพื่อสร้างองค์กรใหม่ คุณจะเป็นเจ้าขององค์กรโดยอัตโนมัติ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ✅ NEW: Organization Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-sm text-gray-600 mb-2">ตัวอย่าง:</div>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${selectedColor?.class || 'bg-blue-500'} rounded-xl flex items-center justify-center`}>
                <SelectedIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">
                  {formData.name || 'ชื่อองค์กร'}
                </div>
                <div className="text-sm text-gray-500 font-mono">
                  {formData.slug || 'slug'}
                </div>
              </div>
            </div>
          </div>

          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="org-name">ชื่อองค์กร *</Label>
            <Input
              id="org-name"
              placeholder="เช่น โรงพยาบาลศิริราช"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-2">
            <Label htmlFor="org-slug">URL Slug *</Label>
            <Input
              id="org-slug"
              placeholder="siriraj-hospital"
              value={formData.slug}
              onChange={handleInputChange('slug')}
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500">
              จะใช้เป็น URL: /{formData.slug || 'your-org-slug'}
            </p>
          </div>

          {/* ✅ NEW: Color & Icon Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">สีองค์กร</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => handleSelectChange('color', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colors.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${color.class} rounded`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">ไอคอนองค์กร</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => handleSelectChange('icon', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {icons.map(icon => {
                    const IconComp = icon.component;
                    return (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center gap-2">
                          <IconComp className="w-4 h-4" />
                          {icon.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="org-description">คำอธิบาย</Label>
            <Textarea
              id="org-description"
              placeholder="อธิบายเกี่ยวกับองค์กรของคุณ"
              value={formData.description}
              onChange={handleInputChange('description')}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-email">อีเมล</Label>
              <Input
                id="org-email"
                type="email"
                placeholder="contact@hospital.com"
                value={formData.email}
                onChange={handleInputChange('email')}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-phone">เบอร์โทร</Label>
              <Input
                id="org-phone"
                type="tel"
                placeholder="02-xxx-xxxx"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label>เขตเวลา</Label>
            <Select 
              value={formData.timezone} 
              onValueChange={(value) => handleSelectChange('timezone', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Bangkok">Asia/Bangkok (UTC+7)</SelectItem>
                <SelectItem value="Asia/Jakarta">Asia/Jakarta (UTC+7)</SelectItem>
                <SelectItem value="Asia/Singapore">Asia/Singapore (UTC+8)</SelectItem>
                <SelectItem value="Asia/Manila">Asia/Manila (UTC+8)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4 mr-2" />
                  สร้างองค์กร
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};