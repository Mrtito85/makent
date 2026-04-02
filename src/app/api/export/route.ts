import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' }
    });

    let csvContent = 'Order ID,Date,Customer Name,Customer ID,Total Net (Rs.),Total VAT (Rs.),Total Gross (Rs.),Production Status,Payment Status\n';
    
    orders.forEach(order => {
      const row = [
        order.id,
        new Date(order.createdAt).toLocaleDateString(),
        `"${order.customer.name}"`,
        `"${order.customer.uniqueCustomerId}"`,
        order.totalNet.toFixed(2),
        order.totalVat.toFixed(2),
        order.totalGross.toFixed(2),
        order.status,
        order.paymentStatus
      ].join(',');
      csvContent += row + '\n';
    });

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="MAK_Enterprises_Ledger_Export.csv"'
      }
    });
  } catch (err) {
    return new NextResponse("Error generating CSV export", { status: 500 });
  }
}
