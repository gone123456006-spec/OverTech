import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Bell, Check, ChevronRight, Clock, Download,
  Image, ImagePlus, LayoutGrid, LogOut, Package, Pencil, RefreshCw,
  Save, Search, ShoppingBag, ShoppingCart, Tag, Trash2, TrendingUp,
  Truck, Upload, X, XCircle, DollarSign, Users, BarChart2, PlusSquare, FileText
} from 'lucide-react';
import { getProductById, getAllProducts, isCustomProduct } from '../data/products';
import {
  getOrders,
  getBanners, saveBanners, getProductOverrides, saveProductOverride,
  saveCustomProduct, deleteCustomProduct, newCustomProductId,
  BANNER_SLOT_CONFIG,
  DEFAULT_INVOICE_SETTINGS,
  getInvoiceSettings,
  saveInvoiceSettings,
  saveOrderFromServer,
  type AdminBanners,
  type CustomProduct,
  type InvoiceSettings,
  type Order,
} from '../utils/storage';
import {
  fetchAdminOrders,
  updateAdminOrderStatusApi,
  cancelAdminOrderApi,
} from '../utils/ordersApi';
import { AdminLogin } from './AdminLogin';
import { clearAdminToken, isAdminLoggedIn } from '../utils/adminAuth';
import { getCachedCategoryCards } from '../utils/categoryCards';
import { STOREFRONT_UPDATED_EVENT, syncStorefrontCatalog } from '../utils/storefront';
import { downloadOrderInvoice } from '../utils/invoice';
import { toast } from 'sonner';
import { SpecialOffersTab } from './SpecialOffersTab';
import { CategoriesTab } from './CategoriesTab';

/* ── Design tokens ─────────────────────────────────────────────── */
// Apple palette: #F5F5F7 bg, #1D1D1F text, #6E6E73 secondary, #134e4a accent
const SF = `font-['SF_Pro_Display',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]`;

/* ── Helpers ───────────────────────────────────────────────────── */
const STATUS_META: Record<Order['status'], { label: string; dot: string; pill: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' },
  accepted: { label: 'Accepted', dot: 'bg-teal-400', pill: 'bg-teal-50 text-teal-800 ring-1 ring-teal-200' },
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
      className="btn-primary-sm px-3.5 py-1.5 text-xs"
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
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${accent ? 'bg-teal-900 text-white' : 'bg-[#F5F5F7]'}`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-white' : 'text-[#6E6E73]'}`} />
        </div>
      )}
      <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[#6E6E73] mt-0.5">{sub}</p>}
    </div>
  );
}

