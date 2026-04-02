import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Customers</h2>
        <Link 
          href="/customers/new" 
          style={{ 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px', 
            textDecoration: 'none',
            fontWeight: 500 
          }}
        >
          + Add Customer
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 0' }}>Name</th>
            <th style={{ padding: '0.75rem 0' }}>Email</th>
            <th style={{ padding: '0.75rem 0' }}>Phone</th>
            <th style={{ padding: '0.75rem 0' }}>Balance</th>
            <th style={{ padding: '0.75rem 0' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b' }}>
                No customers found. Add one to get started.
              </td>
            </tr>
          ) : (
            customers.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{c.name}</td>
                <td style={{ padding: '0.75rem 0' }}>{c.email || '-'}</td>
                <td style={{ padding: '0.75rem 0' }}>{c.phone || '-'}</td>
                <td style={{ padding: '0.75rem 0', color: c.balance > 0 ? '#ef4444' : 'inherit' }}>
                  Rs. {c.balance.toFixed(2)}
                </td>
                <td style={{ padding: '0.75rem 0' }}>
                  <Link href={`/customers/${c.id}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>View</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
