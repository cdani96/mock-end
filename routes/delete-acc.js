const express = require("express");
const router = express.Router();
const { User } = require("../db");
require("dotenv").config();
const { verifyToken } = require("../lib/tokenVerif");

async function deleteUser(req, res) {
  const userId = req.params.id;

  try {
    const result = await User.destroy({
      where: {
        id: userId,
      },
    });

    if (result) {
      res.send(`User with ID ${userId} has been deleted.`);
    } else {
      res.send(`User with ID ${userId} does not exist.`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while trying to delete the user.");
  }
}

router.delete("/:id", verifyToken, deleteUser);

module.exports = router;
