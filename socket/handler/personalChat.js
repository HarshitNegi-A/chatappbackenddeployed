const Message = require("../../model/MessageModel");
const User = require("../../model/UserModel");

function registerPersonalChatHandlers(io, socket) {
  // 🔸 Join a personal chat room (user-to-user)
  socket.on("join_room", (roomId) => {
    try {
      socket.join(roomId);
      console.log(`✅ User ${socket.user?.id} joined private room ${roomId}`);
    } catch (err) {
      console.error("❌ join_room error:", err);
      socket.emit("error", { message: "Failed to join private room" });
    }
  });

  // 🔸 Handle new private message
  socket.on("new_message", async ({ roomId, text, mediaUrl, mimeType }) => {
    try {
      if (!roomId || !text) {
        return socket.emit("error", { message: "Invalid room or empty message" });
      }

      console.log(`💬 Private message in ${roomId}:`, text);

      // 1️⃣ Save to DB (with chatType = "personal")
      const newMessage = await Message.create({
        message: text || null,
        mediaUrl: mediaUrl || null,
        mimeType: mimeType || null,
        UserId: socket.user.id,
        roomId,
        chatType: "personal", // ✅ important to separate from group/global
      });

      // 2️⃣ Fetch sender details
      const sender = await User.findByPk(socket.user.id, {
        attributes: ["id", "name"],
      });

      // 3️⃣ Create payload
      const payload = {
        id: newMessage.id,
        message: newMessage.message,
        user: {
          id: sender.id,
          name: sender.name,
        },
        roomId,
        mediaUrl: newMessage.mediaUrl,
        mimeType: newMessage.mimeType,
        chatType: "personal",
        createdAt: newMessage.createdAt.toISOString(),
      };

      // 4️⃣ Send only to users in this private room
      io.to(roomId).emit("receive_message", payload);

      console.log(`📤 Sent personal message in ${roomId} from ${sender.name}`);
    } catch (err) {
      console.error("❌ Error saving personal message:", err);
      socket.emit("error", { message: "Server error sending message" });
    }
  });
}

module.exports = registerPersonalChatHandlers;
