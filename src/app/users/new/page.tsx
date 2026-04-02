import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function NewUserPage({ searchParams }: { searchParams: { error?: string } }) {
  async function createUser(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const password = formData.get('password') as string;

    const MOCK_CURRENT_USER_ROLE = "SUPER_ADMIN" as string; // Mocked RBAC Middleware
    if (MOCK_CURRENT_USER_ROLE !== 'ADMIN' && MOCK_CURRENT_USER_ROLE !== 'SUPER_ADMIN') {
      throw new Error("Unauthorized: Only Admin or Super Admin can create users.");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      redirect('/users/new?error=exists');
    }

    // In a real app this would hash the password using bcrypt
    await prisma.user.create({
      data: { name, email, role, hashedPassword: Buffer.from(password).toString('base64') }
    });

    redirect('/');
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--primary)', marginTop: 0 }}>Create System User</h2>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Creates a secure login for employees. Access strictly restricted to ADMIN levels.
      </p>

      {searchParams?.error === 'exists' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontWeight: 500 }}>
          🛑 Error: A user with that email already exists!
        </div>
      )}

      <form action={createUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Full Name</label>
          <input name="name" type="text" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Email Address (Login ID)</label>
          <input name="email" type="email" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>System Role</label>
          <select name="role" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'white' }}>
            <option value="ORDER_BOOKER">Order Booker (POS & Ledger Access)</option>
            <option value="INVENTORY_STAFF">Inventory Staff (Stock & Procurement)</option>
            <option value="MANAGER">Manager (Approvals & basic Reports)</option>
            <option value="ADMIN">Admin (Full access except system wipe)</option>
            <option value="SUPER_ADMIN">Super Admin (Financial Deletions & Configuration)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontWeight: 500 }}>Temporary Password</label>
          <input name="password" type="password" required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" style={{ padding: '0.75rem 2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Provision User Account
          </button>
          <Link href="/" style={{ padding: '0.75rem 2rem', color: '#64748b', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
