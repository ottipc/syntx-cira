import { useState } from "react";
import { useT, type TermKey } from "../language";
import { AuthorizeDialog } from "./AuthorizeDialog";
import { CompareDialog } from "./CompareDialog";
import { ImportBundleDialog } from "./ImportBundleDialog";
import { ImportResultDialog } from "./ImportResultDialog";
import { NewExperimentDialog } from "./NewExperimentDialog";
import { ReplayDialog } from "./ReplayDialog";
import { ResweepDialog } from "./ResweepDialog";

type Key = "new" | "resweep" | "import_result" | "replay" | "import_bundle" | "compare" | "authorize";
const ITEMS: readonly [Key, TermKey][] = [["new", "action.new"], ["resweep", "action.resweep"], ["import_result", "action.import_result"],
  ["replay", "action.replay"], ["import_bundle", "action.import_bundle"], ["compare", "action.compare"], ["authorize", "action.authorize"]];

/** Control (F07.9): each action = summary ▸ confirm ▸ 202 (SEM-020 for the authorization gate). */
export function ControlDrawer() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [dlg, setDlg] = useState<Key | null>(null);
  const close = () => setDlg(null);
  return (
    <div className="control">
      <button type="button" className="btn" aria-expanded={open} onClick={() => setOpen(!open)} data-term="action.control">⋯ {t("action.control")}</button>
      {open ? (
        <div className="dialog control-panel" data-panel="control">
          <ul className="stack plain" role="menu" aria-label={t("action.control")}>{ITEMS.map(([k, term]) => (
            <li key={k} role="none"><button type="button" className="btn" role="menuitem" onClick={() => setDlg(k)} data-term={term}>{t(term)}</button></li>
          ))}</ul>
          {dlg === "new" ? <NewExperimentDialog onClose={close} /> : null}
          {dlg === "resweep" ? <ResweepDialog onClose={close} /> : null}
          {dlg === "import_result" ? <ImportResultDialog onClose={close} /> : null}
          {dlg === "replay" ? <ReplayDialog onClose={close} /> : null}
          {dlg === "import_bundle" ? <ImportBundleDialog onClose={close} /> : null}
          {dlg === "compare" ? <CompareDialog onClose={close} /> : null}
          {dlg === "authorize" ? <AuthorizeDialog onClose={close} /> : null}
        </div>
      ) : null}
    </div>
  );
}
