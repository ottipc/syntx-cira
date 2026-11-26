import type { ReactNode } from "react";
import { semAttrs } from "./_util";

/** SEM-034: cross-view focus from URL `focus`. */
export function FocusRing({ active, children }: { active: boolean; children: ReactNode }) {
  if (!active) return <>{children}</>;
  return <span className="focus-ring" {...semAttrs("SEM-034", "focus")}>{children}</span>;
}
