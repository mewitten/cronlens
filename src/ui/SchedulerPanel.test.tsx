import React from 'react';
import { render } from 'ink-testing-library';
import { SchedulerPanel } from './SchedulerPanel';
import * as scheduler from '../cron/scheduler';

jest.mock('../cron/scheduler', () => ({
  getAllJobs: jest.fn(),
  startJob: jest.fn(),
  stopJob: jest.fn(),
  removeJob: jest.fn(),
}));

const mockGetAllJobs = scheduler.getAllJobs as jest.Mock;

describe('SchedulerPanel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockGetAllJobs.mockReturnValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders empty state', () => {
    const { lastFrame } = render(<SchedulerPanel />);
    expect(lastFrame()).toContain('Scheduler (0 jobs)');
    expect(lastFrame()).toContain('No jobs');
  });

  it('renders job list', () => {
    mockGetAllJobs.mockReturnValue([
      {
        id: '1',
        expression: '*/5 * * * *',
        label: 'My Job',
        runCount: 3,
        isActive: true,
        nextRun: new Date(Date.now() + 30000),
      },
    ]);
    const { lastFrame } = render(<SchedulerPanel />);
    expect(lastFrame()).toContain('My Job');
    expect(lastFrame()).toContain('*/5 * * * *');
    expect(lastFrame()).toContain('ACTIVE');
    expect(lastFrame()).toContain('runs: 3');
  });

  it('shows keyboard hint', () => {
    const { lastFrame } = render(<SchedulerPanel />);
    expect(lastFrame()).toContain('[s] toggle');
  });
});
