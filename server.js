const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sequelize, User } = require("./db");

const app = express();
const port = 3000;
const SECRET_KEY = "yfihdtuhfyfuy";

app.use(bodyParser.json());

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.create({
      username,
      password: await bcrypt.hash(password, 10),
    });
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);
    res.status(200).json({ user: user.username, token });
  } catch (error) {
    res.status(400).json({ message: "Error creating user" });
  }
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      SECRET_KEY,
    );
    return res.status(200).json({ user: user.username, token });
  } catch (error) {
    res.status(400).json({ message: "Error finding user" });
  }
});

sequelize.sync().then(() => {
  app.listen(port, () => console.log(`Server started at port ${port}`));
});
