import { ScheduledJob } from './scheduler';
import { getNextRuns } from './parser';

export interface JobSummary {
  id: string;
  label: string;
  expression: string;
  status: 'active' | 'idle';
  nextRunISO: string | null;
  lastRunISO: string | null;
  runCount: number;
}

export function summarizeJob(job: ScheduledJob): JobSummary {
  return {
    id: job.id,
    label: job.label,
    expression: job.expression,
    status: job.isActive ? 'active' : 'idle',
    nextRunISO: job.nextRun ? job.nextRun.toISOString() : null,
    lastRunISO: job.lastRun ? job.lastRun.toISOString() : null,
    runCount: job.runCount,
  };
}

export function getJobNextRuns(job: ScheduledJob, count = 5): Date[] {
  return getNextRuns(job.expression, count);
}

export function generateJobId(label: string): string {
  const slug = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `${slug}-${Date.now().toString(36)}`;
}

export function sortJobsByNextRun(jobs: ScheduledJob[]): ScheduledJob[] {
  return [...jobs].sort((a, b) => {
    if (!a.nextRun) return 1;
    if (!b.nextRun) return -1;
    return a.nextRun.getTime() - b.nextRun.getTime();
  });
}

export function filterActiveJobs(jobs: ScheduledJob[]): ScheduledJob[] {
  return jobs.filter(j => j.isActive);
}

export function jobsToCSV(jobs: ScheduledJob[]): string {
  const header = 'id,label,expression,status,runCount,lastRun,nextRun';
  const rows = jobs.map(j => {
    const s = summarizeJob(j);
    return `${s.id},"${s.label}",${s.expression},${s.status},${s.runCount},${s.lastRunISO ?? ''},${s.nextRunISO ?? ''}`;
  });
  return [header, ...rows].join('\n');
}
