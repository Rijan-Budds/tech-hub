import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  IChatConversation, 
  IChatMessage, 
  COLLECTIONS, 
  timestampToDate 
} from "./firebase-models";


export class ChatService {
  // Conversation methods
  async createOrGetConversation(
    userId: string, 
    userName: string, 
    userEmail: string
  ): Promise<IChatConversation | null> {
    try {
      console.log('Creating/getting conversation for user:', { userId, userName, userEmail });
      // First, check if conversation already exists
      const conversationsRef = collection(db, COLLECTIONS.CHAT_CONVERSATIONS);
      const q = query(conversationsRef, where("userId", "==", userId));
      const existingDocs = await getDocs(q);
      
      if (!existingDocs.empty) {
        const doc = existingDocs.docs[0];
        const conversation = {
          id: doc.id,
          ...doc.data(),
          createdAt: timestampToDate(doc.data().createdAt),
          updatedAt: timestampToDate(doc.data().updatedAt),
          lastMessageAt: doc.data().lastMessageAt ? timestampToDate(doc.data().lastMessageAt) : undefined,
        } as IChatConversation;
        console.log('Found existing conversation:', conversation);
        return conversation;
      }
      
      // Create new conversation
      const newConversation: Omit<IChatConversation, "id"> = {
        userId,
        userName,
        userEmail,
        status: "active",
        unreadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(conversationsRef, newConversation);
      console.log('Created new conversation with ID:', docRef.id);
      
      const createdConversation = {
        id: docRef.id,
        ...newConversation,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IChatConversation;
      console.log('New conversation created:', createdConversation);
      return createdConversation;
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }
  
  async getAllConversations(): Promise<IChatConversation[]> {
    console.log('Getting all conversations from Firebase');
    try {
      const conversationsRef = collection(db, COLLECTIONS.CHAT_CONVERSATIONS);
      const q = query(conversationsRef, orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.docs.length, 'conversations in Firebase');
      
      const conversations = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing conversation doc:', doc.id, data);
        return {
          id: doc.id,
          ...data,
          createdAt: timestampToDate(data.createdAt),
          updatedAt: timestampToDate(data.updatedAt),
          lastMessageAt: data.lastMessageAt ? timestampToDate(data.lastMessageAt) : undefined,
        };
      }) as IChatConversation[];
      
      console.log('Processed conversations:', conversations);
      return conversations;
    } catch (error) {
      console.error("Error getting conversations:", error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return [];
    }
  }
  
  async getConversationById(conversationId: string): Promise<IChatConversation | null> {
    try {
      const docRef = doc(db, COLLECTIONS.CHAT_CONVERSATIONS, conversationId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
        lastMessageAt: data.lastMessageAt ? timestampToDate(data.lastMessageAt) : undefined,
      } as IChatConversation;
    } catch (error) {
      console.error("Error getting conversation:", error);
      return null;
    }
  }
  
  // Message methods
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: "customer" | "admin",
    message: string,
    messageType: "text" | "image" | "file" = "text"
  ): Promise<IChatMessage | null> {
    try {
      console.log('Sending message:', { conversationId, senderId, senderName, senderRole, message });
      const newMessage: Omit<IChatMessage, "id"> = {
        conversationId,
        senderId,
        senderName,
        senderRole,
        message,
        messageType,
        isRead: false,
        createdAt: serverTimestamp(),
      };
      
      const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
      const docRef = await addDoc(messagesRef, newMessage);
      console.log('Message saved to Firebase with ID:', docRef.id);
      
      // Update conversation with last message info
      await this.updateConversationLastMessage(conversationId, message, senderRole);
      console.log('Updated conversation last message');
      
      // TODO: Add notification trigger for chat messages
      // This would need to be implemented in a separate API endpoint
      // to avoid server/client component conflicts
      
      const sentMessage = {
        id: docRef.id,
        ...newMessage,
        createdAt: new Date(),
      } as IChatMessage;
      console.log('Message sent successfully:', sentMessage);
      return sentMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  }
  
  async getMessages(conversationId: string, limitCount: number = 50): Promise<IChatMessage[]> {
    console.log('Getting messages for conversation:', conversationId);
    try {
      const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
      const q = query(
        messagesRef,
        where("conversationId", "==", conversationId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.docs.length, 'messages in Firebase for conversation:', conversationId);
      
      return snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: timestampToDate(doc.data().createdAt),
          updatedAt: doc.data().updatedAt ? timestampToDate(doc.data().updatedAt) : undefined,
        }))
        .reverse() as IChatMessage[]; // Reverse to show oldest first
    } catch (error) {
      console.error("Error getting messages:", error);
      return [];
    }
  }
  
