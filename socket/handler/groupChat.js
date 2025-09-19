const Message = require("../../model/MessageModel");
const GroupMember = require("../../model/GroupMember");
const User = require("../../model/UserModel"); // ✅ import User model

function registerGroupHandlers(io, socket) {
  // Join group room
  socket.on("group:join", async ({ groupId }) => {
    try {
      const isMember = await GroupMember.findOne({
        where: { GroupId: groupId, UserId: socket.user.id },
      });

      if (!isMember) {
        return socket.emit("error", { message: "❌ You must join this group first" });
      }

      socket.join(`group_${groupId}`);
      socket.emit("group:joined", { groupId });
      console.log(`✅ User ${socket.user.id} joined group ${groupId}`);
    } catch (err) {
      console.error("group:join error", err);
    }
  });

  // Send group message
  socket.on("group:new_message", async ({ groupId, text }) => {
    try {
      const isMember = await GroupMember.findOne({
        where: { GroupId: groupId, UserId: socket.user.id },
      });

      if (!isMember) {
        return socket.emit("error", { message: "❌ You must join this group to send messages" });
      }

      // ✅ Save message in DB
      const newMessage = await Message.create({
        message: text,
        UserId: socket.user.id,
        groupId,
      });

      // ✅ Fetch sender info (name, role)
      const sender = await User.findByPk(socket.user.id, {
        attributes: ["id", "name"],
      });

      const payload = {
        id: newMessage.id,
        message: newMessage.message,
        user: {
          id: sender.id,
          name: sender.name,
        },
        groupId,
        createdAt: newMessage.createdAt.toISOString(),
      };

      // ✅ Emit to group members
      io.to(`group_${groupId}`).emit("group:message", payload);
    } catch (err) {
      console.error("group:new_message error", err);
    }
  });
}

module.exports = registerGroupHandlers;
