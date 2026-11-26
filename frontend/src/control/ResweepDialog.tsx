import type { SweepsCreated } from "../access";
import { IdText } from "../semiontics";
import { useSession } from "../session";
import { Dialog } from "./Dialog";
import { useCommand } from "./useCommand";

export function ResweepDialog({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const cmd = useCommand<SweepsCreated>();
  return (
    <Dialog title="action.resweep" onCancel={onClose} pending={cmd.pending} error={cmd.error}
      done={cmd.result ? <IdText>{cmd.result.sweep_ids.join(" · ")}</IdText> : null}
      summary={<IdText>{`${session.experimentId ?? ""} · t${session.tick}`}</IdText>}
      onConfirm={() => void cmd.run(`/experiments/${session.experimentId ?? ""}/sweeps`, { ticks: [session.tick] })} />
  );
}
