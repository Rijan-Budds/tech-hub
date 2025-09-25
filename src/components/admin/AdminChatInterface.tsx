"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new";
import { Send, MessageCircle, User, Shield, Users, Radio } from "lucide-react";

interface Message {
  id: string;
  from: string;
  role: 'user' | 'admin';
  text: string;
  timestamp: string;
  userId?: string;
}

export default function AdminChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Setup SSE connection for admin
  useEffect(() => {
    const setupConnection = () => {
      const eventSource = new EventSource(`/api/chat/stream?userId=admin&role=admin`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('Admin chat connection opened');
      };

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connection') {
          console.log('Admin chat connection established:', data.message);
          return;
        }

        // Add new message to the list
        setMessages(prev => {
          // Avoid duplicates by checking message ID
          if (prev.some(msg => msg.id === data.id)) {
            return prev;
          }
          
          // Also check if this is a duplicate of an optimistic message
          // If we find a temp message with the same content from the same user, replace it
          const existingTempIndex = prev.findIndex(msg => 
            msg.id.startsWith('temp-') && 
            msg.text === data.text && 
            msg.role === data.role &&
            ((msg.userId && data.userId && msg.userId === data.userId) || (!msg.userId && !data.userId)) &&
            Math.abs(new Date(msg.timestamp).getTime() - new Date(data.timestamp).getTime()) < 10000 // within 10 seconds
          );
          
          if (existingTempIndex !== -1) {
            // Replace the temporary message with the real one
            const newMessages = [...prev];
            newMessages[existingTempIndex] = data;
            return newMessages;
          }
          
          return [...prev, data];
        });
      };

      eventSource.onerror = (error) => {
        console.error('Admin chat connection error:', error);
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            setupConnection();
          }
        }, 3000);
      };

      // EventSource doesn't have onclose event
      // Connection cleanup is handled in the useEffect cleanup function
    };

    setupConnection();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const sendMessage = async (targetUserId?: string) => {
    if (!text.trim() || isLoading) return;

    const messageText = text.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    // Optimistic update: Add message immediately to UI
    const optimisticMessage: Message = {
      id: tempId,
      from: "Support Team",
      role: 'admin',
      text: messageText,
      timestamp: new Date().toISOString(),
      userId: targetUserId, // undefined for broadcast, specific userId for private
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setText("");
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({
          from: "Support Team",
          role: "admin",
          targetUserId: targetUserId, // undefined means broadcast to all users
          text: messageText,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      // Server response successful - the real message will come via SSE
      // and will replace the optimistic message automatically
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setText(messageText); // Restore text for retry
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendBroadcast = () => sendMessage(); // No target = broadcast
  const sendToUser = () => sendMessage(selectedUserId);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === "broadcast") {
        sendBroadcast();
      } else if (selectedUserId) {
        sendToUser();
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get unique users from messages for the user selector
  const getUniqueUsers = (): string[] => {
    const users = new Set<string>();
    messages.forEach(msg => {
      if (msg.role === 'user' && msg.userId) {
        users.add(msg.userId);
      }
    });
    return Array.from(users);
  };

  // Filter messages based on selected tab and user
  const getFilteredMessages = () => {
    if (activeTab === "all") {
      return messages;
    } else if (activeTab === "broadcast") {
      return messages.filter(msg => 
        msg.role === 'admin' && !msg.userId // Broadcast messages
      );
    } else if (selectedUserId) {
      return messages.filter(msg => 
        msg.userId === selectedUserId || // Messages from specific user
        (msg.role === 'admin' && msg.userId === selectedUserId) // Messages to specific user
      );
    }
    return [];
  };

  const uniqueUsers = getUniqueUsers();
  const filteredMessages = getFilteredMessages();

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Admin Chat Dashboard
          <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start rounded-none border-b flex-shrink-0">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              All Messages
            </TabsTrigger>
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              Broadcast
            </TabsTrigger>
            {uniqueUsers.length > 0 && (
              <select 
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setActiveTab("user");
                }}
                className="ml-2 px-3 py-1 border rounded-md text-sm"
              >
                <option value="">Select User</option>
                {uniqueUsers.map(userId => (
                  <option key={userId} value={userId}>
                    User: {userId}
                  </option>
                ))}
              </select>
            )}
          </TabsList>

          <TabsContent value="all" className="flex-1 flex flex-col m-0 min-h-0">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {filteredMessages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No messages yet.</p>
                    </div>
                  ) : (
                  filteredMessages.map((message, index) => {
                    const isAdmin = message.role === 'admin';
                    
                    return (
                      <div
                        key={`${message.id}-${index}`}
                        className={`flex items-start gap-3 ${
                          isAdmin ? 'flex-row-reverse' : ''
                        }`}
                      >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isAdmin 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isAdmin ? (
                              <Shield className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          
                          <div className={`max-w-xs lg:max-w-md ${
                            isAdmin ? 'text-right' : 'text-left'
                          }`}>
                            <div className={`rounded-lg px-4 py-2 ${
                              isAdmin
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {isAdmin ? 'You' : `${message.from} (${message.userId})`} • {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="broadcast" className="flex-1 flex flex-col m-0 min-h-0">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Broadcast Mode:</strong> Messages sent here will be delivered to all connected users.
                    </p>
                  </div>
                  {filteredMessages.map((message, index) => (
                    <div key={`${message.id}-${index}`} className="flex items-start gap-3 flex-row-reverse">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-yellow-100 text-yellow-600">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div className="max-w-xs lg:max-w-md text-right">
                        <div className="rounded-lg px-4 py-2 bg-yellow-500 text-white">
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Broadcast • {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="user" className="flex-1 flex flex-col m-0 min-h-0">
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {selectedUserId ? (
                    <>
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Private Chat with User:</strong> {selectedUserId}
                        </p>
                      </div>
                      {filteredMessages.map((message, index) => {
                        const isAdmin = message.role === 'admin';
                        return (
                          <div
                            key={`${message.id}-${index}`}
                            className={`flex items-start gap-3 ${
                              isAdmin ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isAdmin 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {isAdmin ? (
                                <Shield className="w-4 h-4" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            <div className={`max-w-xs lg:max-w-md ${
                              isAdmin ? 'text-right' : 'text-left'
                            }`}>
                              <div className={`rounded-lg px-4 py-2 ${
                                isAdmin
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                <p className="text-sm">{message.text}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {isAdmin ? 'You' : message.from} • {formatTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a user to view private conversation.</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeTab === "broadcast" 
                  ? "Type broadcast message..." 
                  : selectedUserId
                    ? `Type private message to ${selectedUserId}...`
                    : "Select a user or broadcast mode..."
              }
              disabled={!isConnected || isLoading || (activeTab === "user" && !selectedUserId)}
              className="flex-1"
            />
            <Button
              onClick={activeTab === "broadcast" ? sendBroadcast : sendToUser}
              disabled={!text.trim() || !isConnected || isLoading || (activeTab === "user" && !selectedUserId)}
              size="icon"
            >
              {activeTab === "broadcast" ? (
                <Radio className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-red-600 mt-2">
              Connection lost. Attempting to reconnect...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}