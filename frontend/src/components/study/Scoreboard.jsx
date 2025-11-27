// src/components/study/Scoreboard.jsx
import { computeAccuracy } from "../../utils/study";

function Scoreboard({
  currentDeckName,
  studyMode,
  totalAnswered,
  correctCount,
}) {
  const accuracy = computeAccuracy(totalAnswered, correctCount);

  return (
    <section
      style={{
        marginBottom: "1.25rem",
        padding: "0.9rem 1rem",
        borderRadius: "0.75rem",
        backgroundColor: "#e0f2fe",
        border: "1px solid #bae6fd",
        display: "flex",
        gap: "1.5rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#0369a1",
          }}
        >
          Deck
        </div>
        <div
          style={{
            fontWeight: 600,
            color: "#0f172a",
          }}
        >
          {currentDeckName || "Unnamed deck"}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#0369a1",
          }}
        >
          Mode
        </div>
        <div style={{ color: "#0f172a" }}>
          {studyMode === "normal"
            ? "Normal run (shuffled)"
            : "Endless mode (weighted, per user)"}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#0369a1",
          }}
        >
          Progress (this session)
        </div>
        <div style={{ color: "#0f172a" }}>
          {totalAnswered} answered · {correctCount} correct · {accuracy}%
          accuracy
        </div>
      </div>
    </section>
  );
}

export default Scoreboard;
