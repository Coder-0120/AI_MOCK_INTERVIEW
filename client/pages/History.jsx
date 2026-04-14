import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── SCORE RING ─── */
function ScoreRing({ score }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  let color, label;
  if (pct >= 75) { color = "#4ade80"; label = "High"; }
  else if (pct >= 45) { color = "#f5c842"; label = "Mid"; }
  else { color = "#ff6b6b"; label = "Low"; }
  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.1rem", color, lineHeight: 1 }}>{pct}</span>
        <span style={{ fontSize: ".6rem", color, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</span>
      </div>
    </div>
  );
}

/* ─── ROLE BADGE ─── */
const ROLE_META = {
  frontend: { icon: "🖥️", label: "Frontend" },
  backend:  { icon: "⚙️",  label: "Backend"  },
  mern:     { icon: "🚀", label: "MERN Stack" },
  dsa:      { icon: "🧩", label: "DSA"        },
  pm:       { icon: "📋", label: "Product"    },
  hr:       { icon: "🤝", label: "HR Round"   },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { icon: "🎤", label: role };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.22)", borderRadius: 100, padding: "4px 12px", fontSize: ".68rem", fontWeight: 700, color: "#00e5ff", letterSpacing: ".06em", textTransform: "uppercase" }}>
      <span style={{ fontSize: ".9rem" }}>{meta.icon}</span>{meta.label}
    </span>
  );
}

/* ─── EXPANDABLE ─── */
function Expander({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 7,
        background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)",
        borderRadius: 8, padding: "6px 12px", cursor: "pointer",
        color: "#8492aa", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".05em",
        transition: "color .18s, background .18s", width: "100%",
      }}
      onMouseEnter={e => { e.currentTarget.style.color="#e8edf5"; e.currentTarget.style.background="rgba(255,255,255,.07)"; }}
      onMouseLeave={e => { e.currentTarget.style.color="#8492aa"; e.currentTarget.style.background="rgba(255,255,255,.03)"; }}
      >
        <span style={{ fontSize: ".8rem", fontWeight: 700 }}>{open ? "−" : "+"}</span>
        {label}
      </button>
      {open && (
        <div style={{ marginTop: 8, borderLeft: "2px solid rgba(0,229,255,.15)", paddingLeft: 12, animation: "fadeIn .2s ease" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── HISTORY CARD (grid-friendly) ─── */
function HistoryCard({ item, index }) {
  const date = new Date(item.createdAt);
  const formatted = date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{
      background: "#0b1018",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 20,
      padding: "22px 22px 18px",
      display: "flex", flexDirection: "column",
      transition: "transform .25s cubic-bezier(.34,1.2,.64,1), border-color .22s, box-shadow .22s",
      animation: `cardIn .5s cubic-bezier(.4,0,.2,1) ${index * 0.06}s both`,
      cursor: "default", height: "100%",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.borderColor = "rgba(15, 187, 206, 0.74)";
      e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,.4), 0 0 24px rgba(0,229,255,.06)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
      e.currentTarget.style.boxShadow = "";
    }}
    >
      {/* Top: Badge + Ring */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <RoleBadge role={item.role} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#8492aa", fontSize: ".73rem", flexWrap: "wrap" }}>
            <CalIcon /><span>{formatted}</span>
            <span style={{ width: 2, height: 2, borderRadius: "50%", background: "#8492aa" }} />
            <span>{time}</span>
          </div>
          <div style={{ fontSize: ".72rem", color: "#6b7a90" }}>
            {item.questions?.length || 0} questions
            {item.faceOffSeconds ? ` · ${item.faceOffSeconds}s face-off` : ""}
          </div>
        </div>
        <ScoreRing score={item.score} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,.05)", margin: "4px 0 10px" }} />

      {/* Feedback preview */}
      {item.feedback && (
        <p style={{
          color: "#b0bcd0", fontSize: ".78rem", lineHeight: 1.65,
          borderLeft: "2px solid rgba(123,92,250,.4)", paddingLeft: 10,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          marginBottom: 8, flex: 1,
        }}>
          {item.feedback}
        </p>
      )}

      {/* Expanders */}
      <div style={{ marginTop: "auto" }}>
        <Expander label={`Q&A (${item.questions?.length || 0})`}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 6 }}>
            {item.questions?.map((q, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg,#00e5ff,#7b5cfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", fontWeight: 800, color: "#060910" }}>Q{i+1}</span>
                  <p style={{ color: "#e8edf5", fontSize: ".78rem", lineHeight: 1.6, margin: 0 }}>{q}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", fontWeight: 800, color: "#4ade80" }}>A</span>
                  <p style={{ color: "#8492aa", fontSize: ".78rem", lineHeight: 1.6, margin: 0 }}>{item.answers?.[i] || <em style={{ opacity:.5 }}>No answer</em>}</p>
                </div>
              </div>
            ))}
          </div>
        </Expander>

        {item.feedback && (
          <Expander label="Full Feedback">
            <p style={{ color: "#b0bcd0", fontSize: ".78rem", lineHeight: 1.7, margin: 0, paddingTop: 4 }}>{item.feedback}</p>
          </Expander>
        )}
      </div>
    </div>
  );
}

function CalIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ opacity:.6 }}>
      <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1"/>
      <line x1="1" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1"/>
      <line x1="4" y1="1" x2="4" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
      <line x1="8" y1="1" x2="8" y2="3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

/* ═══════════════════════════════
   MAIN HISTORY PAGE
═══════════════════════════════ */
export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid"); // "grid" | "list"
  const [mobOpen, setMobOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data.history || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const roles = ["all", ...new Set(history.map(h => h.role))];
  const filtered = filter === "all" ? history : history.filter(h => h.role === filter);
  const avg = history.length ? Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / history.length) : 0;
  const best = history.length ? Math.max(...history.map(h => h.score || 0)) : 0;

  const navLinks = [["dashboard","Dashboard"],["setup","New Interview"],["history","History"],["profile","Profile"]];

  const go = (id) => { setMobOpen(false); navigate("/" + id); };

  return (
    <>
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="ni">
          <a className="logo" onClick={() => navigate("/")} >PrepX</a>
          <ul className="nl">
            {navLinks.map(([id, lbl]) => (
              <li key={id}>
                <a className={id === "history" ? "act" : ""} onClick={() => go(id)}>
                  {lbl}
                </a>
              </li>
            ))}
          </ul>
          <button className="ncta" onClick={() => navigate("/setup")}>Start Free →</button>
          <button className={`ham ${mobOpen?"o":""}`} onClick={() => setMobOpen(!mobOpen)}><span/><span/><span/></button>
        </div>
      </nav>

      <div className={`ov ${mobOpen?"o":""}`} onClick={()=>setMobOpen(false)}/>
      <div className={`mob ${mobOpen?"o":""}`}>
        {[["dashboard","🏠","Dashboard"],["setup","🎤","New Interview"],["history","📊","History"],["profile","👤","Profile"]].map(([id,e,lbl])=>(
          <a key={id} onClick={()=>go(id)}>{e} {lbl}</a>
        ))}
        <a className="mcta" onClick={() => { setMobOpen(false); navigate("/setup"); }}>🎤 Start New Interview</a>
      </div>

      {/* PAGE BODY */}
      <div style={{ minHeight: "100vh", background: "#060910", color: "#e8edf5", fontFamily: "'DM Sans',sans-serif", paddingTop: 100, paddingBottom: 60, paddingLeft: "clamp(20px,5vw,48px)", paddingRight: "clamp(20px,5vw,48px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* PAGE HEADER */}
          <div style={{ marginBottom: 32, animation: "cardIn .6s cubic-bezier(.4,0,.2,1) both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 100, padding: "7px 22px", fontSize: ".72rem", fontWeight: 600, color: "#00e5ff", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
              Your Progress
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.7rem,4vw,2.5rem)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 10 }}>
                  Interview{" "}
                  <span style={{ background: "linear-gradient(130deg,#00e5ff 0%,#7b5cfa 55%,#ff6b6b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>History</span>
                </h1>
                <p style={{ color: "#8492aa", fontSize: ".92rem", lineHeight: 1.7 }}>Review your past sessions, track scores, and see growth.</p>
              </div>
              {/* View toggle */}
              {history.length > 0 && (
                <div style={{ display: "flex", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, padding: 3, gap: 2 }}>
                  {[["grid","▦ Grid"],["list","≡ List"]].map(([v, lbl]) => (
                    <button key={v} onClick={() => setView(v)} style={{
                      background: view===v ? "rgba(255,255,255,.1)" : "none",
                      border: "none", borderRadius: 7, padding: "6px 14px",
                      color: view===v ? "#e8edf5" : "#8492aa",
                      fontSize: ".76rem", fontWeight: 600, cursor: "pointer", transition: "all .18s",
                    }}>{lbl}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* STATS ROW */}
          {history.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24, animation: "cardIn .5s .1s both" }}>
              {[
                { label: "Sessions", value: history.length, icon: "🎤", color: "#00e5ff" },
                { label: "Avg Score", value: avg, icon: "📊", color: "#7b5cfa" },
                { label: "Best Score", value: best, icon: "🏆", color: "#f5c842" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{ background: "#0b1018", border: "1px solid rgba(255,255,255,.07)", borderRadius: 18, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, transition: "transform .2s, border-color .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.borderColor=`${color}33`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.borderColor="rgba(255,255,255,.07)"; }}
                >
                  <span style={{ fontSize: "1.4rem" }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.5rem", color, lineHeight: 1 }}>{value}</div>
                    <div style={{ color: "#8492aa", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 3 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FILTER PILLS */}
          {history.length > 1 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, animation: "cardIn .5s .15s both" }}>
              {roles.map(r => (
                <button key={r} onClick={() => setFilter(r)} style={{
                  background: filter===r ? "linear-gradient(135deg,#00e5ff,#7b5cfa)" : "rgba(255,255,255,.04)",
                  border: filter===r ? "none" : "1px solid rgba(255,255,255,.08)",
                  borderRadius: 100, padding: "6px 18px",
                  color: filter===r ? "#fff" : "#8492aa",
                  fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
                  textTransform: "capitalize", letterSpacing: ".04em", transition: "all .2s",
                }}>
                  {r === "all" ? "All" : ((ROLE_META[r]?.icon || "🎤") + " " + (ROLE_META[r]?.label || r))}
                </button>
              ))}
            </div>
          )}

          {/* CONTENT */}
          {loading ? (
            <div className="hist-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background: "#0b1018", border: "1px solid rgba(255,255,255,.06)", borderRadius: 20, height: 200, animation: "pulse 1.6s ease-in-out infinite" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "#0b1018", border: "1px solid rgba(255,255,255,.06)", borderRadius: 24 }}>
              <div style={{ fontSize: "2.8rem", marginBottom: 16 }}>🎤</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.2rem", marginBottom: 8 }}>
                {history.length === 0 ? "No interviews yet" : "No matches"}
              </h3>
              <p style={{ color: "#8492aa", fontSize: ".88rem", marginBottom: 24 }}>
                {history.length === 0 ? "Complete your first mock interview to see results here." : "Try a different filter."}
              </p>
              {history.length === 0 && (
                <button onClick={() => navigate("/setup")} style={{ background: "linear-gradient(135deg,#00e5ff,#7b5cfa)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".9rem", cursor: "pointer" }}>
                  Start an Interview →
                </button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="hist-grid">
              {filtered.map((item, i) => <HistoryCard key={item._id || i} item={item} index={i} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map((item, i) => <HistoryCard key={item._id || i} item={item} index={i} />)}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:   #060910;
  --bg2:  #0b1018;
  --c:    #00e5ff;
  --v:    #7b5cfa;
  --txt:  #e8edf5;
  --muted:#8492aa;
  --border: rgba(255,255,255,0.08);
}

@keyframes cardIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.9}}
@keyframes pp{0%,100%{box-shadow:0 0 6px var(--c);transform:scale(1)}50%{box-shadow:0 0 22px var(--c);transform:scale(1.35)}}

/* ── NAV ── */
.nav { 
  position:fixed;top:0;left:0;right:0;z-index:500;
  padding: 0 clamp(16px,4vw,40px);
  background: rgba(6,9,16,.92);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  transition: background .35s, border-color .35s;
}

.ni { 
  max-width:1080px;
  margin:0 auto;
  display:flex;
  align-items:center;
  justify-content:space-between;
  height:68px;
}

.logo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 1.28rem;
  letter-spacing: -.03em;
  text-decoration: none;
  color: var(--txt);
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity .2s;
  background: none;
  border: none;
}
.logo:hover { opacity:.8; }

.ldot { 
  width:9px;height:9px;border-radius:50%;background:var(--c);
  box-shadow:0 0 10px var(--c);animation:pp 2s ease-in-out infinite;flex-shrink:0; 
}

.nl { 
  display:flex;gap:2px;list-style:none;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  border-radius:100px;padding:4px;
}

.nl li { display: flex; }

.nl a { 
  display:block;text-decoration:none;color:var(--muted);
  font-size:.84rem;font-weight:800;padding:7px 17px;
  border-radius:100px;transition:color .2s, background .2s;
  white-space:nowrap;cursor:pointer;
}

.nl a:hover, .nl a.act { 
  color:var(--txt);background: rgba(255,255,255,.08);
}

.ncta {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;font-size: .84rem;
  background: linear-gradient(135deg,var(--c),var(--v));
  color: #fff;padding: 9px 24px;border-radius: 100px;
  letter-spacing: .01em;box-shadow: 0 0 20px rgba(0,229,255,.22);
  transition: transform .2s, box-shadow .2s;white-space: nowrap;
  cursor: pointer;border: none;
}
.ncta:hover { 
  transform: translateY(-2px);
  box-shadow: 0 0 36px rgba(0,229,255,.42);
}

.ham { 
  display:none;flex-direction:column;gap:5px;cursor:pointer;
  padding:6px;border:none;background:none;z-index:600;
}

.ham span { 
  display:block;width:22px;height:2px;background:var(--txt);
  border-radius:2px;transition:transform .3s, opacity .3s;
  transform-origin:center;
}

.ham.o span:nth-child(1) { 
  transform: translateY(7px) rotate(45deg);
}
.ham.o span:nth-child(2) { 
  opacity:0;transform: scaleX(0);
}
.ham.o span:nth-child(3) { 
  transform: translateY(-7px) rotate(-45deg);
}

.mob { 
  position:fixed;top:0;right:0;bottom:0;width:min(310px,85vw);
  background: rgba(8,12,20,.97);backdrop-filter: blur(32px);
  border-left: 1px solid var(--border);z-index:550;
  transform: translateX(100%);transition: transform .32s cubic-bezier(.4,0,.2,1);
  padding: 96px 32px 40px;display:flex;flex-direction:column;gap:6px;
}

.mob.o { 
  transform: translateX(0);
}

.mob a { 
  text-decoration:none;color:#b0bcd0;font-size:1rem;
  font-weight:500;padding:13px 0;border-bottom: 1px solid var(--border);
  transition: color .18s, padding-left .18s;display:flex;
  align-items:center;gap:10px;cursor:pointer;
}

.mob a:hover { 
  color:var(--txt);padding-left:8px;
}

.mob .mcta { 
  border:none;margin-top:18px;
  background: linear-gradient(135deg,var(--c),var(--v));
  color:#fff;padding:15px 24px;border-radius:12px;
  justify-content:center;font-weight:600;font-size:.92rem;
}

.ov { 
  position:fixed;inset:0;background: rgba(0,0,0,.55);
  z-index:540;opacity:0;pointer-events:none;transition: opacity .28s;
}

.ov.o { 
  opacity:1;pointer-events:all;
}

@media(max-width:768px){ 
  .nl, .ncta { display:none; }
  .ham { display:flex; }
}

.hist-grid{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;
}

@media(max-width:960px){
  .hist-grid{ grid-template-columns: repeat(2, 1fr) !important; }
}
@media(max-width:600px){
  .hist-grid{ grid-template-columns: 1fr !important; }
  nav button:not(:last-child){ display: none; }
}
@media(max-width:480px){
  div[style*="repeat(3,1fr)"]{ grid-template-columns: 1fr !important; }
}
`;