function fmtPayment(order: Order) {
  const method = order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Online';
  if (order.paymentStatus === 'paid') return `${method} — Payment Done`;
  if (order.paymentStatus === 'refunded') return `${method} — Refunded`;
  return `${method} — Pending`;
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
        ? 'ring-2 ring-[#134e4a]/30 shadow-[0_0_0_4px_rgba(0,113,227,0.06)]'
        : 'shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-1 rounded-lg">
            {order.id}
          </span>
          <Pill status={order.status} />
          {order.paymentStatus === 'paid' && (
            <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-200">
              Payment Done
            </span>
          )}
          {isToday(order.date) && (
            <span className="text-[10px] font-semibold text-teal-900 bg-teal-50 px-2 py-0.5 rounded-full ring-1 ring-teal-100">TODAY</span>
          )}
        </div>
        <span className="text-sm font-semibold text-[#1D1D1F] tabular-nums whitespace-nowrap">₹{order.total}</span>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
        <Label text="Customer" sub={order.address.name} />
        <Label text="Phone" sub={order.address.mobile} />
        <Label text="Date" sub={fmt(order.date)} />
        <Label text="Payment" sub={fmtPayment(order)} />
        <div className="col-span-2">
          <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Items</p>
          <p className="text-sm text-[#1D1D1F] line-clamp-2">{items || '—'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Delivery Address</p>
          <p className="text-sm text-[#1D1D1F] line-clamp-2">{order.address.house}, {order.address.city}, {order.address.state} — {order.address.pincode}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-3 border-t border-[#F5F5F7]">{actions}</div>
    </div>
  );
}

/* ── Banner field ──────────────────────────────────────────────── */
function BannerField({ label, hint, value, onChange, defaultPreview }:
  { label: string; hint?: string; value?: string; onChange: (v: string) => void; defaultPreview?: string }) {
  const [url, setUrl] = useState(value || '');

  useEffect(() => {
    setUrl(value || '');
  }, [value]);

  const displaySrc = value || defaultPreview;
  const isCustom = Boolean(value);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => {
      const v = ev.target?.result as string;
      setUrl(v);
      onChange(v);
      toast.success('Banner updated on website');
    };
    r.readAsDataURL(file);
  };

  const applyUrl = () => {
    onChange(url);
    toast.success('Banner updated on website');
  };

  const clearBanner = () => {
    setUrl('');
    onChange('');
    toast.success(isCustom ? 'Custom banner removed' : 'Cleared');
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-[#1D1D1F]">{label}</p>
          {hint && <p className="text-xs text-[#6E6E73] mt-0.5">{hint}</p>}
        </div>
        {isCustom && (
          <button type="button" onClick={clearBanner}
            className="p-1.5 rounded-lg text-[#6E6E73] hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="mb-4 rounded-xl overflow-hidden bg-[#F5F5F7] ring-1 ring-black/[0.06] min-h-[120px]">
        {displaySrc ? (
          <>
            <img src={displaySrc} alt={`${label} preview`} className="w-full h-36 object-cover" />
            <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-[#6E6E73] bg-white/90 border-t border-black/[0.04]">
              {isCustom ? 'Custom — live on website' : 'Default — live on website'}
            </p>
          </>
        ) : (
          <div className="h-36 flex flex-col items-center justify-center text-[#9E9EA7] gap-1">
            <Image className="w-6 h-6" />
            <p className="text-xs">No banner set yet</p>
          </div>
        )}
      </div>

      <div className="space-y-2 mt-auto">
        <div className="flex gap-2">
          <input
            type="text" placeholder="Paste image URL…" value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyUrl()}
            className="flex-1 px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl border-0 outline-none focus:ring-2 focus:ring-[#134e4a]/30 placeholder-[#9E9EA7] text-[#1D1D1F]"
          />
          <PrimaryBtn onClick={applyUrl}>
            Apply
          </PrimaryBtn>
        </div>
        <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-[#D2D2D7] hover:border-[#134e4a] text-xs text-[#6E6E73] hover:text-[#134e4a] cursor-pointer transition-colors">
          <Upload className="w-3.5 h-3.5" /> Upload new image
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statFilter, setStatFilter] = useState<'all' | Order['status']>('all');
  const [newId, setNewId] = useState<string | null>(null);
  const prevCount = useRef(0);

  const load = async () => {
    try {
      const o = await fetchAdminOrders();
      if (o.length > prevCount.current && prevCount.current > 0) {
        toast.success('New order received');
        setNewId(o[0]?.id || null);
        setTimeout(() => setNewId(null), 4000);
      }
      prevCount.current = o.length;
      setOrders(o);
      o.forEach((order) => saveOrderFromServer(order));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
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
      {loading && orders.length === 0 && (
        <div className="text-sm text-[#6E6E73]">Loading orders…</div>
      )}
      {/* Metrics — 4 in one row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="Total Orders" value={orders.length} icon={Package} />
        <MetricCard label="Pending" value={orders.filter(o => o.status === 'pending').length} icon={Clock} accent />
        <MetricCard label="Delivered" value={orders.filter(o => o.status === 'delivered').length} icon={ShoppingBag} />
        <MetricCard label="Revenue" value={`₹${revenue.toLocaleString('en-IN')}`} icon={DollarSign} accent />
      </div>

      {/* Search + Filter bar — sticky while scrolling orders */}
      <div className="sticky top-[52px] md:top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10 px-4 sm:px-6 lg:px-8 xl:px-10 py-2 bg-[#F5F5F7]/95 backdrop-blur-sm">
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
          <GhostBtn onClick={() => void load()}><RefreshCw className="w-3.5 h-3.5" /></GhostBtn>
          <GhostBtn onClick={() => exportCsv(filtered)}><Download className="w-3.5 h-3.5" /> Export</GhostBtn>
        </div>
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
          <Link to="/" className="mt-5 inline-flex items-center gap-1.5 text-sm text-[#134e4a] font-medium hover:underline">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {list.map(order => (
                <OrderCard key={order.id} order={order} highlight={newId === order.id} actions={
                  <>
                    {status === 'pending' && <>
                      <PrimaryBtn onClick={() => {
                        updateAdminOrderStatusApi(order.id, 'accepted')
                          .then((updated) => { saveOrderFromServer(updated); void load(); toast.success('Order accepted'); })
                          .catch((e: Error) => toast.error(e.message));
                      }}>
                        <Check className="w-3.5 h-3.5" /> Accept
                      </PrimaryBtn>
                      <GhostBtn danger onClick={() => {
                        cancelAdminOrderApi(order.id, 'Rejected by admin')
                          .then((updated) => { saveOrderFromServer(updated); void load(); toast.info('Rejected'); })
                          .catch((e: Error) => toast.error(e.message));
                      }}>
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </GhostBtn>
                    </>}
                    {status === 'accepted' && <>
                      <PrimaryBtn onClick={() => {
                        updateAdminOrderStatusApi(order.id, 'out_for_delivery')
                          .then((updated) => { saveOrderFromServer(updated); void load(); toast.success('Out for delivery'); })
                          .catch((e: Error) => toast.error(e.message));
                      }}>
                        <Truck className="w-3.5 h-3.5" /> Out for Delivery
                      </PrimaryBtn>
                      <GhostBtn onClick={() => toast.success(`Notified ${order.address.name}`)}>
                        <Bell className="w-3.5 h-3.5" /> Notify
                      </GhostBtn>
                    </>}
                    {status === 'out_for_delivery' && <>
                      <PrimaryBtn onClick={() => {
                        updateAdminOrderStatusApi(order.id, 'delivered')
                          .then((updated) => { saveOrderFromServer(updated); void load(); toast.success('Delivered!'); })
                          .catch((e: Error) => toast.error(e.message));
                      }}>
                        <Check className="w-3.5 h-3.5" /> Mark Delivered
                      </PrimaryBtn>
                      <p className="text-xs text-[#6E6E73] self-center">{order.deliveryAgentName}</p>
                    </>}
                    {(status === 'delivered' || status === 'cancelled') && <>
                      <GhostBtn onClick={() => downloadOrderInvoice(order)}>
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
  const [refreshKey, setRefreshKey] = useState(0);
  const all = useMemo(() => getAllProducts(), [refreshKey]);
  const [editing, setEditing] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const categoryOptions = useMemo(() => {
    const fromCards = getCachedCategoryCards()
      .filter((c) => c.active)
      .map((c) => ({ slug: c.slug, label: c.name }));
    if (fromCards.length > 0) return fromCards;
    return [
      { slug: 'tech', label: 'Tech' },
      { slug: 'jewellery', label: 'Jewellery' },
      { slug: 'food', label: 'Food' },
    ];
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return all.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.includes(q));
  }, [all, search]);

  const start = (id: string) => {
    if (editing[id]) {
      cancel(id);
      return;
    }
    const p = all.find(x => x.id === id)!;
    const ov = getProductOverrides().find(o => o.id === id);
    setEditing({
      [id]: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        image: p.image,
        description: p.description,
        category: p.category,
        rating: p.rating,
        banner: ov?.banner || '',
        isNew: isCustomProduct(id),
      },
    });
  };

  const startNew = () => {
    const id = newCustomProductId();
    setEditing({
      [id]: {
        name: 'New Product',
        price: 999,
        stock: 10,
        image: '',
        description: 'Product description',
        category: categoryOptions[0]?.slug || 'tech',
        rating: 4.5,
        banner: '',
        isNew: true,
      },
    });
  };

  const cancel = (id: string) => setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });

  const save = (id: string) => {
    setSaving(id);
    const e = editing[id];
    const payload = {
      name: e.name,
      price: Number(e.price),
      stock: Number(e.stock),
      image: e.image,
      description: e.description,
      category: e.category,
      rating: Number(e.rating) || 4.5,
    };

    if (e.isNew || isCustomProduct(id)) {
      const product: CustomProduct = { id, ...payload };
      saveCustomProduct(product);
    } else {
      saveProductOverride({ id, ...payload, banner: e.banner });
    }

    setTimeout(() => {
      setSaving(null);
      cancel(id);
      setRefreshKey((k) => k + 1);
      toast.success('Product saved. Website updates within 1 minute.');
    }, 350);
  };

  const remove = (id: string) => {
    if (!isCustomProduct(id)) {
      toast.error('Only admin-added products can be deleted');
      return;
    }
    deleteCustomProduct(id);
    cancel(id);
    setRefreshKey((k) => k + 1);
    toast.success('Product removed');
  };

  const fileToField = (id: string, field: 'image' | 'banner', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader();
    r.onload = ev => setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: ev.target?.result as string } }));
    r.readAsDataURL(file);
  };

  const renderEditForm = (productId: string, e: Record<string, any>) => (
    <div className="p-3 space-y-3 border-t border-[#F5F5F7] bg-[#FAFAFA] rounded-b-2xl">
      {e.isNew && (
        <p className="text-[10px] font-medium text-[#134e4a]">New product — fill details and save</p>
      )}
      <div className="space-y-3">
        <div className="relative mx-auto w-16 h-16">
          {e.image ? (
            <img src={e.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-[#F5F5F7]" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[10px] text-[#9E9EA7]">No image</div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
            <Upload className="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={ev => fileToField(productId, 'image', ev)} />
          </label>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Name</p>
            <input value={e.name} onChange={ev => setEditing(p => ({ ...p, [productId]: { ...p[productId], name: ev.target.value } }))}
              className="w-full px-2 py-1.5 text-xs bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#134e4a]/25 text-[#1D1D1F]" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Category</p>
            <select
              value={e.category}
              onChange={ev => setEditing(p => ({ ...p, [productId]: { ...p[productId], category: ev.target.value } }))}
              className="w-full px-2 py-1.5 text-xs bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#134e4a]/25 text-[#1D1D1F]"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.slug} value={opt.slug}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Price (₹)</p>
              <input type="number" value={e.price} onChange={ev => setEditing(p => ({ ...p, [productId]: { ...p[productId], price: ev.target.value } }))}
                className="w-full px-2 py-1.5 text-xs bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#134e4a]/25 text-[#1D1D1F]" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Stock</p>
              <input type="number" value={e.stock} onChange={ev => setEditing(p => ({ ...p, [productId]: { ...p[productId], stock: ev.target.value } }))}
                className="w-full px-2 py-1.5 text-xs bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#134e4a]/25 text-[#1D1D1F]" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Rating</p>
            <input type="number" step="0.1" min="1" max="5" value={e.rating}
              onChange={ev => setEditing(p => ({ ...p, [productId]: { ...p[productId], rating: ev.target.value } }))}
              className="w-full px-2 py-1.5 text-xs bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#134e4a]/25 text-[#1D1D1F]" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Image URL</p>
            <input value={e.image} onChange={ev => setEditing(p => ({ ...p, [productId]: { ...p[productId], image: ev.target.value } }))}
              className="w-full px-2 py-1.5 text-xs bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#134e4a]/25 text-[#1D1D1F]" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wide mb-0.5">Description</p>
            <textarea value={e.description} rows={2} onChange={ev => setEditing(p => ({ ...p, [productId]: { ...p[productId], description: ev.target.value } }))}
              className="w-full px-2 py-1.5 text-xs bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#134e4a]/25 text-[#1D1D1F] resize-none" />
          </div>
          {!e.isNew && (
            <div className="pt-1">
              <p className="text-[10px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1 flex items-center gap-1">
                <ImagePlus className="w-3 h-3" /> Banner
              </p>
              {e.banner && <img src={e.banner} alt="" className="w-full h-12 object-cover rounded-lg mb-1" />}
              <input value={e.banner} placeholder="Banner URL…" onChange={ev => setEditing(p => ({ ...p, [productId]: { ...p[productId], banner: ev.target.value } }))}
                className="w-full px-2 py-1.5 text-xs bg-white rounded-lg outline-none focus:ring-2 focus:ring-[#134e4a]/25 text-[#1D1D1F]" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-1">
        <PrimaryBtn onClick={() => save(productId)} disabled={saving === productId}>
          <Save className="w-3 h-3" /> {saving === productId ? 'Saving…' : 'Save'}
        </PrimaryBtn>
        <GhostBtn onClick={() => cancel(productId)}>
          <X className="w-3 h-3" /> Cancel
        </GhostBtn>
        {(e.isNew || isCustomProduct(productId)) && (
          <GhostBtn danger onClick={() => remove(productId)}>
            <Trash2 className="w-3 h-3" /> Delete
          </GhostBtn>
        )}
      </div>
    </div>
  );

  const renderProductCard = (product: ReturnType<typeof getAllProducts>[number]) => {
    const isEdit = !!editing[product.id];
    const e = editing[product.id] || {};
    const hasOverride = getProductOverrides().some(o => o.id === product.id && Object.keys(o).length > 1);
    const isCustom = isCustomProduct(product.id);

    return (
      <div key={product.id} className="flex flex-col min-w-0">
        <div className={`bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col h-full ${isEdit ? 'ring-2 ring-[#134e4a]/30' : ''}`}>
          <div className="flex flex-col flex-1 p-2.5">
            <div className="relative mb-2">
              <img src={product.image} alt={product.name} className="w-full aspect-square rounded-lg object-cover bg-[#F5F5F7]" />
              {(hasOverride || isCustom) && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#134e4a] ring-2 ring-white" />
              )}
            </div>
            <p className="text-[11px] font-semibold text-[#1D1D1F] line-clamp-2 leading-tight">{product.name}</p>
            <p className="text-[10px] text-[#6E6E73] capitalize mt-0.5 truncate">{product.category}</p>
            <div className="flex items-center justify-between gap-1 mt-1.5">
              <span className="text-[11px] font-semibold text-[#1D1D1F]">₹{product.price}</span>
              <span className={`text-[10px] ${product.stock <= 5 ? 'text-red-500' : 'text-[#6E6E73]'}`}>
                {product.stock}{product.stock <= 5 ? ' ⚠' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#F5F5F7]">
              {isCustom && (
                <button type="button" onClick={() => remove(product.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button type="button" onClick={() => start(product.id)}
                className={`ml-auto p-1.5 rounded-lg transition-colors ${isEdit ? 'bg-[#134e4a] text-white' : 'text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'}`}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {isEdit && renderEditForm(product.id, e)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-[#6E6E73]">
          Add new product cards and choose which category they belong to. Category slug must match a category card (Admin → Categories).
        </p>
        <button
          type="button"
          onClick={startNew}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white ring-1 ring-black/[0.06] hover:bg-[#ebebed] shrink-0"
        >
          <PlusSquare className="w-3.5 h-3.5" /> Add New Product
        </button>
      </div>

      {/* Search — sticky while scrolling products */}
      <div className="sticky top-[52px] md:top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-10 px-4 sm:px-6 lg:px-8 xl:px-10 py-2 bg-[#F5F5F7]/95 backdrop-blur-sm">
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <Search className="w-3.5 h-3.5 text-[#9E9EA7]" />
          <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#1D1D1F] placeholder-[#9E9EA7] outline-none bg-transparent" />
          <span className="text-xs text-[#9E9EA7]">{filtered.length} items</span>
        </div>
      </div>

      {/* Product list — 5 per row; edit form opens below card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Object.entries(editing)
          .filter(([id]) => !all.some((p) => p.id === id))
          .map(([id, e]) => (
            <div key={id} className="flex flex-col min-w-0">
              <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden border-2 border-dashed border-[#134e4a]/30 ring-2 ring-[#134e4a]/20">
                <div className="p-2.5 flex flex-col items-center justify-center min-h-[140px] text-center">
                  <PlusSquare className="w-5 h-5 text-[#134e4a] mb-1" />
                  <p className="text-[11px] font-semibold text-[#1D1D1F]">New Product</p>
                </div>
                {renderEditForm(id, e)}
              </div>
            </div>
          ))}

        {filtered.map(product => renderProductCard(product))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  BANNERS TAB                                                   */
/* ══════════════════════════════════════════════════════════════ */
function BannersTab() {
  const [banners, setBanners] = useState<AdminBanners>(getBanners());

  useEffect(() => {
    syncStorefrontCatalog()
      .then(() => setBanners(getBanners()))
      .catch(() => setBanners(getBanners()));

    const refresh = () => setBanners(getBanners());
    window.addEventListener(STOREFRONT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(STOREFRONT_UPDATED_EVENT, refresh);
  }, []);

  const upd = (key: keyof AdminBanners, v: string) => {
    const next = { ...banners, [key]: v };
    if (!v) delete next[key];
    setBanners(next);
    saveBanners(next);
  };

  const stats = useMemo(() => {
    let custom = 0;
    let live = 0;
    BANNER_SLOT_CONFIG.forEach((slot) => {
      const customUrl = banners[slot.key];
      const liveUrl = customUrl || slot.defaultPreview;
      if (customUrl) custom += 1;
      if (liveUrl) live += 1;
    });
    return { total: BANNER_SLOT_CONFIG.length, custom, live };
  }, [banners]);

  return (
    <div className="space-y-4">
      <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex gap-3">
          <Image className="w-4 h-4 text-[#6E6E73] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-[#6E6E73]">
            All banner slots are listed below. Preview shows what is live on the website.
            Upload or paste a URL → Apply to update. Trash removes your custom image (default shows again where available).
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="text-xs px-2.5 py-1 rounded-full bg-white ring-1 ring-black/[0.06] text-[#6E6E73]">
            {stats.total} slots
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 ring-1 ring-teal-100">
            {stats.custom} custom
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white ring-1 ring-black/[0.06] text-[#6E6E73]">
            {stats.live} live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BANNER_SLOT_CONFIG.map((slot) => (
          <BannerField
            key={slot.key}
            label={slot.label}
            hint={slot.hint}
            value={banners[slot.key]}
            defaultPreview={slot.defaultPreview}
            onChange={(v) => upd(slot.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
/*  INVOICE SETTINGS TAB                                          */
/* ══════════════════════════════════════════════════════════════ */
function InvoiceSettingsTab() {
  const [settings, setSettings] = useState<InvoiceSettings>(() => getInvoiceSettings());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    syncStorefrontCatalog()
      .then(() => setSettings(getInvoiceSettings()))
      .catch(() => setSettings(getInvoiceSettings()));

    const refresh = () => setSettings(getInvoiceSettings());
    window.addEventListener(STOREFRONT_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(STOREFRONT_UPDATED_EVENT, refresh);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      saveInvoiceSettings(settings);
      toast.success('Invoice settings saved. New downloads use these details.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save invoice settings');
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => {
    setSettings(DEFAULT_INVOICE_SETTINGS);
    toast.message('Defaults loaded. Click Save to apply.');
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="bg-[#F5F5F7] rounded-2xl p-4">
        <p className="text-sm text-[#6E6E73]">
          Configure invoice header and terms &amp; conditions. These appear on A4 invoices downloaded from Orders.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] space-y-4">
        <div>
          <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Business Name</p>
          <input
            value={settings.businessName}
            onChange={(e) => setSettings((s) => ({ ...s, businessName: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#134e4a]/25"
          />
        </div>
        <div>
          <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Business Address</p>
          <input
            value={settings.businessAddress || ''}
            onChange={(e) => setSettings((s) => ({ ...s, businessAddress: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#134e4a]/25"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Phone</p>
            <input
              value={settings.businessPhone || ''}
              onChange={(e) => setSettings((s) => ({ ...s, businessPhone: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#134e4a]/25"
            />
          </div>
          <div>
            <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Email</p>
            <input
              value={settings.businessEmail || ''}
              onChange={(e) => setSettings((s) => ({ ...s, businessEmail: e.target.value }))}
              className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#134e4a]/25"
            />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-[#6E6E73] uppercase tracking-wide mb-1">Terms &amp; Conditions</p>
          <p className="text-xs text-[#9E9EA7] mb-2">One line per point. Shown at the bottom of every invoice.</p>
          <textarea
            value={settings.termsAndConditions}
            onChange={(e) => setSettings((s) => ({ ...s, termsAndConditions: e.target.value }))}
            rows={8}
            className="w-full px-3 py-2 text-sm bg-[#F5F5F7] rounded-xl outline-none focus:ring-2 focus:ring-[#134e4a]/25 resize-y"
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <PrimaryBtn onClick={handleSave} disabled={saving}>
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save Settings'}
          </PrimaryBtn>
          <GhostBtn onClick={resetDefaults}>Reset defaults</GhostBtn>
        </div>
      </div>
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
                style={{ height: `${Math.max(4, (m.orders / maxO) * 100)}%`, background: 'linear-gradient(180deg,#134e4a 0%,#2dd4bf 100%)' }}
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
/*  MAIN — left sidebar + content area                           */
/* ══════════════════════════════════════════════════════════════ */
type Tab = 'orders' | 'products' | 'banners' | 'categories' | 'offers' | 'analytics' | 'invoice';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'banners', label: 'Banners', icon: ImagePlus },
  { id: 'categories', label: 'Categories', icon: LayoutGrid },
  { id: 'offers', label: 'Offers', icon: Tag },
  { id: 'invoice', label: 'Invoice', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
];

export function AdminOrderDashboard() {
  const [authenticated, setAuthenticated] = useState(isAdminLoggedIn());
  const [tab, setTab] = useState<Tab>('orders');
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (!authenticated) return;
    const upd = async () => {
      try {
        const orders = await fetchAdminOrders();
        setPending(orders.filter((o) => o.status === 'pending').length);
      } catch {
        setPending(getOrders().filter((o) => o.status === 'pending').length);
      }
    };
    upd();
    const interval = setInterval(upd, 30000);
    return () => clearInterval(interval);
  }, [authenticated]);

  useEffect(() => {
    import('../utils/storefront').then(({ syncStorefrontCatalog }) => {
      syncStorefrontCatalog().catch(() => {});
    });
  }, []);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen bg-[#F5F5F7] flex ${SF}`}>
      {/* Left sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-black/[0.06] bg-white fixed left-0 top-0 h-full z-30">
        <div className="px-4 py-5 border-b border-black/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1D1D1F] flex items-center justify-center">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-[#1D1D1F]">Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
                ${tab === id ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {id === 'orders' && pending > 0 && (
                <span className="ml-auto min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pending > 9 ? '9+' : pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-black/[0.06] space-y-1">
          <button
            type="button"
            onClick={() => { clearAdminToken(); setAuthenticated(false); toast.info('Logged out'); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#6E6E73] hover:bg-[#F5F5F7] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#134e4a] hover:bg-teal-50 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            View Store
          </Link>
        </div>
      </aside>

      {/* Mobile top tabs */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-black/[0.06] overflow-x-auto">
        <div className="flex gap-1 p-2 min-w-max">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap
                ${tab === id ? 'bg-[#F5F5F7] text-[#1D1D1F]' : 'text-[#6E6E73]'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 md:ml-56 min-w-0">
        <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 md:py-8 pt-16 md:pt-8">
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
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'offers' && <SpecialOffersTab />}
          {tab === 'invoice' && <InvoiceSettingsTab />}
          {tab === 'analytics' && <AnalyticsTab />}
        </main>
      </div>
    </div>
  );
}
