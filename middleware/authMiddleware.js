const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Format: "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // Attach decoded payload (e.g. user id) to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

module.exports = authenticate;
