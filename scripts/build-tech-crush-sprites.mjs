import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const assets =
  "C:/Users/User/.cursor/projects/c-Users-User-Downloads-sporty-tadka-main/assets";
const outDir = path.resolve("public/tech-crush");
fs.mkdirSync(outDir, { recursive: true });

const characters = [
  { file: "ronaldo-0f3c2643-8ef2-4fd2-8c91-d0113f2be592.jpg", name: "Ronaldo" },
  { file: "messi-da68fbbd-2ddb-4aa8-9f40-b97d69fdbbc9.jpg", name: "Messi" },
  { file: "Virat_kohli_1-a261349b-3576-4ceb-a09c-6bb5202c5582.jpg", name: "Kohli" },
  { file: "Rohit_sharma_1-067ab059-8245-402e-a04e-5f6a688f87c7.jpg", name: "Rohit" },
  { file: "MS_Dhoni_1-c778b035-26a8-4db2-9d7f-f322c17009af.jpg", name: "Dhoni" },
  { file: "ellyse_perry-e057c09c-99c1-4cac-b671-e486dcd8081e.jpg", name: "Perry" },
  { file: "pv_sindhu-ffe919d5-e150-4337-8d62-c313145ba13a.jpg", name: "Sindhu" },
  { file: "sunil_chhetri-43fa54e5-215e-46de-be8e-a9069acb3323.jpg", name: "Chhetri" },
  { file: "neeraj_chopra-c5af5628-30bf-43d8-b09e-b3ca44a1b710.jpg", name: "Chopra" },
];

const size = 70;
const tiles = [];

for (const [index, character] of characters.entries()) {
  const src = path.join(
    assets,
    `c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_9f71b1f901f73f257213fcd7f2c07d22_images_${character.file}`,
  );
  if (!fs.existsSync(src)) throw new Error(`Missing ${src}`);
  const buf = await sharp(src)
    .resize(size, size, { fit: "cover", position: "attention" })
    .png()
    .toBuffer();
  tiles.push({ input: buf, left: index * size, top: 0 });
  console.log("tile", index, character.name);
}

await sharp({
  create: {
    width: size * characters.length,
    height: size,
    channels: 4,
    background: { r: 8, g: 7, b: 14, alpha: 1 },
  },
})
  .composite(tiles)
  .png()
  .toFile(path.join(outDir, "characters.png"));

fs.writeFileSync(
  path.join(outDir, "characters.json"),
  JSON.stringify(
    characters.map((c) => c.name),
    null,
    2,
  ),
);

console.log("wrote characters.png", size * characters.length, "x", size);
