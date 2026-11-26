import type { ReactNode } from "react";
import { useT, type TermKey } from "../language";

export function Dialog({ title, summary, onConfirm, onCancel, disabled, children, pending, error, done }: {
  title: TermKey; summary: ReactNode; onConfirm: () => void; onCancel: () => void; disabled?: boolean; children?: ReactNode;
  pending: boolean; error: string | null; done: ReactNode | null;
}) {
  const t = useT();
  return (
    <div className="dialog stack" role="group" aria-label={t(title)}>
      <h3 className="section-title">{t(title)}</h3>
      {children}
      <div><span className="secondary">{t("action.summary")}: </span>{summary}</div>
      {error ? <p className="mono-id" role="alert">{error}</p> : null}
      {done ? <div>{t("action.accepted")} {done}</div> : null}
      <div className="row">
        <button type="button" className="btn" onClick={onConfirm} disabled={disabled || pending} data-term="action.confirm">{t("action.confirm")}</button>
        <button type="button" className="btn" onClick={onCancel} data-term="action.cancel">{t("action.cancel")}</button>
      </div>
    </div>
  );
}
