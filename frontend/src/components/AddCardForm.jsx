// src/components/AddCardForm.jsx
import { useState } from "react";

function AddCardForm({
  apiBase,
  selectedDeckId,
  currentDeckName,
  onCardCreated,
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [explanationImageFile, setExplanationImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDeckId) {
      alert("Please create or select a deck first.");
      return;
    }

    if (!question.trim() || !answer.trim()) {
      alert("Please enter both a question and an answer.");
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append("question", question);
    formData.append("answer", answer);
    formData.append("deckId", selectedDeckId);
    if (explanation.trim()) {
      formData.append("explanation", explanation);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }
    if (explanationImageFile) {
      formData.append("explanationImage", explanationImageFile);
    }

    fetch(`${apiBase}/api/cards`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save card");
        return res.json();
      })
      .then((createdCard) => {
        onCardCreated(createdCard);
        setQuestion("");
        setAnswer("");
        setExplanation("");
        setImageFile(null);
        setExplanationImageFile(null);
      })
      .catch((err) => {
        console.error(err);
        alert("There was a problem saving the card.");
      })
      .finally(() => setSaving(false));
  };

  return (
    <section
      style={{
        marginBottom: "1.75rem",
        padding: "1.25rem",
        backgroundColor: "#ffffff",
        borderRadius: "0.9rem",
        boxShadow: "0 6px 16px rgba(15, 23, 42, 0.06)",
        border: "1px solid #e5e7eb",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: "0.75rem",
          fontSize: "1.1rem",
          color: "#111827",
        }}
      >
        Add a new flashcard
        {currentDeckName ? ` in "${currentDeckName}"` : ""}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Question */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              marginBottom: "0.25rem",
              color: "#374151",
            }}
          >
            Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              padding: "0.5rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontFamily: "inherit",
              fontSize: "0.95rem",
            }}
          />
        </div>

        {/* Question image */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              marginBottom: "0.25rem",
              color: "#374151",
            }}
          >
            Image for question (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Answer */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              marginBottom: "0.25rem",
              color: "#374151",
            }}
          >
            Correct answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              padding: "0.5rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontFamily: "inherit",
              fontSize: "0.95rem",
            }}
          />
        </div>

        {/* Explanation text (optional) */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              marginBottom: "0.25rem",
              color: "#374151",
            }}
          >
            Explanation (optional)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            placeholder="Explain why this is the answer, add teaching points, etc."
            style={{
              width: "100%",
              padding: "0.5rem 0.6rem",
              borderRadius: "0.5rem",
              border: "1px solid #d1d5db",
              fontFamily: "inherit",
              fontSize: "0.95rem",
            }}
          />
        </div>

        {/* Explanation image (optional) */}
        <div style={{ marginBottom: "0.75rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              marginBottom: "0.25rem",
              color: "#374151",
            }}
          >
            Explanation image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setExplanationImageFile(e.target.files?.[0] ?? null)
            }
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: saving ? "#9ca3af" : "#2563eb",
            color: "white",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: saving ? "default" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Add card"}
        </button>
      </form>
    </section>
  );
}

export default AddCardForm;
