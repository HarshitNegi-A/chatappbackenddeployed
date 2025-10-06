const Message = require("../model/MessageModel");
const User = require("../model/UserModel");
const { getIO } = require("../socket");

// ✅ Send a new GLOBAL message
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !userId) {
      return res.status(400).json({ message: "Message text and user required" });
    }

    // 1️⃣ Save the message (tag as global)
    const newMessage = await Message.create({
      message,
      UserId: userId,
      chatType: "global", // ✅ ensure only global messages are stored here
    });

    // 2️⃣ Fetch sender info
    const user = await User.findByPk(userId, { attributes: ["id", "name"] });

    // 3️⃣ Format clean message object
    const formatted = {
      id: newMessage.id,
      message: newMessage.message,
      user,
      chatType: "global",
      createdAt: newMessage.createdAt,
    };

    // 4️⃣ Broadcast via socket (optional)
    try {
      const io = getIO();
      io.emit("receive_message", formatted);
    } catch (err) {
      console.warn("Socket not initialized yet — skipping emit");
    }

    // 5️⃣ Send response
    res.status(201).json({ message: "Message sent", data: formatted });
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Fetch ALL GLOBAL messages only
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { chatType: "global" }, // ✅ fetch only global chat
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]],
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      message: m.message,
      user: { id: m.User?.id, name: m.User?.name },
      createdAt: m.createdAt,
      chatType: m.chatType,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

// ✅ Fetch PERSONAL messages (private 1-to-1 chat)
exports.getPersonalMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.findAll({
      where: { roomId, chatType: "personal" }, // ✅ only personal messages
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]],
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      message: m.message,
      user: { id: m.User?.id, name: m.User?.name },
      createdAt: m.createdAt,
      chatType: m.chatType,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching personal chat history:", err);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};
