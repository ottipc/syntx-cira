import { useState } from "react";
import { useT } from "../../language";
import { DeviationSeam, FocusFrame, FocusHandle, FocusRing, IdText, ResonanceMark, SpaceCell, SpaceHeader, useFocusState } from "../../semiontics";
import type { RibbonVM, RowVM } from "./model";
import { RuleRibbon } from "./RuleRibbon";
import { SpaceColumnCell } from "./SpaceColumn";

/** One attribute row. Focus and resonance are drawn by frame elements laid over the row's grid area (architecture v2.0.3,
 *  D07): no cell is restyled for focus, so absence carriers stay untouched by construction. */
function Row({ row, index, focus, tick }: { row: RowVM; index: number; focus: string | null; tick: number }) {
  const s = useFocusState(row.attribute);
  const focused = focus === row.attribute;
  return (
    <div className="contents" role="row" data-attribute={row.attribute} data-focus-state={s} {...(row.changed ? { "data-changed": "" } : {})}>
      <div className="attr" role="rowheader">
        <FocusHandle id={row.attribute}><FocusRing active={focused}><IdText>{row.attribute}</IdText></FocusRing></FocusHandle>
        {row.differs ? <DeviationSeam /> : null}
      </div>
      <div className="contents" role="cell"><SpaceColumnCell c={row.a} space="A" focused={focused} /></div>
      <div className="contents" role="cell">{row.o ? <SpaceColumnCell c={row.o} space="O" focused={focused} />
        : <SpaceCell sem="SEM-009" space="O" term="avail.none" termParams={{ t: tick }} />}</div>
      <div className="contents" role="cell">{row.r ? <SpaceColumnCell c={row.r} space="R" focused={focused} />
        : <SpaceCell sem="SEM-009" space="R" term="avail.none" termParams={{ t: tick }} />}</div>
      {s === "focused" ? <FocusFrame rowIndex={index} /> : null}
      {s === "resonant" ? <ResonanceMark rowIndex={index} /> : null}
    </div>
  );
}

export function StateGrid({ rows, origins, ribbons, focus, tick, commit = false }: { rows: RowVM[]; origins: { a: string; o: string | null; r: string | null };
  ribbons: RibbonVM[]; focus: string | null; tick: number;
  /** MOT05: this grid shows a tick different from the previously shown one (one-shot border confirmation) */ commit?: boolean }) {
  // Ω_R is absent only when the server says NOT_AVAILABLE_AT_TICK: the view renders after all projections are verified
  const t = useT();
  const [tickCommit] = useState(commit); // captured at mount (the grid is keyed by tick): later renders never cancel it
  return (
    <div className="state-grid" role="table" aria-label={t("view.03")} {...(tickCommit ? { "data-tick-commit": "" } : {})}>
      <div className="contents" role="row">
        <div className="section-title" role="columnheader">{t("ui.attribute")}</div>
        <div className="contents" role="columnheader"><SpaceHeader space="A" origin={origins.a} /></div>
        <div className="contents" role="columnheader"><SpaceHeader space="O" origin={origins.o} /></div>
        <div className="contents" role="columnheader"><SpaceHeader space="R" origin={origins.r} /></div>
      </div>
      {rows.map((row, i) => <Row key={row.attribute} row={row} index={i} focus={focus} tick={tick} />)}
      <div className="contents" role="row">
        <div className="section-title" role="rowheader">{t("ui.rules")}</div>
        {ribbons.map((r) => <div key={r.space} role="cell"><RuleRibbon r={r} /></div>)}
      </div>
    </div>
  );
}
