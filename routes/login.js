const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { User } = require("../db");
const SECRET_KEY = process.env.SECRET_KEY;

// Define a helper function that takes an async function and returns a middleware function
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.use((req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      )
      .required()
      .messages({
        "string.pattern.base": "Password does not meet complexity requirements",
        "any.required": "Password is required",
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

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } }); // Change 'username' to 'email'
    handleLoginAttempt(user, password, res);
  }),
);

const handleLoginAttempt = async (user, password, res) => {
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    SECRET_KEY,
  );
  res.status(200).json({
    id: user.id,
    user: user.email,
    token,
  });
};

module.exports = router;
