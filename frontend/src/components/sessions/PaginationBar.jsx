// src/components/sessions/PaginationBar.jsx

function PaginationBar({ page, totalPages, onPrev, onNext }) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div
      style={{
        marginTop: "0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.5rem",
      }}
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirst}
        style={{
          padding: "0.35rem 0.8rem",
          borderRadius: "999px",
          border: "1px solid #d1d5db",
          backgroundColor: isFirst ? "#f3f4f6" : "#ffffff",
          color: "#374151",
          fontSize: "0.85rem",
          cursor: isFirst ? "default" : "pointer",
        }}
      >
        ← Previous
      </button>

      <div
        style={{
          fontSize: "0.85rem",
          color: "#6b7280",
        }}
      >
        Page {page} of {totalPages}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        style={{
          padding: "0.35rem 0.8rem",
          borderRadius: "999px",
          border: "1px solid #d1d5db",
          backgroundColor: isLast ? "#f3f4f6" : "#ffffff",
          color: "#374151",
          fontSize: "0.85rem",
          cursor: isLast ? "default" : "pointer",
        }}
      >
        Next →
      </button>
    </div>
  );
}

export default PaginationBar;
