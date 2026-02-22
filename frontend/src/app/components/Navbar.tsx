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
    <nav className="sticky top-0 z-50 bg-[#0B1F4D] shadow-md pointer-events-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/assets/images/header-logo.png" alt="OverTech" className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.path} href={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative no-underline
                    ${isActive(link.path) ? 'bg-white/15 text-blue-200' : 'text-white/85 hover:bg-white/10 hover:text-white'}`}
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
            className="md:hidden p-3 -m-1 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B1F4D]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.path} href={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative no-underline
                    ${isActive(link.path) ? 'bg-white/15 text-blue-200' : 'text-white/85 hover:bg-white/10'}`}
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
