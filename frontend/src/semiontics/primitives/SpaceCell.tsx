import type { ReactNode } from "react";
import { useT, type TermKey, type TParams } from "../../language";
import { SEM, type SemId } from "../generated/sem";
import { semAttrs } from "./_util";

export interface SpaceCellProps {
  sem: SemId;
  space: "A" | "O" | "R";
  value?: string | null;
  term?: TermKey | null;
  termParams?: TParams;
  sub?: ReactNode;
  focused?: boolean;
}

/** SEM-001–009, 018, 031: one attribute in one state space. Glyph and pattern come from the register. */
export function SpaceCell({ sem, space, value, term, termParams, sub, focused }: SpaceCellProps) {
  const t = useT();
  const e = SEM[sem];
  return (
    <div className={`cell cell-${space.toLowerCase()} sem-${sem.toLowerCase()}${focused ? " is-focused" : ""}`}
      {...semAttrs(sem, term ?? undefined)}>
      {e.glyph ? <span className="cell-glyph" aria-hidden="true">{e.glyph}</span> : null}
      {value ? <span className="mono-value" data-datum="value">{value}</span> : null}
      {term ? <span className="cell-term">{t(term, termParams)}</span> : null}
      {sub ? <span className="cell-sub">{sub}</span> : null}
    </div>
  );
}
