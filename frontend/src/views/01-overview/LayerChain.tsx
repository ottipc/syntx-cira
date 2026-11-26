import { Fragment } from "react";
import { useT } from "../../language";
import { ExecPill, SpaceHeader } from "../../semiontics";
import { sessionUrl, useSession, VIEW_IDS, type ViewKey } from "../../session";
import type { LayerVM } from "./model";

/** The seven fields as one chain F01 → F07 (DEC-03 links show only this fixed order). Between observation (F04) and
 *  engine (F05) the chain is cut by the barrier sign (SEM-019): only Ω_O passes, never Ω_A. */
export function LayerChain({ layers }: { layers: LayerVM[] }) {
  const t = useT();
  const { session, goUrl } = useSession();
  return (
    <div className="layer-chain">
      {layers.map((l, i) => {
        const v = (VIEW_IDS as readonly string[]).includes(l.view) ? (l.view as ViewKey) : "SYSTEM_FIELD_OVERVIEW";
        const href = sessionUrl({ ...session, view: v });
        return (
          <Fragment key={l.id}>
            {i === 0 ? null : l.id === "F05"
              ? <span className="chain-link cut" data-sem="SEM-019" aria-hidden="true"><span className="cut-glyph">‖</span></span>
              : <span className="chain-link" aria-hidden="true" />}
            <a className={`layer cascade-${i}`} href={href} onClick={(e) => { e.preventDefault(); goUrl(href); }} data-term={l.term} data-field={l.id}>
              <span className="layer-id" aria-hidden="true">{l.id.slice(1)}</span>
              <span className="space-title">{t(l.term)}</span>
              {l.space === "A" || l.space === "O" || l.space === "R" ? <SpaceHeader space={l.space} origin={null} /> : null}
              {l.status ? <ExecPill status={l.status} /> : null}
            </a>
          </Fragment>
        );
      })}
    </div>
  );
}
