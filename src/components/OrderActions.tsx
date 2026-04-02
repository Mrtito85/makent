'use client';
import { useRouter } from 'next/navigation';

export default function OrderActions({ order }: { order: any }) {
  const router = useRouter();

  const handleApprove = async () => {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, action: 'APPROVE' })
    });
    
    if (res.ok) {
      alert('Order strictly approved and stock deducted.');
      router.refresh();
    } else {
      const data = await res.json();
      alert(`Approval Failed: ${data.error}`);
    }
  };

  if (order.status !== 'PENDING') return <span style={{ fontWeight: 600, color: order.status === 'APPROVED' ? '#10b981' : '#64748b' }}>{order.status}</span>;

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button onClick={handleApprove} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
        Approve
      </button>
      <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
        Reject
      </button>
    </div>
  );
}
