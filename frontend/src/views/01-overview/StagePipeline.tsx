import { useEffect, useRef } from "react";
import { useT } from "../../language";
import { ExecPill, FocusHandle, FocusMarks } from "../../semiontics";
import { FocusTr } from "../_common";
import { STAGE_NUM, stageId, type StageVM } from "./model";

export function StagePipeline({ stages }: { stages: StageVM[] }) {
  const t = useT();
  // MOT10: a status that changed since the previous render (polling while RUNNING) confirms its row once; the first
  // render and static fixture views never animate
  const prev = useRef<Map<string, string> | null>(null);
  const changed = (s: StageVM) => prev.current !== null && prev.current.get(s.stage) !== s.status;
  useEffect(() => { prev.current = new Map(stages.map((s) => [s.stage, s.status] as const)); });
  return (
    <div className="panel">
      <h2 className="section-title">{t("stage.pipeline")}</h2>
      <table className="data"><tbody>
        {stages.map((s) => <FocusTr key={`${s.stage}:${s.status}`} id={stageId(s.stage)} data-stage={s.stage} {...(changed(s) ? { "data-stage-commit": "" } : {})}><td className="mono-id"><FocusMarks id={stageId(s.stage)} />{STAGE_NUM[s.stage]}</td>
          <td><FocusHandle id={stageId(s.stage)}>{t(s.term)}</FocusHandle></td><td><ExecPill status={s.status} /></td></FocusTr>)}
      </tbody></table>
    </div>
  );
}
