import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { Products: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Product Categories</h2>
        <Link 
          href="/categories/new" 
          style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
        >
          + Add Category
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 0' }}>Name</th>
            <th style={{ padding: '0.75rem 0' }}>Description</th>
            <th style={{ padding: '0.75rem 0' }}>Products Count</th>
            <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '1.5rem 0', textAlign: 'center', color: '#64748b' }}>
                No categories found.
              </td>
            </tr>
          ) : (
            categories.map((cat: any) => (
              <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{cat.name}</td>
                <td style={{ padding: '0.75rem 0', color: '#64748b' }}>{cat.description || '-'}</td>
                <td style={{ padding: '0.75rem 0' }}>{cat._count.Products}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                  <Link href={`/categories/${cat.id}/edit`} style={{ color: 'var(--primary)', textDecoration: 'none', marginRight: '1rem' }}>Edit</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
