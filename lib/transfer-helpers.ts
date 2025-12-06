// lib/transfer-helpers.ts
// ===== TRANSFER SYSTEM BUSINESS LOGIC - UPDATED =====

import { prisma } from '@/lib/prisma';
import { createUserSnapshot } from '@/lib/user-snapshot';
import { createAuditLog } from '@/lib/audit-logger';
import { Prisma } from '@prisma/client';


// ===== TYPE DEFINITIONS =====

interface CreateTransferRequest {
  organizationId: string;
  transferCode: string;
  requestingDepartmentId: string;
  supplyingDepartmentId: string;
  title: string;
  requestReason?: string;
  notes?: string;
  priority?: 'NORMAL' | 'URGENT' | 'CRITICAL';
  items: Array<{
    productId: string;
    requestedQuantity: number;
    notes?: string;
  }>;
  requestedBy: string;
}

interface ApproveItemRequest {
  itemId: string;
  approvedQuantity: number;
  notes?: string;
  approvedBy: string;
}

interface PrepareItemRequest {
  itemId: string;
  preparedQuantity: number;
  selectedBatches: Array<{
    batchId: string;
    lotNumber: string;
    quantity: number;
  }>;
  notes?: string;
  preparedBy: string;
}

interface DeliverItemRequest {
  itemId: string;
  receivedQuantity: number;
  notes?: string;
  deliveredBy: string;
}

// ===== 1. CREATE TRANSFER =====

export async function createTransfer(data: CreateTransferRequest) {
  const { organizationId, transferCode, requestingDepartmentId, supplyingDepartmentId, items, requestedBy } = data;

  if (requestingDepartmentId === supplyingDepartmentId) {
    throw new Error('Cannot create transfer to the same department');
  }

  const [requestingDept, supplyingDept] = await Promise.all([
    prisma.department.findFirst({
      where: { id: requestingDepartmentId, organizationId, isActive: true }
    }),
    prisma.department.findFirst({
      where: { id: supplyingDepartmentId, organizationId, isActive: true }
    })
  ]);

  if (!requestingDept || !supplyingDept) {
    throw new Error('Invalid departments');
  }

  const requestedBySnapshot = await createUserSnapshot(requestedBy, organizationId);

  const productIds = items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      organizationId,
      isActive: true
    }
  });

  if (products.length !== productIds.length) {
    throw new Error('Some products not found or inactive');
  }

  const transfer = await prisma.$transaction(async (tx) => {
    const newTransfer = await tx.transfer.create({
      data: {
        organizationId,
        code: transferCode.trim(),
        title: data.title,
        requestingDepartmentId,
        supplyingDepartmentId,
        requestReason: data.requestReason,
        notes: data.notes,
        priority: data.priority || 'NORMAL',
        status: 'PENDING',
        requestedBy,
        requestedBySnapshot: requestedBySnapshot as Prisma.InputJsonValue,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            requestedQuantity: item.requestedQuantity,
            status: 'PENDING',
            notes: item.notes,
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        requestingDepartment: true,
        supplyingDepartment: true,
      }
    });

    await tx.transferHistory.create({
      data: {
        transferId: newTransfer.id,
        action: 'CREATED',
        toStatus: 'PENDING',
        changedBy: requestedBy,
        changedBySnapshot: requestedBySnapshot as Prisma.InputJsonValue,
        notes: 'Transfer request created',
      }
    });

    return newTransfer;
  });

  await createAuditLog({
    organizationId,
    userId: requestedBy,
    userSnapshot: requestedBySnapshot,
    action: 'transfers.create',
    category: 'TRANSFER',
    severity: 'INFO',
    description: `สร้างใบเบิก ${transferCode}: ${data.title}`,
    resourceId: transfer.id,
    resourceType: 'Transfer',
    payload: {
      transferCode,
      fromDept: supplyingDept.name,
      toDept: requestingDept.name,
      itemCount: items.length,
      totalQuantity: items.reduce((sum, i) => sum + i.requestedQuantity, 0),
    } as Prisma.InputJsonValue
  });

  return transfer;
}

// ===== 2. APPROVE ITEM =====

