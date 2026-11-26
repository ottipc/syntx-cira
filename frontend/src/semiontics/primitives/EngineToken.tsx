import { useT } from "../../language";
import { semAttrs } from "./_util";

/** SEM-027: engine provenance as datum in a product frame (INV-LANG-06). The only place canonical engine
 *  symbols and Σ identities are rendered; code points are passed through unchanged (K-31). */
export function EngineToken({ kind, datum, label, opaque }: { kind: "operator" | "field"; datum: string; label: string | null; opaque?: boolean }) {
  const t = useT();
  return (
    <span className={`engine-token engine-${kind}`} {...semAttrs("SEM-027", kind === "field" ? "engine.field" : "engine.operator")}>
      <span className="engine-frame">{t(kind === "field" ? "engine.field" : "engine.operator")}</span>
      <span className="mono-operator" data-datum="engine">{datum}</span>
      {opaque ? <span className="engine-note">{t("engine.code_opaque")}</span> : null}
      {label === null || label === "LABEL_UNAVAILABLE"
        ? <span className="engine-note">{t("engine.label_unavailable")}</span>
        : <span className="engine-label" data-datum="engine-label">“{label}”</span>}
    </span>
  );
}
