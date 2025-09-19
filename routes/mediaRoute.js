// routes/mediaRoutes.js
const express = require("express");
const multer = require("multer");
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const { getIO } = require("../socket");
const Message = require("../model/MessageModel");

require("dotenv").config();

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// POST /media/upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const sender = req.user; // authMiddleware should attach req.user
    const { roomId, groupId, chatType } = req.body;

    // Generate unique key
    const ext = file.originalname.split(".").pop();
    const key = `chat-media/${uuidv4()}.${ext}`;

    // Upload file to S3 (private by default, no ACL)
    const putParams = {
      Bucket: process.env.AWS_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(putParams));

    // ✅ Generate presigned GET URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
      }),
      { expiresIn: 3600 } // 1 hour
    );

    // Save message in DB
    const savedMessage = await Message.create({
      message: null,
      mediaUrl: key, // store S3 key, not presigned URL
      mimeType: file.mimetype,
      roomId: roomId || null,
      groupId: groupId || null,
      UserId: sender?.id || null,
    });

    // Build payload for sockets
    const payload = {
      id: savedMessage?.id || uuidv4(),
      user: { id: sender?.id, name: sender?.name },
      mediaUrl: presignedUrl, // send presigned URL to clients
      mimeType: file.mimetype,
      groupId: groupId || null,
      roomId: roomId || null,
      createdAt: (savedMessage?.createdAt || new Date()).toISOString(),
    };

    // Emit message via Socket.IO
    const io = getIO();
    if (chatType === "group" && groupId) {
      io.to(`group_${groupId}`).emit("group:message", payload);
    } else if (chatType === "personal" && roomId) {
      io.to(roomId).emit("receive_message", payload);
    } else {
      io.emit("receive_message", payload);
    }

    return res.json({ message: "Uploaded", payload });
  } catch (err) {
    console.error("Media upload error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

module.exports = router;
