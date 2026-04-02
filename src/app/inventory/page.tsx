import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function InventoryPage() {
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  const transactions = await prisma.inventoryTransaction.findMany({
    include: { product: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  async function addStock(formData: FormData) {
    'use server';
    const productId = formData.get('productId') as string;
    const type = formData.get('type') as string; // IN, WASTAGE
    const qty = parseInt(formData.get('qty') as string);
    const notes = formData.get('notes') as string;
    const batchNo = formData.get('batchNo') as string;

    const MOCK_USER_ID = "mock-inventory-staff";

    if (!productId || qty <= 0) return;

    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");

      let newStock = product.stock;
      if (type === 'IN') newStock += qty;
      else if (type === 'WASTAGE') newStock -= qty;

      if (newStock < 0) throw new Error("Cannot have negative stock");

      await tx.product.update({ where: { id: productId }, data: { stock: newStock } });
      
      const trans = await tx.inventoryTransaction.create({
        data: { productId, type, qty, notes, batchNo }
      });

      await tx.auditLog.create({
        data: {
          userId: MOCK_USER_ID,
          action: `INVENTORY_${type}`,
          entity: 'INVENTORY_TRANSACTION',
          entityId: trans.id,
          details: `Qty: ${qty}, New Stock: ${newStock}`
        }
      });
    });

    revalidatePath('/inventory');
  }

  return (
    <div>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', marginTop: 0 }}>Inventory Control & Tracking</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Stock Adjustment Entry</h3>
          <form action={addStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <select name="productId" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <option value="">-- Select Product --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current: {p.stock})</option>)}
            </select>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select name="type" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', flex: 1 }}>
                <option value="IN">Stock IN (Purchase)</option>
                <option value="WASTAGE">Wastage / Expired (OUT)</option>
              </select>
              <input type="number" name="qty" min="1" placeholder="Qty" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', flex: 1 }} />
            </div>

            <input type="text" name="batchNo" placeholder="Batch / GRN No." style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
            <input type="text" name="notes" placeholder="Notes regarding entry" style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />

            <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Process Transaction
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent Inventory Movements</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.5rem 0' }}>Date</th>
                <th style={{ padding: '0.5rem 0' }}>Product</th>
                <th style={{ padding: '0.5rem 0' }}>Type</th>
                <th style={{ padding: '0.5rem 0' }}>Qty</th>
                <th style={{ padding: '0.5rem 0' }}>Batch / Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>{t.product.name}</td>
                  <td style={{ padding: '0.5rem 0' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                      background: t.type === 'IN' ? '#dcfce7' : t.type === 'WASTAGE' ? '#fef2f2' : '#f1f5f9',
                      color: t.type === 'IN' ? '#166534' : t.type === 'WASTAGE' ? '#991b1b' : '#475569'
                    }}>{t.type}</span>
                  </td>
                  <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>{t.qty}</td>
                  <td style={{ padding: '0.5rem 0', color: '#64748b' }}>
                    {t.batchNo && <strong>[{t.batchNo}] </strong>}
                    {t.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
