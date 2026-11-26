// @vitest-environment node
// TX20 (AK-16b: AK-GUI-09, -10, -20) and TX31 (AK-GUI-18) — headless Chrome against a running backend (K-71).
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TERMS } from "../../src/language";
import { demoScript, DEEP_PATHS } from "../../src/demo/script";
import { get, type Live, page, post, seed, settled, startLive, stopLive } from "./live";

let live: Live;
let ids: { baseline: string; recovery: string; comparison: string };
beforeAll(async () => { live = await startLive(); ids = await seed(live); }, 240000);
afterAll(async () => { if (live) await stopLive(live); });

const TIMED = /\/(states|observations|results|governance)\b|metrics\?.*aggregation=PER_TICK/;
const tickOf = (url: string) => new URL(url, "http://x").searchParams.get("tick") ?? (/\/sweep:\w+:t(\d+):/.exec(url)?.[1] ?? null);

describe("[TX20][AK-GUI-20] the app works against the live API and nothing else", () => {
  it("[TX20] entry lists the live experiments; only the app origin and the local API are contacted", async () => {
    const { p, traffic } = await page(live, "/");
    const text = await p.textContent('[data-zone="C"]');
    expect(text).toContain(ids.baseline);
    expect(text).toContain(ids.recovery);
    expect(traffic.blocked).toEqual([]);
    expect(traffic.errors).toEqual([]);
    expect(traffic.requests.every((r) => r.method === "GET")).toBe(true);
    await p.context().close();
  }, 60000);
});

describe("[TX20][AK-GUI-09][REQ-055] tick change is synchronous across views 2, 3, 4 and 11", () => {
  it.each(["TOPOLOGY_GRAPH", "TEMPORAL_STATE_EXPLORER", "OBSERVATION_INSPECTOR", "EVENT_TIMELINE"])("[TX20] %s t=2 → t=3", async (view) => {
    const { p, traffic } = await page(live, `/exp/${ids.baseline}/${view}?tick=2`);
    const before = traffic.requests.length;
    await p.keyboard.press("ArrowRight");
    await settled(p);
    expect(new URL(p.url()).searchParams.get("tick")).toBe("3");
    expect(await p.locator('[data-zone="C"] [data-sem="SEM-028"]').count(), "no quarantine").toBe(0);
    const after = traffic.requests.slice(before).filter((r) => TIMED.test(r.url));
    expect(after.every((r) => tickOf(r.url) === "3"), JSON.stringify(after)).toBe(true);
    if (view === "TEMPORAL_STATE_EXPLORER") {
      const st = await get(live, `/experiments/${ids.baseline}/states?tick=3`);
      for (const v of st.values) {
        if (v.applicability !== "APPLICABLE") continue;
        expect(await p.locator(`[data-attribute="${v.attribute_ref}"] .cell-a`).textContent()).toContain(v.value);
      }
    }
    if (view === "OBSERVATION_INSPECTOR") {
      const ob = await get(live, `/experiments/${ids.baseline}/observations?tick=3`);
      expect(await p.locator("[data-observation]").count()).toBe(ob.observation.content.context.observations.length);
    }
    expect(traffic.errors).toEqual([]);
    await p.context().close();
  }, 90000);
});

describe("[TX20][AK-GUI-10][REQ-028] export in the browser", () => {
  it("[TX20] the downloaded bundle is valid and its bundle_hash is the server's", async () => {
    const { p } = await page(live, `/exp/${ids.baseline}/SYSTEM_FIELD_OVERVIEW?tick=5`);
    const [download] = await Promise.all([p.waitForEvent("download"), p.click('[data-term="action.export"]')]);
    const file = await download.path();
    const bundle = JSON.parse(readFileSync(file!, "utf-8"));
    const shown = (await p.locator('[data-testid="bundle-hash"]').textContent())?.trim();
    const server = await get(live, `/experiments/${ids.baseline}/export`);
    expect(shown).toBe(server.bundle_hash);
    expect(bundle.bundle_hash).toBe(server.bundle_hash);
    const again = await post(live, "/experiments/import", bundle);
    expect(again.status, "contract- and hash-valid; rejected only because it exists").toBe(409);
    expect(again.body.error.code).toBe("CONFLICT");
    await p.context().close();
  }, 90000);
});

