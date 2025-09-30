"use client";
import { useEffect, useState, useRef } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, User, Shield } from "lucide-react";
import { chatService } from "@/lib/chat-service";
import { IMessage } from "@/lib/firebase-models";
import { Timestamp } from "firebase/firestore";

export default function ChatPage() {
  const { user, loadProfile } = useProfileStore();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load profile
  useEffect(() => {
    if (!user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  // Get or create chat session
  useEffect(() => {
    if (!user?.id) return;

    const initChat = async () => {
      const id = await chatService.getOrCreateChat(user.id, user.username || user.email);
      setChatId(id);
    };

    initChat();
  }, [user?.id, user?.username, user?.email]);

  // Listen for messages
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = chatService.listenForMessages(chatId, setMessages);
    return () => unsubscribe();
  }, [chatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!text.trim() || !chatId || !user || isLoading) return;

    const messageText = text.trim();
    setText("");
    setIsLoading(true);

    try {
      await chatService.addMessage(chatId, {
        from: user.username || user.email,
        role: "user",
        text: messageText,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setText(messageText); // Restore text for retry
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Timestamp | Date) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) {
    return <div>Loading...</div>; // Or a more sophisticated loading state
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Customer Support Chat
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'admin' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {message.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-xs lg:max-w-md ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`rounded-lg px-4 py-2 ${
                    message.role === 'admin'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-blue-500 text-white'
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.from} • {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={!chatId || isLoading}
            />
            <Button onClick={handleSendMessage} disabled={!text.trim() || !chatId || isLoading}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}