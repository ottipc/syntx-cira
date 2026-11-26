import { useState } from "react";
import type { ReplayCreated } from "../access";
import { useT } from "../language";
import { IdText } from "../semiontics";
import { sessionUrl, useSession } from "../session";
import { Dialog } from "./Dialog";
import { useCommand } from "./useCommand";

export function ImportBundleDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { session, goUrl } = useSession();
  const [text, setText] = useState("");
  const cmd = useCommand<ReplayCreated>();
  let parsed: unknown = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
  return (
    <Dialog title="action.import_bundle" onCancel={onClose} pending={cmd.pending} error={cmd.error} disabled={parsed === null}
      done={cmd.result ? <IdText>{cmd.result.experiment_id}</IdText> : null} summary={<span>{t("action.import_bundle")}</span>}
      onConfirm={async () => {
        const r = await cmd.run("/experiments/import", parsed);
        if (r) goUrl(sessionUrl({ ...session, experimentId: r.experiment_id }));
      }}>
      <label>{t("action.import_bundle")}<textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} /></label>
    </Dialog>
  );
}
