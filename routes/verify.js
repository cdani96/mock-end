const express = require("express");
const router = express.Router();
const { User } = require("../db");

router.post("/", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    console.log(email, verificationCode);

    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        message: "Account already verified",
      });
    }

    if (!user.verificationCode || user.verificationCode !== verificationCode) {
      return res.status(400).json({
        message: "Invalid verification code",
      });
    }

    await updateUserVerification(user);

    return res.status(200).json({
      message: "Account verified",
    });
  } catch (error) {
    console.error("Error in verification:", error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

async function findUserByEmail(email) {
  return await User.findOne({
    where: {
      email,
    },
  });
}

async function updateUserVerification(user) {
  user.verificationCode = null;
  user.isVerified = true;
  await user.save();
}

module.exports = router;
