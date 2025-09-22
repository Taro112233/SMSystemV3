// app/org/[orgSlug]/components/MembersManagement/index.tsx
// MembersManagement - Main members management component


import React, { useState } from 'react';
import { EditMemberModal } from './EditMemberModal';
import { InviteMemberModal } from './InviteMemberModal';
import { MembersHeader } from './MembersHeader';
import { MembersStats } from './MembersStats';
import { MembersTable } from './MembersTable';
import { mockMembers, mockInvitations } from '../../data/membersMockData';

export interface Member {
  id: string;
  userId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone?: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  isOwner: boolean;
  isActive: boolean;
  joinedAt: string;
  lastActiveAt?: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  permissions: string[];
  avatar?: string;
  department?: string;
}

export interface PendingInvitation {
  id: string;
  organizationId: string;
  inviterId: string;
  inviterName: string;
  inviteeEmail: string;
  inviteeUsername?: string;
  role: 'MEMBER' | 'ADMIN' | 'OWNER';
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
}

export interface MembersStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  admins: number;
  owners: number;
  recentJoins: number;
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

export const MembersManagement = ({ organization, currentUser }: MembersManagementProps) => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [invitations, setInvitations] = useState<PendingInvitation[]>(mockInvitations);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'MEMBER' | 'ADMIN' | 'OWNER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED'>('ALL');

  // Calculate stats
  const stats: MembersStats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'ACTIVE' && m.isActive).length,
    pendingInvitations: invitations.filter(i => i.status === 'PENDING').length,
    admins: members.filter(m => m.role === 'ADMIN').length,
    owners: members.filter(m => m.role === 'OWNER').length,
    recentJoins: members.filter(m => {
      const joinDate = new Date(m.joinedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return joinDate > thirtyDaysAgo;
    }).length,
  };

  // Filter members based on search and filters
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || member.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInviteMember = (memberData: any) => {
    const newInvitation: PendingInvitation = {
      id: `inv-${Date.now()}`,
      organizationId: organization.id,
      inviterId: currentUser.id,
      inviterName: 'Current User',
      inviteeEmail: memberData.email,
      inviteeUsername: memberData.username,
      role: memberData.role,
      message: memberData.message,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };
    setInvitations([...invitations, newInvitation]);
    setShowInviteModal(false);
  };

  const handleEditMember = (memberData: Partial<Member>) => {
    if (!selectedMember) return;
    
    const updatedMembers = members.map(member =>
      member.id === selectedMember.id
        ? { ...member, ...memberData }
        : member
    );
    setMembers(updatedMembers);
    setSelectedMember(null);
    setShowEditModal(false);
  };

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = members.map(member =>
      member.id === memberId
        ? { ...member, isActive: false, status: 'SUSPENDED' as const }
        : member
    );
    setMembers(updatedMembers);
  };

  const handleResendInvitation = (invitationId: string) => {
    const updatedInvitations = invitations.map(invitation =>
      invitation.id === invitationId
        ? { ...invitation, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
        : invitation
    );
    setInvitations(updatedInvitations);
  };

  const openEditModal = (member: Member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  // Check if current user can manage members
  const canManageMembers = currentUser.role === 'ADMIN' || currentUser.role === 'OWNER';
  const canInviteMembers = canManageMembers;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <MembersStats stats={stats} />
      
      {/* Header with search and actions */}
      <MembersHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onInviteMember={() => setShowInviteModal(true)}
        canInviteMembers={canInviteMembers}
        organization={organization}
      />

      {/* Members Table */}
      <MembersTable
        members={filteredMembers}
        invitations={invitations}
        currentUser={currentUser}
        onEditMember={openEditModal}
        onRemoveMember={handleRemoveMember}
        onResendInvitation={handleResendInvitation}
        canManageMembers={canManageMembers}
      />

      {/* Modals */}
      {showInviteModal && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
          organization={organization}
        />
      )}

      {showEditModal && selectedMember && (
        <EditMemberModal
          isOpen={showEditModal}
          member={selectedMember}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          onSave={handleEditMember}
          currentUserRole={currentUser.role}
        />
      )}
    </div>
  );
};