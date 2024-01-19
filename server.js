const treblle = require("@treblle/express");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const { sequelize } = require("./db");
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const verifyRoute = require("./routes/verify");
const deleteAccRoute = require("./routes/delete-acc");
require("dotenv").config();
const { sendError } = require("./lib/errors");
const { limiter } = require("./lib/rateLimiter");

const app = express();
const port = process.env.PORT || 3000;

app.use(treblle());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(limiter);
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static("public"));

// Set headers
app.use("/api", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  next();
});

app.use("/ping", (req, res) => {
  res.status(200).json("Ok");
});

// Register endpoint
app.use("/api/register", registerRoute);

// Login endpoint
app.use("/api/login", loginRoute);

// Verify endpoint
app.use("/api/verify", verifyRoute);

// Delete account endpoint
app.use("/users", deleteAccRoute);

app.post("/api/logger", (req, res) => {
  const errorData = req.body;
  console.error("Client side errors: ", errorData);
  res.status(200).json({ message: "Error logged succesfully" });
});

app.use((err, req, res, next) => {
  console.error("Unexpected error: ", err);
  sendError(res, 500, "Unexpected error ocurred");
});

sequelize.sync().then(() => {
  app.listen(port, () => console.log(`Server started at port ${port}`));
});
