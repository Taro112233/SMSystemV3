// components/TransferManagement/ItemActions/BatchSelectionTable.tsx
// BatchSelectionTable - Batch selector component

'use client';

import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface StockBatch {
  id: string;
  lotNumber: string;
  expiryDate?: Date;
  availableQuantity: number;
}

interface SelectedBatch {
  batchId: string;
  quantity: number;
}

interface BatchSelectionTableProps {
  batches: StockBatch[];
  selectedBatches: SelectedBatch[];
  maxQuantity: number;
  baseUnit: string;
  onChange: (selected: SelectedBatch[]) => void;
}

export default function BatchSelectionTable({
  batches,
  selectedBatches,
  maxQuantity,
  baseUnit,
  onChange,
}: BatchSelectionTableProps) {
  const [localSelections, setLocalSelections] = useState<SelectedBatch[]>(selectedBatches);

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isExpiringSoon = (date?: Date) => {
    if (!date) return false;
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    return new Date(date) <= ninetyDaysFromNow;
  };

  const isSelected = (batchId: string) => {
    return localSelections.some((s) => s.batchId === batchId);
  };

  const getQuantity = (batchId: string) => {
    return localSelections.find((s) => s.batchId === batchId)?.quantity || 0;
  };

  const getTotalSelected = () => {
    return localSelections.reduce((sum, s) => sum + s.quantity, 0);
  };

  const handleToggle = (batch: StockBatch) => {
    let newSelections: SelectedBatch[];
    
    if (isSelected(batch.id)) {
      newSelections = localSelections.filter((s) => s.batchId !== batch.id);
    } else {
      const remainingCapacity = maxQuantity - getTotalSelected();
      const quantity = Math.min(batch.availableQuantity, remainingCapacity, 1);
      newSelections = [...localSelections, { batchId: batch.id, quantity }];
    }
    
    setLocalSelections(newSelections);
    onChange(newSelections);
  };

  const handleQuantityChange = (batchId: string, quantity: number) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    const otherSelectionsTotal = localSelections
      .filter((s) => s.batchId !== batchId)
      .reduce((sum, s) => sum + s.quantity, 0);

    const maxAllowed = Math.min(
      batch.availableQuantity,
      maxQuantity - otherSelectionsTotal
    );

    const validQuantity = Math.max(1, Math.min(quantity, maxAllowed));

    const newSelections = localSelections.map((s) =>
      s.batchId === batchId ? { ...s, quantity: validQuantity } : s
    );

    setLocalSelections(newSelections);
    onChange(newSelections);
  };

  const totalSelected = getTotalSelected();
  const isOverLimit = totalSelected > maxQuantity;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto max-h-80 border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="w-12 px-4 py-3 text-left">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                Lot Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                วันหมดอายุ
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                คงเหลือ
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-32">
                จำนวนที่จ่าย
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batches.map((batch) => {
              const expiring = isExpiringSoon(batch.expiryDate);
              const selected = isSelected(batch.id);
              const quantity = getQuantity(batch.id);

              return (
                <tr
                  key={batch.id}
                  className={`hover:bg-gray-50 ${expiring ? 'bg-amber-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => handleToggle(batch)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">
                      {batch.lotNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          expiring ? 'text-amber-700 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(batch.expiryDate)}
                      </span>
                      {expiring && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">
                          ใกล้หมดอายุ
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900">
                      {batch.availableQuantity.toLocaleString('th-TH')} {baseUnit}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {selected && (
                      <Input
                        type="number"
                        min="1"
                        max={batch.availableQuantity}
                        value={quantity}
                        onChange={(e) =>
                          handleQuantityChange(batch.id, parseInt(e.target.value) || 1)
                        }
                        className="w-24"
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div
        className={`p-4 rounded-lg border ${
          isOverLimit
            ? 'bg-red-50 border-red-200'
            : 'bg-purple-50 border-purple-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOverLimit && <AlertCircle className="w-4 h-4 text-red-600" />}
            <span className="text-sm font-medium text-gray-700">
              รวมที่เลือก:
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold ${
                isOverLimit ? 'text-red-600' : 'text-purple-900'
              }`}
            >
              {totalSelected.toLocaleString('th-TH')} {baseUnit}
            </span>
            <span className="text-sm text-gray-600">
              / {maxQuantity.toLocaleString('th-TH')} {baseUnit}
            </span>
          </div>
        </div>
        {isOverLimit && (
          <div className="text-sm text-red-600 mt-2">
            ⚠️ จำนวนที่เลือกเกินจำนวนที่อนุมัติ
          </div>
        )}
      </div>
    </div>
  );
}