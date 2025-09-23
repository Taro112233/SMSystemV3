// components/MembersManagement/MembersHeader.tsx
// MembersManagement/MembersHeader - Page header with actions

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  UserPlus, 
  Download, 
  Filter,
  MoreVertical 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MembersHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onInviteMember: () => void;
  onExportMembers: () => void;
  onShowFilters: () => void;
}

export const MembersHeader = ({
  searchTerm,
  onSearchChange,
  onInviteMember,
  onExportMembers,
  onShowFilters
}: MembersHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="ค้นหาชื่อ, username, หรือ email"
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onShowFilters}>
          <Filter className="w-4 h-4 mr-2" />
          กรอง
        </Button>
        
        <Button variant="outline" onClick={onExportMembers}>
          <Download className="w-4 h-4 mr-2" />
          ส่งออก
        </Button>
        
        <Button onClick={onInviteMember}>
          <UserPlus className="w-4 h-4 mr-2" />
          เชิญสมาชิก
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log('Bulk actions')}>
              การดำเนินการหลายรายการ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Member settings')}>
              ตั้งค่าสมาชิก
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};