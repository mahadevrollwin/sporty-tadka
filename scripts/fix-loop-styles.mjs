import fs from "node:fs";
import path from "node:path";

const dir = path.resolve("src/components/site/work-loops");

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
  const filePath = path.join(dir, file);
  let src = fs.readFileSync(filePath, "utf8");

  if (!src.includes("CSSProperties")) {
    src = src.replace(
      /^import "\.\/[^"]+\.css";\n/,
      (m) => `import type { CSSProperties } from "react";\n${m}`,
    );
  }

  // Cast any style object that sets a CSS custom property
  src = src.replace(/style=\{\{([\s\S]*?)\}\}/g, (full, body) => {
    if (!body.includes('"--') && !body.includes("'--")) return full;
    if (body.includes("as CSSProperties")) return full;
    return `style={{${body}} as CSSProperties}`;
  });

  fs.writeFileSync(filePath, src);
  console.log("fixed", file);
}
