/*
# B2C Shirt E-Commerce Platform Schema

## Overview
This migration creates the complete database schema for a B2C shirt e-commerce MVP
with inventory management, order processing, and delivery tracking.

## Tables Created

### 1. products
Shirt products available for purchase.
- id (uuid, primary key)
- name (text) - Product name
- description (text) - Detailed description
- price (decimal) - Current price
- original_price (decimal) - Original/MRP price for discounts
- image_url (text) - Product image
- category (text) - Shirt category (formal, casual, etc.)
- size (text) - Available size
- color (text) - Shirt color
- fabric (text) - Fabric type
- is_featured (boolean) - Featured on homepage
- is_active (boolean) - Product availability
- created_at, updated_at (timestamps)

### 2. inventory
Stock levels for each product.
- id (uuid, primary key)
- product_id (uuid, FK to products)
- quantity (integer) - Current stock
- low_stock_threshold (integer) - Alert threshold
- updated_at (timestamp)

### 3. addresses
User shipping addresses.
- id (uuid, primary key)
- user_id (uuid, FK to auth.users)
- name (text) - Recipient name
- phone (text) - Contact number
- address_line1 (text) - Street address
- address_line2 (text) - Apartment/suite
- city (text)
- state (text)
- pincode (text) - Postal code
- is_default (boolean) - Default address flag
- created_at (timestamp)

### 4. orders
Customer orders.
- id (uuid, primary key)
- user_id (uuid, FK to auth.users)
- order_number (text) - Human-readable order ID
- status (text) - Order status
- total_amount (decimal)
- subtotal (decimal)
- shipping_address (jsonb) - Snapshot of address at order time
- payment_method (text) - UPI or COD
- payment_status (text) - Payment status
- notes (text) - Customer notes
- created_at, updated_at (timestamps)

### 5. order_items
Items within an order.
- id (uuid, primary key)
- order_id (uuid, FK to orders)
- product_id (uuid, FK to products)
- quantity (integer)
- price (decimal) - Price at time of order
- product_snapshot (jsonb) - Product details snapshot

### 6. deliveries
Delivery tracking information.
- id (uuid, primary key)
- order_id (uuid, FK to orders)
- status (text) - Current delivery status
- tracking_number (text) - Logistics tracking ID
- carrier (text) - Delivery partner name
- estimated_delivery (date)
- actual_delivery (timestamp)
- current_location (text)
- notes (text)
- created_at, updated_at (timestamps)

### 7. delivery_events
Timeline events for delivery tracking.
- id (uuid, primary key)
- delivery_id (uuid, FK to deliveries)
- status (text)
- location (text)
- description (text)
- timestamp (timestamp)

### 8. notifications
User notifications.
- id (uuid, primary key)
- user_id (uuid, FK to auth.users)
- title (text)
- message (text)
- type (text) - order, delivery, promotion, system
- read (boolean)
- reference_id (uuid) - Related entity ID
- reference_type (text) - Related entity type
- created_at (timestamp)

### 9. cart_items
Shopping cart items.
- id (uuid, primary key)
- user_id (uuid, FK to auth.users)
- product_id (uuid, FK to products)
- quantity (integer)
- created_at, updated_at (timestamps)

### 10. profiles
User profiles extending auth.users.
- id (uuid, primary key, references auth.users)
- full_name (text)
- phone (text)
- avatar_url (text)
- created_at, updated_at (timestamps)

## Security (RLS)
- RLS enabled on all tables
- Products/Inventory: Public read, admin write (anon can read)
- User-scoped tables: Users can only access their own data
- Order-scoped tables: Users access via their orders

## Indexes
- Created for frequently queried columns
- Foreign key indexes for joins
*/

-- Products table (publicly readable)
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    original_price decimal(10,2),
    image_url text,
    category text DEFAULT 'casual',
    size text NOT NULL,
    color text,
    fabric text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 0,
    low_stock_threshold integer DEFAULT 10,
    updated_at timestamptz DEFAULT now(),
    UNIQUE(product_id)
);

-- User profiles
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    phone text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    phone text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number text UNIQUE NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    total_amount decimal(10,2) NOT NULL,
    subtotal decimal(10,2) NOT NULL,
    shipping_address jsonb NOT NULL,
    payment_method text NOT NULL,
    payment_status text DEFAULT 'pending',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id),
    quantity integer NOT NULL,
    price decimal(10,2) NOT NULL,
    product_snapshot jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'processing',
    tracking_number text UNIQUE,
    carrier text DEFAULT 'In-house Logistics',
    estimated_delivery date,
    actual_delivery timestamptz,
    current_location text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Delivery events (tracking timeline)
