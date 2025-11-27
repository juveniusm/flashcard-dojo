// src/components/Flashcard.jsx
import { useState, useRef, useEffect } from "react";
import { isFuzzyMatch } from "../utils/fuzzyMatch";

function ImageWithModal({ imageUrl }) {
  const [showImageModal, setShowImageModal] = useState(false);

  const openImageModal = (e) => {
    e.stopPropagation();
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  return (
    <>
      {/* Thumbnail inside the card */}
      <div
        onClick={openImageModal}
        style={{
          marginBottom: "0.75rem",
          borderRadius: "0.75rem",
          overflow: "hidden",
          backgroundColor: "#000000",
          cursor: "zoom-in",
        }}
      >
        <img
          src={imageUrl}
          alt="Flashcard"
          style={{
            width: "100%",
            maxHeight: "260px",
            display: "block",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Fullscreen modal */}
      {showImageModal && (
        <div
          onClick={closeImageModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <button
              onClick={closeImageModal}
              style={{
                position: "absolute",
                top: "-2.5rem",
                right: 0,
                padding: "0.3rem 0.7rem",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#f9fafb",
                color: "#111827",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ×
            </button>
            <img
              src={imageUrl}
              alt="Flashcard enlarged"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                display: "block",
                borderRadius: "0.75rem",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

function Flashcard({ card, apiBase, onResult }) {
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult] = useState(null); // "correct" | "incorrect" | null

  const imageUrl = card.imagePath ? apiBase + card.imagePath : null;
  const explanationImageUrl = card.explanationImagePath
    ? apiBase + card.explanationImagePath
    : null;

  const inputRef = useRef(null);

  // Focus input whenever this card mounts / changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [card.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = userAnswer.trim();
    if (!trimmed) return;

    const correct = isFuzzyMatch(trimmed, card.answer);
    const outcome = correct ? "correct" : "incorrect";

    setResult(outcome);

    // Always inform parent; StudyView handles scoring/weighting
    if (onResult) {
      onResult(outcome);
    }
  };

  const resetState = () => {
    setUserAnswer("");
    setResult(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      style={{
        textAlign: "left",
        width: "100%",
        backgroundColor: "#ffffff",
        padding: "1.25rem",
        borderRadius: "0.9rem",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e5e7eb",
      }}
    >
      {imageUrl && <ImageWithModal imageUrl={imageUrl} />}

      <h2
        style={{
          fontSize: "0.85rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#6b7280",
          marginTop: 0,
          marginBottom: "0.5rem",
        }}
      >
        Question
      </h2>
      <p
        style={{
          marginTop: 0,
          marginBottom: "1rem",
          fontSize: "1rem",
          color: "#111827",
        }}
      >
        {card.question}
      </p>

      {/* Answer form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "0.75rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.85rem",
            marginBottom: "0.25rem",
            color: "#4b5563",
          }}
        >
          Your answer
        </label>
        <input
          ref={inputRef}
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem 0.6rem",
            borderRadius: "0.5rem",
            border:
              result === "correct"
                ? "2px solid #16a34a"
                : result === "incorrect"
                ? "2px solid #dc2626"
                : "1px solid #d1d5db",
            fontFamily: "inherit",
            fontSize: "0.95rem",
          }}
        />
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <button
            type="submit"
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Check
          </button>
          {result !== null && (
            <button
              type="button"
              onClick={resetState}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Feedback + explanation */}
      {result && (
        <div style={{ marginTop: "0.5rem" }}>
          {result === "correct" ? (
            <div
              style={{
                marginBottom: "0.5rem",
                fontSize: "0.95rem",
                color: "#16a34a",
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>✅ Correct!</p>
            </div>
          ) : (
            <div
              style={{
                marginBottom: "0.5rem",
                fontSize: "0.95rem",
                color: "#b91c1c",
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>❌ Not quite.</p>
            </div>
          )}

          <p
            style={{
              margin: 0,
              marginBottom: "0.5rem",
              color: "#374151",
              fontSize: "0.9rem",
            }}
          >
            Correct answer: <strong>{card.answer}</strong>
          </p>

          {card.explanation && (
            <div
              style={{
                marginTop: "0.5rem",
                paddingTop: "0.5rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <h3
                style={{
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#6b7280",
                  margin: 0,
                  marginBottom: "0.25rem",
                }}
              >
                Explanation
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "#374151",
                  fontSize: "0.9rem",
                  whiteSpace: "pre-wrap",
                }}
              >
                {card.explanation}
              </p>

              {explanationImageUrl && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    backgroundColor: "#000000",
                    cursor: "zoom-in",
                  }}
                >
                  <ImageWithModal imageUrl={explanationImageUrl} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Flashcard;
