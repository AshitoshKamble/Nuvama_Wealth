import { Home, Search, ShoppingBag, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { useCart } from '../context/CartContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/cart', icon: ShoppingBag, label: 'Cart' },
  { path: '/notifications', icon: Bell, label: 'Alerts' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const { cartCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const showBadge =
            (path === '/notifications' && unreadCount > 0) ||
            (path === '/cart' && cartCount > 0);

          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center w-16 h-full relative
                ${isActive ? 'text-primary-500' : 'text-gray-500'}`}
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {path === '/notifications' ? unreadCount : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
