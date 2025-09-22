// app/org/[orgSlug]/components/MembersManagement/MembersHeader.tsx
// MembersManagement/MembersHeader - Header with search and filters

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Download,
  Settings,
  Link
} from 'lucide-react';

interface MembersHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  roleFilter: 'ALL' | 'MEMBER' | 'ADMIN' | 'OWNER';
  onRoleFilterChange: (role: 'ALL' | 'MEMBER' | 'ADMIN' | 'OWNER') => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  onStatusFilterChange: (status: 'ALL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED') => void;
  onInviteMember: () => void;
  canInviteMembers: boolean;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export const MembersHeader = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onInviteMember,
  canInviteMembers,
  organization
}: MembersHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            จัดการสมาชิก - {organization.name}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              ส่งออกรายการ
            </Button>
            
            <Button variant="outline" size="sm">
              <Link className="w-4 h-4 mr-2" />
              รหัสเชิญ
            </Button>
            
            {canInviteMembers && (
              <Button onClick={onInviteMember} size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                เชิญสมาชิกใหม่
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ค้นหาสมาชิก... (ชื่อ, อีเมล, username)"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="บทบาท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทุกบทบาท</SelectItem>
                <SelectItem value="OWNER">เจ้าของ</SelectItem>
                <SelectItem value="ADMIN">ผู้ดูแล</SelectItem>
                <SelectItem value="MEMBER">สมาชิก</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="สถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">ทุกสถานะ</SelectItem>
                <SelectItem value="ACTIVE">ใช้งาน</SelectItem>
                <SelectItem value="PENDING">รออนุมัติ</SelectItem>
                <SelectItem value="SUSPENDED">ระงับ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">
            💡 เคล็ดลับ: คลิกที่ชื่อสมาชิกเพื่อดูรายละเอียด
          </span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
            🔗 ใช้รหัสเชิญเพื่อให้สมาชิกสมัครเข้าร่วมเอง
          </span>
        </div>
      </CardContent>
    </Card>
  );
};