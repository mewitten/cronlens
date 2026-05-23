import { validateCronExpression } from './validator';

describe('validateCronExpression', () => {
  describe('valid expressions', () => {
    it('accepts a standard five-field expression', () => {
      const result = validateCronExpression('0 9 * * 1');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts wildcard-only expression', () => {
      expect(validateCronExpression('* * * * *').valid).toBe(true);
    });

    it('accepts preset @daily', () => {
      expect(validateCronExpression('@daily').valid).toBe(true);
    });

    it('accepts preset @hourly', () => {
      expect(validateCronExpression('@hourly').valid).toBe(true);
    });

    it('accepts step values', () => {
      expect(validateCronExpression('*/15 */2 * * *').valid).toBe(true);
    });

    it('accepts comma-separated values', () => {
      expect(validateCronExpression('0,30 9,17 * * 1,5').valid).toBe(true);
    });

    it('accepts range expressions', () => {
      expect(validateCronExpression('0 9-17 * * 1-5').valid).toBe(true);
    });

    it('accepts month aliases', () => {
      expect(validateCronExpression('0 0 1 jan *').valid).toBe(true);
    });

    it('accepts day-of-week aliases', () => {
      expect(validateCronExpression('0 9 * * mon-fri').valid).toBe(true);
    });
  });

  describe('invalid expressions', () => {
    it('rejects wrong field count', () => {
      const result = validateCronExpression('* * * *');
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Expected 5 fields/);
    });

    it('rejects out-of-range minute', () => {
      const result = validateCronExpression('60 * * * *');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Minute'))).toBe(true);
    });

    it('rejects out-of-range hour', () => {
      const result = validateCronExpression('0 25 * * *');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Hour'))).toBe(true);
    });

    it('rejects invalid step value', () => {
      const result = validateCronExpression('*/0 * * * *');
      expect(result.valid).toBe(false);
    });

    it('rejects inverted range', () => {
      const result = validateCronExpression('0 17-9 * * *');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('greater than end'))).toBe(true);
    });
  });

  describe('warnings', () => {
    it('warns when both day-of-month and day-of-week are set', () => {
      const result = validateCronExpression('0 9 15 * 1');
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
