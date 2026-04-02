'use client';

import { useState, useMemo } from 'react';

type Product = {
  id: string; name: string; basePrice: number; isVatEnabled: boolean; stock: number;
  category: { id: string; name: string } | null;
};
type CartItem = Product & { cartQty: number; discountPct: number };

export default function PosTerminal({ customers, products }: { customers: any[], products: Product[] }) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category?.name || 'Uncategorized'));
    return ['ALL', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => activeCategory === 'ALL' || (p.category?.name || 'Uncategorized') === activeCategory);
  }, [products, activeCategory]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQty + 1 > product.stock) {
          alert(`Cannot order more. Stock limit: ${product.stock}`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, cartQty: item.cartQty + 1 } : item);
      }
      if (product.stock < 1) return prev;
      return [...prev, { ...product, cartQty: 1, discountPct: 0 }];
    });
  };

  const updateCartQty = (id: string, qty: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, Math.min(qty, item.stock));
        return { ...item, cartQty: newQty };
      }
      return item;
    }));
  };

  const removeOutOfStock = () => {
    // Advanced: Re-validate with latest stock from server before confirming.
    // Here we validate against initial loaded stock.
    setCart(prev => prev.filter(item => item.stock >= item.cartQty));
  };

  const totals = useMemo(() => {
    let gross = 0, vat = 0, net = 0;
    cart.forEach(item => {
      const lineNet = item.basePrice * item.cartQty * (1 - (item.discountPct / 100));
      const lineVat = item.isVatEnabled ? lineNet * 0.20 : 0;
      net += lineNet;
      vat += lineVat;
      gross += (lineNet + lineVat);
    });
    return { gross, vat, net };
  }, [cart]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', height: '100%' }}>
      
      {/* LEFT: PRODUCTS CATALOG */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          {categories.map(cat => (
            <button 
              key={cat} onClick={() => setActiveCategory(cat)}
              style={{ 
                padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--primary)', 
                background: activeCategory === cat ? 'var(--primary)' : 'white',
                color: activeCategory === cat ? 'white' : 'var(--primary)', cursor: 'pointer',
                whiteSpace: 'nowrap', fontWeight: 500
              }}
            >{cat}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => addToCart(p)} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', cursor: 'pointer', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{p.name}</div>
              <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Stock: <strong style={{ color: p.stock > 0 ? '#10b981' : '#ef4444' }}>{p.stock}</strong></div>
              <div style={{ marginTop: 'auto', paddingTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>Rs. {p.basePrice.toFixed(2)} {p.isVatEnabled && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(+VAT)</span>}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: CART (ORDER BOOK) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Current Order</h3>
        
        <select 
          value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', width: '100%', marginBottom: '1rem', outline: 'none' }}
        >
          <option value="" disabled>-- Select Customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.uniqueCustomerId})</option>)}
        </select>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Rs. {item.basePrice.toFixed(2)} x {item.cartQty}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="number" min="1" max={item.stock} value={item.cartQty}
                  onChange={e => updateCartQty(item.id, parseInt(e.target.value))}
                  style={{ width: '60px', padding: '0.25rem', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
                <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
              </div>
            </div>
          ))}
          {cart.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem' }}>Cart is empty</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>Net:</span> <span>Rs. {totals.net.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}><span>VAT (20%):</span> <span>Rs. {totals.vat.toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text)', paddingTop: '0.5rem', borderTop: '1px dotted var(--border)' }}>
            <span>Total:</span> <span>Rs. {totals.gross.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={removeOutOfStock}
          style={{ padding: '0.5rem', marginTop: '1rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
        >
          Check & Remove Out Of Stock
        </button>

        <button 
          disabled={!selectedCustomerId || cart.length === 0}
          style={{ padding: '1rem', marginTop: '1rem', background: (!selectedCustomerId || cart.length === 0) ? '#cbd5e1' : 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: (!selectedCustomerId || cart.length === 0) ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
        >
          SUBMIT ORDER (PENDING)
        </button>
      </div>

    </div>
  );
}
