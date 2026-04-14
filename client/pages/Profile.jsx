import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/* ─── SCORE RING (reused from History) ─── */
function ScoreRing({ score, size = 88 }) {
  const r = (size / 2) - 7;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;
  let color, label;
  if (pct >= 75) { color = "#4ade80"; label = "High"; }
  else if (pct >= 45) { color = "#f5c842"; label = "Mid"; }
  else { color = "#ff6b6b"; label = "Low"; }
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size > 80 ? "1.3rem" : "1rem", color, lineHeight: 1 }}>{pct}</span>
        <span style={{ fontSize: ".6rem", color, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</span>
      </div>
    </div>
  );
}

const ROLE_META = {
  frontend: { icon: "🖥️", label: "Frontend" },
  backend:  { icon: "⚙️",  label: "Backend"  },
  mern:     { icon: "🚀", label: "MERN Stack" },
  dsa:      { icon: "🧩", label: "DSA"        },
  pm:       { icon: "📋", label: "Product"    },
  hr:       { icon: "🤝", label: "HR Round"   },
};

/* ─── AVATAR INITIALS ─── */
function Avatar({ name, size = 80 }) {
  const initials = name ? name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#00e5ff 0%,#7b5cfa 60%,#ff6b6b 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Syne',sans-serif", fontWeight: 800,
      fontSize: size * 0.35, color: "#060910",
      boxShadow: "0 0 32px rgba(0,229,255,.3), 0 0 80px rgba(123,92,250,.15)",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ─── STAT CARD ─── */
function StatCard({ icon, label, value, color = "#00e5ff", delay = 0 }) {
  return (
    <div style={{
      background: "#0b1018", border: "1px solid rgba(255,255,255,.07)",
      borderRadius: 20, padding: "20px 22px",
      display: "flex", alignItems: "center", gap: 16,
      animation: `cardIn .5s cubic-bezier(.4,0,.2,1) ${delay}s both`,
      transition: "transform .25s, border-color .22s, box-shadow .22s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.boxShadow = `0 16px 40px rgba(41, 32, 32, 0.4), 0 0 24px ${color}18`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(192, 33, 33, 0.07)"; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}14`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.6rem", color, lineHeight: 1 }}>{value}</div>
        <div style={{ color: "#8492aa", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─── RECENT INTERVIEW MINI CARD ─── */
function RecentCard({ item, index }) {
  const meta = ROLE_META[item.role] || { icon: "🎤", label: item.role };
  const date = new Date(item.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" });
  let scoreColor = item.score >= 75 ? "#4ade80" : item.score >= 45 ? "#f5c842" : "#ff6b6b";
  return (
    <div style={{
      background: "#0b1018", border: "1px solid rgba(255,255,255,.07)",
      borderRadius: 16, padding: "16px 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      animation: `cardIn .5s cubic-bezier(.4,0,.2,1) ${index * 0.08}s both`,
      transition: "transform .2s, border-color .2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateX(4px)"; e.currentTarget.style.borderColor = "rgba(19, 161, 177, 0.69)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
          {meta.icon}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: ".88rem", color: "#e8edf5" }}>{meta.label}</div>
          <div style={{ fontSize: ".72rem", color: "#8492aa", marginTop: 2 }}>{date} · {item.questions?.length || 0} questions</div>
        </div>
      </div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: scoreColor, flexShrink: 0 }}>
        {item.score}
      </div>
    </div>
  );
}

/* PROFILE PAGE*/
export default function Profile() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobOpen, setMobOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    const fetchAll = async () => {
      try {
        const [profRes, histRes] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/auth/history", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setUser(profRes.data.user);
        setHistory(histRes.data.history || []);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const avg = history.length ? Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / history.length) : 0;
  const best = history.length ? Math.max(...history.map(h => h.score || 0)) : 0;
  const roleSet = [...new Set(history.map(h => h.role))];
  const joinDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—";

  const navLinks = [["dashboard","Dashboard"],["setup","New Interview"],["history","History"],["profile","Profile"]];

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
                <a className={id === "profile" ? "act" : ""} onClick={() => navigate("/" + id)} style={{ cursor: "pointer" }}>
                  {lbl}
                </a>
              </li>
            ))}
          </ul>
          <button className="ncta" onClick={() => navigate("/setup")}>Start Free →</button>
          <button className={`ham ${mobOpen ? "o" : ""}`} onClick={() => setMobOpen(!mobOpen)}><span /><span /><span /></button>
        </div>
      </nav>
      <div className={`ov ${mobOpen ? "o" : ""}`} onClick={() => setMobOpen(false)} />
      <div className={`mob ${mobOpen ? "o" : ""}`}>
        {[["dashboard","🏠","Dashboard"],["setup","🎤","New Interview"],["history","📊","History"],["profile","👤","Profile"]].map(([id,e,lbl])=>(
          <a key={id} onClick={() => { setMobOpen(false); navigate("/" + id); }} style={{ cursor: "pointer" }}>{e} {lbl}</a>
        ))}
        <a className="mcta" onClick={() => { setMobOpen(false); navigate("/setup"); }} style={{ cursor: "pointer" }}>🎤 Start New Interview</a>
      </div>

      {/* PAGE */}
      <div style={{ minHeight: "100vh", background: "#060910", color: "#e8edf5", fontFamily: "'DM Sans',sans-serif", paddingTop: 100, paddingBottom: 60, paddingLeft: "clamp(20px,5vw,48px)", paddingRight: "clamp(20px,5vw,48px)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {!token ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: "2.8rem", marginBottom: 16 }}>🔐</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.2rem", marginBottom: 8 }}>Not logged in</h3>
              <p style={{ color: "#8492aa", marginBottom: 24 }}>Please log in to view your profile.</p>
              <button onClick={() => navigate("/")} style={{ background: "linear-gradient(135deg,#00e5ff,#7b5cfa)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontFamily: "'Syne',sans-serif", fontWeight: 700, cursor: "pointer" }}>Go to Login →</button>
            </div>
          ) : loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1,2,3].map(i => <div key={i} style={{ background: "#0b1018", border: "1px solid rgba(255,255,255,.06)", borderRadius: 20, height: 120, animation: "pulse 1.6s ease-in-out infinite" }} />)}
            </div>
          ) : (
            <>
              {/* PAGE HEADER */}
              <div style={{ marginBottom: 36, animation: "cardIn .6s cubic-bezier(.4,0,.2,1) both" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 100, padding: "7px 22px", fontSize: ".72rem", fontWeight: 600, color: "#00e5ff", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
                  Your Account
                </div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.7rem,4vw,2.5rem)", fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 10 }}>
                  Your{" "}
                  <span style={{ background: "linear-gradient(130deg,#00e5ff 0%,#7b5cfa 55%,#ff6b6b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Profile</span>
                </h1>
                <p style={{ color: "#8492aa", fontSize: ".92rem", lineHeight: 1.7 }}>Manage your account and track your interview journey.</p>
              </div>

              {/* HERO CARD */}
              <div style={{
                background: "linear-gradient(135deg, #0b1018 0%, #111827 100%)",
                border: "1px solid rgba(255,255,255,.1)", borderRadius: 28,
                padding: "36px clamp(24px,4vw,48px)", marginBottom: 24,
                display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap",
                boxShadow: "0 24px 64px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06)",
                animation: "cardIn .5s cubic-bezier(.4,0,.2,1) .1s both",
                position: "relative", overflow: "hidden",
              }}>
                {/* glow bg */}
                <div style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,229,255,.08) 0%, transparent 70%)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(123,92,250,.07) 0%, transparent 70%)", pointerEvents: "none" }} />

                <Avatar name={user?.name} size={88} />

                <div style={{ flex: 1, minWidth: 200 }}>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "clamp(1.4rem,3vw,2rem)", letterSpacing: "-.03em", color: "#e8edf5", marginBottom: 6 }}>
                    {user?.name || "—"}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#8492aa", fontSize: ".85rem", marginBottom: 12, flexWrap: "wrap" }}>
                    <span>✉️ {user?.email || "—"}</span>
                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#8492aa" }} />
                    <span>📅 Member since {joinDate}</span>
                  </div>
                  {roleSet.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {roleSet.map(r => {
                        const m = ROLE_META[r] || { icon: "🎤", label: r };
                        return (
                          <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 100, padding: "3px 12px", fontSize: ".7rem", fontWeight: 700, color: "#00e5ff", letterSpacing: ".05em" }}>
                            {m.icon} {m.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {history.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <ScoreRing score={avg} size={96} />
                    <span style={{ fontSize: ".7rem", color: "#8492aa", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>Avg Score</span>
                  </div>
                )}
              </div>

              {/* STATS ROW */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
                <StatCard icon="🎤" label="Interviews" value={history.length} color="#00e5ff" delay={0.15} />
                <StatCard icon="📊" label="Avg Score" value={avg || "—"} color="#7b5cfa" delay={0.2} />
                <StatCard icon="🏆" label="Best Score" value={best || "—"} color="#f5c842" delay={0.25} />
                <StatCard icon="🎯" label="Roles Tried" value={roleSet.length} color="#4ade80" delay={0.3} />
              </div>

              {/* RECENT INTERVIEWS */}
              {history.length > 0 && (
                <div style={{ animation: "cardIn .5s cubic-bezier(.4,0,.2,1) .35s both" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#e8edf5" }}>Recent Interviews</h3>
                    <button onClick={() => navigate("/history")} style={{ background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 100, padding: "6px 18px", color: "#00e5ff", fontSize: ".78rem", fontWeight: 600, cursor: "pointer", transition: "all .2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,229,255,.14)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,229,255,.07)"; }}
                    >
                      View all →
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {history.slice(0, 5).map((item, i) => <RecentCard key={item._id || i} item={item} index={i} />)}
                  </div>
                </div>
              )}

              {/* EMPTY STATE */}
              {history.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", background: "#0b1018", border: "1px solid rgba(255,255,255,.06)", borderRadius: 24, animation: "cardIn .5s both" }}>
                  <div style={{ fontSize: "2.4rem", marginBottom: 14 }}>🎤</div>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.1rem", marginBottom: 8 }}>No interviews yet</h3>
                  <p style={{ color: "#8492aa", fontSize: ".88rem", marginBottom: 24 }}>Complete your first mock interview to track your progress.</p>
                  <button onClick={() => navigate("/setup")} style={{ background: "linear-gradient(135deg,#00e5ff,#7b5cfa)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 32px", fontFamily: "'Syne',sans-serif", fontWeight: 700, cursor: "pointer" }}>
                    Start an Interview →
                  </button>
                </div>
              )}
            </>
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
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.9}}

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

.ni > a {
  font-family: 'Syne', sans-serif;
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
}
.ni > a:hover { opacity:.8; }

.nl { 
  display:flex;
  gap:2px;
  list-style:none;
  background: rgba(255,255,255,.04);
  border: 1px solid var(--border);
  border-radius:100px;
  padding:4px;
}

.nl li { display: flex; }

.nl a { 
  display:block;
  text-decoration:none;
  color:var(--muted);
  font-size:.84rem;
  font-weight:500;
  padding:7px 17px;
  border-radius:100px;
  transition:color .2s, background .2s;
  white-space:nowrap;
  cursor:pointer;
}

.nl a:hover, .nl a.act { 
  color:var(--txt);
  background: rgba(255,255,255,.08);
}

.ncta {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: .84rem;
  background: linear-gradient(135deg,var(--c),var(--v));
  color: #fff;
  padding: 9px 24px;
  border-radius: 100px;
  letter-spacing: .01em;
  box-shadow: 0 0 20px rgba(0,229,255,.22);
  transition: transform .2s, box-shadow .2s;
  white-space: nowrap;
  cursor: pointer;
  border: none;
}
.ncta:hover { 
  transform: translateY(-2px);
  box-shadow: 0 0 36px rgba(0,229,255,.42);
}

.ham { 
  display:none;
  flex-direction:column;
  gap:5px;
  cursor:pointer;
  padding:6px;
  border:none;
  background:none;
  z-index:600;
}

.ham span { 
  display:block;
  width:22px;
  height:2px;
  background:var(--txt);
  border-radius:2px;
  transition: transform .3s, opacity .3s;
  transform-origin:center;
}

.ham.o span:nth-child(1) { 
  transform: translateY(7px) rotate(45deg);
}

.ham.o span:nth-child(2) { 
  opacity:0;
  transform: scaleX(0);
}

.ham.o span:nth-child(3) { 
  transform: translateY(-7px) rotate(-45deg);
}

.mob { 
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  width:min(310px,85vw);
  background: rgba(8,12,20,.97);
  backdrop-filter: blur(32px);
  border-left: 1px solid var(--border);
  z-index:550;
  transform: translateX(100%);
  transition: transform .32s cubic-bezier(.4,0,.2,1);
  padding: 96px 32px 40px;
  display:flex;
  flex-direction:column;
  gap:6px;
}

.mob.o { 
  transform: translateX(0);
}

.mob a { 
  text-decoration:none;
  color:var(--muted);
  font-size:1rem;
  font-weight:500;
  padding:13px 0;
  border-bottom: 1px solid var(--border);
  transition: color .18s, padding-left .18s;
  display:flex;
  align-items:center;
  gap:10px;
  cursor:pointer;
}

.mob a:hover { 
  color:var(--txt);
  padding-left:8px;
}

.mob .mcta { 
  border:none;
  margin-top:18px;
  background: linear-gradient(135deg,var(--c),var(--v));
  color:#fff;
  padding:15px 24px;
  border-radius:12px;
  justify-content:center;
  font-family:'Syne',sans-serif;
  font-weight:600;
  font-size:.92rem;
}

.ov { 
  position:fixed;
  inset:0;
  background: rgba(0,0,0,.55);
  z-index:540;
  opacity:0;
  pointer-events:none;
  transition: opacity .28s;
}

.ov.o { 
  opacity:1;
  pointer-events:all;
}

@media(max-width:768px){ 
  .nl, .ncta { 
    display:none;
  }
  .ham { 
    display:flex;
  }
}

@media(max-width:640px){
  nav button:not(:last-child){display:none;}
}

@media(max-width:480px){
  div[style*="auto-fit"]{grid-template-columns:1fr 1fr!important;}
}
`;