// src/App.jsx
import { useEffect, useState } from "react";
import AddCardForm from "./components/AddCardForm";
import StudyView from "./components/StudyView";
import DeckManager from "./components/DeckManager";
import AuthPanel from "./components/AuthPanel";
import SessionsPage from "./components/SessionsPage";

const API_BASE = "http://localhost:3000";
const AUTH_STORAGE_KEY = "flashcardDojoAuth";

function App() {
  const [mode, setMode] = useState("manage"); // "manage" | "study"
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);

  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [auth, setAuth] = useState({ user: null, token: null });

  // Decide if this tab is the main app or the sessions view
  const [view] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "sessions" ? "sessions" : "app";
  });

  const currentDeckName =
    decks.find((d) => d.id === selectedDeckId)?.name || "";

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

  // Load decks on start
  useEffect(() => {
    fetch(`${API_BASE}/api/decks`)
      .then((res) => res.json())
      .then((data) => {
        setDecks(data);
        if (!selectedDeckId && data.length > 0) {
          setSelectedDeckId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Error loading decks:", err);
      });
  }, []);

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
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
