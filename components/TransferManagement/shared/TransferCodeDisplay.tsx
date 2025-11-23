// components/TransferManagement/shared/TransferCodeDisplay.tsx
// TransferCodeDisplay - Transfer code formatter

'use client';

interface TransferCodeDisplayProps {
  code: string;
  className?: string;
}

export default function TransferCodeDisplay({ code, className = '' }: TransferCodeDisplayProps) {
  return (
    <span className={`font-mono font-semibold text-blue-600 ${className}`}>
      {code}
    </span>
  );
}