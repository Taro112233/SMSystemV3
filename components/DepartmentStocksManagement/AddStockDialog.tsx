// components/DepartmentStocksManagement/AddStockDialog.tsx
// AddStockDialog - Select product and initialize stock configuration

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  code: string;
  name: string;
  genericName?: string;
  baseUnit: string;
}

interface AddStockDialogProps {
  orgSlug: string;
  deptSlug: string;
  departmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddStockDialog({
  orgSlug,
  deptSlug,
  departmentId,
  open,
  onOpenChange,
  onSuccess,
}: AddStockDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
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
        if (searchTerm) {
          params.append('search', searchTerm);
        }

        const response = await fetch(`/api/${orgSlug}/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        
        // Filter out products that already have stock in this department
        const existingStocksResponse = await fetch(`/api/${orgSlug}/${deptSlug}/stocks`);
        const existingStocksData = await existingStocksResponse.json();
        const existingProductIds = existingStocksData.data?.map((s: any) => s.productId) || [];
        
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
  }, [open, orgSlug, deptSlug, searchTerm]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedProductId('');
      setSearchTerm('');
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
            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product">
                เลือกสินค้า <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                    disabled={loading || loadingProducts}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกสินค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingProducts ? (
                        <div className="p-2 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      ) : products.length === 0 ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          ไม่พบสินค้าที่พร้อมใช้งาน
                        </div>
                      ) : (
                        products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
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
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ค้นหาสินค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    disabled={loading}
                  />
                </div>
              </div>
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