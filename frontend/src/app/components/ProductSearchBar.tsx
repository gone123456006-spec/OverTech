import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { searchProducts, getAllProducts } from '../data/products';
import { useContentSync } from '../hooks/useContentSync';

const SUGGESTION_LIMIT = 6;
const MIN_CHARS = 2;
const TYPEWRITER_PRODUCT_COUNT = 6;

function useTypewriterProducts(productNames: string[], active: boolean) {
  const [typedText, setTypedText] = useState('');
  const [nameIndex, setNameIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!active || productNames.length === 0) {
      setTypedText('');
      setIsDeleting(false);
      setNameIndex(0);
      return;
    }

    const current = productNames[nameIndex % productNames.length];

    if (!isDeleting && typedText === current) {
      const pause = window.setTimeout(() => setIsDeleting(true), 700);
      return () => window.clearTimeout(pause);
    }

    if (isDeleting && typedText === '') {
      const next = window.setTimeout(() => {
        setIsDeleting(false);
        setNameIndex((i) => (i + 1) % productNames.length);
      }, 180);
      return () => window.clearTimeout(next);
    }

    const delay = isDeleting ? 18 : 38;
    const timer = window.setTimeout(() => {
      if (isDeleting) {
        setTypedText(current.slice(0, typedText.length - 1));
      } else {
        setTypedText(current.slice(0, typedText.length + 1));
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [active, isDeleting, nameIndex, productNames, typedText]);

  return typedText;
}

function SearchLoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5 py-8">
      <span className="search-dot h-2 w-2 rounded-full bg-teal-700" />
      <span className="search-dot h-2 w-2 rounded-full bg-teal-700" />
      <span className="search-dot h-2 w-2 rounded-full bg-teal-700" />
    </div>
  );
}

export function ProductSearchBar() {
  const contentTick = useContentSync();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 200);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery.length >= MIN_CHARS && trimmedQuery !== debouncedQuery;

  const productNames = useMemo(() => {
    const names = getAllProducts()
      .map((p) => p.name)
      .filter(Boolean)
      .slice(0, TYPEWRITER_PRODUCT_COUNT);
    return names.length > 0
      ? names
      : [
          'High-Performance Laptop',
          'Wireless Headphones',
          'Gold Necklace',
          'Diamond Earrings',
          'Organic Basmati Rice',
          'Fresh Vegetables Box',
        ];
  }, [contentTick]);

  const showTypewriter = !trimmedQuery && !isFocused;
  const typedProduct = useTypewriterProducts(productNames, showTypewriter);

  const suggestions = useMemo(() => {
    if (debouncedQuery.length < MIN_CHARS) return [];
    return searchProducts(debouncedQuery).slice(0, SUGGESTION_LIMIT);
  }, [contentTick, debouncedQuery]);

  const showDropdown = isFocused && trimmedQuery.length >= MIN_CHARS;

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const goToSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsFocused(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClear = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setIsFocused(false);
    if (location.pathname === '/search') {
      navigate('/');
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    goToSearch(searchQuery);
  };

  return (
    <div className="sticky top-14 sm:top-16 z-40 bg-slate-50/95 backdrop-blur-sm py-3 px-3 sm:py-3.5 sm:px-4">
      <div ref={rootRef} className="max-w-xl mx-auto relative">
        <form onSubmit={handleSearch} role="search">
          <div
            className={`relative flex items-center bg-white border rounded-lg overflow-hidden shadow-sm transition-all duration-200 ${
              isFocused ? 'border-teal-700 ring-2 ring-teal-700/15' : 'border-slate-200'
            } ${isSearching ? 'ring-2 ring-lime-300/40' : ''}`}
          >
            {trimmedQuery ? (
              <button
                type="button"
                onClick={handleClear}
                className="ml-1.5 flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors touch-manipulation"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={2.25} />
              </button>
            ) : null}
            <div className="relative flex-1 min-w-0">
              <input
                type="search"
                inputMode="search"
                autoComplete="off"
                enterKeyHint="search"
                placeholder={showTypewriter ? '' : 'Search for products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                className={`w-full py-2.5 sm:py-3 bg-transparent text-gray-900 placeholder-gray-500 text-sm sm:text-base outline-none border-0 focus:ring-0 ${
                  trimmedQuery ? 'pl-1 pr-2 sm:pl-2' : 'px-3 sm:px-4'
                }`}
                aria-label="Search for products"
                aria-expanded={showDropdown}
                aria-controls="search-suggestions"
                aria-autocomplete="list"
              />
              {showTypewriter && (
                <span
                  className="pointer-events-none absolute inset-y-0 left-3 sm:left-4 right-2 flex items-center text-sm sm:text-base text-gray-500 truncate"
                  aria-hidden
                >
                  <span>Search&nbsp;</span>
                  <span className="truncate text-slate-700 font-medium">&ldquo;{typedProduct}</span>
                  <span className="search-type-cursor text-teal-800 ml-px">|</span>
                  <span>&rdquo;</span>
                </span>
              )}
            </div>
            <button
              type="submit"
              className="m-1 flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full btn-icon touch-manipulation"
              aria-label="Search"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 search-icon-spin" />
              ) : (
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </form>

        {showDropdown && (
          <div
            id="search-suggestions"
            role="listbox"
            className="search-dropdown-enter absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            {isSearching ? (
              <div className="px-4 py-2 text-center">
                <p className="text-xs text-slate-500 mb-1">Searching products...</p>
                <SearchLoadingDots />
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500 search-item-enter">
                No products found for &ldquo;{debouncedQuery}&rdquo;
              </div>
            ) : (
              <>
                <div className="max-h-[min(420px,60vh)] overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((product, index) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      role="option"
                      onClick={() => setIsFocused(false)}
                      className="search-item-enter flex gap-2.5 rounded-lg border border-slate-100 bg-white p-2 transition-colors hover:border-teal-200 hover:bg-teal-50/40 hover:shadow-sm"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-md object-cover bg-slate-100"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                          {product.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-teal-900 tabular-nums">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">
                          {product.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => goToSearch(debouncedQuery)}
                  className="search-item-enter flex w-full items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-teal-900 transition-colors hover:bg-teal-50"
                  style={{ animationDelay: `${suggestions.length * 60}ms` }}
                >
                  <span>
                    View all results for &ldquo;{debouncedQuery}&rdquo;
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
