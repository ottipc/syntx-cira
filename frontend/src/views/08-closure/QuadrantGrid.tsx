import type { ReactNode } from "react";
import { useT, type TermKey } from "../../language";

export function Quadrant({ term, children }: { term: TermKey; children: ReactNode }) {
  const t = useT();
  return <div className="panel quadrant" data-quadrant={term}><h2 className="section-title">{t(term)}</h2>{children}</div>;
}
export function QuadrantGrid({ children }: { children: ReactNode }) {
  return <div className="grid-2 quadrants">{children}</div>;
}
