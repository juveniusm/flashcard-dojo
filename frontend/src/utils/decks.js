export function isDeckDue(nextReviewAt) {
  if (!nextReviewAt) return true;
  const now = new Date();
  const next = new Date(nextReviewAt);
  if (Number.isNaN(next.getTime())) return true;
  return next <= now;
}

export function formatNextReview(nextReviewAt) {
  if (!nextReviewAt) return "Due now";
  const next = new Date(nextReviewAt);
  if (Number.isNaN(next.getTime())) return "Due now";

  const now = new Date();
  const diffMs = next.getTime() - now.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

