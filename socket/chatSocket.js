const jwt = require("jsonwebtoken");
const Message = require("../model/MessageModel");

function initChatSocket(io) {
  // Middleware: authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) return next(new Error("Invalid token"));
      socket.user = decoded;
      next();
    });
  });

  // Handle events
  io.on("connection", (socket) => {
    console.log("🔗 User connected:", socket.user.id);

    // When user sends a message
    socket.on("send-message", async (payload) => {
      try {
        const text = payload?.text?.trim();
        if (!text) return;

        // Save to DB
        const newMsg = await Message.create({
          message: text,
          UserId: socket.user.id,
        });

        const emitMsg = {
          id: newMsg.id,
          message: newMsg.message,
          UserId: newMsg.UserId,
          createdAt: newMsg.createdAt,
        };

        // Broadcast to all users
        io.emit("receive-message", emitMsg);
      } catch (err) {
        console.error("Socket Send Error:", err);
        socket.emit("message-error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.user.id);
    });
  });
}

module.exports = { initChatSocket };
