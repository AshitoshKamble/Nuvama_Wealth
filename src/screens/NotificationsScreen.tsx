import { Bell, Check, Package, Truck, Tag, Info, ChevronRight } from 'lucide-react';
import { Header } from '../components/Header';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../lib/types';

const typeIcons = {
  order: Package,
  delivery: Truck,
  promotion: Tag,
  system: Info,
};

const typeColors = {
  order: 'bg-primary-100 text-primary-600',
  delivery: 'bg-secondary-100 text-secondary-600',
  promotion: 'bg-amber-100 text-amber-600',
  system: 'bg-gray-100 text-gray-600',
};

export function NotificationsScreen() {
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.reference_id && notification.reference_type === 'order') {
      navigate(`/orders/${notification.reference_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Notifications" />
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Notifications"
        rightAction={
          unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="text-sm text-link flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-gray-400" />}
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="p-4 space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type];
            const iconColor = typeColors[notification.type];

            return (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-colors ${
                  notification.read
                    ? 'bg-white border border-gray-100'
                    : 'bg-primary-50 border border-primary-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${iconColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getTimeAgo(notification.created_at)}
                  </p>
                </div>
                {notification.reference_id && (
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
