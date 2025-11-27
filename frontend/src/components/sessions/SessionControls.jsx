// src/components/sessions/SessionControls.jsx

function SessionControls({
  deckFilter,
  onDeckFilterChange,
  sortBy,
  sortDir,
  onSortByChange,
  onSortDirChange,
  totalFiltered,
  page,
  totalPages,
}) {
  return (
    <div
      style={{
        marginBottom: "0.75rem",
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left: deck filter + sort controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <label
          style={{
            fontSize: "0.85rem",
            color: "#4b5563",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          Deck filter
          <input
            type="text"
            value={deckFilter}
            onChange={(e) => onDeckFilterChange(e.target.value)}
            placeholder="Type deck name or id..."
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
              minWidth: "180px",
            }}
          />
        </label>

        <label
          style={{
            fontSize: "0.85rem",
            color: "#4b5563",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          Sort by
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
            }}
          >
            <option value="date">Date</option>
            <option value="deck">Deck</option>
            <option value="accuracy">Accuracy</option>
          </select>
        </label>

        <label
          style={{
            fontSize: "0.85rem",
            color: "#4b5563",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          Direction
          <select
            value={sortDir}
            onChange={(e) => onSortDirChange(e.target.value)}
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontSize: "0.85rem",
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
      </div>

      {/* Right: summary */}
      <div
        style={{
          fontSize: "0.8rem",
          color: "#6b7280",
        }}
      >
        {totalFiltered} session
        {totalFiltered === 1 ? "" : "s"} after filter · Page {page} of{" "}
        {totalPages}
      </div>
    </div>
  );
}

export default SessionControls;
