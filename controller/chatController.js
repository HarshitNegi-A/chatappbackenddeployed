const Message = require("../model/MessageModel");
const User = require("../model/UserModel");
const { getIO } = require("../socket"); // <-- only if you want to broadcast in real-time

// ✅ Send a new global message
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !userId) {
      return res.status(400).json({ message: "Message text and user required" });
    }

    // 1️⃣ Save the message
    const newMessage = await Message.create({
      message,
      UserId: userId,
    });

    // 2️⃣ Fetch the sender’s name
    const user = await User.findByPk(userId, { attributes: ["id", "name"] });

    // 3️⃣ Build a clean response object
    const formatted = {
      id: newMessage.id,
      message: newMessage.message,
      user, // ✅ includes name
      createdAt: newMessage.createdAt,
    };

    // 4️⃣ Broadcast via socket (optional, if using socket.io)
    try {
      const io = getIO();
      io.emit("receive_message", formatted);
    } catch (err) {
      console.warn("Socket not initialized yet — skipping emit");
    }

    // 5️⃣ Send response to client
    res.status(201).json({ message: "Message sent", data: formatted });
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Fetch all global messages (with sender info)
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]],
    });

    // Format response
    const formatted = messages.map((m) => ({
      id: m.id,
      message: m.message,
      user: { id: m.User?.id, name: m.User?.name },
      createdAt: m.createdAt,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

// ✅ Fetch personal chat messages
exports.getPersonalMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.findAll({
      where: { roomId },
      include: [{ model: User, attributes: ["id", "name"] }], // 👈 added this for names in private chat too
      order: [["createdAt", "ASC"]],
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      message: m.message,
      user: { id: m.User?.id, name: m.User?.name },
      createdAt: m.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching chat history:", err);
    res.status(500).json({ message: "Error fetching chat history" });
  }
};