export async function approveTransferItem(data: ApproveItemRequest) {
  const { itemId, approvedQuantity, notes, approvedBy } = data;

  const item = await prisma.transferItem.findUnique({
    where: { id: itemId },
    include: {
      transfer: {
        include: {
          supplyingDepartment: true,
          requestingDepartment: true,
        }
      },
      product: true,
    }
  });

  if (!item) {
    throw new Error('Transfer item not found');
  }

  if (item.status !== 'PENDING') {
    throw new Error(`Cannot approve item with status: ${item.status}`);
  }

  if (approvedQuantity <= 0 || approvedQuantity > item.requestedQuantity) {
    throw new Error('Invalid approved quantity');
  }

  const approvedBySnapshot = await createUserSnapshot(approvedBy, item.transfer.organizationId);

  const updatedItem = await prisma.$transaction(async (tx) => {
    const updated = await tx.transferItem.update({
      where: { id: itemId },
      data: {
        status: 'APPROVED',
        approvedQuantity,
        approvedAt: new Date(),
        notes: notes || item.notes,
      }
    });

    const allItems = await tx.transferItem.findMany({
      where: { transferId: item.transferId }
    });

    const allApproved = allItems.every(i => 
      i.status === 'APPROVED' || i.status === 'PREPARED' || i.status === 'DELIVERED'
    );

    if (!item.transfer.approvedAt) {
      await tx.transfer.update({
        where: { id: item.transferId },
        data: {
          status: allApproved ? 'APPROVED' : 'PARTIAL',
          approvedAt: new Date(),
        }
      });
    }

    await tx.transferHistory.create({
      data: {
        transferId: item.transferId,
        itemId,
        action: 'APPROVED',
        fromStatus: 'PENDING',
        toStatus: 'APPROVED',
        changedBy: approvedBy,
        changedBySnapshot: approvedBySnapshot as Prisma.InputJsonValue,
        notes,
      }
    });

    return updated;
  });

  await createAuditLog({
    organizationId: item.transfer.organizationId,
    userId: approvedBy,
    userSnapshot: approvedBySnapshot,
    departmentId: item.transfer.supplyingDepartmentId,
    action: 'transfers.approve_item',
    category: 'TRANSFER',
    severity: 'INFO',
    description: `อนุมัติรายการ ${item.product.name} จำนวน ${approvedQuantity} ${item.product.baseUnit}`,
    resourceId: itemId,
    resourceType: 'TransferItem',
    payload: {
      transferCode: item.transfer.code,
      productCode: item.product.code,
      requestedQuantity: item.requestedQuantity,
      approvedQuantity,
    } as Prisma.InputJsonValue
  });

  return updatedItem;
}

// ===== 3. PREPARE ITEM =====

