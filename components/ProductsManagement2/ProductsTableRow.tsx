// components/ProductsManagement2/ProductsTableRow.tsx
// ProductsTableRow - Minimal single-line row with ellipsis

'use client';

import { useState, useEffect } from 'react';
import { getCategoryValue } from '@/lib/category-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
import { ProductData } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit2, Trash2, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StockSummary {
  totalQuantity: number;
  totalValue: number;
}

interface ProductsTableRowProps {
  product: ProductData;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
  orgSlug: string;
  onViewClick: (product: ProductData) => void;
  onEditClick: (product: ProductData) => void;
  onDeleteClick: (product: ProductData) => void;
  canManage: boolean;
}

export default function ProductsTableRow({
  product,
  categories,
  orgSlug,
  onViewClick,
  onEditClick,
  onDeleteClick,
  canManage,
}: ProductsTableRowProps) {
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoadingStock(true);
        const response = await fetch(`/api/${orgSlug}/products/${product.id}/stocks`);
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        const departments = data.data.departments || [];
        
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
        
        setStockSummary({ totalQuantity, totalValue });
      } catch (error) {
        setStockSummary({ totalQuantity: 0, totalValue: 0 });
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStock();
  }, [product.id, orgSlug]);

  const TruncateText = ({ text, maxLength = 30 }: { text: string; maxLength?: number }) => {
    if (!text || text.length <= maxLength) {
      return <span className="text-sm text-gray-900">{text || '-'}</span>;
    }

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm text-gray-900 truncate block cursor-help">
              {text.slice(0, maxLength)}...
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm max-w-xs">{text}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-3 py-2">
        <div className="text-sm font-medium text-blue-600">{product.code}</div>
      </td>
      
      <td className="px-3 py-2 max-w-[200px]">
        <TruncateText text={product.name} maxLength={25} />
      </td>
      
      <td className="px-3 py-2 max-w-[150px]">
        <TruncateText text={product.genericName || '-'} maxLength={20} />
      </td>
      
      <td className="px-3 py-2">
        <span className="text-sm text-gray-600">{product.baseUnit}</span>
      </td>

      {categories.map((cat) => {
        const value = getCategoryValue(product.attributes || [], cat.id);
        return (
          <td key={cat.id} className="px-3 py-2 max-w-[120px]">
            <TruncateText text={value} maxLength={15} />
          </td>
        );
      })}

      <td className="px-3 py-2">
        {loadingStock ? (
          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        ) : stockSummary ? (
          <span className="text-sm text-gray-900">
            {stockSummary.totalQuantity.toLocaleString()}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>

      <td className="px-3 py-2">
        {loadingStock ? (
          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        ) : stockSummary && stockSummary.totalValue > 0 ? (
          <span className="text-sm text-gray-900">
            ฿{stockSummary.totalValue.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>

      <td className="px-3 py-2">
        <Badge
          variant="outline"
          className={
            product.isActive
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }
        >
          {product.isActive ? 'ใช้งาน' : 'ปิด'}
        </Badge>
      </td>

      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewClick(product)}
            className="h-7 w-7 p-0"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditClick(product)}
                className="h-7 w-7 p-0"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteClick(product)}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}