// src/utils/sessionView.js

export const PAGE_SIZE = 10;

export function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

// Filter by deck name or id, case-insensitive
export function filterSessionsByDeck(sessions, filterText) {
  const normalized = filterText.trim().toLowerCase();
  if (!normalized) return sessions;

  return sessions.filter((s) => {
    const name = (s.deckName || "").toLowerCase();
    const idStr = String(s.deckId || "");
    return name.includes(normalized) || idStr.includes(normalized);
  });
}

// Sort by date, deck name, or accuracy
export function sortSessions(sessions, sortBy, sortDir) {
  const dir = sortDir === "asc" ? 1 : -1;
  const copy = [...sessions];

  return copy.sort((a, b) => {
    if (sortBy === "deck") {
      const nameA = (a.deckName || "").toLowerCase();
      const nameB = (b.deckName || "").toLowerCase();
      if (nameA < nameB) return -1 * dir;
      if (nameA > nameB) return 1 * dir;
      // tie-breaker: newest first
      return (new Date(b.startedAt) - new Date(a.startedAt)) || 0;
    }

    if (sortBy === "accuracy") {
      const accA = typeof a.accuracy === "number" ? a.accuracy : 0;
      const accB = typeof b.accuracy === "number" ? b.accuracy : 0;
      if (accA < accB) return -1 * dir;
      if (accA > accB) return 1 * dir;
      // tie-breaker: newest first
      return (new Date(b.startedAt) - new Date(a.startedAt)) || 0;
    }

    // default: date
    const timeA = new Date(a.startedAt).getTime();
    const timeB = new Date(b.startedAt).getTime();
    if (timeA < timeB) return -1 * dir;
    if (timeA > timeB) return 1 * dir;
    return 0;
  });
}

// Pagination helper: returns pageSessions + metadata
export function paginateSessions(sessions, currentPage, pageSize = PAGE_SIZE) {
  const totalPages =
    sessions.length === 0 ? 1 : Math.ceil(sessions.length / pageSize);

  const safePage = Math.min(
    Math.max(currentPage, 1),
    Math.max(totalPages, 1)
  );

  const startIndex = (safePage - 1) * pageSize;
  const pageSessions = sessions.slice(startIndex, startIndex + pageSize);

  return { pageSessions, safePage, totalPages };
}
