// cron/archiveMessages.js
const cron = require("node-cron");
const { Op } = require("sequelize");
const Message = require("../model/MessageModel");
const ArchivedMessage = require("../model/ArchivedMessage");

// Run every night at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  console.log("⏳ Archiving old messages...");

  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 1); // 1 day old

    // Find messages older than 1 day
    const oldMessages = await Message.findAll({
      where: { createdAt: { [Op.lt]: cutoff } },
    });

    if (oldMessages.length === 0) {
      console.log("✅ No old messages to archive.");
      return;
    }

    // Insert into ArchivedMessage
    const records = oldMessages.map((msg) => ({
      message: msg.message,
      mediaUrl: msg.mediaUrl,
      mimeType: msg.mimeType,
      roomId: msg.roomId,
      groupId: msg.groupId,
      UserId: msg.UserId,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));

    await ArchivedMessage.bulkCreate(records);
    console.log(`✅ Archived ${records.length} messages.`);

    // Delete from Message table
    await Message.destroy({
      where: { id: oldMessages.map((msg) => msg.id) },
    });

    console.log("🧹 Deleted old messages from Message table.");
  } catch (err) {
    console.error("❌ Error archiving messages:", err);
  }
});
