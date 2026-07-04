import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '../data/products';
import { getCategoryLabel } from '../utils/categoryCards';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, productName: string, e?: React.MouseEvent) => void;
  showCategory?: boolean;
}

export function ProductCard({ product, onAddToCart, showCategory = true }: ProductCardProps) {
  return (
    <article className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
      <Link
        to={`/product/${product.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-50"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {product.rating > 4.5 && (
          <span className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm backdrop-blur-sm">
            Popular
          </span>
        )}
        {product.stock < 10 && (
          <span className="absolute top-2.5 right-2.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            Low stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {showCategory && (
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {getCategoryLabel(product.category)}
            </span>
            <div className="flex items-center gap-0.5 text-slate-500">
              <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
              <span className="text-xs tabular-nums">{product.rating}</span>
            </div>
          </div>
        )}

        {!showCategory && (
          <div className="mb-1.5 flex items-center gap-1 text-slate-500">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
            <span className="text-xs tabular-nums">{product.rating}</span>
            <span className="text-slate-300">·</span>
            <span className="text-[10px] text-slate-400">{product.stock} left</span>
          </div>
        )}

        <Link to={`/product/${product.id}`} className="mb-3 block flex-1">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-slate-800 transition-colors group-hover:text-teal-900 sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-base font-semibold tabular-nums text-slate-900 sm:text-lg">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product.id, product.name, e);
            }}
            className="btn-primary-sm shrink-0 px-2.5 py-1.5 sm:px-3 sm:py-2"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2.25} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}
