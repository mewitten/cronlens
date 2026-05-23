import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface HistoryEntry {
  expression: string;
  description: string;
  lastUsed: string;
  useCount: number;
}

const HISTORY_FILE = path.join(os.homedir(), '.cronlens_history.json');
const MAX_HISTORY = 20;

export function loadHistory(): HistoryEntry[] {
  try {
    if (!fs.existsSync(HISTORY_FILE)) return [];
    const raw = fs.readFileSync(HISTORY_FILE, 'utf-8');
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch {
    // silently fail if we can't write history
  }
}

export function addToHistory(expression: string, description: string): HistoryEntry[] {
  const entries = loadHistory();
  const existing = entries.find((e) => e.expression === expression);

  if (existing) {
    existing.lastUsed = new Date().toISOString();
    existing.useCount += 1;
    existing.description = description;
  } else {
    entries.unshift({
      expression,
      description,
      lastUsed: new Date().toISOString(),
      useCount: 1,
    });
  }

  const trimmed = entries
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, MAX_HISTORY);

  saveHistory(trimmed);
  return trimmed;
}

export function clearHistory(): void {
  saveHistory([]);
}

export function getRecentExpressions(limit = 5): string[] {
  return loadHistory()
    .slice(0, limit)
    .map((e) => e.expression);
}
