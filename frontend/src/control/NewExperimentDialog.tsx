import { useState } from "react";
import { ep, useProjection } from "../access";
import type { CreatedResponse, ScenariosResponse } from "../access";
import { useT } from "../language";
import { IdText } from "../semiontics";
import { sessionUrl, useSession } from "../session";
import { Dialog } from "./Dialog";
import { useCommand } from "./useCommand";

export function NewExperimentDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { session, goUrl } = useSession();
  const sc = useProjection<ScenariosResponse>(ep.scenarios());
  const [scn, setScn] = useState<string>("");
  const [cfg, setCfg] = useState<string>("");
  const [tgt, setTgt] = useState<string>("");
  const cmd = useCommand<CreatedResponse>();
  const list = sc.data?.scenarios ?? [];
  const cur = list.find((s) => s.scenario_id === scn) ?? list[0];
  const scenarioId = cur?.scenario_id ?? "";
  const configId = cfg || cur?.observation_configs?.[0] || "";
  const targetId = tgt || cur?.targets?.[0] || "";
  return (
    <Dialog title="action.new" onCancel={onClose} pending={cmd.pending} error={cmd.error}
      done={cmd.result ? <IdText>{cmd.result.experiment_id}</IdText> : null} disabled={!scenarioId}
      summary={<IdText>{`${scenarioId} · ${configId} · ${targetId}`}</IdText>}
      onConfirm={async () => {
        const r = await cmd.run("/experiments", { scenario_id: scenarioId, observation_config_id: configId, target_definition_id: targetId });
        if (r) goUrl(sessionUrl({ ...session, experimentId: r.experiment_id, view: "SYSTEM_FIELD_OVERVIEW", tick: 0 }));
      }}>
      <label>{t("ui.scenario")}<select value={scenarioId} onChange={(e) => setScn(e.target.value)}>
        {list.map((s) => <option key={s.scenario_id} value={s.scenario_id}>{s.scenario_id}</option>)}</select></label>
      <label>{t("ui.observation_setup")}<select value={configId} onChange={(e) => setCfg(e.target.value)}>
        {(cur?.observation_configs ?? []).map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
      <label>{t("ui.target")}<select value={targetId} onChange={(e) => setTgt(e.target.value)}>
        {(cur?.targets ?? []).map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
    </Dialog>
  );
}
