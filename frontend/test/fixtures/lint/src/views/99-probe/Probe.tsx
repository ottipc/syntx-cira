// Lint fixture (never built): every line below must be reported by scripts/lint-arch.mjs.
export function Probe({ a, b, xs }: { a: { value: string }; b: { value: string }; xs: number[] }) {
  const n = xs.filter((x) => x).length;
  const s = a.value === b.value;
  return <div title="Hello">Raw text → {n * 2}{s ? "Σ" : ""}{xs.length > 1 ? Math.max(...xs) : null}</div>;
}
