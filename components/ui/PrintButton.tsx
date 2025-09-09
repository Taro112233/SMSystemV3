// components/ui/PrintButton.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { Printer, Download, FileText, ChevronDown } from 'lucide-react'
import { usePrintPDF } from '@/hooks/usePrintPDF'
import { StockPrintData, PrintFormat, Department } from '@/types/print'
import { PharmacyPrintTemplate } from '../print/PharmacyPrintTemplate'

interface PrintButtonProps {
  stocks: StockPrintData[]
  department: Department
  selectedCount?: number
  disabled?: boolean
  className?: string
}

export function PrintButton({ 
  stocks, 
  department, 
  selectedCount = 0, 
  disabled = false,
  className = ''
}: PrintButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentFormat, setCurrentFormat] = useState<PrintFormat>('stock-summary')
  const { generateAndPrintPDF, downloadPDF } = usePrintPDF()

  const departmentName = department === 'PHARMACY' ? 'คลังยา' : 'OPD'

  const printOptions = [
    {
      format: 'stock-summary' as PrintFormat,
      label: 'สรุปสต็อกยา',
      description: 'รายงานสต็อกยาทั้งหมด',
      icon: FileText
    },
    {
      format: 'requisition-form' as PrintFormat,
      label: 'ใบเบิกยา',
      description: 'ใบเบิกยาสำหรับแผนก',
      icon: FileText
    },
    {
      format: 'low-stock-report' as PrintFormat,
      label: 'รายงานยาใกล้หมด',
      description: 'รายการยาที่ต่ำกว่าขั้นต่ำ',
      icon: FileText
    },
    {
      format: 'inventory-check' as PrintFormat,
      label: 'ใบตรวจนับสต็อก',
      description: 'แบบฟอร์มตรวจนับสต็อก',
      icon: FileText
    }
  ]

  const handlePrint = async (format: PrintFormat) => {
    setCurrentFormat(format)
    setIsVisible(true)

    // รอให้ template render
    setTimeout(async () => {
      try {
        const filename = `${printOptions.find(opt => opt.format === format)?.label}_${departmentName}`.replace(/\s+/g, '-')
        
        await generateAndPrintPDF('print-preview', {
          filename,
          orientation: format === 'inventory-check' ? 'landscape' : 'portrait'
        })
      } catch (error) {
        console.error('Print failed:', error)
      } finally {
        setIsVisible(false)
      }
    }, 100)
  }

  const handleDownload = async (format: PrintFormat) => {
    setCurrentFormat(format)
    setIsVisible(true)

    setTimeout(async () => {
      try {
        const filename = `${printOptions.find(opt => opt.format === format)?.label}_${departmentName}`.replace(/\s+/g, '-')
        
        await downloadPDF('print-preview', {
          filename,
          orientation: format === 'inventory-check' ? 'landscape' : 'portrait'
        })
      } catch (error) {
        console.error('Download failed:', error)
      } finally {
        setIsVisible(false)
      }
    }, 100)
  }

  const getFilteredStocks = (format: PrintFormat) => {
    switch (format) {
      case 'low-stock-report':
        return stocks.filter(stock => stock.totalQuantity <= stock.minimumStock)
      default:
        return stocks
    }
  }

  if (stocks.length === 0) {
    return (
      <Button disabled variant="outline" size="sm" className={className}>
        <Printer className="w-4 h-4 mr-2" />
        ไม่มีข้อมูลสำหรับพิมพ์
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={disabled}
            className={`flex items-center gap-2 ${className}`}
          >
            <Printer className="w-4 h-4" />
            พิมพ์เอกสาร
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            เลือกรูปแบบเอกสาร
            {selectedCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
              ({selectedCount} รายการ)
            </span>
            )}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {printOptions.map((option) => {
            const filteredStocks = getFilteredStocks(option.format)
            const count = filteredStocks.length
            
            return (
              <div key={option.format}>
                <DropdownMenuItem
                  onClick={() => handlePrint(option.format)}
                  disabled={count === 0}
                  className="flex items-start gap-3 p-3 cursor-pointer"
                >
                  <Printer className="w-4 h-4 mt-0.5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description} ({count} รายการ)
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => handleDownload(option.format)}
                  disabled={count === 0}
                  className="flex items-start gap-3 p-3 cursor-pointer ml-4"
                >
                  <Download className="w-4 h-4 mt-0.5 text-green-600" />
                  <div className="text-sm text-muted-foreground">
                    ดาวน์โหลด PDF
                  </div>
                </DropdownMenuItem>
              </div>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden Print Preview */}
      {isVisible && (
        <div className="fixed -top-[99999px] left-0 pointer-events-none">
          <div id="print-preview">
            <PharmacyPrintTemplate
              stocks={getFilteredStocks(currentFormat)}
              format={currentFormat}
              department={department}
              includeDate={true}
              includeSignature={true}
            />
          </div>
        </div>
      )}
    </>
  )
}