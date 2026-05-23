import { CronJob } from './scheduler';
import { FavoriteEntry } from './favorites';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ExportData {
  version: string;
  exportedAt: string;
  favorites?: FavoriteEntry[];
  jobs?: Array<{
    id: string;
    expression: string;
    label?: string;
    createdAt: string;
  }>;
}

export function serializeExport(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export function deserializeExport(raw: string): ExportData {
  const parsed = JSON.parse(raw);
  if (!parsed.version || !parsed.exportedAt) {
    throw new Error('Invalid export file: missing version or exportedAt');
  }
  return parsed as ExportData;
}

export async function exportToFile(
  filePath: string,
  data: ExportData
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, serializeExport(data), 'utf-8');
}

export async function importFromFile(filePath: string): Promise<ExportData> {
  const raw = await fs.readFile(filePath, 'utf-8');
  return deserializeExport(raw);
}

export function buildExportData(
  favorites: FavoriteEntry[],
  jobs: CronJob[]
): ExportData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    favorites,
    jobs: jobs.map((j) => ({
      id: j.id,
      expression: j.expression,
      label: j.label,
      createdAt: j.createdAt.toISOString(),
    })),
  };
}
