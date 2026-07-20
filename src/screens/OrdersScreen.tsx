import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Filter } from 'lucide-react';
import { Header } from '../components/Header';
import { OrderCard } from '../components/OrderCard';
import { OrderCardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../lib/types';

const statusFilters = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
];

export function OrdersScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setOrders(data);
      for (const order of data) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        if (items) {
          setOrderItems((prev) => ({ ...prev, [order.id]: items }));
        }
      }
    }
    setLoading(false);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return order.status === 'pending' || order.status === 'confirmed';
    return order.status === activeFilter;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Orders" />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Sign in to view orders
          </h2>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="My Orders" />

      {/* Filter Chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar bg-white border-b border-gray-100">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeFilter === filter.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : filteredOrders.length === 0 ? (
          <EmptyState
            icon={<Package className="w-8 h-8 text-gray-400" />}
            title="No orders yet"
            description="Start shopping to see your orders here"
            action={
              <Button onClick={() => navigate('/search')}>
                Browse Shirts
              </Button>
            }
          />
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              items={orderItems[order.id]}
            />
          ))
        )}
      </div>
    </div>
  );
}
