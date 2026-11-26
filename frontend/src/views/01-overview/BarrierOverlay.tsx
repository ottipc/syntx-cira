import { BarrierLine, RecoveryGateLine } from "../../semiontics";

/** The barrier is always visible (INV-VIS-08); the recovery loop runs only via a human gate. */
export function BarrierOverlay() {
  return <div className="stack"><BarrierLine /><RecoveryGateLine /></div>;
}
