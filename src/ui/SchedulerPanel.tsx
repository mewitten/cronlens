import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { getAllJobs, startJob, stopJob, removeJob, ScheduledJob } from '../cron/scheduler';

interface Props {
  onTick?: (job: ScheduledJob) => void;
}

function formatStatus(job: ScheduledJob): string {
  return job.isActive ? '● ACTIVE' : '○ IDLE';
}

function formatNextRun(job: ScheduledJob): string {
  if (!job.nextRun) return 'N/A';
  const diff = Math.round((job.nextRun.getTime() - Date.now()) / 1000);
  if (diff < 60) return `in ${diff}s`;
  if (diff < 3600) return `in ${Math.round(diff / 60)}m`;
  return `in ${Math.round(diff / 3600)}h`;
}

export function SchedulerPanel({ onTick }: Props) {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [selected, setSelected] = useState(0);

  const refresh = () => setJobs([...getAllJobs()]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 1000);
    return () => clearInterval(interval);
  }, []);

  useInput((input, key) => {
    if (key.upArrow) setSelected(s => Math.max(0, s - 1));
    if (key.downArrow) setSelected(s => Math.min(jobs.length - 1, s + 1));
    if (input === 's' && jobs[selected]) {
      const job = jobs[selected];
      if (job.isActive) stopJob(job.id);
      else startJob(job.id, (j) => { onTick?.(j); refresh(); });
      refresh();
    }
    if (input === 'd' && jobs[selected]) {
      removeJob(jobs[selected].id);
      setSelected(s => Math.max(0, s - 1));
      refresh();
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
      <Text bold color="cyan">Scheduler ({jobs.length} jobs)</Text>
      {jobs.length === 0 && <Text dimColor>No jobs. Add from Favorites.</Text>}
      {jobs.map((job, i) => (
        <Box key={job.id} flexDirection="row" gap={2}>
          <Text color={i === selected ? 'yellow' : undefined}>{i === selected ? '▶' : ' '}</Text>
          <Text color={job.isActive ? 'green' : 'gray'}>{formatStatus(job)}</Text>
          <Text>{job.label}</Text>
          <Text dimColor>{job.expression}</Text>
          <Text color="blue">{formatNextRun(job)}</Text>
          <Text dimColor>runs: {job.runCount}</Text>
        </Box>
      ))}
      <Box marginTop={1}>
        <Text dimColor>[s] toggle  [d] delete  [↑↓] navigate</Text>
      </Box>
    </Box>
  );
}
