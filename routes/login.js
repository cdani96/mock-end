const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { User } = require("../db");
const SECRET_KEY = process.env.SECRET_KEY;
const { sendError } = require("../lib/errors");
const logger = require("../lib/winston").logger;

router.use((req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(12).required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return sendError(res, 400, "Invalid input. Please check your data", [
      error.message,
    ]);
  }
  next();
});

router.post("/", async (req, res) => {
  logger.info("Received request:", JSON.stringify(req.body, null, 2));
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    handleLoginAttemp(user, password, res);
  } catch (error) {
    // Sending a successful login response with the user's username and token
    logger.error("Error finding user:", error);
    // Sending an error response
    sendError(res, 500, "Internal server error");
  }
});

const handleLoginAttemp = async (user, password, res) => {
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return sendError(res, 401, "Invalid credentials");
  }
  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
    },
    SECRET_KEY,
  );
  res.status(200).json({
    user: user.username,
    token,
  });
};

module.exports = router;
