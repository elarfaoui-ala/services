export function getDateRange(range: string, from?: string, to?: string) {
  const now = new Date();
  const end = to ? new Date(to) : now;
  let start: Date;

  switch (range) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0));
      break;
    case '7d':
      start = new Date(Date.now() - 7 * 86400000);
      break;
    case '90d':
      start = new Date(Date.now() - 90 * 86400000);
      break;
    case 'custom':
      start = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
      break;
    default:
      start = new Date(Date.now() - 30 * 86400000);
  }

  return { start, end };
}

export function daysBetween(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function seeded(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000;
  return Math.round((x - Math.floor(x)) * (max - min) + min);
}

export function generateTimeSeries(
  days: number,
  base: number,
  variance: number,
  seed = 1,
): number[] {
  return Array.from({ length: days }, (_, i) =>
    Math.max(0, seeded(seed + i, base - variance, base + variance)),
  );
}
