import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package } from 'lucide-react';
import { getOrders } from '../utils/storage';
import { getProductById } from '../data/products';
import type { Order } from '../utils/storage';

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-blue-100 text-blue-700 border-blue-200',
  out_for_delivery: 'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-blue-50 text-blue-800 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200'
};

const statusLabels: Record<Order['status'], string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = () => setOrders(getOrders());
    loadOrders();
    window.addEventListener('ordersUpdated', loadOrders);
    return () => window.removeEventListener('ordersUpdated', loadOrders);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="w-16 h-16 md:w-24 md:h-24 text-gray-300 mx-auto mb-3 md:mb-4" />
          <h2 className="text-2xl md:text-3xl mb-3 md:mb-4">No orders yet</h2>
          <p className="text-base md:text-lg text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <Link to="/" className="inline-block px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <h1 className="text-2xl md:text-4xl mb-4 md:mb-8">My Orders</h1>

        <div className="space-y-4 md:space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg md:rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 px-4 md:px-6 py-4 border-b">
                <div className="grid grid-cols-2 md:flex md:flex-wrap items-start md:items-center md:justify-between gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Order ID</p>
                    <p className="text-base md:text-xl">#{order.id}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Order Date</p>
                    <p className="text-sm md:text-lg">
                      {new Date(order.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-600">Total Amount</p>
                    <p className="text-base md:text-xl text-blue-700 font-bold">₹{order.total}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs md:text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm border ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  {order.items.map((item) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;

                    return (
                      <div key={item.productId} className="flex gap-3 md:gap-4">
                        <Link to={`/product/${product.id}`}>
                          <img src={product.image} alt={product.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="text-base md:text-xl hover:text-blue-600 transition-colors mb-1 truncate">{product.name}</h3>
                          </Link>
                          <p className="text-sm md:text-base text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm md:text-lg text-blue-600">₹{product.price} x {item.quantity} = ₹{product.price * item.quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg mb-2">Delivery Address</h3>
                  <p className="text-gray-700">{order.address.name}</p>
                  <p className="text-gray-600">{order.address.mobile}</p>
                  <p className="text-gray-600">{order.address.house}</p>
                  <p className="text-gray-600">{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg mb-2">Payment Method</h3>
                  <p className="text-gray-700">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Google Pay (UPI)'}</p>
                </div>

                <Link
                  to={`/order-confirmation/${order.id}`}
                  className="mt-6 flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Order Details
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
