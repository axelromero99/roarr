import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handler(req, res, parsedUrl);
  });

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : [`http://localhost:${port}`];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  // Track online users
  const onlineUsers = new Map<string, string>();

  io.on("connection", (socket) => {
    socket.on("register", (userId: string) => {
      onlineUsers.set(socket.id, userId);
      socket.join(`user:${userId}`);
    });

    socket.on("join-chat", (matchId: string) => {
      socket.join(`chat:${matchId}`);
    });

    socket.on("leave-chat", (matchId: string) => {
      socket.leave(`chat:${matchId}`);
    });

    socket.on("send-message", (data: { matchId: string; message: unknown }) => {
      socket.to(`chat:${data.matchId}`).emit("new-message", data.message);
    });

    socket.on("typing", (data: { matchId: string; userId: string }) => {
      socket.to(`chat:${data.matchId}`).emit("user-typing", data.userId);
    });

    socket.on("stop-typing", (data: { matchId: string; userId: string }) => {
      socket.to(`chat:${data.matchId}`).emit("user-stop-typing", data.userId);
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Roarr running on http://${hostname}:${port} (${dev ? "development" : "production"})`);
  });
});
