import { NextRequest } from 'next/server';
import { chatStore } from '@/lib/chatStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, role, userId, text, targetUserId } = body;

    if (!from || !role || !text) {
      return new Response(JSON.stringify({ error: 'Missing required fields: from, role, text' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // For user messages, userId is required
    if (role === 'user' && !userId) {
      return new Response(JSON.stringify({ error: 'userId is required for user messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Add message to store (this will automatically broadcast to relevant connections)
    const message = chatStore.addMessage({
      from,
      role: role as 'user' | 'admin',
      userId: role === 'user' ? userId : targetUserId, // For admin messages, targetUserId specifies recipient
      text,
    });

    return new Response(JSON.stringify({ 
      status: 'success', 
      message: 'Message sent successfully',
      messageId: message.id,
      timestamp: message.timestamp
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
