import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export default async function CreditNotesPage() {
  const creditNotes = await prisma.creditNote.findMany({
    include: { customer: true },
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' }
  });

  const customers = await prisma.customer.findMany();

  async function createCreditNote(formData: FormData) {
    'use server';
    const customerId = formData.get('customerId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const reason = formData.get('reason') as string;
    const MOCK_USER_ID = "mock-super-admin"; 

    if (!customerId || amount <= 0) return;

    await prisma.$transaction(async (tx) => {
      // 1. Create Credit Note
      const note = await tx.creditNote.create({
        data: { customerId, amount, reason, createdBy: MOCK_USER_ID }
      });

      // 2. Adjust Customer Balance (Credit note lowers what they owe)
      const cust = await tx.customer.findUnique({ where: { id: customerId }});
      if (cust) {
        await tx.customer.update({
          where: { id: customerId },
          data: { balance: cust.balance - amount }
        });
      }

      // 3. Log it
      await tx.auditLog.create({
        data: {
          userId: MOCK_USER_ID,
          action: 'CREATED_CREDIT_NOTE',
          entity: 'CREDIT_NOTE',
          entityId: note.id,
          details: `Amount: ${amount}, Reason: ${reason}`
        }
      });
    });

    revalidatePath('/credit-notes');
  }

  return (
    <div>
      <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', marginTop: 0 }}>Credit Notes Management</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Issue Credit Note</h3>
          <form action={createCreditNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Customer</label>
              <select name="customerId" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Amount (Rs. )</label>
              <input type="number" name="amount" min="1" step="0.01" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>Reason / Reference</label>
              <textarea name="reason" rows={3} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontFamily: 'inherit' }} />
            </div>

            <button type="submit" style={{ background: '#ef4444', color: 'white', padding: '0.75rem', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Authorize & Apply Credit Note
            </button>
            <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', margin: 0 }}>
              *This action immediately adjusts the client ledger. Only modifiable by SUPER_ADMIN.
            </p>
          </form>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>Credit Notes Register</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '0.5rem 0' }}>Date</th>
                <th style={{ padding: '0.5rem 0' }}>Customer</th>
                <th style={{ padding: '0.5rem 0' }}>Reason</th>
                <th style={{ padding: '0.5rem 0' }}>Amount</th>
                <th style={{ padding: '0.5rem 0' }}>Authorizer</th>
                <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Admin</th>
              </tr>
            </thead>
            <tbody>
              {creditNotes.map(note => (
                <tr key={note.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0' }}>{new Date(note.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>{note.customer.name}</td>
                  <td style={{ padding: '0.5rem 0' }}>{note.reason}</td>
                  <td style={{ padding: '0.5rem 0', color: '#10b981', fontWeight: 'bold' }}>{note.amount.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem 0', fontFamily: 'monospace' }}>{note.createdBy.slice(-6)}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                    <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Void</button>
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
