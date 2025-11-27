import assert from "node:assert/strict";
import test from "node:test";
import { buildSessionView } from "./sessionViewState.js";

const sampleSessions = [
  {
    id: 1,
    deckId: 12,
    deckName: "Biology Basics",
    accuracy: 0.8,
    startedAt: "2024-12-28T10:00:00Z",
  },
  {
    id: 2,
    deckId: 15,
    deckName: "Math Drills",
    accuracy: 0.95,
    startedAt: "2024-12-29T09:00:00Z",
  },
  {
    id: 3,
    deckId: 15,
    deckName: "Math Drills",
    accuracy: 0.6,
    startedAt: "2024-12-27T09:00:00Z",
  },
];

test("filters by deck name and paginates the results", () => {
  const { filtered, sorted, safePage, totalPages, pageSessions } = buildSessionView({
    sessions: sampleSessions,
    deckFilter: "math",
    sortBy: "deck",
    sortDir: "asc",
    currentPage: 5,
  });

  assert.equal(filtered.length, 2);
  assert.equal(sorted[0].id, 2);
  assert.equal(totalPages, 1);
  assert.equal(safePage, 1);
  assert.deepEqual(
    pageSessions.map((s) => s.id),
    sorted.map((s) => s.id)
  );
});

test("sorts by accuracy and respects current page", () => {
  const { sorted, pageSessions, safePage } = buildSessionView({
    sessions: sampleSessions,
    deckFilter: "",
    sortBy: "accuracy",
    sortDir: "desc",
    currentPage: 1,
  });

  assert.equal(sorted[0].id, 2);
  assert.equal(sorted[1].id, 1);
  assert.equal(sorted[2].id, 3);
  assert.equal(pageSessions[0].id, 2);
  assert.equal(safePage, 1);
});
