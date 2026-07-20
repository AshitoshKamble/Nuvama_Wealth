import type { OrderStatus, DeliveryStatus, PaymentStatus } from '../lib/types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: OrderStatus | DeliveryStatus | PaymentStatus | string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-secondary-100 text-secondary-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-primary-100 text-primary-700',
  neutral: 'bg-gray-100 text-gray-700',
};

const statusVariants: Record<string, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'error',
  paid: 'success',
  failed: 'error',
  refunded: 'neutral',
  picked_up: 'info',
  in_transit: 'info',
  out_for_delivery: 'info',
};

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const badgeVariant = variant || statusVariants[status] || 'neutral';
  const classes = variantClasses[badgeVariant];

  return (
    <span className={`status-badge ${classes}`}>
      {status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
}
