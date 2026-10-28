import type { CSSProperties } from "react";
import "./poc.css";

export function ProteinOclockLoop() {
  return (
    <div className="poc t04" aria-hidden="true">
      <div className="glow"></div>
      <i className="px" style={{ left: "20%", top: "84%", animationDelay: "-.3s" }}></i>
      <i className="px a" style={{ left: "30%", top: "90%", animationDelay: "-1.5s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px" style={{ left: "76%", top: "86%", animationDelay: "-.9s" }}></i>
      <i className="px b" style={{ left: "82%", top: "74%", animationDelay: "-2s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px p" style={{ left: "68%", top: "94%", animationDelay: "-1.1s" }}></i>
      <i className="px" style={{ left: "16%", top: "66%", animationDelay: "-1.8s", width: ".7cqw", height: ".7cqw" }}></i>
      <div className="beam"></div><div className="emit"></div>
      <div className="hin">
        <svg viewBox="0 0 200 200">{/* magnifier + rising bars */}
          <circle className="st fl" cx="88" cy="88" r="58"/>
          <circle className="st faint" cx="88" cy="88" r="48" strokeDasharray="3 6"/>
          <rect className="st ff hb" x="56" y="84" width="12" height="36" rx="2"/>
          <rect className="st ff hb" style={{ animationDelay: "-.2s" }} x="74" y="72" width="12" height="48" rx="2"/>
          <rect className="st ff hb" style={{ animationDelay: "-.4s" }} x="92" y="62" width="12" height="58" rx="2"/>
          <rect className="st ff hb" style={{ animationDelay: "-.6s" }} x="110" y="50" width="12" height="70" rx="2"/>
          <path className="st" d="M54 74L76 60 96 66 122 38M110 38H122V50"/>
          <path className="st ff" d="M128 140L140 128 180 168Q182 176 176 178L168 180Z"/>
        </svg>
      </div>
      <div className="stage"><div className="tilt">
        <div className="hud"><i className="br tl"></i><i className="br tr"></i><i className="br bl"></i><i className="br bri"></i>
          <span className="tagtop mono">Stats to search · SEO</span></div>
        <div className="card">
          <div className="row"><span className="mono meta">Search · Sports</span><span className="pill mono">SEO</span></div>
          <div className="sbar"><svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6"/><path d="M15 15l5 5"/></svg>
            <span className="typed mono">match preview tonight</span><i className="caret"></i></div>
          <div className="res">
            <div className="ranks mono"><b>1</b><b>2</b><b>3</b><b>4</b></div>
            <div className="r o1"><div className="tx"><span className="sk" style={{ width: "80%" }}></span><span className="sk sm" style={{ width: "50%" }}></span></div></div>
            <div className="r o2"><div className="tx"><span className="sk" style={{ width: "66%" }}></span><span className="sk sm" style={{ width: "44%" }}></span></div></div>
            <div className="r o3"><div className="tx"><span className="sk" style={{ width: "74%" }}></span><span className="sk sm" style={{ width: "38%" }}></span></div></div>
            <div className="r me"><div className="tx"><span className="sk" style={{ width: "84%" }}></span><span className="sk sm" style={{ width: "52%" }}></span></div><span className="crown mono">#1</span></div>
          </div>
          <div className="gain">
            <div><div className="mono meta">Organic traffic</div><div className="disp up">+340%</div></div>
            <svg viewBox="0 0 100 40" className="spark"><polyline points="2,36 18,32 32,34 46,24 60,26 74,14 88,12 98,3"/></svg>
          </div>
          <div className="scan"></div>
        </div>
      </div></div>
    </div>
  );
}
