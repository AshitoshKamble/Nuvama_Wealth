import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import type { ProductWithInventory } from '../lib/types';
import { useState } from 'react';

interface ProductCardProps {
  product: ProductWithInventory;
  showAddToCart?: boolean;
  onAddToCart?: () => void;
}

export function ProductCard({ product, showAddToCart, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;
  const isLowStock = product.inventory ? product.inventory.quantity <= product.inventory.low_stock_threshold : true;
  const isOutOfStock = product.inventory ? product.inventory.quantity === 0 : true;

  return (
    <Link
      to={`/product/${product.id}`}
      className="block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group"
    >
      <div className="relative aspect-[3/4] bg-gray-50">
        {!imageError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-gray-300" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">Out of Stock</span>
          </div>
        )}
        {!isOutOfStock && isLowStock && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded">
            Low Stock
          </span>
        )}
        <button
          className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm
            opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart?.();
          }}
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {product.color} | Size {product.size}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-gray-900 text-sm">
            ${product.price}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              ${product.original_price}
            </span>
          )}
        </div>
        {showAddToCart && !isOutOfStock && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.();
            }}
            className="w-full mt-2 py-2 text-sm font-medium text-primary-500 bg-primary-50
              rounded-lg hover:bg-primary-100 transition-colors"
          >
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
}
