const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  message: "You have exceded the limit usage",
  standarHeaders: true,
  legacyHeaders: false,
});

module.exports.limiter = limiter;
