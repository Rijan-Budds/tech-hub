import { create } from "zustand";
import { IChatConversation, IChatMessage, timestampToDate } from "@/lib/firebase-models";
import { chatService } from "@/lib/chat-service";



interface ChatState {
  // Current user info
  currentUserId: string | null;
  currentUserName: string | null;
  currentUserEmail: string | null;
  isAdmin: boolean;
  
  // Conversations
  conversations: IChatConversation[];
  activeConversationId: string | null;
  loadingConversations: boolean;
  
  // Messages
  messages: IChatMessage[];
  loadingMessages: boolean;
  
  // UI state
  isChatOpen: boolean;
  unreadCount: number;
  
  // Typing indicators
  typingUsers: string[];
  
  // Actions
  setCurrentUser: (userId: string, userName: string, userEmail: string, isAdmin?: boolean) => void;
  setActiveConversation: (conversationId: string | null) => void;
  openChat: () => void;
  closeChat: () => void;
  
  // Conversation actions
  loadConversations: () => Promise<void>;
  createOrGetConversation: (userId: string, userName: string, userEmail: string) => Promise<IChatConversation | null>;
  
  // Message actions
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, message: string) => Promise<boolean>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToConversations: () => () => void;
  subscribeToMessages: (conversationId: string) => () => void;
  
  // Typing indicators
  setTyping: (conversationId: string, userId: string) => void;
  clearTyping: (conversationId: string, userId: string) => void;
  
  // Cleanup
  cleanup: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  currentUserId: null,
  currentUserName: null,
  currentUserEmail: null,
  isAdmin: false,
  
  conversations: [],
  activeConversationId: null,
  loadingConversations: false,
  
  messages: [],
  loadingMessages: false,
  
  isChatOpen: false,
  unreadCount: 0,
  
  typingUsers: [],
  
  // Actions
  setCurrentUser: (userId, userName, userEmail, isAdmin = false) => {
    set({
      currentUserId: userId,
      currentUserName: userName,
      currentUserEmail: userEmail,
      isAdmin,
    });
  },
  
  setActiveConversation: (conversationId) => {
    set({ 
      activeConversationId: conversationId,
      messages: [] // Clear messages when switching conversations
    });
  },
  
  openChat: () => {
    set({ isChatOpen: true });
  },
  
  closeChat: () => {
    set({ 
      isChatOpen: false,
      activeConversationId: null,
      messages: []
    });
  },
  
  // Conversation actions
  loadConversations: async () => {
    const { isAdmin } = get();
    console.log('Chat store loading conversations, isAdmin:', isAdmin);
    if (!isAdmin) {
      console.log('Not admin, skipping conversation loading');
      return; // Only admin loads all conversations
    }
    
    set({ loadingConversations: true });
    try {
      console.log('Fetching conversations from chat service');
      const conversations = await chatService.getAllConversations();
      console.log('Chat store loaded', conversations.length, 'conversations:', conversations);
      const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      console.log('Total unread messages:', totalUnread);
      set({ 
        conversations,
        unreadCount: totalUnread,
        loadingConversations: false
      });
    } catch (error) {
      console.error("Error loading conversations:", error);
      set({ loadingConversations: false });
    }
  },
  
  createOrGetConversation: async (userId, userName, userEmail) => {
    try {
      const conversation = await chatService.createOrGetConversation(userId, userName, userEmail);
      if (conversation) {
        // Add or update conversation in the list
        set(state => {
          const existingIndex = state.conversations.findIndex(c => c.id === conversation.id);
          const updatedConversations = [...state.conversations];
          
          if (existingIndex >= 0) {
            updatedConversations[existingIndex] = conversation;
          } else {
            updatedConversations.unshift(conversation);
          }
          
          return {
            conversations: updatedConversations,
            activeConversationId: conversation.id
          };
        });
      }
      return conversation;
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      return null;
    }
  },
  
  // Message actions
  loadMessages: async (conversationId) => {
    console.log('Chat store loading messages for conversation:', conversationId);
    set({ loadingMessages: true });
    try {
      const allMessages = await chatService.getMessages(conversationId);
      // Remove duplicates and sort by created time
      const uniqueMessages = allMessages
        .filter((message, index, self) => index === self.findIndex(m => m.id === message.id))
        .sort((a, b) => {
          const aTime = timestampToDate(a.createdAt).getTime();
          const bTime = timestampToDate(b.createdAt).getTime();
          return aTime - bTime;
        });
      console.log('Chat store loaded', uniqueMessages.length, 'unique messages (from', allMessages.length, 'total)');
      set({ 
        messages: uniqueMessages,
        loadingMessages: false
      });
    } catch (error) {
      console.error("Error loading messages:", error);
      set({ loadingMessages: false });
    }
  },
  
  sendMessage: async (conversationId, message) => {
    const { currentUserId, currentUserName, isAdmin } = get();
    
    console.log('Chat store sendMessage called:', { conversationId, message, currentUserId, currentUserName, isAdmin });
    
    if (!currentUserId || !currentUserName) {
      console.error("User not authenticated");
      return false;
    }
    
    try {
      const sentMessage = await chatService.sendMessage(
        conversationId,
        currentUserId,
        currentUserName,
        isAdmin ? "admin" : "customer",
        message
      );
      
      if (sentMessage) {
        // Add message to local state immediately for better UX (only if not already exists)
        set(state => {
          const messageExists = state.messages.some(msg => msg.id === sentMessage.id);
          if (!messageExists) {
            return {
              messages: [...state.messages, sentMessage]
            };
          }
          return state;
        });
        
        // Update conversation last message in local state
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === conversationId 
              ? { 
                  ...conv, 
                  lastMessage: message.length > 100 ? message.substring(0, 100) + "..." : message,
                  lastMessageAt: new Date(),
                  updatedAt: new Date()
                }
              : conv
          )
        }));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  },
  
  markMessagesAsRead: async (conversationId) => {
    const { isAdmin } = get();
    try {
      await chatService.markMessagesAsRead(conversationId, isAdmin ? "admin" : "customer");
      
      // Update local state
      set(state => ({
        messages: state.messages.map(msg => 
          msg.conversationId === conversationId && msg.senderRole !== (isAdmin ? "admin" : "customer")
            ? { ...msg, isRead: true }
            : msg
        ),
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: isAdmin ? 0 : conv.unreadCount }
            : conv
        )
      }));
      
      // Recalculate total unread count
      if (isAdmin) {
        const { conversations } = get();
        const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
        set({ unreadCount: totalUnread });
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },
  
  // Real-time subscriptions
  subscribeToConversations: () => {
    const { isAdmin } = get();
    console.log('Chat store subscribeToConversations called, isAdmin:', isAdmin);
    if (!isAdmin) {
      console.log('Not admin, skipping conversation subscription');
      return () => {}; // Only admin subscribes to all conversations
    }
    
    console.log('Admin subscribing to conversations');
    return chatService.subscribeToConversations((conversations) => {
      console.log('Chat store received conversations update:', conversations.length, 'conversations');
      // Remove duplicates based on conversation ID
      const uniqueConversations = conversations.filter((conversation, index, self) => 
        index === self.findIndex(c => c.id === conversation.id)
      );
      console.log('Setting unique conversations:', uniqueConversations.length, 'conversations');
      const totalUnread = uniqueConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      set({ 
        conversations: uniqueConversations,
        unreadCount: totalUnread
      });
    });
  },
  
  subscribeToMessages: (conversationId) => {
    console.log('Chat store subscribing to messages for conversation:', conversationId);
    return chatService.subscribeToMessages(conversationId, (messages) => {
      console.log('Chat store received messages update:', messages.length, 'messages');
      // Remove duplicates based on message ID and sort by created time
      const uniqueMessages = messages
        .filter((message, index, self) => index === self.findIndex(m => m.id === message.id))
        .sort((a, b) => {
          const aTime = timestampToDate(a.createdAt).getTime();
          const bTime = timestampToDate(b.createdAt).getTime();
          return aTime - bTime;
        });
      console.log('Setting', uniqueMessages.length, 'unique sorted messages (from', messages.length, 'total)');
      set({ messages: uniqueMessages });
    });
  },
  
  // Typing indicators
  setTyping: (conversationId, userId) => {
    set(state => ({
      typingUsers: [...state.typingUsers.filter(id => id !== userId), userId]
    }));
  },
  
  clearTyping: (conversationId, userId) => {
    set(state => ({
      typingUsers: state.typingUsers.filter(id => id !== userId)
    }));
  },
  
  // Cleanup
  cleanup: () => {
    set({
      conversations: [],
      activeConversationId: null,
      messages: [],
      isChatOpen: false,
      unreadCount: 0,
      typingUsers: [],
      loadingConversations: false,
      loadingMessages: false,
    });
  },
}));