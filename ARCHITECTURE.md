# Shirtify - B2C Shirt E-Commerce Platform

## Overview

Shirtify is a modern, minimal B2C e-commerce MVP for selling shirts with integrated logistics tracking. The platform provides a complete customer journey from authentication to order delivery tracking.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time subscriptions)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State Management**: React Context + Hooks

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Screens    │  │   Contexts   │  │  Components │          │
│  │              │  │              │  │              │          │
│  │ - Home       │  │ - Auth       │  │ - Button     │          │
│  │ - Search     │  │ - Cart       │  │ - Card       │          │
│  │ - Product    │  │ - Notific..  │  │ - Modal      │          │
│  │ - Cart       │  │ - Toast      │  │ - Input      │          │
│  │ - Checkout   │  │              │  │ - StatusBadge│          │
│  │ - Orders     │  │              │  │ - Skeleton   │          │
│  │ - Profile    │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │          │
│  │  Database    │  │   Service    │  │   (Future)   │          │
│  │              │  │              │  │              │          │
│  │ - products   │  │ - Email/Pass │  │              │          │
│  │ - inventory  │  │ - Sessions    │  │              │          │
│  │ - profiles   │  │ - JWT         │  │              │          │
│  │ - addresses  │  │              │  │              │          │
│  │ - orders     │  │              │  │              │          │
│  │ - deliveries │  │              │  │              │          │
│  │ - cart_items │  │              │  │              │          │
│  │ - notific..  │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `products` | Shirt catalog | name, price, category, size, color, fabric |
| `inventory` | Stock management | product_id, quantity, low_stock_threshold |
| `profiles` | User profiles | id, full_name, phone, avatar_url |
| `addresses` | Shipping addresses | user_id, name, phone, city, state, pincode |
| `orders` | Customer orders | user_id, order_number, status, total_amount |
| `order_items` | Order line items | order_id, product_id, quantity, price |
| `deliveries` | Delivery tracking | order_id, status, estimated_delivery |
| `delivery_events` | Delivery timeline | delivery_id, status, location, description |
| `cart_items` | Shopping cart | user_id, product_id, quantity |
| `notifications` | User alerts | user_id, title, message, type, read |

### Entity Relationships

```
users (auth) ──1:1──► profiles
    │
    └──1:N──► addresses
    │
    └──1:N──► orders ──1:N──► order_items ──N:1──► products
    │                                       │
    │                                       └──1:1──► inventory
    │
    └──1:1──► deliveries ──1:N──► delivery_events
    │
    └──1:N──► cart_items ──N:1──► products
    │
    └──1:N──► notifications
```

## Customer Journey

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Splash    │───►│   Sign In   │───►│    Home     │───►│   Search    │
│   Screen    │    │   / Sign Up │    │  Dashboard  │    │   Browse    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                  │
                          ┌────────────────────────────────────────┘
                          ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Product   │───►│    Cart     │───►│  Checkout   │
                   │   Details   │    │   Review    │    │   Address   │
                   └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                          ┌────────────────────────────────────┘
                          ▼
                   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
                   │   Payment   │───►│   Order      │───►│  Delivery   │
                   │   Method    │    │   Created    │    │  Tracking   │
                   └─────────────┘    └─────────────┘    └─────────────┘
```

## Screen Overview

### 1. Splash Screen
- App branding animation
- Auto-redirect on load complete

### 2. Authentication (Login/Signup)
- Email/password authentication
- Password visibility toggle
- Form validation
- Google sign-in placeholder

### 3. Home Dashboard
- Welcome message with user avatar
- Quick action cards
- Statistics overview
- Featured products carousel
- New arrivals grid
- Recent orders

### 4. Search & Discovery
- Real-time search
- Category filters (All/Casual/Formal)
- Sort options (Newest/Price/Popular)
- Product grid display

### 5. Product Details
- Large product image
- Price with discount badge
- Size selector
- Quantity picker
- Add to cart CTA
- Feature highlights

### 6. Shopping Cart
- Item list with quantity controls
- Order summary
- Checkout button
- Out-of-stock handling

### 7. Checkout Flow
- Address selection/add
- Payment method (UPI/COD)
- Order confirmation

### 8. Order Tracking
- Order status timeline
- Delivery events
- Estimated delivery date

### 9. Notifications
- Order updates
- Delivery alerts
- Promotional messages
- System notifications

### 10. Profile
- User info display
- Edit profile
- Order history link
- Settings
-Sign out

## Design System

### Colors

```css
Primary:   #2F80ED (Blue)
Secondary: #27AE60 (Green)
Neutral:   Gray scale from #F9FAFB to #111827

