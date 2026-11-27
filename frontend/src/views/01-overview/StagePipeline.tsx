import { useT } from "../../language";
import { ExecPill, FocusHandle, FocusMarks } from "../../semiontics";
import { FocusTr } from "../_common";
import { STAGE_NUM, stageId, type StageVM } from "./model";

export function StagePipeline({ stages }: { stages: StageVM[] }) {
  const t = useT();
  return (
    <div className="panel">
      <h2 className="section-title">{t("stage.pipeline")}</h2>
      <table className="data"><tbody>
        {stages.map((s) => <FocusTr key={s.stage} id={stageId(s.stage)} data-stage={s.stage}><td className="mono-id"><FocusMarks id={stageId(s.stage)} />{STAGE_NUM[s.stage]}</td>
          <td><FocusHandle id={stageId(s.stage)}>{t(s.term)}</FocusHandle></td><td><ExecPill status={s.status} /></td></FocusTr>)}
      </tbody></table>
    </div>
  );
}
