// TS contract types from the bundled JSON Schema (P12, TX02). Generated output is never edited (E-10).
import { compile } from "json-schema-to-typescript";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const schemaPath = resolve(root, "contracts/schemas/cira.contracts.schema.json");
const out = resolve(here, "../src/contracts/generated/cira.ts");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// Wire-form normalisation (ADR-0005): (1) pydantic tuples are emitted as `prefixItems` (2020-12), which
// json-schema-to-typescript does not read — rewrite to draft-07 tuple form; (2) the server serialises every
// field (model_dump without exclude_*), so every declared property is present on the wire → required.
function wire(node) {
  if (Array.isArray(node)) return node.map(wire);
  if (node === null || typeof node !== "object") return node;
  const out = Object.fromEntries(Object.entries(node).map(([k, v]) => [k, wire(v)]));
  if (Array.isArray(out.prefixItems)) {
    out.items = out.prefixItems;
    out.additionalItems = false;
    delete out.prefixItems;
  }
  if (out.type === "object" && out.properties && typeof out.properties === "object") {
    out.required = Object.keys(out.properties).sort();
  }
  return out;
}
schema.$defs = wire(schema.$defs);

const wrapper = {
  title: "CiraContracts",
  type: "object",
  additionalProperties: false,
  properties: Object.fromEntries(Object.keys(schema.$defs).sort().map((k) => [k, { $ref: `#/$defs/${k}` }])),
  $defs: schema.$defs,
};
let ts = await compile(wrapper, "CiraContracts", {
  bannerComment: "/* GENERATED from contracts/schemas/cira.contracts.schema.json by scripts/gen-contracts.mjs — do not edit (E-10) */",
  additionalProperties: false,
  declareExternallyReferenced: true,
  unreachableDefinitions: true,
  strictIndexSignatures: true,
  format: false,
});
ts = ts.replace(/\r\n/g, "\n");
if (process.argv.includes("--check")) {
  const same = existsSync(out) && readFileSync(out, "utf-8") === ts;
  console.log(same ? "ts-contracts: in sync" : "ts-contracts: DRIFT");
  process.exit(same ? 0 : 1);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, ts);
console.log(`wrote ${out.replace(root + "/", "")} (${ts.length} bytes)`);
