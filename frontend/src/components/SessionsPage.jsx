import { useCallback, useState } from "react";
import useSessionsData from "../hooks/useSessionsData";
import useSessionView from "../hooks/useSessionView";
import SessionControls from "./sessions/SessionControls";
import SessionsContent from "./sessions/SessionsContent";
import SessionsPageHeader from "./sessions/SessionsPageHeader";

function SessionsPage({ apiBase, authToken }) {
  const [deckFilter, setDeckFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const resetPage = useCallback(() => setCurrentPage(1), []);
  const { sessions, loading, error } = useSessionsData(
    apiBase,
    authToken,
    resetPage
  );

  const { filtered, sorted, pageSessions, safePage, totalPages } = useSessionView({
    sessions,
    deckFilter,
    sortBy,
    sortDir,
    currentPage,
  });

  const handleDeckFilterChange = (value) => {
    setDeckFilter(value);
    resetPage();
  };

  const handleSortByChange = (value) => {
    setSortBy(value);
    if (value === "deck") {
      setSortDir("asc");
    } else {
      setSortDir("desc");
    }
    resetPage();
  };

  const handleSortDirChange = (value) => {
    setSortDir(value);
    resetPage();
  };

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  };

  if (!authToken) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <SessionsPageHeader description="Please log in to view your past sessions." />
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem" }}>
      <SessionsPageHeader
        description="View your past study runs. Filter by deck, change sorting, or browse pages if you have a lot of sessions."
      />

      <SessionControls
        deckFilter={deckFilter}
        onDeckFilterChange={handleDeckFilterChange}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortByChange={handleSortByChange}
        onSortDirChange={handleSortDirChange}
        totalFiltered={filtered.length}
        page={safePage}
        totalPages={totalPages}
      />

      <SessionsContent
        loading={loading}
        error={error}
        sortedSessions={sorted}
        pageSessions={pageSessions}
        page={safePage}
        totalPages={totalPages}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
      />
    </div>
  );
}

export default SessionsPage;
