// src/utils/weights.js

// How "heavy" is a card based on your past performance?
export function getCardWeight(card, statsById) {
  const stats = statsById[card.id];

  // Never seen: medium weight so it appears, but not spammy
  if (!stats || stats.seen === 0) {
    return 1;
  }

  const accuracy = stats.correct / stats.seen; // 0..1
  const errorRate = 1 - accuracy;             // 0..1

  // Base weight: mostly-right card ~0.3, mostly-wrong card ~1.3
  let weight = 0.3 + errorRate;

  // Extra bump if last attempt was wrong (hit again soon)
  if (stats.lastOutcome === "incorrect") {
    weight += 0.5;
  }

  // Safety minimum so nothing ever becomes 0
  if (weight < 0.1) weight = 0.1;

  return weight;
}

// Pick an index using weighted random
export function chooseWeightedIndex(cards, statsById) {
  if (!cards.length) return 0;

  const weights = cards.map((card) => getCardWeight(card, statsById));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  if (totalWeight <= 0) {
    // Fallback: uniform random
    return Math.floor(Math.random() * cards.length);
  }

  let r = Math.random() * totalWeight;

  for (let i = 0; i < cards.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      return i;
    }
  }

  // Fallback to last index if float weirdness
  return cards.length - 1;
}
