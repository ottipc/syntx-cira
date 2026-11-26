import { semAttrs } from "./_util";

/** SEM-023: change before ▸ after, always bound to its space (K-13). */
export function DeltaMark({ before, after, space }: { before: string; after: string; space: "A" | "O" | "R" | "K" }) {
  return (
    <span className={`delta delta-${space.toLowerCase()}`} {...semAttrs("SEM-023", "delta")}>
      <span className="mono-value">{before}</span><span aria-hidden="true"> ▸ </span><span className="mono-value">{after}</span>
    </span>
  );
}
