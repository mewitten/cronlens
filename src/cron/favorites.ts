import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const FAVORITES_FILE = path.join(os.homedir(), '.cronlens', 'favorites.json');

export interface Favorite {
  id: string;
  expression: string;
  label: string;
  createdAt: string;
}

function ensureDir(): void {
  const dir = path.dirname(FAVORITES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadFavorites(): Favorite[] {
  ensureDir();
  if (!fs.existsSync(FAVORITES_FILE)) return [];
  try {
    const raw = fs.readFileSync(FAVORITES_FILE, 'utf-8');
    return JSON.parse(raw) as Favorite[];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: Favorite[]): void {
  ensureDir();
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2), 'utf-8');
}

export function addFavorite(expression: string, label: string): Favorite {
  const favorites = loadFavorites();
  const existing = favorites.find(f => f.expression === expression);
  if (existing) return existing;
  const newFav: Favorite = {
    id: Date.now().toString(36),
    expression,
    label,
    createdAt: new Date().toISOString(),
  };
  favorites.push(newFav);
  saveFavorites(favorites);
  return newFav;
}

export function removeFavorite(id: string): boolean {
  const favorites = loadFavorites();
  const index = favorites.findIndex(f => f.id === id);
  if (index === -1) return false;
  favorites.splice(index, 1);
  saveFavorites(favorites);
  return true;
}

export function isFavorite(expression: string): boolean {
  return loadFavorites().some(f => f.expression === expression);
}
