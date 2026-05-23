import React from 'react';
import { Box, Text } from 'ink';
import { getNextRuns, parseCronExpression } from '../cron/parser';

interface NextRunsPanelProps {
  expression: string;
  count?: number;
}

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function timeUntil(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `in ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `in ${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  return `in ${diffHr}h ${diffMin % 60}m`;
}

export const NextRunsPanel: React.FC<NextRunsPanelProps> = ({ expression, count = 5 }) => {
  const parsed = parseCronExpression(expression);

  if (!parsed.valid) {
    return (
      <Box borderStyle="round" borderColor="red" padding={1}>
        <Text color="red">✗ Invalid expression: {parsed.error}</Text>
      </Box>
    );
  }

  const runs = getNextRuns(expression, count);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Text bold color="cyan">Next {count} Runs</Text>
      <Text color="gray">({parsed.description})</Text>
      <Box marginTop={1} flexDirection="column">
        {runs.map((run, i) => (
          <Box key={i} gap={2}>
            <Text color="yellow">{String(i + 1).padStart(2, ' ')}.</Text>
            <Text>{formatDate(run)}</Text>
            <Text color="gray">{timeUntil(run)}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
