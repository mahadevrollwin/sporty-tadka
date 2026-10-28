import type { CSSProperties } from "react";
import "./lgn.css";

export function LeagueNightLoop() {
  return (
    <div className="lgn t05" aria-hidden="true">
      <div className="glow"></div>
      <i className="px" style={{ left: "20%", top: "84%", animationDelay: "-.3s" }}></i>
      <i className="px a" style={{ left: "30%", top: "90%", animationDelay: "-1.5s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px" style={{ left: "76%", top: "86%", animationDelay: "-.9s" }}></i>
      <i className="px b" style={{ left: "82%", top: "74%", animationDelay: "-2s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px p" style={{ left: "68%", top: "94%", animationDelay: "-1.1s" }}></i>
      <i className="px" style={{ left: "16%", top: "66%", animationDelay: "-1.8s", width: ".7cqw", height: ".7cqw" }}></i>
      <div className="beam"></div><div className="emit"></div>
      <div className="hin">
        <svg viewBox="-100 -100 200 200">{/* target + dart */}
          <circle className="st fl" r="72"/>
          <circle className="st" r="50"/>
          <circle className="st ff" r="26" style={{ fillOpacity: ".25" }}/>
          <circle className="st ff" r="8"/>
          <path className="st faint" d="M-92 0H-76M76 0H92M0-92V-76M0 76V92"/>
          <circle className="st pulse" r="26"/>
          <g className="dart"><path className="st" d="M0 0L48-48"/><path className="st ff" d="M0 0L10-4 4-10Z"/><path className="st" d="M40-56L54-70M56-40L70-54M48-48L62-62"/></g>
        </svg>
      </div>
      <div className="stage"><div className="tilt">
        <div className="hud"><i className="br tl"></i><i className="br tr"></i><i className="br bl"></i><i className="br bri"></i>
          <span className="tagtop mono">Landing zone · Convert</span></div>
        <div className="card">
          <div className="row nav"><span className="row" style={{ gap: "1cqw" }}><i className="logo"></i><span className="sk" style={{ width: "7cqw" }}></span></span>
            <span className="row" style={{ gap: "1cqw" }}><span className="sk" style={{ width: "4cqw" }}></span><span className="sk" style={{ width: "4cqw" }}></span><span className="sk" style={{ width: "4cqw" }}></span></span></div>
          <div className="mono eb">Season pass · Limited</div>
          <div className="disp hl">Join the<br /><span>squad.</span></div>
          <span className="sk" style={{ width: "86%", marginTop: "1.6cqw" }}></span>
          <span className="sk" style={{ width: "62%", marginTop: ".8cqw" }}></span>
          <div className="ctaw">
            <div className="cta mono">Sign up now</div>
            <i className="ring"></i>
            <i className="bp" style={{ "--a": "-20deg" } as CSSProperties}></i><i className="bp" style={{ "--a": "-60deg" } as CSSProperties}></i><i className="bp" style={{ "--a": "-110deg" } as CSSProperties}></i>
            <i className="bp" style={{ "--a": "-160deg" } as CSSProperties}></i><i className="bp" style={{ "--a": "20deg", background: "var(--lime)" } as CSSProperties}></i><i className="bp" style={{ "--a": "200deg", background: "var(--cyan)" } as CSSProperties}></i>
            <div className="disp plus">+1</div>
            <svg className="cur" viewBox="0 0 14 21"><path d="M1 1L1 17 5 13.5 8 20 10.5 19 7.5 12.5 13 12.5Z"/></svg>
          </div>
          <div className="stats">
            <div><div className="mono meta">Sign-ups</div><div className="num disp"><b className="s1">1,284</b><b className="s2">1,285</b><b className="s3">1,286</b><b className="s4">1,287</b></div></div>
            <div style={{ textAlign: "right" }}><div className="mono meta">Conversion</div><div className="disp conv">12.4%</div></div>
          </div>
          <div className="scan"></div>
        </div>
      </div></div>
    </div>
  );
}
