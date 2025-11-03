// components/ProductsManagement/ProductsTableRow.tsx
// ProductsTableRow - Individual table row with category columns

'use client';

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

interface ProductsTableRowProps {
  product: ProductData;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
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
  productUnits,
  onViewClick,
  onToggleStatus,
  pendingStatusChanges,
}: ProductsTableRowProps) {
  const mockStockQuantity = Math.floor(Math.random() * 200) + 1;
  const mockUnitPrice = Math.floor(Math.random() * 500) + 50;

  const currentUnit = productUnits.find(u => u.name === product.baseUnit);
  const conversionRatio = currentUnit?.conversionRatio || 1;
  const baseUnitQuantity = Math.round(mockStockQuantity * conversionRatio);

  const mockTotalValue = baseUnitQuantity * mockUnitPrice;

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
        <div className="text-sm font-medium text-gray-900">
          {mockStockQuantity.toLocaleString('th-TH')} {product.baseUnit}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          ({baseUnitQuantity.toLocaleString('th-TH')} หน่วย)
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="text-sm text-gray-900">
          ฿{mockTotalValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </td>

      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <Switch
            checked={currentStatus}
            onCheckedChange={(checked) => onToggleStatus(product, checked)}
          />
          <span className={`text-xs ${hasPendingChange ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
            {currentStatus ? 'เปิด' : 'ปิด'}
          </span>
        </div>
      </td>
    </tr>
  );
}