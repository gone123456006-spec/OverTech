import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductsByCategory } from '../data/products';
import { addToCart, getCategoryPageBanner } from '../utils/storage';
import { toast } from 'sonner';
import { ProductCard } from './ProductCard';
import { getCategoryLabel } from '../utils/categoryCards';
import { useContentSync } from '../hooks/useContentSync';

export function CategoryPage() {
  const contentTick = useContentSync();
  const { category } = useParams<{ category: string }>();
  const categorySlug = category || '';
  const categoryProducts = useMemo(
    () => getProductsByCategory(categorySlug),
    [contentTick, categorySlug]
  );
  const categoryName = useMemo(
    () => getCategoryLabel(categorySlug),
    [contentTick, categorySlug]
  );
  const categoryBanner = useMemo(
    () => getCategoryPageBanner(categorySlug),
    [contentTick, categorySlug]
  );

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(productId, 1);
    toast.success(`${productName} added to cart!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8">
        <div className="flex items-center gap-2 text-sm md:text-base text-slate-500 mb-4 md:mb-6">
          <Link to="/" className="hover:text-teal-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800">{categoryName}</span>
        </div>

        <div className="mb-4 sm:mb-6 md:mb-8">
          {categoryBanner && (
            <div className="mb-4 sm:mb-6 rounded-xl overflow-hidden shadow-md">
              <img src={categoryBanner} alt={`${categoryName} banner`} className="w-full max-h-48 object-cover" />
            </div>
          )}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 mb-1">
            {categoryName}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            {categoryProducts.length} products available
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {categoryProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              showCategory={false}
            />
          ))}
        </div>

        {categoryProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-slate-600">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
