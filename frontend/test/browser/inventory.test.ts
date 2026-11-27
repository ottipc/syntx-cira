// @vitest-environment node
// V3T03 / V2T01 (architecture v2.0.3, 08.2/08.3): request and field inventory per view against the approved state of
// main (ac5073b). Requests must be identical; the set of rendered terms and signs may grow, never shrink.
// The inventory file is written only by an explicit run with CIRA_WRITE_INVENTORY=1, which is never green.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { VIEW_IDS } from "../../src/session";
import { CMP, EXP, canon } from "../helpers/snapshots";
import { apiRequests, type Env, open, start, stop } from "./harness";

const FILE = join(resolve(__dirname, ".."), "inventory", "main-ac5073b.json");
const WRITE = process.env.CIRA_WRITE_INVENTORY === "1";
const q = (v: string) => `tick=3${v === "SCENARIO_COMPARISON" ? `&comparisonId=${encodeURIComponent(CMP)}` : ""}`;

interface Inv { requests: string[]; terms: string[]; sems: string[] }
let env: Env;
const got: Record<string, Inv> = {};
beforeAll(async () => {
  env = await start();
  for (const v of VIEW_IDS) {
    const p = await open(env, `/exp/${EXP.baseline}/${v}?${q(v)}`, { width: 1440, height: 900 });
    const dom = await p.evaluate(() => ({
      terms: [...new Set([...document.querySelectorAll("[data-term]")].map((e) => e.getAttribute("data-term") ?? ""))].sort(),
      sems: [...new Set([...document.querySelectorAll("[data-sem]")].map((e) => e.getAttribute("data-sem") ?? ""))].sort() }));
    got[v] = { requests: [...new Set(apiRequests(p).map((r) => { const [m, u] = r.split(" "); return `${m} ${canon(u!)}`; }))].sort(), ...dom };
    await p.context().close();
  }
}, 240000);
afterAll(async () => { await stop(env); });

describe("[V3T03][V2T01] request and field inventory equal to main (ac5073b)", () => {
  it("[V3T03] inventory file present (or written by an explicit, never-green run)", () => {
    if (WRITE) {
      mkdirSync(join(FILE, ".."), { recursive: true });
      writeFileSync(FILE, JSON.stringify({ source: "main ac5073b, 1440×900 standard, tick 3", views: got }, null, 1) + "\n");
      throw new Error(`inventory written: ${FILE} — review it, then run without CIRA_WRITE_INVENTORY`);
    }
    expect(existsSync(FILE), `inventory missing: ${FILE}`).toBe(true);
  });
  const main = existsSync(FILE) ? (JSON.parse(readFileSync(FILE, "utf-8")) as { views: Record<string, Inv> }).views : {};
  it.each(VIEW_IDS.map((v) => [v]))("[V3T03] %s: same API requests as main", (v) => {
    expect(got[v]!.requests).toEqual(main[v]?.requests);
  });
  it.each(VIEW_IDS.map((v) => [v]))("[V2T01] %s: every term and sign rendered on main is still rendered", (v) => {
    expect(main[v]!.terms.filter((t) => !got[v]!.terms.includes(t)), "terms lost").toEqual([]);
    expect(main[v]!.sems.filter((t) => !got[v]!.sems.includes(t)), "signs lost").toEqual([]);
  });
});
