import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { getProductById } from '../data/products';
import { addToCart } from '../utils/storage';
import { toast } from 'sonner';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = getProductById(id!);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <Link to="/" className="text-blue-700 hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity);
    toast.success(`${quantity} x ${product.name} added to cart!`);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleBuyNow = () => {
    addToCart(product.id, quantity);
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/cart');
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm md:text-base text-gray-600 mb-4 md:mb-6 overflow-x-auto">
          <Link to="/" className="hover:text-blue-700 whitespace-nowrap">Home</Link>
          <span>/</span>
          <Link to={`/category/${product.category}`} className="hover:text-blue-700 capitalize whitespace-nowrap">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-full md:rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8">
            {/* Product Image */}
            <div className="relative h-64 md:h-96 lg:h-full bg-gray-100 rounded-full md:rounded-full overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl lg:text-4xl mb-3 md:mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="flex items-center gap-2 text-yellow-500">
                  <Star className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                  <span className="text-lg md:text-2xl text-gray-700">{product.rating}</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className={`text-sm md:text-lg ${product.stock > 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="text-2xl md:text-3xl lg:text-4xl text-blue-700 font-bold mb-4 md:mb-6">
                ₹{product.price}
              </div>

              <div className="mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl mb-2">Description</h3>
                <p className="text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl mb-3">Quantity</h3>
                <div className="flex items-center gap-3 md:gap-4">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <span className="text-xl md:text-2xl w-10 md:w-12 text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 px-4 md:px-6 py-3 md:py-4 border-2 border-blue-700 text-blue-700 rounded-full md:rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 px-4 md:px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full md:rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
