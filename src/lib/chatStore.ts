interface Message {
  id: string;
  from: string;
  role: 'user' | 'admin';
  userId?: string; // undefined for admin messages (broadcasts)
  text: string;
  timestamp: Date;
}

interface SSEConnection {
  response: Response;
  controller: ReadableStreamDefaultController;
  userId: string;
  role: 'user' | 'admin';
}

class ChatStore {
  private messages: Message[] = [];
  private connections: Map<string, SSEConnection> = new Map();

  // Add a new message
  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    this.messages.push(newMessage);
    this.broadcastMessage(newMessage);
    return newMessage;
  }

  // Get messages for a specific user or admin
  getMessages(userId?: string, role?: 'user' | 'admin'): Message[] {
    if (role === 'admin') {
      // Admin sees all messages
      return this.messages;
    } else if (userId) {
      // User sees only their messages and admin broadcasts
      return this.messages.filter(
        msg => msg.userId === userId || (msg.role === 'admin' && !msg.userId)
      );
    }
    return [];
  }

  // Add SSE connection
  addConnection(connectionId: string, connection: SSEConnection) {
    this.connections.set(connectionId, connection);
  }

  // Remove SSE connection
  removeConnection(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      try {
        connection.controller.close();
      } catch (error) {
        console.log('Connection already closed');
      }
      this.connections.delete(connectionId);
    }
  }

  // Broadcast message to relevant connections
  private broadcastMessage(message: Message) {
    const connectionsToRemove: string[] = [];

    this.connections.forEach((connection, connectionId) => {
      try {
        // Determine if this connection should receive the message
        const shouldReceive = this.shouldReceiveMessage(connection, message);

        if (shouldReceive) {
          const data = JSON.stringify({
            id: message.id,
            from: message.from,
            role: message.role,
            text: message.text,
            timestamp: message.timestamp.toISOString(),
            userId: message.userId,
          });

          connection.controller.enqueue(`data: ${data}\n\n`);
        }
      } catch (error) {
        console.log(`Failed to send message to connection ${connectionId}:`, error);
        connectionsToRemove.push(connectionId);
      }
    });

    // Clean up failed connections
    connectionsToRemove.forEach(connectionId => {
      this.removeConnection(connectionId);
    });
  }

  // Determine if a connection should receive a message
  private shouldReceiveMessage(connection: SSEConnection, message: Message): boolean {
    if (connection.role === 'admin') {
      // Admin receives all messages
      return true;
    } else if (connection.role === 'user') {
      // User receives:
      // 1. Their own messages
      // 2. Admin broadcasts (messages without specific userId)
      // 3. Admin messages directed to them
      return (
        message.userId === connection.userId || 
        (message.role === 'admin' && !message.userId) ||
        (message.role === 'admin' && message.userId === connection.userId)
      );
    }
    return false;
  }

  // Get active users count
  getActiveUsersCount(): number {
    const activeUsers = new Set();
    this.connections.forEach((connection) => {
      if (connection.role === 'user') {
        activeUsers.add(connection.userId);
      }
    });
    return activeUsers.size;
  }

  // Get list of active users for admin
  getActiveUsers(): { userId: string; connectionId: string }[] {
    const users: { userId: string; connectionId: string }[] = [];
    this.connections.forEach((connection, connectionId) => {
      if (connection.role === 'user') {
        users.push({ userId: connection.userId, connectionId });
      }
    });
    return users;
  }
}

// Export singleton instance
export const chatStore = new ChatStore();