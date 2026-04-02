'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProductForm({ categories }: { categories: any[] }) {
  const [netPrice, setNetPrice] = useState<number>(0);
  const [vatEnabled, setVatEnabled] = useState<boolean>(true);
  const [grossPrice, setGrossPrice] = useState<number>(0);

  useEffect(() => {
    if (vatEnabled) {
      setGrossPrice(netPrice * 1.20);
    } else {
      setGrossPrice(netPrice);
    }
  }, [netPrice, vatEnabled]);

  return (
    <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, color: 'var(--primary)', marginBottom: '1.5rem' }}>Create Product Master</h2>
      
      <form action="/api/products" method="POST" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
          <label htmlFor="name" style={{ fontWeight: 500 }}>Product Name *</label>
          <input 
            id="name" name="name" type="text" required
            placeholder="e.g. Coca Cola 500ml Bottle"
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="productCode" style={{ fontWeight: 500 }}>Product Code *</label>
          <input 
            id="productCode" name="productCode" type="text" required 
            placeholder="e.g. PRD-100"
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="sku" style={{ fontWeight: 500 }}>SKU</label>
          <input 
            id="sku" name="sku" type="text" required
            placeholder="e.g. BEV-COLA-500"
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="barcode" style={{ fontWeight: 500 }}>Barcode</label>
          <input 
            id="barcode" name="barcode" type="text" required
            placeholder="e.g. 5000112637922"
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="categoryId" style={{ fontWeight: 500 }}>Category Scope</label>
          <select 
            id="categoryId" name="categoryId" required
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'white' }} 
          >
            <option value="" disabled selected>-- Select a Category --</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="unitOfMeasurement" style={{ fontWeight: 500 }}>Unit of Measurement</label>
          <select 
            id="unitOfMeasurement" name="unitOfMeasurement"
            style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'white' }}
          >
            <option value="PCS">Pieces (PCS)</option>
            <option value="BOX">Box (BOX)</option>
            <option value="DOZ">Dozen (DOZ)</option>
            <option value="KG">Kilogram (KG)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}></div>

        {/* PRICING AND VAT */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="basePrice" style={{ fontWeight: 500 }}>Net Price (Rs. ) *</label>
            <input 
              id="basePrice" name="basePrice" type="number" step="0.01" required
              value={netPrice || ''}
              onChange={(e) => setNetPrice(parseFloat(e.target.value) || 0)}
              style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
            <label htmlFor="isVatEnabled" style={{ fontWeight: 500 }}>Add 20% VAT?</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input 
                id="isVatEnabled" name="isVatEnabled" type="checkbox" 
                checked={vatEnabled}
                onChange={(e) => setVatEnabled(e.target.checked)}
                style={{ width: '20px', height: '20px' }} 
              />
              <span>{vatEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            {/* hidden field because checkboxes only send 'on' when checked */}
            <input type="hidden" name="vatToggleState" value={vatEnabled.toString()} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 500, color: '#166534' }}>Calculated Gross (Rs. )</label>
            <div style={{ padding: '0.75rem', background: '#dcfce7', borderRadius: '6px', border: '1px solid #bbf7d0', fontWeight: 'bold', fontSize: '1.1rem', color: '#166534', textAlign: 'center' }}>
              Rs. {grossPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', gridColumn: '1 / -1' }}>
          <button 
            type="submit" 
            style={{ padding: '0.75rem 2rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            Create Product
          </button>
          <Link href="/products" style={{ padding: '0.75rem 2rem', textDecoration: 'none', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
