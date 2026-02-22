import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { CategoryPage } from './components/CategoryPage';
import { ProductDetails } from './components/ProductDetails';
import { SearchResults } from './components/SearchResults';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderConfirmation } from './components/OrderConfirmation';
import { Account } from './components/Account';
import { AdminOrderDashboard } from './components/AdminOrderDashboard';
import { CustomerOrders } from './components/CustomerOrders';

import { AuthProvider } from './context/AuthContext';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';

function AppRoutes() {
  const location = useLocation();
  const isAdminPanel = location.pathname.startsWith('/admin-dashboard');

  return (
    <div className={`min-h-screen relative ${isAdminPanel ? 'bg-slate-100' : 'bg-slate-50 pb-16 md:pb-0'}`}>
      {!isAdminPanel && <Navbar />}
      <main className="relative z-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/orders" element={<CustomerOrders />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin-dashboard" element={<AdminOrderDashboard />} />
        </Routes>
      </main>
      <Toaster position="top-center" richColors />
      {!isAdminPanel && location.pathname === '/' && <Footer />}
      {!isAdminPanel && <MobileBottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
