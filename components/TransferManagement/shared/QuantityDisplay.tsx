// components/TransferManagement/shared/QuantityDisplay.tsx
// QuantityDisplay - Quantity formatter with unit

'use client';

interface QuantityDisplayProps {
  quantity: number;
  unit: string;
  className?: string;
}

export default function QuantityDisplay({ 
  quantity, 
  unit, 
  className = '' 
}: QuantityDisplayProps) {
  return (
    <span className={className}>
      {quantity.toLocaleString('th-TH')} {unit}
    </span>
  );
}