import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Download, Package, Search, Bell, ChevronRight } from 'lucide-react';
import { getProductById } from '../data/products';
import { cancelOrder, getOrders, updateOrderStatus } from '../utils/storage';
import type { Order } from '../utils/storage';
import { toast } from 'sonner';

const statusLabelMap: Record<Order['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

function isToday(dateIso: string) {
  const d = new Date(dateIso);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function fmtDate(dateIso?: string) {
  if (!dateIso) return '-';
  return new Date(dateIso).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function csvEscape(value: string | number) {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

function downloadInvoice(order: Order) {
  const lines = [
    'SHOPZONE INVOICE',
    `Invoice Date: ${fmtDate(new Date().toISOString())}`,
    `Order ID: ${order.id}`,
    `Order Date: ${fmtDate(order.date)}`,
    '',
    `Customer: ${order.address.name}`,
    `Phone: ${order.address.mobile}`,
    `Address: ${order.address.house}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
    '',
    'Items:'
  ];
  order.items.forEach((item) => {
    const product = getProductById(item.productId);
    if (!product) return;
    lines.push(`- ${product.name} | Qty: ${item.quantity} | ₹${product.price * item.quantity}`);
  });
  lines.push('');
  lines.push(`Payment Mode: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Google Pay (UPI)'}`);
  lines.push(`Payment Status: ${order.paymentStatus}`);
  lines.push(`Total Amount: ₹${order.total}`);
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invoice-${order.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid' | 'refunded'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all');

  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const load = () => {
      const latest = getOrders();
      prevCountRef.current = latest.length;
      setOrders(latest);
    };
    load();

    const onOrdersUpdated = () => {
      const latest = getOrders();
      const prevCount = prevCountRef.current;
      if (latest.length > prevCount) {
        const added = latest[0]; // Newest first
        toast.success("It's Done! New order placed.", { duration: 4000 });
        setNewOrderId(added?.id || null);
        setTimeout(() => setNewOrderId(null), 3000);
      }
      prevCountRef.current = latest.length;
      setOrders(latest);
    };

    window.addEventListener('ordersUpdated', onOrdersUpdated);
    window.addEventListener('storage', onOrdersUpdated);
    return () => {
      window.removeEventListener('ordersUpdated', onOrdersUpdated);
      window.removeEventListener('storage', onOrdersUpdated);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.address.name.toLowerCase().includes(q);

      const d = new Date(order.date);
      const fromOk = !dateFrom || d >= new Date(`${dateFrom}T00:00:00`);
      const toOk = !dateTo || d <= new Date(`${dateTo}T23:59:59`);

      const paymentOk = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
      const statusOk = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && fromOk && toOk && paymentOk && statusOk;
    });
  }, [orders, searchQuery, dateFrom, dateTo, paymentFilter, statusFilter]);

  const summary = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const acceptedOrders = orders.filter((o) => o.status === 'accepted').length;
    const outForDelivery = orders.filter((o) => o.status === 'out_for_delivery').length;
    const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
    const todaysOrders = orders.filter((o) => isToday(o.date)).length;
    return {
      totalOrders,
      pendingOrders,
      acceptedOrders,
      outForDelivery,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      todaysOrders
    };
  }, [orders]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const result: { label: string; orders: number; revenue: number }[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = dt.toLocaleDateString('en-IN', { month: 'short' });
      const monthOrders = orders.filter((o) => {
        const od = new Date(o.date);
        return od.getMonth() === dt.getMonth() && od.getFullYear() === dt.getFullYear();
      });
      result.push({
        label,
        orders: monthOrders.length,
        revenue: monthOrders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0)
      });
    }
    return result;
  }, [orders]);

  const maxOrdersInMonth = Math.max(...monthlyData.map((m) => m.orders), 1);

  const avgDeliveryMinutes = useMemo(() => {
    const delivered = orders.filter((o) => o.deliveredAt);
    if (!delivered.length) return null;
    const totalMins = delivered.reduce((sum, o) => {
      const start = new Date(o.date).getTime();
      const end = new Date(o.deliveredAt as string).getTime();
      return sum + Math.max(0, (end - start) / 60000);
    }, 0);
    return Math.round(totalMins / delivered.length);
  }, [orders]);

  const exportCsv = () => {
    const header = [
      'Order ID',
      'Customer Name',
      'Phone',
      'Order Date',
      'Status',
      'Payment Mode',
      'Payment Status',
      'Total'
    ];
    const rows = filteredOrders.map((o) => [
      csvEscape(o.id),
      csvEscape(o.address.name),
      csvEscape(o.address.mobile),
      csvEscape(fmtDate(o.date)),
      csvEscape(statusLabelMap[o.status]),
      csvEscape(o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Google Pay (UPI)'),
      csvEscape(o.paymentStatus),
      csvEscape(o.total)
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderOrderRow = (order: Order) => {
    const itemsLabel = order.items
      .map((item) => {
        const p = getProductById(item.productId);
        return p ? `${p.name} x${item.quantity}` : '';
      })
      .filter(Boolean)
      .join(', ');

    return (
      <div key={order.id} className="border rounded-lg p-3 md:p-4 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="font-medium">{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Customer</p>
            <p>{order.address.name}</p>
            <p className="text-xs text-gray-500">{order.address.mobile}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Date & Time</p>
            <p>{fmtDate(order.date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="text-blue-800 font-semibold">₹{order.total}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Payment</p>
            <p>{order.paymentStatus}</p>
          </div>
          <div className="md:text-right">
            <p className="text-xs text-gray-500">Status</p>
            <p>{statusLabelMap[order.status]}</p>
          </div>
        </div>
        <p className="mt-2 text-xs md:text-sm text-gray-600">
          <strong>Items:</strong> {itemsLabel || '-'}
        </p>
        <p className="text-xs md:text-sm text-gray-600">
          <strong>Address:</strong> {order.address.house}, {order.address.city}, {order.address.state} - {order.address.pincode}
        </p>
      </div>
    );
  };

  const pendingOrders = filteredOrders.filter((o) => o.status === 'pending');
  const acceptedOrders = filteredOrders.filter((o) => o.status === 'accepted');
  const outForDeliveryOrders = filteredOrders.filter((o) => o.status === 'out_for_delivery');
  const deliveredOrders = filteredOrders.filter((o) => o.status === 'delivered');
  const cancelledOrders = filteredOrders.filter((o) => o.status === 'cancelled');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-4xl">Order Dashboard</h1>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 shadow"><p className="text-xs text-gray-500">Total Orders</p><p className="text-xl">{summary.totalOrders}</p></div>
          <div className="bg-white rounded-lg p-3 shadow"><p className="text-xs text-gray-500">Pending</p><p className="text-xl text-amber-700">{summary.pendingOrders}</p></div>
          <div className="bg-white rounded-lg p-3 shadow"><p className="text-xs text-gray-500">Accepted</p><p className="text-xl text-blue-700">{summary.acceptedOrders}</p></div>
          <div className="bg-white rounded-lg p-3 shadow"><p className="text-xs text-gray-500">Out for Delivery</p><p className="text-xl text-indigo-700">{summary.outForDelivery}</p></div>
          <div className="bg-white rounded-lg p-3 shadow"><p className="text-xs text-gray-500">Delivered</p><p className="text-xl text-blue-800">{summary.deliveredOrders}</p></div>
          <div className="bg-white rounded-lg p-3 shadow"><p className="text-xs text-gray-500">Cancelled</p><p className="text-xl text-red-700">{summary.cancelledOrders}</p></div>
          <div className="bg-white rounded-lg p-3 shadow"><p className="text-xs text-gray-500">Revenue</p><p className="text-xl text-blue-800">₹{summary.totalRevenue}</p></div>
          <div className="bg-white rounded-lg p-3 shadow"><p className="text-xs text-gray-500">Today's Orders</p><p className="text-xl">{summary.todaysOrders}</p></div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-2xl mb-4 inline-flex items-center gap-2"><Search className="w-5 h-5" /> Filters & Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Search Order ID / Customer Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border rounded-lg" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | 'pending' | 'paid' | 'refunded')}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | Order['status'])}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">All Order Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-2xl mb-4 inline-flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Monthly Orders & Revenue</h2>
          <div className="grid grid-cols-6 gap-3 items-end h-52">
            {monthlyData.map((m) => (
              <div key={m.label} className="text-center">
                <div className="h-40 flex items-end justify-center">
                  <div
                    className="w-8 md:w-12 bg-blue-600 rounded-t"
                    style={{ height: `${Math.max(10, (m.orders / maxOrdersInMonth) * 100)}%` }}
                    title={`${m.orders} orders | ₹${m.revenue}`}
                  />
                </div>
                <p className="text-xs mt-2">{m.label}</p>
                <p className="text-[10px] text-gray-500">{m.orders}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">Bar height = orders count. Hover bar for revenue tooltip.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-semibold mb-1">Delivery Performance</h3>
            <p className="text-sm text-gray-600">Average delivery time</p>
            <p className="text-xl text-indigo-700">{avgDeliveryMinutes !== null ? `${avgDeliveryMinutes} mins` : 'No delivered orders yet'}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-semibold mb-1 inline-flex items-center gap-1"><Bell className="w-4 h-4" /> Real-time Notifications</h3>
            <p className="text-sm text-gray-600">New order alerts are enabled via local event listener.</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-semibold mb-1">Customer Alerts</h3>
            <p className="text-sm text-gray-600">Email/SMS notifications are simulated via in-app toasts.</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-2xl mb-3">🟡 Pending Orders ({pendingOrders.length})</h2>
            {pendingOrders.length === 0 && <p className="text-gray-500">No pending orders.</p>}
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`rounded-lg transition-all duration-500 ${
                    newOrderId === order.id ? 'ring-2 ring-blue-500 bg-blue-50/50 animate-pulse' : ''
                  }`}
                  style={newOrderId === order.id ? { animationDuration: '1.5s' } : undefined}
                >
                  {newOrderId === order.id && (
                    <div className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" /> It&apos;s Done! New order
                    </div>
                  )}
                  {renderOrderRow(order)}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button onClick={() => { updateOrderStatus(order.id, 'accepted'); toast.success('Order accepted'); }} className="px-3 py-1.5 text-sm bg-blue-700 text-white rounded">Accept</button>
                    <button onClick={() => { cancelOrder(order.id, 'Rejected by admin'); toast.info('Order rejected'); }} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-2xl mb-3">🟢 Accepted Orders ({acceptedOrders.length})</h2>
            {acceptedOrders.length === 0 && <p className="text-gray-500">No accepted orders.</p>}
            <div className="space-y-3">
              {acceptedOrders.map((order) => (
                <div key={order.id}>
                  {renderOrderRow(order)}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button onClick={() => { updateOrderStatus(order.id, 'out_for_delivery'); toast.success('Marked out for delivery'); }} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded">Mark as Out for Delivery</button>
                    <button onClick={() => toast.success(`Notification sent to ${order.address.mobile}`)} className="px-3 py-1.5 text-sm border rounded">Notify Customer</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-2xl mb-3">🔵 Out for Delivery ({outForDeliveryOrders.length})</h2>
            {outForDeliveryOrders.length === 0 && <p className="text-gray-500">No orders out for delivery.</p>}
            <div className="space-y-3">
              {outForDeliveryOrders.map((order) => (
                <div key={order.id}>
                  {renderOrderRow(order)}
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Agent:</strong> {order.deliveryAgentName} ({order.deliveryAgentPhone}) | <strong>ETA:</strong> 15 - 30 minutes
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button onClick={() => { updateOrderStatus(order.id, 'delivered'); toast.success('Marked delivered'); }} className="px-3 py-1.5 text-sm bg-[#0B1F4D] text-white rounded">Mark as Delivered</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-2xl mb-3">🟣 Delivered Orders ({deliveredOrders.length})</h2>
            {deliveredOrders.length === 0 && <p className="text-gray-500">No delivered orders.</p>}
            <div className="space-y-3">
              {deliveredOrders.map((order) => (
                <div key={order.id}>
                  {renderOrderRow(order)}
                  <p className="text-sm text-gray-600 mt-2">Delivered Date: {fmtDate(order.deliveredAt || order.date)}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button onClick={() => downloadInvoice(order)} className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded inline-flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Download Invoice
                    </button>
                    <Link to={`/order-confirmation/${order.id}`} className="px-3 py-1.5 text-sm border rounded inline-flex items-center gap-1">
                      View
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-md p-4 md:p-6">
            <h2 className="text-lg md:text-2xl mb-3">🔴 Cancelled Orders ({cancelledOrders.length})</h2>
            {cancelledOrders.length === 0 && <p className="text-gray-500">No cancelled orders.</p>}
            <div className="space-y-3">
              {cancelledOrders.map((order) => (
                <div key={order.id}>
                  {renderOrderRow(order)}
                  <p className="text-sm text-gray-600 mt-2">
                    Cancel Reason: {order.cancellationReason || '-'} | Refund: {order.refundStatus || 'not_required'} | Date: {fmtDate(order.cancelledAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No orders yet. Place first order from checkout.</p>
            <Link to="/" className="inline-block mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg">Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
}
