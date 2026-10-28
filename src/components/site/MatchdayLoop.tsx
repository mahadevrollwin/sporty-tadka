import "./matchday-loop.css";

export function MatchdayLoop() {
  return (
    <div className="mdl" aria-hidden="true">
      <div className="glow" />
      <i className="px" style={{ left: "20%", top: "84%", animationDelay: "-.3s" }} />
      <i
        className="px p"
        style={{ left: "30%", top: "90%", animationDelay: "-1.5s", width: ".7cqw", height: ".7cqw" }}
      />
      <i className="px c" style={{ left: "76%", top: "86%", animationDelay: "-.9s" }} />
      <i
        className="px"
        style={{ left: "82%", top: "74%", animationDelay: "-2s", width: ".7cqw", height: ".7cqw" }}
      />
      <i className="px p" style={{ left: "68%", top: "94%", animationDelay: "-1.1s" }} />
      <i
        className="px c"
        style={{ left: "16%", top: "66%", animationDelay: "-1.8s", width: ".7cqw", height: ".7cqw" }}
      />

      <div className="holo h1">
        <div className="beam" />
        <div className="emit" />
        <div className="hin">
          <svg viewBox="-100 -100 200 200" aria-hidden="true">
            <circle className="fl" r="80" />
            <g className="faint">
              <ellipse className="st tb merid" rx="80" ry="80" />
              <ellipse className="st tb merid" rx="80" ry="80" style={{ animationDelay: "-.8s" }} />
              <ellipse className="st tb merid" rx="80" ry="80" style={{ animationDelay: "-1.6s" }} />
              <ellipse className="st" rx="80" ry="16" />
              <ellipse className="st" cy="-46" rx="65" ry="12" />
              <ellipse className="st" cy="46" rx="65" ry="12" />
            </g>
            <polygon
              className="st"
              points="0,-22 20.9,-6.8 12.9,17.8 -12.9,17.8 -20.9,-6.8"
              fill="currentColor"
              fillOpacity=".45"
            />
            <path
              className="st"
              d="M0-22V-48M20.9-6.8L45.7-14.8M12.9 17.8L28.2 38.8M-12.9 17.8L-28.2 38.8M-20.9-6.8L-45.7-14.8"
            />
            <path
              className="st"
              d="M-18-74L0-48 18-74M66-38L45.7-14.8 70 2M45 62L28.2 38.8 2 70M-45 62L-28.2 38.8 -2 70M-66-38L-45.7-14.8 -70 2"
            />
            <circle className="st" r="80" />
          </svg>
        </div>
      </div>

      <div className="holo h2">
        <div className="beam" />
        <div className="emit" />
        <div className="hin">
          <svg viewBox="-100 -100 200 200" aria-hidden="true">
            <circle className="fl" r="76" />
            <g className="faint">
              <ellipse className="st" rx="76" ry="20" />
              <ellipse className="st" cy="-44" rx="62" ry="13" />
              <ellipse className="st" cy="44" rx="62" ry="13" />
            </g>
            <g className="tb tumble">
              <ellipse className="st" rx="76" ry="24" />
              <ellipse className="st" rx="76" ry="36" />
              <ellipse
                rx="76"
                ry="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray="1.5 7"
              />
            </g>
            <circle className="st" r="76" />
          </svg>
        </div>
      </div>

      <div className="holo h3">
        <div className="beam" />
        <div className="emit" />
        <div className="hin">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <g className="faint">
              <path className="st speed" d="M8 92H32" />
              <path className="st speed" d="M2 112H30" style={{ animationDelay: "-.2s" }} />
              <path className="st speed" d="M12 132H34" style={{ animationDelay: "-.4s" }} />
            </g>
            <g className="tb sway">
              <path
                className="st fl"
                d="M38 128C34 76 72 38 124 38C160 38 182 64 184 98L184 132C184 142 176 148 166 148L58 150C46 150 39 141 38 128Z"
              />
              <path
                className="st"
                d="M92 82C110 76 150 76 182 84L184 108C150 104 116 106 96 110Z"
                fill="currentColor"
                fillOpacity=".45"
              />
              <path className="st" d="M44 118C80 112 140 114 184 120M150 140H176M118 38L150 30 158 40" />
              <path className="st faint" d="M60 70C80 52 110 46 140 48" />
            </g>
          </svg>
        </div>
      </div>

      <div className="holo h4">
        <div className="beam" />
        <div className="emit" />
        <div className="hin">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <g className="tb jab">
              <path
                className="st fl"
                d="M72 158L70 84C68 46 98 30 130 36C164 42 176 74 166 104C160 122 148 132 136 136L136 158Z"
              />
              <path className="st" d="M70 100C46 98 40 126 58 134C64 137 70 134 72 128" />
              <path className="st faint" d="M92 76C110 68 140 68 160 80M88 98C108 92 136 92 158 100" />
              <path className="st" d="M66 158H140V186H66Z" fill="currentColor" fillOpacity=".4" />
              <path className="st" d="M66 170H140" />
            </g>
            <g className="faint">
              <path className="st" d="M176 52L190 44M180 76L196 76M176 100L190 108" />
            </g>
          </svg>
        </div>
      </div>

      <div className="stage">
        <div className="tilt">
          <div className="hud">
            <i className="br tl" />
            <i className="br tr" />
            <i className="br bl" />
            <i className="br bri" />
            <span className="tagtop mono">Matchday kit · Any sport</span>
            <div className="pips">
              <span className="pip">
                <i />
              </span>
              <span className="pip">
                <i />
              </span>
              <span className="pip">
                <i />
              </span>
              <span className="pip">
                <i />
              </span>
            </div>
          </div>

          <div className="flip">
            <div className="face f1">
              <div className="row">
                <span className="mono meta">Football · MD 12</span>
                <span className="mono meta">01/04</span>
              </div>
              <div style={{ marginTop: "2cqw" }}>
                <span className="pill mono">Fixture</span>
              </div>
              <div className="bot">
                <div className="disp team">BRA</div>
                <div className="vsx">vs</div>
                <div className="disp team b">ARG</div>
                <div className="when mono meta">
                  <b>Sat · 9:00 PM GST</b>
                  <br />
                  Kick-off · Live coverage
                </div>
              </div>
            </div>

            <div className="face f2">
              <div className="row">
                <span className="pill mono live">● Live</span>
                <span className="mono meta">02/04</span>
              </div>
              <div className="bot">
                <div className="mono sc-t">Cricket · IND · 2nd inn</div>
                <div className="disp score">
                  184<small>/4</small>
                </div>
                <div className="mono ov">17.2 ov · CRR 10.6</div>
                <div className="bar">
                  <i />
                </div>
                <div className="balls">
                  <b>1</b>
                  <b className="b4">4</b>
                  <b className="b6">6</b>
                  <b className="bw">W</b>
                  <b>2</b>
                  <b className="b6">6</b>
                </div>
                <div className="mono need">Need 13 off 16</div>
              </div>
            </div>

            <div className="face f3">
              <div className="row">
                <span className="mono meta">Racing · Rd 18</span>
                <span className="mono meta">03/04</span>
              </div>
              <div style={{ marginTop: "2cqw" }}>
                <span className="pill mono">Race result</span>
              </div>
              <div className="bot">
                <div className="disp flag">
                  Chequered
                  <br />
                  <span>flag.</span>
                </div>
                <div className="chk" />
                <div className="pod">
                  <div className="p1">
                    <b>P1</b>
                    <span style={{ width: "56%" }} />
                    Win
                  </div>
                  <div>
                    <b>P2</b>
                    <span style={{ width: "44%" }} />
                    +3.214
                  </div>
                  <div>
                    <b>P3</b>
                    <span style={{ width: "36%" }} />
                    +7.880
                  </div>
                </div>
                <div className="mono fast">Fastest lap · 1:32.4</div>
              </div>
            </div>

            <div className="face f4">
              <div className="rays" />
              <div className="row">
                <span className="mono meta">Fight night · Main event</span>
                <span className="mono meta">04/04</span>
              </div>
              <div style={{ marginTop: "2cqw", position: "relative" }}>
                <span className="pill mono">Result</span>
              </div>
              <div className="bot">
                <div className="disp ko">KO.</div>
                <div className="disp rd">Round 3 · 2:41</div>
                <div className="potm">
                  <i className="av" />
                  <div style={{ flex: 1 }}>
                    <span className="mono meta">Fighter of the night</span>
                    <span className="ln" />
                  </div>
                </div>
              </div>
            </div>

            <div className="scanclip">
              <div className="scan" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
