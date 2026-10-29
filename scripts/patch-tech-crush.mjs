import fs from "node:fs";

const p = "public/tech-crush/index.html";
let html = fs.readFileSync(p, "utf8");

const start = html.indexOf("var logoSource = ");
const after = html.indexOf("logoImage.src = logoSource;");
if (start < 0 || after < 0) throw new Error("logo markers missing");
const afterEnd = after + "logoImage.src = logoSource;".length;

html =
  html.slice(0, start) +
  `var logoImage = new Image();
logoImage.src = "/tech-crush/characters.png?v=1";
` +
  html.slice(afterEnd);

html = html.replace(
  'Crush <span class="boldOrange">Sakri.net</span> icons <span class="boldOrange"> 3 times in 20 moves</span> for hostile takeover.',
  'Crush <span class="boldOrange">Ronaldo</span> icons <span class="boldOrange"> 3 times in 20 moves</span> for a sports takeover.',
);

html = html.replace(
  `<p>Acquire wealth FAST,</p>
    <p>hostile takeover tech companies by crushing them!</p>`,
  `<p>Build your roster FAST,</p>
    <p>take over sports legends by crushing them!</p>`,
);

html = html.replace(
  'var brands = ["Sakri.net", "DevState", "CodePen", "GitHub", "StackOverflow", "Reddit", "LinkedIn", "Twitter", "Facebook", "Google"];',
  'var brands = ["Ronaldo", "Messi", "Kohli", "Rohit", "Dhoni", "Perry", "Sindhu", "Chhetri", "Chopra"];',
);

html = html.replace("var totalLevels = 10;", "var totalLevels = brands.length;");
html = html.replace("if(level>=10){", "if(level>=brands.length){");
html = html.replace(
  "model = new Sakri.TechCrushModel(rows, cols, 10);",
  "model = new Sakri.TechCrushModel(rows, cols, brands.length);",
);
html = html.replace(
  'times in "+numMoves+" moves</span> for hostile takeover!',
  'times in "+numMoves+" moves</span> for a sports takeover!',
);

html = html.replace(
  "model.createGrid(level<4 ? level : 4);",
  "model.createGrid(Math.min(level < 4 ? level : 4, Math.max(0, brands.length - variants)));",
);

fs.writeFileSync(p, html);
console.log("patched", fs.statSync(p).size);
console.log({
  sprite: html.includes("characters.png"),
  sakri: html.includes("Sakri.net"),
  ronaldo: html.includes("Ronaldo"),
  levels: html.includes("totalLevels = brands.length"),
});
