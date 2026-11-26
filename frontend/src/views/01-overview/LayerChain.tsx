import { useT } from "../../language";
import { ExecPill, SpaceHeader } from "../../semiontics";
import { sessionUrl, useSession, VIEW_IDS, type ViewKey } from "../../session";
import type { LayerVM } from "./model";

export function LayerChain({ layers }: { layers: LayerVM[] }) {
  const t = useT();
  const { session, goUrl } = useSession();
  return (
    <div className="layer-chain">
      {layers.map((l) => {
        const v = (VIEW_IDS as readonly string[]).includes(l.view) ? (l.view as ViewKey) : "SYSTEM_FIELD_OVERVIEW";
        const href = sessionUrl({ ...session, view: v });
        return (
          <a key={l.id} className="layer" href={href} onClick={(e) => { e.preventDefault(); goUrl(href); }} data-term={l.term}>
            <div className="space-title">{t(l.term)}</div>
            {l.space === "A" || l.space === "O" || l.space === "R" ? <SpaceHeader space={l.space} origin={null} /> : null}
            {l.status ? <ExecPill status={l.status} /> : null}
          </a>
        );
      })}
    </div>
  );
}
