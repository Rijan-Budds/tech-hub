import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

// Middleware for API routes that require authentication
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "dev-secret-change-me",
    );

    const { payload } = await jwtVerify(token, secret);

    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = {
      id: payload.sub as string,
      email: payload.email as string,
      username: payload.username as string,
      role: (payload.role as string) || "user",
    };

    return handler(authenticatedRequest);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// Middleware for API routes that require admin access
export async function withAdminAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  return withAuth(request, async (authenticatedRequest) => {
    if (authenticatedRequest.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    return handler(authenticatedRequest);
  });
}

// Middleware for optional authentication (user can be null)
export async function withOptionalAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (token) {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "dev-secret-change-me",
      );

      const { payload } = await jwtVerify(token, secret);

      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: payload.sub as string,
        email: payload.email as string,
        username: payload.username as string,
        role: (payload.role as string) || "user",
      };
    }

    return handler(request as AuthenticatedRequest);
  } catch {
    // If token is invalid, continue without user
    return handler(request as AuthenticatedRequest);
  }
}
