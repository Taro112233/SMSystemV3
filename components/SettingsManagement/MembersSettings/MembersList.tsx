// FILE: components/SettingsManagement/MembersSettings/MembersList.tsx
// MembersSettings/MembersList - List/table view
// ============================================

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { SettingsCard } from '../shared/SettingsCard';
import { MemberCard } from './MemberCard';

interface Member {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  joinedAt: Date;
}

interface MembersListProps {
  members: Member[];
  isLoading: boolean;
  currentUserRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  onRoleUpdate: (userId: string, newRole: string) => Promise<boolean>;
  onMemberRemove: (userId: string) => Promise<boolean>;
}

export const MembersList = ({
  members,
  isLoading,
  currentUserRole,
  onRoleUpdate,
  onMemberRemove
}: MembersListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter members by search term
  const filteredMembers = members.filter(member =>
    `${member.user.firstName} ${member.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <SettingsCard>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </SettingsCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="ค้นหาสมาชิก..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMembers.map(member => (
            <MemberCard
              key={member.id}
              member={member}
              currentUserRole={currentUserRole}
              onRoleUpdate={onRoleUpdate}
              onMemberRemove={onMemberRemove}
            />
          ))}
        </div>
      ) : (
        <SettingsCard>
          <div className="py-12 text-center text-gray-600">
            {searchTerm ? 'ไม่พบสมาชิกที่ตรงกับคำค้นหา' : 'ยังไม่มีสมาชิก'}
          </div>
        </SettingsCard>
      )}
    </div>
  );
};