// components/ProductsManagement/ProductsTableRow.tsx
// ProductsTableRow - Return table cells only (tr is in parent)

'use client';

import { useState, useEffect } from 'react';
import { getCategoryValue } from '@/lib/category-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { ProductUnit } from '@/types/product-unit';
import { ProductData } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StockSummary {
  totalQuantity: number;
  totalValue: number;
  departmentCount: number;
}

interface DepartmentStockData {
  batches: BatchData[];
}

interface BatchData {
  quantity: number;
  costPrice: number | null;
}

interface ProductsTableRowProps {
  product: ProductData;
  categories: CategoryWithOptions[];
  productUnits: ProductUnit[];
  orgSlug: string;
  onEditClick: (product: ProductData) => void;
  onViewClick: (product: ProductData) => void;
  onDeleteClick: (product: ProductData) => void;
  canManage: boolean;
}

export default function ProductsTableRow({
  product,
  categories,
  orgSlug,
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
        const departments: DepartmentStockData[] = data.data.departments || [];

        let totalQuantity = 0;
        let totalValue = 0;

        departments.forEach((dept) => {
          dept.batches.forEach((batch) => {
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

  const TruncatedCell = ({ text, maxLength = 30 }: { text: string; maxLength?: number }) => {
    const shouldTruncate = text && text.length > maxLength;

    if (!shouldTruncate) {
      return <span className="text-sm text-gray-900">{text || '-'}</span>;
    }

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm text-gray-900 truncate block cursor-help" style={{ maxWidth: '200px' }}>
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
    <>
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-blue-600">
          {product.code}
        </div>
      </td>

      <td className="px-4 py-3">
        <TruncatedCell text={product.name} maxLength={40} />
      </td>

      <td className="px-4 py-3">
        <TruncatedCell text={product.genericName || '-'} maxLength={30} />
      </td>

      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">{product.baseUnit}</span>
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
          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        ) : stockSummary ? (
          <span className="text-sm font-medium text-gray-900">
            {stockSummary.totalQuantity.toLocaleString('th-TH')}
          </span>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )}
      </td>

      <td className="px-4 py-3">
        {loadingStock ? (
          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        ) : stockSummary && stockSummary.totalValue > 0 ? (
          <span className="text-sm text-gray-900">
            ฿{stockSummary.totalValue.toLocaleString('th-TH', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        ) : (
          <span className="text-sm text-gray-500">-</span>
        )}
      </td>

      <td className="px-4 py-3">
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
    </>
  );
}