// FILE: components/SettingsManagement/shared/SettingsCard.tsx
// shared/SettingsCard - Reusable card wrapper
// ============================================

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SettingsCard = ({ children, className = '' }: SettingsCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
};