import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ReportsAlertsPage() {
  // ALERTS: Low stock
  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { lte: prisma.product.fields.minStockLevel } },
    select: { id: true, name: true, stock: true, minStockLevel: true }
  });

  const unpaidOrders = await prisma.order.findMany({
    where: { status: 'APPROVED', paymentStatus: 'PENDING' },
    include: { customer: true },
    take: 10
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0 }}>Alerts & Advanced Reports</h2>
        <button style={{ padding: '0.5rem 1rem', background: 'var(--text)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          Export ALL (Excel/PDF)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem' }}>
        
        {/* ALERTS PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <h3 style={{ marginTop: 0, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⚠</span> Low Stock Alerts
            </h3>
            {lowStockProducts.length === 0 ? (
              <p style={{ color: '#b91c1c' }}>All products are sufficiently stocked.</p>
            ) : (
              <ul style={{ paddingLeft: '1.2rem', color: '#7f1d1d', margin: 0 }}>
                {lowStockProducts.map(p => (
                  <li key={p.id} style={{ marginBottom: '0.5rem' }}>
                    <strong>{p.name}</strong> - Stock: {p.stock} (Min: {p.minStockLevel})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <h3 style={{ marginTop: 0, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>⏱</span> Outstanding Approvals
            </h3>
            <p style={{ color: '#92400e', margin: 0 }}>Please check the Orders tab for pending workflow approvals.</p>
          </div>

        </div>

        {/* REPORTS PANEL */}
        <div className="card">
          <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Aged Receivables (Unpaid Orders)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.5rem 0' }}>Order ID</th>
                <th style={{ padding: '0.5rem 0' }}>Customer</th>
                <th style={{ padding: '0.5rem 0' }}>Total Value</th>
                <th style={{ padding: '0.5rem 0' }}>Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              {unpaidOrders.map(o => {
                const days = Math.floor((new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 3600 * 24));
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0', fontFamily: 'monospace' }}>#{o.id.slice(-6).toUpperCase()}</td>
                    <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>{o.customer.name}</td>
                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>Rs. {o.totalGross.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem 0', color: days > 30 ? '#ef4444' : 'inherit' }}>{days} Days</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
