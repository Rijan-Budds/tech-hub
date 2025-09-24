"use client";

import { useEffect, useState } from 'react';
import { useNotificationPolling } from '@/hooks/useNotificationPolling';
import { useProfileStore } from '@/store/useProfileStore';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

interface NotificationListenerProps {
  enabled?: boolean;
  showConnectionStatus?: boolean;
}

export default function NotificationListener({ 
  enabled = true, 
  showConnectionStatus = false 
}: NotificationListenerProps) {
  const { user, loading } = useProfileStore();
  const [isVisible, setIsVisible] = useState(false);

  // Only enable for authenticated non-admin users, and only after loading is complete
  const shouldEnable = Boolean(
    enabled && 
    !loading && 
    user && 
    user.id && 
    user.role !== 'admin'
  );
  
  console.log('[NotificationListener] shouldEnable:', shouldEnable, 'loading:', loading, 'user:', user?.username, 'role:', user?.role);

  const {
    isConnected,
    lastUpdate,
    reconnectCount
  } = useNotificationPolling({
    enabled: shouldEnable,
    timeout: 30000, // 30 second long poll timeout
    reconnectDelay: 3000 // 3 second reconnect delay
  });

  // Show connection status temporarily when it changes
  useEffect(() => {
    if (showConnectionStatus && shouldEnable) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, showConnectionStatus, shouldEnable]);

  // Stop polling if user becomes unauthenticated
  useEffect(() => {
    if (!loading && !user) {
      console.log('[NotificationListener] User not authenticated, ensuring polling is stopped');
      // The polling hook will handle stopping based on shouldEnable change
    }
  }, [loading, user]);

  // Don't render anything if user is not authenticated or is admin
  if (!shouldEnable) {
    return null;
  }

  return (
    <>
      {/* Connection Status Indicator */}
      {showConnectionStatus && (
        <div className={`
          fixed top-4 right-4 z-50 transition-all duration-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
        `}>
          <div className={`
            flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg text-sm font-medium
            ${isConnected 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
            }
          `}>
            {isConnected ? (
              <>
                <FaWifi className="text-green-600" />
                <span>Live notifications connected</span>
              </>
            ) : (
              <>
                <FaExclamationTriangle className="text-red-600" />
                <span>
                  Connecting... 
                  {reconnectCount > 0 && ` (${reconnectCount})`}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40 bg-black/80 text-white p-2 rounded text-xs">
          <div>🔔 Notifications: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
          {lastUpdate && (
            <div>📅 Last: {lastUpdate.toLocaleTimeString()}</div>
          )}
          {reconnectCount > 0 && (
            <div>🔄 Reconnects: {reconnectCount}</div>
          )}
        </div>
      )}
    </>
  );
}

// Hook to manually control notification polling
export const useNotificationControl = () => {
  const { user } = useProfileStore();
  const shouldEnable = user && user.role !== 'admin';
  
  const polling = useNotificationPolling({
    enabled: false, // Manual control
    timeout: 30000,
    reconnectDelay: 3000
  });

  return {
    ...polling,
    canConnect: shouldEnable,
    startPolling: shouldEnable ? polling.startPolling : () => {},
    stopPolling: shouldEnable ? polling.stopPolling : () => {}
  };
};