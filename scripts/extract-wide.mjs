import fs from "node:fs";
import path from "node:path";

const dir = "c:/Users/User/Downloads/sportytadka-work-tiles-wide";
const outDir = path.resolve("src/components/site/work-loops");
fs.mkdirSync(outDir, { recursive: true });

const map = {
  "drop-day.html": { num: "01", name: "DropDayLoop", ns: "wt01" },
  "full-time-felling.html": { num: "02", name: "FullTimeFeelingsLoop", ns: "wt02" },
  "the-comeback.html": { num: "03", name: "TheComebackLoop", ns: "wt03" },
  "protein-oclock.html": { num: "04", name: "ProteinOclockLoop", ns: "wt04" },
  "league-night.html": { num: "05", name: "LeagueNightLoop", ns: "wt05" },
  "fan-cam.html": { num: "06", name: "FanCamLoop", ns: "wt06" },
};

function extractStyle(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (!m) throw new Error("No style block");
  let css = m[1];
  css = css.replace(/\/\* ======= PREVIEW ONLY[\s\S]*$/i, "");
  css = css.replace(/html\s*,\s*body\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/body\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/\.mock[\s\S]*?(?=\n\/\*|\n@media|\n\.|\n@$|$)/g, "");
  return css.trim() + "\n";
}

function namespaceCss(css, ns) {
  // Scope shared .wt rules under this tile's root so multi-import stays isolated.
  let out = css;
  // Only bare .wt (not .wt01+) so tile-specific selectors stay intact.
  out = out.replace(/\.wt(?!\d)/g, `.${ns}`);
  out = out.replace(/@keyframes\s+wt-/g, `@keyframes ${ns}-`);
  out = out.replace(/animation-name:\s*wt-/g, `animation-name: ${ns}-`);
  out = out.replace(/(?<![A-Za-z0-9_-])wt-(?=v\d|blink|floor|scanx|marq\b)/g, `${ns}-`);
  return out;
}

function extractComponent(html) {
  const start = html.indexOf("COMPONENT START");
  const end = html.indexOf("COMPONENT END");
  if (start < 0 || end < 0) throw new Error("Missing component markers");
  const slice = html.slice(start, end);
  const divStart = slice.indexOf("<div");
  const lastClose = slice.lastIndexOf("</div>");
  if (divStart < 0 || lastClose < 0) throw new Error("Missing component div");
  return slice.slice(divStart, lastClose + "</div>".length);
}

function htmlToJsx(html, ns) {
  let jsx = html;
  // Root was "wt wt01" — after CSS namespace, only ns class is needed
  jsx = jsx.replace(/\bclass="wt wt\d+"/g, `className="${ns}"`);
  jsx = jsx.replace(/\bclass="wt /g, `className="${ns} `);
  jsx = jsx.replace(/\bclass="wt"/g, `className="${ns}"`);
  jsx = jsx.replace(/\bclass="/g, 'className="');

  jsx = jsx.replace(/\bfill-opacity="/g, 'fillOpacity="');
  jsx = jsx.replace(/\bstroke-opacity="/g, 'strokeOpacity="');
  jsx = jsx.replace(/\bstroke-width="/g, 'strokeWidth="');
  jsx = jsx.replace(/\bstroke-dasharray="/g, 'strokeDasharray="');
  jsx = jsx.replace(/\bstroke-linecap="/g, 'strokeLinecap="');
  jsx = jsx.replace(/\bstroke-linejoin="/g, 'strokeLinejoin="');
  jsx = jsx.replace(/\bclip-path="/g, 'clipPath="');
  jsx = jsx.replace(/\bstop-color="/g, 'stopColor="');
  jsx = jsx.replace(/\bstop-opacity="/g, 'stopOpacity="');
  jsx = jsx.replace(/\bflood-color="/g, 'floodColor="');
  jsx = jsx.replace(/\bflood-opacity="/g, 'floodOpacity="');
  jsx = jsx.replace(/\bxlink:href="/g, 'href="');

  jsx = jsx.replace(/\sstyle="([^"]*)"/g, (_, raw) => {
    const entries = raw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const i = pair.indexOf(":");
        if (i < 0) return null;
        let key = pair.slice(0, i).trim();
        const val = pair.slice(i + 1).trim();
        if (key.startsWith("--")) {
          return `"${key}": "${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        }
        key = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return `${key}: "${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      })
      .filter(Boolean);
    const body = entries.join(", ");
    if (body.includes('"--')) {
      return ` style={{ ${body} } as CSSProperties}`;
    }
    return ` style={{ ${body} }}`;
  });

  jsx = jsx.replace(/\saria-hidden(?=[\s>])/g, " aria-hidden={true}");
  jsx = jsx.replace(/<br\s*>/gi, "<br />");
  jsx = jsx.replace(/<i(\s[^>]*)><\/i>/gi, "<i$1 />");
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/*${c.replace(/\*\//g, "* /")}*/}`);
  jsx = jsx.replace(/'/g, "&apos;");

  return jsx;
}

const exportsList = [];

for (const [file, meta] of Object.entries(map)) {
  const html = fs.readFileSync(path.join(dir, file), "utf8");
  const css = namespaceCss(extractStyle(html), meta.ns);
  const jsxBody = htmlToJsx(extractComponent(html), meta.ns);
  const needsCss = jsxBody.includes("as CSSProperties");

  fs.writeFileSync(path.join(outDir, `${meta.ns}.css`), css);

  const tsx = `${needsCss ? 'import type { CSSProperties } from "react";\n' : ""}import "./${meta.ns}.css";\n\nexport function ${meta.name}() {\n  return (\n    ${jsxBody
    .split("\n")
    .map((line, i) => (i === 0 ? line : `    ${line}`))
    .join("\n")}\n  );\n}\n`;

  fs.writeFileSync(path.join(outDir, `${meta.name}.tsx`), tsx);
  exportsList.push(meta);
  console.log("wrote", meta.name, meta.ns, "from", file);
}

fs.writeFileSync(
  outDir + "/index.ts",
  `${exportsList.map((e) => `export { ${e.name} } from "./${e.name}";`).join("\n")}\n`,
);

// Remove obsolete square-loop CSS/TSX namespaces
for (const stale of ["fcm", "ftf", "lgn", "poc", "tcb", "MatchdayLoop"]) {
  for (const ext of [".css", ".tsx"]) {
    const p = path.join(outDir, stale + ext);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}
// MatchdayLoop lives one level up
const matchday = path.resolve("src/components/site/MatchdayLoop.tsx");
const matchdayCss = path.resolve("src/components/site/matchday-loop.css");
if (fs.existsSync(matchday)) fs.unlinkSync(matchday);
if (fs.existsSync(matchdayCss)) fs.unlinkSync(matchdayCss);
