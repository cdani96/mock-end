const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { User } = require("../db");
const SECRET_KEY = process.env.SECRET_KEY;
const { sendEmail } = require("../lib/emailConfig");

// const asyncHandler = (fn) => (req, res, next) =>
//  Promise.resolve(fn(req, res, next)).catch(next);

router.use((req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format.",
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

async function isEmailUnique(email) {
  const existingUser = await User.findOne({
    where: { email },
  });
  return !existingUser;
}

function genVerificationCode() {
  return Math.random().toString(36).substring(4, 8);
}

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  const verificationCode = genVerificationCode();

  try {
    const isUnique = await isEmailUnique(email);

    if (!isUnique) {
      return res.status(400).json({
        message: "Email is already in use. Choose another email.",
      });
    }

    const user = await User.create({
      email,
      password: await bcrypt.hash(password, 10),
      verificationCode,
    });

    await sendEmail({
      from: "noreply@thedaniweb.eu.org",
      to: email,
      subject: "Account Verification",
      verificationCode,
    });

    const token = jwt.sign({ userId: user.id }, SECRET_KEY);

    res.status(200).json({ id: user.id, user: user.email, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

module.exports = router;
