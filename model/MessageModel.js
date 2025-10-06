const { DataTypes } = require("sequelize");
const sequelize = require("../db"); 

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mimeType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  roomId: {
    type: DataTypes.STRING, // personal chat
    allowNull: true,
  },
  groupId: {
    type: DataTypes.INTEGER, // group chat
    allowNull: true,
  },
  chatType: {
    type: DataTypes.ENUM("global", "personal", "group"),
    allowNull: false,
    defaultValue: "global", // 🌍 default for backward compatibility
  },
}, {
  timestamps: true,
});

module.exports = Message;
