import { CronExpression, parseExpression } from 'cron-parser';

export interface ParseResult {
  valid: boolean;
  expression?: CronExpression;
  error?: string;
  description?: string;
}

const FIELD_NAMES = ['second', 'minute', 'hour', 'day of month', 'month', 'day of week'];

export function parseCronExpression(raw: string): ParseResult {
  try {
    const expression = parseExpression(raw, { iterator: true });
    return {
      valid: true,
      expression,
      description: describeCron(raw),
    };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid cron expression',
    };
  }
}

export function getNextRuns(raw: string, count: number = 5): Date[] {
  try {
    const expression = parseExpression(raw, { iterator: true });
    const runs: Date[] = [];
    for (let i = 0; i < count; i++) {
      const next = expression.next() as { value: { toDate: () => Date } };
      runs.push(next.value.toDate());
    }
    return runs;
  } catch {
    return [];
  }
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length === 5) {
    const [min, hour, dom, month, dow] = parts;
    if (expr === '* * * * *') return 'Every minute';
    if (min === '0' && hour === '*') return `Every hour at minute ${min}`;
    if (dom === '*' && month === '*' && dow === '*') {
      return `At ${hour.padStart(2, '0')}:${min.padStart(2, '0')} every day`;
    }
    return `Custom schedule (${FIELD_NAMES.slice(1).join(', ')})`;
  }
  return 'Custom schedule';
}
