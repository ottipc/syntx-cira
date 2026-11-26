import { useState } from "react";
import { ep, getJson, useProjection } from "../access";
import type { ExperimentBundle, ExperimentViewResponse } from "../access";
import { useT } from "../language";
import { IdText } from "../semiontics";
import { useSession } from "../session";

/** Export (#8): download of the bundle; the bundle_hash shown is the one delivered by the server. Locked while RUNNING. */
export function ExportAction() {
  const t = useT();
  const { session } = useSession();
  const v = useProjection<ExperimentViewResponse>(session.experimentId ? ep.experiment(session) : null);
  const [hash, setHash] = useState<string | null>(null);
  const running = v.data?.experiment.status === "RUNNING" || v.data?.experiment.status === "CREATED";
  const doExport = async () => {
    const b = await getJson<ExperimentBundle>(ep.exportBundle(session));
    setHash(b.bundle_hash);
    const blob = new Blob([JSON.stringify(b, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${b.experiment_id.replace(":", "_")}.bundle.json`;
    a.click();
  };
  return (
    <span className="row">
      <button type="button" className="btn" disabled={!session.experimentId || running} onClick={() => void doExport()}
        data-term="action.export">▾ {t("action.export")}</button>
      {hash ? <span title={t("export.hash")} data-testid="bundle-hash"><IdText>{hash}</IdText></span> : null}
    </span>
  );
}
