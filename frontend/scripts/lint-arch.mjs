// Frontend architecture lint (TX24 raw strings, TX26 computation ban, canonical engine characters, token-only CSS).
// AST-based via the TypeScript compiler API. Exit 1 on any finding; prints one line per finding.
import ts from "typescript";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const app = resolve(here, "..");
// --root <dir> lints another tree with the same layout (used by the lint's own fixture test).
const ri = process.argv.indexOf("--root");
const root = ri > 0 ? resolve(process.argv[ri + 1]) : app;
const src = join(root, "src");
const rel = (p) => relative(root, p).split(sep).join("/");

const walk = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(src).filter((p) => !rel(p).includes("/generated/"));

// Canonical engine characters (K-31, backend core/unicode.py) and their look-alikes; Σ identities.
const CANONICAL = [">", "<", "≈", "→", "↔", "⊕", "⊖", "⊗", "⊘", "∆", "∇", "∑", "∂"];
const ENGINE_CHARS = new Set([...CANONICAL, "Σ", "Ʃ", "＞", "›", "＜", "‹", "∼", "≃", "⇒", "⟶", "⇔", "⟷"]);
const UI_ARROWS = new Set(["▸", "▾", "◀", "▶"]);
const isArrow = (c) => { const n = c.codePointAt(0); return (n >= 0x2190 && n <= 0x21ff) || (n >= 0x27f0 && n <= 0x27ff) || (n >= 0x2900 && n <= 0x297f) || (n >= 0x25b2 && n <= 0x25c5); };
const ENGINE_TOKEN = "src/semiontics/primitives/EngineToken.tsx";

// Zone tokens: media queries cannot read CSS variables, so @media px values must equal a zone token (or token − 1).
const ZONE = Object.values(JSON.parse(/export const ZONE = (\{.*?\}) as const/.exec(readFileSync(join(app, "src/semiontics/generated/tokens.ts"), "utf-8"))[1]));
const MEDIA_PX = new Set(ZONE.flatMap((v) => [v, v - 1]));

// Defined custom properties: generated token sheets plus any defined in the linted stylesheet itself.
const DEFINED = new Set(["tokens.css", "tailwind.theme.css"].flatMap((n) =>
  [...readFileSync(join(app, "src/semiontics/generated", n), "utf-8").matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])));

const findings = [];
const report = (file, node, sf, rule, msg) => {
  const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
  findings.push(`${rel(file)}:${line + 1}:${character + 1} ${rule} ${msg}`);
};

// TX26 scope: everything under src/views except the pure layout function (ADR-0005).
const inViews = (f) => rel(f).startsWith("src/views/") && !rel(f).endsWith("/02-topology/layout.ts");
const isModel = (f) => rel(f).endsWith("/model.ts");
const ARITH = new Set([ts.SyntaxKind.MinusToken, ts.SyntaxKind.AsteriskToken, ts.SyntaxKind.SlashToken, ts.SyntaxKind.PercentToken,
  ts.SyntaxKind.AsteriskAsteriskToken, ts.SyntaxKind.PlusEqualsToken, ts.SyntaxKind.MinusEqualsToken, ts.SyntaxKind.AsteriskEqualsToken,
  ts.SyntaxKind.SlashEqualsToken]);
const REL = new Set([ts.SyntaxKind.LessThanToken, ts.SyntaxKind.GreaterThanToken, ts.SyntaxKind.LessThanEqualsToken, ts.SyntaxKind.GreaterThanEqualsToken]);
const isStringy = (n) => ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n);

/** Comparator passed directly to `.sort(…)`: ordering is presentation, not domain computation. */
function inSortComparator(node) {
  for (let p = node.parent; p; p = p.parent) {
    if ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && p.parent && ts.isCallExpression(p.parent)) {
      const callee = p.parent.expression;
      return ts.isPropertyAccessExpression(callee) && callee.name.text === "sort";
    }
  }
  return false;
}

