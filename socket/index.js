const { Server } = require("socket.io");
const { socketAuthMiddleware } = require("./middleware");
const registerChatHandlers = require("./handler/chat");        // ✅ fixed path naming
const registerGroupHandlers = require("./handler/groupChat");  // ✅ consistent plural
const registerPersonalHandlers = require("./handler/personalChat");

let ioInstance = null;

function setupSocketIO(server) {
  // ✅ Whitelisted frontend origins
  const allowedOrigins = [
    "http://localhost:5173",                // Local dev (Vite)
    "https://chatapp1101.netlify.app",      // Production frontend
  ];

  // ✅ Initialize socket.io server with CORS handling
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow server-side / Postman requests
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.warn(`🚫 CORS blocked socket connection from: ${origin}`);
          callback(new Error("CORS not allowed"), false);
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000, // prevent disconnection on slow networks
  });

  // ✅ Authentication middleware (JWT validation)
  io.use(socketAuthMiddleware);

  // ✅ Connection event
  io.on("connection", (socket) => {
    console.log(`🟢 Socket connected: ${socket.id} | User: ${socket.user?.id}`);

    // Register all your chat feature modules
    registerChatHandlers(io, socket);       // Global chat
    registerGroupHandlers(io, socket);      // Group chat
    registerPersonalHandlers(io, socket);   // Private chat

    // Optional: Join a default global room
    socket.join("global-room");

    // ✅ Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`🔴 Socket disconnected: ${socket.id} | Reason: ${reason}`);
    });
  });

  // Save io instance globally
  ioInstance = io;
  return io;
}

// Helper to safely get io anywhere in app (e.g. media upload route)
function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized yet");
  return ioInstance;
}

module.exports = { setupSocketIO, getIO };
