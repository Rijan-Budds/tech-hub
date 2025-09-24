"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  FaComments,
  FaUser,
  FaUserShield,
  FaPaperPlane,
  FaSpinner,
  FaEnvelope,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import { useChatStore } from "@/store/useChatStore";
import { IChatConversation, IChatMessage, timestampToDate } from "@/lib/firebase-models";
import { toast } from "sonner";

interface AdminChatSectionProps {
  onClose?: () => void;
}

export default function AdminChatSection({ onClose }: AdminChatSectionProps) {
  const {
    conversations,
    messages,
    activeConversationId,
    loadingConversations,
    loadingMessages,
    unreadCount,
    setCurrentUser,
    setActiveConversation,
    loadConversations,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    subscribeToConversations,
    subscribeToMessages,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<IChatConversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const unsubscribeConversationsRef = useRef<(() => void) | null>(null);
  const unsubscribeMessagesRef = useRef<(() => void) | null>(null);

  // Initialize admin chat
  useEffect(() => {
    // Set admin user
    setCurrentUser("admin", "Admin", "admin@techub.com", true);
    console.log('Admin chat initializing - loading conversations');
    loadConversations();
    
    // Subscribe to real-time conversation updates
    console.log('Admin chat subscribing to conversations');
    unsubscribeConversationsRef.current = subscribeToConversations();

    return () => {
      if (unsubscribeConversationsRef.current) {
        unsubscribeConversationsRef.current();
      }
      if (unsubscribeMessagesRef.current) {
        unsubscribeMessagesRef.current();
      }
    };
  }, [loadConversations, setCurrentUser, subscribeToConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = async (conversation: IChatConversation) => {
    console.log('Admin selecting conversation:', conversation);
    setSelectedConversation(conversation);
    setActiveConversation(conversation.id!);

    if (unsubscribeMessagesRef.current) {
      console.log('Unsubscribing from previous messages');
      unsubscribeMessagesRef.current();
    }

    console.log('Loading messages for conversation:', conversation.id);
    await loadMessages(conversation.id!);
    console.log('Marking messages as read for conversation:', conversation.id);
    await markMessagesAsRead(conversation.id!);
    console.log('Subscribing to messages for conversation:', conversation.id);
    unsubscribeMessagesRef.current = subscribeToMessages(conversation.id!);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId || sending) return;

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

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaComments className="text-xl" />
              <div>
                <h3 className="font-bold text-lg">Customer Chats</h3>
                <p className="text-sm text-blue-100">
                  {unreadCount > 0 ? `${unreadCount} unread messages` : "All caught up!"}
                </p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center h-32">
              <FaSpinner className="animate-spin mr-2" />
              <span>Loading conversations...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center p-4">
              <div>
                <FaComments className="text-2xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No conversations yet</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conversation, index) => (
                <button
                  key={conversation.id || `conversation-${index}`}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-600" />
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 truncate">{conversation.userName}</h4>
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessageAt
                            ? formatTime(timestampToDate(conversation.lastMessageAt))
                            : formatTime(timestampToDate(conversation.createdAt))}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FaEnvelope className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-600 truncate">{conversation.userEmail}</span>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <FaUser className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedConversation.userName}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FaEnvelope className="text-xs" />
                    <span>{selectedConversation.userEmail}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedConversation(null);
                    setActiveConversation(null);
                    if (unsubscribeMessagesRef.current) {
                      unsubscribeMessagesRef.current();
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FaArrowLeft />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <FaSpinner className="animate-spin mr-2" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <FaComments className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No messages yet</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message: IChatMessage, index) => (
                    <div
                      key={message.id || `admin-message-${index}`}
                      className={`flex ${message.senderRole === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.senderRole === "admin"
                            ? "bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {message.senderRole === "admin" ? (
                            <FaUserShield className="text-xs" />
                          ) : (
                            <FaUser className="text-xs" />
                          )}
                          <span className="text-xs font-medium">
                            {message.senderRole === "admin" ? "You" : selectedConversation.userName}
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
                          {message.senderRole === "admin" && (
                            <span className="text-xs opacity-70">{message.isRead ? "Read" : "Sent"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Reply to ${selectedConversation.userName}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition-all duration-200"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sending}
                  className="px-4 py-2 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl font-medium hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <FaComments className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Conversation</h3>
              <p className="text-gray-600">Choose a customer conversation from the sidebar to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}