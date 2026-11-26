import { useT } from "../language";

/** #21 is read-only in this version (D-49, RV-GUI-04): the dialog is prepared and disabled. */
export function AuthorizeDialog({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <div className="dialog stack" role="group" aria-label={t("action.authorize")}>
      <h3 className="section-title">{t("action.authorize")}</h3>
      <p className="secondary">{t("action.authorize.readonly")}</p>
      <div className="row">
        <button type="button" className="btn" disabled data-term="action.confirm">{t("action.confirm")}</button>
        <button type="button" className="btn" onClick={onClose} data-term="action.cancel">{t("action.cancel")}</button>
      </div>
    </div>
  );
}
