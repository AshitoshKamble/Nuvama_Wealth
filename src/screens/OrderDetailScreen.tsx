import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  MapPin,
  Phone,
  CreditCard,
  ChevronRight,
  Truck,
  CheckCircle2,
  Circle,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import type { Order, OrderItem, Delivery, DeliveryEvent } from '../lib/types';
import {
  ORDER_STATUS_LABELS,
  DELIVERY_STATUS_LABELS,
} from '../lib/types';

export function OrderDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [deliveryEvents, setDeliveryEvents] = useState<DeliveryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id, user]);

  const fetchOrderDetails = async () => {
    if (!id || !user) return;
    setLoading(true);

    const { data: orderData } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (!orderData) {
      setLoading(false);
      return;
    }
    setOrder(orderData);

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);
    if (itemsData) setItems(itemsData);

    const { data: deliveryData } = await supabase
      .from('deliveries')
      .select('*')
      .eq('order_id', id)
      .maybeSingle();
    if (deliveryData) {
      setDelivery(deliveryData);
      const { data: eventsData } = await supabase
        .from('delivery_events')
        .select('*')
        .eq('delivery_id', deliveryData.id)
        .order('timestamp', { ascending: false });
      if (eventsData) setDeliveryEvents(eventsData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Order Details" showBack />
        <div className="p-4 space-y-3">
          <div className="h-32 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-48 bg-gray-200 animate-pulse rounded-xl" />
          <div className="h-64 bg-gray-200 animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex flex-col items-center justify-center">
        <Header title="Order Details" showBack />
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500">Order not found</p>
        <Button onClick={() => navigate('/orders')} className="mt-4">
          View All Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={`Order #${order.order_number}`} showBack />

      <div className="p-4 space-y-4">
        {/* Order Status */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Order Status</p>
            <p className="font-semibold text-gray-900 mt-0.5">
              {ORDER_STATUS_LABELS[order.status]}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </Card>

        {/* Delivery Tracking */}
        {delivery && (
          <Card>
            <h2 className="font-medium text-gray-900 mb-4">Delivery Tracking</h2>
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-5 h-5 text-primary-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {DELIVERY_STATUS_LABELS[delivery.status]}
                </p>
                <p className="text-sm text-gray-500">
                  {delivery.current_location || 'In transit'}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              {deliveryEvents.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {index === 0 ? (
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                    {index < deliveryEvents.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {event.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.location && (
                      <p className="text-xs text-gray-400">{event.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Estimated Delivery */}
            {delivery.estimated_delivery && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Estimated Delivery:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(delivery.estimated_delivery).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Items */}
        <Card>
          <h2 className="font-medium text-gray-900 mb-3">Items ({items.length})</h2>
          <div className="space-y-3">
            {items.map((item) => {
              const product = item.product_snapshot;
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {product.color} | Size {product.size}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                      <span className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Shipping Address */}
        <Card>
          <h2 className="font-medium text-gray-900 mb-3">Delivery Address</h2>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">
                {order.shipping_address.name}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {order.shipping_address.address_line1}
                {order.shipping_address.address_line2 &&
                  `, ${order.shipping_address.address_line2}`}
              </p>
              <p className="text-sm text-gray-600">
                {order.shipping_address.city}, {order.shipping_address.state} -{' '}
                {order.shipping_address.pincode}
              </p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{order.shipping_address.phone}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment */}
        <Card>
          <h2 className="font-medium text-gray-900 mb-3">Payment</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="font-medium">
                  {order.payment_method === 'COD' ? 'Cash on Delivery' : 'UPI'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Status</span>
              <StatusBadge status={order.payment_status} />
            </div>
          </div>
        </Card>

        {/* Order Summary */}
        <Card>
          <h2 className="font-medium text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium text-secondary-600">FREE</span>
            </div>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Help */}
        <Button
          variant="outline"
          onClick={() => showToast('Support coming soon!', 'info')}
          className="w-full"
        >
          Need Help?
        </Button>
      </div>
    </div>
  );
}
