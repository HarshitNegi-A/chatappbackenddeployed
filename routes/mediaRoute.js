// routes/mediaRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { getIO } = require("../socket");
const Message = require("../model/MessageModel");

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

// ✅ POST /media/upload (local version)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const sender = req.user; // should be attached by auth middleware
    const { roomId, groupId, chatType } = req.body;

    // ✅ Build local file URL
    const fileUrl = `/uploads/${file.filename}`;
    const fullFileUrl = `${req.protocol}://${req.get("host")}${fileUrl}`;

    // ✅ Save message in DB
    const savedMessage = await Message.create({
      message: null,
      mediaUrl: fileUrl, // store relative path
      mimeType: file.mimetype,
      roomId: roomId || null,
      groupId: groupId || null,
      UserId: sender?.id || null,
    });

    // ✅ Build payload for Socket.IO
    const payload = {
      id: savedMessage?.id || uuidv4(),
      user: { id: sender?.id, name: sender?.name },
      mediaUrl: fullFileUrl,
      mimeType: file.mimetype,
      groupId: groupId || null,
      roomId: roomId || null,
      createdAt: (savedMessage?.createdAt || new Date()).toISOString(),
    };

    // ✅ Emit message to appropriate channel
    const io = getIO();
    if (chatType === "group" && groupId) {
      io.to(`group_${groupId}`).emit("group:message", payload);
    } else if (chatType === "personal" && roomId) {
      io.to(roomId).emit("receive_message", payload);
    } else {
      io.emit("receive_message", payload);
    }

    res.json({ message: "Uploaded successfully", payload });
  } catch (err) {
    console.error("Media upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

module.exports = router;
