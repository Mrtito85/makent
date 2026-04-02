import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import OrderActions from '@/components/OrderActions';

export default async function OrdersList() {
  const orders = await prisma.order.findMany({
    include: { customer: true, OrderItems: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Orders & Approvals</h2>
        <Link 
          href="/orders/new" 
          style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
        >
          Create Order (POS)
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 0' }}>Order ID</th>
            <th style={{ padding: '0.75rem 0' }}>Customer</th>
            <th style={{ padding: '0.75rem 0' }}>Items</th>
            <th style={{ padding: '0.75rem 0' }}>Gross Total</th>
            <th style={{ padding: '0.75rem 0' }}>Workflow Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o: any) => (
            <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '0.75rem 0', fontFamily: 'monospace' }}>{o.id.substring(o.id.length - 6).toUpperCase()}</td>
              <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{o.customer.name}</td>
              <td style={{ padding: '0.75rem 0' }}>{o.OrderItems.length} items</td>
              <td style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>Rs. {o.totalGross.toFixed(2)}</td>
              <td style={{ padding: '0.75rem 0' }}>
                <OrderActions order={o} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
