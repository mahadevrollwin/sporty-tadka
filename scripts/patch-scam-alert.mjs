import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Turns the prebuilt "find the safe link" bundle into the cricket trivia round driven by
// public/scam-alert/questions.js. Always patches the untouched original bundle, so it can be re-run.
const dir = "public/scam-alert";
const assets = path.join(dir, "assets");
const SRC_MAIN = "index-714395d5.js";
const SRC_HOWLER = "howler-5f3e5a7a.js";
const CARDS_PER_ROUND = 9;

let js = fs.readFileSync(path.join(assets, SRC_MAIN), "utf8");
let howler = fs.readFileSync(path.join(assets, SRC_HOWLER), "utf8");

function replaceOnce(source, from, to, label) {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected 1 match, found ${count}`);
  return source.replace(from, () => to);
}

function replaceBetween(source, start, end, to, label) {
  const a = source.indexOf(start);
  const b = a < 0 ? -1 : source.indexOf(end, a);
  if (a < 0 || b < 0 || source.indexOf(start, a + 1) >= 0) throw new Error(`${label}: markers missing`);
  return source.slice(0, a) + to + source.slice(b + end.length);
}

js = replaceOnce(
  js,
  "function xT(){",
  `let stLast=-1;function stShuffle(a){const r=a.slice();for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r}` +
    `function stPick(){const T=window.SCAM_TRIVIA||{},pl=T.players||[],qs=(T.questions||[]).filter(q=>pl.some(p=>p.id===q.answer));` +
    `if(!qs.length)return{question:"No questions configured",cards:[]};let i=Math.floor(Math.random()*qs.length);` +
    `qs.length>1&&i===stLast&&(i=(stLast+1+Math.floor(Math.random()*(qs.length-1)))%qs.length),stLast=i;const q=qs[i],ans=pl.find(p=>p.id===q.answer),` +
    `rest=stShuffle(pl.filter(p=>p.id!==q.answer)).slice(0,${CARDS_PER_ROUND - 1});` +
    `return{question:q.question,cards:stShuffle([ans,...rest]).map(p=>({...p,correct:p.id===q.answer}))}}function xT(){`,
  "trivia helpers",
);

js = replaceOnce(js, '[y,v]=P.useState("30");', '[y,v]=P.useState("30"),[stQ,stSetQ]=P.useState(null);', "question state");

js = replaceBetween(
  js,
  "Ls=()=>{const O=Math.floor(Math.random()*eh.length);",
  '||"Scam message"}})};',
  "Ls=()=>{const O=stPick();return stSetQ(O.question),O.cards};",
  "round builder",
);

js = replaceBetween(
  js,
  "vy=(O,Q)=>{if(O.preventDefault(),d.includes(Q)){",
  "else cn(),fn(),ee(),o(Q),r(!0)},",
  'vy=O=>{if(!s||w||n)return;if(O.correct){cn(),dt(),Et(),kr();const St=dT(I.current);me(St),_&&pT({..._,score:St}).then(Dn=>L(Dn)).catch(()=>F.error("Failed to save score. Check server connection.")),E(!0)}else cn(),fn(),ee(),o(O.name),r(!0)},',
  "pick handler",
);

const cardFront =
  'g.createElement(fe.button,{type:"button",onClick:()=>vy(O),disabled:!s,"aria-label":O.name,className:"absolute w-full h-full rounded-xl shadow-xl overflow-hidden card-front backface-hidden",initial:{rotateY:-180},animate:{rotateY:s?0:-180,opacity:s?1:0},transition:{duration:.6,delay:Q*.1},style:{transformStyle:"preserve-3d"}},' +
  'g.createElement("img",{src:O.image,alt:"",draggable:!1,className:"player-photo-bg"}),' +
  'g.createElement("img",{src:O.image,alt:"",draggable:!1,className:"player-photo"}),g.createElement("span",{className:"player-name"},O.name))';
js = replaceBetween(
  js,
  'g.createElement(fe.div,{className:"absolute w-full h-full rounded-xl shadow-xl overflow-hidden card-front backface-hidden"',
  "wy(O.text))))",
  cardFront,
  "player card",
);
js = replaceOnce(js, "game-card perspective ${O.customClass}`", "game-card perspective player-card`", "card class");
js = replaceOnce(
  js,
  'src:"/images/airtel-logo.png",alt:"Placeholder"',
  'src:"/scam-alert/images/card-back.svg",alt:""',
  "card back",
);

js = replaceOnce(
  js,
  's?"Click any link to verify if it is a fraud link":',
  's?stQ||"Pick the right player":',
  "question header",
);

js = replaceBetween(
  js,
  "g.createElement(Fn,null,n&&",
  'spam.grievance@airtel.com")))))',
  'g.createElement(Fn,null,n&&g.createElement(fe.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 bg-black/80 flex items-center justify-center p-4 trivia-wrong"},' +
    'g.createElement(fe.div,{initial:{scale:.8,opacity:0},animate:{scale:1,opacity:1},exit:{scale:.8,opacity:0},transition:{duration:.2},className:"bg-white p-6 rounded-lg w-96 text-center text-black shadow-lg"},' +
    'g.createElement("img",{src:"/images/blocked-icon.png",alt:"",className:"trivia-wrong-icon"}),' +
    'g.createElement("h2",{className:"text-2xl font-bold mb-2 text-red-600"},"Wrong pick!"),' +
    'g.createElement("p",{className:"mb-1"},`That\'s ${i}.`),' +
    'g.createElement("p",{className:"text-sm text-gray-600 mb-5"},"The clock is still running. Try again!"),' +
    'g.createElement("button",{onClick:xc,className:"bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"},"Try Again"))))',
  "wrong pick popup",
);

const copy = [
  [
    "Cards flip to reveal messages. You have 30 seconds to find the one safe link.",
    "Cards flip to reveal cricketers. You have 30 seconds to answer the question.",
  ],
  [
    '{icon:Jv,title:"Spot the Safe Link",text:"Only ONE message has a legitimate link. Tap it to score points."}',
    '{icon:Jv,title:"Pick the Right Player",text:"Read the question and tap the ONE player who matches it to score points."}',
  ],
  [
    `{icon:t1,title:"Avoid Scam Links",text:"Clicking a fraud link triggers Airtel's block screen. Stay alert!"}`,
    '{icon:t1,title:"Avoid Wrong Picks",text:"A wrong pick wastes time while the clock keeps running. Every round asks a new random question!"}',
  ],
  ["The faster you find the safe link, the higher you score!", "The faster you pick the right player, the higher you score!"],
  ["That's the correct link. Great job!", "That's the right player. Great job!"],
  ['"Please wait loading messages..."', '"Get ready, loading players..."'],
];
for (const [from, to] of copy) js = replaceOnce(js, from, to, `copy: ${from.slice(0, 30)}`);

const hash = crypto.createHash("sha256").update(js).update(howler).digest("hex").slice(0, 8);
const mainName = `index-${hash}.js`;
const howlerName = `howler-${hash}.js`;
js = replaceOnce(js, `import("./${SRC_HOWLER}")`, `import("./${howlerName}")`, "howler import");
howler = replaceOnce(howler, `from"./${SRC_MAIN}"`, `from"./${mainName}"`, "main import");

for (const file of fs.readdirSync(assets)) {
  if (/^(index|howler)-[0-9a-f]{8}\.js$/.test(file) && ![SRC_MAIN, SRC_HOWLER].includes(file)) {
    fs.unlinkSync(path.join(assets, file));
  }
}
fs.writeFileSync(path.join(assets, mainName), js);
fs.writeFileSync(path.join(assets, howlerName), howler);

const htmlPath = path.join(dir, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");
html = html.replace(/\/scam-alert\/assets\/index-[0-9a-f]{8}\.js/, `/scam-alert/assets/${mainName}`);
if (!html.includes("/scam-alert/questions.js")) {
  html = html.replace(
    '    <script type="module"',
    '    <script src="/scam-alert/questions.js"></script>\n    <script type="module"',
  );
}
fs.writeFileSync(htmlPath, html);

console.log({ main: mainName, howler: howlerName, size: js.length });
