import { parseCronExpression, getNextRuns } from './parser';

describe('parseCronExpression', () => {
  it('should parse a valid cron expression', () => {
    const result = parseCronExpression('* * * * *');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.description).toBe('Every minute');
  });

  it('should return an error for invalid expression', () => {
    const result = parseCronExpression('invalid cron');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should describe hourly cron correctly', () => {
    const result = parseCronExpression('0 * * * *');
    expect(result.valid).toBe(true);
    expect(result.description).toContain('hour');
  });

  it('should describe daily cron correctly', () => {
    const result = parseCronExpression('30 9 * * *');
    expect(result.valid).toBe(true);
    expect(result.description).toContain('09:30');
  });
});

describe('getNextRuns', () => {
  it('should return the correct number of next runs', () => {
    const runs = getNextRuns('* * * * *', 5);
    expect(runs).toHaveLength(5);
    runs.forEach(run => expect(run).toBeInstanceOf(Date));
  });

  it('should return empty array for invalid expression', () => {
    const runs = getNextRuns('not-valid', 5);
    expect(runs).toHaveLength(0);
  });

  it('should return runs in ascending order', () => {
    const runs = getNextRuns('*/5 * * * *', 3);
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i].getTime()).toBeGreaterThan(runs[i - 1].getTime());
    }
  });

  it('should default to 5 runs when count is not specified', () => {
    const runs = getNextRuns('0 0 * * *');
    expect(runs).toHaveLength(5);
  });
});
