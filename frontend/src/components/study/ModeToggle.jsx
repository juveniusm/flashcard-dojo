// src/components/study/ModeToggle.jsx

function ModeToggle({ studyMode, onSelectNormal, onSelectEndless }) {
  return (
    <div
      style={{
        marginBottom: "0.75rem",
        display: "inline-flex",
        borderRadius: "999px",
        backgroundColor: "#e5e7eb",
        padding: "0.25rem",
      }}
    >
      <button
        onClick={onSelectNormal}
        style={{
          padding: "0.25rem 0.8rem",
          borderRadius: "999px",
          border: "none",
          backgroundColor: studyMode === "normal" ? "#ffffff" : "transparent",
          color: studyMode === "normal" ? "#111827" : "#4b5563",
          fontWeight: 600,
          fontSize: "0.8rem",
          cursor: "pointer",
        }}
      >
        Normal run
      </button>
      <button
        onClick={onSelectEndless}
        style={{
          padding: "0.25rem 0.8rem",
          borderRadius: "999px",
          border: "none",
          backgroundColor: studyMode === "endless" ? "#ffffff" : "transparent",
          color: studyMode === "endless" ? "#111827" : "#4b5563",
          fontWeight: 600,
          fontSize: "0.8rem",
          cursor: "pointer",
        }}
      >
        Endless mode
      </button>
    </div>
  );
}

export default ModeToggle;
