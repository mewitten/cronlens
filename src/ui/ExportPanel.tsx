import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { buildExportData, exportToFile, importFromFile } from '../cron/export';
import { loadFavorites } from '../cron/favorites';
import { getAllJobs } from '../cron/scheduler';

interface ExportPanelProps {
  onClose: () => void;
}

type Mode = 'menu' | 'export' | 'import' | 'success' | 'error';

export const ExportPanel: React.FC<ExportPanelProps> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('menu');
  const [message, setMessage] = useState('');
  const defaultExportPath = './cronlens-export.json';
  const defaultImportPath = './cronlens-export.json';

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }
    if (mode === 'menu') {
      if (input === 'e') setMode('export');
      if (input === 'i') setMode('import');
    }
    if (mode === 'export') {
      handleExport(defaultExportPath);
    }
    if (mode === 'import') {
      handleImport(defaultImportPath);
    }
  });

  async function handleExport(filePath: string) {
    try {
      const favorites = await loadFavorites();
      const jobs = getAllJobs();
      const data = buildExportData(favorites, jobs);
      await exportToFile(filePath, data);
      setMessage(`Exported to ${filePath}`);
      setMode('success');
    } catch (err: any) {
      setMessage(err.message ?? 'Export failed');
      setMode('error');
    }
  }

  async function handleImport(filePath: string) {
    try {
      const data = await importFromFile(filePath);
      const favCount = data.favorites?.length ?? 0;
      const jobCount = data.jobs?.length ?? 0;
      setMessage(`Imported ${favCount} favorites, ${jobCount} jobs from ${filePath}`);
      setMode('success');
    } catch (err: any) {
      setMessage(err.message ?? 'Import failed');
      setMode('error');
    }
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Text bold color="cyan">Export / Import</Text>
      {mode === 'menu' && (
        <Box flexDirection="column" marginTop={1}>
          <Text>[e] Export favorites & jobs to file</Text>
          <Text>[i] Import favorites & jobs from file</Text>
          <Text dimColor>[esc] Close</Text>
        </Box>
      )}
      {(mode === 'export' || mode === 'import') && (
        <Text color="yellow">Processing...</Text>
      )}
      {mode === 'success' && <Text color="green">✓ {message}</Text>}
      {mode === 'error' && <Text color="red">✗ {message}</Text>}
    </Box>
  );
};
