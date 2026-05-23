import React from 'react';
import { render } from 'ink-testing-library';
import { NextRunsPanel } from './NextRunsPanel';

describe('NextRunsPanel', () => {
  it('renders next runs for a valid expression', () => {
    const { lastFrame } = render(<NextRunsPanel expression="* * * * *" count={3} />);
    const frame = lastFrame();
    expect(frame).toContain('Next 3 Runs');
    expect(frame).toContain('Every minute');
    expect(frame).toMatch(/1\./);
    expect(frame).toMatch(/2\./);
    expect(frame).toMatch(/3\./);
  });

  it('renders error state for invalid expression', () => {
    const { lastFrame } = render(<NextRunsPanel expression="not valid" />);
    const frame = lastFrame();
    expect(frame).toContain('✗ Invalid expression');
  });

  it('defaults to 5 runs when count is not provided', () => {
    const { lastFrame } = render(<NextRunsPanel expression="0 * * * *" />);
    const frame = lastFrame();
    expect(frame).toContain('Next 5 Runs');
    expect(frame).toMatch(/5\./);
  });

  it('shows time-until for each run', () => {
    const { lastFrame } = render(<NextRunsPanel expression="*/10 * * * *" count={2} />);
    const frame = lastFrame();
    expect(frame).toMatch(/in \d+[smh]/);
  });
});
