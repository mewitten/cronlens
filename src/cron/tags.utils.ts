import { TagsStore } from "./tags";

export interface TagSummary {
  tag: string;
  count: number;
  expressions: string[];
}

export function buildTagSummaries(store: TagsStore): TagSummary[] {
  const map = new Map<string, string[]>();
  for (const [expr, tags] of Object.entries(store)) {
    for (const tag of tags) {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag)!.push(expr);
    }
  }
  return Array.from(map.entries())
    .map(([tag, expressions]) => ({ tag, count: expressions.length, expressions }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function filterExpressionsByTags(
  store: TagsStore,
  filterTags: string[],
  mode: "any" | "all" = "any"
): string[] {
  return Object.entries(store)
    .filter(([, tags]) =>
      mode === "any"
        ? filterTags.some((t) => tags.includes(t))
        : filterTags.every((t) => tags.includes(t))
    )
    .map(([expr]) => expr);
}

export function mergeTagStores(base: TagsStore, incoming: TagsStore): TagsStore {
  const merged: TagsStore = { ...base };
  for (const [expr, tags] of Object.entries(incoming)) {
    const existing = new Set(merged[expr] ?? []);
    tags.forEach((t) => existing.add(t));
    merged[expr] = Array.from(existing).sort();
  }
  return merged;
}

export function renameTag(store: TagsStore, oldTag: string, newTag: string): TagsStore {
  const updated: TagsStore = {};
  for (const [expr, tags] of Object.entries(store)) {
    updated[expr] = tags.map((t) => (t === oldTag ? newTag : t));
  }
  return updated;
}

export function countTaggedExpressions(store: TagsStore): number {
  return Object.keys(store).length;
}
