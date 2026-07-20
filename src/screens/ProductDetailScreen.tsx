import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Heart,
  Share2,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Package,
} from 'lucide-react';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { ProductCardSkeleton } from '../components/Skeleton';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { ProductWithInventory, Product } from '../lib/types';

export function ProductDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState<ProductWithInventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select(`*, inventory:inventory(*)`)
      .eq('id', id)
      .maybeSingle();
    if (data) {
      setProduct(data as ProductWithInventory);
      setSelectedSize((data as ProductWithInventory).size);
    }
    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    const result = await addToCart(product.id, quantity);
    setAddingToCart(false);
    if (result.success) {
      showToast('Added to cart!', 'success');
      navigate('/cart');
    } else {
      showToast(result.error || 'Failed to add', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-24">
        <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
          <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">Product not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const hasDiscount =
    product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.original_price! - product.price) / product.original_price!) * 100
      )
    : 0;
  const maxQuantity = product.inventory?.quantity || 10;
  const isOutOfStock = product.inventory?.quantity === 0;
  const isLowStock =
    product.inventory &&
    product.inventory.quantity <= product.inventory.low_stock_threshold &&
    !isOutOfStock;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => showToast('Share feature coming soon!', 'info')}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => showToast('Saved to wishlist!', 'success')}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-gray-50">
        {!imageError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ShoppingBag className="w-24 h-24 text-gray-300" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-medium px-3 py-1 rounded-lg">
            {discountPercent}% OFF
          </span>
        )}
        {isLowStock && (
          <span className="absolute top-4 right-4 bg-amber-500 text-white text-sm font-medium px-3 py-1 rounded-lg">
            Low Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)} Shirt
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
            {hasDiscount && (
              <p className="text-sm text-gray-400 line-through">
                ${product.original_price?.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Color & Fabric */}
        <div className="flex gap-4 mt-4 text-sm">
          {product.color && (
            <div>
              <span className="text-gray-500">Color:</span>
              <span className="ml-2 font-medium">{product.color}</span>
            </div>
          )}
          {product.fabric && (
            <div>
              <span className="text-gray-500">Fabric:</span>
              <span className="ml-2 font-medium">{product.fabric}</span>
            </div>
          )}
        </div>

        {/* Size Selector */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Size</p>
          <div className="flex gap-2">
            {['S', 'M', 'L', 'XL'].map((size) => {
              const isAvailable = size === product.size;
              const isOutOfStockThisSize =
                isAvailable && product.inventory?.quantity === 0;
              return (
                <button
                  key={size}
                  onClick={() => isAvailable && setSelectedSize(size)}
                  disabled={!isAvailable || isOutOfStockThisSize}
                  className={`w-14 h-12 rounded-xl font-medium text-sm transition-all
                    ${
                      selectedSize === size
                        ? 'bg-primary-500 text-white'
                        : isAvailable && !isOutOfStockThisSize
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
            {isLowStock && (
              <span className="text-xs text-amber-600">
                Only {maxQuantity} left
              </span>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <FeatureCard icon={<Truck className="w-5 h-5" />} title="Free Delivery" subtitle="2-4 days" />
          <FeatureCard icon={<RotateCcw className="w-5 h-5" />} title="Easy Return" subtitle="7 days" />
          <FeatureCard icon={<Shield className="w-5 h-5" />} title="Assurance" subtitle="100% Quality" />
        </div>

        {/* Description */}
        <div className="mt-6">
          <h2 className="font-medium text-gray-900 mb-2">Description</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description ||
              'A premium quality shirt crafted with attention to detail. Perfect for any occasion, this shirt offers both style and comfort.'}
          </p>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button
            onClick={() => navigate('/cart')}
            className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <Button
            onClick={handleAddToCart}
            loading={addingToCart}
            disabled={isOutOfStock}
            className="flex-1"
          >
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className="text-primary-500 mb-1">{icon}</div>
      <p className="text-xs font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
