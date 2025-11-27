const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "flashcards.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Enable foreign keys
  db.run("PRAGMA foreign_keys = ON;");

  // Decks table (shared across all users)
  db.run(`
    CREATE TABLE IF NOT EXISTS decks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      review_level INTEGER NOT NULL DEFAULT 0,
      next_review_at TEXT
    )
  `);

  // Cards table (shared across all users)
  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deck_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      explanation TEXT,
      image_path TEXT,
      explanation_image_path TEXT,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    )
  `);

  // Ensure at least one default deck exists
  db.run(`
    INSERT OR IGNORE INTO decks (id, name)
    VALUES (1, 'Default deck')
  `);

  // Lightweight migration for existing installations
  db.all("PRAGMA table_info(decks)", (err, columns) => {
    if (err) {
      console.error("Failed to inspect decks table", err);
      return;
    }

    const hasReviewLevel = columns.some((c) => c.name === "review_level");
    const hasNextReviewAt = columns.some((c) => c.name === "next_review_at");

    if (!hasReviewLevel) {
      db.run(
        "ALTER TABLE decks ADD COLUMN review_level INTEGER NOT NULL DEFAULT 0"
      );
    }

    if (!hasNextReviewAt) {
      db.run("ALTER TABLE decks ADD COLUMN next_review_at TEXT");
    }

    const nowIso = new Date().toISOString();
    db.run(
      "UPDATE decks SET review_level = COALESCE(review_level, 0)"
    );
    db.run(
      "UPDATE decks SET next_review_at = COALESCE(next_review_at, ?)",
      [nowIso]
    );
  });

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Per-user card progress
  db.run(`
    CREATE TABLE IF NOT EXISTS card_progress (
      user_id INTEGER NOT NULL,
      card_id INTEGER NOT NULL,
      seen INTEGER NOT NULL DEFAULT 0,
      correct INTEGER NOT NULL DEFAULT 0,
      last_outcome TEXT,
      PRIMARY KEY (user_id, card_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    )
  `);

  // Per-user sessions (completed runs)
    db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      deck_id INTEGER NOT NULL,
      mode TEXT NOT NULL,
      total_answered INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      accuracy REAL NOT NULL,
      started_at TEXT DEFAULT CURRENT_TIMESTAMP,
      finished_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;

