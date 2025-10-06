const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  dialectOptions: {
    connectTimeout: 60000, // optional
  },
  logging: false, // optional, disable SQL logs
});

module.exports = sequelize;
