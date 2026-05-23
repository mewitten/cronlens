import fs from "fs";
import path from "path";

const TAGS_FILE = path.join(process.env.HOME || ".", ".cronlens", "tags.json");

export interface TagEntry {
  expression: string;
  tags: string[];
}

export type TagsStore = Record<string, string[]>;

export function ensureDir(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadTags(): TagsStore {
  try {
    if (!fs.existsSync(TAGS_FILE)) return {};
    const raw = fs.readFileSync(TAGS_FILE, "utf-8");
    return JSON.parse(raw) as TagsStore;
  } catch {
    return {};
  }
}

export function saveTags(store: TagsStore): void {
  ensureDir(TAGS_FILE);
  fs.writeFileSync(TAGS_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export function addTag(expression: string, tag: string): TagsStore {
  const store = loadTags();
  const existing = store[expression] ?? [];
  if (!existing.includes(tag)) {
    store[expression] = [...existing, tag];
    saveTags(store);
  }
  return store;
}

export function removeTag(expression: string, tag: string): TagsStore {
  const store = loadTags();
  if (!store[expression]) return store;
  store[expression] = store[expression].filter((t) => t !== tag);
  if (store[expression].length === 0) delete store[expression];
  saveTags(store);
  return store;
}

export function getTagsForExpression(expression: string): string[] {
  const store = loadTags();
  return store[expression] ?? [];
}

export function getExpressionsByTag(tag: string): string[] {
  const store = loadTags();
  return Object.entries(store)
    .filter(([, tags]) => tags.includes(tag))
    .map(([expr]) => expr);
}

export function getAllTags(): string[] {
  const store = loadTags();
  const tagSet = new Set<string>();
  Object.values(store).forEach((tags) => tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
