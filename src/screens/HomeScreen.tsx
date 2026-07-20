import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, ShoppingBag, ChevronRight, TrendingUp, Sparkles } from 'lucide-react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { ProductCardSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { ProductWithInventory, Order } from '../lib/types';

export function HomeScreen() {
  const { user, profile } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithInventory[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductWithInventory[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    await fetchProducts();
    if (user) {
      await fetchRecentOrders();
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select(`*, inventory:inventory(*)`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) {
      setFeaturedProducts((data as ProductWithInventory[]).filter(p => p.is_featured));
      setRecentProducts((data as ProductWithInventory[]).slice(0, 6));
    }
  };

  const fetchRecentOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setRecentOrders(data);
  };

  const handleAddToCart = async (productId: string) => {
    const result = await addToCart(productId);
    if (result.success) {
      showToast('Added to cart!', 'success');
    } else {
      showToast(result.error || 'Failed to add to cart', 'error');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';
  const hasNewOrders = recentOrders.filter(o =>
    o.status === 'processing' || o.status === 'shipped'
  ).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-30 bg-primary-500 text-white px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="md" />
          <div className="flex-1">
            <p className="text-xs text-white/80">Welcome back,</p>
            <h1 className="text-lg font-semibold">{firstName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full" />
          </div>
        </div>

        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-3 bg-white/20 rounded-xl px-4 py-3 text-left backdrop-blur"
        >
          <Search className="w-5 h-5 text-white/80" />
          <span className="text-white/80 text-sm">Search shirts...</span>
        </button>
      </header>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            icon={<Package className="w-5 h-5" />}
            label="Orders"
            onClick={() => navigate('/orders')}
          />
          <QuickAction
            icon={<Truck className="w-5 h-5" />}
            label="Track"
            onClick={() => navigate('/orders')}
            badge={hasNewOrders}
          />
          <QuickAction
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Cart"
            onClick={() => navigate('/cart')}
          />
          <QuickAction
            icon={<Sparkles className="w-5 h-5" />}
            label="New"
            onClick={() => navigate('/search')}
          />
        </div>
      </div>

      {/* Stats Cards */}
      {user && (
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/80">Active Orders</p>
                  <p className="text-2xl font-bold mt-1">
                    {recentOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-white/30" />
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white border-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/80">Delivered</p>
                  <p className="text-2xl font-bold mt-1">
                    {recentOrders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-white/30" />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentOrders.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-link"
            >
              View All
            </button>
          </div>
          <Card>
            {recentOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="flex items-center justify-between w-full py-3 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0"
              >
                <div className="text-left">
                  <p className="font-medium text-gray-900">#{order.order_number}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">${order.total_amount.toFixed(2)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </Card>
        </div>
      )}

      {/* Featured Products */}
      <section className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Featured Shirts</h2>
          <button
            onClick={() => navigate('/search?featured=true')}
            className="text-sm text-link"
          >
            See All
          </button>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-4 px-4">
          {loading ? (
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          ) : (
            featuredProducts.map((product) => (
              <div key={product.id} className="w-40 flex-shrink-0">
                <ProductCard
                  product={product}
                  onAddToCart={() => handleAddToCart(product.id)}
                />
              </div>
            ))
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">New Arrivals</h2>
          <button
            onClick={() => navigate('/search?sort=newest')}
            className="text-sm text-link"
          >
            See All
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          ) : (
            recentProducts.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => handleAddToCart(product.id)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative"
    >
      {badge && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      )}
      <div className="text-primary-500">{icon}</div>
      <span className="text-xs text-gray-600">{label}</span>
    </button>
  );
}
