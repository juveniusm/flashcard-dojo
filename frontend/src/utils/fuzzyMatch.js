// src/utils/fuzzyMatch.js

export function normalizeAnswer(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

export function isFuzzyMatch(userInput, correctAnswer) {
  const a = normalizeAnswer(userInput);
  const b = normalizeAnswer(correctAnswer);

  if (!a || !b) return false;
  if (a === b) return true;

  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);

  // allow up to 20% of characters to be wrong (at least 1)
  const allowed = Math.max(1, Math.floor(maxLen * 0.2));

  return distance <= allowed;
}
