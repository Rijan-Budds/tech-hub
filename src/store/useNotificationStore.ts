"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Notification {
  id: string;
  type: 'order' | 'chat' | 'return' | 'payment' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
        };

        set((state) => {
          const newNotifications = [notification, ...state.notifications].slice(0, 50); // Keep only latest 50
          const unreadCount = newNotifications.filter(n => !n.isRead).length;
          
          return {
            notifications: newNotifications,
            unreadCount
          };
        });
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const notifications = state.notifications.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          );
          const unreadCount = notifications.filter(n => !n.isRead).length;
          
          return { notifications, unreadCount };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0
        }));
      },

      removeNotification: (notificationId) => {
        set((state) => {
          const notifications = state.notifications.filter(n => n.id !== notificationId);
          const unreadCount = notifications.filter(n => !n.isRead).length;
          
          return { notifications, unreadCount };
        });
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: "notifications-storage",
      partialize: (state) => ({ 
        notifications: state.notifications,
        unreadCount: state.unreadCount 
      }),
    }
  )
);

// Helper function to create order notification
export const createOrderNotification = (orderId: string, oldStatus: string, newStatus: string): Omit<Notification, 'id' | 'createdAt'> => {
  const statusMessages: Record<string, string> = {
    'processing': 'Your order is now being processed',
    'shipped': 'Your order has been shipped',
    'out-for-delivery': 'Your order is out for delivery', 
    'delivered': 'Your order has been delivered',
    'canceled': 'Your order has been canceled',
    'returned': 'Your order has been returned',
    'return-requested': 'Return request submitted for your order'
  };

  const statusIcons: Record<string, string> = {
    'processing': '📦',
    'shipped': '🚚', 
    'out-for-delivery': '🏃',
    'delivered': '✅',
    'canceled': '❌',
    'returned': '↩️',
    'return-requested': '🔄'
  };

  return {
    type: 'order',
    title: `${statusIcons[newStatus] || '📋'} Order Status Update`,
    message: statusMessages[newStatus] || `Order status changed to ${newStatus}`,
    priority: 'medium',
    icon: statusIcons[newStatus] || '📋',
    actionUrl: `/orders/${orderId}`,
    isRead: false
  };
};

// Helper function to create chat notification
export const createChatNotification = (conversationId: string, senderName: string, messagePreview: string): Omit<Notification, 'id' | 'createdAt'> => {
  return {
    type: 'chat',
    title: `💬 New message from ${senderName}`,
    message: messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
    priority: 'medium',
    icon: '💬',
    actionUrl: `/chat`,
    isRead: false
  };
};

// Helper function to create return notification
export const createReturnNotification = (returnId: string, orderId: string, status: string): Omit<Notification, 'id' | 'createdAt'> => {
  const statusMessages: Record<string, string> = {
    'approved': 'Your return request has been approved',
    'rejected': 'Your return request has been rejected',
    'completed': 'Your return has been completed', 
    'refunded': 'Your refund has been processed'
  };

  const statusIcons: Record<string, string> = {
    'approved': '✅',
    'rejected': '❌',
    'completed': '📦',
    'refunded': '💰'
  };

  return {
    type: 'return',
    title: `${statusIcons[status] || '🔄'} Return Update`,
    message: statusMessages[status] || `Return status updated to ${status}`,
    priority: 'medium', 
    icon: statusIcons[status] || '🔄',
    actionUrl: `/orders/${orderId}`,
    isRead: false
  };
};