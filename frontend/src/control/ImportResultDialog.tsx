import { useState } from "react";
import type { ImportCreated } from "../access";
import { useT } from "../language";
import { IdText } from "../semiontics";
import { useSession } from "../session";
import { Dialog } from "./Dialog";
import { useCommand } from "./useCommand";

export function ImportResultDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { session } = useSession();
  const [text, setText] = useState("");
  const cmd = useCommand<ImportCreated>();
  let parsed: unknown = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = null; }
  return (
    <Dialog title="action.import_result" onCancel={onClose} pending={cmd.pending} error={cmd.error} disabled={parsed === null}
      done={cmd.result ? <IdText>{String(cmd.result.artifact_refs.length)}</IdText> : null}
      summary={<IdText>{session.experimentId ?? ""}</IdText>}
      onConfirm={() => void cmd.run(`/experiments/${session.experimentId ?? ""}/results/import`, parsed)}>
      <label>{t("origin.imported")}<textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} /></label>
    </Dialog>
  );
}
