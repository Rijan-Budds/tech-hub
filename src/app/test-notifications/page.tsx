"use client";

import React, { useEffect, useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useNotificationControl } from "@/components/NotificationListener";
import { FaPlay, FaStop, FaSync, FaTrash, FaBell, FaCheckCircle } from "react-icons/fa";

export default function TestNotificationsPage() {
  const { loading, user, orders, loadProfile } = useProfileStore();
  const { notifications, unreadCount, markAllAsRead, clearNotifications } = useNotificationStore();
  const [testResult, setTestResult] = useState<string>("");
  
  const {
    isConnected,
    lastUpdate,
    reconnectCount,
    canConnect,
    startPolling,
    stopPolling
  } = useNotificationControl();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const testLongPollEndpoint = async () => {
    setTestResult("Testing long poll endpoint...");
    
    try {
      const response = await fetch("/api/notifications/poll?timeout=5000", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        const errorText = await response.text();
        setTestResult(`❌ Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setTestResult(`❌ Network Error: ${error}`);
    }
  };

  const simulateNotification = async () => {
    // Add a test notification to the store
    const testNotifications = [
      {
        type: 'order' as const,
        title: '📦 Order Status Update',
        message: 'Your order has been shipped and is on its way!',
        priority: 'medium' as const,
        icon: '📦',
        actionUrl: '/orders',
        isRead: false
      },
      {
        type: 'chat' as const,
        title: '💬 New message from Support',
        message: 'Hello! We have an update about your recent inquiry.',
        priority: 'high' as const,
        icon: '💬',
        actionUrl: '/chat',
        isRead: false
      },
      {
        type: 'return' as const,
        title: '↩️ Return Request Approved',
        message: 'Your return request has been approved and processed.',
        priority: 'medium' as const,
        icon: '↩️',
        actionUrl: '/orders',
        isRead: false
      }
    ];
    
    // Add all test notifications
    const { addNotification } = useNotificationStore.getState();
    testNotifications.forEach(notification => {
      addNotification(notification);
    });
    
    setTestResult(`✅ Added ${testNotifications.length} test notifications! Check the notification bell in the header.`);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Notification System Test</h1>
        <p className="text-red-600">Please log in to test the notification system.</p>
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Notification System Test</h1>
        <p className="text-yellow-600">Long polling notifications are not available for admin users.</p>
        <p className="text-gray-600 mt-2">Admins receive notifications through the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Long Polling Notification System Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Status */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaBell className="mr-2 text-blue-500" />
            Connection Status
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Can Connect:</span>
              <span className={canConnect ? "text-green-600" : "text-red-600"}>
                {canConnect ? "✅ Yes" : "❌ No"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Connected:</span>
              <span className={isConnected ? "text-green-600" : "text-red-600"}>
                {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Last Update:</span>
              <span className="text-sm text-gray-600">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : "Never"}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Reconnect Count:</span>
              <span className={reconnectCount > 0 ? "text-yellow-600" : "text-green-600"}>
                {reconnectCount}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <button 
              onClick={startPolling}
              disabled={!canConnect || isConnected}
              className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              <FaPlay className="text-sm" />
              <span>Start</span>
            </button>
            
            <button 
              onClick={stopPolling}
              disabled={!isConnected}
              className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              <FaStop className="text-sm" />
              <span>Stop</span>
            </button>
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaBell className="mr-2 text-purple-500" />
            Notifications ({unreadCount} unread)
          </h2>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No notifications yet</p>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded border-l-4 ${
                    notification.isRead 
                      ? 'bg-gray-50 border-gray-300' 
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="ml-2 text-lg">
                      {notification.icon}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="flex space-x-2 mt-4">
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              <FaCheckCircle className="text-xs" />
              <span>Mark All Read</span>
            </button>
            
            <button 
              onClick={clearNotifications}
              disabled={notifications.length === 0}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 text-sm"
            >
              <FaTrash className="text-xs" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      </div>

      {/* API Testing */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">API Testing</h2>
        
        <div className="space-x-2 mb-4">
          <button 
            onClick={testLongPollEndpoint}
            className="flex items-center space-x-1 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            <FaSync className="text-sm" />
            <span>Test Long Poll Endpoint</span>
          </button>
          
          <button 
            onClick={simulateNotification}
            className="flex items-center space-x-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            <FaBell className="text-sm" />
            <span>Add Test Notifications</span>
          </button>
        </div>
        
        {testResult && (
          <div className="bg-gray-100 p-4 rounded border">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
              {testResult}
            </pre>
          </div>
        )}
      </div>

      {/* User Orders */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Your Orders</h2>
        
        {orders.length === 0 ? (
          <p className="text-gray-500">No orders found. Create an order to test order status notifications.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-600">Status: {order.status}</p>
                </div>
                <div className="text-sm text-gray-500">
                  रु{order.grandTotal?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">How to Test Notifications</h2>
        <div className="space-y-2 text-sm text-yellow-700">
          <p><strong>Order Status Notifications:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Go to the admin panel (/admin)</li>
            <li>Find one of your orders</li>
            <li>Change its status (e.g., pending → processing → shipped → delivered)</li>
            <li>You should see notifications appear in real-time</li>
          </ul>
          
          <p className="mt-3"><strong>Chat Message Notifications:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Open the chat (usually in the header or footer)</li>
            <li>Send a message as a customer</li>
            <li>Go to admin panel and reply as admin</li>
            <li>You should receive a notification about the admin&apos;s reply</li>
          </ul>
          
          <p className="mt-3"><strong>Return Status Notifications:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Create a return request for a delivered order</li>
            <li>Go to admin panel and change the return status</li>
            <li>You should see notifications about return updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
}