// components/TransferManagement/TransferDetail/TransferNotes.tsx
// TransferNotes - Notes section

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface TransferNotesProps {
  notes?: string;
}

export default function TransferNotes({ notes }: TransferNotesProps) {
  if (!notes) return null;

  return (
    <Card className="border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-1">หมายเหตุเพิ่มเติม</div>
            <div className="text-sm text-gray-900">{notes}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}