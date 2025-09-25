import { NextRequest } from 'next/server';
import { chatStore } from '@/lib/chatStore';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const role = searchParams.get('role') as 'user' | 'admin';

  if (!userId || !role) {
    return new Response('Missing userId or role', { status: 400 });
  }

  // Create a unique connection ID
  const connectionId = `${role}_${userId}_${Date.now()}`;

  const stream = new ReadableStream({
    start(controller) {
      // Add connection to store
      chatStore.addConnection(connectionId, {
        response: new Response(),
        controller,
        userId,
        role,
      });

      // Send initial connection confirmation
      controller.enqueue(`data: ${JSON.stringify({ 
        type: 'connection', 
        message: 'Connected to chat',
        connectionId 
      })}\n\n`);

      // Send existing messages for this user/admin
      const existingMessages = chatStore.getMessages(userId, role);
      existingMessages.forEach(message => {
        const data = JSON.stringify({
          id: message.id,
          from: message.from,
          role: message.role,
          text: message.text,
          timestamp: message.timestamp.toISOString(),
          userId: message.userId,
        });
        controller.enqueue(`data: ${data}\n\n`);
      });
    },
    cancel() {
      // Clean up connection when client disconnects
      chatStore.removeConnection(connectionId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}
