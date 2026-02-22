import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, Bell, ChevronRight, Download, Image, ImagePlus,
  LayoutDashboard, Package, Pencil, Save, Search, ShoppingBag,
  ShoppingCart, Trash2, Upload, X, Check, Clock, Truck, XCircle,
  TrendingUp, Users, DollarSign, RefreshCw
} from 'lucide-react';
import { getProductById, getAllProducts } from '../data/products';
import {
  cancelOrder, getOrders, updateOrderStatus, getBanners, saveBanners,
  getProductOverrides, saveProductOverride
} from '../utils/storage';
import type { Order, AdminBanners } from '../utils/storage';
import { toast } from 'sonner';

/* ─── helpers ─────────────────────────────────────────────────── */
const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  out_for_delivery: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};
const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function isToday(d: string) {
  const dt = new Date(d), now = new Date();
  return dt.getDate() === now.getDate() && dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
}

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function downloadInvoice(order: Order) {
  const lines = [
    'OVERTECH INVOICE',
    `Invoice Date: ${fmt(new Date().toISOString())}`,
    `Order ID: ${order.id}`,
    `Order Date: ${fmt(order.date)}`,
    '',
    `Customer: ${order.address.name}`,
    `Phone: ${order.address.mobile}`,
    `Address: ${order.address.house}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
    '',
    'Items:',
  ];
  order.items.forEach((item) => {
    const p = getProductById(item.productId);
    if (p) lines.push(`  - ${p.name} x${item.quantity}  ₹${p.price * item.quantity}`);
  });
  lines.push('', `Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Google Pay (UPI)'}  |  Status: ${order.paymentStatus}`);
  lines.push(`Total: ₹${order.total}`);
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `invoice-${order.id}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function exportCsv(orders: Order[]) {
  const header = ['Order ID', 'Customer', 'Phone', 'Date', 'Status', 'Payment Mode', 'Payment Status', 'Total'];
  const rows = orders.map(o => [
    o.id, o.address.name, o.address.mobile, fmt(o.date),
    STATUS_LABELS[o.status], o.paymentMethod === 'cod' ? 'COD' : 'GPay',
    o.paymentStatus, `₹${o.total}`
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

/* ─── Order Row card ───────────────────────────────────────────── */
function OrderCard({ order, highlight, actions }: { order: Order; highlight?: boolean; actions: React.ReactNode }) {
  const itemsLabel = order.items.map(i => {
    const p = getProductById(i.productId);
    return p ? `${p.name} ×${i.quantity}` : '';
  }).filter(Boolean).join(', ');

  return (
    <div className={`rounded-xl border bg-white p-4 transition-all duration-500 ${highlight ? 'ring-2 ring-green-400 shadow-lg' : 'shadow-sm hover:shadow-md'}`}>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-2">
        <span className="font-mono font-bold text-gray-800">{order.id}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
        <span className="text-gray-500">{fmt(order.date)}</span>
        <span className="font-semibold text-green-700 ml-auto">₹{order.total}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 text-sm text-gray-600 mb-3">
        <div>
          <span className="font-medium text-gray-800">{order.address.name}</span>
          <span className="text-xs ml-2 text-gray-500">{order.address.mobile}</span>
        </div>
        <div className="text-xs text-gray-500 truncate">
          {order.address.house}, {order.address.city}, {order.address.state} - {order.address.pincode}
        </div>
        <div className="col-span-2 text-xs mt-1 text-gray-500 truncate">📦 {itemsLabel}</div>
      </div>
      {actions}
    </div>
  );
}

/* ─── Stat card ────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/* ─── Banner upload helper ─────────────────────────────────────── */
function BannerField({
  label, hint, value, onChange
}: { label: string; hint?: string; value?: string; onChange: (v: string) => void }) {
  const [url, setUrl] = useState(value || '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setUrl(result);
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const apply = () => { onChange(url); toast.success(`${label} updated`); };
  const clear = () => { setUrl(''); onChange(''); toast.info(`${label} cleared`); };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{label}</h3>
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
        </div>
        {value && (
          <button onClick={clear} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {value && (
        <div className="mb-3 rounded-lg overflow-hidden border bg-gray-50">
          <img src={value} alt={label} className="w-full max-h-40 object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste image URL..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
          />
          <button onClick={apply} className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm flex items-center gap-1 transition-colors">
            <Check className="w-4 h-4" /> Apply
          </button>
        </div>
        <label className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-green-400 hover:text-green-600 cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          Upload from device
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TABS                                                           */
/* ═══════════════════════════════════════════════════════════════ */

/* — Orders Tab — */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [payFilter, setPayFilter] = useState<'all' | 'pending' | 'paid' | 'refunded'>('all');
  const [statFilter, setStatFilter] = useState<'all' | Order['status']>('all');
  const [newId, setNewId] = useState<string | null>(null);
  const prevCount = useRef(0);

  const load = () => {
    const latest = getOrders();
    prevCount.current = latest.length;
    setOrders(latest);
  };

  useEffect(() => {
    load();
    const onUpdate = () => {
      const latest = getOrders();
      if (latest.length > prevCount.current) {
        toast.success('🔔 New order received!', { duration: 5000 });
        setNewId(latest[0]?.id || null);
        setTimeout(() => setNewId(null), 4000);
      }
      prevCount.current = latest.length;
      setOrders(latest);
    };
    window.addEventListener('ordersUpdated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => { window.removeEventListener('ordersUpdated', onUpdate); window.removeEventListener('storage', onUpdate); };
  }, []);

  const filtered = useMemo(() => orders.filter(o => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || o.id.toLowerCase().includes(q) || o.address.name.toLowerCase().includes(q) || o.address.mobile.includes(q);
    const d = new Date(o.date);
    const fromOk = !dateFrom || d >= new Date(`${dateFrom}T00:00:00`);
    const toOk = !dateTo || d <= new Date(`${dateTo}T23:59:59`);
    const payOk = payFilter === 'all' || o.paymentStatus === payFilter;
    const statOk = statFilter === 'all' || o.status === statFilter;
    return matchQ && fromOk && toOk && payOk && statOk;
  }), [orders, search, dateFrom, dateTo, payFilter, statFilter]);

  const pending = filtered.filter(o => o.status === 'pending');
  const accepted = filtered.filter(o => o.status === 'accepted');
  const outFor = filtered.filter(o => o.status === 'out_for_delivery');
  const delivered = filtered.filter(o => o.status === 'delivered');
  const cancelled = filtered.filter(o => o.status === 'cancelled');

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total Orders" value={orders.length} color="bg-green-600" />
        <StatCard icon={Clock} label="Pending" value={orders.filter(o => o.status === 'pending').length} color="bg-amber-500" />
        <StatCard icon={Truck} label="Out for Delivery" value={orders.filter(o => o.status === 'out_for_delivery').length} color="bg-indigo-600" />
        <StatCard icon={DollarSign} label="Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="bg-emerald-600" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-700">Filter & Search</h2>
          <button onClick={load} className="ml-auto p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => exportCsv(filtered)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            type="text" placeholder="Search order / customer / phone..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="col-span-2 px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border rounded-lg" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 text-sm border rounded-lg" />
          <select value={statFilter} onChange={e => setStatFilter(e.target.value as any)} className="px-3 py-2 text-sm border rounded-lg">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet. Customers haven't placed any orders.</p>
          <Link to="/" className="inline-block mt-4 px-5 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-500 transition-colors">Visit Store</Link>
        </div>
      )}

      {/* 🟡 Pending */}
      {pending.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-amber-700 mb-3">
            <Clock className="w-5 h-5" /> Pending Orders
            <span className="ml-auto bg-amber-100 text-amber-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">{pending.length}</span>
          </h2>
          <div className="space-y-3">
            {pending.map(order => (
              <OrderCard key={order.id} order={order} highlight={newId === order.id} actions={
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { updateOrderStatus(order.id, 'accepted'); toast.success('Order accepted'); }} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg flex items-center gap-1.5 transition-colors"><Check className="w-4 h-4" /> Accept</button>
                  <button onClick={() => { cancelOrder(order.id, 'Rejected by admin'); toast.info('Order rejected'); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg flex items-center gap-1.5 transition-colors"><XCircle className="w-4 h-4" /> Reject</button>
                  <button onClick={() => downloadInvoice(order)} className="px-4 py-2 border text-sm rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors"><Download className="w-4 h-4" /> Invoice</button>
                </div>
              } />
            ))}
          </div>
        </section>
      )}

      {/* 🟢 Accepted */}
      {accepted.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-blue-700 mb-3">
            <Check className="w-5 h-5" /> Accepted Orders
            <span className="ml-auto bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">{accepted.length}</span>
          </h2>
          <div className="space-y-3">
            {accepted.map(order => (
              <OrderCard key={order.id} order={order} actions={
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => { updateOrderStatus(order.id, 'out_for_delivery'); toast.success('Marked out for delivery'); }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg flex items-center gap-1.5 transition-colors"><Truck className="w-4 h-4" /> Out for Delivery</button>
                  <button onClick={() => toast.success(`Notification sent to ${order.address.mobile}`)} className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors"><Bell className="w-4 h-4" /> Notify Customer</button>
                </div>
              } />
            ))}
          </div>
        </section>
      )}

      {/* 🔵 Out for Delivery */}
      {outFor.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-indigo-700 mb-3">
            <Truck className="w-5 h-5" /> Out for Delivery
            <span className="ml-auto bg-indigo-100 text-indigo-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">{outFor.length}</span>
          </h2>
          <div className="space-y-3">
            {outFor.map(order => (
              <OrderCard key={order.id} order={order} actions={
                <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={() => { updateOrderStatus(order.id, 'delivered'); toast.success('Marked as delivered'); }} className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg flex items-center gap-1.5 transition-colors"><Check className="w-4 h-4" /> Mark Delivered</button>
                  <span className="text-xs text-gray-500">Agent: {order.deliveryAgentName} · {order.deliveryAgentPhone}</span>
                </div>
              } />
            ))}
          </div>
        </section>
      )}

      {/* 🟣 Delivered */}
      {delivered.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-green-700 mb-3">
            <ShoppingBag className="w-5 h-5" /> Delivered
            <span className="ml-auto bg-green-100 text-green-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">{delivered.length}</span>
          </h2>
          <div className="space-y-3">
            {delivered.map(order => (
              <OrderCard key={order.id} order={order} actions={
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => downloadInvoice(order)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg flex items-center gap-1.5 transition-colors"><Download className="w-4 h-4" /> Invoice</button>
                  <Link to={`/order-confirmation/${order.id}`} className="px-4 py-2 border text-sm rounded-lg flex items-center gap-1.5 hover:bg-gray-50 transition-colors">View <ChevronRight className="w-4 h-4" /></Link>
                </div>
              } />
            ))}
          </div>
        </section>
      )}

      {/* 🔴 Cancelled */}
      {cancelled.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-lg font-bold text-red-700 mb-3">
            <XCircle className="w-5 h-5" /> Cancelled
            <span className="ml-auto bg-red-100 text-red-800 text-sm font-semibold px-2.5 py-0.5 rounded-full">{cancelled.length}</span>
          </h2>
          <div className="space-y-3">
            {cancelled.map(order => (
              <OrderCard key={order.id} order={order} actions={
                <p className="text-xs text-gray-500">Reason: {order.cancellationReason || '—'} · Refund: {order.refundStatus || 'not_required'} · {fmt(order.cancelledAt)}</p>
              } />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* — Products Tab — */
function ProductsTab() {
  const allProducts = getAllProducts();
  const overrides = getProductOverrides();
  const [editing, setEditing] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const startEdit = (id: string) => {
    const p = allProducts.find(p => p.id === id)!;
    const ov = overrides.find(o => o.id === id);
    setEditing(prev => ({
      ...prev,
      [id]: { name: p.name, price: p.price, stock: p.stock, image: p.image, description: p.description, banner: ov?.banner || '' }
    }));
  };

  const cancelEdit = (id: string) => setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });

  const saveEdit = (id: string) => {
    setSaving(id);
    const e = editing[id];
    saveProductOverride({
      id,
      name: e.name,
      price: Number(e.price),
      stock: Number(e.stock),
      image: e.image,
      description: e.description,
      banner: e.banner,
    });
    setTimeout(() => {
      setSaving(null);
      cancelEdit(id);
      toast.success('Product updated!');
    }, 400);
  };

  const handleFileUpload = (id: string, field: 'image' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: ev.target?.result as string } }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800">All Products <span className="text-gray-400 font-normal text-sm">({allProducts.length})</span></h2>
        <p className="text-xs text-gray-500">Edit name, price, stock, image or add a product banner</p>
      </div>

      <div className="grid gap-4">
        {allProducts.map(product => {
          const isEdit = !!editing[product.id];
          const e = editing[product.id] || {};
          const ov = overrides.find(o => o.id === product.id);

          return (
            <div key={product.id} className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex gap-4 p-4">
                {/* Product Image */}
                <div className="relative flex-shrink-0">
                  <img
                    src={isEdit ? e.image : product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  {isEdit && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Upload className="w-5 h-5 text-white" />
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(product.id, 'image', e)} />
                    </label>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {isEdit ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500">Name</label>
                        <input value={e.name} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], name: ev.target.value } }))}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Price (₹)</label>
                          <input type="number" value={e.price} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], price: ev.target.value } }))}
                            className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500">Stock</label>
                          <input type="number" value={e.stock} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], stock: ev.target.value } }))}
                            className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">Image URL</label>
                        <input value={e.image} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], image: ev.target.value } }))}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500">Description</label>
                        <textarea value={e.description} rows={2} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], description: ev.target.value } }))}
                          className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-400 outline-none resize-none" />
                      </div>

                      {/* Product Banner */}
                      <div className="md:col-span-2 border-t pt-3 mt-1">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1"><ImagePlus className="w-3 h-3" /> Product Banner (shown on product page)</label>
                        {e.banner && <img src={e.banner} alt="banner" className="w-full h-20 object-cover rounded-lg border my-2" />}
                        <div className="flex gap-2">
                          <input value={e.banner} placeholder="Banner URL..." onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], banner: ev.target.value } }))}
                            className="flex-1 px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-green-400 outline-none" />
                          <label className="px-3 py-1.5 border text-sm rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-1 transition-colors">
                            <Upload className="w-3 h-3" /> File
                            <input type="file" accept="image/*" className="hidden" onChange={ev => handleFileUpload(product.id, 'banner', ev)} />
                          </label>
                        </div>
                      </div>

                      <div className="md:col-span-2 flex gap-2">
                        <button onClick={() => saveEdit(product.id)} disabled={saving === product.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-60">
                          <Save className="w-4 h-4" /> {saving === product.id ? 'Saving…' : 'Save Changes'}
                        </button>
                        <button onClick={() => cancelEdit(product.id)} className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                        <p className="text-green-700 font-bold mt-1">₹{product.price}</p>
                        <p className="text-xs text-gray-500">Stock: {product.stock} {product.stock <= 5 && <span className="text-red-500 font-medium ml-1">⚠ Low</span>}</p>
                        {ov?.banner && (
                          <p className="text-xs text-indigo-500 mt-1 flex items-center gap-1"><ImagePlus className="w-3 h-3" /> Banner set</p>
                        )}
                        {Object.keys(ov || {}).filter(k => k !== 'id').length > 0 && (
                          <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Edited</span>
                        )}
                      </div>
                      <button onClick={() => startEdit(product.id)}
                        className="flex-shrink-0 p-2 rounded-lg border hover:bg-gray-50 text-gray-500 hover:text-green-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* — Banners Tab — */
function BannersTab() {
  const [banners, setBanners] = useState<AdminBanners>(getBanners());

  const update = (key: keyof AdminBanners, value: string) => {
    const updated = { ...banners, [key]: value };
    setBanners(updated);
    saveBanners(updated);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Image className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          Banners are saved immediately and shown live on the storefront. Upload a file or paste any image URL. Recommended size: 1200×400 px.
        </p>
      </div>

      <div className="grid gap-5">
        <BannerField
          label="🏠 Homepage Hero Banner"
          hint="Shown at the top of the homepage (replaces default banner)"
          value={banners.home}
          onChange={v => update('home', v)}
        />
        <BannerField
          label="🛒 Cart Page Banner"
          hint="Displayed at the top of the cart page"
          value={banners.cart}
          onChange={v => update('cart', v)}
        />

        <h3 className="font-semibold text-gray-700 mt-2">Category Banners</h3>
        <BannerField
          label="👗 Clothes Category Banner"
          hint="Shown at the top of /category/clothes"
          value={banners.categoryClothes}
          onChange={v => update('categoryClothes', v)}
        />
        <BannerField
          label="💍 Jewellery Category Banner"
          hint="Shown at the top of /category/jewellery"
          value={banners.categoryJewellery}
          onChange={v => update('categoryJewellery', v)}
        />
        <BannerField
          label="🥗 Food Category Banner"
          hint="Shown at the top of /category/food"
          value={banners.categoryFood}
          onChange={v => update('categoryFood', v)}
        />
      </div>
    </div>
  );
}

/* — Analytics Tab — */
function AnalyticsTab() {
  const orders = getOrders();

  const monthly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const dt = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const label = dt.toLocaleDateString('en-IN', { month: 'short' });
      const mo = orders.filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === dt.getMonth() && d.getFullYear() === dt.getFullYear();
      });
      return { label, orders: mo.length, revenue: mo.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0) };
    });
  }, [orders]);

  const maxO = Math.max(...monthly.map(m => m.orders), 1);
  const maxR = Math.max(...monthly.map(m => m.revenue), 1);

  const avgMin = useMemo(() => {
    const del = orders.filter(o => o.deliveredAt);
    if (!del.length) return null;
    return Math.round(del.reduce((s, o) => s + (new Date(o.deliveredAt!).getTime() - new Date(o.date).getTime()) / 60000, 0) / del.length);
  }, [orders]);

  const topProducts = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(i => { map[i.productId] = (map[i.productId] || 0) + i.quantity; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, qty]) => ({ product: getProductById(id), qty }));
  }, [orders]);

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const todayOrders = orders.filter(o => isToday(o.date)).length;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total Orders" value={orders.length} color="bg-green-600" />
        <StatCard icon={TrendingUp} label="Today's Orders" value={todayOrders} color="bg-blue-600" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="bg-emerald-600" />
        <StatCard icon={Clock} label="Avg Delivery Time" value={avgMin !== null ? `${avgMin} min` : '—'} color="bg-indigo-600" />
      </div>

      {/* Monthly Orders Chart */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-5"><BarChart3 className="w-5 h-5 text-green-600" /> Monthly Orders</h2>
        <div className="flex items-end gap-3 h-40">
          {monthly.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{m.orders}</span>
              <div
                className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all"
                style={{ height: `${Math.max(8, (m.orders / maxO) * 100)}%` }}
                title={`₹${m.revenue}`}
              />
              <span className="text-xs text-gray-600 font-medium">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-5"><TrendingUp className="w-5 h-5 text-emerald-600" /> Monthly Revenue (₹)</h2>
        <div className="flex items-end gap-3 h-40">
          {monthly.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-500">{m.revenue > 0 ? `₹${m.revenue}` : '0'}</span>
              <div
                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all"
                style={{ height: `${Math.max(8, (m.revenue / maxR) * 100)}%` }}
              />
              <span className="text-xs text-gray-600 font-medium">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-4"><ShoppingBag className="w-5 h-5 text-indigo-600" /> Top Selling Products</h2>
        {topProducts.length === 0
          ? <p className="text-gray-500 text-sm">No sales data yet.</p>
          : (
            <div className="space-y-3">
              {topProducts.map(({ product, qty }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  {product && <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{product?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{qty} units sold</p>
                  </div>
                  <span className="text-sm font-bold text-green-700">₹{product ? product.price * qty : 0}</span>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="flex items-center gap-2 font-bold text-gray-800 mb-4"><Users className="w-5 h-5 text-amber-600" /> Order Status Breakdown</h2>
        <div className="space-y-2">
          {(['pending', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'] as Order['status'][]).map(s => {
            const count = orders.filter(o => o.status === s).length;
            const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
            const barColors: Record<string, string> = {
              pending: 'bg-amber-400', accepted: 'bg-blue-500', out_for_delivery: 'bg-indigo-500',
              delivered: 'bg-green-500', cancelled: 'bg-red-400'
            };
            return (
              <div key={s}>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>{STATUS_LABELS[s]}</span>
                  <span>{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColors[s]} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                 */
/* ═══════════════════════════════════════════════════════════════ */
type Tab = 'orders' | 'products' | 'banners' | 'analytics';

const TAB_CONFIG: { id: Tab; label: string; icon: any; badge?: () => number }[] = [
  { id: 'orders', label: 'Orders', icon: Package, badge: () => getOrders().filter(o => o.status === 'pending').length },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'banners', label: 'Banners', icon: ImagePlus },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminOrderDashboard() {
  const [tab, setTab] = useState<Tab>('orders');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const update = () => setPendingCount(getOrders().filter(o => o.status === 'pending').length);
    update();
    window.addEventListener('ordersUpdated', update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener('ordersUpdated', update); window.removeEventListener('storage', update); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-40 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 md:flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white">OverTech</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TAB_CONFIG.map(({ id, label, icon: Icon }) => {
            const badge = id === 'orders' ? pendingCount : 0;
            return (
              <button
                key={id}
                onClick={() => { setTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${tab === id ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="w-5 h-5" />
                {label}
                {badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ShoppingCart className="w-4 h-4" /> View Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <LayoutDashboard className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {TAB_CONFIG.find(t => t.id === tab)?.icon && (() => {
              const Icon = TAB_CONFIG.find(t => t.id === tab)!.icon;
              return <Icon className="w-5 h-5 text-green-600" />;
            })()}
            <h1 className="font-bold text-gray-800 text-lg">{TAB_CONFIG.find(t => t.id === tab)?.label}</h1>
          </div>
          {pendingCount > 0 && (
            <div className="ml-auto flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <Bell className="w-4 h-4 animate-pulse" />
              {pendingCount} pending order{pendingCount > 1 ? 's' : ''}
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {tab === 'orders' && <OrdersTab />}
          {tab === 'products' && <ProductsTab />}
          {tab === 'banners' && <BannersTab />}
          {tab === 'analytics' && <AnalyticsTab />}
        </main>
      </div>
    </div>
  );
}
