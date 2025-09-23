// components/MembersManagement/index.tsx
// MembersManagement - Main members management component

import React, { useState, useMemo } from 'react';
import { MembersStats } from './MembersStats';
import { MembersHeader } from './MembersHeader';
import { MembersTable } from './MembersTable';
import { InviteMemberModal } from './InviteMemberModal';
import { EditMemberModal } from './EditMemberModal';
import { organizationMembers, memberStats } from '@/data/membersMockData';
import { toast } from 'sonner';

// Define Member interface here to match mock data structure
interface Member {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  status: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
  lastActiveAt?: Date;
  departmentAccess: string[];
  invitedBy?: string | null;
  isActive: boolean;
  emailVerified: boolean;
  isOwner: boolean;
  avatar?: string | null;
  lastLogin?: Date | null;
  permissions: string[];
  createdBy: string;
}

interface MembersManagementProps {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  currentUser: {
    id: string;
    role: 'MEMBER' | 'ADMIN' | 'OWNER';
  };
}

export const MembersManagement = ({
  organization,
  currentUser
}: MembersManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>(organizationMembers as Member[]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    
    const searchLower = searchTerm.toLowerCase();
    return members.filter(member =>
      member.fullName.toLowerCase().includes(searchLower) ||
      member.username.toLowerCase().includes(searchLower) ||
      member.email.toLowerCase().includes(searchLower) ||
      member.firstName.toLowerCase().includes(searchLower) ||
      member.lastName.toLowerCase().includes(searchLower)
    );
  }, [members, searchTerm]);

  // Recalculate stats based on current members
  const currentStats = useMemo(() => ({
    total: members.length,
    active: members.filter(m => m.status === 'ACTIVE').length,
    pending: members.filter(m => m.status === 'PENDING').length,
    suspended: members.filter(m => m.status === 'SUSPENDED').length,
    owners: members.filter(m => m.role === 'OWNER').length,
    admins: members.filter(m => m.role === 'ADMIN').length,
    members: members.filter(m => m.role === 'MEMBER').length,
  }), [members]);

  const handleInviteMember = (inviteData: any) => {
    console.log('Invite member:', inviteData);
    // In real app, this would call an API
    toast.success('ส่งคำเชิญสมาชิกแล้ว');
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleSaveMember = (memberId: string, updatedData: any) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, ...updatedData, fullName: `${updatedData.firstName} ${updatedData.lastName}` }
        : member
    ));
  };

  const handleDeleteMember = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success(`ลบ ${member.fullName} ออกจากองค์กรแล้ว`);
    }
  };

  const handleChangeRole = (memberId: string, newRole: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, role: newRole as 'OWNER' | 'ADMIN' | 'MEMBER' } : m
      ));
      toast.success(`เปลี่ยนบทบาทของ ${member.fullName} แล้ว`);
    }
  };

  const handleToggleStatus = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      const newStatus = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      setMembers(prev => prev.map(m => 
        m.id === memberId ? { ...m, status: newStatus, isActive: newStatus === 'ACTIVE' } : m
      ));
      toast.success(`${newStatus === 'ACTIVE' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}${member.fullName} แล้ว`);
    }
  };

  const handleExportMembers = () => {
    toast.info('กำลังส่งออกข้อมูลสมาชิก...');
    // In real app, this would generate and download a file
    setTimeout(() => {
      toast.success('ส่งออกข้อมูลสมาชิกสำเร็จ');
    }, 1000);
  };

  const handleShowFilters = () => {
    toast.info('ตัวกรองยังไม่พร้อมใช้งาน');
  };

  // Check permissions
  const canInviteMembers = currentUser.role === 'ADMIN' || currentUser.role === 'OWNER';
  const canManageMembers = currentUser.role === 'ADMIN' || currentUser.role === 'OWNER';

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <MembersStats stats={currentStats} />

      {/* Header with search and actions */}
      <MembersHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onInviteMember={() => setShowInviteModal(true)}
        onExportMembers={handleExportMembers}
        onShowFilters={handleShowFilters}
      />

      {/* Members Table */}
      <MembersTable
        members={filteredMembers}
        currentUserId={currentUser.id}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
        onChangeRole={handleChangeRole}
        onToggleStatus={handleToggleStatus}
      />

      {/* No results message */}
      {filteredMembers.length === 0 && searchTerm && (
        <div className="text-center py-8 text-gray-500">
          <p>ไม่พบสมาชิกที่ค้นหา "{searchTerm}"</p>
        </div>
      )}

      {/* Modals */}
      {canInviteMembers && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
        />
      )}

      {canManageMembers && (
        <EditMemberModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          onSave={handleSaveMember}
        />
      )}
    </div>
  );
};