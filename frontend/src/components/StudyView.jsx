// src/components/StudyView.jsx
import { useEffect, useState } from "react";
import Flashcard from "./Flashcard";
import ModeToggle from "./study/ModeToggle";
import Scoreboard from "./study/Scoreboard";
import FinishedView from "./study/FinishedView";
import EndlessSessionModal from "./study/EndlessSessionModal";
import { chooseWeightedIndex } from "../utils/weights";
import { shuffleCards, getActiveCards } from "../utils/study";

function StudyView({
  apiBase,
  cards,
  loadingCards,
  currentDeckName,
  currentDeckId,
  totalAnswered,
  correctCount,
  onResult, // "correct" | "incorrect"
  onRestart,
  authToken,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastOutcome, setLastOutcome] = useState(null); // "correct" | "incorrect" | null
  const [studyMode, setStudyMode] = useState("normal"); // "normal" | "endless"
  const [cardStats, setCardStats] = useState({}); // per-card stats for weighting
  const [shuffledCards, setShuffledCards] = useState([]); // order used in normal mode
  const [sessionLogged, setSessionLogged] = useState(false); // ensure we only log once
  const [endlessModalOpen, setEndlessModalOpen] = useState(false); // popup after ending endless session

  const activeCards = getActiveCards(studyMode, shuffledCards, cards);
  const finished =
    studyMode === "normal" && currentIndex >= activeCards.length;

  //
  // Helper to send session to backend
  //
  const logSession = (modeToSave, answeredToSave, correctToSave) => {
    if (!authToken || !currentDeckId || answeredToSave === 0) {
      // No user / no deck / nothing answered: nothing to save
      return Promise.resolve();
    }

    const payload = {
      deckId: currentDeckId,
      mode: modeToSave,
      totalAnswered: answeredToSave,
      correct: correctToSave,
    };

    return fetch(`${apiBase}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((d) => {
              throw new Error(d.error || "Failed to save session");
            })
            .catch(() => {
              throw new Error("Failed to save session");
            });
        }
      })
      .catch((err) => {
        console.error("Error saving session:", err);
      });
  };

  //
  // Effects
  //

  // When the card list changes (deck switch), restart and create a new shuffle
  useEffect(() => {
    setCurrentIndex(0);
    setLastOutcome(null);
    setCardStats({});
    setShuffledCards(shuffleCards(cards));
    setSessionLogged(false);
    setEndlessModalOpen(false);
  }, [cards]);

  // Load saved per-card progress when logged in & deck selected
  useEffect(() => {
    if (!authToken || !currentDeckId || !cards.length) {
      return;
    }

    fetch(`${apiBase}/api/progress/cards?deckId=${currentDeckId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load progress");
        }
        return res.json();
      })
      .then((rows) => {
        const stats = {};
        rows.forEach((row) => {
          stats[row.cardId] = {
            seen: row.seen,
            correct: row.correct,
            lastOutcome: row.lastOutcome,
          };
        });
        setCardStats(stats);
      })
      .catch((err) => {
        console.error("Error loading card progress:", err);
      });
  }, [authToken, currentDeckId, apiBase, cards]);

  // Keyboard: after you've answered, pressing Enter goes to the next card
  useEffect(() => {
    function goToNextCard() {
      if (!activeCards.length) return;

      if (studyMode === "normal") {
        if (currentIndex + 1 >= activeCards.length) {
          setCurrentIndex(activeCards.length);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      } else {
        const nextIndex = chooseWeightedIndex(cards, cardStats);
        setCurrentIndex(nextIndex);
      }

      setLastOutcome(null);
    }

    function handleKeyDown(e) {
      if (e.key === "Enter" && lastOutcome) {
        e.preventDefault();
        goToNextCard();
      }
    }

    if (lastOutcome) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [lastOutcome, currentIndex, cards, activeCards, studyMode, cardStats]);

  // When we finish a normal run, log a session once (if logged in)
  useEffect(() => {
    if (!finished || sessionLogged || totalAnswered === 0) {
      return;
    }

    logSession(studyMode, totalAnswered, correctCount).finally(() => {
      setSessionLogged(true);
    });
  }, [finished, sessionLogged, totalAnswered, correctCount, studyMode]);

  //
  // Early returns
  //

  if (loadingCards) {
    return <p>Loading cards...</p>;
  }

  if (!cards || cards.length === 0) {
    return (
      <p style={{ color: "#6b7280" }}>
        This deck has no cards yet. Switch to <strong>Build deck</strong> and
        add some questions first.
      </p>
    );
  }

  //
  // Handlers
  //

  const handleRestartFull = () => {
    onRestart();
    setCurrentIndex(0);
    setLastOutcome(null);
    setCardStats({});
    setShuffledCards(shuffleCards(cards));
    setSessionLogged(false);
    setEndlessModalOpen(false);
  };

  const handleSelectNormal = () => {
    setStudyMode("normal");
    setCurrentIndex(0);
    setLastOutcome(null);
    setCardStats({});
    setShuffledCards(shuffleCards(cards));
    setSessionLogged(false);
    setEndlessModalOpen(false);
    onRestart();
  };

  const handleSelectEndless = () => {
    setStudyMode("endless");
    setCurrentIndex(0);
    setLastOutcome(null);
    setCardStats({});
    setSessionLogged(false);
    setEndlessModalOpen(false);
    onRestart();
  };

  const handleNextClick = () => {
    if (!lastOutcome || !activeCards.length) return;

    if (studyMode === "normal") {
      if (currentIndex + 1 >= activeCards.length) {
        setCurrentIndex(activeCards.length);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      const nextIndex = chooseWeightedIndex(cards, cardStats);
      setCurrentIndex(nextIndex);
    }

    setLastOutcome(null);
  };

  // End the current endless session and save it, then show big modal
  const handleEndEndlessSession = () => {
    // Always reset the run and show the modal; logging is optional
    const answeredToSave = totalAnswered;
    const correctToSave = correctCount;

    const afterLog = () => {
      setSessionLogged(true);
      handleRestartFull(); // clears counters and reshuffles
      setEndlessModalOpen(true); // show popup in the middle
    };

    if (answeredToSave === 0) {
      // Nothing answered, just reset + modal
      afterLog();
      return;
    }

    // Save session as "endless", then reset + show modal
    logSession("endless", answeredToSave, correctToSave).finally(afterLog);
  };

  const handleCardResult = (outcome) => {
    // Update global score in App
    onResult(outcome);

    const card = activeCards[currentIndex];
    if (!card) return;

    // Update local stats for weighting
    setLastOutcome(outcome);
    setCardStats((prev) => {
      const prevStats = prev[card.id] || {
        seen: 0,
        correct: 0,
        lastOutcome: null,
      };

      const nextStats = {
        seen: prevStats.seen + 1,
        correct:
          outcome === "correct"
            ? prevStats.correct + 1
            : prevStats.correct,
        lastOutcome: outcome,
      };

      return {
        ...prev,
        [card.id]: nextStats,
      };
    });

    // Persist per-card progress if logged in
    if (authToken) {
      fetch(`${apiBase}/api/progress/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          cardId: card.id,
          outcome,
        }),
      }).catch((err) => {
        console.error("Error saving progress:", err);
      });
    }
  };

  //
  // Finished state (normal run)
  //

  if (finished) {
    return (
      <>
        <FinishedView
          totalAnswered={totalAnswered}
          correctCount={correctCount}
          authToken={authToken}
          onRestartFull={handleRestartFull}
        />
        <EndlessSessionModal
          open={endlessModalOpen}
          onClose={() => setEndlessModalOpen(false)}
        />
      </>
    );
  }

  const card = activeCards[currentIndex];

  //
  // Main render
  //

  return (
    <>
      <ModeToggle
        studyMode={studyMode}
        onSelectNormal={handleSelectNormal}
        onSelectEndless={handleSelectEndless}
      />

      <Scoreboard
        currentDeckName={currentDeckName}
        studyMode={studyMode}
        totalAnswered={totalAnswered}
        correctCount={correctCount}
      />

      <p
        style={{
          marginBottom: "0.75rem",
          color: "#6b7280",
          fontSize: "0.9rem",
        }}
      >
        Card {currentIndex + 1} of {cards.length}
      </p>

      <Flashcard
        key={card.id + "-" + currentIndex + "-" + studyMode}
        card={card}
        apiBase={apiBase}
        onResult={handleCardResult}
      />

      <div
        style={{
          marginTop: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <span
          style={{
            fontSize: "0.85rem",
            color: lastOutcome ? "#4b5563" : "#9ca3af",
          }}
        >
          {lastOutcome
            ? "Press Enter or click Next to continue"
            : "Type your answer and press Enter to check"}
        </span>

        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          {studyMode === "endless" && (
            <button
              type="button"
              onClick={handleEndEndlessSession}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#ef4444",
                color: "white",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              End session
            </button>
          )}

          <button
            onClick={handleNextClick}
            disabled={!lastOutcome}
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: lastOutcome ? "#2563eb" : "#9ca3af",
              color: "white",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: lastOutcome ? "pointer" : "default",
            }}
          >
            {studyMode === "normal" && currentIndex + 1 >= activeCards.length
              ? "Finish deck"
              : "Next card"}
          </button>
        </div>
      </div>

      <EndlessSessionModal
        open={endlessModalOpen}
        onClose={() => setEndlessModalOpen(false)}
      />
    </>
  );
}

export default StudyView;
