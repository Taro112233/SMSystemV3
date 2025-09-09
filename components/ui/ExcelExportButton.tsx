// 📄 File: components/ui/ExcelExportButton.tsx (FIXED CLEAN)

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  ReceiptText,
  ChevronDown,
  Loader2,
} from "lucide-react";

// Define specific types for each variant
export type StockExportFormat = "requisition" | "detailed" | "summary";
export type TransactionExportFormat = "detailed" | "summary" | "financial";
export type StockManagementExportFormat = "excel";

type ExportFormat =
  | StockExportFormat
  | TransactionExportFormat
  | StockManagementExportFormat;

interface ExportButtonProps {
  selectedCount: number;
  disabled?: boolean;
  exporting?: boolean;
  variant?: "stock" | "transaction" | "stockManagement";
  className?: string;
  onExport: (format: ExportFormat) => void;
}

export function ExportButton({
  selectedCount,
  disabled = false,
  exporting = false,
  onExport,
  variant = "stock",
  className = "",
}: ExportButtonProps) {
  const stockOptions: {
    format: StockExportFormat;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      format: "requisition",
      label: "ใบเบิกยา",
      description: "รายการยาที่ต้องการเบิก",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      format: "detailed",
      label: "รายละเอียดเต็ม",
      description: "ข้อมูลครบถ้วนพร้อมราคา",
      icon: FileSpreadsheet,
      color: "text-green-600",
    },
    {
      format: "summary",
      label: "สรุปสต็อก",
      description: "ข้อมูลสรุปพื้นฐาน",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  const transactionOptions: {
    format: TransactionExportFormat;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      format: "detailed",
      label: "รายละเอียดครบถ้วน",
      description: "ข้อมูลทุก field",
      icon: FileSpreadsheet,
      color: "text-green-600",
    },
    {
      format: "summary",
      label: "สรุปย่อ",
      description: "สรุปเฉพาะรายการสำคัญ",
      icon: FileText,
      color: "text-blue-600",
    },
    {
      format: "financial",
      label: "รายงานการเงิน",
      description: "สรุปต้นทุน กำไร และมูลค่า",
      icon: ReceiptText,
      color: "text-purple-600",
    },
  ];

  const stockManagementOptions: {
    format: StockManagementExportFormat;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }[] = [
    {
      format: "excel",
      label: "Export Excel",
      description: "ดาวน์โหลดเป็นไฟล์ Excel",
      icon: FileSpreadsheet,
      color: "text-green-600",
    },
  ];

  let exportOptions:
    | typeof stockOptions
    | typeof transactionOptions
    | typeof stockManagementOptions;
  if (variant === "transaction") exportOptions = transactionOptions;
  else if (variant === "stock") exportOptions = stockOptions;
  else exportOptions = stockManagementOptions;

  if (variant === "stockManagement") {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || exporting || selectedCount === 0}
        onClick={() => onExport("excel")}
        className={`flex items-center gap-2 bg-[#217346] text-white hover:bg-[#1e5f3a] border-[#217346] hover:border-[#1e5f3a] ${className}`}
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {exporting ? "กำลัง Export..." : "Export Excel"}
      </Button>
    );
  }

  if (selectedCount === 0) {
    return (
      <Button
        disabled
        variant="outline"
        size="sm"
        className={`flex items-center gap-2 ${className}`}
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || exporting}
          className={`flex items-center gap-2 bg-[#217346] text-white hover:bg-[#1e5f3a] border-[#217346] hover:border-[#1e5f3a] ${className}`}
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {exporting ? "กำลัง Export..." : "Export"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          เลือกรูปแบบ Export
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({selectedCount} รายการ)
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {exportOptions.map((option) => (
          <DropdownMenuItem
            key={option.format}
            onClick={() => onExport(option.format)}
            disabled={exporting}
            className="flex items-start gap-3 p-3 cursor-pointer"
          >
            <option.icon className={`h-4 w-4 mt-0.5 ${option.color}`} />
            <div className="flex-1">
              <div className="font-medium">{option.label}</div>
              <div className="text-xs text-muted-foreground">
                {option.description}
              </div>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <div className="px-3 py-2 text-xs text-muted-foreground">
          รองรับ Excel (.xlsx) และ CSV (.csv)
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
