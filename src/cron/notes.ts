import fs from "fs";
import path from "path";

const NOTES_DIR = path.join(process.env.HOME || ".", ".cronlens");
const NOTES_FILE = path.join(NOTES_DIR, "notes.json");

export interface NoteEntry {
  expression: string;
  note: string;
  updatedAt: string;
}

export type NoteStore = Record<string, NoteEntry>;

function ensureDir(): void {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
  }
}

export function loadNotes(): NoteStore {
  ensureDir();
  if (!fs.existsSync(NOTES_FILE)) return {};
  try {
    const raw = fs.readFileSync(NOTES_FILE, "utf-8");
    return JSON.parse(raw) as NoteStore;
  } catch {
    return {};
  }
}

export function saveNotes(store: NoteStore): void {
  ensureDir();
  fs.writeFileSync(NOTES_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export function setNote(expression: string, note: string): NoteStore {
  const store = loadNotes();
  store[expression] = {
    expression,
    note,
    updatedAt: new Date().toISOString(),
  };
  saveNotes(store);
  return store;
}

export function removeNote(expression: string): NoteStore {
  const store = loadNotes();
  delete store[expression];
  saveNotes(store);
  return store;
}

export function getNote(expression: string): NoteEntry | undefined {
  const store = loadNotes();
  return store[expression];
}

export function getAllNotes(): NoteEntry[] {
  const store = loadNotes();
  return Object.values(store).sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
}
