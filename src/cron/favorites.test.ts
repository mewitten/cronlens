import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  loadFavorites,
  saveFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from './favorites';

const FAVORITES_FILE = path.join(os.homedir(), '.cronlens', 'favorites.json');

beforeEach(() => {
  if (fs.existsSync(FAVORITES_FILE)) fs.unlinkSync(FAVORITES_FILE);
});

test('loadFavorites returns empty array when file does not exist', () => {
  expect(loadFavorites()).toEqual([]);
});

test('addFavorite creates a new favorite', () => {
  const fav = addFavorite('0 9 * * 1-5', 'Weekday 9am');
  expect(fav.expression).toBe('0 9 * * 1-5');
  expect(fav.label).toBe('Weekday 9am');
  expect(fav.id).toBeTruthy();
});

test('addFavorite returns existing favorite for duplicate expression', () => {
  const first = addFavorite('*/5 * * * *', 'Every 5 min');
  const second = addFavorite('*/5 * * * *', 'Duplicate');
  expect(first.id).toBe(second.id);
  expect(loadFavorites()).toHaveLength(1);
});

test('removeFavorite removes by id', () => {
  const fav = addFavorite('0 0 * * *', 'Midnight');
  const removed = removeFavorite(fav.id);
  expect(removed).toBe(true);
  expect(loadFavorites()).toHaveLength(0);
});

test('removeFavorite returns false for unknown id', () => {
  expect(removeFavorite('nonexistent')).toBe(false);
});

test('isFavorite returns true for saved expression', () => {
  addFavorite('0 12 * * *', 'Noon');
  expect(isFavorite('0 12 * * *')).toBe(true);
});

test('isFavorite returns false for unsaved expression', () => {
  expect(isFavorite('0 3 * * *')).toBe(false);
});

test('saveFavorites and loadFavorites round-trip', () => {
  const data = [{ id: 'abc', expression: '* * * * *', label: 'Every min', createdAt: new Date().toISOString() }];
  saveFavorites(data);
  expect(loadFavorites()).toEqual(data);
});
