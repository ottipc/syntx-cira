import { useState } from "react";
import { ep, useProjection } from "../access";
import type { ComparisonResponse, ExperimentsResponse } from "../access";
import { useT } from "../language";
import { IdText } from "../semiontics";
import { sessionUrl, useSession } from "../session";
import { Dialog } from "./Dialog";
import { useCommand } from "./useCommand";

export function CompareDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { session, goUrl } = useSession();
  const xs = useProjection<ExperimentsResponse>(ep.experiments());
  const list = xs.data?.experiments ?? [];
  const [b, setB] = useState("");
  const [r, setR] = useState("");
  const base = b || session.experimentId || "";
  const rec = r || list.find((x) => x.experiment_id !== base)?.experiment_id || "";
  const cmd = useCommand<ComparisonResponse>();
  return (
    <Dialog title="action.compare" onCancel={onClose} pending={cmd.pending} error={cmd.error}
      done={cmd.result ? <IdText>{cmd.result.comparison.comparison_key}</IdText> : null}
      summary={<IdText>{`${base} · ${rec}`}</IdText>}
      onConfirm={async () => {
        const res = await cmd.run("/comparisons", { baseline_experiment_id: base, recovery_experiment_id: rec });
        if (res) goUrl(sessionUrl({ ...session, view: "SCENARIO_COMPARISON", comparisonId: res.comparison.comparison_key }));
      }}>
      <label>{t("ui.baseline")}<select value={base} onChange={(e) => setB(e.target.value)}>
        {list.map((x) => <option key={x.experiment_id} value={x.experiment_id}>{`${x.label} · ${x.experiment_id}`}</option>)}</select></label>
      <label>{t("ui.recovery")}<select value={rec} onChange={(e) => setR(e.target.value)}>
        {list.map((x) => <option key={x.experiment_id} value={x.experiment_id}>{`${x.label} · ${x.experiment_id}`}</option>)}</select></label>
    </Dialog>
  );
}
