// src/App.jsx
import { useCallback, useEffect, useState } from "react";
import AddCardForm from "./components/AddCardForm";
import StudyView from "./components/StudyView";
import DeckManager from "./components/DeckManager";
import AuthPanel from "./components/AuthPanel";
import AuthPage from "./components/AuthPage";
import SessionsPage from "./components/SessionsPage";
import { isDeckDue, formatNextReview } from "./utils/decks";

const API_BASE = "http://localhost:3000";
const AUTH_STORAGE_KEY = "flashcardDojoAuth";

function App() {
  const [mode, setMode] = useState("manage"); // "manage" | "study"
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showDueOnly, setShowDueOnly] = useState(false);

  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [auth, setAuth] = useState({ user: null, token: null });

  // Decide if this tab is the main app or the sessions view
  const [view] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "sessions" ? "sessions" : "app";
  });

  const currentDeck = decks.find((d) => d.id === selectedDeckId);
  const currentDeckName = currentDeck?.name || "";

  // --- Restore auth from localStorage on startup (for all views) ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token) {
        setAuth(parsed);
      }
    } catch (err) {
      console.error("Error restoring auth from storage:", err);
    }
  }, []);

  // Wrapper so AuthPanel changes also sync to localStorage
  const handleAuthChange = (nextAuth) => {
    setAuth(nextAuth);

    if (!nextAuth?.token) {
      setDecks([]);
      setSelectedDeckId(null);
      setCards([]);
    }

    try {
      if (nextAuth && nextAuth.token) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Error saving auth to storage:", err);
    }
  };

  const loadDecks = useCallback(() => {
    if (!auth?.token) return;

    const query = showDueOnly ? "?dueOnly=true" : "";
    fetch(`${API_BASE}/api/decks${query}`)
      .then((res) => res.json())
      .then((data) => {
        setDecks(data);

        setSelectedDeckId((prevSelected) => {
          if (data.length === 0) return null;

          const stillExists = data.some((d) => d.id === prevSelected);
          if (stillExists) return prevSelected;

          return data[0].id;
        });

        if (data.length === 0) {
          setSelectedDeckId(null);
          return;
        }

        // Keep the current selection if still present, otherwise fall back to the first deck
        const stillExists = data.some((d) => d.id === selectedDeckId);
        if (!stillExists) {
          setSelectedDeckId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Error loading decks:", err);
      });
  }, [auth?.token, selectedDeckId, showDueOnly]);

  // Load decks on start and when toggling due-only filter
  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // Load cards when deck changes
  useEffect(() => {
    if (!selectedDeckId) {
      setCards([]);
      return;
    }
    setLoadingCards(true);
    fetch(`${API_BASE}/api/cards?deckId=${selectedDeckId}`)
      .then((res) => res.json())
      .then((data) => {
        setCards(data);
        setLoadingCards(false);
        setTotalAnswered(0);
        setCorrectCount(0);
      })
      .catch((err) => {
        console.error("Error loading cards:", err);
        setLoadingCards(false);
      });
  }, [selectedDeckId]);

  const handleSelectDeck = (event) => {
    const id = Number(event.target.value);
    setSelectedDeckId(id || null);
  };

  const handleCardCreated = (newCard) => {
    if (newCard.deckId === selectedDeckId) {
      setCards((prev) => [...prev, newCard]);
    }
  };

  const handleDeckScheduleUpdate = (updatedDeck) => {
    setDecks((prev) => {
      let next = prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d));
      const exists = next.some((d) => d.id === updatedDeck.id);
      if (!exists) {
        next = [...next, updatedDeck];
      }
      if (showDueOnly && !isDeckDue(updatedDeck.nextReviewAt)) {
        next = next.filter((d) => d.id !== updatedDeck.id);
      }
      return next;
    });

    if (showDueOnly && !isDeckDue(updatedDeck.nextReviewAt)) {
      const fallbackDeck = decks.find((d) => d.id !== updatedDeck.id);
      if (selectedDeckId === updatedDeck.id) {
        setSelectedDeckId(fallbackDeck ? fallbackDeck.id : null);
      }
      loadDecks();
    }
  };

  const handleResult = (outcome) => {
    setTotalAnswered((prev) => prev + 1);
    if (outcome === "correct") {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleRestart = () => {
    setTotalAnswered(0);
    setCorrectCount(0);
  };

  const openSessionsInNewTab = () => {
    const url = `${window.location.origin}?view=sessions`;
    window.open(url, "_blank", "noopener");
  };

  if (!auth.user) {
    return (
      <AuthPage apiBase={API_BASE} auth={auth} onAuthChange={handleAuthChange} />
    );
  }

  // --- Layout shared between views ---
  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #e0f2fe, transparent 55%), radial-gradient(circle at bottom right, #fee2e2, transparent 55%)",
        padding: "1.5rem 0.75rem",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.18)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "1.4rem",
                color: "#0f172a",
              }}
            >
              Flashcard Dojo
              {view === "sessions" ? " – Sessions" : ""}
            </h1>

            {view === "app" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <label
                    style={{
                      fontSize: "0.85rem",
                      color: "#4b5563",
                    }}
                  >
                    Deck:
                  </label>
                  <select
                    value={selectedDeckId || ""}
                    onChange={handleSelectDeck}
                    style={{
                      padding: "0.35rem 0.6rem",
                      borderRadius: "999px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.9rem",
                    }}
                  >
                    {decks.length === 0 && (
                      <option value="">No decks yet</option>
                    )}
                    {decks.map((deck) => (
                      <option key={deck.id} value={deck.id}>
                        {deck.name}
                        {isDeckDue(deck.nextReviewAt) ? " (Due)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.85rem",
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showDueOnly}
                    onChange={(e) => setShowDueOnly(e.target.checked)}
                  />
                  Show only due decks
                </label>
              </div>
            )}
          </div>

          {view === "app" && currentDeck && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#4b5563",
                fontSize: "0.9rem",
              }}
            >
              <span
                style={{
                  padding: "0.15rem 0.6rem",
                  borderRadius: "999px",
                  backgroundColor: isDeckDue(currentDeck.nextReviewAt)
                    ? "#fee2e2"
                    : "#e0f2fe",
                  color: isDeckDue(currentDeck.nextReviewAt)
                    ? "#991b1b"
                    : "#075985",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                }}
              >
                {isDeckDue(currentDeck.nextReviewAt) ? "Due" : "Scheduled"}
              </span>
              <span>
                Next review: {formatNextReview(currentDeck.nextReviewAt)}
              </span>
            </div>
          )}

          {view === "app" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  borderRadius: "999px",
                  backgroundColor: "#e5e7eb",
                  padding: "0.25rem",
                }}
              >
                <button
                  onClick={() => setMode("manage")}
                  style={{
                    padding: "0.25rem 0.8rem",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor:
                      mode === "manage" ? "#ffffff" : "transparent",
                    color: mode === "manage" ? "#111827" : "#4b5563",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Build deck
                </button>
                <button
                  onClick={() => setMode("study")}
                  style={{
                    padding: "0.25rem 0.8rem",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor:
                      mode === "study" ? "#ffffff" : "transparent",
                    color: mode === "study" ? "#111827" : "#4b5563",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Study deck
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                  }}
                >
                  Practice is shared, progress is per user.
                </span>
                {auth.user && (
                  <button
                    type="button"
                    onClick={openSessionsInNewTab}
                    style={{
                      padding: "0.3rem 0.8rem",
                      borderRadius: "999px",
                      border: "none",
                      backgroundColor: "#0369a1",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    View past sessions
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Auth bar */}
        <AuthPanel
          apiBase={API_BASE}
          auth={auth}
          onAuthChange={handleAuthChange}
        />

        <main>
          {view === "sessions" ? (
            <SessionsPage apiBase={API_BASE} authToken={auth.token} />
          ) : mode === "manage" ? (
            <>
              <AddCardForm
                apiBase={API_BASE}
                selectedDeckId={selectedDeckId}
                currentDeckName={currentDeckName}
                onCardCreated={handleCardCreated}
              />

              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                When you’re ready to practice, switch to{" "}
                <strong>Study deck</strong> above.
              </p>

              <DeckManager apiBase={API_BASE} decks={decks} />
            </>
          ) : (
              <StudyView
                apiBase={API_BASE}
                cards={cards}
                loadingCards={loadingCards}
                currentDeckName={currentDeckName}
                currentDeckId={selectedDeckId}
                totalAnswered={totalAnswered}
                correctCount={correctCount}
                onResult={handleResult}
                onRestart={handleRestart}
                authToken={auth.token}
                onDeckScheduled={handleDeckScheduleUpdate}
                nextReviewAt={currentDeck?.nextReviewAt}
              />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
