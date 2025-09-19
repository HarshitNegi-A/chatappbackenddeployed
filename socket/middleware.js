// socket-io/middleware.js
const jwt = require("jsonwebtoken");
require('dotenv').config()

function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    socket.user = decoded; // attach user info for later use
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
}

module.exports = { socketAuthMiddleware };
