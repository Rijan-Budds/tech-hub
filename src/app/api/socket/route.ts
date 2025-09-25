// app/api/socket/route.ts
import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: IOServer;

export const GET = async () => {
  // @ts-expect-error - Using global variable for WebSocket server
  if (!global.io) {
    const httpServer = new HTTPServer();
    io = new IOServer(httpServer, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);

      socket.on("join", ({ userId, role }) => {
        if (role === "buyer") socket.join(`room-${userId}`);
        else if (role === "admin") socket.join("admin");
      });

      socket.on("message", ({ toUserId, message }) => {
        const role = socket.data.role;
        if (role === "buyer") io.to("admin").emit("message", { from: socket.data.userId, message });
        else io.to(`room-${toUserId}`).emit("message", { from: "admin", message });
      });

      socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
    });

    // @ts-expect-error - Using global variable to persist socket server
    global.io = io;
  }

  return new Response(JSON.stringify({ status: "ok" }));
};
