type Counters = Record<string, number>;

type DurationStat = {
  count: number;
  totalMs: number;
  minMs: number;
  maxMs: number;
};

type DurationMap = Record<string, DurationStat>;

const startedAt = Date.now();

const http: Counters = Object.create(null);
const jobs: Counters = Object.create(null);
const durations: DurationMap = Object.create(null);

function bump(map: Counters, key: string, by = 1) {
  map[key] = (map[key] ?? 0) + by;
}

function observe(map: DurationMap, key: string, ms: number) {
  const entry = map[key];
  if (!entry) {
    map[key] = { count: 1, totalMs: ms, minMs: ms, maxMs: ms };
    return;
  }
  entry.count += 1;
  entry.totalMs += ms;
  if (ms < entry.minMs) entry.minMs = ms;
  if (ms > entry.maxMs) entry.maxMs = ms;
}

export function recordHttpRequest(method: string, statusCode: number) {
  const bucket =
    statusCode >= 500 ? '5xx' : statusCode >= 400 ? '4xx' : statusCode >= 300 ? '3xx' : '2xx';
  bump(http, `${method}:${bucket}`);
  bump(http, `total:${bucket}`);
  bump(http, 'total:all');
}

export function recordJobStart(queue: string) {
  bump(jobs, `${queue}:received`);
}

export function recordJobSuccess(queue: string, durationMs: number) {
  bump(jobs, `${queue}:success`);
  observe(durations, queue, durationMs);
}

export function recordJobFailure(queue: string, durationMs: number) {
  bump(jobs, `${queue}:failure`);
  observe(durations, queue, durationMs);
}

export function snapshotMetrics() {
  const mem = process.memoryUsage();
  return {
    uptimeMs: Date.now() - startedAt,
    pid: process.pid,
    memory: {
      rssMb: +(mem.rss / 1024 / 1024).toFixed(2),
      heapUsedMb: +(mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMb: +(mem.heapTotal / 1024 / 1024).toFixed(2),
    },
    http: { ...http },
    jobs: { ...jobs },
    jobDurationsMs: Object.fromEntries(
      Object.entries(durations).map(([queue, d]) => [
        queue,
        {
          count: d.count,
          avg: +(d.totalMs / d.count).toFixed(2),
          min: d.minMs,
          max: d.maxMs,
        },
      ]),
    ),
  };
}
