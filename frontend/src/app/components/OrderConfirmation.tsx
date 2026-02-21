import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, Home } from 'lucide-react';
import { getOrderById } from '../utils/storage';
import { getProductById } from '../data/products';
import type { Order } from '../utils/storage';

export function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrderById(orderId);
      setOrder(foundOrder || null);
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      const t = setTimeout(() => setShowDone(true), 100);
      return () => clearTimeout(t);
    }
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-yellow-50/40 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Order not found</h2>
          <Link to="/" className="text-green-600 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const estimatedDelivery = '15 - 30 minutes';

  return (
    <div className="min-h-screen bg-yellow-50/40">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        {/* Success Animation - It's Done! */}
        <div
          className={`text-center mb-6 md:mb-8 transition-all duration-700 ease-out ${
            showDone ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="inline-block relative">
            <div className="relative order-done-check">
              <CheckCircle className="w-20 h-20 md:w-28 md:h-28 text-green-500" />
            </div>
          </div>
          <div
            className={`mt-4 mb-2 transition-all duration-500 delay-300 ${
              showDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-3">
              It&apos;s Done!
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl mt-2 mb-2">Order Placed Successfully</h1>
          </div>
          <p
            className={`text-base md:text-lg lg:text-xl text-gray-600 px-4 transition-all duration-500 delay-500 ${
              showDone ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Thank you for your order. We&apos;ll send you a confirmation message shortly.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl mb-3 md:mb-4">Order Information</h2>
              <div className="space-y-2 md:space-y-3">
                <div>
                  <p className="text-sm md:text-base text-gray-600">Order ID</p>
                  <p className="text-base md:text-lg">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm md:text-base text-gray-600">Order Date</p>
                  <p className="text-sm md:text-lg">
                    {new Date(order.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm md:text-base text-gray-600">Estimated Delivery</p>
                  <p className="text-sm md:text-lg text-green-600">{estimatedDelivery}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl mb-3 md:mb-4">Payment & Delivery</h2>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-start gap-2 md:gap-3">
                  <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm md:text-base text-gray-600">Payment Method</p>
                    <p className="text-sm md:text-lg">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Google Pay (UPI)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 md:gap-3">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm md:text-base text-gray-600">Delivery Address</p>
                    <p className="text-sm md:text-lg">{order.address.name}</p>
                    <p className="text-xs md:text-base text-gray-600">{order.address.mobile}</p>
                    <p className="text-xs md:text-base text-gray-600">{order.address.house}</p>
                    <p className="text-xs md:text-base text-gray-600">
                      {order.address.city}, {order.address.state} - {order.address.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-4 md:pt-6">
            <h2 className="text-xl md:text-2xl mb-3 md:mb-4">Order Items</h2>
            <div className="space-y-3 md:space-y-4">
              {order.items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;

                return (
                  <div key={item.productId} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg mb-1 truncate">{product.name}</h3>
                      <p className="text-sm md:text-base text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base md:text-lg">₹{product.price * item.quantity}</p>
                      <p className="text-xs md:text-sm text-gray-600">₹{product.price} each</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t mt-4 md:mt-6 pt-4 md:pt-6">
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between text-base md:text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{order.total >= 299 ? order.total : order.total - 39}</span>
              </div>
              <div className="flex justify-between text-base md:text-lg">
                <span className="text-gray-600">Delivery:</span>
                <span className={order.total >= 299 ? 'text-green-600' : ''}>
                  {order.total >= 299 ? 'FREE' : '₹39'}
                </span>
              </div>
              <div className="flex justify-between text-xl md:text-2xl border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600 font-bold">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Notification Message */}
        <div className="bg-yellow-50 border-2 border-green-200 rounded-lg md:rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl md:text-2xl">📱</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base md:text-xl mb-2">SMS Confirmation Sent</h3>
              <p className="text-sm md:text-base text-gray-700">
                We've sent a confirmation message to <span className="font-medium">{order.address.mobile}</span>
              </p>
              <div className="mt-2 md:mt-3 p-2 md:p-3 bg-white rounded-lg border border-green-200">
                <p className="text-xs md:text-sm text-gray-700">
                  "Your order #{order.id} has been confirmed. Thank you for shopping with us!"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <Link
            to="/orders"
            className="flex-1 px-4 md:px-6 py-3 md:py-4 bg-green-600 text-yellow-100 rounded-lg md:rounded-xl hover:bg-green-500 transition-colors text-base md:text-lg text-center flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4 md:w-5 md:h-5" />
            View All Orders
          </Link>
          <Link
            to="/"
            className="flex-1 px-4 md:px-6 py-3 md:py-4 border-2 border-green-600 text-green-600 rounded-lg md:rounded-xl hover:bg-green-50 transition-colors text-base md:text-lg text-center flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 md:w-5 md:h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
