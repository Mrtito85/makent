import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function DiscountsPage() {
  const discountRules = await prisma.discountRule.findMany({
    include: { customer: true, product: true },
    orderBy: { createdAt: 'desc' }
  });

  const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });

  async function createRule(formData: FormData) {
    'use server';
    const customerId = formData.get('customerId') as string;
    const productId = formData.get('productId') as string;
    const maxDiscountPct = parseFloat(formData.get('maxDiscountPct') as string);
    const MOCK_USER_ROLE = "SUPER_ADMIN"; // Simulated RBAC limit

    if (MOCK_USER_ROLE !== 'ADMIN' && MOCK_USER_ROLE !== 'SUPER_ADMIN') {
      throw new Error("Unauthorized to set System Rules.");
    }

    if (!customerId || !productId) return;

    await prisma.$transaction(async (tx) => {
      // Upsert the rule to strictly enforce only 1 product-customer rule pairing
      const rule = await tx.discountRule.upsert({
        where: { customerId_productId: { customerId, productId } },
        update: { maxDiscountPct },
        create: { customerId, productId, maxDiscountPct }
      });

      await tx.auditLog.create({
        data: {
          userId: "mock-super-admin",
          action: 'CREATED_DISCOUNT_RULE',
          entity: 'DISCOUNT_RULE',
          entityId: rule.id,
          details: `Set MAX Discount: ${maxDiscountPct}%`
        }
      });
    });

    revalidatePath('/discounts');
  }

  return (
    <div>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', marginTop: 0 }}>Discount Limits Strategy</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Define Pricing Boundary</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Set a maximum allowable discount cap for a specific customer on a specific product. Order Bookers will be unable to exceed this limit at checkout.
          </p>

          <form action={createRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Customer Target</label>
              <select name="customerId" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Product Scope</label>
              <select name="productId" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Rs. {p.basePrice})</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Maximum Discount (%)</label>
              <input type="number" name="maxDiscountPct" min="0" max="100" step="0.1" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
            </div>

            <button type="submit" style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Enforce Strategic Limit
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Active Discount Bound Exceptions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.5rem 0' }}>Customer</th>
                <th style={{ padding: '0.5rem 0' }}>Product Focus</th>
                <th style={{ padding: '0.5rem 0' }}>Base Price</th>
                <th style={{ padding: '0.5rem 0', color: '#ef4444' }}>Max Cap (%)</th>
                <th style={{ padding: '0.5rem 0' }}>Floor Return</th>
              </tr>
            </thead>
            <tbody>
              {discountRules.map(rule => {
                const floorPrice = rule.product.basePrice * (1 - (rule.maxDiscountPct / 100));
                
                return (
                  <tr key={rule.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>{rule.customer.name}</td>
                    <td style={{ padding: '0.5rem 0' }}>{rule.product.name}</td>
                    <td style={{ padding: '0.5rem 0' }}>Rs. {rule.product.basePrice.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem 0', fontWeight: 'bold', color: '#ef4444' }}>{rule.maxDiscountPct}% limit</td>
                    <td style={{ padding: '0.5rem 0', color: '#10b981' }}>Rs. {floorPrice.toFixed(2)}</td>
                  </tr>
                )
              })}
              {discountRules.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b' }}>
                    No targeted discount limits defined constraint mappings exist yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
