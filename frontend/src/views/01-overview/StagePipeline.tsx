import { useT } from "../../language";
import { ExecPill } from "../../semiontics";
import { STAGE_NUM, type StageVM } from "./model";

export function StagePipeline({ stages }: { stages: StageVM[] }) {
  const t = useT();
  return (
    <div className="panel">
      <h2 className="section-title">{t("stage.pipeline")}</h2>
      <table className="data"><tbody>
        {stages.map((s) => <tr key={s.stage} data-stage={s.stage}><td className="mono-id">{STAGE_NUM[s.stage]}</td><td>{t(s.term)}</td><td><ExecPill status={s.status} /></td></tr>)}
      </tbody></table>
    </div>
  );
}