export async function prepareTransferItem(data: PrepareItemRequest) {
  const { itemId, preparedQuantity, selectedBatches, notes, preparedBy } = data;

  const item = await prisma.transferItem.findUnique({
    where: { id: itemId },
    include: {
      transfer: {
        include: {
          supplyingDepartment: true,
          requestingDepartment: true,
        }
      },
      product: true,
    }
  });

  if (!item) {
    throw new Error('Transfer item not found');
  }

  if (item.status !== 'APPROVED') {
    throw new Error(`Cannot prepare item with status: ${item.status}`);
  }

  if (!item.approvedQuantity) {
    throw new Error('Item not approved yet');
  }

  if (preparedQuantity <= 0 || preparedQuantity > item.approvedQuantity) {
    throw new Error('Invalid prepared quantity');
  }

  const totalBatchQuantity = selectedBatches.reduce((sum, b) => sum + b.quantity, 0);
  if (totalBatchQuantity !== preparedQuantity) {
    throw new Error('Batch quantities do not match prepared quantity');
  }

  const batchIds = selectedBatches.map(b => b.batchId);
  const batches = await prisma.stockBatch.findMany({
    where: {
      id: { in: batchIds },
      stock: {
        productId: item.productId,
        departmentId: item.transfer.supplyingDepartmentId,
      },
      isActive: true,
      status: 'AVAILABLE',
    }
  });

  if (batches.length !== batchIds.length) {
    throw new Error('Some batches not found or unavailable');
  }

  for (const selectedBatch of selectedBatches) {
    const batch = batches.find(b => b.id === selectedBatch.batchId);
    if (!batch || batch.availableQuantity < selectedBatch.quantity) {
      throw new Error(`Insufficient quantity in batch ${selectedBatch.lotNumber}`);
    }
  }

  const preparedBySnapshot = await createUserSnapshot(preparedBy, item.transfer.organizationId);

  const updatedItem = await prisma.$transaction(async (tx) => {
    const updated = await tx.transferItem.update({
      where: { id: itemId },
      data: {
        status: 'PREPARED',
        preparedQuantity,
        preparedAt: new Date(),
        notes: notes || item.notes,
      }
    });

    for (const selectedBatch of selectedBatches) {
      await tx.transferBatch.create({
        data: {
          transferItemId: itemId,
          batchId: selectedBatch.batchId,
          quantity: selectedBatch.quantity,
        }
      });

      await tx.stockBatch.update({
        where: { id: selectedBatch.batchId },
        data: {
          availableQuantity: { decrement: selectedBatch.quantity },
          reservedQuantity: { increment: selectedBatch.quantity },
        }
      });
    }

    const allItems = await tx.transferItem.findMany({
      where: { transferId: item.transferId }
    });

    const allPrepared = allItems.every(i => 
      i.status === 'PREPARED' || i.status === 'DELIVERED'
    );

    if (allPrepared) {
      await tx.transfer.update({
        where: { id: item.transferId },
        data: {
          status: 'PREPARED',
          preparedAt: new Date(),
        }
      });
    }

    const stock = await tx.stock.findFirst({
      where: {
        productId: item.productId,
        departmentId: item.transfer.requestingDepartmentId,
      }
    });

    if (stock) {
      await tx.stock.update({
        where: { id: stock.id },
        data: {
          lastMovement: new Date(),
        }
      });
    }

    await tx.transferHistory.create({
      data: {
        transferId: item.transferId,
        itemId,
        action: 'PREPARED',
        fromStatus: 'APPROVED',
        toStatus: 'PREPARED',
        changedBy: preparedBy,
        changedBySnapshot: preparedBySnapshot as Prisma.InputJsonValue,
        notes,
      }
    });

    return updated;
  });

  await createAuditLog({
    organizationId: item.transfer.organizationId,
    userId: preparedBy,
    userSnapshot: preparedBySnapshot,
    departmentId: item.transfer.supplyingDepartmentId,
    action: 'transfers.prepare_item',
    category: 'TRANSFER',
    severity: 'INFO',
    description: `จัดเตรียมสินค้า ${item.product.name} จำนวน ${preparedQuantity} ${item.product.baseUnit}`,
    resourceId: itemId,
    resourceType: 'TransferItem',
    payload: {
      transferCode: item.transfer.code,
      productCode: item.product.code,
      preparedQuantity,
      batchCount: selectedBatches.length,
    } as Prisma.InputJsonValue
  });

  return updatedItem;
}

