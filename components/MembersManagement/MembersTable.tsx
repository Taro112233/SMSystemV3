// components/MembersManagement/MembersTable.tsx
// MembersManagement/MembersTable - Members data display table

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Crown, 
  Shield, 
  User, 
  Mail, 
  Phone,
  Calendar,
  RefreshCw,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Member, PendingInvitation } from './index';

interface MembersTableProps {
  members: Member[];
  invitations: PendingInvitation[];
  currentUser: {
    id: string;
    role: 'MEMBER' | 'ADMIN' | 'OWNER';
  };
  onEditMember: (member: Member) => void;
  onRemoveMember: (memberId: string) => void;
  onResendInvitation: (invitationId: string) => void;
  canManageMembers: boolean;
}

export const MembersTable = ({
  members,
  invitations,
  currentUser,
  onEditMember,
  onRemoveMember,
  onResendInvitation,
  canManageMembers
}: MembersTableProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      OWNER: 'bg-yellow-100 text-yellow-800',
      ADMIN: 'bg-purple-100 text-purple-800',
      MEMBER: 'bg-blue-100 text-blue-800',
    } as const;
    
    const labels = {
      OWNER: 'เจ้าของ',
      ADMIN: 'ผู้ดูแล',
      MEMBER: 'สมาชิก',
    } as const;

    return (
      <Badge variant="secondary" className={variants[role as keyof typeof variants]}>
        {getRoleIcon(role)}
        <span className="ml-1">{labels[role as keyof typeof labels]}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive">ระงับการใช้งาน</Badge>;
    }
    
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default" className="bg-green-100 text-green-800">ใช้งานได้</Badge>;
      case 'PENDING':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">รออนุมัติ</Badge>;
      case 'SUSPENDED':
        return <Badge variant="destructive">ระงับ</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'ไม่เคยใช้งาน';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} นาทีที่แล้ว`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
    }
  };

  // Check if user can be managed (not themselves and has permission)
  const canManageMember = (member: Member) => {
    if (!canManageMembers) return false;
    if (member.userId === currentUser.id) return false;
    if (currentUser.role === 'ADMIN' && member.role === 'OWNER') return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>สมาชิกในองค์กร ({members.filter(m => m.isActive).length} คน)</span>
            <div className="text-sm text-gray-500">
              อัพเดทล่าสุด: {formatDate(new Date().toISOString())}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>สมาชิก</TableHead>
                  <TableHead>ข้อมูลติดต่อ</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>เข้าร่วมเมื่อ</TableHead>
                  <TableHead>ใช้งานล่าสุด</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      ไม่พบสมาชิกในองค์กรนี้
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member, index) => (
                    <TableRow key={member.id} className={!member.isActive ? 'opacity-60' : ''}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {getInitials(member.firstName, member.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                              {member.isOwner && <Crown className="w-4 h-4 inline ml-1 text-yellow-500" />}
                            </div>
                            <div className="text-sm text-gray-500">@{member.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(member.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(member.status, member.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(member.joinedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {formatLastActive(member.lastActiveAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('View profile', member.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              ดูรายละเอียด
                            </DropdownMenuItem>
                            {canManageMember(member) && (
                              <>
                                <DropdownMenuItem onClick={() => onEditMember(member)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  แก้ไขข้อมูล
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => onRemoveMember(member.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  ระงับสมาชิก
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>คำเชิญที่รอการยืนยัน ({invitations.filter(i => i.status === 'PENDING').length} รายการ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>ข้อมูลผู้รับเชิญ</TableHead>
                    <TableHead>บทบาทที่จะได้รับ</TableHead>
                    <TableHead>ผู้เชิญ</TableHead>
                    <TableHead>วันที่เชิญ</TableHead>
                    <TableHead>หมดอายุ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation, index) => (
                    <TableRow key={invitation.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{invitation.inviteeEmail}</div>
                          {invitation.inviteeUsername && (
                            <div className="text-sm text-gray-500">@{invitation.inviteeUsername}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(invitation.role)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{invitation.inviterName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(invitation.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-red-600">
                          {formatDate(invitation.expiresAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={invitation.status === 'PENDING' ? 'secondary' : 'destructive'}
                          className={
                            invitation.status === 'PENDING' 
                              ? 'bg-orange-100 text-orange-800'
                              : invitation.status === 'EXPIRED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {invitation.status === 'PENDING' && 'รอการยืนยัน'}
                          {invitation.status === 'EXPIRED' && 'หมดอายุ'}
                          {invitation.status === 'DECLINED' && 'ปฏิเสธ'}
                          {invitation.status === 'ACCEPTED' && 'ยืนยันแล้ว'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canManageMembers && invitation.status === 'PENDING' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onResendInvitation(invitation.id)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                ส่งคำเชิญใหม่
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                ยกเลิกคำเชิญ
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};