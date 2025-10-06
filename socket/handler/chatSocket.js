const Message = require("../../model/MessageModel");
const User = require("../../model/UserModel"); // ✅ to fetch sender name

function registerChatHandlers(io, socket) {
  // 🔹 Listen for global chat messages
  socket.on("send-message", async (data) => {
    console.log("💬 Global chat message received:", data);

    try {
      // 1️⃣ Validate message text
      if (!data.text || !socket.user?.id) {
        return console.warn("⚠️ Invalid message or unauthenticated user");
      }

      // 2️⃣ Save message to DB (explicitly mark as global)
      const newMessage = await Message.create({
        message: data.text,
        UserId: socket.user.id,
        chatType: "global", // ✅ only global chat messages handled here
      });

      // 3️⃣ Fetch user info for name
      const user = await User.findByPk(socket.user.id, {
        attributes: ["id", "name"],
      });

      // 4️⃣ Prepare clean payload for frontend
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

      // 5️⃣ Broadcast to all connected users (global room)
      io.emit("receive-message", payload);
    } catch (err) {
      console.error("❌ Error saving or broadcasting message:", err);
    }
  });
}

module.exports = registerChatHandlers;
