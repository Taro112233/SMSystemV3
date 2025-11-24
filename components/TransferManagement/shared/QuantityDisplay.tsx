// components/TransferManagement/shared/QuantityDisplay.tsx
// QuantityDisplay - Quantity formatter with unit - FIXED null safety

'use client';

interface QuantityDisplayProps {
  quantity: number | null | undefined;
  unit: string;
  className?: string;
  showZero?: boolean; // แสดง 0 หรือแสดง "-"
}

export default function QuantityDisplay({ 
  quantity, 
  unit, 
  className = '',
  showZero = true,
}: QuantityDisplayProps) {
  // ✅ Handle null/undefined
  if (quantity === null || quantity === undefined) {
    return <span className={className}>-</span>;
  }

  // ✅ Handle zero display
  if (quantity === 0 && !showZero) {
    return <span className={className}>-</span>;
  }

  return (
    <span className={className}>
      {quantity.toLocaleString('th-TH')} {unit}
    </span>
  );
}