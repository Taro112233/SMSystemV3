// FILE: app/dashboard/settings/profile/page.tsx
// Profile Settings Page - User profile management (Moved from /settings/profile)
// ============================================

"use client";

import React from 'react';
import { ProfileSettings } from '@/components/ProfileSettings';

export default function ProfileSettingsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าโปรไฟล์</h1>
        <p className="text-gray-600 mt-2">
          จัดการข้อมูลส่วนตัวและการตั้งค่าความปลอดภัย
        </p>
      </div>

      <ProfileSettings />
    </>
  );
}