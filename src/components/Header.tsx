export default function Header() {
  return (
    <header className="header">
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
      </div>
      <div className="user-profile">
        <span>Admin User</span>
        <div className="avatar">A</div>
      </div>
    </header>
  );
}
