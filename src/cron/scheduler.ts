import { getNextRuns } from './parser';
import { addToHistory } from './history';

export interface ScheduledJob {
  id: string;
  expression: string;
  label: string;
  lastRun?: Date;
  nextRun?: Date;
  runCount: number;
  isActive: boolean;
}

const jobs = new Map<string, ScheduledJob>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function createJob(id: string, expression: string, label: string): ScheduledJob {
  const [nextRun] = getNextRuns(expression, 1);
  const job: ScheduledJob = {
    id,
    expression,
    label,
    nextRun,
    runCount: 0,
    isActive: false,
  };
  jobs.set(id, job);
  return job;
}

export function startJob(id: string, onTick: (job: ScheduledJob) => void): boolean {
  const job = jobs.get(id);
  if (!job) return false;

  job.isActive = true;
  scheduleNext(id, onTick);
  return true;
}

function scheduleNext(id: string, onTick: (job: ScheduledJob) => void): void {
  const job = jobs.get(id);
  if (!job || !job.isActive) return;

  const [nextRun] = getNextRuns(job.expression, 1);
  if (!nextRun) return;

  job.nextRun = nextRun;
  const delay = nextRun.getTime() - Date.now();

  const timer = setTimeout(() => {
    job.lastRun = new Date();
    job.runCount += 1;
    addToHistory(job.expression);
    onTick({ ...job });
    scheduleNext(id, onTick);
  }, Math.max(0, delay));

  timers.set(id, timer);
}

export function stopJob(id: string): boolean {
  const job = jobs.get(id);
  if (!job) return false;
  job.isActive = false;
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  return true;
}

export function getJob(id: string): ScheduledJob | undefined {
  return jobs.get(id);
}

export function getAllJobs(): ScheduledJob[] {
  return Array.from(jobs.values());
}

export function removeJob(id: string): boolean {
  stopJob(id);
  return jobs.delete(id);
}
