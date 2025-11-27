import { useMemo } from "react";
import { buildSessionView } from "../utils/sessionViewState";

function useSessionView({
  sessions,
  deckFilter,
  sortBy,
  sortDir,
  currentPage,
}) {
  return useMemo(
    () =>
      buildSessionView({
        sessions,
        deckFilter,
        sortBy,
        sortDir,
        currentPage,
      }),
    [sessions, deckFilter, sortBy, sortDir, currentPage]
  );
}

export default useSessionView;
