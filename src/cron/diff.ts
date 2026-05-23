import { getNextRuns } from './parser';

export interface CronDiffResult {
  expressionA: string;
  expressionB: string;
  nextRunsA: Date[];
  nextRunsB: Date[];
  onlyInA: Date[];
  onlyInB: Date[];
  shared: Date[];
  divergenceScore: number;
}

const DATE_TOLERANCE_MS = 1000;

function datesMatch(a: Date, b: Date): boolean {
  return Math.abs(a.getTime() - b.getTime()) <= DATE_TOLERANCE_MS;
}

/**
 * Compares two cron expressions by computing their next scheduled runs and
 * identifying which runs are shared, exclusive to A, or exclusive to B.
 *
 * @param expressionA - First cron expression
 * @param expressionB - Second cron expression
 * @param from - Start date for computing next runs (defaults to now)
 * @param count - Number of upcoming runs to compare for each expression
 * @returns A {@link CronDiffResult} containing shared/exclusive runs and a divergence score
 */
export function diffCronExpressions(
  expressionA: string,
  expressionB: string,
  from: Date = new Date(),
  count: number = 10
): CronDiffResult {
  const nextRunsA = getNextRuns(expressionA, count, from);
  const nextRunsB = getNextRuns(expressionB, count, from);

  const shared: Date[] = [];
  const onlyInA: Date[] = [];
  const onlyInB: Date[] = [];

  for (const a of nextRunsA) {
    const match = nextRunsB.find((b) => datesMatch(a, b));
    if (match) {
      shared.push(a);
    } else {
      onlyInA.push(a);
    }
  }

  for (const b of nextRunsB) {
    const match = nextRunsA.find((a) => datesMatch(a, b));
    if (!match) {
      onlyInB.push(b);
    }
  }

  const total = nextRunsA.length + nextRunsB.length;
  const divergenceScore =
    total === 0 ? 0 : Math.round(((onlyInA.length + onlyInB.length) / total) * 100);

  return {
    expressionA,
    expressionB,
    nextRunsA,
    nextRunsB,
    onlyInA,
    onlyInB,
    shared,
    divergenceScore,
  };
}

export function formatDiffSummary(result: CronDiffResult): string {
  return [
    `Expression A: "${result.expressionA}"`,
    `Expression B: "${result.expressionB}"`,
    `Shared runs:  ${result.shared.length}`,
    `Only in A:    ${result.onlyInA.length}`,
    `Only in B:    ${result.onlyInB.length}`,
    `Divergence:   ${result.divergenceScore}%`,
  ].join('\n');
}

/**
 * Returns true if two cron expressions are considered equivalent — i.e. all
 * sampled next runs match within the configured tolerance window.
 *
 * @param expressionA - First cron expression
 * @param expressionB - Second cron expression
 * @param from - Start date for computing next runs (defaults to now)
 * @param count - Number of upcoming runs to sample
 */
export function areCronExpressionsEquivalent(
  expressionA: string,
  expressionB: string,
  from: Date = new Date(),
  count: number = 10
): boolean {
  const result = diffCronExpressions(expressionA, expressionB, from, count);
  return result.divergenceScore === 0;
}
