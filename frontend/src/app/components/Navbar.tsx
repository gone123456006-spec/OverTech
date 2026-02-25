import { useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCartCount } from '../utils/storage';

export function Navbar() {
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => setCartCount(getCartCount());
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/orders', label: 'Orders', icon: Package },
    { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { path: '/account', label: 'Account', icon: User }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-yellow-400 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <a href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity no-underline group">
            <img
              key="/assets/images/Logoo1.png"
              src="/assets/images/Logoo1.png"
              alt="Hover Technology"
              className="h-6 sm:h-8 md:h-10 w-auto object-contain"
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.path} href={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative no-underline font-medium
                    ${isActive(link.path) ? 'bg-yellow-100 text-yellow-700' : 'text-slate-700 hover:bg-yellow-50 hover:text-yellow-600'}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-3 -m-1 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation text-slate-800"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.path} href={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative no-underline font-medium
                    ${isActive(link.path) ? 'bg-yellow-100 text-yellow-700' : 'text-slate-700 hover:bg-yellow-50 hover:text-yellow-600'}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-base">{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
                      {link.badge > 9 ? '9+' : link.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
