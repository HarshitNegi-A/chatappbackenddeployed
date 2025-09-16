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
}, {
  timestamps: true, 
});

module.exports = Message;
