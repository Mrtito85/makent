import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default function NewCategoryPage() {
  async function createCategory(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name) return;

    await prisma.category.create({
      data: { name, description },
    });

    redirect('/categories');
  }

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, color: 'var(--primary)' }}>Create Category</h2>
      <form action={createCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="name" style={{ fontWeight: 500 }}>Category Name *</label>
          <input 
            id="name" name="name" type="text" required
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="description" style={{ fontWeight: 500 }}>Description</label>
          <textarea 
            id="description" name="description" rows={3}
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontFamily: 'inherit' }} 
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="submit" 
            style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            Save Category
          </button>
          <Link href="/categories" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none', color: '#64748b', fontWeight: 500 }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
