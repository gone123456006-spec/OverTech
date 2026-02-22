import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Bell, Check, ChevronRight, Clock, Download,
  Image, ImagePlus, LayoutGrid, Package, Pencil, RefreshCw,
  Save, Search, ShoppingBag, ShoppingCart, Trash2, TrendingUp,
  Truck, Upload, X, XCircle, DollarSign, Users, BarChart2
} from 'lucide-react';
import { getProductById, getAllProducts } from '../data/products';
import {
  cancelOrder, getOrders, updateOrderStatus,
  getBanners, saveBanners, getProductOverrides, saveProductOverride
} from '../utils/storage';
import type { Order, AdminBanners } from '../utils/storage';
import { toast } from 'sonner';

/* ── Design tokens ─────────────────────────────────────────────── */
// Apple palette: #F5F5F7 bg, #1D1D1F text, #6E6E73 secondary, #0071E3 accent
const SF = `font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]`;

/* ── Helpers ───────────────────────────────────────────────────── */
const STATUS_META: Record<Order['status'], { label: string; dot: string; pill: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' },
  accepted: { label: 'Accepted', dot: 'bg-blue-400', pill: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' },
  out_for_delivery: { label: 'Out for Delivery', dot: 'bg-indigo-400', pill: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' },
  delivered: { label: 'Delivered', dot: 'bg-green-400', pill: 'bg-green-50 text-green-600 ring-1 ring-green-200' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400', pill: 'bg-red-50 text-red-500 ring-1 ring-red-200' },
};

function fmt(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function isToday(d: string) {
  const dt = new Date(d), n = new Date();
  return dt.toDateString() === n.toDateString();
}
function downloadInvoice(order: Order) {
  const lines = [`OVERTECH INVOICE`, `Order: ${order.id}`, `Date: ${fmt(order.date)}`, ``,
    `Customer: ${order.address.name}  |  ${order.address.mobile}`,
    `Address: ${order.address.house}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`, ``, `Items:`];
  order.items.forEach(i => {
    const p = getProductById(i.productId);
    if (p) lines.push(`  ${p.name} × ${i.quantity}  —  ₹${p.price * i.quantity}`);
  });
  lines.push(``, `Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Google Pay'}  |  ${order.paymentStatus}`, `Total: ₹${order.total}`);
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
  Object.assign(document.createElement('a'), { href: url, download: `invoice-${order.id}.txt` }).click();
  URL.revokeObjectURL(url);
}
function exportCsv(orders: Order[]) {
  const rows = orders.map(o =>
    [o.id, o.address.name, o.address.mobile, fmt(o.date), STATUS_META[o.status].label,
    o.paymentMethod === 'cod' ? 'COD' : 'GPay', o.paymentStatus, `₹${o.total}`]
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv = ['Order ID,Customer,Phone,Date,Status,Payment,Pay Status,Total', ...rows].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  Object.assign(document.createElement('a'), { href: url, download: `orders-${Date.now()}.csv` }).click();
  URL.revokeObjectURL(url);
}

/* ── Atoms ─────────────────────────────────────────────────────── */

/** Apple-style label + secondary line */
function Label({ text, sub }: { text: string; sub?: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">{text}</p>
      {sub && <p className="text-sm text-[#1D1D1F] font-medium">{sub}</p>}
    </div>
  );
}

/** Subtle pill badge */
function Pill({ status }: { status: Order['status'] }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/** Ghost button */
function GhostBtn({ children, onClick, danger, className = '' }: { children: React.ReactNode; onClick?: () => void; danger?: boolean; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
        ${danger
          ? 'text-red-500 hover:bg-red-50 active:bg-red-100'
          : 'text-[#1D1D1F] bg-white hover:bg-[#F5F5F7] active:bg-[#E8E8ED] ring-1 ring-black/[0.06]'
        } ${className}`}
    >
      {children}
    </button>
  );
}

/** Primary CTA button */
function PrimaryBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0068D0] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** Metric card — Apple style (white + ultra-light shadow) */
function MetricCard({ label, value, sub, icon: Icon, accent = false }:
  { label: string; value: string | number; sub?: string; icon?: any; accent?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.04)]">
      {Icon && (
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${accent ? 'bg-[#0071E3]' : 'bg-[#F5F5F7]'}`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-white' : 'text-[#6E6E73]'}`} />
        </div>
      )}
      <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[#6E6E73] mt-0.5">{sub}</p>}
    </div>
  );
}

/** Order row card */
function OrderCard({ order, highlight, actions }: { order: Order; highlight?: boolean; actions: React.ReactNode }) {
  const items = order.items.map(i => {
    const p = getProductById(i.productId);
    return p ? `${p.name} ×${i.quantity}` : '';
  }).filter(Boolean).join(' · ');

  return (
    <div className={`bg-white rounded-2xl p-5 transition-all duration-300
      ${highlight
        ? 'ring-2 ring-[#0071E3]/30 shadow-[0_0_0_4px_rgba(0,113,227,0.06)]'
        : 'shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-1 rounded-lg">
            {order.id}
          </span>
          <Pill status={order.status} />
          {isToday(order.date) && (
            <span className="text-[10px] font-semibold text-[#0071E3] bg-blue-50 px-2 py-0.5 rounded-full ring-1 ring-blue-100">TODAY</span>
          )}
        </div>
        <span className="text-sm font-semibold text-[#1D1D1F] tabular-nums whitespace-nowrap">₹{order.total}</span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4 mb-4">
        <Label text="Customer" sub={order.address.name} />
        <Label text="Phone" sub={order.address.mobile} />
        <Label text="Date" sub={fmt(order.date)} />
        <Label text="Payment" sub={order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)} />
        <div className="col-span-2 md:col-span-4">
          <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Items</p>
          <p className="text-sm text-[#1D1D1F] truncate">{items || '—'}</p>
        </div>
        <div className="col-span-2 md:col-span-4">
          <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Delivery Address</p>
          <p className="text-sm text-[#1D1D1F] truncate">{order.address.house}, {order.address.city}, {order.address.state} — {order.address.pincode}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F5F5F7]">{actions}</div>
    </div>
  );
}

/* ── Banner field ──────────────────────────────────────────────── */
function BannerField({ label, hint, value, onChange }:
  { label: string; hint?: string; value?: string; onChange: (v: string) => void }) {
  const [url, setUrl] = useState(value || '');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => { const v = ev.target?.result as string; setUrl(v); onChange(v); };
    r.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-[#1D1D1F]">{label}</p>
          {hint && <p className="text-xs text-[#6E6E73] mt-0.5">{hint}</p>}
        </div>
        {value && (
          <button onClick={() => { setUrl(''); onChange(''); toast.success('Cleared'); }}
            className="p-1.5 rounded-lg text-[#6E6E73] hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {value && (
        <div className="mb-4 rounded-xl overflow-hidden bg-[#F5F5F7] ring-1 ring-black/[0.06]">
          <img src={value} alt="" className="w-full max-h-36 object-cover" />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text" placeholder="Paste image URL…" value={url}
            onChange={e => setUrl(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#0071E3]/30 placeholder-[#9E9EA7] text-[#1D1D1F]"
          />
          <PrimaryBtn onClick={() => { onChange(url); toast.success('Applied'); }}>
            Apply
          </PrimaryBtn>
        </div>
        <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#D2D2D7] hover:border-[#0071E3] text-xs text-[#6E6E73] hover:text-[#0071E3] cursor-pointer transition-colors">
          <Upload className="w-3.5 h-3.5" /> Upload from device
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  ORDERS TAB                                                    */
/* ══════════════════════════════════════════════════════════════ */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statFilter, setStatFilter] = useState<'all' | Order['status']>('all');
  const [newId, setNewId] = useState<string | null>(null);
  const prevCount = useRef(0);

  const load = () => { const o = getOrders(); prevCount.current = o.length; setOrders(o); };

  useEffect(() => {
    load();
    const onUp = () => {
      const latest = getOrders();
      if (latest.length > prevCount.current) {
        toast.success('New order received');
        setNewId(latest[0]?.id || null);
        setTimeout(() => setNewId(null), 4000);
      }
      prevCount.current = latest.length;
      setOrders(latest);
    };
    window.addEventListener('ordersUpdated', onUp);
    window.addEventListener('storage', onUp);
    return () => { window.removeEventListener('ordersUpdated', onUp); window.removeEventListener('storage', onUp); };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(o =>
      (!q || o.id.toLowerCase().includes(q) || o.address.name.toLowerCase().includes(q) || o.address.mobile.includes(q)) &&
      (statFilter === 'all' || o.status === statFilter)
    );
  }, [orders, search, statFilter]);

  const byStatus = (s: Order['status']) => filtered.filter(o => o.status === s);
  const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  const SECTIONS: { status: Order['status']; icon: any }[] = [
    { status: 'pending', icon: Clock },
    { status: 'accepted', icon: Check },
    { status: 'out_for_delivery', icon: Truck },
    { status: 'delivered', icon: ShoppingBag },
    { status: 'cancelled', icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Orders" value={orders.length} icon={Package} />
        <MetricCard label="Pending" value={orders.filter(o => o.status === 'pending').length} icon={Clock} accent />
        <MetricCard label="Delivered" value={orders.filter(o => o.status === 'delivered').length} icon={ShoppingBag} />
        <MetricCard label="Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} icon={DollarSign} accent />
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[160px] bg-[#F5F5F7] rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-[#9E9EA7] flex-shrink-0" />
          <input
            type="text" placeholder="Search orders, customers…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-[#1D1D1F] placeholder-[#9E9EA7] outline-none w-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'pending', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'] as const).map(s => (
            <button key={s} onClick={() => setStatFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                ${statFilter === s ? 'bg-[#1D1D1F] text-white' : 'text-[#6E6E73] hover:bg-[#F5F5F7]'}`}>
              {s === 'all' ? 'All' : STATUS_META[s].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <GhostBtn onClick={load}><RefreshCw className="w-3.5 h-3.5" /></GhostBtn>
          <GhostBtn onClick={() => exportCsv(filtered)}><Download className="w-3.5 h-3.5" /> Export</GhostBtn>
        </div>
      </div>

      {/* Empty */}
      {orders.length === 0 && (
        <div className="bg-white rounded-2xl py-20 flex flex-col items-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="w-14 h-14 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-[#9E9EA7]" />
          </div>
          <p className="text-[#1D1D1F] font-medium">No orders yet</p>
          <p className="text-sm text-[#6E6E73] mt-1">Orders will appear here once customers check out</p>
          <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#0071E3] font-medium hover:underline">
            View store <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Order sections */}
      {SECTIONS.map(({ status, icon: Icon }) => {
        const list = byStatus(status);
        if (!list.length) return null;
        return (
          <section key={status}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4 text-[#6E6E73]" />
              <h2 className="text-sm font-semibold text-[#1D1D1F]">{STATUS_META[status].label}</h2>
              <span className="ml-1 text-xs font-semibold text-[#6E6E73] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                {list.length}
              </span>
            </div>
            <div className="space-y-3">
              {list.map(order => (
                <OrderCard key={order.id} order={order} highlight={newId === order.id} actions={
                  <>
                    {status === 'pending' && <>
                      <PrimaryBtn onClick={() => { updateOrderStatus(order.id, 'accepted'); toast.success('Order accepted'); }}>
                        <Check className="w-3.5 h-3.5" /> Accept
                      </PrimaryBtn>
                      <GhostBtn danger onClick={() => { cancelOrder(order.id, 'Rejected by admin'); toast.info('Rejected'); }}>
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </GhostBtn>
                    </>}
                    {status === 'accepted' && <>
                      <PrimaryBtn onClick={() => { updateOrderStatus(order.id, 'out_for_delivery'); toast.success('Out for delivery'); }}>
                        <Truck className="w-3.5 h-3.5" /> Out for Delivery
                      </PrimaryBtn>
                      <GhostBtn onClick={() => toast.success(`Notified ${order.address.name}`)}>
                        <Bell className="w-3.5 h-3.5" /> Notify
                      </GhostBtn>
                    </>}
                    {status === 'out_for_delivery' && <>
                      <PrimaryBtn onClick={() => { updateOrderStatus(order.id, 'delivered'); toast.success('Delivered!'); }}>
                        <Check className="w-3.5 h-3.5" /> Mark Delivered
                      </PrimaryBtn>
                      <p className="text-xs text-[#6E6E73] self-center">{order.deliveryAgentName}</p>
                    </>}
                    {(status === 'delivered' || status === 'cancelled') && <>
                      <GhostBtn onClick={() => downloadInvoice(order)}>
                        <Download className="w-3.5 h-3.5" /> Invoice
                      </GhostBtn>
                      <Link to={`/order-confirmation/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#1D1D1F] bg-white ring-1 ring-black/[0.06] hover:bg-[#F5F5F7] transition-colors">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </>}
                  </>
                } />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  PRODUCTS TAB                                                  */
/* ══════════════════════════════════════════════════════════════ */
function ProductsTab() {
  const all = getAllProducts();
  const [editing, setEditing] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return all.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.includes(q));
  }, [all, search]);

  const start = (id: string) => {
    const p = all.find(x => x.id === id)!;
    const ov = getProductOverrides().find(o => o.id === id);
    setEditing(prev => ({ ...prev, [id]: { name: p.name, price: p.price, stock: p.stock, image: p.image, description: p.description, banner: ov?.banner || '' } }));
  };

  const cancel = (id: string) => setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });

  const save = (id: string) => {
    setSaving(id);
    const e = editing[id];
    saveProductOverride({ id, name: e.name, price: Number(e.price), stock: Number(e.stock), image: e.image, description: e.description, banner: e.banner });
    setTimeout(() => { setSaving(null); cancel(id); toast.success('Saved'); }, 350);
  };

  const fileToField = (id: string, field: 'image' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: ev.target?.result as string } }));
    r.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Search className="w-3.5 h-3.5 text-[#9E9EA7]" />
        <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm text-[#1D1D1F] placeholder-[#9E9EA7] outline-none bg-transparent" />
        <span className="text-xs text-[#9E9EA7]">{filtered.length} items</span>
      </div>

      {/* Product list */}
      <div className="space-y-3">
        {filtered.map(product => {
          const isEdit = !!editing[product.id];
          const e = editing[product.id] || {};
          const hasOverride = getProductOverrides().some(o => o.id === product.id && Object.keys(o).length > 1);

          return (
            <div key={product.id} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
              {!isEdit ? (
                /* View row */
                <div className="flex items-center gap-4 p-4">
                  <div className="relative flex-shrink-0">
                    <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover bg-[#F5F5F7]" />
                    {hasOverride && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#0071E3] ring-2 ring-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1D1D1F] truncate">{product.name}</p>
                    <p className="text-xs text-[#6E6E73] capitalize mt-0.5">{product.category}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-semibold text-[#1D1D1F]">₹{product.price}</span>
                      <span className={`text-xs ${product.stock <= 5 ? 'text-red-500' : 'text-[#6E6E73]'}`}>
                        {product.stock} in stock{product.stock <= 5 ? ' ⚠' : ''}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => start(product.id)}
                    className="p-2 rounded-xl text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F] transition-colors flex-shrink-0">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Edit form */
                <div className="p-5 space-y-4">
                  {/* Image + basic fields  */}
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      <img src={e.image} alt="" className="w-20 h-20 rounded-xl object-cover bg-[#F5F5F7]" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={ev => fileToField(product.id, 'image', ev)} />
                      </label>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Name</p>
                        <input value={e.name} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], name: ev.target.value } }))}
                          className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]/25 text-[#1D1D1F]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Price (₹)</p>
                        <input type="number" value={e.price} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], price: ev.target.value } }))}
                          className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]/25 text-[#1D1D1F]" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Stock</p>
                        <input type="number" value={e.stock} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], stock: ev.target.value } }))}
                          className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]/25 text-[#1D1D1F]" />
                      </div>
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Image URL</p>
                    <input value={e.image} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], image: ev.target.value } }))}
                      className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]/25 text-[#1D1D1F]" />
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Description</p>
                    <textarea value={e.description} rows={2} onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], description: ev.target.value } }))}
                      className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]/25 text-[#1D1D1F] resize-none" />
                  </div>

                  {/* Product Banner */}
                  <div className="border-t border-[#F5F5F7] pt-4">
                    <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-2 flex items-center gap-1">
                      <ImagePlus className="w-3 h-3" /> Product Banner
                    </p>
                    {e.banner && <img src={e.banner} alt="" className="w-full h-16 object-cover rounded-xl mb-2" />}
                    <div className="flex gap-2">
                      <input value={e.banner} placeholder="Banner URL…" onChange={ev => setEditing(p => ({ ...p, [product.id]: { ...p[product.id], banner: ev.target.value } }))}
                        className="flex-1 px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#0071E3]/25 text-[#1D1D1F]" />
                      <label className="px-3 py-2 rounded-xl bg-[#F5F5F7] text-xs text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer flex items-center gap-1 transition-colors">
                        <Upload className="w-3 h-3" /> File
                        <input type="file" accept="image/*" className="hidden" onChange={ev => fileToField(product.id, 'banner', ev)} />
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <PrimaryBtn onClick={() => save(product.id)} disabled={saving === product.id}>
                      <Save className="w-3.5 h-3.5" /> {saving === product.id ? 'Saving…' : 'Save'}
                    </PrimaryBtn>
                    <GhostBtn onClick={() => cancel(product.id)}>
                      <X className="w-3.5 h-3.5" /> Cancel
                    </GhostBtn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  BANNERS TAB                                                   */
/* ══════════════════════════════════════════════════════════════ */
function BannersTab() {
  const [banners, setBanners] = useState<AdminBanners>(getBanners());
  const upd = (key: keyof AdminBanners, v: string) => {
    const next = { ...banners, [key]: v };
    setBanners(next);
    saveBanners(next);
  };
  return (
    <div className="space-y-4">
      <div className="bg-[#F5F5F7] rounded-2xl p-4 flex gap-3">
        <Image className="w-4 h-4 text-[#6E6E73] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-[#6E6E73]">
          Banners update instantly across the storefront. Recommended size: <strong>1200 × 400 px</strong>.
        </p>
      </div>
      <BannerField label="Homepage Banner" hint="Top of the homepage" value={banners.home} onChange={v => upd('home', v)} />
      <BannerField label="Cart Banner" hint="Top of the cart page" value={banners.cart} onChange={v => upd('cart', v)} />
      <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-widest pt-2">Categories</p>
      <BannerField label="Clothes" value={banners.categoryClothes} onChange={v => upd('categoryClothes', v)} />
      <BannerField label="Jewellery" value={banners.categoryJewellery} onChange={v => upd('categoryJewellery', v)} />
      <BannerField label="Food" value={banners.categoryFood} onChange={v => upd('categoryFood', v)} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  ANALYTICS TAB                                                 */
/* ══════════════════════════════════════════════════════════════ */
function AnalyticsTab() {
  const orders = getOrders();

  const monthly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const dt = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const mo = orders.filter(o => {
        const d = new Date(o.date);
        return d.getMonth() === dt.getMonth() && d.getFullYear() === dt.getFullYear();
      });
      return {
        label: dt.toLocaleDateString('en-IN', { month: 'short' }),
        orders: mo.length,
        revenue: mo.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0),
      };
    });
  }, [orders]);

  const maxO = Math.max(...monthly.map(m => m.orders), 1);
  const maxR = Math.max(...monthly.map(m => m.revenue), 1);

  const topProducts = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => o.items.forEach(i => { map[i.productId] = (map[i.productId] || 0) + i.quantity; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([id, qty]) => ({ product: getProductById(id), qty }));
  }, [orders]);

  const avgMin = useMemo(() => {
    const d = orders.filter(o => o.deliveredAt);
    if (!d.length) return null;
    return Math.round(d.reduce((s, o) => s + (new Date(o.deliveredAt!).getTime() - new Date(o.date).getTime()) / 60000, 0) / d.length);
  }, [orders]);

  const revenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Orders" value={orders.length} icon={Package} />
        <MetricCard label="Today" value={orders.filter(o => isToday(o.date)).length} icon={TrendingUp} accent />
        <MetricCard label="Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} icon={DollarSign} accent />
        <MetricCard label="Avg Delivery" value={avgMin !== null ? `${avgMin} min` : '—'} icon={Clock}
          sub={avgMin !== null ? 'from order to door' : 'no deliveries yet'} />
      </div>

      {/* Orders chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="w-4 h-4 text-[#6E6E73]" />
          <p className="text-sm font-semibold text-[#1D1D1F]">Monthly Orders</p>
        </div>
        <div className="flex items-end gap-2 h-32">
          {monthly.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[#9E9EA7]">{m.orders || ''}</span>
              <div className="w-full rounded-lg transition-all"
                style={{ height: `${Math.max(4, (m.orders / maxO) * 100)}%`, background: 'linear-gradient(180deg,#0071E3 0%,#34AADC 100%)' }}
                title={`₹${m.revenue}`} />
              <span className="text-[10px] text-[#6E6E73] font-medium">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-[#6E6E73]" />
          <p className="text-sm font-semibold text-[#1D1D1F]">Monthly Revenue</p>
        </div>
        <div className="flex items-end gap-2 h-32">
          {monthly.map(m => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-[#9E9EA7]">{m.revenue ? `₹${(m.revenue / 1000).toFixed(1)}k` : ''}</span>
              <div className="w-full rounded-lg transition-all"
                style={{ height: `${Math.max(4, (m.revenue / maxR) * 100)}%`, background: 'linear-gradient(180deg,#34C759 0%,#30D158 100%)' }}
              />
              <span className="text-[10px] text-[#6E6E73] font-medium">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="w-4 h-4 text-[#6E6E73]" />
          <p className="text-sm font-semibold text-[#1D1D1F]">Top Products</p>
        </div>
        {topProducts.length === 0
          ? <p className="text-sm text-[#9E9EA7] text-center py-6">No sales data yet</p>
          : <div className="divide-y divide-[#F5F5F7]">
            {topProducts.map(({ product, qty }, i) => (
              <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="w-5 text-xs font-bold text-[#9E9EA7] tabular-nums text-right">#{i + 1}</span>
                {product && <img src={product.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-[#F5F5F7]" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1D1D1F] truncate">{product?.name || 'Unknown'}</p>
                  <p className="text-xs text-[#6E6E73]">{qty} units sold</p>
                </div>
                <span className="text-sm font-semibold text-[#1D1D1F] tabular-nums">₹{product ? product.price * qty : 0}</span>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#6E6E73]" />
          <p className="text-sm font-semibold text-[#1D1D1F]">Status Breakdown</p>
        </div>
        <div className="space-y-3">
          {(['pending', 'accepted', 'out_for_delivery', 'delivered', 'cancelled'] as Order['status'][]).map(s => {
            const count = orders.filter(o => o.status === s).length;
            const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
            const trackColors: Record<string, string> = {
              pending: '#F5A623', accepted: '#007AFF', out_for_delivery: '#5856D6',
              delivered: '#34C759', cancelled: '#FF3B30'
            };
            return (
              <div key={s}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[#6E6E73]">{STATUS_META[s].label}</span>
                  <span className="text-xs font-semibold text-[#1D1D1F]">{count}</span>
                </div>
                <div className="h-1.5 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: trackColors[s] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  MAIN — Apple-style top nav + content area                     */
/* ══════════════════════════════════════════════════════════════ */
type Tab = 'orders' | 'products' | 'banners' | 'analytics';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'banners', label: 'Banners', icon: ImagePlus },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

export function AdminOrderDashboard() {
  const [tab, setTab] = useState<Tab>('orders');
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const upd = () => setPending(getOrders().filter(o => o.status === 'pending').length);
    upd();
    window.addEventListener('ordersUpdated', upd);
    window.addEventListener('storage', upd);
    return () => { window.removeEventListener('ordersUpdated', upd); window.removeEventListener('storage', upd); };
  }, []);

  return (
    <div className={`min-h-screen bg-[#F5F5F7] ${SF}`}>
      {/* ── Top navigation bar ── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-6 h-14">
            {/* Brand */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
                <LayoutGrid className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#1D1D1F] hidden sm:block">Admin</span>
            </div>

            {/* Tab pills */}
            <nav className="flex gap-0.5 flex-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                    ${tab === id ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#6E6E73] hover:text-[#1D1D1F]'}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:block">{label}</span>
                  {id === 'orders' && pending > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {pending > 9 ? '9+' : pending}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Store link */}
            <Link to="/"
              className="flex-shrink-0 flex items-center gap-1.5 text-xs text-[#0071E3] font-medium hover:underline">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Store</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
            {TABS.find(t => t.id === tab)?.label}
          </h1>
          {tab === 'orders' && pending > 0 && (
            <p className="text-sm text-[#6E6E73] mt-1 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {pending} order{pending > 1 ? 's' : ''} waiting for your response
            </p>
          )}
        </div>

        {tab === 'orders' && <OrdersTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'banners' && <BannersTab />}
        {tab === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  );
}
