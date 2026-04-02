import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function OrderInvoicePage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      OrderItems: { include: { product: true } }
    }
  });

  if (!order) return <div>Order not found</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '3rem', position: 'relative' }}>
      
      {/* Non-printable action buttons */}
      <div className="no-print" style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '1rem' }}>
        {/* Helper print script because server components cannot have onClick */}
        <script dangerouslySetInnerHTML={{ __html: 'function handlePrint() { window.print(); }' }} />
        <button onClick={() => {}} suppressHydrationWarning {...({ onClick: "handlePrint()" } as any)} style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🖨 Print Invoice
        </button>
        <Link href="/orders" style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '4px', textDecoration: 'none', color: 'black' }}>Back</Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="printable-area" style={{ color: 'black' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid black', paddingBottom: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>MAK Enterprises U.K.</h1>
            <p style={{ margin: '0.25rem 0', color: '#4b5563' }}>Wholesale Distribution Co.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, color: '#4b5563' }}>INVOICE / ORDER</h2>
            <p style={{ margin: 0 }}><strong>Ref:</strong> #{order.id.slice(-6).toUpperCase()}</p>
            <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>Bill To:</h3>
            <strong style={{ display: 'block', fontSize: '1.2rem' }}>{order.customer.name}</strong>
            <p style={{ margin: 0 }}>{order.customer.address || "Address not provided"}</p>
            <p style={{ margin: 0 }}>Phone: {order.customer.phone || "N/A"}</p>
            <p style={{ margin: 0 }}>Registration: {order.customer.registrationNumber || "N/A"}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#4b5563' }}>Payment Status:</h3>
            <strong style={{ fontSize: '1.5rem', textTransform: 'uppercase' }}>{order.paymentStatus.replace('_', ' ')}</strong>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid black' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Item Code</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Unit Net (Rs. )</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>VAT (Rs. )</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Line Gross (Rs. )</th>
            </tr>
          </thead>
          <tbody>
            {order.OrderItems.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{item.product.productCode}</td>
                <td style={{ padding: '0.75rem' }}>{item.product.name}</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.qty} {item.product.unitOfMeasurement}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{(item.vatAmount).toFixed(2)}</td>
                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{((item.price * item.qty) + item.vatAmount - item.discountAmount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span>Total Net Amount:</span>
              <strong>Rs. {order.totalNet.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
              <span>Total VAT Computed:</span>
              <strong>Rs. {order.totalVat.toFixed(2)}</strong>
            </div>
            {order.totalDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: 'red' }}>
                <span>Discount Applied:</span>
                <strong>- Rs. {order.totalDiscount.toFixed(2)}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', fontSize: '1.25rem', borderBottom: '2px double black' }}>
              <strong>Gross Total Due:</strong>
              <strong>Rs. {order.totalGross.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '4rem', color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
          <p>This is a computer-generated document. No signature required.</p>
          <p>MAK Enterprises U.K. | VAT Reg: 000000000 | Contact: billing@makent.co.uk</p>
        </div>
      </div>
    </div>
  );
}
