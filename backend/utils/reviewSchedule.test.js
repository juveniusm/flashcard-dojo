const { test, describe } = require("node:test");
const assert = require("assert");

const {
  REVIEW_INTERVALS_DAYS,
  MAX_DECKS_PER_DAY,
  adjustReviewLevel,
  getIntervalDays,
  truncateToUTCDate,
  addDays,
  findAvailableReviewDate,
} = require("./reviewSchedule");

describe("reviewSchedule", () => {
  test("adjustReviewLevel moves up, stays, or down based on score", () => {
    assert.strictEqual(adjustReviewLevel(90, 0), 1);
    assert.strictEqual(adjustReviewLevel(85, 1), 2);
    assert.strictEqual(adjustReviewLevel(84.9, 3), 3);
    assert.strictEqual(adjustReviewLevel(60, 4), 4);
    assert.strictEqual(adjustReviewLevel(59.9, 2), 1);
    assert.strictEqual(adjustReviewLevel(10, 0), 0);
  });

  test("getIntervalDays clamps to the ladder", () => {
    assert.strictEqual(getIntervalDays(0), REVIEW_INTERVALS_DAYS[0]);
    assert.strictEqual(getIntervalDays(5), REVIEW_INTERVALS_DAYS[5]);
    assert.strictEqual(
      getIntervalDays(999),
      REVIEW_INTERVALS_DAYS[REVIEW_INTERVALS_DAYS.length - 1]
    );
  });

  test("truncateToUTCDate keeps only the date portion", () => {
    const d = new Date("2024-05-01T15:30:00.000Z");
    const truncated = truncateToUTCDate(d);
    assert.strictEqual(truncated.toISOString(), "2024-05-01T00:00:00.000Z");
  });

  test("addDays moves time forward in UTC", () => {
    const base = new Date("2024-05-01T00:00:00.000Z");
    const plusTwo = addDays(base, 2);
    assert.strictEqual(plusTwo.toISOString(), "2024-05-03T00:00:00.000Z");
  });

  test("findAvailableReviewDate shifts forward when a day is full", async () => {
    const base = new Date("2024-05-01T00:00:00.000Z");
    const countsByDate = {
      "2024-05-01": MAX_DECKS_PER_DAY,
      "2024-05-02": MAX_DECKS_PER_DAY,
      "2024-05-03": 2,
    };

    const countDecksScheduledForDate = async (date) => {
      const key = date.toISOString().slice(0, 10);
      return countsByDate[key] ?? 0;
    };

    const target = await findAvailableReviewDate(
      addDays(base, 1),
      countDecksScheduledForDate
    );

    assert.strictEqual(target.toISOString(), "2024-05-03T00:00:00.000Z");
  });
});

