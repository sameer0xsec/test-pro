import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bell, Box, BriefcaseBusiness, ChevronDown, CircleDollarSign, LayoutDashboard,
  Menu, Package, Plus, Search, Settings, ShoppingCart, Users, X
} from "lucide-react";
import "./styles.css";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api`;

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Inventory", icon: Package },
  { label: "Orders", icon: ShoppingCart },
  { label: "Customers", icon: Users },
  { label: "Employees", icon: BriefcaseBusiness }
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function App() {
  const [active, setActive] = useState("Overview");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    Promise.all(["dashboard", "products", "employees", "invoices"].map((resource) =>
      fetch(`${API}/${resource}`).then((response) => response.json())
    )).then(([dashboardData, productData, employeeData, invoiceData]) => {
      setDashboard(dashboardData);
      setProducts(productData);
      setEmployees(employeeData);
      setInvoices(invoiceData);
    }).catch(() => {});
  }, []);

  const filteredProducts = useMemo(() =>
    products.filter((product) => `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  );

  async function addProduct(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    if (response.ok) {
      const product = await response.json();
      setProducts((current) => [...current, product]);
      setShowForm(false);
      event.currentTarget.reset();
    }
  }

  const pageTitle = active === "Overview" ? "Good morning, Amara" : active;
  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark">O</div><span>orbit<span className="brand-accent">.</span></span></div>
        <div className="workspace"><span className="workspace-dot" /> Orbit workspace <ChevronDown size={14} /></div>
        <nav>
          <p className="nav-label">WORKSPACE</p>
          {navItems.map(({ label, icon: Icon }) => (
            <button className={`nav-item ${active === label ? "selected" : ""}`} key={label} onClick={() => { setActive(label); setMenuOpen(false); }}>
              <Icon size={18} strokeWidth={active === label ? 2.4 : 1.8} /><span>{label}</span>
              {label === "Orders" && <span className="nav-count">12</span>}
            </button>
          ))}
          <p className="nav-label nav-label-spaced">MANAGE</p>
          <button className="nav-item"><CircleDollarSign size={18} /><span>Finance</span></button>
          <button className="nav-item"><Box size={18} /><span>Reports</span></button>
          <button className="nav-item"><Settings size={18} /><span>Settings</span></button>
        </nav>
        <div className="help-card"><div className="help-icon">?</div><strong>Need a hand?</strong><span>Check out our help center</span><button>Visit help center <span>↗</span></button></div>
        <div className="profile"><div className="avatar">AK</div><div><strong>Amara Khan</strong><span>Admin</span></div><ChevronDown size={16} /></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>{active}</strong></div><div className="top-actions"><div className="search"><Search size={16} /><input placeholder="Search anything..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></div><button className="icon-btn notification"><Bell size={19} /><i /></button><div className="avatar small">AK</div></div></header>
        <section className="page-content">
          <div className="page-heading"><div><p className="eyebrow">TUESDAY, JUNE 18, 2024</p><h1>{pageTitle}</h1><p className="muted">{active === "Overview" ? "Here’s what’s happening with your business today." : `Manage your ${active.toLowerCase()} from one place.`}</p></div><button className="primary-btn" onClick={() => setShowForm(true)}><Plus size={17} /> Add product</button></div>
          {active === "Overview" && dashboard && <Overview dashboard={dashboard} invoices={invoices} products={products} />}
          {active === "Inventory" && <Inventory products={filteredProducts} onAdd={() => setShowForm(true)} />}
          {active === "Employees" && <Employees employees={employees} />}
          {active === "Orders" && <Orders invoices={invoices} />}
          {active === "Customers" && <EmptyState title="Customer management" description="Customer profiles and relationship insights will appear here." icon={<Users />} />}
          {showForm && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setShowForm(false)}><form className="modal" onSubmit={addProduct}><div className="modal-heading"><div><p className="eyebrow">INVENTORY</p><h2>Add product</h2></div><button type="button" className="close-btn" onClick={() => setShowForm(false)}><X size={18} /></button></div><label>Product name<input name="name" required placeholder="e.g. Laptop stand" /></label><div className="form-grid"><label>SKU<input name="sku" required placeholder="SKU-1006" /></label><label>Category<input name="category" required placeholder="Accessories" /></label><label>Stock<input name="stock" type="number" min="0" required placeholder="20" /></label><label>Price<input name="price" type="number" min="0" step="0.01" required placeholder="49.99" /></label></div><button className="primary-btn full" type="submit">Save product</button></form></div>}
        </section>
      </main>
    </div>
  );
}

