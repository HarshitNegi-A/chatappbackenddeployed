// socket-io/index.js
const { Server } = require("socket.io");
const { socketAuthMiddleware } = require("./middleware");
const registerChatHandlers = require("./handler/chatSocket");
const registerGroupHandlers = require("./handler/groupChat");
const registerPersonalHandlers = require("./handler/personalChat");

let ioInstance = null;

function setupSocketIO(server) {
  // ✅ Define allowed origins (multi-environment)
  const allowedOrigins = [
    "http://localhost:5173",                      // local frontend (Vite)
    "https://chatapp1101.netlify.app",  // deployed frontend
  ];

  const io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (like Postman or server-side)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        } else {
          console.warn(`❌ CORS blocked for origin: ${origin}`);
          return callback(new Error("Not allowed by CORS"), false);
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ✅ Use authentication middleware (JWT or token check)
  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id, "User:", socket.user?.id);

    // ✅ Register your feature handlers
    registerChatHandlers(io, socket);
    registerGroupHandlers(io, socket);
    registerPersonalHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", socket.id, "Reason:", reason);
    });
  });

  ioInstance = io;
  return io;
}

function getIO() {
  if (!ioInstance) throw new Error("Socket.io not initialized yet");
  return ioInstance;
}

module.exports = { setupSocketIO, getIO };
