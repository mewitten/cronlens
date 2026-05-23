import React from 'react';
import { Box, Text } from 'ink';
import { validateCronExpression, ValidationResult } from '../cron/validator';

interface ValidationBadgeProps {
  expression: string;
}

function ValidationIcon({ valid }: { valid: boolean }): JSX.Element {
  return valid
    ? <Text color="green">✔ Valid</Text>
    : <Text color="red">✘ Invalid</Text>;
}

function ErrorList({ errors }: { errors: string[] }): JSX.Element | null {
  if (errors.length === 0) return null;
  return (
    <Box flexDirection="column" marginTop={1}>
      {errors.map((err, i) => (
        <Text key={i} color="red">  • {err}</Text>
      ))}
    </Box>
  );
}

function WarningList({ warnings }: { warnings: string[] }): JSX.Element | null {
  if (warnings.length === 0) return null;
  return (
    <Box flexDirection="column" marginTop={1}>
      {warnings.map((warn, i) => (
        <Text key={i} color="yellow">  ⚠ {warn}</Text>
      ))}
    </Box>
  );
}

export function ValidationBadge({ expression }: ValidationBadgeProps): JSX.Element {
  const result: ValidationResult = validateCronExpression(expression);

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={result.valid ? 'green' : 'red'} paddingX={1}>
      <Box>
        <Text bold>Validation: </Text>
        <ValidationIcon valid={result.valid} />
      </Box>
      <ErrorList errors={result.errors} />
      <WarningList warnings={result.warnings} />
    </Box>
  );
}

export default ValidationBadge;
