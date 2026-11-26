import type { ContextBundle } from "../../access";
import { useT } from "../../language";
import { IdText } from "../../semiontics";

export function ContextChain({ c }: { c: ContextBundle }) {
  const t = useT();
  return (
    <div className="panel"><h2 className="section-title">{t("obs.context")}</h2>
      <div className="row"><IdText>{c.context_version}</IdText>{c.previous_context_ref ? <><span aria-hidden="true">◀</span><IdText>{c.previous_context_ref}</IdText></> : null}</div>
    </div>
  );
}
