// FILE: components/SettingsManagement/MembersSettings/MemberCard.tsx
// MembersSettings/MemberCard - Member card component
// ============================================

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Calendar, Trash2 } from 'lucide-react';
import { RoleManager } from './RoleManager';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

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

interface MemberCardProps {
  member: Member;
  currentUserRole: 'MEMBER' | 'ADMIN' | 'OWNER';
  onRoleUpdate: (userId: string, newRole: string) => Promise<boolean>;
  onMemberRemove: (userId: string) => Promise<boolean>;
}

export const MemberCard = ({
  member,
  currentUserRole,
  onRoleUpdate,
  onMemberRemove
}: MemberCardProps) => {
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const canManageRole = currentUserRole === 'OWNER' || 
    (currentUserRole === 'ADMIN' && member.role !== 'OWNER');
  
  const canRemove = currentUserRole === 'OWNER' && member.role !== 'OWNER';

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const success = await onMemberRemove(member.userId);
      if (success) {
        toast.success('ลบสมาชิกสำเร็จ');
        setShowRemoveDialog(false);
      } else {
        toast.error('ไม่สามารถลบสมาชิกได้');
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    } finally {
      setIsRemoving(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      OWNER: <Badge variant="default">เจ้าของ</Badge>,
      ADMIN: <Badge variant="secondary">ผู้ดูแล</Badge>,
      MEMBER: <Badge variant="outline">สมาชิก</Badge>
    };
    return badges[role as keyof typeof badges];
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {member.user.firstName} {member.user.lastName}
                  </h4>
                  {getRoleBadge(member.role)}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{member.user.email}</span>
              </div>
              {member.user.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{member.user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>เข้าร่วมเมื่อ {format(new Date(member.joinedAt), 'dd MMM yyyy', { locale: th })}</span>
              </div>
            </div>

            {/* Actions */}
            {(canManageRole || canRemove) && (
              <div className="flex gap-2 pt-3 border-t">
                {canManageRole && (
                  <RoleManager
                    currentRole={member.role}
                    userId={member.userId}
                    onRoleUpdate={onRoleUpdate}
                  />
                )}
                {canRemove && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRemoveDialog(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    ลบ
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        open={showRemoveDialog}
        onOpenChange={setShowRemoveDialog}
        title="ยืนยันการลบสมาชิก"
        description={`คุณแน่ใจหรือไม่ที่จะลบ "${member.user.firstName} ${member.user.lastName}" ออกจากองค์กร?`}
        confirmText="ลบสมาชิก"
        cancelText="ยกเลิก"
        onConfirm={handleRemove}
        isLoading={isRemoving}
        variant="destructive"
      />
    </>
  );
};