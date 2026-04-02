import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function PaymentsPage() {
  // Find orders that are approved but not fully paid
  const pendingOrders = await prisma.order.findMany({
    where: { 
      status: 'APPROVED', 
      paymentStatus: { not: 'FULLY_PAID' } 
    },
    include: { 
      customer: true,
      Payments: true 
    },
    orderBy: { createdAt: 'asc' }
  });

  const recentPayments = await prisma.payment.findMany({
    include: { customer: true, order: true },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  async function processPayment(formData: FormData) {
    'use server';
    const orderId = formData.get('orderId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const method = formData.get('method') as string;

    const MOCK_USER_ID = "mock-accountant";

    if (!orderId || amount <= 0) return;

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { Payments: true, customer: true } });
      if (!order) throw new Error("Order not found");

      const existingPaid = order.Payments.reduce((sum, p) => sum + p.amount, 0);
      const newPaidTotal = existingPaid + amount;
      
      // Validation: Can't overpay (we could allow credit notes, but keeping simple here)
      if (newPaidTotal > order.totalGross + 0.05) throw new Error("Payment exceeds outstanding balance.");

      // Calculate Payment Status
      const isFullyPaid = newPaidTotal >= order.totalGross - 0.01;
      const paymentStatus = isFullyPaid ? 'FULLY_PAID' : 'PARTIAL_PAID';

      // Record Payment
      const payment = await tx.payment.create({
        data: {
          customerId: order.customerId,
          orderId: order.id,
          amount,
          method
        }
      });

      // Update Order Status
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus }
      });

      // Update Customer Ledger Balance (Reduce what they owe)
      await tx.customer.update({
        where: { id: order.customerId },
        data: { balance: order.customer.balance - amount } // Outstanding reduced
      });

      // Audit Trail
      await tx.auditLog.create({
        data: {
          userId: MOCK_USER_ID,
          action: 'PAYMENT_RECEIVED',
          entity: 'PAYMENT',
          entityId: payment.id,
          details: `Method: ${method}, Amount: ${amount}, New Order Status: ${paymentStatus}`
        }
      });
    });

    revalidatePath('/payments');
  }

  return (
    <div>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', marginTop: 0 }}>Payments & Accounts Receivable</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Receive Payment</h3>
          
          <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
            {pendingOrders.map(order => {
              const paid = order.Payments.reduce((sum, p) => sum + p.amount, 0);
              const outstanding = order.totalGross - paid;
              
              return (
                <div key={order.id} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>{order.customer.name}</strong>
                    <span style={{ color: '#64748b' }}>Order #{order.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    Gross: Rs. {order.totalGross.toFixed(2)} | Paid: Rs. {paid.toFixed(2)} | <strong style={{ color: '#ef4444' }}>Owes: Rs. {outstanding.toFixed(2)}</strong>
                  </div>

                  <form action={processPayment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="number" name="amount" min="0.01" max={outstanding.toFixed(2)} step="0.01" defaultValue={outstanding.toFixed(2)} required style={{ width: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    <select name="method" required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'white' }}>
                      <option value="CASH">Cash</option>
                      <option value="ONLINE">Bank/Online</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                    <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Pay
                    </button>
                  </form>
                </div>
              );
            })}
            {pendingOrders.length === 0 && <p style={{ color: '#64748b', textAlign: 'center' }}>No outstanding approved orders.</p>}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Recent Payment Ledger</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.5rem 0' }}>Date</th>
                <th style={{ padding: '0.5rem 0' }}>Customer</th>
                <th style={{ padding: '0.5rem 0' }}>Order Ref</th>
                <th style={{ padding: '0.5rem 0' }}>Method</th>
                <th style={{ padding: '0.5rem 0' }}>Amount (Rs. )</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>{p.customer.name}</td>
                  <td style={{ padding: '0.5rem 0', fontFamily: 'monospace' }}>#{p.orderId?.slice(-6).toUpperCase() || 'N/A'}</td>
                  <td style={{ padding: '0.5rem 0' }}>{p.method}</td>
                  <td style={{ padding: '0.5rem 0', fontWeight: 'bold', color: '#10b981' }}>+ {p.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
