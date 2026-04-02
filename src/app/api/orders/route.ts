import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerId, cart, totals } = body;

    // Simulate logged in user ID (Using a mock ID since auth isn't wired yet)
    const MOCK_USER_ID = "mock-user-id";

    // Re-validate stock server-side
    for (const item of cart) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product || product.stock < item.cartQty) {
        return NextResponse.json({ error: `Insufficient stock for ${item.name}` }, { status: 400 });
      }
    }

    // 1. Create the Pending Order
    const order = await prisma.order.create({
      data: {
        customerId,
        status: 'PENDING',
        totalGross: totals.gross,
        totalVat: totals.vat,
        totalNet: totals.net,
        OrderItems: {
          create: cart.map((item: any) => ({
            productId: item.id,
            qty: item.cartQty,
            price: item.basePrice,
            vatAmount: item.isVatEnabled ? (item.basePrice * item.cartQty * 0.20) : 0,
            discountAmount: 0 // Mocked for now
          }))
        }
      }
    });

    // 2. Logging
    await prisma.auditLog.create({
      data: {
        userId: MOCK_USER_ID,
        action: 'CREATED_PENDING_ORDER',
        entity: 'ORDER',
        entityId: order.id,
        details: JSON.stringify({ gross: totals.gross, itemsCount: cart.length })
      }
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// Helper route for APPROVING an ORDER (which deducts stock)
export async function PUT(req: Request) {
  const { orderId, action } = await req.json();
  const MOCK_ADMIN_ID = "mock-admin-id";

  if (action === 'APPROVE') {
    // Transaction to safely approve and deduct stock
    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id: orderId }, include: { OrderItems: true } });
        if (!order || order.status !== 'PENDING') throw new Error('Order is not PENDING');

        // Re-validate and deduct stock safely (Prevent Negative)
        for (const item of order.OrderItems) {
          const product = await tx.product.findUnique({ where: { id: item.productId }});
          if (!product || product.stock < item.qty) throw new Error(`Negative stock prevention: Not enough stock for Product ID ${item.productId}`);
          
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: product.stock - item.qty }
          });

          // Log inventory transaction (OUT)
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: 'OUT',
              qty: item.qty,
              notes: `Order Approval Deduction for Order ${orderId}`
            }
          });
        }

        // Update Order
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'APPROVED', approvedBy: MOCK_ADMIN_ID }
        });

        // Audit Trail
        await tx.auditLog.create({
          data: {
            userId: MOCK_ADMIN_ID,
            action: 'APPROVED_ORDER_STOCK_DEDUCTED',
            entity: 'ORDER',
            entityId: orderId,
          }
        });
      });

      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
