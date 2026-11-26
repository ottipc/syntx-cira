import { useT } from "../../language";
import { OriginBadge } from "./OriginBadge";
import { semAttrs } from "./_util";

const SEM_OF = { A: "SEM-001", O: "SEM-002", R: "SEM-003" } as const;
const TERM_OF = { A: "space.a", O: "space.o", R: "space.r" } as const;

/** SEM-001–003 column anchor with its own origin capsule. */
export function SpaceHeader({ space, origin }: { space: "A" | "O" | "R"; origin: string | null }) {
  const t = useT();
  return (
    <div className={`space-header space-${space.toLowerCase()}`} {...semAttrs(SEM_OF[space], TERM_OF[space])}>
      <span className={`shape shape-${space.toLowerCase()}`} aria-hidden="true" />
      <span className="space-title">{t(TERM_OF[space])}</span>
      {origin ? <OriginBadge origin={origin} /> : null}
    </div>
  );
}