describe("[TX20] control path against the running backend", () => {
  it("[TX20] a new experiment created in the workspace is one confirmed POST and completes on the server", async () => {
    const { p, traffic } = await page(live, "/");
    await p.click('[data-term="action.control"]');
    await p.click('[data-term="action.new"]');
    await p.waitForSelector('.dialog select option', { state: "attached" });
    await p.click('.dialog [data-term="action.confirm"]');
    await p.waitForURL(/\/exp\/exp:[0-9a-f]+-\d+\/SYSTEM_FIELD_OVERVIEW/);
    const posts = traffic.requests.filter((r) => r.method === "POST");
    expect(posts).toEqual([{ method: "POST", url: "/experiments" }]);
    const id = decodeURIComponent(new URL(p.url()).pathname.split("/")[2]!);
    const until = Date.now() + 60000;
    let st = "";
    while (Date.now() < until && !["COMPLETED", "PARTIAL", "FAILED", "BLOCKED"].includes(st)) {
      st = (await get(live, `/experiments/${id}`)).experiment.status;
      await new Promise((r) => setTimeout(r, 250));
    }
    expect(st).toBe("COMPLETED");
    await p.waitForFunction(() => document.querySelector('[data-zone="A"]')?.textContent?.includes("Completed"));
    expect(await p.locator('[data-zone="C"] [data-sem="SEM-028"]').count()).toBe(0);
    expect(traffic.errors).toEqual([]);
    await p.context().close();
  }, 120000);
});

describe("[TX31][AK-GUI-18][REQ-076] demo script against the running backend", () => {
  it("[TX31] eight steps by PageDown: each URL as scripted, expected signs present, narration shown, no POST", async () => {
    const steps = demoScript({ baseline: ids.baseline, recovery: ids.recovery, comparisonId: ids.comparison });
    expect(steps).toHaveLength(8);
    const { p, traffic } = await page(live, steps[0]!.url, { width: 1920, height: 1080 });
    for (const [i, s] of steps.entries()) {
      if (i > 0) { await p.keyboard.press("PageDown"); await settled(p); }
      const u = new URL(p.url());
      expect(u.pathname + u.search, `step ${i + 1} URL`).toBe(s.url);
      const zone = p.locator('[data-zone="C"]');
      expect(await zone.locator('[data-sem="SEM-028"]').count(), `step ${i + 1} quarantine`).toBe(0);
      for (const sem of s.expect) expect(await zone.locator(`[data-sem="${sem}"]`).count(), `step ${i + 1} ${sem}`).toBeGreaterThan(0);
      expect(await p.textContent('[data-sem="SEM-033"]'), `step ${i + 1} narration`).toContain(TERMS[s.narration].en);
    }
    expect(traffic.requests.filter((r) => r.method !== "GET"), "the demo never POSTs").toEqual([]);
    expect(traffic.errors).toEqual([]);
    expect(traffic.blocked).toEqual([]);
    await p.context().close();
  }, 180000);

  it("[TX31] Play demo runs hands-free for 80 s against the live backend: 8 steps in order, ~10 s each, then stops", async () => {
    const { p, traffic } = await page(live, `/exp/${ids.baseline}/SYSTEM_FIELD_OVERVIEW?tick=0`, { width: 1920, height: 1080 });
    const t0 = Date.now();
    await p.click('[data-term="action.play_demo"]');
    const seen: { step: string; at: number }[] = [];
    while (Date.now() - t0 < 95000) {
      const s = new URL(p.url()).searchParams.get("demoStep") ?? "";
      if (seen.at(-1)?.step !== s) seen.push({ step: s, at: Date.now() - t0 });
      expect(await p.locator('[data-zone="C"] [data-sem="SEM-028"]').count(), `quarantine at step ${s}`).toBe(0);
      if (await p.locator('[data-playing="false"]').count()) break;
      await p.waitForTimeout(250);
    }
    expect(seen.map((x) => x.step)).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    for (let i = 1; i < seen.length; i += 1) {
      const gap = seen[i]!.at - seen[i - 1]!.at;
      expect(gap, `step ${seen[i]!.step} after ${gap} ms`).toBeGreaterThan(9000);
      expect(gap).toBeLessThan(11500);
    }
    const total = Date.now() - t0;
    expect(total, `playback ended after ${total} ms`).toBeGreaterThan(79000);
    expect(total).toBeLessThan(84000);
    expect(traffic.requests.filter((r) => r.method !== "GET")).toEqual([]);
    expect(traffic.errors).toEqual([]);
    await p.context().close();
  }, 150000);

  it.each(DEEP_PATHS.map((d) => [d.key, d.views] as const))("[TX31] deep path %s opens without quarantine", async (_k, views) => {
    for (const v of views) {
      const { p, traffic } = await page(live, `/exp/${ids.baseline}/${v}?tick=3${v === "SCENARIO_COMPARISON" ? `&comparisonId=${encodeURIComponent(ids.comparison)}` : ""}`);
      expect(await p.locator('[data-zone="C"] [data-sem="SEM-028"]').count(), v).toBe(0);
      expect(traffic.errors, v).toEqual([]);
      await p.context().close();
    }
  }, 120000);
});