// ===== 4. DELIVER ITEM =====
export async function deliverTransferItem(data: DeliverItemRequest) {
  const { itemId, receivedQuantity, batchDeliveries, notes, deliveredBy } = data;

  const item = await prisma.transferItem.findUnique({
    where: { id: itemId },
    include: {
      transfer: {
        include: {
          supplyingDepartment: true,
          requestingDepartment: true,
        }
      },
      product: true,
      batches: {
        include: {
          batch: true
        }
      }
    }
  });

  if (!item) {
    throw new Error('Transfer item not found');
  }

  if (item.status !== 'PREPARED') {
    throw new Error(`Cannot deliver item with status: ${item.status}`);
  }

  if (!item.preparedQuantity) {
    throw new Error('Item not prepared yet');
  }

  if (receivedQuantity <= 0 || receivedQuantity > item.preparedQuantity) {
    throw new Error('Invalid received quantity');
  }

  if (!item.batches || item.batches.length === 0) {
    throw new Error('No batches selected');
  }

  if (!batchDeliveries || batchDeliveries.length === 0) {
    throw new Error('Batch deliveries are required');
  }

  const totalBatchReceived = batchDeliveries.reduce((sum, bd) => sum + bd.receivedQuantity, 0);
  if (totalBatchReceived !== receivedQuantity) {
    throw new Error('Batch quantities do not match total received quantity');
  }

  for (const bd of batchDeliveries) {
    const transferBatch = item.batches.find(tb => tb.batchId === bd.batchId);
    if (!transferBatch) {
      throw new Error(`Batch ${bd.batchId} not found in transfer`);
    }
    if (bd.receivedQuantity < 0 || bd.receivedQuantity > transferBatch.quantity) {
      throw new Error(`Invalid received quantity for batch ${bd.batchId}`);
    }
  }

  const deliveredBySnapshot = await createUserSnapshot(deliveredBy, item.transfer.organizationId);

  const updatedItem = await prisma.$transaction(async (tx) => {
    const updated = await tx.transferItem.update({
      where: { id: itemId },
      data: {
        status: 'DELIVERED',
        receivedQuantity,
        deliveredAt: new Date(),
        notes: notes || item.notes,
      }
    });

    // ✅ UPDATED: Update each TransferBatch with receivedQuantity
    for (const bd of batchDeliveries) {
      const transferBatch = item.batches.find(tb => tb.batchId === bd.batchId);
      if (!transferBatch) continue;

      const sourceBatch = transferBatch.batch;

      // ✅ Update TransferBatch with received quantity
      await tx.transferBatch.update({
        where: { id: transferBatch.id },
        data: {
          receivedQuantity: bd.receivedQuantity, // ✅ Save received quantity
        }
      });

      // Deduct from source batch
      await tx.stockBatch.update({
        where: { id: sourceBatch.id },
        data: {
          totalQuantity: { decrement: bd.receivedQuantity },
          reservedQuantity: { decrement: transferBatch.quantity },
        }
      });

      // Find or create destination stock
      let destStock = await tx.stock.findFirst({
        where: {
          productId: item.productId,
          departmentId: item.transfer.requestingDepartmentId,
        }
      });

      if (!destStock) {
        destStock = await tx.stock.create({
          data: {
            organizationId: item.transfer.organizationId,
            departmentId: item.transfer.requestingDepartmentId,
            productId: item.productId,
            createdBy: deliveredBy,
            createdBySnapshot: deliveredBySnapshot as Prisma.InputJsonValue,
          }
        });
      }

      // Find or create destination batch
      const destBatch = await tx.stockBatch.findFirst({
        where: {
          stockId: destStock.id,
          lotNumber: sourceBatch.lotNumber,
        }
      });

      if (destBatch) {
        await tx.stockBatch.update({
          where: { id: destBatch.id },
          data: {
            totalQuantity: { increment: bd.receivedQuantity },
            availableQuantity: { increment: bd.receivedQuantity },
          }
        });
      } else {
        await tx.stockBatch.create({
          data: {
            stockId: destStock.id,
            lotNumber: sourceBatch.lotNumber,
            expiryDate: sourceBatch.expiryDate,
            manufactureDate: sourceBatch.manufactureDate,
            supplier: sourceBatch.supplier,
            costPrice: sourceBatch.costPrice,
            sellingPrice: sourceBatch.sellingPrice,
            totalQuantity: bd.receivedQuantity,
            availableQuantity: bd.receivedQuantity,
            reservedQuantity: 0,
            incomingQuantity: 0,
            location: destStock.location,
            status: 'AVAILABLE',
            isActive: true,
            createdBy: deliveredBy,
            createdBySnapshot: deliveredBySnapshot as Prisma.InputJsonValue,
            receivedAt: new Date(),
          }
        });
      }

      await tx.stock.update({
        where: { id: destStock.id },
        data: {
          lastMovement: new Date(),
          updatedBy: deliveredBy,
          updatedBySnapshot: deliveredBySnapshot as Prisma.InputJsonValue,
        }
      });
    }

    // Check if all items delivered
    const allItems = await tx.transferItem.findMany({
      where: { transferId: item.transferId }
    });

    const allDelivered = allItems.every(i => 
      i.status === 'DELIVERED' || i.status === 'CANCELLED'
    );

    if (allDelivered) {
      await tx.transfer.update({
        where: { id: item.transferId },
        data: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
        }
      });
    }

    await tx.transferHistory.create({
      data: {
        transferId: item.transferId,
        itemId,
        action: 'DELIVERED',
        fromStatus: 'PREPARED',
        toStatus: 'DELIVERED',
        changedBy: deliveredBy,
        changedBySnapshot: deliveredBySnapshot as Prisma.InputJsonValue,
        notes,
      }
    });

    return updated;
  });

  await createAuditLog({
    organizationId: item.transfer.organizationId,
    userId: deliveredBy,
    userSnapshot: deliveredBySnapshot,
    departmentId: item.transfer.requestingDepartmentId,
    action: 'transfers.deliver_item',
    category: 'TRANSFER',
    severity: 'INFO',
    description: `รับสินค้า ${item.product.name} จำนวน ${receivedQuantity} ${item.product.baseUnit}`,
    resourceId: itemId,
    resourceType: 'TransferItem',
    payload: {
      transferCode: item.transfer.code,
      productCode: item.product.code,
      preparedQuantity: item.preparedQuantity,
      receivedQuantity,
      batchCount: batchDeliveries.filter(bd => bd.receivedQuantity > 0).length,
    } as Prisma.InputJsonValue
  });

  return updatedItem;
}

