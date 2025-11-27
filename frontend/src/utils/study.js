// src/utils/study.js

// Shuffle helper for normal runs
export function shuffleCards(cards) {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function computeAccuracy(totalAnswered, correctCount) {
  if (!totalAnswered) return 0;
  return Math.round((correctCount / totalAnswered) * 100);
}

export function getActiveCards(studyMode, shuffledCards, cards) {
  if (studyMode === "normal") {
    return shuffledCards.length === cards.length ? shuffledCards : cards;
  }
  return cards;
}
