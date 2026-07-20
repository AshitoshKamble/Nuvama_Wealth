import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import type { Order, OrderItem } from '../lib/types';
import { StatusBadge } from './StatusBadge';
import { ORDER_STATUS_LABELS } from '../lib/types';

interface OrderCardProps {
  order: Order;
  items?: OrderItem[];
}

export function OrderCard({ order, items }: OrderCardProps) {
  const date = new Date(order.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-900">#{order.order_number}</p>
          <p className="text-xs text-gray-500 mt-0.5">{date}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Package className="w-3.5 h-3.5" />
        <span>{items?.length || 0} items</span>
        <span className="mx-1">${order.total_amount.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-sm text-gray-600">
          {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </Link>
  );
}
