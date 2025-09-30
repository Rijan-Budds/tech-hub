
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Helper to safely convert Firestore Timestamp to Date
const safeTimestampToDate = (timestamp: Timestamp | null | undefined): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  // Fallback for server-side timestamps that are not yet populated
  return new Date();
};
import { COLLECTIONS, IChat, IMessage } from "./firebase-models";

// Service for chat-related Firestore operations
export const chatService = {
  // Get or create a chat session for a user
  async getOrCreateChat(userId: string, userName: string): Promise<string> {
    const chatsRef = collection(db, COLLECTIONS.CHATS);
    const q = query(chatsRef, where("userId", "==", userId));
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Chat already exists, return its ID
      return querySnapshot.docs[0].id;
    } else {
      // Create a new chat session
      const newChatRef = await addDoc(chatsRef, {
        userId,
        userName,
        lastMessage: "Chat started",
        lastMessageAt: serverTimestamp(),
        isRead: false,
      });
      return newChatRef.id;
    }
  },

  // Add a message to a chat
  async addMessage(chatId: string, messageData: Omit<IMessage, "id" | "chatId" | "timestamp">): Promise<string> {
    const messagesRef = collection(db, COLLECTIONS.CHATS, chatId, "messages");
    
    const message = {
      ...messageData,
      timestamp: serverTimestamp(),
    };

    const messageRef = await addDoc(messagesRef, message);
    
    // Update the parent chat document with the last message info
    const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
    await updateDoc(chatRef, {
      lastMessage: message.text,
      lastMessageAt: message.timestamp,
      isRead: message.role === 'admin', // Mark as read if admin sends a message
    });
    
    return messageRef.id;
  },

  // Listen for real-time updates to the chat list (for admin)
  listenForChats(callback: (chats: IChat[]) => void): () => void {
    const chatsRef = collection(db, COLLECTIONS.CHATS);
    const q = query(chatsRef, orderBy("lastMessageAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chats: IChat[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        chats.push({
          id: doc.id,
          ...data,
          lastMessageAt: safeTimestampToDate(data.lastMessageAt),
        } as IChat);
      });
      callback(chats);
    });
    
    return unsubscribe;
  },

  // Listen for real-time messages in a specific chat
  listenForMessages(chatId: string, callback: (messages: IMessage[]) => void): () => void {
    const messagesRef = collection(db, COLLECTIONS.CHATS, chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages: IMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          chatId,
          ...data,
          timestamp: safeTimestampToDate(data.timestamp),
        } as IMessage);
      });
      callback(messages);
    });
    
    return unsubscribe;
  },

  // Mark a chat as read
  async markChatAsRead(chatId: string): Promise<void> {
    const chatRef = doc(db, COLLECTIONS.CHATS, chatId);
    await updateDoc(chatRef, { isRead: true });
  },
};
