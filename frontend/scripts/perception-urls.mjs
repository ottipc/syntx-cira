// V2T24 protocol kit (architecture v2.0.3, 08.6): prints the URL of every condition of tasks P1–P6.
// usage: node scripts/perception-urls.mjs <main-base-url> <branch-base-url>
const [mainBase, branchBase] = process.argv.slice(2);
if (!mainBase || !branchBase) { console.error("usage: node scripts/perception-urls.mjs <main-base-url> <branch-base-url>"); process.exit(2); }
const EXP = "exp:0c7da892f472-0", SPARSE = "exp:92b81e996185-0";
const TASKS = [
  ["P1", "TEMPORAL_STATE_EXPLORER", "tick=3"], ["P2a", "TEMPORAL_STATE_EXPLORER", "tick=3"], ["P2b", "TEMPORAL_STATE_EXPLORER", "tick=4", SPARSE],
  ["P3", "STRUCTURAL_METRICS", "tick=3"], ["P4", "TOPOLOGY_GRAPH", "tick=3"], ["P5", "STRUCTURAL_METRICS", "tick=3"],
  ["P6", "SYSTEM_FIELD_OVERVIEW", "tick=3"],
];
for (const [stand, base] of [["main", mainBase], ["branch", branchBase]]) {
  for (const lang of ["en", "de"]) for (const mode of ["standard", "presentation"]) for (const [task, view, q, exp = EXP] of TASKS) {
    const params = `${q}&lang=${lang}${mode === "presentation" ? "&mode=presentation" : ""}`;
    console.log([stand, lang, mode, task, `${base.replace(/\/$/, "")}/exp/${exp}/${view}?${params}`].join("\t"));
  }
}
