import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, MapPin, CreditCard, Package, ChevronLeft, Loader2 } from 'lucide-react';
import { getCart, getAddresses, saveAddress, clearCart, saveOrderFromServer } from '../utils/storage';
import { placeOrderOnServer } from '../utils/ordersApi';
import { getProductById } from '../data/products';
import type { Address, CartItem } from '../utils/storage';
import { toast } from 'sonner';
import { apiPost } from '../utils/api';

type CheckoutStep = 'address' | 'review' | 'payment';

export function Checkout() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCart());
  const orderPlacedRef = useRef(false);
  const razorpayOrderIdRef = useRef<string | null>(null);

  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    house: '',
    city: '',
    state: '',
    pincode: ''
  });

  useEffect(() => {
    const syncCart = () => setCartItems(getCart());
    syncCart();
    window.addEventListener('cartUpdated', syncCart);
    return () => window.removeEventListener('cartUpdated', syncCart);
  }, []);

  useEffect(() => {
    if (orderPlacedRef.current) return;
    if (cartItems.length === 0) {
      navigate('/cart', { replace: true });
      return;
    }
    loadAddresses();
  }, [cartItems.length, navigate]);

  const loadAddresses = () => {
    const savedAddresses = getAddresses();
    setAddresses(savedAddresses);
    if (savedAddresses.length > 0 && !selectedAddress) {
      setSelectedAddress(savedAddresses[0]);
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const product = getProductById(item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
    const deliveryCharge = 0;
    return { subtotal, deliveryCharge, total: subtotal + deliveryCharge };
  };

  const { subtotal, deliveryCharge, total } = calculateTotal();

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.mobile || !newAddress.house ||
      !newAddress.city || !newAddress.state || !newAddress.pincode) {
      toast.error('Please fill all address fields');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(newAddress.mobile)) {
      toast.error('Enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!/^\d{6}$/.test(newAddress.pincode)) {
      toast.error('Enter a valid 6-digit pincode');
      return;
    }

    const savedAddr = saveAddress(newAddress);
    setSelectedAddress(savedAddr);
    loadAddresses();
    setShowAddressForm(false);
    setNewAddress({
      name: '',
      mobile: '',
      house: '',
      city: '',
      state: '',
      pincode: ''
    });
    toast.success('Address added successfully');
  };

  const handlePlaceOrder = async (
    paymentStatusOverride?: 'pending' | 'paid',
    methodOverride?: 'cod' | 'razorpay'
  ) => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    const method = methodOverride || paymentMethod;

    if (!method) {
      toast.error('Please select a payment method');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart', { replace: true });
      return;
    }

    setIsProcessing(true);
    orderPlacedRef.current = true;

    const draftOrderId = `ORD${Date.now().toString().slice(-8)}`;

    try {
      const serverOrder = await placeOrderOnServer({
        orderId: draftOrderId,
        items: cartItems,
        address: {
          name: selectedAddress.name,
          mobile: selectedAddress.mobile,
          house: selectedAddress.house,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
        },
        paymentMethod: method,
        total,
        ...(method === 'razorpay' && razorpayOrderIdRef.current
          ? { razorpayOrderId: razorpayOrderIdRef.current }
          : {}),
      });

      saveOrderFromServer({
        ...serverOrder,
        paymentStatus:
          paymentStatusOverride ||
          serverOrder.paymentStatus ||
          (method === 'razorpay' ? 'paid' : 'pending'),
        paymentMethod: method,
        refundStatus: 'not_required',
        deliveryAgentName: 'Rider Team',
        deliveryAgentPhone: '+91 90000 00000',
      });

      clearCart();
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/', {
        replace: true,
        state: {
          orderConfirmed: {
            orderId: serverOrder.id,
            contactMobile: selectedAddress.mobile,
          },
        },
      });
    } catch (err: unknown) {
      orderPlacedRef.current = false;
      const msg = err instanceof Error ? err.message : 'Could not place order. Please try again.';
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  /**
   * Handle Razorpay payment flow:
   * 1. Create order on backend → get orderId
   * 2. Open Razorpay SDK popup
   * 3. On success → verify signature on backend
   * 4. On success → place order locally
   */
  const handleRazorpayPayment = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(selectedAddress.mobile)) {
      toast.error('Please enter a valid 10-digit Indian mobile number in your address');
      return;
    }

    setPaymentMethod('razorpay');
    setIsProcessing(true);
    try {
      const orderData = await apiPost<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>('/api/payment/create-order', {
        amount: total,
        currency: 'INR',
        cartSnapshot: cartItems,
        customerMobile: selectedAddress.mobile,
        customerName: selectedAddress.name,
        customerAddress: {
          house: selectedAddress.house,
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode
        }
      });

      razorpayOrderIdRef.current = orderData.orderId;

      // Step 2: Open Razorpay SDK popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'OverTech',
        description: `Order #${orderData.orderId.slice(-8)}`,
        order_id: orderData.orderId,
        prefill: {
          name: selectedAddress.name,
          contact: selectedAddress.mobile,
        },
        theme: { color: '#134e4a' },
        handler: async (response: any) => {
          try {
            await apiPost('/api/payment/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            // Step 4: Place local order
            handlePlaceOrder('paid', 'razorpay');
          } catch (err: any) {
            orderPlacedRef.current = false;
            toast.error(err.message || 'Payment verification failed');
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
            setIsProcessing(false);
          }
        }
      };

      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        orderPlacedRef.current = false;
        toast.error(response.error?.description || 'Payment failed. Please try again.');
        setIsProcessing(false);
      });
      rzp.open();
      setIsProcessing(false);
    } catch (error: any) {
      orderPlacedRef.current = false;
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const canProceedToReview = selectedAddress !== null;
  const canProceedToPayment = selectedAddress !== null;
  const canPlaceOrder = selectedAddress !== null && paymentMethod !== null;

  const steps = [
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'review', label: 'Review', icon: Package },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="flex items-center gap-3 mb-4 md:mb-8 relative z-[60] isolate">
          <a
            href="/cart"
            className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-1 rounded-full text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation cursor-pointer"
            aria-label="Go back to cart"
          >
            <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
          </a>
          <h1 className="text-2xl md:text-4xl flex-1">Checkout</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8 md:mb-12 overflow-x-auto px-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted =
              (step.id === 'address' && (currentStep === 'review' || currentStep === 'payment')) ||
              (step.id === 'review' && currentStep === 'payment');

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-teal-900 border-teal-600 text-white' :
                    isActive ? 'bg-teal-900 border-teal-900 text-white' :
                      'bg-white border-gray-300 text-gray-400'
                    }`}>
                    {isCompleted ? <Check className="w-5 h-5 md:w-8 md:h-8" /> : <Icon className="w-5 h-5 md:w-8 md:h-8" />}
                  </div>
                  <span className={`mt-1 md:mt-2 text-xs md:text-lg whitespace-nowrap ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 md:w-32 h-1 mx-2 md:mx-4 ${isCompleted ? 'bg-teal-900' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Address Step */}
            {currentStep === 'address' && (
              <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-6">
                <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Select Delivery Address</h2>

                {addresses.length > 0 && (
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        onClick={() => setSelectedAddress(address)}
                        className={`p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-colors ${selectedAddress?.id === address.id
                          ? 'border-teal-900 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-base md:text-lg mb-1 truncate">{address.name}</p>
                            <p className="text-sm md:text-base text-gray-600">{address.mobile}</p>
                            <p className="text-sm md:text-base text-gray-600">{address.house}</p>
                            <p className="text-sm md:text-base text-gray-600">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                          {selectedAddress?.id === address.id && (
                            <Check className="w-5 h-5 md:w-6 md:h-6 text-teal-900 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="btn-outline w-full py-2.5 md:py-3 text-sm md:text-base"
                  >
                    + Add New Address
                  </button>
                ) : (
                  <div className="border-2 border-gray-200 rounded-lg p-4 md:p-6">
                    <h3 className="text-lg md:text-xl mb-3 md:mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newAddress.name}
                        onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                        className="px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="tel"
                        placeholder="Mobile Number"
                        value={newAddress.mobile}
                        inputMode="numeric"
                        maxLength={10}
                        onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="House / Street"
                        value={newAddress.house}
                        onChange={(e) => setNewAddress({ ...newAddress, house: e.target.value })}
                        className="md:col-span-2 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <input
                        type="tel"
                        placeholder="Pincode (6 digits)"
                        value={newAddress.pincode}
                        inputMode="numeric"
                        maxLength={6}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className="px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-3 md:mt-4">
                      <button
                        onClick={handleAddAddress}
                        className="btn-primary flex-1 py-2.5 md:py-3 text-sm md:text-base"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="flex-1 px-4 md:px-6 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setCurrentStep('review')}
                  disabled={!canProceedToReview}
                  className="btn-primary w-full mt-4 md:mt-6 py-3 md:py-4 text-base md:text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue to Review
                </button>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 'review' && (
              <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-6">
                <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Review Your Order</h2>

                {/* Delivery Address */}
                {selectedAddress && (
                  <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-base md:text-lg mb-2">Delivery Address</h3>
                    <p className="text-sm md:text-base mb-1">{selectedAddress.name}</p>
                    <p className="text-xs md:text-base text-gray-600">{selectedAddress.mobile}</p>
                    <p className="text-xs md:text-base text-gray-600">{selectedAddress.house}</p>
                    <p className="text-xs md:text-base text-gray-600">
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                    <button
                      onClick={() => setCurrentStep('address')}
                      className="mt-2 text-teal-900 hover:underline"
                    >
                      Change Address
                    </button>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg">Order Items</h3>
                  {cartItems.map((item) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;

                    return (
                      <div key={item.productId} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-lg">{product.name}</h4>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-teal-900">₹{product.price} x {item.quantity}</p>
                        </div>
                        <div className="text-lg">
                          ₹{product.price * item.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentStep('payment')}
                  disabled={!canProceedToPayment}
                  className="btn-primary w-full py-3 md:py-4 text-base md:text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-6">
                <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Select Payment Method</h2>

                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 md:p-6 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod'
                      ? 'border-teal-900 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xl md:text-2xl">💵</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base md:text-xl truncate">Cash on Delivery</h3>
                          <p className="text-xs md:text-base text-gray-600">Pay when you receive your order</p>
                        </div>
                      </div>
                      {paymentMethod === 'cod' && (
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-teal-900 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-4 md:p-6 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'razorpay'
                      ? 'border-teal-900 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xl md:text-2xl">💳</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base md:text-xl truncate">Razorpay</h3>
                          <p className="text-xs md:text-base text-gray-600">UPI, Cards, Net Banking &amp; Wallets</p>
                        </div>
                      </div>
                      {paymentMethod === 'razorpay' && (
                        <Check className="w-5 h-5 md:w-6 md:h-6 text-teal-900 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
                {paymentMethod === 'razorpay' && (
                  <button
                    onClick={handleRazorpayPayment}
                    disabled={isProcessing}
                    className="btn-primary w-full py-3 md:py-4 text-base md:text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{total} with Razorpay</span>
                      </>
                    )}
                  </button>
                )}

                {paymentMethod === 'cod' && (
                  <button
                    onClick={() => void handlePlaceOrder('pending')}
                    disabled={!canPlaceOrder || isProcessing}
                    className="btn-primary w-full py-3 md:py-4 text-base md:text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 md:w-6 md:h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Order</span>
                        <span>₹{total}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-4 md:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Order Summary</h2>

              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Items ({cartItems.length}):</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between text-sm md:text-base">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="text-teal-900">₹0</span>
                </div>

                <div className="border-t pt-3 md:pt-4">
                  <div className="flex justify-between text-xl md:text-2xl">
                    <span>Total:</span>
                    <span className="text-teal-900">₹{total}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs md:text-sm text-gray-600">
                <p>✓ Secure checkout</p>
                <p>✓ Easy returns within 7 days</p>
                <p>✓ Quality guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
