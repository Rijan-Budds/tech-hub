import { useEffect, useRef, useState, useCallback } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { toast } from 'sonner';

interface NotificationEvent {
  id: string;
  type: 'order_status' | 'chat_message' | 'return_status' | 'general';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  userId: string;
}

interface NotificationPollingOptions {
  enabled?: boolean;
  timeout?: number; // Long polling timeout in ms
  reconnectDelay?: number; // Delay between reconnect attempts
}

interface NotificationPollingResult {
  isConnected: boolean;
  lastUpdate: Date | null;
  reconnectCount: number;
  startPolling: () => void;
  stopPolling: () => void;
}

export const useNotificationPolling = (options: NotificationPollingOptions = {}): NotificationPollingResult => {
  const {
    enabled = true,
    timeout = 30000, // 30 seconds
    reconnectDelay = 3000 // 3 seconds
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingActiveRef = useRef(false);

  const { addNotification } = useNotificationStore();

  // Function to perform a single long poll request
  const performLongPoll = useCallback(async () => {
    if (!pollingActiveRef.current) {
      console.log('[NotificationPolling] Polling not active, skipping poll');
      return;
    }

    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      console.log('[NotificationPolling] 🔄 Starting long poll request...');
      
      const response = await fetch(`/api/notifications/poll?timeout=${timeout}`, {
        credentials: 'include',
        signal: abortControllerRef.current.signal,
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[NotificationPolling] 📨 Poll response:', data);

      // Update connection status
      setIsConnected(true);
      setLastUpdate(new Date());
      setReconnectCount(0); // Reset reconnect count on successful connection

      // Process received notifications
      if (data.notifications && data.notifications.length > 0) {
        console.log(`[NotificationPolling] ✨ Processing ${data.notifications.length} notifications`);
        
        data.notifications.forEach((notificationEvent: NotificationEvent) => {
          // Convert to our notification store format
          const notification = {
            id: notificationEvent.id,
            type: notificationEvent.type as 'order' | 'chat' | 'return' | 'payment' | 'general',
            title: notificationEvent.title,
            message: notificationEvent.message,
            priority: 'medium' as const,
            icon: getIconForType(notificationEvent.type),
            actionUrl: notificationEvent.data?.actionUrl as string | undefined,
            isRead: false,
            createdAt: new Date(notificationEvent.timestamp)
          };

          // Add to notification store
          addNotification(notification);

          // Show toast notification
          showToastForNotification(notificationEvent);
        });
      }

      // Continue polling if still active
      if (pollingActiveRef.current) {
        // Small delay before next poll to prevent hammering
        setTimeout(() => {
          if (pollingActiveRef.current) {
            performLongPoll();
          }
        }, 100);
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[NotificationPolling] Poll request aborted');
        return;
      }

      console.error('[NotificationPolling] Poll request failed:', error);
      setIsConnected(false);

      // Implement exponential backoff for reconnection
      if (pollingActiveRef.current) {
        const backoffDelay = Math.min(reconnectDelay * Math.pow(2, reconnectCount), 30000);
        console.log(`[NotificationPolling] Reconnecting in ${backoffDelay}ms (attempt ${reconnectCount + 1})`);
        
        setReconnectCount(prev => prev + 1);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (pollingActiveRef.current) {
            performLongPoll();
          }
        }, backoffDelay);
      }
    }
  }, [timeout, reconnectDelay, reconnectCount, addNotification]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingActiveRef.current) {
      console.log('[NotificationPolling] Already polling, skipping start');
      return;
    }

    console.log('[NotificationPolling] 🚀 Starting notification long polling');
    pollingActiveRef.current = true;
    setReconnectCount(0);
    performLongPoll();
  }, [performLongPoll]);

  // Stop polling
  const stopPolling = useCallback(() => {
    console.log('[NotificationPolling] 🛑 Stopping notification long polling');
    pollingActiveRef.current = false;
    setIsConnected(false);

    // Abort current request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Start/stop polling based on enabled flag
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isConnected,
    lastUpdate,
    reconnectCount,
    startPolling,
    stopPolling
  };
};

// Helper function to get icon for notification type
function getIconForType(type: string): string {
  switch (type) {
    case 'order_status': return '📦';
    case 'chat_message': return '💬';
    case 'return_status': return '↩️';
    case 'general': return '📋';
    default: return '🔔';
  }
}

// Helper function to show toast for notification
function showToastForNotification(notification: NotificationEvent) {
  const icon = getIconForType(notification.type);
  const toastMessage = `${icon} ${notification.title}`;
  
  // Show different toast types based on notification type
  switch (notification.type) {
    case 'order_status':
      toast.success(toastMessage, {
        description: notification.message,
        duration: 5000,
        position: 'top-right'
      });
      break;
      
    case 'chat_message':
      toast.info(toastMessage, {
        description: notification.message,
        duration: 6000,
        position: 'top-right'
      });
      break;
      
    case 'return_status':
      toast.success(toastMessage, {
        description: notification.message,
        duration: 5000,
        position: 'top-right'
      });
      break;
      
    default:
      toast(toastMessage, {
        description: notification.message,
        duration: 4000,
        position: 'top-right'
      });
  }
}