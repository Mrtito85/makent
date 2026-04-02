import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>Products Catalog</h2>
        <Link 
          href="/products/new" 
          style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
        >
          + Add Product
        </Link>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
            <th style={{ padding: '0.75rem 0' }}>Code / SKU</th>
            <th style={{ padding: '0.75rem 0' }}>Product Name</th>
            <th style={{ padding: '0.75rem 0' }}>Category</th>
            <th style={{ padding: '0.75rem 0' }}>Net Price</th>
            <th style={{ padding: '0.75rem 0' }}>VAT Included</th>
            <th style={{ padding: '0.75rem 0' }}>Stock / UoM</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '1.5rem 0', textAlign: 'center', color: '#64748b' }}>
                No products found. Add some to build your catalog.
              </td>
            </tr>
          ) : (
            products.map((p: any) => {
              const grossPrice = p.isVatEnabled ? p.basePrice * 1.20 : p.basePrice;
              
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0' }}>
                    <div style={{ fontWeight: 600 }}>{p.productCode}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{p.sku}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '0.75rem 0' }}>{p.category?.name || '-'}</td>
                  <td style={{ padding: '0.75rem 0' }}>Rs. {p.basePrice.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem 0' }}>
                    {p.isVatEnabled ? (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>Rs. {grossPrice.toFixed(2)}</span>
                    ) : (
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem' }}>No VAT</span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem 0' }}>
                    <span style={{ fontWeight: 'bold' }}>{p.stock}</span> {p.unitOfMeasurement}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
