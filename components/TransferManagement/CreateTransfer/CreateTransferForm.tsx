// components/TransferManagement/CreateTransfer/CreateTransferForm.tsx
// CreateTransferForm - UPDATED: Handle duplicate transferCode error + default requestReason

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CreateTransferData, TransferPriority } from '@/types/transfer';
import Step1BasicInfo from './Step1BasicInfo';
import Step2ProductSelection from './Step2ProductSelection';
import Step3ReviewSubmit from './Step3ReviewSubmit';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  slug: string;
}

interface ProductStock {
  stockId?: string;
  availableQuantity: number;
  lastUpdated: Date;
}

interface Product {
  id: string;
  code: string;
  name: string;
  genericName?: string;
  baseUnit: string;
  defaultWithdrawalQty?: number;
  requestingStock?: ProductStock;
  supplyingStock?: ProductStock;
}

interface SelectedProduct extends Product {
  quantity: number;
  notes?: string;
}

interface CreateTransferFormProps {
  organizationId: string;
  requestingDepartmentId: string;
  requestingDepartmentName: string;
  departments: Department[];
  products: Product[];
  orgSlug: string;
  deptSlug: string;
}

interface Step1FormData {
  transferCode: string;
  title: string;
  supplyingDepartmentId: string;
  requestReason: string;
  priority: TransferPriority;
  notes: string;
}

const DEFAULT_REQUEST_REASON = 'ข้าพเจ้าขอเบิกเวชภัณฑ์/พัสดุตามรายการที่แนบมาเพื่อใช้งาน';

export default function CreateTransferForm({
  requestingDepartmentId,
  requestingDepartmentName,
  departments,
  products: initialProducts,
  orgSlug,
  deptSlug,
}: CreateTransferFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [step1Data, setStep1Data] = useState<Step1FormData>({
    transferCode: '',
    title: '',
    supplyingDepartmentId: '',
    requestReason: DEFAULT_REQUEST_REASON,
    priority: 'NORMAL',
    notes: '',
  });

  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Load products with stock info
  const loadProductsWithStock = useCallback(async () => {
    try {
      if (!step1Data.supplyingDepartmentId) {
        setProducts(initialProducts);
        return;
      }

      const supplyingDept = departments.find(d => d.id === step1Data.supplyingDepartmentId);
      if (!supplyingDept) return;

      const response = await fetch(
        `/api/${orgSlug}/${deptSlug}/transfers/products?supplyingDept=${supplyingDept.slug}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load products with stock');
      }

      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error('Failed to load products with stock:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถโหลดข้อมูลสต็อกได้',
      });
    }
  }, [step1Data.supplyingDepartmentId, departments, initialProducts, orgSlug, deptSlug]);

  useEffect(() => {
    if (currentStep === 2) {
      loadProductsWithStock();
    }
  }, [currentStep, loadProductsWithStock]);

  const handleRefreshStock = async () => {
    setIsRefreshing(true);
    await loadProductsWithStock();
    toast.success('รีเฟรชข้อมูลสต็อกเรียบร้อย');
    setIsRefreshing(false);
  };

  const handleStep1Change = (data: Partial<Step1FormData>) => {
    setStep1Data((prev) => ({ ...prev, ...data }));
  };

  const canProceedStep1 = () => {
    return (
      step1Data.transferCode.trim() !== '' &&
      step1Data.title.trim() !== '' &&
      step1Data.supplyingDepartmentId !== '' &&
      step1Data.requestReason.trim() !== ''
    );
  };

  const canProceedStep2 = () => {
    return selectedProducts.length > 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !canProceedStep1()) {
      toast.error('ข้อมูลไม่ครบถ้วน', {
        description: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน',
      });
      return;
    }

    if (currentStep === 2 && !canProceedStep2()) {
      toast.error('ยังไม่ได้เลือกสินค้า', {
        description: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ',
      });
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const transferData: CreateTransferData = {
        transferCode: step1Data.transferCode.trim(),
        title: step1Data.title,
        supplyingDepartmentId: step1Data.supplyingDepartmentId,
        requestReason: step1Data.requestReason,
        priority: step1Data.priority,
        notes: step1Data.notes || undefined,
        items: selectedProducts.map((p) => ({
          productId: p.id,
          requestedQuantity: p.quantity,
          notes: p.notes || undefined,
        })),
      };

      const response = await fetch(`/api/${orgSlug}/transfers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transferData,
          requestingDepartmentId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle duplicate transferCode error (409)
        if (response.status === 409) {
          toast.error('เลขที่ใบเบิกซ้ำ', {
            description: data.message || 'เลขที่ใบเบิกนี้มีอยู่ในระบบแล้ว กรุณาใช้เลขที่อื่น',
            duration: 5000,
          });
          setCurrentStep(1); // Go back to Step 1
          return;
        }
        
        throw new Error(data.error || 'Failed to create transfer');
      }

      toast.success('สำเร็จ', {
        description: `สร้างใบเบิก ${data.data.code} เรียบร้อย`,
      });

      router.push(`/${orgSlug}/${deptSlug}/transfers`);
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error instanceof Error ? error.message : 'ไม่สามารถสร้างใบเบิกได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const supplyingDept = departments.find(
    (d) => d.id === step1Data.supplyingDepartmentId
  );

  return (
    <div className="space-y-8">
      {/* Progress Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">
            ขั้นตอน {currentStep} จาก {totalSteps}
          </span>
          <span className="text-gray-600">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`flex-1 text-center ${
              step < 3 ? 'border-r border-gray-200' : ''
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
                currentStep >= step
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
            <div
              className={`text-sm mt-2 font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step === 1 && 'ข้อมูลพื้นฐาน'}
              {step === 2 && 'เลือกสินค้า'}
              {step === 3 && 'ตรวจสอบ'}
            </div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[500px] py-6">
        {currentStep === 1 && (
          <Step1BasicInfo
            data={step1Data}
            departments={departments.filter((d) => d.id !== requestingDepartmentId)}
            onChange={handleStep1Change}
          />
        )}

        {currentStep === 2 && (
          <Step2ProductSelection
            products={products}
            selectedProducts={selectedProducts}
            onChange={setSelectedProducts}
            onRefreshStock={handleRefreshStock}
            isRefreshing={isRefreshing}
          />
        )}

        {currentStep === 3 && (
          <Step3ReviewSubmit
            step1Data={step1Data}
            selectedProducts={selectedProducts}
            supplyingDepartmentName={supplyingDept?.name || '-'}
            requestingDepartmentName={requestingDepartmentName}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || loading}
          className="gap-2"
          size="lg"
        >
          <ChevronLeft className="h-4 w-4" />
          ก่อนหน้า
        </Button>

        {currentStep < totalSteps ? (
          <Button 
            onClick={handleNext} 
            disabled={loading} 
            className="gap-2"
            size="lg"
          >
            ถัดไป
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[160px]"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังส่งใบเบิก...
              </>
            ) : (
              'ส่งใบเบิก'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}