const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("users_qr", "u0_a372", {
  host: "localhost",
  dialect: "mysql",
});

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = { sequelize, User };
