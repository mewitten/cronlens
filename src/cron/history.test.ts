import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  loadHistory,
  saveHistory,
  addToHistory,
  clearHistory,
  getRecentExpressions,
  HistoryEntry,
} from './history';

const HISTORY_FILE = path.join(os.homedir(), '.cronlens_history.json');

beforeEach(() => {
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
});

afterAll(() => {
  if (fs.existsSync(HISTORY_FILE)) {
    fs.unlinkSync(HISTORY_FILE);
  }
});

describe('loadHistory', () => {
  it('returns empty array when no history file exists', () => {
    expect(loadHistory()).toEqual([]);
  });

  it('returns parsed entries when history file exists', () => {
    const entries: HistoryEntry[] = [
      { expression: '* * * * *', description: 'Every minute', lastUsed: '2024-01-01T00:00:00.000Z', useCount: 1 },
    ];
    saveHistory(entries);
    expect(loadHistory()).toEqual(entries);
  });
});

describe('addToHistory', () => {
  it('adds a new expression to history', () => {
    const result = addToHistory('0 9 * * 1-5', 'Weekdays at 9am');
    expect(result).toHaveLength(1);
    expect(result[0].expression).toBe('0 9 * * 1-5');
    expect(result[0].useCount).toBe(1);
  });

  it('increments useCount for existing expression', () => {
    addToHistory('* * * * *', 'Every minute');
    const result = addToHistory('* * * * *', 'Every minute');
    expect(result).toHaveLength(1);
    expect(result[0].useCount).toBe(2);
  });
});

describe('getRecentExpressions', () => {
  it('returns expressions up to the given limit', () => {
    addToHistory('* * * * *', 'Every minute');
    addToHistory('0 0 * * *', 'Daily midnight');
    const recent = getRecentExpressions(1);
    expect(recent).toHaveLength(1);
  });
});

describe('clearHistory', () => {
  it('removes all history entries', () => {
    addToHistory('* * * * *', 'Every minute');
    clearHistory();
    expect(loadHistory()).toEqual([]);
  });
});
