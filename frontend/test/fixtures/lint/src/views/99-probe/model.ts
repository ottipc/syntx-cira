// Ordering inside a sort comparator is allowed; arithmetic outside it is not.
export const ordered = (xs: { seq: number }[]) => [...xs].sort((a, b) => a.seq - b.seq);
export const doubled = (n: number) => n * 2;
