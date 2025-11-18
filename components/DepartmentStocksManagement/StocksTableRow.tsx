// components/DepartmentStocksManagement/StocksTableRow.tsx
// StocksTableRow - Individual table row

'use client';

import { DepartmentStock } from '@/types/stock';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StocksTableRowProps {
  stock: DepartmentStock;
  onViewClick: (stock: DepartmentStock) => void;
  canManage: boolean;
}

export default function StocksTableRow({
  stock,
  onViewClick,
}: StocksTableRowProps) {
  const isLowStock =
    stock.minStockLevel && stock.availableQuantity < stock.minStockLevel;
  const needsReorder =
    stock.reorderPoint && stock.availableQuantity < stock.reorderPoint;

  // Get nearest expiry batch
  const nearestExpiryBatch = stock.batches
    .filter((b) => b.expiryDate && b.status === 'AVAILABLE')
    .sort(
      (a, b) =>
        new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime()
    )[0];

  const isExpiringSoon =
    nearestExpiryBatch &&
    nearestExpiryBatch.expiryDate &&
    new Date(nearestExpiryBatch.expiryDate).getTime() 
      Date.now() + 90 * 24 * 60 * 60 * 1000;

  // Calculate average cost price
  const avgCostPrice = stock.batches.length
    ? stock.batches.reduce((sum, b) => sum + (b.costPrice || 0), 0) /
      stock.batches.length
    : 0;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const TruncatedCell = ({
    text,
    maxLength = 30,
  }: {
    text: string;
    maxLength?: number;
  }) => {
    const shouldTruncate = text && text.length > maxLength;

    if (!shouldTruncate) {
      return <span className="text-sm text-gray-900">{text || '-'}</span>;
    }

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm text-gray-900 truncate block max-w-[200px] cursor-help">
              {text}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <tr
      className="hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onViewClick(stock)}
    >
      {/* Product Code */}
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-blue-600">
          {stock.product.code}
        </div>
      </td>

      {/* Product Name */}
      <td className="px-4 py-3">
        <div className="space-y-0.5">
          <TruncatedCell text={stock.product.name} maxLength={40} />
          {stock.product.genericName && (
            <div className="text-xs text-gray-500">
              <TruncatedCell
                text={`(${stock.product.genericName})`}
                maxLength={40}
              />
            </div>
          )}
        </div>
      </td>

      {/* Location */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-900">
          {stock.location || '-'}
        </div>
      </td>

      {/* Available Quantity */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-900">
            {stock.availableQuantity.toLocaleString('th-TH')}
          </div>
          <span className="text-xs text-gray-500">{stock.product.baseUnit}</span>
          {(isLowStock || needsReorder) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      needsReorder ? 'text-red-600' : 'text-amber-600'
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {needsReorder
                      ? `ถึงจุดสั่งซื้อ (${stock.reorderPoint})`
                      : `สต็อกต่ำ (< ${stock.minStockLevel})`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>

      {/* Reserved Quantity */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-600">
          {stock.reservedQuantity > 0 ? (
            <span className="text-orange-600 font-medium">
              {stock.reservedQuantity.toLocaleString('th-TH')}
            </span>
          ) : (
            '-'
          )}
        </div>
      </td>

      {/* Incoming Quantity */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-600">
          {stock.incomingQuantity > 0 ? (
            <span className="text-green-600 font-medium">
              {stock.incomingQuantity.toLocaleString('th-TH')}
            </span>
          ) : (
            '-'
          )}
        </div>
      </td>

      {/* Nearest Expiry */}
      <td className="px-4 py-3">
        {nearestExpiryBatch ? (
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-gray-900">
              {nearestExpiryBatch.lotNumber}
            </div>
            <div
              className={`text-xs ${
                isExpiringSoon ? 'text-amber-600 font-medium' : 'text-gray-500'
              }`}
            >
              {formatDate(nearestExpiryBatch.expiryDate!)}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )}
      </td>

      {/* Average Price */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-900">
          {avgCostPrice > 0
            ? `฿${avgCostPrice.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : '-'}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {stock.batches.length > 0 ? (
            <>
              <Package className="h-4 w-4 text-green-600" />
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {stock.batches.length} Lot
              </Badge>
            </>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              ไม่มีสต็อก
            </Badge>
          )}
        </div>
      </td>
    </tr>
  );
}