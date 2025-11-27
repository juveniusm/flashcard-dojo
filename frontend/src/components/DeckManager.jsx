// src/components/DeckManager.jsx
import { useState } from "react";

function DeckManager({ apiBase, decks }) {
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [error, setError] = useState("");

  const [editingCardId, setEditingCardId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editExplanation, setEditExplanation] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; // cards per page

  const selectedDeckName =
    decks.find((d) => d.id === selectedDeckId)?.name || "";

  const handleSelectDeck = (deckId) => {
    setSelectedDeckId(deckId);
    setEditingCardId(null);
    setError("");
    setLoadingCards(true);
    setSearchTerm("");
    setCurrentPage(1);

    fetch(`${apiBase}/api/cards?deckId=${deckId}`)
      .then((res) => res.json())
      .then((data) => {
        setCards(data);
        setLoadingCards(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load cards for this deck.");
        setLoadingCards(false);
      });
  };

  const startEdit = (card) => {
    setEditingCardId(card.id);
    setEditQuestion(card.question || "");
    setEditAnswer(card.answer || "");
    setEditExplanation(card.explanation || "");
  };

  const cancelEdit = () => {
    setEditingCardId(null);
    setEditQuestion("");
    setEditAnswer("");
    setEditExplanation("");
  };

  const saveEdit = () => {
    if (!editingCardId) return;

    const body = {
      question: editQuestion,
      answer: editAnswer,
      explanation: editExplanation,
    };

    fetch(`${apiBase}/api/cards/${editingCardId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update card");
        return res.json();
      })
      .then((updated) => {
        setCards((prev) =>
          prev.map((card) =>
            card.id === editingCardId
              ? {
                  ...card,
                  question: updated.question,
                  answer: updated.answer,
                  explanation: updated.explanation,
                }
              : card
          )
        );
        cancelEdit();
      })
      .catch((err) => {
        console.error(err);
        alert("There was a problem updating the card.");
      });
  };

  const deleteCard = (cardId) => {
    const confirmDelete = window.confirm(
      "Delete this card? This cannot be undone."
    );
    if (!confirmDelete) return;

    fetch(`${apiBase}/api/cards/${cardId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete card");
        return res.json();
      })
      .then(() => {
        setCards((prev) => prev.filter((card) => card.id !== cardId));
      })
      .catch((err) => {
        console.error(err);
        alert("There was a problem deleting the card.");
      });
  };

  // --- Search + pagination logic ---

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredCards = normalizedSearch
    ? cards.filter((card) => {
        const q = (card.question || "").toLowerCase();
        const a = (card.answer || "").toLowerCase();
        const e = (card.explanation || "").toLowerCase();
        return (
          q.includes(normalizedSearch) ||
          a.includes(normalizedSearch) ||
          e.includes(normalizedSearch)
        );
      })
    : cards;

  const totalCards = filteredCards.length;
  const totalPages = totalCards > 0 ? Math.ceil(totalCards / pageSize) : 1;

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageCards = filteredCards.slice(startIndex, endIndex);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  return (
    <section
      style={{
        marginTop: "2rem",
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
        Deck & card manager
      </h2>
      <p
        style={{
          marginTop: 0,
          marginBottom: "1rem",
          fontSize: "0.9rem",
          color: "#6b7280",
        }}
      >
        Select a deck on the left. Use search and paging to quickly find and
        edit specific cards.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(160px, 220px) 1fr",
          gap: "1.25rem",
        }}
      >
        {/* Deck list */}
        <div>
          <h3
            style={{
              marginTop: 0,
              marginBottom: "0.5rem",
              fontSize: "0.95rem",
              color: "#374151",
            }}
          >
            Decks
          </h3>
          <div
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
            }}
          >
            {decks.length === 0 ? (
              <p
                style={{
                  margin: "0.75rem",
                  fontSize: "0.9rem",
                  color: "#6b7280",
                }}
              >
                No decks yet. Create one above first.
              </p>
            ) : (
              decks.map((deck) => (
                <button
                  key={deck.id}
                  onClick={() => handleSelectDeck(deck.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.5rem 0.75rem",
                    border: "none",
                    borderBottom: "1px solid #e5e7eb",
                    backgroundColor:
                      deck.id === selectedDeckId ? "#e0f2fe" : "transparent",
                    color:
                      deck.id === selectedDeckId ? "#0f172a" : "#374151",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  {deck.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Card list / editor */}
        <div>
          <h3
            style={{
              marginTop: 0,
              marginBottom: "0.5rem",
              fontSize: "0.95rem",
              color: "#374151",
            }}
          >
            {selectedDeckId
              ? `Cards in "${selectedDeckName}"`
              : "Select a deck to view its cards"}
          </h3>

          {error && (
            <p style={{ color: "#b91c1c", fontSize: "0.9rem" }}>{error}</p>
          )}

          {!selectedDeckId && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.9rem",
                color: "#6b7280",
              }}
            >
              Choose a deck from the list on the left.
            </p>
          )}

          {selectedDeckId && (
            <>
              {/* Search box */}
              <div
                style={{
                  marginBottom: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder="Search in questions, answers, explanations..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{
                    flex: "1 1 200px",
                    minWidth: "220px",
                    padding: "0.4rem 0.5rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                  }}
                />

                {totalCards > 0 && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      textAlign: "right",
                    }}
                  >
                    Showing{" "}
                    <strong>
                      {startIndex + 1}–{Math.min(endIndex, totalCards)}
                    </strong>{" "}
                    of <strong>{totalCards}</strong> card
                    {totalCards === 1 ? "" : "s"}
                  </div>
                )}
              </div>

              {loadingCards && <p>Loading cards...</p>}

              {!loadingCards && totalCards === 0 && (
                <p
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.9rem",
                    color: "#6b7280",
                  }}
                >
                  {searchTerm
                    ? "No cards match your search."
                    : "This deck has no cards yet."}
                </p>
              )}

              {!loadingCards && totalCards > 0 && (
                <>
                  {/* Cards for this page */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {pageCards.map((card) => {
                      const isEditing = editingCardId === card.id;
                      return (
                        <div
                          key={card.id}
                          style={{
                            padding: "0.75rem",
                            borderRadius: "0.75rem",
                            border: "1px solid #e5e7eb",
                            backgroundColor: "#f9fafb",
                          }}
                        >
                          {isEditing ? (
                            <>
                              <label
                                style={{
                                  display: "block",
                                  fontSize: "0.8rem",
                                  marginBottom: "0.25rem",
                                  color: "#4b5563",
                                }}
                              >
                                Question
                              </label>
                              <textarea
                                value={editQuestion}
                                onChange={(e) =>
                                  setEditQuestion(e.target.value)
                                }
                                rows={2}
                                style={{
                                  width: "100%",
                                  padding: "0.4rem 0.5rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid #d1d5db",
                                  fontFamily: "inherit",
                                  fontSize: "0.9rem",
                                  marginBottom: "0.5rem",
                                }}
                              />

                              <label
                                style={{
                                  display: "block",
                                  fontSize: "0.8rem",
                                  marginBottom: "0.25rem",
                                  color: "#4b5563",
                                }}
                              >
                                Answer
                              </label>
                              <textarea
                                value={editAnswer}
                                onChange={(e) =>
                                  setEditAnswer(e.target.value)
                                }
                                rows={2}
                                style={{
                                  width: "100%",
                                  padding: "0.4rem 0.5rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid #d1d5db",
                                  fontFamily: "inherit",
                                  fontSize: "0.9rem",
                                  marginBottom: "0.5rem",
                                }}
                              />

                              <label
                                style={{
                                  display: "block",
                                  fontSize: "0.8rem",
                                  marginBottom: "0.25rem",
                                  color: "#4b5563",
                                }}
                              >
                                Explanation (optional)
                              </label>
                              <textarea
                                value={editExplanation}
                                onChange={(e) =>
                                  setEditExplanation(e.target.value)
                                }
                                rows={3}
                                style={{
                                  width: "100%",
                                  padding: "0.4rem 0.5rem",
                                  borderRadius: "0.5rem",
                                  border: "1px solid #d1d5db",
                                  fontFamily: "inherit",
                                  fontSize: "0.9rem",
                                  marginBottom: "0.5rem",
                                }}
                              />

                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.5rem",
                                  marginTop: "0.25rem",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  style={{
                                    padding: "0.35rem 0.9rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    backgroundColor: "#22c55e",
                                    color: "white",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  style={{
                                    padding: "0.35rem 0.9rem",
                                    borderRadius: "999px",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "#ffffff",
                                    color: "#374151",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p
                                style={{
                                  margin: 0,
                                  marginBottom: "0.25rem",
                                  fontSize: "0.9rem",
                                  fontWeight: 600,
                                  color: "#111827",
                                }}
                              >
                                Q: {card.question}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  marginBottom: "0.25rem",
                                  fontSize: "0.9rem",
                                  color: "#111827",
                                }}
                              >
                                A: {card.answer}
                              </p>
                              {card.explanation && (
                                <p
                                  style={{
                                    margin: 0,
                                    marginTop: "0.25rem",
                                    fontSize: "0.85rem",
                                    color: "#4b5563",
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  Explanation: {card.explanation}
                                </p>
                              )}

                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.5rem",
                                  marginTop: "0.5rem",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => startEdit(card)}
                                  style={{
                                    padding: "0.3rem 0.8rem",
                                    borderRadius: "999px",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "#ffffff",
                                    color: "#111827",
                                    fontSize: "0.85rem",
                                    cursor: "pointer",
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteCard(card.id)}
                                  style={{
                                    padding: "0.3rem 0.8rem",
                                    borderRadius: "999px",
                                    border: "none",
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination controls */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        fontSize: "0.85rem",
                        color: "#4b5563",
                      }}
                    >
                      <div>
                        Page <strong>{safePage}</strong> of{" "}
                        <strong>{totalPages}</strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.35rem",
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => goToPage(1)}
                          disabled={safePage === 1}
                          style={{
                            padding: "0.25rem 0.55rem",
                            borderRadius: "999px",
                            border: "1px solid #d1d5db",
                            backgroundColor:
                              safePage === 1 ? "#f3f4f6" : "#ffffff",
                            cursor:
                              safePage === 1 ? "default" : "pointer",
                          }}
                        >
                          «
                        </button>
                        <button
                          type="button"
                          onClick={() => goToPage(safePage - 1)}
                          disabled={safePage === 1}
                          style={{
                            padding: "0.25rem 0.55rem",
                            borderRadius: "999px",
                            border: "1px solid #d1d5db",
                            backgroundColor:
                              safePage === 1 ? "#f3f4f6" : "#ffffff",
                            cursor:
                              safePage === 1 ? "default" : "pointer",
                          }}
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          onClick={() => goToPage(safePage + 1)}
                          disabled={safePage === totalPages}
                          style={{
                            padding: "0.25rem 0.55rem",
                            borderRadius: "999px",
                            border: "1px solid #d1d5db",
                            backgroundColor:
                              safePage === totalPages
                                ? "#f3f4f6"
                                : "#ffffff",
                            cursor:
                              safePage === totalPages
                                ? "default"
                                : "pointer",
                          }}
                        >
                          Next
                        </button>
                        <button
                          type="button"
                          onClick={() => goToPage(totalPages)}
                          disabled={safePage === totalPages}
                          style={{
                            padding: "0.25rem 0.55rem",
                            borderRadius: "999px",
                            border: "1px solid #d1d5db",
                            backgroundColor:
                              safePage === totalPages
                                ? "#f3f4f6"
                                : "#ffffff",
                            cursor:
                              safePage === totalPages
                                ? "default"
                                : "pointer",
                          }}
                        >
                          »
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default DeckManager;
