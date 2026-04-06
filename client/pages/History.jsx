import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── SCORE RING ─── */
function ScoreRing({ score }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score, 0), 100);
  const offset = circ - (pct / 100) * circ;

  let color, label, glow;
  if (pct >= 75) {
    color = "#4ade80"; glow = "rgba(74,222,128,.35)"; label = "High";
  } else if (pct >= 45) {
    color = "#f5c842"; glow = "rgba(245,200,66,.35)"; label = "Mid";
  } else {
    color = "#ff6b6b"; glow = "rgba(255,107,107,.35)"; label = "Low";
  }

  return (
    <div style={{ position: "relative", width: 88, height: 88, flexShrink: 0 }}>
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 1,
      }}>
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
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.22)",
      borderRadius: 100, padding: "4px 14px",
      fontSize: ".72rem", fontWeight: 700, color: "#00e5ff",
      letterSpacing: ".06em", textTransform: "uppercase",
    }}>
      <span style={{ fontSize: "1rem" }}>{meta.icon}</span>
      {meta.label}
    </span>
  );
}

/* ─── EXPANDABLE SECTION ─── */
function Expander({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 10, padding: "8px 16px", cursor: "pointer",
          color: "#8492aa", fontSize: ".78rem", fontWeight: 600, letterSpacing: ".05em",
          transition: "color .18s, background .18s",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "#e8edf5"; e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "#8492aa"; e.currentTarget.style.background = "rgba(255,255,255,.04)"; }}
      >
        <span style={{
          display: "inline-block", width: 14, height: 14,
          border: "1.5px solid currentColor", borderRadius: 3,
          position: "relative", flexShrink: 0,
        }}>
          <span style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: ".75rem", lineHeight: 1, color: "inherit",
            fontWeight: 700,
          }}>{open ? "−" : "+"}</span>
        </span>
        {label}
      </button>
      {open && (
        <div style={{
          marginTop: 8, borderLeft: "2px solid rgba(0,229,255,.18)",
          paddingLeft: 16, animation: "fadeIn .25s ease",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── HISTORY CARD ─── */
function HistoryCard({ item, index }) {
  const date = new Date(item.createdAt);
  const formatted = date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{
      background: "#0b1018",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 20,
      padding: "24px 28px",
      transition: "transform .25s cubic-bezier(.34,1.2,.64,1), border-color .22s, box-shadow .22s",
      animation: `cardIn .5s cubic-bezier(.4,0,.2,1) ${index * 0.07}s both`,
      cursor: "default",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.borderColor = "rgba(0,229,255,.25)";
      e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,.4), 0 0 24px rgba(0,229,255,.06)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
      e.currentTarget.style.boxShadow = "";
    }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <RoleBadge role={item.role} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8492aa", fontSize: ".8rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <CalIcon /> {formatted}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#8492aa" }} />
            <span>{time}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#8492aa" }} />
            <span>{item.questions?.length || 0} questions</span>
          </div>
        </div>
        <ScoreRing score={item.score} />
      </div>

      {/* Feedback preview */}
      {item.feedback && (
        <p style={{
          marginTop: 14, color: "#b0bcd0", fontSize: ".82rem", lineHeight: 1.7,
          borderLeft: "2px solid rgba(123,92,250,.4)", paddingLeft: 12,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {item.feedback}
        </p>
      )}

      {/* Expanders */}
      <Expander label={`View Q&A  (${item.questions?.length || 0})`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
          {item.questions?.map((q, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                  background: "linear-gradient(135deg,#00e5ff,#7b5cfa)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: ".65rem", fontWeight: 800, color: "#060910",
                }}>Q{i + 1}</span>
                <p style={{ color: "#e8edf5", fontSize: ".83rem", lineHeight: 1.65, margin: 0 }}>{q}</p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginLeft: 0 }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                  background: "rgba(74,222,128,.15)", border: "1px solid rgba(74,222,128,.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: ".65rem", fontWeight: 800, color: "#4ade80",
                }}>A</span>
                <p style={{ color: "#8492aa", fontSize: ".83rem", lineHeight: 1.65, margin: 0 }}>
                  {item.answers?.[i] || <em style={{ opacity: .5 }}>No answer recorded</em>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Expander>

      {item.feedback && (
        <Expander label="Full Feedback">
          <p style={{ color: "#b0bcd0", fontSize: ".83rem", lineHeight: 1.75, margin: 0, paddingTop: 6 }}>
            {item.feedback}
          </p>
        </Expander>
      )}
    </div>
  );
}

/* tiny SVG calendar icon */
function CalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: .6 }}>
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

  return (
    <>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 500,
        background: "rgba(6,9,16,.92)", backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,.08)",
      }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", display: "flex",
          alignItems: "center", justifyContent: "space-between",
          height: 68, padding: "0 clamp(16px,4vw,40px)",
        }}>
          <a onClick={() => navigate("/")} style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.28rem",
            letterSpacing: "-.03em", textDecoration: "none", color: "#e8edf5",
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
          }}>
            <span style={{
              width: 9, height: 9, borderRadius: "50%", background: "#00e5ff",
              boxShadow: "0 0 10px #00e5ff", flexShrink: 0,
            }} />
            InterviewAI
          </a>
          <div style={{ display: "flex", gap: 8 }}>
            {[["dashboard","Dashboard"],["setup","New Interview"],["history","History"],["profile","Profile"]].map(([id,lbl]) => (
              <button key={id} onClick={() => navigate("/"+id)} style={{
                background: id === "history" ? "rgba(255,255,255,.08)" : "none",
                border: "none", borderRadius: 100, padding: "7px 17px",
                color: id === "history" ? "#e8edf5" : "#8492aa",
                fontSize: ".84rem", fontWeight: 500, cursor: "pointer",
                transition: "color .2s, background .2s",
              }}
              onMouseEnter={e => { if(id !== "history"){ e.currentTarget.style.color="#e8edf5"; e.currentTarget.style.background="rgba(255,255,255,.06)"; }}}
              onMouseLeave={e => { if(id !== "history"){ e.currentTarget.style.color="#8492aa"; e.currentTarget.style.background="none"; }}}
              >{lbl}</button>
            ))}
          </div>
          <button onClick={() => navigate("/setup")} style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".84rem",
            background: "linear-gradient(135deg,#00e5ff,#7b5cfa)", color: "#fff",
            padding: "9px 24px", borderRadius: 100, border: "none", cursor: "pointer",
            boxShadow: "0 0 20px rgba(0,229,255,.22)",
          }}>
            Start Free →
          </button>
        </div>
      </nav>

      {/* PAGE BODY */}
      <div style={{
        minHeight: "100vh", background: "#060910", color: "#e8edf5",
        fontFamily: "'DM Sans',sans-serif",
        paddingTop: 100, paddingBottom: 60,
        paddingLeft: "clamp(20px,5vw,48px)", paddingRight: "clamp(20px,5vw,48px)",
      }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>

          {/* PAGE HEADER */}
          <div className="page-in" style={{ marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(0,229,255,.07)", border: "1px solid rgba(0,229,255,.2)",
              borderRadius: 100, padding: "7px 22px",
              fontSize: ".72rem", fontWeight: 600, color: "#00e5ff",
              letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e5ff", boxShadow: "0 0 8px #00e5ff" }} />
              Your Progress
            </div>
            <h1 style={{
              fontFamily: "'Syne',sans-serif", fontSize: "clamp(1.7rem,4vw,2.5rem)",
              fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1.1, marginBottom: 10,
            }}>
              Interview{" "}
              <span style={{
                background: "linear-gradient(130deg,#00e5ff 0%,#7b5cfa 55%,#ff6b6b 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>History</span>
            </h1>
            <p style={{ color: "#8492aa", fontSize: ".92rem", lineHeight: 1.7 }}>
              Review your past sessions, track your scores, and see how you've grown.
            </p>
          </div>

          {/* STATS ROW */}
          {history.length > 0 && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 28,
            }} className="page-in">
              {[
                { label: "Sessions", value: history.length, icon: "🎤", color: "#00e5ff" },
                { label: "Avg Score", value: avg, icon: "📊", color: "#7b5cfa" },
                { label: "Best Score", value: best, icon: "🏆", color: "#f5c842" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{
                  background: "#0b1018", border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 16, padding: "18px 20px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
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
            <div style={{ display: "flex",gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {roles.map(r => (
                <button key={r} onClick={() => setFilter(r)} style={{
                  background: filter === r ? "linear-gradient(135deg,#00e5ff,#7b5cfa)" : "rgba(255,255,255,.04)",
                  border: filter === r ? "none" : "1px solid rgba(255,255,255,.08)",
                  borderRadius: 100, padding: "6px 18px",
                  color: filter === r ? "#fff" : "#8492aa",
                  fontSize: ".78rem", fontWeight: 600, cursor: "pointer",
                  textTransform: "capitalize", letterSpacing: ".04em",
                  transition: "all .2s",
                }}>
                  {r === "all" ? "All" : (ROLE_META[r]?.icon + " " + (ROLE_META[r]?.label || r))}
                </button>
              ))}
            </div>
          )}

          {/* CONTENT */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  background: "#0b1018", border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 20, padding: "24px 28px", height: 130,
                  animation: "pulse 1.6s ease-in-out infinite",
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 20px",
              background: "#0b1018", border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 24,
            }}>
              <div style={{ fontSize: "2.8rem", marginBottom: 16 }}>🎤</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1.2rem", marginBottom: 8 }}>
                {history.length === 0 ? "No interviews yet" : "No matches"}
              </h3>
              <p style={{ color: "#8492aa", fontSize: ".88rem", marginBottom: 24 }}>
                {history.length === 0 ? "Complete your first mock interview to see your results here." : "Try a different filter."}
              </p>
              {history.length === 0 && (
                <button onClick={() => navigate("/setup")} style={{
                  background: "linear-gradient(135deg,#00e5ff,#7b5cfa)",
                  color: "#fff", border: "none", borderRadius: 12,
                  padding: "12px 32px", fontFamily: "'Syne',sans-serif",
                  fontWeight: 700, fontSize: ".9rem", cursor: "pointer",
                }}>
                  Start an Interview →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map((item, i) => <HistoryCard key={item._id || i} item={item} index={i} />)}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

@keyframes cardIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.9}}
@keyframes pp{0%,100%{box-shadow:0 0 6px #00e5ff;transform:scale(1)}50%{box-shadow:0 0 22px #00e5ff;transform:scale(1.35)}}

.page-in{animation:cardIn .6s cubic-bezier(.4,0,.2,1) both;}

@media(max-width:640px){
  nav button:not(:last-child){display:none;}
}
@media(max-width:480px){
  div[style*="grid-template-columns: repeat(3"]{grid-template-columns:1fr!important;}
}
`;