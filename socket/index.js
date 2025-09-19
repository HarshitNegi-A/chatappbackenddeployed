const { Server } = require("socket.io");
const registerChatHandlers = require("./handler/chatSocket");
const { socketAuthMiddleware } = require("./middleware");
const registerPersonalChatHandlers=require('./handler/personalChat')
const registerGroupHandlers=require('./handler/groupChat')

function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // ✅ no trailing slash
      methods: ["GET", "POST"]
    }
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    registerChatHandlers(io, socket);
     registerPersonalChatHandlers(io, socket); 
     registerGroupHandlers(io,socket)

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = setupSocketIO;
