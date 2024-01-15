// lib/errors.js
const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({ error: true, message });
};

module.exports = { sendError };
