// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

// In a real app, keep this secret in an environment variable
const JWT_SECRET = "change-this-secret-for-production";

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ error: "Missing or invalid authorization header" });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.userId = payload.userId;
    next();
  });
}

module.exports = {
  authMiddleware,
  JWT_SECRET,
};
