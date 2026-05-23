import React, { useState } from "react";
import { Box, Text, Newline } from "ink";
import { diffCronExpressions, formatDiffSummary, DiffResult } from "../cron/diff.js";

/**
 * Renders a single diff entry showing added/removed dates.
 */
function DiffEntry({ date, type }: { date: Date; type: "added" | "removed" | "common" }) {
  const label = type === "added" ? "+" : type === "removed" ? "-" : " ";
  const color = type === "added" ? "green" : type === "removed" ? "red" : "gray";
  const formatted = date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return (
    <Text color={color}>
      {label} {formatted}
    </Text>
  );
}

interface DiffPanelProps {
  /** First cron expression to compare */
  expressionA: string;
  /** Second cron expression to compare */
  expressionB: string;
  /** Number of upcoming runs to compare (default 10) */
  count?: number;
  /** Reference date for computing next runs (default: now) */
  from?: Date;
}

/**
 * DiffPanel compares two cron expressions and shows which scheduled
 * dates are unique to each or shared between them.
 */
export function DiffPanel({
  expressionA,
  expressionB,
  count = 10,
  from,
}: DiffPanelProps) {
  const [result] = useState<DiffResult | null>(() => {
    try {
      return diffCronExpressions(expressionA, expressionB, count, from);
    } catch {
      return null;
    }
  });

  if (!expressionA || !expressionB) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color="yellow">Enter two cron expressions to compare.</Text>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text color="red">Failed to diff expressions. Check that both are valid.</Text>
      </Box>
    );
  }

  const summary = formatDiffSummary(result);

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text bold>Cron Diff</Text>
        <Text color="gray">  (next {count} runs)</Text>
      </Box>

      {/* Legend */}
      <Box marginBottom={1} gap={2}>
        <Text color="green">+ only in A</Text>
        <Text color="red">- only in B</Text>
        <Text color="gray">  shared</Text>
      </Box>

      {/* Expression labels */}
      <Box marginBottom={1} flexDirection="column">
        <Text color="cyan">A: <Text bold>{expressionA}</Text></Text>
        <Text color="magenta">B: <Text bold>{expressionB}</Text></Text>
      </Box>

      {/* Diff entries */}
      <Box flexDirection="column" marginBottom={1}>
        {result.onlyInA.map((d, i) => (
          <DiffEntry key={`a-${i}`} date={d} type="added" />
        ))}
        {result.common.map((d, i) => (
          <DiffEntry key={`c-${i}`} date={d} type="common" />
        ))}
        {result.onlyInB.map((d, i) => (
          <DiffEntry key={`b-${i}`} date={d} type="removed" />
        ))}
      </Box>

      {/* Summary */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <Text color="gray">{summary}</Text>
      </Box>
    </Box>
  );
}
