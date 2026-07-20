import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem, ProductWithInventory } from '../lib/types';

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  const product = item.product as ProductWithInventory;
  const isOutOfStock = product?.inventory?.quantity === 0;
  const maxQuantity = product?.inventory?.quantity || 10;

  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100">
      <Link
        to={`/product/${item.product_id}`}
        className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0"
      >
        {product?.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-xs">No image</span>
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${item.product_id}`}>
          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
            {product?.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">
          {product?.color} | {product?.size}
        </p>
        {isOutOfStock && (
          <span className="text-xs text-red-500 mt-1 block">Out of stock</span>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-gray-900">
            ${(product?.price || 0).toFixed(2)}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-6 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={item.quantity >= maxQuantity}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center
                hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
