const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 120];
const MAX_DECKS_PER_DAY = 10;

function clampLevel(level) {
  if (Number.isNaN(level) || level < 0) return 0;
  const max = REVIEW_INTERVALS_DAYS.length - 1;
  return Math.min(level, max);
}

function adjustReviewLevel(scorePercent, currentLevel) {
  const baseLevel = clampLevel(currentLevel || 0);
  if (scorePercent >= 85) {
    return clampLevel(baseLevel + 1);
  }
  if (scorePercent >= 60) {
    return baseLevel;
  }
  return clampLevel(baseLevel - 1);
}

function getIntervalDays(level) {
  const index = clampLevel(level);
  return REVIEW_INTERVALS_DAYS[index];
}

function truncateToUTCDate(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addDays(date, days) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return new Date(date.getTime() + days * msPerDay);
}

async function findAvailableReviewDate(baseDate, countDecksScheduledForDate, maxPerDay = MAX_DECKS_PER_DAY) {
  let date = truncateToUTCDate(baseDate);
  while (true) {
    const scheduledCount = await countDecksScheduledForDate(date);
    if (scheduledCount < maxPerDay) {
      return date;
    }
    date = addDays(date, 1);
  }
}

module.exports = {
  REVIEW_INTERVALS_DAYS,
  MAX_DECKS_PER_DAY,
  adjustReviewLevel,
  getIntervalDays,
  truncateToUTCDate,
  addDays,
  findAvailableReviewDate,
};
