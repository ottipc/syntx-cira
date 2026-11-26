import { useT } from "../../language";
import { DeviationSeam, IdText, SpaceCell, SpaceHeader } from "../../semiontics";
import type { RibbonVM, RowVM } from "./model";
import { RuleRibbon } from "./RuleRibbon";
import { SpaceColumnCell } from "./SpaceColumn";

export function StateGrid({ rows, origins, ribbons, focus, rUnavailable, tick }: { rows: RowVM[]; origins: { a: string; o: string | null; r: string | null };
  ribbons: RibbonVM[]; focus: string | null; rUnavailable: boolean; tick: number }) {
  const t = useT();
  return (
    <div className="state-grid" role="table" aria-label={t("view.03")}>
      <div className="section-title" role="columnheader">{t("ui.attribute")}</div>
      <SpaceHeader space="A" origin={origins.a} />
      <SpaceHeader space="O" origin={origins.o} />
      <SpaceHeader space="R" origin={origins.r} />
      {rows.map((row) => (
        <div key={row.attribute} className="contents" role="row" data-attribute={row.attribute}>
          <div className="attr"><IdText>{row.attribute}</IdText>{row.differs ? <DeviationSeam /> : null}</div>
          <SpaceColumnCell c={row.a} space="A" focused={focus === row.attribute} />
          {row.o ? <SpaceColumnCell c={row.o} space="O" focused={focus === row.attribute} /> : <SpaceCell sem="SEM-009" space="O" term="avail.none" termParams={{ t: tick }} />}
          {row.r ? <SpaceColumnCell c={row.r} space="R" focused={focus === row.attribute} />
            : <SpaceCell sem="SEM-009" space="R" term={rUnavailable ? "avail.none" : "msg.loading"} termParams={{ t: tick }} />}
        </div>
      ))}
      <div className="section-title">{t("ui.rules")}</div>
      {ribbons.map((r) => <div key={r.space}><RuleRibbon r={r} /></div>)}
    </div>
  );
}
