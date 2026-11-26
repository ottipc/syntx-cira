// Tick navigation helpers (time sub-field; view modules contain no arithmetic, INV-STR-07).
export function tickRange(first: number, last: number): number[] {
  const out: number[] = [];
  for (let t = first; t <= last; t += 1) out.push(t);
  return out;
}
export function neighbours(ticks: readonly number[], t: number): { prev: number | null; next: number | null } {
  let prev: number | null = null;
  let next: number | null = null;
  for (const x of ticks) {
    if (x < t && (prev === null || x > prev)) prev = x;
    if (x > t && (next === null || x < next)) next = x;
  }
  return { prev, next };
}
