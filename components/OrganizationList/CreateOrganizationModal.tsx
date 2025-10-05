// FILE: components/OrganizationList/CreateOrganizationModal.tsx
// CreateOrganizationModal - UPDATED: Stay on /dashboard after creation
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
import { validateOrgSlug, generateSafeSlug } from '@/lib/slug-validator';

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
  color: string;
  icon: string;
}

export const CreateOrganizationModal = ({ open, onOpenChange }: CreateOrganizationModalProps) => {
  const [formData, setFormData] = useState<OrganizationForm>({
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    timezone: 'Asia/Bangkok',
    color: 'BLUE',
    icon: 'BUILDING',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [slugError, setSlugError] = useState('');

  const colors = getAvailableColors();
  const icons = getAvailableIcons();

  const selectedColor = colors.find(c => c.value === formData.color);
  const SelectedIcon = getIconComponent(formData.icon);

  const handleNameChange = (value: string) => {
    const safeslug = generateSafeSlug(value, true);
    
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: safeslug
    }));

    const validation = validateOrgSlug(safeslug);
    if (!validation.isValid) {
      setSlugError(validation.error || 'Slug ไม่ถูกต้อง');
    } else {
      setSlugError('');
    }
    
    if (error) setError('');
  };

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      slug: value
    }));

    const validation = validateOrgSlug(value);
    if (!validation.isValid) {
      setSlugError(validation.error || 'Slug ไม่ถูกต้อง');
    } else {
      setSlugError('');
    }
    
    if (error) setError('');
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

    const slugValidation = validateOrgSlug(formData.slug);
    if (!slugValidation.isValid) {
      setSlugError(slugValidation.error || 'Slug ไม่ถูกต้อง');
      setError('กรุณาแก้ไข Slug ให้ถูกต้อง');
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

      // ✅ UPDATED: แสดง success message และ refresh หน้า /dashboard แทนการ redirect
      toast.success('สร้างองค์กรสำเร็จ!', {
        description: `องค์กร "${data.organization.name}" ถูกสร้างแล้ว กำลังรีเฟรชหน้า...`
      });

      // ปิด modal
      onOpenChange(false);
      
      // ✅ UPDATED: Reload หน้า /dashboard เพื่อโหลดองค์กรใหม่
      setTimeout(() => {
        window.location.reload();
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
      setSlugError('');
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
          {/* Organization Preview */}
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

          {/* URL Slug with validation */}
          <div className="space-y-2">
            <Label htmlFor="org-slug">URL Slug *</Label>
            <Input
              id="org-slug"
              placeholder="siriraj-hospital"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={isLoading}
              required
              className={slugError ? 'border-red-500' : ''}
            />
            
            {slugError && (
              <p className="text-xs text-red-600 flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{slugError}</span>
              </p>
            )}
            
            <p className="text-xs text-gray-500">
              จะใช้เป็น URL: /{formData.slug || 'your-org-slug'}
            </p>
          </div>

          {/* Color & Icon Selection */}
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
              disabled={isLoading || !!slugError}
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