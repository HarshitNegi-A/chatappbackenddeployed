const Message = require("../../model/MessageModel");
const GroupMember = require("../../model/GroupMember");
const User = require("../../model/UserModel");

function registerGroupHandlers(io, socket) {
  // 🔹 User joins a group room
  socket.on("group:join", async ({ groupId }) => {
    try {
      const isMember = await GroupMember.findOne({
        where: { GroupId: groupId, UserId: socket.user.id },
      });

      if (!isMember) {
        return socket.emit("error", {
          message: "❌ You must join this group first",
        });
      }

      socket.join(`group_${groupId}`);
      socket.emit("group:joined", { groupId });
      console.log(`✅ User ${socket.user.id} joined group ${groupId}`);
    } catch (err) {
      console.error("❌ group:join error:", err);
      socket.emit("error", { message: "Server error while joining group" });
    }
  });

  // 🔹 Handle new group messages
  socket.on("group:new_message", async ({ groupId, text, mediaUrl, mimeType }) => {
    try {
      // 1️⃣ Verify the user is in the group
      const isMember = await GroupMember.findOne({
        where: { GroupId: groupId, UserId: socket.user.id },
      });

      if (!isMember) {
        return socket.emit("error", {
          message: "❌ You must join this group to send messages",
        });
      }

      // 2️⃣ Save message to DB with chatType: "group"
      const newMessage = await Message.create({
        message: text || null,
        mediaUrl: mediaUrl || null,
        mimeType: mimeType || null,
        UserId: socket.user.id,
        groupId,
        chatType: "group", // ✅ important for filtering
      });

      // 3️⃣ Fetch sender info (name)
      const sender = await User.findByPk(socket.user.id, {
        attributes: ["id", "name"],
      });

      // 4️⃣ Build payload for frontend
      const payload = {
        id: newMessage.id,
        message: newMessage.message,
        user: {
          id: sender.id,
          name: sender.name,
        },
        groupId,
        mediaUrl: newMessage.mediaUrl,
        mimeType: newMessage.mimeType,
        chatType: "group",
        createdAt: newMessage.createdAt.toISOString(),
      };

      // 5️⃣ Emit message only to users in this group room
      io.to(`group_${groupId}`).emit("group:message", payload);

      console.log(`📤 Message sent to group ${groupId} by ${sender.name}`);
    } catch (err) {
      console.error("❌ group:new_message error:", err);
      socket.emit("error", { message: "Server error sending message" });
    }
  });
}

module.exports = registerGroupHandlers;
