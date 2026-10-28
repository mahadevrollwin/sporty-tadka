import fs from "node:fs";
import path from "node:path";

const dir = "c:/Users/User/Downloads/sportytadka-work-loops";
const outDir = path.resolve("src/components/site/work-loops");
fs.mkdirSync(outDir, { recursive: true });

const map = {
  "full-time-felling-loop.html": { num: "02", name: "FullTimeFeelingsLoop", ns: "ftf" },
  "the-comback-loop.html": { num: "03", name: "TheComebackLoop", ns: "tcb" },
  "protein-oclock-loop.html": { num: "04", name: "ProteinOclockLoop", ns: "poc" },
  "league-night-loop.html": { num: "05", name: "LeagueNightLoop", ns: "lgn" },
  "fan-cam-loop.html": { num: "06", name: "FanCamLoop", ns: "fcm" },
};

function extractStyle(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (!m) throw new Error("No style block");
  let css = m[1];
  css = css.replace(/\/\* ---- preview page only[\s\S]*$/i, "");
  css = css.replace(/html\s*,\s*body\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/body\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/body\.[a-zA-Z0-9_-]+\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/\.wrap\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/\.ctrl[\s\S]*?(?=\n\/\*|\n@media|\n\.|\n@$|$)/g, "");
  return css.trim() + "\n";
}

function namespaceCss(css, ns) {
  let out = css;
  out = out.replace(/\.stl\b/g, `.${ns}`);
  out = out.replace(/(?<![A-Za-z0-9_-])stl-/g, `${ns}-`);
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
  jsx = jsx.replace(/\bclass="stl"/g, `className="${ns}"`);
  jsx = jsx.replace(/\bclass="stl /g, `className="${ns} `);
  jsx = jsx.replace(/\bclass="/g, 'className="');

  jsx = jsx.replace(/\bfill-opacity="/g, 'fillOpacity="');
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

  // CSS variables in style attributes must keep leading --
  jsx = jsx.replace(/\sstyle="([^"]*)"/g, (_, raw) => {
    const entries = raw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const i = pair.indexOf(":");
        if (i < 0) return null;
        let key = pair.slice(0, i).trim();
        let val = pair.slice(i + 1).trim();
        if (key.startsWith("--")) {
          return `"${key}": "${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        }
        key = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (/^\d+(\.\d+)?(px|%|em|rem|cqw|cqh|s|ms)?$/.test(val) && !val.includes(" ")) {
          // keep unit values as strings
          return `${key}: "${val}"`;
        }
        return `${key}: "${val.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
      })
      .filter(Boolean);
    return ` style={{ ${entries.join(", ")} }}`;
  });

  jsx = jsx.replace(/\saria-hidden(?=[\s>])/g, " aria-hidden={true}");
  jsx = jsx.replace(/<br\s*>/gi, "<br />");
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/*${c.replace(/\*\//g, "* /")}*/}`);

  // Ensure void SVG tags are self-closing already; convert empty HTML pairs that should be fine

  return jsx;
}

const indexExports = [];

for (const [file, meta] of Object.entries(map)) {
  const html = fs.readFileSync(path.join(dir, file), "utf8");
  const css = namespaceCss(extractStyle(html), meta.ns);
  const componentHtml = extractComponent(html);
  const jsxBody = htmlToJsx(componentHtml, meta.ns);

  fs.writeFileSync(path.join(outDir, `${meta.ns}.css`), css);

  const tsx = `import "./${meta.ns}.css";\n\nexport function ${meta.name}() {\n  return (\n    ${jsxBody
    .split("\n")
    .map((line, i) => (i === 0 ? line : `    ${line}`))
    .join("\n")}\n  );\n}\n`;

  fs.writeFileSync(path.join(outDir, `${meta.name}.tsx`), tsx);
  indexExports.push(meta);
  console.log("wrote", meta.name, "ns", meta.ns);
}

fs.writeFileSync(
  path.join(outDir, "index.ts"),
  `${indexExports.map((e) => `export { ${e.name} } from "./${e.name}";`).join("\n")}\n`,
);
