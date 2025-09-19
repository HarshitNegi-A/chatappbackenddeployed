// socket-io/handlers/chat.js
const Message = require("../../model/MessageModel"); // make sure path is correct

function registerChatHandlers(io, socket) {
  // Listen for incoming chat messages
  socket.on("send-message", async (data) => {
    console.log("💬 Chat message received:", data);

    try {
      // 1️⃣ Save message in DB
      const newMessage = await Message.create({
        message: data.text,         // client sends { text }
        UserId: socket.user?.id,    // comes from JWT middleware
      });

      // 2️⃣ Prepare clean payload
      const fullMessage = {
        id: newMessage.id,
        message: newMessage.message,
        UserId: newMessage.UserId,
        createdAt: newMessage.createdAt.toISOString(), // prevent Invalid Date
      };

      // 3️⃣ Broadcast to all connected clients
      io.emit("receive-message", fullMessage);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });
}

module.exports = registerChatHandlers;
