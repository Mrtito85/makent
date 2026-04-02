import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  // Aggregate KPIs
  const totalCustomers = await prisma.customer.count();
  const totalProducts = await prisma.product.count();
  const totalOrders = await prisma.order.count();
  
  // Calculate total gross value
  const orders = await prisma.order.findMany({ select: { totalGross: true } });
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalGross, 0);

  return (
    <div>
      <h1 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '1rem' }}>Total Revenue</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Rs. {totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '1rem' }}>Total Orders</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{totalOrders}</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '1rem' }}>Total Products</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{totalProducts}</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '1rem' }}>Active Customers</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>{totalCustomers}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Sales Velocity Chart (30 Days)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '150px', gap: '8px', paddingBottom: '10px', borderBottom: '2px solid var(--border)' }}>
            {/* Native CSS Bar Chart Simulation */}
            {[40, 60, 45, 90, 110, 80, 130].map((h, i) => (
              <div key={i} style={{ flex: 1, background: 'var(--primary)', height: `${h}px`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.75rem' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Inventory Health Chart</h3>
          <div style={{ display: 'flex', gap: '1rem', height: '150px', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'conic-gradient(#10b981 70%, #f59e0b 70% 90%, #ef4444 90%)' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: '#10b981', borderRadius: '50%' }}></div> Healthy Stock (70%)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: '50%' }}></div> Warning (20%)</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 12, height: 12, background: '#ef4444', borderRadius: '50%' }}></div> Critical / Out (10%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ marginTop: 0, margin: 0 }}>Quick Actions & Workflows</h2>
          <a href="/api/export" className="no-print" style={{ padding: '0.75rem 1rem', background: '#334155', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
            📥 Export All Ledger Reports (Excel/CSV)
          </a>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <Link href="/products/new" style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
            + Add Product
          </Link>
          <Link href="/customers/new" style={{ padding: '0.75rem 1.5rem', background: '#f8fafc', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
            + Add Customer
          </Link>
          <Link href="/categories" style={{ padding: '0.75rem 1.5rem', background: '#f8fafc', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
            Manage Categories
          </Link>
          <Link href="/users/new" style={{ padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}>
            Create Employee User (Admin)
          </Link>
        </div>
      </div>
    </div>
  );
}
