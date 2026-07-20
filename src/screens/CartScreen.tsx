import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Header } from '../components/Header';
import { CartItemCard } from '../components/CartItemCard';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { CartItem } from '../lib/types';

export function CartScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, loading, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const [clearing, setClearing] = useState(false);

  const handleClearCart = async () => {
    setClearing(true);
    await clearCart();
    setClearing(false);
  };

  const validItems = cartItems.filter(
    (item) => item.product && item.product.inventory?.quantity && item.product.inventory.quantity > 0
  );
  const invalidItems = cartItems.filter(
    (item) => !item.product || !item.product.inventory?.quantity || item.product.inventory.quantity === 0
  );

  const subtotal = cartTotal;
  const shipping = subtotal > 0 ? 0 : 0;
  const total = subtotal + shipping;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Cart" />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign in to view cart</h2>
          <p className="text-sm text-gray-500 text-center mb-4">
            Your cart items will be saved when you sign in
          </p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Cart" />
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Cart" />
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
          title="Your cart is empty"
          description="Start shopping to add items to your cart"
          action={
            <Button onClick={() => navigate('/search')}>
              Browse Shirts
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <Header
        title="Cart"
        rightAction={
          cartItems.length > 0 ? (
            <button
              onClick={handleClearCart}
              disabled={clearing}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : null
        }
      />

      <div className="p-4 space-y-3">
        {/* Cart Items */}
        {validItems.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
            onRemove={() => removeFromCart(item.id)}
          />
        ))}

        {/* Out of Stock Items */}
        {invalidItems.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Unavailable Items</p>
            {invalidItems.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-4 mb-2">
                <p className="text-gray-600">Item no longer available</p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 text-sm mt-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        <Card className="mt-4">
          <h2 className="font-medium text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal ({validItems.length} items)</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium text-secondary-600">FREE</span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Checkout Info */}
        <div className="bg-primary-50 rounded-xl p-4 mt-4">
          <p className="text-sm text-primary-700">
            Enjoy free shipping on all orders. Estimated delivery: 2-4 business days.
          </p>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">${total.toFixed(2)}</p>
          </div>
          <Button
            onClick={() => navigate('/checkout')}
            disabled={validItems.length === 0}
            className="flex items-center gap-2"
          >
            Checkout
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
