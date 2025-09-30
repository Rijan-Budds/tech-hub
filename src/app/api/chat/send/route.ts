import { NextRequest } from 'next/server';
import { chatService } from '@/lib/chat-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, role, userId, text, userName } = body;

    if (!from || !role || !text || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: from, role, text, userId' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get or create chat session
    const chatName = userName || from;
    const chatId = await chatService.getOrCreateChat(userId, chatName);

    // Add message to the chat
    const messageId = await chatService.addMessage(chatId, {
      from,
      role: role as 'user' | 'admin',
      text,
    });

    return new Response(JSON.stringify({ 
      status: 'success', 
      message: 'Message sent successfully',
      chatId,
      messageId,
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