// Update interface
interface DeliverItemRequest {
  itemId: string;
  receivedQuantity: number;
  batchDeliveries: {
    batchId: string;
    receivedQuantity: number;
  }[];
  notes?: string;
  deliveredBy: string;
}

// ===== 5. CANCEL ITEM =====

export async function cancelTransferItem(
  itemId: string, 
  reason: string, 
  cancelledBy: string
) {
  const item = await prisma.transferItem.findUnique({
    where: { id: itemId },
    include: {
      transfer: true,
      product: true,
      batches: true,
    }
  });

  if (!item) {
    throw new Error('Transfer item not found');
  }

  if (item.status === 'DELIVERED' || item.status === 'CANCELLED') {
    throw new Error(`Cannot cancel item with status: ${item.status}`);
  }

  const cancelledBySnapshot = await createUserSnapshot(cancelledBy, item.transfer.organizationId);

  const updatedItem = await prisma.$transaction(async (tx) => {
    if (item.status === 'PREPARED' && item.batches.length > 0) {
      for (const transferBatch of item.batches) {
        await tx.stockBatch.update({
          where: { id: transferBatch.batchId },
          data: {
            availableQuantity: { increment: transferBatch.quantity },
            reservedQuantity: { decrement: transferBatch.quantity },
          }
        });
      }

      await tx.transferBatch.deleteMany({
        where: { transferItemId: itemId }
      });
    }

    const updated = await tx.transferItem.update({
      where: { id: itemId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
      }
    });

    await tx.transferHistory.create({
      data: {
        transferId: item.transferId,
        itemId,
        action: 'CANCELLED',
        fromStatus: item.status,
        toStatus: 'CANCELLED',
        changedBy: cancelledBy,
        changedBySnapshot: cancelledBySnapshot as Prisma.InputJsonValue,
        notes: reason,
      }
    });

    return updated;
  });

  return updatedItem;
}

// ===== 6. CANCEL TRANSFER =====

export async function cancelTransfer(
  transferId: string,
  reason: string,
  cancelledBy: string
) {
  const transfer = await prisma.transfer.findUnique({
    where: { id: transferId },
    include: {
      items: true,
    }
  });

  if (!transfer) {
    throw new Error('Transfer not found');
  }

  if (transfer.status === 'DELIVERED' || transfer.status === 'CANCELLED') {
    throw new Error(`Cannot cancel transfer with status: ${transfer.status}`);
  }

  const cancelledBySnapshot = await createUserSnapshot(cancelledBy, transfer.organizationId);

  await prisma.$transaction(async (tx) => {
    for (const item of transfer.items) {
      if (item.status !== 'DELIVERED' && item.status !== 'CANCELLED') {
        await cancelTransferItem(item.id, reason, cancelledBy);
      }
    }

    await tx.transfer.update({
      where: { id: transferId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason,
      }
    });

    await tx.transferHistory.create({
      data: {
        transferId,
        action: 'CANCELLED',
        fromStatus: transfer.status,
        toStatus: 'CANCELLED',
        changedBy: cancelledBy,
        changedBySnapshot: cancelledBySnapshot as Prisma.InputJsonValue,
        notes: reason,
      }
    });
  });

  return true;
}

// ===== QUERY HELPERS =====

export async function getTransfersByDepartment(
  organizationId: string,
  departmentId: string,
  type: 'requesting' | 'supplying' = 'requesting'
) {
  const whereClause = type === 'requesting'
    ? { requestingDepartmentId: departmentId }
    : { supplyingDepartmentId: departmentId };

  return await prisma.transfer.findMany({
    where: {
      organizationId,
      ...whereClause,
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      requestingDepartment: true,
      supplyingDepartment: true,
    },
    orderBy: {
      requestedAt: 'desc',
    }
  });
}

export async function getTransferWithDetails(transferId: string) {
  return await prisma.transfer.findUnique({
    where: { id: transferId },
    include: {
      items: {
        include: {
          product: true,
          batches: {
            include: {
              batch: true
            }
          }
        }
      },
      requestingDepartment: true,
      supplyingDepartment: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}