import fs from "node:fs";
import path from "node:path";

const dir = "c:/Users/User/Downloads/sportytadka-what-we-do";
const outDir = path.resolve("src/components/site/what-we-do");
fs.mkdirSync(outDir, { recursive: true });

const map = {
  "reactive-contant.html": { name: "ReactiveContentGraphic", ns: "wwd1", slide: "w01" },
  "brand-athletes-films.html": { name: "BrandAthletesFilmsGraphic", ns: "wwd2", slide: "w02" },
  "sports-fitness.html": { name: "SportsBrandingGraphic", ns: "wwd3", slide: "w03" },
  "social-community.html": { name: "SocialCommunityGraphic", ns: "wwd4", slide: "w04" },
  "brand-game.html": { name: "BrandedGamesGraphic", ns: "wwd5", slide: "w05" },
  "event-activaction.html": { name: "EventsActivationsGraphic", ns: "wwd6", slide: "w06" },
};

function extractStyle(html) {
  const m = html.match(/<style>([\s\S]*?)<\/style>/i);
  if (!m) throw new Error("No style");
  let css = m[1];
  css = css.replace(/html\s*,\s*body\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/body\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/body\.[a-zA-Z0-9_-]+\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/\.wrap\s*\{[\s\S]*?\}\s*/g, "");
  css = css.replace(/\.ctrl[\s\S]*?(?=\n\/\*|\n@media|\n\.|\n@$|$)/g, "");
  return css.trim() + "\n";
}

function namespaceCss(css, ns, slide) {
  let out = css;
  // Scope shared .wwd to unique root; keep slide class (.w01) as-is
  out = out.replace(/\.wwd\b/g, `.${ns}`);
  // Shared keyframes w-v1 etc. — prefix to avoid collisions across files
  out = out.replace(/@keyframes\s+w-/g, `@keyframes ${ns}-`);
  out = out.replace(/animation-name:\s*w-/g, `animation-name: ${ns}-`);
  out = out.replace(/(?<![A-Za-z0-9_-])w-(?=v\d|blink|breathe|spin\b)/g, `${ns}-`);
  // Ensure root fills parent
  out = out.replace(
    new RegExp(`\\.${ns}\\{([^}]*)width:100%;`),
    (full, body) =>
      body.includes("height:100%")
        ? full
        : `.${ns}{${body}width:100%;height:100%;`,
  );
  return out;
}

function extractComponent(html) {
  const start = html.indexOf("COMPONENT START");
  const end = html.indexOf("COMPONENT END");
  if (start < 0 || end < 0) throw new Error("Missing markers");
  const slice = html.slice(start, end);
  const divStart = slice.indexOf("<div");
  const lastClose = slice.lastIndexOf("</div>");
  return slice.slice(divStart, lastClose + "</div>".length);
}

function htmlToJsx(html, ns) {
  let jsx = html;
  jsx = jsx.replace(/\bclass="wwd /g, `className="${ns} `);
  jsx = jsx.replace(/\bclass="wwd"/g, `className="${ns}"`);
  jsx = jsx.replace(/\bclass="/g, 'className="');

  jsx = jsx.replace(/\bfill-opacity="/g, 'fillOpacity="');
  jsx = jsx.replace(/\bstroke-opacity="/g, 'strokeOpacity="');
  jsx = jsx.replace(/\bstroke-width="/g, 'strokeWidth="');
  jsx = jsx.replace(/\bstroke-dasharray="/g, 'strokeDasharray="');
  jsx = jsx.replace(/\bstroke-linecap="/g, 'strokeLinecap="');
  jsx = jsx.replace(/\bstroke-linejoin="/g, 'strokeLinejoin="');
  jsx = jsx.replace(/\bstop-color="/g, 'stopColor="');
  jsx = jsx.replace(/\bstop-opacity="/g, 'stopOpacity="');
  jsx = jsx.replace(/\btext-anchor="/g, 'textAnchor="');
  jsx = jsx.replace(/\bfont-size="/g, 'fontSize="');
  jsx = jsx.replace(/\bclip-path="/g, 'clipPath="');
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
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/*${c.replace(/\*\//g, "* /")}*/}`);
  jsx = jsx.replace(/'/g, "&apos;");

  return jsx;
}

const exportsList = [];

for (const [file, meta] of Object.entries(map)) {
  const html = fs.readFileSync(path.join(dir, file), "utf8");
  const css = namespaceCss(extractStyle(html), meta.ns, meta.slide);
  const jsxBody = htmlToJsx(extractComponent(html), meta.ns);

  fs.writeFileSync(path.join(outDir, `${meta.ns}.css`), css);

  const needsCssProps = jsxBody.includes("as CSSProperties");
  const tsx = `${needsCssProps ? 'import type { CSSProperties } from "react";\n' : ""}import "./${meta.ns}.css";\n\nexport function ${meta.name}() {\n  return (\n    ${jsxBody
    .split("\n")
    .map((line, i) => (i === 0 ? line : `    ${line}`))
    .join("\n")}\n  );\n}\n`;

  fs.writeFileSync(path.join(outDir, `${meta.name}.tsx`), tsx);
  exportsList.push(meta);
  console.log("wrote", meta.name, meta.ns);
}

fs.writeFileSync(
  path.join(outDir, "index.ts"),
  `${exportsList.map((e) => `export { ${e.name} } from "./${e.name}";`).join("\n")}\n`,
);