for (const f of files) {
  const text = readFileSync(f, "utf-8");
  if (f.endsWith(".css")) {
    const local = new Set([...text.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
    text.split("\n").forEach((l, i) => {
      for (const m of l.matchAll(/var\((--[\w-]+)/g)) if (!DEFINED.has(m[1]) && !local.has(m[1])) findings.push(`${rel(f)}:${i + 1} CSS-TOKEN undefined token ${m[1]}`);
      const code = l.replace(/\/\*.*?\*\//g, "");
      if (/#[0-9a-fA-F]{3,8}\b/.test(code)) findings.push(`${rel(f)}:${i + 1} CSS-TOKEN hex colour (use tokens)`);
      if (/\b(rgb|rgba|hsl|hsla|oklch)\(/.test(code)) findings.push(`${rel(f)}:${i + 1} CSS-TOKEN colour function (use tokens)`);
      const px = [...code.matchAll(/(?:^|[^\w-])(\d*\.?\d+)px\b/g)].map((m) => Number(m[1]));
      const media = /@media/.test(code);
      if (px.length && !/^\s*--/.test(code) && !(media && px.every((v) => MEDIA_PX.has(v)))) findings.push(`${rel(f)}:${i + 1} CSS-TOKEN px literal (use tokens)`);
    });
    continue;
  }
  if (!/\.(ts|tsx)$/.test(f)) continue;
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, f.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const views = inViews(f);
  const visit = (node) => {
    // TX24: no raw product text in JSX (letters in JSX text or in user-facing attribute literals).
    if (ts.isJsxText(node) && /\p{L}/u.test(node.text)) report(f, node, sf, "TX24", `raw text in JSX: ${JSON.stringify(node.text.trim()).slice(0, 60)}`);
    const intrinsic = (a) => { const el = a.parent?.parent; return el && (ts.isJsxOpeningElement(el) || ts.isJsxSelfClosingElement(el)) && /^[a-z]/.test(el.tagName.getText(sf)); };
    if (ts.isJsxAttribute(node) && intrinsic(node) && ["aria-label", "title", "placeholder", "alt"].includes(node.name.getText(sf))
      && node.initializer && ts.isStringLiteral(node.initializer) && /\p{L}/u.test(node.initializer.text)) {
      report(f, node, sf, "TX24", `raw ${node.name.getText(sf)} literal`);
    }
    // Canonical engine characters only inside EngineToken; UI arrows restricted to ▸ ▾ ◀ ▶.
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node) || ts.isTemplateHead(node)
      || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) && rel(f) !== ENGINE_TOKEN) {
      const s = node.text ?? "";
      const inJsxAttrName = ts.isJsxAttribute(node.parent);
      for (const c of s) {
        if (ENGINE_CHARS.has(c) && !(["<", ">"].includes(c) && !ts.isJsxText(node))) report(f, node, sf, "CANON", `engine character ${c} outside EngineToken`);
        else if (isArrow(c) && !UI_ARROWS.has(c) && !inJsxAttrName) report(f, node, sf, "CANON", `UI arrow ${c} not in {▸ ▾ ◀ ▶}`);
      }
    }
    if (views) {
      const allowOrder = isModel(f) && inSortComparator(node);
      if (ts.isBinaryExpression(node)) {
        const k = node.operatorToken.kind;
        if (ARITH.has(k) && !allowOrder) report(f, node, sf, "TX26", `arithmetic '${node.operatorToken.getText(sf)}' in view`);
        if (k === ts.SyntaxKind.PlusToken && !isStringy(node.left) && !isStringy(node.right) && !allowOrder) report(f, node, sf, "TX26", "numeric '+' in view");
        if (REL.has(k) && !allowOrder) report(f, node, sf, "TX26", `domain comparison '${node.operatorToken.getText(sf)}' in view`);
        if ((k === ts.SyntaxKind.EqualsEqualsEqualsToken || k === ts.SyntaxKind.ExclamationEqualsEqualsToken)
          && [node.left, node.right].every((x) => ts.isPropertyAccessExpression(x) && x.name.text === "value")) {
          report(f, node, sf, "TX26", "value comparison between spaces (dev.mismatch comes from the server)");
        }
      }
      if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node))
        && [ts.SyntaxKind.PlusPlusToken, ts.SyntaxKind.MinusMinusToken].includes(node.operator)) report(f, node, sf, "TX26", "increment in view");
      if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "Math") report(f, node, sf, "TX26", "Math.* in view");
      if (ts.isPropertyAccessExpression(node) && node.name.text === "reduce") report(f, node, sf, "TX26", "reduce() in view");
      if (ts.isPropertyAccessExpression(node) && node.name.text === "length" && ts.isCallExpression(node.expression)
        && ts.isPropertyAccessExpression(node.expression.expression) && node.expression.expression.name.text === "filter") {
        report(f, node, sf, "TX26", "counting via filter().length in view (counts come from the server)");
      }
    }
    if (ts.isJsxAttribute(node) && node.name.getText(sf) === "style") report(f, node, sf, "CSS-TOKEN", "inline style (use token classes)");
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(findings));
  process.exit(findings.length ? 1 : 0);
}
if (findings.length) {
  console.log(findings.join("\n"));
  console.log(`lint-arch: ${findings.length} finding(s)`);
  process.exit(1);
}
console.log(`lint-arch: ${files.length} files, 0 findings`);
