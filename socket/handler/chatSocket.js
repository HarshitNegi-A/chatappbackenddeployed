const Message = require("../../model/MessageModel");
const User = require("../../model/UserModel"); // ✅ for sender name

function registerChatHandlers(io, socket) {
  // 🔹 Listen for global chat messages
  socket.on("send-message", async (data) => {
    console.log("💬 Global chat message received:", data);

    try {
      // 1️⃣ Validate message
      if (!data.text || !socket.user?.id) {
        console.warn("⚠️ Invalid message or unauthenticated user");
        return;
      }

      // 2️⃣ Save message in DB (chatType = global)
      const newMessage = await Message.create({
        message: data.text,
        UserId: socket.user.id,
        chatType: "global",
      });

      // 3️⃣ Fetch sender info
      const user = await User.findByPk(socket.user.id, {
        attributes: ["id", "name"],
      });

      // 4️⃣ Prepare payload for frontend
      const payload = {
        id: newMessage.id,
        message: newMessage.message,
        user: {
          id: user.id,
          name: user.name,
        },
        chatType: "global",
        createdAt: newMessage.createdAt.toISOString(),
      };

      // 5️⃣ Emit to all users (global)
      io.emit("receive_message", payload); // ✅ FIXED event name (underscore)
      console.log("📤 Global message broadcasted:", payload);
    } catch (err) {
      console.error("❌ Error saving or broadcasting message:", err);
    }
  });
}

module.exports = registerChatHandlers;
