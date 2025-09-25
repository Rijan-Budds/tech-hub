interface NotificationEvent {
  id: string;
  type: 'order_status' | 'chat_message' | 'return_status' | 'general';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  userId: string;
}

// Store for pending notifications per user
const userNotifications = new Map<string, NotificationEvent[]>();
// Store for pending requests per user  
const pendingRequests = new Map<string, { resolve: (notifications: NotificationEvent[]) => void; timeout: NodeJS.Timeout }[]>();

// Helper function to add notification for a user
export function addNotificationForUser(userId: string, notification: NotificationEvent) {
  console.log(`[LongPolling] Adding notification for user ${userId}:`, notification);
  
  // Store the notification
  if (!userNotifications.has(userId)) {
    userNotifications.set(userId, []);
  }
  userNotifications.get(userId)!.push(notification);
  
  // Resolve any pending requests for this user
  const pending = pendingRequests.get(userId);
  if (pending && pending.length > 0) {
    console.log(`[LongPolling] Resolving ${pending.length} pending requests for user ${userId}`);
    
    // Get all notifications for this user
    const notifications = userNotifications.get(userId) || [];
    
    // Resolve all pending requests
    pending.forEach(({ resolve, timeout }) => {
      clearTimeout(timeout);
      resolve(notifications);
    });
    
    // Clear pending requests
    pendingRequests.delete(userId);
    
    // Clear notifications (they've been delivered)
    userNotifications.delete(userId);
  }
}

export function getPendingRequests() {
  return pendingRequests;
}

export function getUserNotifications() {
  return userNotifications;
}

// Helper function to create order status notification
export function createOrderStatusNotification(orderId: string, userId: string, oldStatus: string, newStatus: string): NotificationEvent {
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
    id: `order_${orderId}_${Date.now()}`,
    type: 'order_status',
    title: `${statusIcons[newStatus] || '📋'} Order Status Update`,
    message: statusMessages[newStatus] || `Order status changed to ${newStatus}`,
    data: {
      orderId,
      oldStatus,
      newStatus,
      actionUrl: `/orders/${orderId}`
    },
    timestamp: new Date(),
    userId
  };
}

// Helper function to create chat message notification
export function createChatMessageNotification(conversationId: string, userId: string, senderName: string, messagePreview: string): NotificationEvent {
  return {
    id: `chat_${conversationId}_${Date.now()}`,
    type: 'chat_message',
    title: `💬 New message from ${senderName}`,
    message: messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview,
    data: {
      conversationId,
      senderName,
      actionUrl: `/chat`
    },
    timestamp: new Date(),
    userId
  };
}

// Helper function to create return status notification  
export function createReturnStatusNotification(returnId: string, userId: string, orderId: string, status: string): NotificationEvent {
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
    id: `return_${returnId}_${Date.now()}`,
    type: 'return_status',
    title: `${statusIcons[status] || '🔄'} Return Update`,
    message: statusMessages[status] || `Return status updated to ${status}`,
    data: {
      returnId,
      orderId,
      status,
      actionUrl: `/orders/${orderId}`
    },
    timestamp: new Date(),
    userId
  };
}