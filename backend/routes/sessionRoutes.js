// backend/routes/sessionRoutes.js
const express = require("express");
const db = require("../db");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// POST /api/sessions
router.post("/sessions", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { deckId, mode, totalAnswered, correct } = req.body;

  if (!deckId || !mode) {
    return res
      .status(400)
      .json({ error: "deckId and mode are required to save a session." });
  }

  const answered = Number(totalAnswered) || 0;
  const correctNum = Number(correct) || 0;
  const accuracy =
    answered > 0 ? Math.round((correctNum / answered) * 100) : 0;

  const sql = `
    INSERT INTO sessions (user_id, deck_id, mode, total_answered, correct, accuracy)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [userId, deckId, mode, answered, correctNum, accuracy],
    function (err) {
      if (err) {
        console.error("Error inserting session:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }

      res.status(201).json({
        id: this.lastID,
        deckId,
        mode,
        totalAnswered: answered,
        correct: correctNum,
        accuracy,
      });
    }
  );
});

function toISO(timestamp) {
  if (!timestamp) return timestamp;
  // SQLite CURRENT_TIMESTAMP returns "YYYY-MM-DD HH:MM:SS" in UTC.
  // Append "Z" so it parses as UTC instead of local time, then emit ISO.
  const date = new Date(`${timestamp}Z`);
  return Number.isNaN(date.getTime()) ? timestamp : date.toISOString();
}

// GET /api/sessions
router.get("/sessions", authMiddleware, (req, res) => {
  const userId = req.userId;
  const { deckId, limit } = req.query;

  let sql = `
    SELECT
      s.id,
      s.deck_id AS deckId,
      d.name AS deckName,
      s.mode,
      s.total_answered AS totalAnswered,
      s.correct,
      s.accuracy,
      s.started_at AS startedAt,
      s.finished_at AS finishedAt
    FROM sessions s
    JOIN decks d ON s.deck_id = d.id
    WHERE s.user_id = ?
  `;
  const params = [userId];

  if (deckId) {
    sql += " AND s.deck_id = ?";
    params.push(deckId);
  }

  sql += " ORDER BY s.started_at DESC";

  const lim = Number(limit) || 100;
  sql += " LIMIT ?";
  params.push(lim);

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Error loading sessions:", err);
      return res.status(500).json({ error: "Failed to load sessions" });
    }
    const normalized = rows.map((row) => ({
      ...row,
      startedAt: toISO(row.startedAt),
      finishedAt: toISO(row.finishedAt),
    }));
    res.json(normalized);
  });
});

module.exports = router;
