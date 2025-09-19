// GroupMember.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./UserModel");
const Group = require("./GroupModel");

const GroupMember = sequelize.define("GroupMember", {
  role: {
    type: DataTypes.ENUM("admin", "member"),
    defaultValue: "member",
  },
});

// ✅ Define associations
User.belongsToMany(Group, { through: GroupMember });
Group.belongsToMany(User, { through: GroupMember });

GroupMember.belongsTo(User);
GroupMember.belongsTo(Group);

module.exports = GroupMember;
