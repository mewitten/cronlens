import { createJob, startJob, stopJob, getJob, getAllJobs, removeJob } from './scheduler';

jest.useFakeTimers();

jest.mock('./history', () => ({
  addToHistory: jest.fn(),
}));

jest.mock('./parser', () => ({
  getNextRuns: jest.fn(() => [new Date(Date.now() + 1000)]),
}));

describe('scheduler', () => {
  afterEach(() => {
    getAllJobs().forEach(j => removeJob(j.id));
    jest.clearAllTimers();
  });

  it('creates a job with correct defaults', () => {
    const job = createJob('j1', '* * * * *', 'Test Job');
    expect(job.id).toBe('j1');
    expect(job.expression).toBe('* * * * *');
    expect(job.label).toBe('Test Job');
    expect(job.runCount).toBe(0);
    expect(job.isActive).toBe(false);
  });

  it('starts and activates a job', () => {
    createJob('j2', '* * * * *', 'Active Job');
    const result = startJob('j2', jest.fn());
    expect(result).toBe(true);
    expect(getJob('j2')?.isActive).toBe(true);
  });

  it('returns false when starting unknown job', () => {
    expect(startJob('nonexistent', jest.fn())).toBe(false);
  });

  it('stops an active job', () => {
    createJob('j3', '* * * * *', 'Stop Job');
    startJob('j3', jest.fn());
    const result = stopJob('j3');
    expect(result).toBe(true);
    expect(getJob('j3')?.isActive).toBe(false);
  });

  it('calls onTick when timer fires', () => {
    const onTick = jest.fn();
    createJob('j4', '* * * * *', 'Tick Job');
    startJob('j4', onTick);
    jest.runAllTimers();
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick.mock.calls[0][0].runCount).toBe(1);
  });

  it('removes a job entirely', () => {
    createJob('j5', '* * * * *', 'Remove Job');
    removeJob('j5');
    expect(getJob('j5')).toBeUndefined();
  });
});
