import {
  BadgeDollarSign,
  Boxes,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  RefreshCcw,
  ShoppingBag,
  Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api, setAuthToken } from './api.js';

const emptyProduct = {
  name: '',
  sku: '',
  description: '',
  category: '',
  brand: '',
  price: '',
  countInStock: '',
  imageUrl: ''
};

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
}

export function App() {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem('mern-ecommerce-auth');
    return raw ? JSON.parse(raw) : null;
  });
  const [tab, setTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setAuthToken(auth?.token);
    if (auth) refreshData();
  }, [auth]);

  async function refreshData() {
    setLoading(true);
    setMessage('');
    try {
      const [productRes, orderRes, userRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
        api.get('/users')
      ]);
      setProducts(productRes.data);
      setOrders(orderRes.data);
      setUsers(userRes.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(user) {
    setAuth(user);
    localStorage.setItem('mern-ecommerce-auth', JSON.stringify(user));
  }

  function handleLogout() {
    setAuth(null);
    localStorage.removeItem('mern-ecommerce-auth');
    setAuthToken(null);
  }

  const stats = useMemo(() => {
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const inventory = products.reduce((sum, product) => sum + product.countInStock, 0);
    return { revenue, inventory };
  }, [orders, products]);

  if (!auth) return <LoginScreen onLogin={handleLogin} />;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <ShoppingBag size={26} />
          <span>CommerceOps</span>
        </div>
        <nav>
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
            <Boxes size={18} /> Products
          </button>
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
            <BadgeDollarSign size={18} /> Orders
          </button>
          <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
            <Users size={18} /> Users
          </button>
        </nav>
        <button className="ghost" onClick={handleLogout}>
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Admin workspace</p>
            <h1>{tab[0].toUpperCase() + tab.slice(1)}</h1>
          </div>
          <button className="iconButton" title="Refresh data" onClick={refreshData}>
            <RefreshCcw size={18} />
          </button>
        </header>

        {message && <div className="notice">{message}</div>}
        {loading && <div className="notice">Loading latest data...</div>}

        {tab === 'dashboard' && (
          <Dashboard products={products} orders={orders} users={users} stats={stats} />
        )}
        {tab === 'products' && <Products products={products} onSaved={refreshData} />}
        {tab === 'orders' && <Orders orders={orders} onSaved={refreshData} />}
        {tab === 'users' && <UsersView users={users} />}
      </section>
    </main>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <main className="login">
      <form className="loginPanel" onSubmit={submit}>
        <ShoppingBag size={34} />
        <h1>CommerceOps</h1>
        <p>Manage products, users, and orders from one MERN dashboard.</p>
        <label>
          Email
          <input value={email} onChange={event => setEmail(event.target.value)} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={event => setPassword(event.target.value)} />
        </label>
        {error && <div className="notice error">{error}</div>}
        <button className="primary">Sign in</button>
      </form>
    </main>
  );
}

function Dashboard({ products, orders, users, stats }) {
  return (
    <div className="stack">
      <section className="metricGrid">
        <Metric label="Revenue" value={currency(stats.revenue)} />
        <Metric label="Orders" value={orders.length} />
        <Metric label="Products" value={products.length} />
        <Metric label="Inventory" value={stats.inventory} />
        <Metric label="Users" value={users.length} />
      </section>
      <section className="twoColumn">
        <div>
          <h2>Featured Products</h2>
          <div className="productGrid">
            {products.slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
        <div>
          <h2>Recent Orders</h2>
          <OrderTable orders={orders.slice(0, 5)} compact />
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Products({ products, onSaved }) {
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    await api.post('/products', {
      ...form,
      price: Number(form.price),
      countInStock: Number(form.countInStock)
    });
    setForm(emptyProduct);
    setSaving(false);
    onSaved();
  }

  return (
    <div className="stack">
      <form className="formGrid" onSubmit={submit}>
        <h2><PackagePlus size={18} /> Add Product</h2>
        {['name', 'sku', 'category', 'brand', 'price', 'countInStock', 'imageUrl'].map(field => (
          <label key={field}>
            {field}
            <input required={field !== 'brand' && field !== 'imageUrl'} value={form[field]} onChange={event => update(field, event.target.value)} />
          </label>
        ))}
        <label className="wide">
          description
          <textarea required value={form.description} onChange={event => update('description', event.target.value)} />
        </label>
        <button className="primary" disabled={saving}>{saving ? 'Saving...' : 'Create product'}</button>
      </form>
      <div className="productGrid">
        {products.map(product => <ProductCard key={product._id} product={product} />)}
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <article className="productCard">
      <img src={`${product.imageUrl}?auto=format&fit=crop&w=500&q=80`} alt={product.name} />
      <div>
        <span className="pill">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <footer>
          <strong>{currency(product.price)}</strong>
          <span>{product.countInStock} in stock</span>
        </footer>
      </div>
    </article>
  );
}

function Orders({ orders, onSaved }) {
  async function updateStatus(id, status) {
    await api.patch(`/orders/${id}/status`, { status });
    onSaved();
  }

  return <OrderTable orders={orders} onStatus={updateStatus} />;
}

function OrderTable({ orders, onStatus, compact = false }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            {!compact && <th>Update</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>#{order._id.slice(-6).toUpperCase()}</td>
              <td>{order.user?.name || 'Customer'}</td>
              <td>{currency(order.total)}</td>
              <td><span className={`status ${order.status}`}>{order.status}</span></td>
              {!compact && (
                <td>
                  <select value={order.status} onChange={event => onStatus(order._id, event.target.value)}>
                    {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersView({ users }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Phone</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td><span className="pill">{user.role}</span></td>
              <td>{user.phone || '-'}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
