const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { User } = require("../db");
const SECRET_KEY = process.env.SECRET_KEY;

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use((req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(12).required().messages({
      "string.base": "Username must be a string",
      "string.alphanum": "Username must only contain alpha-numeric characters",
      "string.min": "Username must be at least {#limit} characters",
      "string.max": "Username cannot be longer than {#limit} characters",
      "any.required": "Username is required",
    }),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required()
      .min(8)
      .not(Joi.ref("username"))
      .messages({
        "string.pattern.base":
          "Password must only contain alpha-numeric characters and be 3-30 characters long",
        "any.required": "Password is required",
        "string.min": "Password must be at least {#limit} characters",
        "any.invalid": "Password cannot be the same as username",
      }),
  });
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      message: "Invalid input. Please check your data",
      errors: errorMessages,
    });
  }
  next();
});

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
    console.error(error);
  }
});

module.exports = router;
