import { useSearchParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { searchProducts } from '../data/products';
import { addToCart } from '../utils/storage';
import { toast } from 'sonner';
import { useContentSync } from '../hooks/useContentSync';
import { ProductCard } from './ProductCard';

export function SearchResults() {
  const contentTick = useContentSync();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const results = useMemo(
    () => (query ? searchProducts(query) : []),
    [contentTick, query]
  );

  const handleAddToCart = (productId: string, productName: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    addToCart(productId, 1);
    toast.success(`${productName} added to cart!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">Search for products</h1>
          <p className="text-slate-600 mb-6">Type a product name in the search bar above and press search.</p>
          <Link to="/" className="btn-primary px-6 py-2.5">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8">
        <div className="mb-5 md:mb-8 search-item-enter">
          <p className="text-xs sm:text-sm text-slate-500 mb-1">Showing results for</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 break-words">
            &ldquo;{query}&rdquo;
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            {results.length} {results.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 md:py-16 bg-white rounded-xl border border-slate-200 search-item-enter">
            <SearchIcon className="w-16 h-16 md:w-20 md:h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold mb-2">No products found</h2>
            <p className="text-base text-gray-600 mb-6 px-4">
              Try different keywords like product name, category, or brand.
            </p>
            <Link to="/" className="btn-primary px-6 py-2.5">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {results.map((product, index) => (
              <div
                key={product.id}
                className="search-result-card"
                style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
