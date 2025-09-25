"use client";
import { useEffect, useState, useRef } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, User, Shield } from "lucide-react";

interface Message {
  id: string;
  from: string;
  role: 'user' | 'admin';
  text: string;
  timestamp: string;
  userId?: string;
}

export default function ChatPage() {
  const { user, loadProfile } = useProfileStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load profile if not already loaded
  useEffect(() => {
    if (!user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  // Setup SSE connection
  useEffect(() => {
    if (!user?.id) return;

    const setupConnection = () => {
      const eventSource = new EventSource(`/api/chat/stream?userId=${user.id}&role=user`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('Chat connection opened');
      };

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'connection') {
          console.log('Chat connection established:', data.message);
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
            msg.userId === data.userId &&
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
        console.error('Chat connection error:', error);
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
  }, [user?.id]);

  const sendMessage = async () => {
    if (!text.trim() || !user?.id || isLoading) return;

    const messageText = text.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    // Optimistic update: Add message immediately to UI
    const optimisticMessage: Message = {
      id: tempId,
      from: user.username || user.email,
      role: 'user',
      text: messageText,
      timestamp: new Date().toISOString(),
      userId: user.id,
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setText("");
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({
          from: user.username || user.email,
          role: "user",
          userId: user.id,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Show loading state while user data is being fetched
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">Loading chat...</p>
              <p className="text-sm text-gray-600 mt-2">Please wait while we set up your chat session.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Customer Support Chat
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
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isCurrentUser = message.role === 'user' && message.userId === user.id;
                    const isAdmin = message.role === 'admin';
                    
                    return (
                      <div
                        key={`${message.id}-${index}`}
                        className={`flex items-start gap-3 ${
                          isCurrentUser ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isAdmin 
                            ? 'bg-blue-100 text-blue-600' 
                            : isCurrentUser 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                        }`}>
                          {isAdmin ? (
                            <Shield className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        
                        <div className={`max-w-xs lg:max-w-md ${
                          isCurrentUser ? 'text-right' : 'text-left'
                        }`}>
                          <div className={`rounded-lg px-4 py-2 ${
                            isAdmin
                              ? 'bg-blue-500 text-white'
                              : isCurrentUser
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isAdmin ? 'Support' : message.from} • {formatTime(message.timestamp)}
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
          
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected || isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!text.trim() || !isConnected || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
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
    </div>
  );
}