function Overview({ dashboard, invoices, products }) {
  return <><div className="metric-grid"><Metric title="Total revenue" value={formatCurrency(dashboard.revenue)} change={dashboard.revenueChange} icon={<CircleDollarSign />} color="purple" /><Metric title="Total orders" value={dashboard.orders} change={dashboard.ordersChange} icon={<ShoppingCart />} color="blue" /><Metric title="Total customers" value={dashboard.customers.toLocaleString()} change={dashboard.customersChange} icon={<Users />} color="orange" /><Metric title="Low stock items" value={dashboard.lowStock} caption="Needs attention" icon={<Package />} color="green" /></div><div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-heading"><div><h2>Revenue overview</h2><p className="muted">Monthly revenue performance</p></div><select defaultValue="2024"><option>2024</option><option>2023</option></select></div><div className="chart"><div className="y-axis"><span>$15k</span><span>$10k</span><span>$5k</span><span>$0</span></div><div className="chart-area"><div className="grid-lines"><i /><i /><i /><i /></div><svg viewBox="0 0 720 210" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#6558d3" stopOpacity=".22" /><stop offset="100%" stopColor="#6558d3" stopOpacity="0" /></linearGradient></defs><path d={`M0,${190-dashboard.revenueByMonth[0]} ${dashboard.revenueByMonth.map((value, index) => `L${index * 65},${190-value * 1.4}`).join(" ")} L720,210 L0,210 Z`} fill="url(#fill)" /><polyline points={dashboard.revenueByMonth.map((value, index) => `${index * 65},${190-value * 1.4}`).join(" ")} fill="none" stroke="#6558d3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg><div className="x-axis">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month) => <span key={month}>{month}</span>)}</div></div></div></section><section className="panel"><div className="panel-heading"><div><h2>Recent invoices</h2><p className="muted">Latest billing activity</p></div><button className="text-btn">View all</button></div><div className="invoice-list">{invoices.slice(0, 3).map((invoice) => <div className="invoice-row" key={invoice.id}><div className="invoice-icon"><CircleDollarSign size={17} /></div><div className="invoice-info"><strong>{invoice.customer}</strong><span>{invoice.id} · {invoice.date}</span></div><div className="invoice-amount"><strong>{formatCurrency(invoice.amount)}</strong><Status value={invoice.status} /></div></div>)}</div></section></div><section className="panel table-panel"><div className="panel-heading"><div><h2>Inventory snapshot</h2><p className="muted">Keep an eye on your stock levels</p></div><button className="text-btn">View inventory →</button></div><ProductTable products={products.slice(0, 4)} /></section></>;
}

function Metric({ title, value, change, caption, icon, color }) {
  return <div className="metric-card"><div className={`metric-icon ${color}`}>{icon}</div><div className="metric-copy"><span>{title}</span><strong>{value}</strong>{change ? <small><b>↗ {change}%</b> vs last month</small> : <small className="attention">{caption}</small>}</div></div>;
}

function Inventory({ products, onAdd }) {
  return <section className="panel table-panel inventory-view"><div className="panel-heading"><div><h2>All products</h2><p className="muted">{products.length} items in your catalog</p></div><button className="secondary-btn" onClick={onAdd}><Plus size={16} /> Add product</button></div><ProductTable products={products} /></section>;
}

function ProductTable({ products }) {
  return <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>STOCK LEVEL</th><th>UNIT PRICE</th><th>STATUS</th></tr></thead><tbody>{products.map((product) => <tr key={product.id}><td><div className="product-cell"><div className="product-thumb">{product.name.slice(0, 1)}</div><div><strong>{product.name}</strong><span>{product.sku}</span></div></div></td><td>{product.category}</td><td><div className="stock"><span>{product.stock} units</span><div><i style={{ width: `${Math.min(product.stock * 2, 100)}%` }} /></div></div></td><td>{formatCurrency(product.price)}</td><td><Status value={product.status} /></td></tr>)}</tbody></table></div>;
}

function Employees({ employees }) {
  return <section className="panel table-panel"><div className="panel-heading"><div><h2>Team directory</h2><p className="muted">{employees.length} people in your organization</p></div><button className="secondary-btn"><Plus size={16} /> Add employee</button></div><div className="employee-grid">{employees.map((employee) => <div className="employee-card" key={employee.id}><div className="avatar">{employee.initials}</div><div><strong>{employee.name}</strong><span>{employee.role}</span><small>{employee.department} · <Status value={employee.status} /></small></div></div>)}</div></section>;
}

function Orders({ invoices }) {
  return <section className="panel table-panel"><div className="panel-heading"><div><h2>Orders & invoices</h2><p className="muted">Track your latest transactions</p></div><button className="secondary-btn"><Plus size={16} /> New order</button></div><div className="table-wrap"><table><thead><tr><th>INVOICE</th><th>CUSTOMER</th><th>DATE</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td><strong>{invoice.id}</strong></td><td>{invoice.customer}</td><td>{invoice.date}</td><td>{formatCurrency(invoice.amount)}</td><td><Status value={invoice.status} /></td></tr>)}</tbody></table></div></section>;
}

function Status({ value }) { return <span className={`status ${value.toLowerCase().replaceAll(" ", "-")}`}><i />{value}</span>; }
function EmptyState({ title, description, icon }) { return <section className="empty-state"><div>{icon}</div><h2>{title}</h2><p>{description}</p></section>; }

createRoot(document.getElementById("root")).render(<App />);
