// lib/stock-helpers.ts
// Stock quantity calculation helpers

import { prisma } from '@/lib/prisma';

/**
 * Calculate total quantities for a stock (from all batches)
 */
export async function calculateStockSummary(stockId: string) {
  const batches = await prisma.stockBatch.findMany({
    where: {
      stockId,
      isActive: true,
      status: { not: 'EXPIRED' }
    }
  });

  return {
    totalQuantity: batches.reduce((sum, b) => sum + b.totalQuantity, 0),
    availableQuantity: batches.reduce((sum, b) => sum + b.availableQuantity, 0),
    reservedQuantity: batches.reduce((sum, b) => sum + b.reservedQuantity, 0),
    incomingQuantity: batches.reduce((sum, b) => sum + b.incomingQuantity, 0),
  };
}

/**
 * Get stock with computed quantities
 */
export async function getStockWithQuantities(stockId: string) {
  const stock = await prisma.stock.findUnique({
    where: { id: stockId },
    include: {
      product: true,
      department: true,
      stockBatches: {
        where: {
          isActive: true,
          status: { not: 'EXPIRED' }
        }
      }
    }
  });

  if (!stock) return null;

  const quantities = await calculateStockSummary(stockId);

  return {
    ...stock,
    ...quantities,
  };
}

/**
 * Get department stocks with quantities
 */
export async function getDepartmentStocksWithQuantities(departmentId: string) {
  const stocks = await prisma.stock.findMany({
    where: { departmentId },
    include: {
      product: true,
      stockBatches: {
        where: {
          isActive: true,
          status: { not: 'EXPIRED' }
        }
      }
    }
  });

  return Promise.all(
    stocks.map(async (stock) => {
      const quantities = await calculateStockSummary(stock.id);
      return {
        ...stock,
        ...quantities,
      };
    })
  );
}

/**
 * Check if stock is below minimum level
 */
export async function isStockLow(stockId: string): Promise<boolean> {
  const stock = await prisma.stock.findUnique({
    where: { id: stockId },
    select: { minStockLevel: true }
  });

  if (!stock?.minStockLevel) return false;

  const { availableQuantity } = await calculateStockSummary(stockId);
  return availableQuantity < stock.minStockLevel;
}

/**
 * Reserve quantity in batches (FIFO - First In First Out)
 */
export async function reserveStockQuantity(
  stockId: string,
  quantity: number,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  // Get available batches sorted by receivedAt (FIFO)
  const batches = await prisma.stockBatch.findMany({
    where: {
      stockId,
      isActive: true,
      status: 'AVAILABLE',
      availableQuantity: { gt: 0 }
    },
    orderBy: { receivedAt: 'asc' }
  });

  let remaining = quantity;

  for (const batch of batches) {
    if (remaining <= 0) break;

    const reserveQty = Math.min(remaining, batch.availableQuantity);

    await prisma.stockBatch.update({
      where: { id: batch.id },
      data: {
        reservedQuantity: { increment: reserveQty },
        availableQuantity: { decrement: reserveQty },
        status: batch.availableQuantity === reserveQty ? 'RESERVED' : batch.status,
        updatedBy: userId
      }
    });

    remaining -= reserveQty;
  }

  if (remaining > 0) {
    return {
      success: false,
      error: `ไม่สามารถจองได้เต็มจำนวน ขาดอีก ${remaining} หน่วย`
    };
  }

  return { success: true };
}

/**
 * Release reserved quantity
 */
export async function releaseReservedQuantity(
  stockId: string,
  quantity: number,
  userId: string
): Promise<void> {
  const batches = await prisma.stockBatch.findMany({
    where: {
      stockId,
      isActive: true,
      reservedQuantity: { gt: 0 }
    },
    orderBy: { receivedAt: 'asc' }
  });

  let remaining = quantity;

  for (const batch of batches) {
    if (remaining <= 0) break;

    const releaseQty = Math.min(remaining, batch.reservedQuantity);

    await prisma.stockBatch.update({
      where: { id: batch.id },
      data: {
        reservedQuantity: { decrement: releaseQty },
        availableQuantity: { increment: releaseQty },
        status: 'AVAILABLE',
        updatedBy: userId
      }
    });

    remaining -= releaseQty;
  }
}

/**
 * Adjust batch quantity (for stock adjustments)
 * @param batchId - The batch ID to adjust
 * @param adjustment - The quantity adjustment (positive or negative)
 * @param userId - The user making the adjustment
 */
export async function adjustBatchQuantity(
  batchId: string,
  adjustment: number,
  userId: string
): Promise<void> {
  await prisma.stockBatch.update({
    where: { id: batchId },
    data: {
      totalQuantity: { increment: adjustment },
      availableQuantity: { increment: adjustment },
      updatedBy: userId
    }
  });
}