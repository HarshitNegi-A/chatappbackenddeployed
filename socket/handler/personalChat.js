// socket-io/handlers/personalChat.js
const Message = require("../../model/MessageModel"); // if you want to save messages

function registerPersonalChatHandlers(io, socket) {
  // 🔸 Join a personal room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`✅ User ${socket.user?.id} joined room ${roomId}`);
  });

  // 🔸 Handle new private message
  socket.on("new_message", async ({ roomId, text }) => {
    console.log(`💬 Private message in ${roomId}:`, text);

    try {
      // Optional: save to DB
      const newMessage = await Message.create({
        message: text,
        UserId: socket.user.id,
        roomId,
      });

      // Send only to users in this room
      io.to(roomId).emit("receive_message", {
        id: newMessage.id,
        message: newMessage.message,
        UserId: newMessage.UserId,
        createdAt: newMessage.createdAt.toISOString(),
      });
    } catch (err) {
      console.error("❌ Error saving personal message:", err);
    }
  });
}

module.exports = registerPersonalChatHandlers;
