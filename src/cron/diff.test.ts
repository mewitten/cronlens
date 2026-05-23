import { diffCronExpressions, formatDiffSummary } from './diff';

const BASE = new Date('2024-01-01T00:00:00.000Z');

describe('diffCronExpressions', () => {
  it('returns zero divergence for identical expressions', () => {
    const result = diffCronExpressions('0 * * * *', '0 * * * *', BASE, 5);
    expect(result.shared.length).toBe(5);
    expect(result.onlyInA.length).toBe(0);
    expect(result.onlyInB.length).toBe(0);
    expect(result.divergenceScore).toBe(0);
  });

  it('detects fully divergent expressions', () => {
    const result = diffCronExpressions('0 * * * *', '30 * * * *', BASE, 4);
    expect(result.shared.length).toBe(0);
    expect(result.onlyInA.length).toBe(4);
    expect(result.onlyInB.length).toBe(4);
    expect(result.divergenceScore).toBe(100);
  });

  it('populates nextRunsA and nextRunsB with correct count', () => {
    const result = diffCronExpressions('0 * * * *', '0 0 * * *', BASE, 6);
    expect(result.nextRunsA.length).toBe(6);
    expect(result.nextRunsB.length).toBe(6);
  });

  it('shared runs appear in both expressions', () => {
    const result = diffCronExpressions('0 0 * * *', '0 0 * * *', BASE, 3);
    for (const date of result.shared) {
      const inA = result.nextRunsA.some((d) => d.getTime() === date.getTime());
      const inB = result.nextRunsB.some((d) => d.getTime() === date.getTime());
      expect(inA).toBe(true);
      expect(inB).toBe(true);
    }
  });

  it('divergenceScore is between 0 and 100', () => {
    const result = diffCronExpressions('15 * * * *', '45 * * * *', BASE, 8);
    expect(result.divergenceScore).toBeGreaterThanOrEqual(0);
    expect(result.divergenceScore).toBeLessThanOrEqual(100);
  });
});

describe('formatDiffSummary', () => {
  it('includes both expressions and key metrics', () => {
    const result = diffCronExpressions('0 * * * *', '30 * * * *', BASE, 4);
    const summary = formatDiffSummary(result);
    expect(summary).toContain('0 * * * *');
    expect(summary).toContain('30 * * * *');
    expect(summary).toContain('Divergence');
    expect(summary).toContain('Shared runs');
  });
});
