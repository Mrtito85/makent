import { prisma } from '@/lib/prisma';
import PosTerminal from '@/components/PosTerminal';

export default async function NewOrderPage() {
  const customers = await prisma.customer.findMany({ select: { id: true, name: true, uniqueCustomerId: true, balance: true } });
  const products = await prisma.product.findMany({
    include: { category: true },
    where: { stock: { gt: 0 } }, // Optimization: Only load products with stock
  });

  return (
    <div style={{ height: 'calc(100vh - 120px)' }}>
      <h2 style={{ marginTop: 0, color: 'var(--primary)', marginBottom: '1rem' }}>Create Order (POS)</h2>
      <PosTerminal customers={customers} products={products} />
    </div>
  );
}
