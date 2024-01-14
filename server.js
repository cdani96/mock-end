const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sequelize, User } = require("./db");

const app = express();
const port = 3000;
const SECRET_KEY = "yfihdtuhfyfuy";

app.use(bodyParser.json());

let users = [];

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
  };
  users.push(newUser);

  const token = jwt.sign({ userId: newUser.id }, SECRET_KEY);
  res.status(200).json({ user: newUser.username, token });
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    SECRET_KEY,
  );
  return res.status(200).json({ user: user.username, token });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
