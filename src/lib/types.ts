export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  category: string;
  size: string;
  color: string | null;
  fabric: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Inventory = {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  updated_at: string;
};

export type ProductWithInventory = Product & {
  inventory: Inventory | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  total_amount: number;
  subtotal: number;
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_snapshot: ProductSnapshot;
  created_at: string;
};

export type ProductSnapshot = {
  name: string;
  description: string | null;
  image_url: string | null;
  size: string;
  color: string | null;
};

export type ShippingAddress = {
  name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
};

export type Delivery = {
  id: string;
  order_id: string;
  status: DeliveryStatus;
  tracking_number: string | null;
  carrier: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  current_location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DeliveryEvent = {
  id: string;
  delivery_id: string;
  status: string;
  location: string | null;
  description: string;
  timestamp: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: ProductWithInventory;
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'UPI' | 'COD';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type DeliveryStatus =
  | 'processing'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed';

export type NotificationType = 'order' | 'delivery' | 'promotion' | 'system';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order Placed',
  confirmed: 'Order Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  processing: 'Processing',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  failed: 'Delivery Failed',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  UPI: 'UPI Payment',
  COD: 'Cash on Delivery',
};
