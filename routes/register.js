const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../db");
const SECRET_KEY = process.env.SECRET_KEY;
const { sendError } = require("../lib/errors");

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({
      username,
      password: await bcrypt.hash(password, 10),
    });
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);
    res.status(200).json({ user: user.username, token });
  } catch (error) {
    handleRegistrationError(error, res);
  }
});

const handleRegistrationError = (error, res) => {
  if (error.name === "SequelizeUniqueConstraintError") {
    return sendError(res, 400, "Username already exists");
  } else if (error.name === "SequelizeValidationError") {
    const errors = error.errors.map((e) => e.message);
    return sendError(res, 400, "Invalid input. Please check your data", errors);
  } else {
    console.error("Error creating user: ", error);
    sendError(res, 500, "Internal server error");
  }
};

module.exports = router;
