import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import {
  serializeExport,
  deserializeExport,
  buildExportData,
  exportToFile,
  importFromFile,
  ExportData,
} from './export';

const mockFavorites = [
  { id: 'f1', expression: '0 9 * * 1-5', label: 'Weekday mornings', createdAt: '2024-01-01T09:00:00.000Z' },
];

const mockJobs = [
  { id: 'j1', expression: '*/5 * * * *', label: 'Every 5 min', status: 'active' as const, createdAt: new Date('2024-01-01'), nextRun: null, lastRun: null },
];

describe('serializeExport / deserializeExport', () => {
  it('round-trips export data correctly', () => {
    const data: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      favorites: mockFavorites,
      jobs: [],
    };
    const serialized = serializeExport(data);
    const result = deserializeExport(serialized);
    expect(result.version).toBe('1.0.0');
    expect(result.favorites).toEqual(mockFavorites);
  });

  it('throws on invalid export data', () => {
    expect(() => deserializeExport('{"foo":"bar"}')).toThrow(
      'Invalid export file'
    );
  });

  it('throws on malformed JSON', () => {
    expect(() => deserializeExport('not-valid-json')).toThrow();
  });

  it('preserves exportedAt timestamp through round-trip', () => {
    const exportedAt = '2024-06-15T12:00:00.000Z';
    const data: ExportData = {
      version: '1.0.0',
      exportedAt,
      favorites: [],
      jobs: [],
    };
    const result = deserializeExport(serializeExport(data));
    expect(result.exportedAt).toBe(exportedAt);
  });
});

describe('buildExportData', () => {
  it('includes favorites and jobs', () => {
    const data = buildExportData(mockFavorites, mockJobs);
    expect(data.favorites).toHaveLength(1);
    expect(data.jobs).toHaveLength(1);
    expect(data.jobs![0].id).toBe('j1');
    expect(data.jobs![0].expression).toBe('*/5 * * * *');
  });
});

describe('exportToFile / importFromFile', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cronlens-export-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes and reads back export data', async () => {
    const filePath = path.join(tmpDir, 'export.json');
    const data = buildExportData(mockFavorites, mockJobs);
    await exportToFile(filePath, data);
    const imported = await importFromFile(filePath);
    expect(imported.version).toBe('1.0.0');
    expect(imported.favorites).toEqual(mockFavorites);
  });

  it('throws when importing from a non-existent file', async () => {
    const filePath = path.join(tmpDir, 'does-not-exist.json');
    await expect(importFromFile(filePath)).rejects.toThrow();
  });
});
