const express = require("express");
const Group = require("../model/GroupModel");
const GroupMember = require("../model/GroupMember");
const Message = require("../model/MessageModel");
const User = require("../model/UserModel");

const router = express.Router();

// ✅ Create a group
router.post("/", async (req, res) => {
  try {
    const { name, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ message: "Group name and userId are required" });
    }

    const group = await Group.create({ name });

    await GroupMember.create({
      GroupId: group.id,
      UserId: userId,
      role: "admin",
    });

    res.json({ message: "✅ Group created", group });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Error creating group" });
  }
});

// ✅ Join a group
router.post("/:groupId/join", async (req, res) => {
  try {
    const { userId } = req.body;
    const { groupId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const exists = await GroupMember.findOne({
      where: { UserId: userId, GroupId: groupId },
    });

    if (exists) {
      return res.status(400).json({ message: "Already in group" });
    }

    await GroupMember.create({ GroupId: groupId, UserId: userId, role: "member" });
    res.json({ message: "✅ Joined group successfully" });
  } catch (err) {
    console.error("Error joining group:", err);
    res.status(500).json({ message: "Error joining group" });
  }
});

// ✅ Fetch all groups
router.get("/", async (req, res) => {
  try {
    const groups = await Group.findAll();
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
});

// ✅ Fetch group messages with sender info
router.get("/:groupId/messages", async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.findAll({
      where: { groupId },
      order: [["createdAt", "ASC"]],
      include: {
        model: User,
        attributes: ["id", "name"], // 👈 include sender name
      },
    });

    const formatted = messages.map((m) => ({
      id: m.id,
      message: m.message,
      user: {
        id: m.User?.id,
        name: m.User?.name,
      },
      groupId: m.groupId,
      createdAt: m.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// ✅ Fetch groups a user is part of (with role)
router.get("/my/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const memberships = await GroupMember.findAll({
      where: { UserId: userId },
      include: [{ model: Group }],
    });

    const groups = memberships.map((m) => ({
      id: m.Group?.id,
      name: m.Group?.name,
      role: m.role,
    }));

    res.json(groups);
  } catch (err) {
    console.error("Error fetching user groups:", err);
    res.status(500).json({ message: "Error fetching user groups" });
  }
});

module.exports = router;
