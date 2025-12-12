// components/ProductsManagement/DeleteProductDialog.tsx
// DeleteProductDialog - UPDATED: Add animations

'use client';

import { useState } from 'react';
import { ProductData } from '@/types/product';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface DeleteProductDialogProps {
  product: ProductData | null;
  orgSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteProductDialog({
  product,
  orgSlug,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProductDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!product) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/${orgSlug}/products/${product.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถลบสินค้าได้';
      console.error('Error deleting product:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-2 bg-red-100 rounded-full"
              >
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </motion.div>
              <AlertDialogTitle>ยืนยันการลบสินค้า</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-3">
              คุณแน่ใจหรือไม่ที่จะลบสินค้า{' '}
              <span className="font-semibold text-gray-900">
                {product.name} ({product.code})
              </span>{' '}
              ออกจากระบบ?
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md"
              >
                <p className="text-sm text-yellow-800">
                  <strong>คำเตือน:</strong> การลบสินค้าจะลบข้อมูลที่เกี่ยวข้องทั้งหมด
                  และไม่สามารถกู้คืนได้
                </p>
              </motion.div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ลบสินค้า
            </Button>
          </AlertDialogFooter>
        </motion.div>
      </AlertDialogContent>
    </AlertDialog>
  );
}