import type { ProjectionHeader } from "./model";
import { useT, type TermKey } from "../../language";
import { useProvenance } from "../../provenance";

export function ProvButton({ title, header, raw, strategies }: { title: TermKey; header: ProjectionHeader; raw?: unknown;
  strategies?: readonly { point: string; variant: string; version: number }[] }) {
  const t = useT();
  const { open } = useProvenance();
  return (
    <button type="button" className="chip" onClick={() => open({ title, header, raw, strategies })} data-term="prov.drawer"
      data-provenance={header.schema_version}>{t("prov.drawer")}</button>
  );
}
