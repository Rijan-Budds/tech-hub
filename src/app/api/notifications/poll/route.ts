import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { getPendingRequests, getUserNotifications } from "@/lib/notification-helpers";

export async function GET(req: Request): Promise<Response> {
  try {
    const auth = await getAuth();
    if (!auth) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = auth.sub;
    const url = new URL(req.url);
    const lastEventId = url.searchParams.get('lastEventId');
    const timeout = parseInt(url.searchParams.get('timeout') || '30000'); // 30 seconds default

    console.log(`[LongPolling] New poll request from user ${userId}, lastEventId: ${lastEventId}`);

    const userNotifications = getUserNotifications();
    const pendingRequests = getPendingRequests();

    // Check if there are already pending notifications
    const existingNotifications = userNotifications.get(userId);
    if (existingNotifications && existingNotifications.length > 0) {
      console.log(`[LongPolling] Returning ${existingNotifications.length} existing notifications for user ${userId}`);
      userNotifications.delete(userId); // Clear after returning
      return NextResponse.json({
        notifications: existingNotifications,
        timestamp: new Date().toISOString()
      });
    }

    // Set up long polling
    return new Promise<Response>((resolve) => {
      const timeoutId = setTimeout(() => {
        console.log(`[LongPolling] Timeout reached for user ${userId}, returning empty response`);
        
        // Remove from pending requests
        const pending = pendingRequests.get(userId);
        if (pending) {
          const filtered = pending.filter(p => p.timeout !== timeoutId);
          if (filtered.length > 0) {
            pendingRequests.set(userId, filtered);
          } else {
            pendingRequests.delete(userId);
          }
        }
        
        resolve(NextResponse.json({
          notifications: [],
          timestamp: new Date().toISOString()
        }) as Response);
      }, timeout);

      // Add to pending requests
      if (!pendingRequests.has(userId)) {
        pendingRequests.set(userId, []);
      }
      pendingRequests.get(userId)!.push({
        resolve: (notifications: unknown[]) => {
          resolve(NextResponse.json({
            notifications,
            timestamp: new Date().toISOString()
          }) as Response);
        },
        timeout: timeoutId
      });

      console.log(`[LongPolling] Set up long polling for user ${userId}, timeout in ${timeout}ms`);
    });

  } catch (error) {
    console.error("[LongPolling] Error in poll endpoint:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
