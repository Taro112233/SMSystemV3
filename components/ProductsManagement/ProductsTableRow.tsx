// components/ProductsManagement/ProductsTableRow.tsx
// ProductsTableRow - UPDATED: Use real stock data from API

'use client';

import { useState, useEffect } from 'react';
import { getCategoryValue } from '@/lib/category-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
import { ProductData } from '@/types/product';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';

interface StockSummary {
  totalQuantity: number;
  totalValue: number;
  departmentCount: number;
}

interface ProductsTableRowProps {
  product: ProductData;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
  orgSlug: string;
  onEditClick: (product: ProductData) => void;
  onViewClick: (product: ProductData) => void;
  onDeleteClick: (product: ProductData) => void;
  onToggleStatus: (product: ProductData, newStatus: boolean) => void;
  canManage: boolean;
  pendingStatusChanges?: Map<string, boolean>;
}

export default function ProductsTableRow({
  product,
  categories,
  orgSlug,
  onViewClick,
  onToggleStatus,
  pendingStatusChanges,
}: ProductsTableRowProps) {
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  useEffect(() => {
    const fetchStockSummary = async () => {
      try {
        setLoadingStock(true);

        const response = await fetch(`/api/${orgSlug}/products/${product.id}/stocks`);

        if (!response.ok) {
          throw new Error('Failed to fetch stock summary');
        }

        const data = await response.json();
        const departments = data.data.departments || [];

        // Calculate totals
        let totalQuantity = 0;
        let totalValue = 0;

        departments.forEach((dept: any) => {
          dept.batches.forEach((batch: any) => {
            totalQuantity += batch.quantity;
            if (batch.costPrice) {
              totalValue += batch.quantity * batch.costPrice;
            }
          });
        });

        setStockSummary({
          totalQuantity,
          totalValue,
          departmentCount: departments.length,
        });
      } catch (error) {
        console.error('Error fetching stock summary:', error);
        setStockSummary({
          totalQuantity: 0,
          totalValue: 0,
          departmentCount: 0,
        });
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStockSummary();
  }, [product.id, orgSlug]);

  const pendingStatusChange = pendingStatusChanges?.get(product.id);
  const currentStatus = pendingStatusChange !== undefined ? pendingStatusChange : product.isActive;
  const hasPendingChange = pendingStatusChange !== undefined;

  const TruncatedCell = ({ text, maxLength = 30 }: { text: string; maxLength?: number }) => {
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
      onClick={() => onViewClick(product)}
    >
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-blue-600">
          {product.code}
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="space-y-0.5">
          <TruncatedCell text={product.name} maxLength={40} />
          {product.genericName && (
            <div className="text-xs text-gray-500">
              <TruncatedCell text={`(${product.genericName})`} maxLength={40} />
            </div>
          )}
        </div>
      </td>

      {categories.map((category) => {
        const value = getCategoryValue(product.attributes || [], category.id);
        return (
          <td key={category.id} className="px-4 py-3">
            <TruncatedCell text={value} maxLength={25} />
          </td>
        );
      })}

      <td className="px-4 py-3">
        {loadingStock ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
            <span className="text-xs text-gray-500">กำลังโหลด...</span>
          </div>
        ) : stockSummary ? (
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-gray-900">
              {stockSummary.totalQuantity.toLocaleString('th-TH')} {product.baseUnit}
            </div>
            {stockSummary.departmentCount > 0 && (
              <div className="text-xs text-gray-500">
                {stockSummary.departmentCount} หน่วยงาน
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )}
      </td>

      <td className="px-4 py-3">
        {loadingStock ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
          </div>
        ) : stockSummary ? (
          <div className="text-sm text-gray-900">
            {stockSummary.totalValue > 0 ? (
              `฿${stockSummary.totalValue.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            ) : (
              '-'
            )}
          </div>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )}
      </td>

      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Switch
            checked={currentStatus}
            onCheckedChange={(checked) => onToggleStatus(product, checked)}
          />
          <span
            className={`text-xs ${
              hasPendingChange ? 'text-green-600 font-semibold' : 'text-gray-500'
            }`}
          >
            {currentStatus ? 'เปิด' : 'ปิด'}
          </span>
        </div>
      </td>
    </tr>
  );
}