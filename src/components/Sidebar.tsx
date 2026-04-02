import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>MAK Ent.</h2>
      </div>
      <nav>
        <ul>
          <li><Link href="/">Dashboard</Link></li>
          <li><Link href="/customers">Customers</Link></li>
          <li><Link href="/products">Products</Link></li>
          <li><Link href="/orders">Orders</Link></li>
          <li><Link href="/inventory">Inventory</Link></li>
          <li><Link href="/payments">Payments</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
