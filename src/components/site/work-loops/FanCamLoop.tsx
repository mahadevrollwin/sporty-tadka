import type { CSSProperties } from "react";
import "./fcm.css";

export function FanCamLoop() {
  return (
    <div className="fcm t06" aria-hidden="true">
      <div className="glow"></div>
      <i className="px" style={{ left: "20%", top: "84%", animationDelay: "-.3s" }}></i>
      <i className="px a" style={{ left: "30%", top: "90%", animationDelay: "-1.5s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px" style={{ left: "76%", top: "86%", animationDelay: "-.9s" }}></i>
      <i className="px b" style={{ left: "82%", top: "74%", animationDelay: "-2s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px p" style={{ left: "68%", top: "94%", animationDelay: "-1.1s" }}></i>
      <i className="px" style={{ left: "16%", top: "66%", animationDelay: "-1.8s", width: ".7cqw", height: ".7cqw" }}></i>
      <div className="beam"></div><div className="emit"></div>
      <div className="hin">
        <svg viewBox="-100 -100 200 200">{/* stadium */}
          <path className="cone" d="M-84-70L-60 8-30 8Z"/><path className="cone" style={{ animationDelay: "-.3s" }} d="M84-70L60 8 30 8Z"/>
          <path className="cone" style={{ animationDelay: "-.6s" }} d="M-44-82L-34 4 0 4Z"/><path className="cone" style={{ animationDelay: "-.9s" }} d="M44-82L34 4 0 4Z"/>
          <ellipse className="st fl" cy="-2" rx="88" ry="34"/>
          <ellipse className="st faint" cy="0" rx="72" ry="27"/>
          <ellipse className="st" cy="26" rx="80" ry="30"/>
          <path className="st" d="M-88-2L-80 26M88-2L80 26M0 32V56"/>
          <ellipse className="st" cy="2" rx="56" ry="19"/>
          <path className="st ff" style={{ fillOpacity: ".25" }} d="M-38-8H38L44 12H-44Z"/>
          <path className="st" d="M0-8V12"/><ellipse className="st" cy="2" rx="8" ry="3"/>
          <path className="st" d="M-78-14L-84-70M78-14L84-70M-40-30L-44-82M40-30L44-82"/>
          <path className="st ff" d="M-91-76H-77V-68H-91ZM77-76H91V-68H77ZM-51-88H-37V-80H-51ZM37-88H51V-80H37Z"/>
        </svg>
      </div>
      <div className="stage"><div className="tilt">
        <div className="hud"><i className="br tl"></i><i className="br tr"></i><i className="br bl"></i><i className="br bri"></i>
          <span className="tagtop mono">Home ground · Live site</span></div>
        <div className="card">
          <div className="chrome"><i></i><i></i><i></i><span className="url mono">yourclub.com</span></div>
          <div className="pg">
            <div className="bk" style={{ "--d": "0", height: "4cqw" } as CSSProperties}><div className="f nav"><i className="lg"></i><span className="sk" style={{ width: "5cqw" }}></span><span className="sk" style={{ width: "5cqw" }}></span><span className="sk" style={{ width: "5cqw" }}></span></div></div>
            <div className="bk" style={{ "--d": "1", height: "4cqw" } as CSSProperties}><div className="f tick"><span className="lv mono">Live</span><div className="mqw"><span className="mq mono">IND 184/4 (17.2) &nbsp;·&nbsp; BRA 2–1 ARG 78&apos; &nbsp;·&nbsp; P1 +3.214s &nbsp;·&nbsp; KO R3 2:41 &nbsp;·&nbsp; IND 184/4 (17.2) &nbsp;·&nbsp; BRA 2–1 ARG 78&apos; &nbsp;·&nbsp; P1 +3.214s &nbsp;·&nbsp; KO R3 2:41 &nbsp;·&nbsp; </span></div></div></div>
            <div className="bk" style={{ "--d": "2", flex: "1" } as CSSProperties}><div className="f hero"><div className="mono meta" style={{ color: "var(--cyan)" }}>Matchday 12</div><div className="disp ht">Match<br />centre</div><span className="sk" style={{ width: "60%", marginTop: "1.2cqw" }}></span></div></div>
            <div className="cards">
              <div className="bk" style={{ "--d": "3" } as CSSProperties}><div className="f cd"><span className="mono meta">FT</span><b className="disp">2–1</b><span className="sk"></span></div></div>
              <div className="bk" style={{ "--d": "4" } as CSSProperties}><div className="f cd"><span className="mono meta" style={{ color: "var(--red)" }}>Live</span><b className="disp">184/4</b><span className="sk"></span></div></div>
              <div className="bk" style={{ "--d": "5" } as CSSProperties}><div className="f cd"><span className="mono meta">Sat</span><b className="disp">9 PM</b><span className="sk"></span></div></div>
            </div>
          </div>
          <div className="scan"></div>
        </div>
      </div></div>
    </div>
  );
}
