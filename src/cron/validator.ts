/**
 * Validates cron expressions and provides detailed error messages.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const FIELD_RANGES: Record<string, { min: number; max: number; name: string }> = {
  minute:     { min: 0,  max: 59, name: 'Minute' },
  hour:       { min: 0,  max: 23, name: 'Hour' },
  dayOfMonth: { min: 1,  max: 31, name: 'Day of month' },
  month:      { min: 1,  max: 12, name: 'Month' },
  dayOfWeek:  { min: 0,  max: 7,  name: 'Day of week' },
};

const MONTH_ALIASES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const DOW_ALIASES: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

function resolveAlias(value: string, aliases: Record<string, number>): string {
  const lower = value.toLowerCase();
  return aliases[lower] !== undefined ? String(aliases[lower]) : value;
}

function validateField(
  field: string,
  fieldKey: keyof typeof FIELD_RANGES,
  aliases: Record<string, number> = {}
): string[] {
  const errors: string[] = [];
  const { min, max, name } = FIELD_RANGES[fieldKey];

  if (field === '*') return errors;

  const parts = field.split(',');
  for (const part of parts) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    const rangeStr = stepMatch ? stepMatch[1] : part;
    const step = stepMatch ? parseInt(stepMatch[2], 10) : null;

    if (step !== null && step < 1) {
      errors.push(`${name}: step value must be >= 1`);
    }

    if (rangeStr === '*') continue;

    const rangeParts = rangeStr.split('-').map(v => resolveAlias(v, aliases));
    for (const rp of rangeParts) {
      const num = parseInt(rp, 10);
      if (isNaN(num)) {
        errors.push(`${name}: invalid value "${rp}"`);
      } else if (num < min || num > max) {
        errors.push(`${name}: value ${num} out of range [${min}-${max}]`);
      }
    }

    if (rangeParts.length === 2) {
      const [lo, hi] = rangeParts.map(Number);
      if (!isNaN(lo) && !isNaN(hi) && lo > hi) {
        errors.push(`${name}: range start ${lo} is greater than end ${hi}`);
      }
    }
  }

  return errors;
}

export function validateCronExpression(expression: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const trimmed = expression.trim();

  // Handle presets
  const presets = ['@yearly', '@annually', '@monthly', '@weekly', '@daily', '@midnight', '@hourly'];
  if (presets.includes(trimmed)) {
    return { valid: true, errors: [], warnings: [] };
  }

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) {
    errors.push(`Expected 5 fields, got ${fields.length}`);
    return { valid: false, errors, warnings };
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields;

  errors.push(...validateField(minute,     'minute'));
  errors.push(...validateField(hour,       'hour'));
  errors.push(...validateField(dayOfMonth, 'dayOfMonth'));
  errors.push(...validateField(month,      'month', MONTH_ALIASES));
  errors.push(...validateField(dayOfWeek,  'dayOfWeek', DOW_ALIASES));

  if (dayOfMonth !== '*' && dayOfWeek !== '*') {
    warnings.push('Both day-of-month and day-of-week are specified; runs when either matches');
  }

  return { valid: errors.length === 0, errors, warnings };
}
