import "./tcb.css";

export function TheComebackLoop() {
  return (
    <div className="tcb t03" aria-hidden="true">
      <div className="glow"></div>
      <i className="px" style={{ left: "20%", top: "84%", animationDelay: "-.3s" }}></i>
      <i className="px a" style={{ left: "30%", top: "90%", animationDelay: "-1.5s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px" style={{ left: "76%", top: "86%", animationDelay: "-.9s" }}></i>
      <i className="px b" style={{ left: "82%", top: "74%", animationDelay: "-2s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px p" style={{ left: "68%", top: "94%", animationDelay: "-1.1s" }}></i>
      <i className="px" style={{ left: "16%", top: "66%", animationDelay: "-1.8s", width: ".7cqw", height: ".7cqw" }}></i>
      <div className="beam"></div><div className="emit"></div>
      <div className="hin">
        <svg viewBox="0 0 200 200">{/* broadcast tower */}
          <g className="wv"><path className="st" d="M121.2 14.8A30 30 0 0 1 121.2 57.2M78.8 14.8A30 30 0 0 0 78.8 57.2"/></g>
          <g className="wv" style={{ animationDelay: "-.4s" }}><path className="st" d="M121.2 14.8A30 30 0 0 1 121.2 57.2M78.8 14.8A30 30 0 0 0 78.8 57.2"/></g>
          <g className="wv" style={{ animationDelay: "-.8s" }}><path className="st" d="M121.2 14.8A30 30 0 0 1 121.2 57.2M78.8 14.8A30 30 0 0 0 78.8 57.2"/></g>
          <path className="st fl" d="M100 44L70 182H130Z"/>
          <path className="st" d="M100 44L70 182M100 44L130 182M78 146H122M84 116H116M89 90H111M78 146L116 116M122 146L84 116M84 116L111 90M116 116L89 90M93 68H107"/>
          <circle className="st ff" cx="100" cy="36" r="8"/>
          <ellipse className="st faint" cx="100" cy="184" rx="44" ry="6"/>
        </svg>
      </div>
      <div className="stage"><div className="tilt">
        <div className="hud"><i className="br tl"></i><i className="br tr"></i><i className="br bl"></i><i className="br bri"></i>
          <span className="tagtop mono">Channel takeover · 24/7</span></div>
        <div className="card">
          <div className="row"><div className="who"><i className="av"></i><div><span className="sk" style={{ width: "11cqw" }}></span><span className="mono meta">Fan channel</span></div></div>
            <span className="pill mono onair"><b>●</b> On air</span></div>
          <div className="mono lbl">Followers</div>
          <div className="disp big">248K</div>
          <div className="mono up">+12.4K this week</div>
          <div className="xp"><div className="row mono meta"><span>LVL 12</span><span className="lu">Level up!</span><span>LVL 13</span></div><div className="xpbar"><i></i></div></div>
          <div className="week">
            <div style={{ "--d": "0" }}>M<i><s></s></i></div><div style={{ "--d": "1" }}>T<i><s></s></i></div><div style={{ "--d": "2" }}>W<i><s></s></i></div>
            <div style={{ "--d": "3" }}>T<i><s></s></i></div><div style={{ "--d": "4" }}>F<i><s></s></i></div><div style={{ "--d": "5" }}>S<i><s></s></i></div><div style={{ "--d": "6" }}>S<i><s></s></i></div>
          </div>
          <div className="toasts">
            <div className="toast s1"><div className="tin"><i style={{ background: "var(--lime)" }}></i>+1.2K new followers</div></div>
            <div className="toast s2"><div className="tin"><i style={{ background: "var(--pink)" }}></i>Post live · 2.4K likes</div></div>
            <div className="toast s3"><div className="tin"><i style={{ background: "var(--cyan)" }}></i>Shared 940× in 1 hour</div></div>
            <div className="toast s4"><div className="tin"><i style={{ background: "var(--yel)" }}></i>318 new comments</div></div>
          </div>
          <div className="scan"></div>
        </div>
      </div></div>
    </div>
  );
}
