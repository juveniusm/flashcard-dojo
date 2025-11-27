// backend/routes/deckRoutes.js
const express = require("express");
const db = require("../db");
const {
  adjustReviewLevel,
  getIntervalDays,
  truncateToUTCDate,
  addDays,
  findAvailableReviewDate,
  MAX_DECKS_PER_DAY,
} = require("../utils/reviewSchedule");

const router = express.Router();

// GET /api/decks
router.get("/decks", (req, res) => {
  const dueOnly = req.query.dueOnly === "true";
  const nowIso = new Date().toISOString();

  const baseSelect =
    "SELECT id, name, review_level AS reviewLevel, next_review_at AS nextReviewAt FROM decks";

  const sql = dueOnly
    ? `${baseSelect} WHERE next_review_at IS NULL OR next_review_at <= ? ORDER BY next_review_at IS NULL DESC, next_review_at ASC, name ASC`
    : `${baseSelect} ORDER BY name`;

  const params = dueOnly ? [nowIso] : [];

  db.all(sql, params, (err, rows) => {
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

  const nowIso = new Date().toISOString();
  const sql =
    "INSERT INTO decks (name, review_level, next_review_at) VALUES (?, 0, ?)";
  db.run(sql, [name.trim(), nowIso], function (err) {
    if (err) {
      console.error("Error creating deck:", err);
      return res.status(500).json({ error: "Failed to create deck" });
    }

    res.status(201).json({
      id: this.lastID,
      name: name.trim(),
      reviewLevel: 0,
      nextReviewAt: nowIso,
    });
  });
});

function countDecksScheduledForDate(date, deckIdToSkip) {
  const startIso = date.toISOString();
  const endIso = addDays(date, 1).toISOString();

  return new Promise((resolve, reject) => {
    let sql =
      "SELECT COUNT(*) as count FROM decks WHERE next_review_at >= ? AND next_review_at < ?";
    const params = [startIso, endIso];

    if (deckIdToSkip) {
      sql += " AND id != ?";
      params.push(deckIdToSkip);
    }

    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count || 0);
      }
    });
  });
}

// POST /api/decks/:deckId/completeRun
router.post("/decks/:deckId/completeRun", async (req, res) => {
  const deckId = Number(req.params.deckId);
  const { correctCount, totalCount, completedAt } = req.body || {};

  if (!Number.isInteger(deckId)) {
    return res.status(400).json({ error: "Invalid deck id" });
  }

  if (
    typeof correctCount !== "number" ||
    typeof totalCount !== "number" ||
    totalCount <= 0 ||
    correctCount < 0 ||
    correctCount > totalCount
  ) {
    return res.status(400).json({ error: "Invalid score payload" });
  }

  const deck = await new Promise((resolve) => {
    db.get(
      "SELECT id, name, review_level AS reviewLevel FROM decks WHERE id = ?",
      [deckId],
      (err, row) => {
        if (err) {
          console.error("Error loading deck:", err);
          return resolve(null);
        }
        resolve(row);
      }
    );
  });

  if (!deck) {
    return res.status(404).json({ error: "Deck not found" });
  }

  const scorePercent = (correctCount / totalCount) * 100;
  const updatedLevel = adjustReviewLevel(scorePercent, deck.reviewLevel || 0);
  const intervalDays = getIntervalDays(updatedLevel);

  const completedDate = completedAt ? new Date(completedAt) : new Date();
  if (Number.isNaN(completedDate.getTime())) {
    return res.status(400).json({ error: "Invalid completion date" });
  }

  const baseDate = truncateToUTCDate(addDays(completedDate, intervalDays));

  try {
    const nextDate = await findAvailableReviewDate(
      baseDate,
      (date) => countDecksScheduledForDate(date, deckId),
      MAX_DECKS_PER_DAY
    );

    const nextReviewAtIso = nextDate.toISOString();

    await new Promise((resolve, reject) => {
      db.run(
        "UPDATE decks SET review_level = ?, next_review_at = ? WHERE id = ?",
        [updatedLevel, nextReviewAtIso, deckId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({
      id: deckId,
      name: deck.name,
      reviewLevel: updatedLevel,
      nextReviewAt: nextReviewAtIso,
      scorePercent,
    });
  } catch (err) {
    console.error("Error scheduling deck review:", err);
    res.status(500).json({ error: "Failed to schedule next review" });
  }
});

module.exports = router;
