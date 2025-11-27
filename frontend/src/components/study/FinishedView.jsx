// src/components/study/FinishedView.jsx
import { computeAccuracy } from "../../utils/study";
import { formatNextReview } from "../../utils/decks";

function FinishedView({
  totalAnswered,
  correctCount,
  authToken,
  onRestartFull,
  nextReviewAt,
  reviewLevel,
}) {
  const accuracy = computeAccuracy(totalAnswered, correctCount);

  return (
    <section
      style={{
        padding: "1.5rem",
        borderRadius: "0.9rem",
        backgroundColor: "#ecfdf5",
        border: "1px solid #bbf7d0",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          fontSize: "1.3rem",
          color: "#14532d",
        }}
      >
        Deck complete 🎉
      </h2>
      <p style={{ marginBottom: "0.75rem", color: "#166534" }}>
        You answered {totalAnswered} question
        {totalAnswered === 1 ? "" : "s"}, with {correctCount} correct (
        {accuracy}% accuracy).
      </p>
      {nextReviewAt && (
        <p
          style={{
            marginTop: 0,
            marginBottom: "0.75rem",
            color: "#166534",
            fontSize: "0.9rem",
          }}
        >
          Next review: {formatNextReview(nextReviewAt)}
          {typeof reviewLevel === "number" && (
            <>
              {" "}(level {reviewLevel})
            </>
          )}
        </p>
      )}
      {!authToken && (
        <p style={{ fontSize: "0.85rem", color: "#166534" }}>
          Log in to keep a history of your completed sessions.
        </p>
      )}
      <button
        onClick={onRestartFull}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "999px",
          border: "none",
          backgroundColor: "#22c55e",
          color: "white",
          fontWeight: 600,
          fontSize: "0.95rem",
          cursor: "pointer",
        }}
      >
        Restart deck
      </button>
    </section>
  );
}

export default FinishedView;
