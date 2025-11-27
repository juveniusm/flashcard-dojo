// backend/routes/deckRoutes.js
const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/decks
router.get("/decks", (req, res) => {
  db.all("SELECT id, name FROM decks ORDER BY name", [], (err, rows) => {
    if (err) {
      console.error("Error loading decks:", err);
      return res.status(500).json({ error: "Failed to load decks" });
    }
    res.json(rows);
  });
});

// POST /api/decks
router.post("/decks", (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Deck name is required" });
  }

  const sql = "INSERT INTO decks (name) VALUES (?)";
  db.run(sql, [name.trim()], function (err) {
    if (err) {
      console.error("Error creating deck:", err);
      return res.status(500).json({ error: "Failed to create deck" });
    }

    res.status(201).json({ id: this.lastID, name: name.trim() });
  });
});

module.exports = router;
