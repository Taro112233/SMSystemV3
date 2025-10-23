// components/ProductsManagement/ProductsTableRow.tsx
// ProductsTableRow - Individual table row with category columns

'use client';

import { getCategoryValue } from '@/lib/category-helpers';
import { CategoryWithOptions } from '@/lib/category-helpers';
import { Switch } from '@/components/ui/switch';

interface ProductsTableRowProps {
  product: any;
  categories: CategoryWithOptions[];
  onEditClick: (product: any) => void;
  onViewClick: (product: any) => void;
  onDeleteClick: (product: any) => void;
  onToggleStatus: (product: any, newStatus: boolean) => void;
  canManage: boolean;
  pendingStatusChange?: boolean;
}

export default function ProductsTableRow({
  product,
  categories,
  onEditClick,
  onViewClick,
  onDeleteClick,
  onToggleStatus,
  canManage,
  pendingStatusChange,
}: ProductsTableRowProps) {
  // Mock stock quantity (replace with real data later)
  const mockStockQuantity = Math.floor(Math.random() * 1000);

  // Determine current status (pending change takes priority)
  const currentStatus = pendingStatusChange !== undefined ? pendingStatusChange : product.isActive;
  const hasPendingChange = pendingStatusChange !== undefined;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* รหัสสินค้า - คลิกดูรายละเอียด */}
      <td 
        className="px-4 py-3 cursor-pointer"
        onClick={() => onViewClick(product)}
      >
        <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
          {product.code}
        </div>
      </td>

      {/* ชื่อสินค้า - คลิกดูรายละเอียด */}
      <td 
        className="px-4 py-3 cursor-pointer"
        onClick={() => onViewClick(product)}
      >
        <div className="text-sm text-gray-900 hover:text-blue-600">
          {product.name}
        </div>
        {product.genericName && (
          <div className="text-xs text-gray-500">({product.genericName})</div>
        )}
      </td>

      {/* Category Columns (Dynamic) */}
      {categories.map((category) => (
        <td key={category.id} className="px-4 py-3">
          <div className="text-sm text-gray-600">
            {getCategoryValue(product.attributes || [], category.id)}
          </div>
        </td>
      ))}

      {/* จำนวนคงเหลือ (Mock) */}
      <td className="px-4 py-3">
        <div className="text-sm font-medium text-gray-900">
          {mockStockQuantity.toLocaleString()}
        </div>
      </td>

      {/* หน่วยนับ */}
      <td className="px-4 py-3">
        <div className="text-sm text-gray-900">{product.baseUnit}</div>
      </td>

      {/* สถานะ (Switch) - ✅ ไม่ disable ให้ logic จัดการเอง */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={currentStatus}
            onCheckedChange={(checked) => onToggleStatus(product, checked)}
            className="data-[state=checked]:bg-green-600"
          />
          <span className={`text-xs ${hasPendingChange ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
            {currentStatus ? 'เปิด' : 'ปิด'}
            {hasPendingChange && ' *'}
          </span>
        </div>
      </td>
    </tr>
  );
}