import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export default function NewCustomerPage() {
  async function createCustomer(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const uniqueCustomerId = formData.get('uniqueCustomerId') as string;
    const registrationNumber = formData.get('registrationNumber') as string;

    if (!name || !uniqueCustomerId) return;

    await prisma.customer.create({
      data: { name, email, phone, address, uniqueCustomerId, registrationNumber },
    });

    revalidatePath('/customers');
    redirect('/customers');
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Add New Customer</h2>
      <form action={createCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label htmlFor="uniqueCustomerId" style={{ fontWeight: 500 }}>Unique Customer ID *</label>
            <input 
              id="uniqueCustomerId" name="uniqueCustomerId" type="text" required placeholder="e.g. CUST-1001"
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <label htmlFor="name" style={{ fontWeight: 500 }}>Company/Customer Name *</label>
            <input 
              id="name" name="name" type="text" required
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="email" style={{ fontWeight: 500 }}>Email Address</label>
          <input 
            id="email" name="email" type="email"
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="phone" style={{ fontWeight: 500 }}>Phone Number</label>
          <input 
            id="phone" name="phone" type="tel"
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="registrationNumber" style={{ fontWeight: 500 }}>Registration Number / Tax ID</label>
          <input 
            id="registrationNumber" name="registrationNumber" type="text"
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="address" style={{ fontWeight: 500 }}>Billing Address</label>
          <textarea 
            id="address" name="address" rows={3}
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontFamily: 'inherit' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="submit" 
            style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            Save Customer
          </button>
          <a href="/customers" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
