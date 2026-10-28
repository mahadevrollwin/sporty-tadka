import "./ftf.css";

export function FullTimeFeelingsLoop() {
  return (
    <div className="ftf t02" aria-hidden="true">
      <div className="glow"></div>
      <i className="px" style={{ left: "20%", top: "84%", animationDelay: "-.3s" }}></i>
      <i className="px a" style={{ left: "30%", top: "90%", animationDelay: "-1.5s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px" style={{ left: "76%", top: "86%", animationDelay: "-.9s" }}></i>
      <i className="px b" style={{ left: "82%", top: "74%", animationDelay: "-2s", width: ".7cqw", height: ".7cqw" }}></i>
      <i className="px p" style={{ left: "68%", top: "94%", animationDelay: "-1.1s" }}></i>
      <i className="px" style={{ left: "16%", top: "66%", animationDelay: "-1.8s", width: ".7cqw", height: ".7cqw" }}></i>
      <div className="beam"></div><div className="emit"></div>
      <div className="hin">
        <svg viewBox="-100 -100 200 200">{/* replay ring + play */}
          <circle className="fl" r="66"/>
          <g className="vc spin"><path className="st" d="M0-80A80 80 0 1 1-69.3-40"/><path className="st ff" d="M-65.3-46.9L-65.4-30.8-79.2-38.8Z"/></g>
          <circle className="st faint vc spinr" r="58" strokeDasharray="4 8"/>
          <polygon className="st ff" points="-18,-28 32,0 -18,28"/>
          <g transform="translate(62 40)"><path className="hrt ff st" d="M0 6C-10-2-8-12 0-7 8-12 10-2 0 6Z"/></g>
          <g transform="translate(-72 26)"><path className="hrt ff st" style={{ animationDelay: "-.4s" }} d="M0 6C-10-2-8-12 0-7 8-12 10-2 0 6Z"/></g>
          <g transform="translate(78 -14)"><path className="hrt ff st" style={{ animationDelay: "-.8s" }} d="M0 6C-10-2-8-12 0-7 8-12 10-2 0 6Z"/></g>
        </svg>
      </div>
      <div className="stage"><div className="tilt">
        <div className="hud"><i className="br tl"></i><i className="br tr"></i><i className="br bl"></i><i className="br bri"></i>
          <span className="tagtop mono">Reel room · Auto-play</span></div>
        <div className="card">
          <div className="notch"></div>
          <div className="feed">
            <div className="strip">
              <div className="clip" style={{ "--k": "var(--pink)" }}><div className="disp big">Goal!</div><div className="mono cap">#football · 0:14</div></div>
              <div className="clip" style={{ "--k": "var(--lime)" }}><div className="disp big">Six!</div><div className="mono cap">#cricket · 0:09</div></div>
              <div className="clip" style={{ "--k": "var(--cyan)" }}><div className="disp big">Lights<br />out.</div><div className="mono cap">#racing · 0:21</div></div>
              <div className="clip" style={{ "--k": "var(--yel)" }}><div className="disp big">KO!</div><div className="mono cap">#fightnight · 0:07</div></div>
              <div className="clip" style={{ "--k": "var(--pink)" }}><div className="disp big">Goal!</div><div className="mono cap">#football · 0:14</div></div>
            </div>
            <div className="ovl">
              <div className="row"><span className="disp" style={{ fontSize: "3.2cqw" }}>Reels</span><span className="mono meta" style={{ fontSize: "1.3cqw" }}>For you</span></div>
              <div className="acts">
                <div className="act"><svg className="heart" viewBox="-12 -12 24 22"><path d="M0 8C-13-2-10-14 0-7 10-14 13-2 0 8Z"/></svg>
                  <span className="cnt mono"><b className="s1">12.4K</b><b className="s2">48.9K</b><b className="s3">103K</b><b className="s4">1.2M</b></span></div>
                <div className="act"><svg viewBox="0 0 24 24" className="ico"><path d="M4 5h16v11H9l-5 4z"/></svg><span className="mono">2.1K</span></div>
                <div className="act"><svg viewBox="0 0 24 24" className="ico"><path d="M14 4l7 7-7 7v-4c-6 0-9 2-11 5 1-6 4-10 11-11z"/></svg><span className="mono">Share</span></div>
              </div>
              <div className="foot">
                <div className="who"><i></i><span className="sk" style={{ width: "12cqw", height: "1.2cqw" }}></span></div>
                <span className="sk" style={{ width: "22cqw", height: "1cqw", marginTop: ".8cqw", opacity: ".7" }}></span>
                <div className="prog"><i></i></div>
              </div>
            </div>
          </div>
          <div className="scan"></div>
        </div>
      </div></div>
    </div>
  );
}
