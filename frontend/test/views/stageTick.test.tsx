// MOT10 (architecture v2.0.3, 05.7): a stage row confirms its border only when its status changed since the previous
// render (polling while RUNNING); the first render — and so every static fixture view — never animates.
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../../src/language";
import { StagePipeline } from "../../src/views/01-overview/StagePipeline";
import { pipeline } from "../../src/views/01-overview/model";

afterEach(cleanup);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const exp = (status: string): any => ({ stage_status: [{ stage: "DEFINITIONS", status: "COMPLETED" }, { stage: "FORWARD", status }] });

describe("[U20] MOT10 stage tick", () => {
  it("no confirmation on first render; only the changed row confirms after a status change", () => {
    const ui = (s: string) => <LanguageProvider lang="en"><StagePipeline stages={pipeline(exp(s))} /></LanguageProvider>;
    const r = render(ui("RUNNING"));
    expect(r.container.querySelectorAll("[data-stage-commit]")).toHaveLength(0);
    r.rerender(ui("RUNNING"));
    expect(r.container.querySelectorAll("[data-stage-commit]")).toHaveLength(0);
    r.rerender(ui("COMPLETED"));
    expect([...r.container.querySelectorAll("[data-stage-commit]")].map((e) => e.getAttribute("data-stage"))).toEqual(["FORWARD"]);
  });
});
