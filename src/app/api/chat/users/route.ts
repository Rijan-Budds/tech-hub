import { chatStore } from '@/lib/chatStore';

export async function GET() {
  try {
    const activeUsers = chatStore.getActiveUsers();
    const activeUsersCount = chatStore.getActiveUsersCount();
    
    return new Response(JSON.stringify({
      users: activeUsers,
      count: activeUsersCount,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting active users:', error);
    return new Response(JSON.stringify({ error: 'Failed to get active users' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}