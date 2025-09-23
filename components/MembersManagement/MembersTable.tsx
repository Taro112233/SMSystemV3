// components/MembersManagement/MembersTable.tsx
// MembersManagement/MembersTable - Members data table

import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Mail, Phone, Edit, Trash2, Shield, UserX } from 'lucide-react';
import { roleConfig, statusConfig } from '@/data/membersMockData';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

// Complete Member interface to match mock data
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
  lastActiveAt?: Date | null;
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

interface MembersTableProps {
  members: Member[];
  currentUserId: string;
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onChangeRole: (memberId: string, newRole: string) => void;
  onToggleStatus: (memberId: string) => void;
}

export const MembersTable = ({
  members,
  currentUserId,
  onEditMember,
  onDeleteMember,
  onChangeRole,
  onToggleStatus
}: MembersTableProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatLastActive = (date?: Date | null) => {
    if (!date) return 'ไม่เคยใช้งาน';
    return formatDistanceToNow(date, { addSuffix: true, locale: th });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>สมาชิก</TableHead>
            <TableHead>บทบาท</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead>แผนกที่เข้าถึง</TableHead>
            <TableHead>กิจกรรมล่าสุด</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const roleInfo = roleConfig[member.role];
            const statusInfo = statusConfig[member.status as keyof typeof statusConfig];
            const RoleIcon = roleInfo.icon;
            const isCurrentUser = member.id === currentUserId;
            
            return (
              <TableRow key={member.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(member.firstName, member.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {member.fullName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-gray-500">(คุณ)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">@{member.username}</div>
                      {member.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 ${roleInfo.bgColor} rounded flex items-center justify-center`}>
                      <RoleIcon className={`w-3 h-3 ${roleInfo.color}`} />
                    </div>
                    <span className="text-sm font-medium">{roleInfo.label}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}
                  >
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {member.departmentAccess.length > 0 ? (
                      <div className="space-y-1">
                        {member.departmentAccess.slice(0, 2).map((dept, index) => (
                          <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {dept}
                          </div>
                        ))}
                        {member.departmentAccess.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{member.departmentAccess.length - 2} อื่น ๆ
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">ไม่มีการเข้าถึง</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    <div className="text-gray-600">{formatLastActive(member.lastActiveAt)}</div>
                    <div className="text-xs text-gray-400">
                      เข้าร่วม {formatDistanceToNow(member.joinedAt, { addSuffix: true, locale: th })}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditMember(member)}>
                        <Edit className="w-4 h-4 mr-2" />
                        แก้ไขข้อมูล
                      </DropdownMenuItem>
                      
                      {member.phone && (
                        <DropdownMenuItem onClick={() => window.open(`tel:${member.phone}`)}>
                          <Phone className="w-4 h-4 mr-2" />
                          โทรหา
                        </DropdownMenuItem>
                      )}
                      
                      {!isCurrentUser && (
                        <>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => onChangeRole(member.id, 'ADMIN')}
                            disabled={member.role === 'OWNER'}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            เปลี่ยนบทบาท
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => onToggleStatus(member.id)}>
                            <UserX className="w-4 h-4 mr-2" />
                            {member.status === 'ACTIVE' ? 'ระงับการใช้งาน' : 'เปิดใช้งาน'}
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => onDeleteMember(member.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            ลบออกจากองค์กร
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};