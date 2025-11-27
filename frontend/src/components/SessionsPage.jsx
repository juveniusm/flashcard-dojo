// src/components/SessionsPage.jsx
import { useEffect, useState } from "react";
import SessionControls from "./sessions/SessionControls";
import SessionsTable from "./sessions/SessionsTable";
import PaginationBar from "./sessions/PaginationBar";
import {
  PAGE_SIZE,
  filterSessionsByDeck,
  sortSessions,
  paginateSessions,
} from "../utils/sessionView";

function SessionsPage({ apiBase, authToken }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [deckFilter, setDeckFilter] = useState("");
  const [sortBy, setSortBy] = useState("date"); // "date" | "deck" | "accuracy"
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch sessions when token changes
  useEffect(() => {
    if (!authToken) {
      setSessions([]);
      return;
    }

    setLoading(true);
    setError("");

    fetch(`${apiBase}/api/sessions?limit=500`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load sessions");
        }
        return res.json();
      })
      .then((data) => {
        setSessions(data || []);
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Error loading sessions:", err);
        setError("Failed to load sessions. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [apiBase, authToken]);

  // Not logged in: simple message
  if (!authToken) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "0.75rem",
            fontSize: "1.3rem",
          }}
        >
          Session history
        </h2>
        <p style={{ color: "#6b7280" }}>
          Please log in to view your past sessions.
        </p>
      </div>
    );
  }

  // Derived data: filter → sort → paginate
  const filtered = filterSessionsByDeck(sessions, deckFilter);
  const sorted = sortSessions(filtered, sortBy, sortDir);
  const { pageSessions, safePage, totalPages } = paginateSessions(
    sorted,
    currentPage,
    PAGE_SIZE
  );

  // Handlers
  const handleDeckFilterChange = (value) => {
    setDeckFilter(value);
    setCurrentPage(1);
  };

  const handleSortByChange = (value) => {
    setSortBy(value);
    // sensible defaults when changing column
    if (value === "deck") {
      setSortDir("asc");
    } else {
      setSortDir("desc");
    }
    setCurrentPage(1);
  };

  const handleSortDirChange = (value) => {
    setSortDir(value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          fontSize: "1.3rem",
        }}
      >
        Session history
      </h2>

      <p
        style={{
          marginTop: 0,
          marginBottom: "1rem",
          fontSize: "0.9rem",
          color: "#6b7280",
        }}
      >
        View your past study runs. Filter by deck, change sorting, or browse
        pages if you have a lot of sessions.
      </p>

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

      {loading && <p>Loading sessions...</p>}

      {error && (
        <p style={{ color: "#b91c1c", marginBottom: "0.75rem" }}>{error}</p>
      )}

      {!loading && !error && sorted.length === 0 && (
        <p style={{ color: "#6b7280" }}>No sessions match this filter.</p>
      )}

      {!loading && !error && sorted.length > 0 && (
        <>
          <SessionsTable sessions={pageSessions} />

          <PaginationBar
            page={safePage}
            totalPages={totalPages}
            onPrev={handlePrevPage}
            onNext={handleNextPage}
          />
        </>
      )}
    </div>
  );
}

export default SessionsPage;