CREATE TABLE IF NOT EXISTS delivery_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    status text NOT NULL,
    location text,
    description text NOT NULL,
    timestamp timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'system',
    read boolean DEFAULT false,
    reference_id uuid,
    reference_type text,
    created_at timestamptz DEFAULT now()
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Products: Public read, authenticated write (for MVP, allowing inserts)
DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "products_insert" ON products;
CREATE POLICY "products_insert" ON products FOR INSERT
    TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "products_update" ON products;
CREATE POLICY "products_update" ON products FOR UPDATE
    TO authenticated USING (true) WITH CHECK (true);

-- Inventory: Public read
DROP POLICY IF EXISTS "inventory_select" ON inventory;
CREATE POLICY "inventory_select" ON inventory FOR SELECT
    TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "inventory_insert" ON inventory;
CREATE POLICY "inventory_insert" ON inventory FOR INSERT
    TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "inventory_update" ON inventory;
CREATE POLICY "inventory_update" ON inventory FOR UPDATE
    TO authenticated USING (true) WITH CHECK (true);

-- Profiles: Users manage own profile
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
    TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Addresses: Users manage own addresses
DROP POLICY IF EXISTS "addresses_select" ON addresses;
CREATE POLICY "addresses_select" ON addresses FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_insert" ON addresses;
CREATE POLICY "addresses_insert" ON addresses FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_update" ON addresses;
CREATE POLICY "addresses_update" ON addresses FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_delete" ON addresses;
CREATE POLICY "addresses_delete" ON addresses FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- Orders: Users manage own orders
DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert" ON orders;
CREATE POLICY "orders_insert" ON orders FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update" ON orders;
CREATE POLICY "orders_update" ON orders FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Order items: Access via own orders
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );

-- Deliveries: Access via own orders
DROP POLICY IF EXISTS "deliveries_select" ON deliveries;
CREATE POLICY "deliveries_select" ON deliveries FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND orders.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "deliveries_insert" ON deliveries;
CREATE POLICY "deliveries_insert" ON deliveries FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND orders.user_id = auth.uid())
    );

DROP POLICY IF EXISTS "deliveries_update" ON deliveries;
CREATE POLICY "deliveries_update" ON deliveries FOR UPDATE
    TO authenticated USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND orders.user_id = auth.uid())
    ) WITH CHECK (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = deliveries.order_id AND orders.user_id = auth.uid())
    );

-- Delivery events: Access via own orders
DROP POLICY IF EXISTS "delivery_events_select" ON delivery_events;
CREATE POLICY "delivery_events_select" ON delivery_events FOR SELECT
    TO authenticated USING (
        EXISTS (
            SELECT 1 FROM deliveries
            JOIN orders ON orders.id = deliveries.order_id
            WHERE deliveries.id = delivery_events.delivery_id AND orders.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "delivery_events_insert" ON delivery_events;
CREATE POLICY "delivery_events_insert" ON delivery_events FOR INSERT
    TO authenticated WITH CHECK (
        EXISTS (
            SELECT 1 FROM deliveries
            JOIN orders ON orders.id = deliveries.order_id
            WHERE deliveries.id = delivery_events.delivery_id AND orders.user_id = auth.uid()
        )
    );

-- Notifications: Users manage own notifications
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete" ON notifications;
CREATE POLICY "notifications_delete" ON notifications FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- Cart items: Users manage own cart
DROP POLICY IF EXISTS "cart_items_select" ON cart_items;
CREATE POLICY "cart_items_select" ON cart_items FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items_insert" ON cart_items;
CREATE POLICY "cart_items_insert" ON cart_items FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items_update" ON cart_items;
CREATE POLICY "cart_items_update" ON cart_items FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cart_items_delete" ON cart_items;
CREATE POLICY "cart_items_delete" ON cart_items FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_delivery ON delivery_events(delivery_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
    prefix text := 'SHT';
    date_part text := to_char(now(), 'YYMMDD');
    seq_num integer;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 10 FOR 4) AS integer)), 0) + 1
    INTO seq_num
    FROM orders
    WHERE order_number LIKE prefix || date_part || '%';
    
    RETURN prefix || date_part || lpad(seq_num::text, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, new.raw_user_meta_data->>'full_name');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();