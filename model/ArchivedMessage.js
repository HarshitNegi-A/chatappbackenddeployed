
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const ArchivedMessage = sequelize.define("ArchivedMessage", {
  message: { type: DataTypes.TEXT, allowNull: true },
  mediaUrl: { type: DataTypes.STRING, allowNull: true },
  mimeType: { type: DataTypes.STRING, allowNull: true },
  roomId: { type: DataTypes.STRING, allowNull: true },
  groupId: { type: DataTypes.INTEGER, allowNull: true },
  UserId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  timestamps: true, 
});

module.exports = ArchivedMessage;
