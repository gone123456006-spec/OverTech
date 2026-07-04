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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/orders', label: 'Orders', icon: Package },
    { path: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
    { path: '/account', label: 'Account', icon: User },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 pointer-events-auto">
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
                  <a
                    key={link.path}
                    href={link.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors relative no-underline font-medium
                      ${isActive(link.path) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
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

            {/* Mobile menu toggle — three lines */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="md:hidden p-3 -m-1 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation text-slate-800"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/45 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Mobile drawer — slides in from left, half screen */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-1/2 min-w-[220px] max-w-[320px] bg-white shadow-2xl border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 shrink-0">
          <span className="text-sm font-semibold text-slate-900">Menu</span>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 -mr-1 rounded-lg hover:bg-slate-100 text-slate-700"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors relative no-underline font-medium
                  ${isActive(link.path) ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'}`}
              >
                <Icon className="w-6 h-6 shrink-0" />
                <span className="text-base">{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-sm rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center">
                    {link.badge > 9 ? '9+' : link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>
      </aside>
    </>
  );
}
