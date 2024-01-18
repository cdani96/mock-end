const treblle = require("@treblle/express");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./db");
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
require("dotenv").config();
const logger = require("./lib/winston").logger;
const { sendError } = require("./lib/errors");

const app = express();
const port = process.env.PORT || 3000;

app.use(treblle());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(bodyParser.json());

// Register endpoint
app.use("/api/register", registerRoute);

// Login endpoint
app.use("/api/login", loginRoute);

app.post("/api/logger", (req, res) => {
  const errorData = req.body;
  logger.error("Client side errors: ", errorData);
  res.status(200).json({ message: "Error logged succesfully" });
});

app.use((err, req, res, next) => {
  logger.error("Unexpected error: ", err);
  sendError(res, 500, "Unexpected error ocurred");
});

sequelize.sync().then(() => {
  app.listen(port, () => logger.info(`Server started at port ${port}`));
});
