import {
  PAGE_SIZE,
  filterSessionsByDeck,
  paginateSessions,
  sortSessions,
} from "./sessionView.js";

export function buildSessionView({
  sessions,
  deckFilter,
  sortBy,
  sortDir,
  currentPage,
}) {
  const filtered = filterSessionsByDeck(sessions, deckFilter);
  const sorted = sortSessions(filtered, sortBy, sortDir);
  const { pageSessions, safePage, totalPages } = paginateSessions(
    sorted,
    currentPage,
    PAGE_SIZE
  );

  return { filtered, sorted, pageSessions, safePage, totalPages };
}
