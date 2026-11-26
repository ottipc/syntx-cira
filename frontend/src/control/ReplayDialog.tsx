import { useState } from "react";
import type { ReplayCreated } from "../access";
import { useT } from "../language";
import { IdText } from "../semiontics";
import { sessionUrl, useSession } from "../session";
import { Dialog } from "./Dialog";
import { useCommand } from "./useCommand";

export function ReplayDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { session, goUrl } = useSession();
  const [mode, setMode] = useState<"SYNTHETIC" | "PRESERVED_ENGINE">("SYNTHETIC");
  const cmd = useCommand<ReplayCreated>();
  return (
    <Dialog title="action.replay" onCancel={onClose} pending={cmd.pending} error={cmd.error}
      done={cmd.result ? <IdText>{cmd.result.experiment_id}</IdText> : null}
      summary={<IdText>{`${session.experimentId ?? ""} · ${mode}`}</IdText>}
      onConfirm={async () => {
        const r = await cmd.run(`/experiments/${session.experimentId ?? ""}/replay`, { mode });
        if (r) goUrl(sessionUrl({ ...session, experimentId: r.experiment_id }));
      }}>
      <label><select value={mode} onChange={(e) => setMode(e.target.value === "PRESERVED_ENGINE" ? "PRESERVED_ENGINE" : "SYNTHETIC")}>
        <option value="SYNTHETIC">{t("replay.synthetic")}</option><option value="PRESERVED_ENGINE">{t("replay.preserved")}</option>
      </select></label>
    </Dialog>
  );
}
