// components/DepartmentStocksManagement/StocksTableRow.tsx
// StocksTableRow - FIXED: Show days until expiry

"use client";

import { DepartmentStock } from "@/types/stock";
import { AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const batches = stock.batches || [];

  // Get nearest expiry batch
  const nearestExpiryBatch = batches
    .filter((b) => b.expiryDate && b.status === "AVAILABLE")
    .sort(
      (a, b) =>
        new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime()
    )[0];

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: Date): number => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check expiry status
  let expiryStatus: 'expired' | 'expiring' | 'normal' = 'normal';
  let daysUntilExpiry = 0;
  
  if (nearestExpiryBatch?.expiryDate) {
    daysUntilExpiry = getDaysUntilExpiry(nearestExpiryBatch.expiryDate);
    
    if (daysUntilExpiry < 0) {
      expiryStatus = 'expired';
    } else if (daysUntilExpiry <= 365) {
      expiryStatus = 'expiring';
    }
  }

  const firstUpdatedBatch =
    batches.length > 0
      ? batches.reduce((oldest, batch) => {
          const oldestTime = new Date(oldest.updatedAt).getTime();
          const batchTime = new Date(batch.updatedAt).getTime();
          return batchTime < oldestTime ? batch : oldest;
        })
      : null;

  const totalValue = batches.reduce((sum, batch) => {
    if (batch.costPrice && batch.totalQuantity > 0) {
      return sum + Number(batch.costPrice) * batch.totalQuantity;
    }
    return sum;
  }, 0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatOnlyDate = (date: Date) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatOnlyTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
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
      return <span className="text-sm text-gray-900">{text || "-"}</span>;
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
        <div className="text-sm text-gray-900">{stock.location || "-"}</div>
      </td>

      {/* Available Quantity */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-900">
            {stock.availableQuantity.toLocaleString("th-TH")}
          </div>
          <span className="text-xs text-gray-500">
            {stock.product.baseUnit}
          </span>
          {(isLowStock || needsReorder) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      needsReorder ? "text-red-600" : "text-amber-600"
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
              {stock.reservedQuantity.toLocaleString("th-TH")}
            </span>
          ) : (
            "-"
          )}
        </div>
      </td>

      {/* Incoming Quantity */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-600">
          {stock.incomingQuantity > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-green-600 font-medium cursor-help">
                    {stock.incomingQuantity.toLocaleString("th-TH")}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    รอรับเข้าจากใบเบิกที่อนุมัติแล้ว
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            "-"
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
              className={`text-xs font-medium ${
                expiryStatus === 'expired'
                  ? "text-red-600"
                  : expiryStatus === 'expiring'
                  ? "text-amber-600"
                  : "text-gray-500"
              }`}
            >
              {formatDate(nearestExpiryBatch.expiryDate!)}
              {expiryStatus === 'expired' && " (หมดอายุแล้ว)"}
              {expiryStatus === 'expiring' && ` (อีก ${daysUntilExpiry} วัน)`}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )}
      </td>

      {/* Total Value */}
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-green-700">
          {totalValue > 0
            ? `฿${totalValue.toLocaleString("th-TH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "-"}
        </div>
      </td>

      {/* Last Update */}
      <td className="px-4 py-3">
        {firstUpdatedBatch ? (
          <div className="space-y-0.5">
            <div className="text-sm text-gray-900">
              {formatOnlyDate(firstUpdatedBatch.updatedAt)}
            </div>
            <div className="text-xs text-gray-500">
              {formatOnlyTime(firstUpdatedBatch.updatedAt)}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )}
      </td>
    </tr>
  );
}