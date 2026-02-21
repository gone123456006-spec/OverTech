import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { products } from '../data/products';
import { addToCart } from '../utils/storage';
import { toast } from 'sonner';

const categoryNames = {
  clothes: 'Clothes',
  jewellery: 'Jewellery',
  food: 'Food'
};

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const categoryProducts = products.filter(p => p.category === category);

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(productId, 1);
    toast.success(`${productName} added to cart!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 mb-4 md:mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="text-gray-900">{categoryNames[category as keyof typeof categoryNames]}</span>
        </div>

        {/* Page Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-1 sm:mb-2">
            {categoryNames[category as keyof typeof categoryNames]}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600">
            {categoryProducts.length} products available
          </p>
        </div>

        {/* Product Grid - 3 cards per row on mobile, responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {categoryProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg active:shadow-md transition-all duration-300 overflow-hidden group flex flex-col border border-gray-100 min-w-0"
            >
              <Link to={`/product/${product.id}`} className="block flex-shrink-0 relative">
                <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-gray-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.stock < 10 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-medium bg-amber-500 text-white rounded">
                      Low stock
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-2.5 sm:p-3 md:p-4 flex-1 flex flex-col min-h-0 min-w-0">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-xs sm:text-sm md:text-lg mb-1 sm:mb-2 hover:text-blue-600 transition-colors line-clamp-2 font-medium text-gray-900">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    <span className="text-[11px] sm:text-sm text-gray-700">{product.rating}</span>
                  </div>
                  <span className="text-gray-300">·</span>
                  <span className="text-[10px] sm:text-xs text-gray-500">{product.stock} in stock</span>
                </div>

                <div className="mt-auto pt-1 flex items-center justify-between gap-1 sm:gap-2 min-w-0">
                  <span className="text-sm sm:text-base md:text-xl text-blue-600 font-bold truncate min-w-0">
                    ₹{product.price}
                  </span>
                  <div className="flex gap-1 sm:gap-1.5 shrink-0">
                    <Link
                      to={`/product/${product.id}`}
                      className="min-h-[32px] sm:min-h-[36px] flex items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-sm font-medium border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product.id, product.name)}
                      className="min-h-[32px] sm:min-h-[36px] w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categoryProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
