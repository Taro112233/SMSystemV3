// components/DepartmentStocksManagement/AddStockDialog.tsx
// UPDATED: Fix lint errors

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  code: string;
  name: string;
  genericName?: string;
  baseUnit: string;
}

interface StockData {
  productId: string;
}

interface AddStockDialogProps {
  orgSlug: string;
  deptSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddStockDialog({
  orgSlug,
  deptSlug,
  open,
  onOpenChange,
  onSuccess,
}: AddStockDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [openCombobox, setOpenCombobox] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    minStockLevel: '',
    maxStockLevel: '',
    reorderPoint: '',
    defaultWithdrawalQty: '',
  });

  // Fetch available products
  useEffect(() => {
    const fetchProducts = async () => {
      if (!open) return;

      try {
        setLoadingProducts(true);
        
        const params = new URLSearchParams();
        params.append('isActive', 'true');

        const response = await fetch(`/api/${orgSlug}/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        
        // Filter out products that already have stock in this department
        const existingStocksResponse = await fetch(`/api/${orgSlug}/${deptSlug}/stocks`);
        const existingStocksData = await existingStocksResponse.json();
        const existingProductIds = (existingStocksData.data as StockData[] || []).map((s) => s.productId);
        
        const availableProducts = (data.data || []).filter(
          (p: Product) => !existingProductIds.includes(p.id)
        );
        
        setProducts(availableProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('เกิดข้อผิดพลาด', {
          description: 'ไม่สามารถโหลดรายการสินค้าได้',
        });
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [open, orgSlug, deptSlug]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedProductId('');
      setFormData({
        location: '',
        minStockLevel: '',
        maxStockLevel: '',
        reorderPoint: '',
        defaultWithdrawalQty: '',
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast.error('ข้อมูลไม่ครบถ้วน', {
        description: 'กรุณาเลือกสินค้า',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/${orgSlug}/${deptSlug}/stocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductId,
          location: formData.location || null,
          minStockLevel: formData.minStockLevel ? parseInt(formData.minStockLevel) : null,
          maxStockLevel: formData.maxStockLevel ? parseInt(formData.maxStockLevel) : null,
          reorderPoint: formData.reorderPoint ? parseInt(formData.reorderPoint) : null,
          defaultWithdrawalQty: formData.defaultWithdrawalQty ? parseInt(formData.defaultWithdrawalQty) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add stock');
      }

      onSuccess();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: error instanceof Error ? error.message : 'ไม่สามารถเพิ่มสินค้าเข้าสต็อกได้',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>เพิ่มสินค้าเข้าสต็อก</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mt-4">
            {/* Product Selection - Combobox as Input */}
            <div className="space-y-2">
              <Label>
                เลือกสินค้า <span className="text-red-500">*</span>
              </Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between h-10 font-normal"
                    disabled={loading || loadingProducts}
                  >
                    {selectedProduct ? (
                      <span className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{selectedProduct.code}</span>
                        <span>-</span>
                        <span>{selectedProduct.name}</span>
                        {selectedProduct.genericName && (
                          <span className="text-xs text-gray-500">
                            ({selectedProduct.genericName})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500">ค้นหาและเลือกสินค้า...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ค้นหาสินค้า..." />
                    <CommandList>
                      <CommandEmpty>ไม่พบสินค้า</CommandEmpty>
                      <CommandGroup>
                        {loadingProducts ? (
                          <div className="p-2 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </div>
                        ) : (
                          products.map((product) => (
                            <CommandItem
                              key={product.id}
                              value={`${product.code} ${product.name} ${product.genericName || ''}`}
                              onSelect={() => {
                                setSelectedProductId(product.id);
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedProductId === product.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{product.code}</span>
                                <span>-</span>
                                <span>{product.name}</span>
                                {product.genericName && (
                                  <span className="text-xs text-gray-500">
                                    ({product.genericName})
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedProduct && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-900">หน่วยนับ:</span>
                    <span className="text-blue-700">{selectedProduct.baseUnit}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stock Configuration */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">การตั้งค่าสต็อก</h3>

              <div className="space-y-2">
                <Label htmlFor="location">ตำแหน่งเก็บ</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="เช่น ชั้น A-1"
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStockLevel">สต็อกต่ำสุด</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => handleChange('minStockLevel', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStockLevel">สต็อกสูงสุด</Label>
                  <Input
                    id="maxStockLevel"
                    type="number"
                    min="0"
                    value={formData.maxStockLevel}
                    onChange={(e) => handleChange('maxStockLevel', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">จุดสั่งซื้อ</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    min="0"
                    value={formData.reorderPoint}
                    onChange={(e) => handleChange('reorderPoint', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultWithdrawalQty">จำนวนเบิกคงที่</Label>
                  <Input
                    id="defaultWithdrawalQty"
                    type="number"
                    min="0"
                    value={formData.defaultWithdrawalQty}
                    onChange={(e) => handleChange('defaultWithdrawalQty', e.target.value)}
                    placeholder="0"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
              <strong>หมายเหตุ:</strong> หลังจากเพิ่มสินค้าเข้าสต็อกแล้ว
              คุณสามารถเพิ่ม Batch/Lot ได้ในหน้าจัดการสต็อก
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading || !selectedProductId}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                'เพิ่มเข้าสต็อก'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}