// backend/routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// POST /api/register
router.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.trim() || !password || password.length < 6) {
    return res
      .status(400)
      .json({ error: "Email and password (min 6 chars) are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  db.get(
    "SELECT id FROM users WHERE email = ?",
    [normalizedEmail],
    async (err, row) => {
      if (err) {
        console.error("Error checking user:", err);
        return res.status(500).json({ error: "Failed to check user" });
      }
      if (row) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      try {
        const passwordHash = await bcrypt.hash(password, 10);
        db.run(
          "INSERT INTO users (email, password_hash) VALUES (?, ?)",
          [normalizedEmail, passwordHash],
          function (err2) {
            if (err2) {
              console.error("Error creating user:", err2);
              return res.status(500).json({ error: "Failed to create user" });
            }

            const userId = this.lastID;
            const token = jwt.sign({ userId }, JWT_SECRET, {
              expiresIn: "7d",
            });

            res.status(201).json({
              token,
              user: { id: userId, email: normalizedEmail },
            });
          }
        );
      } catch (hashErr) {
        console.error("Error hashing password:", hashErr);
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  );
});

// POST /api/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.trim() || !password) {
    return res
      .status(400)
      .json({ error: "Email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  db.get(
    "SELECT id, password_hash FROM users WHERE email = ?",
    [normalizedEmail],
    async (err, row) => {
      if (err) {
        console.error("Error reading user:", err);
        return res.status(500).json({ error: "Failed to check user" });
      }
      if (!row) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, row.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: row.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        token,
        user: { id: row.id, email: normalizedEmail },
      });
    }
  );
});

module.exports = router;
