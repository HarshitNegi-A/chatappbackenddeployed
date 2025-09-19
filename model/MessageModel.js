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
    allowNull: false,
  },
   roomId: {
    type: DataTypes.STRING,   // for personal chat
    allowNull: true,
  },
   groupId: {
    type: DataTypes.INTEGER, // for group chats
    allowNull: true,
  },
}, {
  timestamps: true, 
});

module.exports = Message;
