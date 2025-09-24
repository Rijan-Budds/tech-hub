"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaUser,
  FaUserShield,
  FaCircle,
  FaSpinner
} from "react-icons/fa";
import { useChatStore } from "@/store/useChatStore";
import { IChatMessage, timestampToDate } from "@/lib/firebase-models";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ChatPage() {
  const [user, setUser] = useState<{id: string; username: string; email: string; role: string} | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const {
    messages,
    activeConversationId,
    loadingMessages,
    setCurrentUser,
    createOrGetConversation,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    subscribeToMessages,
  } = useChatStore();
  
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  
  // Load user authentication
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch('/api/me', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Initialize chat when user is available
  useEffect(() => {
    if (user) {
      setCurrentUser(user.id, user.username, user.email, false);
      
      // Create or get conversation for this user
      const initializeChat = async () => {
        // Try to restore existing conversation from localStorage
        const storedConversationId = localStorage.getItem(`chat_conversation_${user.id}`);
        
        const conversation = await createOrGetConversation(
          user.id,
          user.username,
          user.email
        );
        
        console.log('Stored conversation ID:', storedConversationId);
        console.log('Current conversation:', conversation);
        
        if (conversation?.id) {
          console.log('Initializing chat with conversation ID:', conversation.id);
          // Store conversation ID in localStorage for persistence
          localStorage.setItem(`chat_conversation_${user.id}`, conversation.id);
          
          await loadMessages(conversation.id);
          await markMessagesAsRead(conversation.id);
          
          // Subscribe to real-time messages
          unsubscribeRef.current = subscribeToMessages(conversation.id);
        }
      };
      
      initializeChat();
    }
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, setCurrentUser, createOrGetConversation, loadMessages, markMessagesAsRead, subscribeToMessages]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !activeConversationId || sending) {
      return;
    }
    
    setSending(true);
    
    try {
      const success = await sendMessage(activeConversationId, messageInput.trim());
      
      if (success) {
        setMessageInput("");
        messageInputRef.current?.focus();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as React.FormEvent);
    }
  };
  
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center mx-auto mb-6">
              <FaComments className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Chat with Support
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please log in to start a conversation with our support team.
            </p>
            <button
              onClick={() => window.location.href = '/profile'}
              className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-6 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all duration-200"
            >
              Log In
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Chat Header */}
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] rounded-full flex items-center justify-center">
                  <FaUserShield className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Support Chat
                  </h1>
                  <div className="flex items-center space-x-2">
                    <FaCircle className="text-green-500 text-xs" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Admin is online
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>
          
          {/* Messages Container */}
          <div className="bg-white dark:bg-gray-800 border-x border-gray-200 dark:border-gray-700 h-96 overflow-y-auto">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <FaSpinner className="animate-spin" />
                  <span>Loading messages...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FaComments className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Start a conversation with our support team!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    We&apos;re here to help with any questions you may have.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {messages.map((message: IChatMessage, index: number) => (
                  <div
                    key={message.id || `message-${index}`}
                    className={`flex ${
                      message.senderRole === "customer" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.senderRole === "customer"
                          ? "bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.senderRole === "admin" ? (
                          <FaUserShield className="text-xs" />
                        ) : (
                          <FaUser className="text-xs" />
                        )}
                        <span className="text-xs font-medium">
                          {message.senderRole === "admin" ? "Support" : "You"}
                        </span>
                      </div>
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-70">
                          {timestampToDate(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.senderRole === "customer" && (
                          <span className="text-xs opacity-70">
                            {message.isRead ? "Read" : "Sent"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Message Input */}
          <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sending}
                className="px-6 py-3 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
              >
                {sending ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
                <span className="hidden sm:inline">
                  {sending ? "Sending..." : "Send"}
                </span>
              </button>
            </form>
            
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              Our support team typically responds within a few minutes during business hours.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
