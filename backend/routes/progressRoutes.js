// backend/routes/progressRoutes.js
const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// GET /api/progress/cards?deckId=...
router.get("/progress/cards", authMiddleware, (req, res) => {
  const { deckId } = req.query;
  const userId = req.userId;

  if (!deckId) {
    return res.status(400).json({ error: "deckId is required" });
  }

  const sql = `
    SELECT
      cp.card_id AS cardId,
      cp.seen,
      cp.correct,
      cp.last_outcome AS lastOutcome
    FROM card_progress cp
    JOIN cards c ON cp.card_id = c.id
    WHERE cp.user_id = ? AND c.deck_id = ?
  `;
  db.all(sql, [userId, deckId], (err, rows) => {
    if (err) {
      console.error("Error loading progress:", err);
      return res.status(500).json({ error: "Failed to load progress" });
    }
    res.json(rows);
  });
});

// POST /api/progress/event
router.post("/progress/event", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { cardId, outcome } = req.body;

  if (!cardId || !outcome || !["correct", "incorrect"].includes(outcome)) {
    return res.status(400).json({
      error: "cardId and outcome ('correct' or 'incorrect') are required.",
    });
  }

  const correctIncrement = outcome === "correct" ? 1 : 0;

  const sql = `
    INSERT INTO card_progress (user_id, card_id, seen, correct, last_outcome)
    VALUES (?, ?, 1, ?, ?)
    ON CONFLICT(user_id, card_id) DO UPDATE SET
      seen = seen + 1,
      correct = correct + excluded.correct,
      last_outcome = excluded.last_outcome
  `;

  db.run(sql, [userId, cardId, correctIncrement, outcome], function (err) {
    if (err) {
      console.error("Error updating progress:", err);
      return res.status(500).json({ error: "Failed to update progress" });
    }
    res.json({ success: true });
  });
});

module.exports = router;