  async markMessagesAsRead(conversationId: string, role: "customer" | "admin"): Promise<void> {
    try {
      const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
      const q = query(
        messagesRef,
        where("conversationId", "==", conversationId),
        where("isRead", "==", false),
        where("senderRole", "!=", role) // Mark messages from the other role as read
      );
      
      const snapshot = await getDocs(q);
      
      const updatePromises = snapshot.docs.map(messageDoc => 
        updateDoc(messageDoc.ref, { 
          isRead: true,
          updatedAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
      
      // Update conversation unread count
      if (role === "admin") {
        await this.updateConversationUnreadCount(conversationId, 0);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }
  
  private async updateConversationLastMessage(
    conversationId: string, 
    lastMessage: string, 
    senderRole: "customer" | "admin"
  ): Promise<void> {
    try {
      const conversationRef = doc(db, COLLECTIONS.CHAT_CONVERSATIONS, conversationId);
      const updates: Record<string, unknown> = {
        lastMessage: lastMessage.length > 100 ? lastMessage.substring(0, 100) + "..." : lastMessage,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      // If customer sent message, increment unread count for admin
      if (senderRole === "customer") {
        const conversationSnap = await getDoc(conversationRef);
        if (conversationSnap.exists()) {
          const currentUnreadCount = conversationSnap.data().unreadCount || 0;
          updates.unreadCount = currentUnreadCount + 1;
        }
      }
      
      await updateDoc(conversationRef, updates);
    } catch (error) {
      console.error("Error updating conversation:", error);
    }
  }
  
  private async updateConversationUnreadCount(conversationId: string, count: number): Promise<void> {
    try {
      const conversationRef = doc(db, COLLECTIONS.CHAT_CONVERSATIONS, conversationId);
      await updateDoc(conversationRef, { 
        unreadCount: count,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating unread count:", error);
    }
  }
  
  // Real-time subscription methods
  subscribeToConversations(callback: (conversations: IChatConversation[]) => void) {
    console.log('Setting up conversation subscription');
    const conversationsRef = collection(db, COLLECTIONS.CHAT_CONVERSATIONS);
    const q = query(conversationsRef, orderBy("updatedAt", "desc"));
    
    return onSnapshot(q, (snapshot) => {
      console.log('Conversation subscription triggered, received', snapshot.docs.length, 'conversations');
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToDate(doc.data().createdAt),
        updatedAt: timestampToDate(doc.data().updatedAt),
        lastMessageAt: doc.data().lastMessageAt ? timestampToDate(doc.data().lastMessageAt) : undefined,
      })) as IChatConversation[];
      
      callback(conversations);
    });
  }
  
  subscribeToMessages(conversationId: string, callback: (messages: IChatMessage[]) => void) {
    console.log('Setting up message subscription for conversation:', conversationId);
    const messagesRef = collection(db, COLLECTIONS.CHAT_MESSAGES);
    const q = query(
      messagesRef,
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc")
    );
    
    return onSnapshot(q, (snapshot) => {
      console.log('Message subscription triggered for conversation:', conversationId, 'received', snapshot.docs.length, 'messages');
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToDate(doc.data().createdAt),
        updatedAt: doc.data().updatedAt ? timestampToDate(doc.data().updatedAt) : undefined,
      })) as IChatMessage[];
      
      callback(messages);
    });
  }
}

export const chatService = new ChatService();