Status Colors:
- Success:   #22C55E (Green)
- Warning:   #F59E0B (Amber)
- Error:     #EF4444 (Red)
- Info:      #3B82F6 (Blue)
```

### Typography

```css
Font Family: Inter (Google Fonts)
Weights: 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)

Body:    14-16px, line-height 1.5
Headings: 18-24px, line-height 1.2
```

### Spacing

```css
Base Unit: 8px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
```

### Border Radius

```css
- sm: 8px
- DEFAULT:12px (buttons, cards)
- lg: 16px
- xl: 24px
- full: 9999px (pills, badges)
```

## State Management

### Auth Context
```typescript
{
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn(email, password)
  signUp(email, password, fullName)
  signOut()
}
```

### Cart Context
```typescript
{
  cartItems: CartItem[]
  loading: boolean
  addToCart(productId, quantity)
  updateQuantity(itemId, quantity)
  removeFromCart(itemId)
  clearCart()
  cartTotal: number
  cartCount: number
}
```

### Notification Context
```typescript
{
  notifications: Notification[]
  unreadCount: number
  markAsRead(id)
  markAllAsRead()
}
```

### Toast Context
```typescript
{
  showToast(message, type) // success, error, warning, info
}
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Products/Inventory**: Public read, authenticated write
- **User-scoped tables**: Users can only access their own data
- **Orders**: Owner-scoped via `auth.uid() = user_id`
- **Delivery events**: Accessible via order ownership

### Authentication Flow

1. User signs up with email/password
2. Supabase creates auth.users record
3. Trigger creates profile record automatically
4. Client receives session with JWT
5. Subsequent requests include JWT for auth

## API Interactions

### Products
```typescript
// Fetch featured products
supabase.from('products')
  .select('*, inventory:inventory(*)')
  .eq('is_featured', true)
  .eq('is_active', true)

// Search products
supabase.from('products')
  .select('*, inventory:inventory(*)')
  .ilike('name', `%${search}%`)
```

### Orders
```typescript
// Create order
const order = await supabase.from('orders').insert({
  user_id,
  order_number: await generateOrderNumber(),
  total_amount,
  shipping_address,
  payment_method
}).select().single()

// Create delivery tracking
await supabase.from('deliveries').insert({
  order_id: order.id,
  status: 'processing',
  estimated_delivery: date
})
```

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── Avatar.tsx
│   ├── BottomNav.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CartItemCard.tsx
│   ├── EmptyState.tsx
│   ├── Header.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── OrderCard.tsx
│   ├── ProductCard.tsx
│   ├── Skeleton.tsx
│   └── StatusBadge.tsx
│
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── NotificationContext.tsx
│   └── ToastContext.tsx
│
├── lib/                 # Utilities and types
│   ├── supabase.ts
│   └── types.ts
│
├── screens/             # Screen components
│   ├── CartScreen.tsx
│   ├── CheckoutScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── OrderDetailScreen.tsx
│   ├── OrdersScreen.tsx
│   ├── ProductDetailScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── SearchScreen.tsx
│   ├── SignupScreen.tsx
│   └── SplashScreen.tsx
│
├── App.tsx              # Main app with routing
├── main.tsx             # React entry point
└── index.css            # Global styles
```

## Future Enhancements

### Phase 2 Features
- Payment gateway integration (Razorpay/Stripe)
- Product image uploads (Supabase Storage)
- Wishlist functionality
- Product reviews and ratings
- Size guide
- Admin dashboard

### Phase 3 Features
- Real-time order tracking (WebSocket)
- Push notifications
- Multiple delivery addresses
- Order scheduling
- Loyalty program
- Referral system

## Deployment

The application is configured for deployment on:
- **Frontend**: Vercel/Netlify (static build)
- **Database**: Supabase Cloud

Build command: `npm run build`
Output directory: `dist/`

## Environment Variables

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT License - See LICENSE file for details.
