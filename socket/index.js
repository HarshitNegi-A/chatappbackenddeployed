// socket-io/index.js
const { Server } = require("socket.io");
const { socketAuthMiddleware } = require("./middleware");
const registerChatHandlers = require("./handler/chatSocket");
const registerGroupHandlers = require("./handler/groupChat");
const registerPersonalHandlers = require("./handler/personalChat");

let ioInstance = null;

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
    }
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id, "user", socket.user?.id);

    registerChatHandlers(io, socket);
    registerGroupHandlers(io, socket);
    registerPersonalHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected", socket.id, reason);
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
