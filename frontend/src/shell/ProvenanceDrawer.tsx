import { useEffect, useState } from "react";
import { isTermKey, useT } from "../language";
import { useProvenance } from "../provenance";
import { IdText, OriginBadge } from "../semiontics";
import { TechnicalRecord } from "./TechnicalRecord";

/** Zone E (G03.10): renders the Provenance selection (IC-10: rendering lives in Shell per G03.3). */

/** MOT16 provenance echo (RES-09): while a source artifact is hovered, focused or pinned in Zone E, every block in
 *  Zone C drawn from it carries the canonical SEM-038 frame. Read-only; nothing else changes. */
function useEcho(id: string | null) {
  useEffect(() => {
    if (id === null) return undefined;
    // artifact ids are StableIds ([a-z0-9_.:/-]): safe inside a quoted attribute selector
    const els = [...document.querySelectorAll<HTMLElement>(`.zone-c [data-source-refs~="${id}"]`)];
    for (const e of els) { e.setAttribute("data-echo", ""); if (!e.hasAttribute("data-sem")) e.setAttribute("data-sem", "SEM-038"); }
    return () => { for (const e of els) { e.removeAttribute("data-echo"); if (e.getAttribute("data-sem") === "SEM-038") e.removeAttribute("data-sem"); } };
  }, [id]);
}

export function ProvenanceDrawer() {
  const t = useT();
  const { selection, close } = useProvenance();
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  useEcho(selection ? hover ?? pinned : null);
  useEffect(() => { setHover(null); setPinned(null); }, [selection]);
  return (
    <aside className="zone-e" hidden={selection === null} aria-label={t("prov.drawer")} data-zone="E">
      {selection ? (
        <div className="stack">
          <div className="row"><h2 className="section-title">{t("prov.drawer")}</h2><span className="spacer" />
            <button type="button" className="btn" onClick={close} data-term="action.close">{t("action.close")}</button></div>
          <div className="section-title">{isTermKey(selection.title) ? t(selection.title) : <IdText>{selection.title}</IdText>}</div>
          <OriginBadge origin={selection.header.data_origin} />
          <dl className="stack">
            <div className="row"><dt className="secondary">{t("prov.experiment")}</dt><dd><IdText>{selection.header.experiment_id ?? "—"}</IdText></dd></div>
            <div className="row"><dt className="secondary">{t("ui.tick", { t: selection.header.tick ?? "—" })}</dt></div>
            <div className="row"><dt className="secondary">{t("prov.schema")}</dt><dd><IdText>{selection.header.schema_version}</IdText></dd></div>
            <div className="row"><dt className="secondary">{t("prov.guard")}</dt><dd><IdText>{selection.header.guard_class}</IdText></dd></div>
          </dl>
          <div className="section-title">{t("prov.sources")}</div>
          <ul className="stack">
            {(selection.refs ?? selection.header.source_refs ?? []).map((r) => (
              <li key={r.artifact_id} className="echo-source">
                <button type="button" className="focus-handle" aria-pressed={pinned === r.artifact_id}
                  onMouseEnter={() => setHover(r.artifact_id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(r.artifact_id)} onBlur={() => setHover(null)}
                  onClick={() => setPinned(pinned === r.artifact_id ? null : r.artifact_id)}>
                  <IdText>{r.artifact_id}</IdText> <IdText>{r.artifact_type}</IdText></button><br /><IdText>{r.content_hash}</IdText></li>
            ))}
          </ul>
          {selection.strategies && selection.strategies.length > 0 ? (
            <>
              <div className="section-title">{t("prov.strategies")}</div>
              <ul>{selection.strategies.map((s) => <li key={`${s.point}:${s.variant}`}><IdText>{`${s.point} ${s.variant}/v${s.version}`}</IdText></li>)}</ul>
            </>
          ) : null}
          <TechnicalRecord raw={selection.raw ?? selection.header} />
        </div>
      ) : null}
    </aside>
  );
}
