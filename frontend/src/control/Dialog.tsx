import type { ReactNode } from "react";
import { TermMaps, useT, type TermKey } from "../language";
import { IdText } from "../semiontics";
import type { CommandError } from "./useCommand";

export function Dialog({ title, summary, onConfirm, onCancel, disabled, children, pending, error, done }: {
  title: TermKey; summary: ReactNode; onConfirm: () => void; onCancel: () => void; disabled?: boolean; children?: ReactNode;
  pending: boolean; error: CommandError | null; done: ReactNode | null;
}) {
  const t = useT();
  return (
    <div className="dialog stack" role="group" aria-label={t(title)}>
      <h3 className="section-title">{t(title)}</h3>
      {children}
      <div><span className="secondary">{t("action.summary")}: </span>{summary}</div>
      {error ? <ErrorLine e={error} /> : null}
      {done ? <div>{t("action.accepted")} {done}</div> : null}
      <div className="row">
        <button type="button" className="btn" onClick={onConfirm} disabled={disabled || pending} data-term="action.confirm">{t("action.confirm")}</button>
        <button type="button" className="btn" onClick={onCancel} data-term="action.cancel">{t("action.cancel")}</button>
      </div>
    </div>
  );
}

function ErrorLine({ e }: { e: CommandError }) {
  const t = useT();
  const term = e.code ? (TermMaps.TERM_ErrorCodeC as Record<string, TermKey>)[e.code] : undefined;
  return (
    <p role="alert" data-term={term ?? "msg.unavailable"}>{term ? t(term) : t("action.failed")}
      {e.status !== null ? <> <IdText>{`HTTP ${e.status}`}</IdText></> : null}</p>
  );
}
