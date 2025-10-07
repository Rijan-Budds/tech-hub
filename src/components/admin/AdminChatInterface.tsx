
"use client";
import { useEffect, useState, useRef } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, User, Shield } from "lucide-react";
import { chatService } from "@/lib/chat-service";
import { IChat, IMessage } from "@/lib/firebase-models";
import { Timestamp } from "firebase/firestore";

export default function AdminChatInterface() {
  const [chats, setChats] = useState<IChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for chat list updates
  useEffect(() => {
    const unsubscribe = chatService.listenForChats(setChats);
    return () => unsubscribe();
  }, []);

  // Listen for messages when a chat is selected
  useEffect(() => {
    if (!selectedChatId) return;

    const unsubscribe = chatService.listenForMessages(selectedChatId, setMessages);
    
    // Mark chat as read when it's opened
    chatService.markChatAsRead(selectedChatId);

    return () => unsubscribe();
  }, [selectedChatId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!text.trim() || !selectedChatId || isLoading) return;

    const messageText = text.trim();
    setText("");
    setIsLoading(true);

    try {
      const selectedChat = chats.find(c => c.id === selectedChatId);
      if (!selectedChat) throw new Error("Selected chat not found");

      await chatService.addMessage(selectedChatId, {
        from: "Admin",
        role: "admin",
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

  const formatTime = (timestamp: Timestamp | Date | string) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Sidebar with chat list */}
      <div className="w-1/4 border-r bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Active Chats
          </CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-80px)]">
          {chats.map(chat => (
            <div 
              key={chat.id}
              className={`p-4 cursor-pointer border-b ${
                selectedChatId === chat.id ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedChatId(chat.id!)}
            >
              <div className="font-semibold">{chat.userName}</div>
              <p className={`text-sm truncate ${
                !chat.isRead && selectedChatId !== chat.id ? 'font-bold text-black' : 'text-gray-500'
              }`}>
                {chat.lastMessage}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatTime(chat.lastMessageAt)}
              </p>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main chat window */}
      <div className="w-3/4 flex flex-col">
        {selectedChat ? (
          <>
            <CardHeader className="border-b">
              <CardTitle>Chat with {selectedChat.userName}</CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === 'admin' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'admin' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-xs lg:max-w-md ${
                      message.role === 'admin' ? 'text-right' : 'text-left'
                    }`}>
                      <div className={`rounded-lg px-4 py-2 ${
                        message.role === 'admin'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
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
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={!text.trim() || isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a chat to view messages.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
