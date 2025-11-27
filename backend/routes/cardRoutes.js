// backend/routes/cardRoutes.js
const express = require("express");
const db = require("../db");
const { upload } = require("../upload");

const router = express.Router();

// GET /api/cards?deckId=...
router.get("/cards", (req, res) => {
  const { deckId } = req.query;

  let sql = `
    SELECT
      id,
      deck_id AS deckId,
      question,
      answer,
      explanation,
      image_path AS imagePath,
      explanation_image_path AS explanationImagePath
    FROM cards
  `;
  const params = [];

  if (deckId) {
    sql += " WHERE deck_id = ?";
    params.push(deckId);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Error reading cards from database:", err);
      return res.status(500).json({ error: "Failed to load cards" });
    }
    res.json(rows);
  });
});

// POST /api/cards (with optional images)
router.post(
  "/cards",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "explanationImage", maxCount: 1 },
  ]),
  (req, res) => {
    const { question, answer, deckId, explanation } = req.body;

    if (!question || !answer || !deckId) {
      return res.status(400).json({
        error: "Question, answer, and deckId are required.",
      });
    }

    const questionImageFile =
      req.files && req.files.image && req.files.image[0]
        ? req.files.image[0]
        : null;

    const explanationImageFile =
      req.files &&
      req.files.explanationImage &&
      req.files.explanationImage[0]
        ? req.files.explanationImage[0]
        : null;

    const imagePath = questionImageFile
      ? `/uploads/${questionImageFile.filename}`
      : null;

    const explanationImagePath = explanationImageFile
      ? `/uploads/${explanationImageFile.filename}`
      : null;

    const sql = `
      INSERT INTO cards (
        deck_id,
        question,
        answer,
        explanation,
        image_path,
        explanation_image_path
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      deckId,
      question,
      answer,
      explanation || null,
      imagePath,
      explanationImagePath,
    ];

    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error inserting card:", err);
        return res.status(500).json({ error: "Failed to save card" });
      }

      const newCard = {
        id: this.lastID,
        deckId: Number(deckId),
        question,
        answer,
        explanation: explanation || null,
        imagePath,
        explanationImagePath,
      };

      res.status(201).json(newCard);
    });
  }
);

// PUT /api/cards/:id
router.put("/cards/:id", (req, res) => {
  const cardId = Number(req.params.id);
  const { question, answer, explanation } = req.body;

  if (!question || !question.trim() || !answer || !answer.trim()) {
    return res
      .status(400)
      .json({ error: "Question and answer are required." });
  }

  const sql = `
    UPDATE cards
    SET question = ?, answer = ?, explanation = ?
    WHERE id = ?
  `;
  const params = [question.trim(), answer.trim(), explanation || null, cardId];

  db.run(sql, params, function (err) {
    if (err) {
      console.error("Error updating card:", err);
      return res.status(500).json({ error: "Failed to update card" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json({
      id: cardId,
      question: question.trim(),
      answer: answer.trim(),
      explanation: explanation || null,
    });
  });
});

// DELETE /api/cards/:id
router.delete("/cards/:id", (req, res) => {
  const cardId = Number(req.params.id);

  const sql = "DELETE FROM cards WHERE id = ?";
  db.run(sql, [cardId], function (err) {
    if (err) {
      console.error("Error deleting card:", err);
      return res.status(500).json({ error: "Failed to delete card" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    res.json({ success: true });
  });
});

module.exports = router;
