const Message = require("../model/MessageModel");
const User=require('../model/UserModel')


exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; 
    console.log(userId)

    if (!message) {
      return res.status(400).json({ message: "Message text required" });
    }

    const newMessage = await Message.create({
      message,
      UserId:userId,
    });

    res.status(201).json({ message: "Message saved", data: newMessage });
  } catch (err) {
    console.error("Send Message Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.findAll({
      include: [{ model: User, attributes: ["id", "name"] }],
      order: [["createdAt", "ASC"]], // oldest first
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

exports.getPersonalMessages=async(req,res)=>{
  try {
    const { roomId } = req.params;
    const messages = await Message.findAll({
      where: { roomId },
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error("❌ Error fetching chat history:", err);
    res.status(500).json({ message: "Error fetching chat history" });
  }
}