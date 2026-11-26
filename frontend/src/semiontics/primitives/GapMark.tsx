import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-024 open gap with source-anchor count / SEM-025 closed in a later result. */
export function GapMark({ status, sources }: { status: string; sources: number }) {
  const t = useT();
  const open = status === "OPEN";
  return (
    <span className={`gap ${open ? "gap-open" : "gap-closed"}`} {...semAttrs(open ? "SEM-024" : "SEM-025", open ? "gap.open" : "gap.closed")}>
      <span aria-hidden="true">{open ? "◰" : "◼"}</span> {t(open ? "gap.open" : "gap.closed")}
      <span className="mono-id"> {String(sources)}</span>
    </span>
  );
}
