// Converts vitest's JSON reporter output into the gate's result format (tools/report.py): one record per test with
// test ids ([TXnn], [Tnn], [Tnnb]) and requirement ids ([REQ-nnn]) taken from the describe/test names.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const app = resolve(here, "..");
const raw = JSON.parse(readFileSync(resolve(app, "test-results/vitest-raw.json"), "utf-8"));
const OUTCOME = { passed: "passed", failed: "failed", skipped: "skipped", pending: "skipped", todo: "skipped", disabled: "skipped" };
const tests = {};
for (const file of raw.testResults ?? []) {
  const f = relative(resolve(app, ".."), file.name).split("\\").join("/");
  if (file.status === "failed" && (file.assertionResults ?? []).length === 0) {
    tests[`${f}::<collect>`] = { tids: [], reqs: [], outcome: "failed", duration: 0, longrepr: String(file.message ?? "").slice(-1500) };
  }
  for (const a of file.assertionResults ?? []) {
    const name = a.fullName ?? [...(a.ancestorTitles ?? []), a.title].join(" > ");
    const tids = [...new Set([...name.matchAll(/\[(TX\d{2}|T\d{2}b?)\]/g)].map((m) => m[1]))].sort();
    const reqs = [...new Set([...name.matchAll(/\[(REQ-\d{3})\]/g)].map((m) => m[1]))].sort();
    let key = `${f}::${name}`;
    for (let i = 2; tests[key]; i += 1) key = `${f}::${name} #${i}`;
    tests[key] = { tids, reqs, outcome: OUTCOME[a.status] ?? "failed", duration: (a.duration ?? 0) / 1000,
                   ...(a.failureMessages?.length ? { longrepr: a.failureMessages.join("\n").slice(-1500) } : {}) };
  }
}
mkdirSync(resolve(app, "test-results"), { recursive: true });
writeFileSync(resolve(app, "test-results/vitest.json"), JSON.stringify({ tests }, null, 1) + "\n");
const n = Object.values(tests);
console.log(`vitest-report: ${n.length} tests, ${n.filter((t) => t.outcome === "passed").length} passed, ` +
  `${n.filter((t) => t.outcome === "failed").length} failed, ${n.filter((t) => t.outcome === "skipped").length} skipped`);
process.exit(n.some((t) => t.outcome !== "passed") || n.length === 0 ? 1 : 0);
