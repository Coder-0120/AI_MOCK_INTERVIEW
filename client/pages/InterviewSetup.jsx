import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── PARTICLE CANVAS ─── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    let W, H, P, t = 0, raf;
    const mouse = { x: -9999, y: -9999 };
    const COLS = ["#00e5ff","#7b5cfa","#4ade80","#f5c842","#ff6b6b"];
    const rnd = (a,b) => Math.random()*(b-a)+a;
    const hexRgb = h => { h=h.replace("#",""); return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; };
    const mkp = () => ({ x:rnd(0,W),y:rnd(0,H),vx:rnd(-.22,.22),vy:rnd(-.18,.18),r:rnd(1,2.2),col:COLS[Math.floor(rnd(0,COLS.length))],a:rnd(.2,.55),ph:rnd(0,Math.PI*2),ps:rnd(.007,.016) });
    const resize = () => { W=cv.width=window.innerWidth; H=cv.height=window.innerHeight; };
    const init = () => { resize(); P=Array.from({length:Math.min(80,Math.floor(W/14))},mkp); };
    const aurora = () => {
      t+=.0015;
      [[0,0,W,H*.6,`rgba(0,229,255,${.025+Math.sin(t)*.008})`,.38+Math.sin(t)*.06],[W,H,0,H*.3,`rgba(123,92,250,${.02+Math.cos(t*.75)*.007})`,.48+Math.cos(t*.75)*.08]].forEach(([x1,y1,x2,y2,col,stop])=>{
        const g=ctx.createLinearGradient(x1,y1,x2,y2); g.addColorStop(0,"transparent"); g.addColorStop(stop,col); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      });
    };
    const frame = () => {
      ctx.clearRect(0,0,W,H); aurora();
      for(let i=0;i<P.length;i++){
        for(let j=i+1;j<P.length;j++){
          const p=P[i],q=P[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
          if(d<100){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle=`rgba(0,229,255,${(1-d/100)*.07})`; ctx.lineWidth=.5; ctx.stroke(); }
        }
        const p=P[i],md=Math.hypot(p.x-mouse.x,p.y-mouse.y);
        if(md<120){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(mouse.x,mouse.y); ctx.strokeStyle=`rgba(123,92,250,${(1-md/120)*.2})`; ctx.lineWidth=.7; ctx.stroke(); }
      }
      P.forEach(p=>{
        p.ph+=p.ps; const a=p.a*(.7+.3*Math.sin(p.ph));
        const[R,G,B]=hexRgb(p.col); ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${R},${G},${B},${a})`; ctx.shadowBlur=6; ctx.shadowColor=p.col; ctx.fill(); ctx.shadowBlur=0;
        const dx2=p.x-mouse.x,dy2=p.y-mouse.y,md2=Math.hypot(dx2,dy2);
        if(md2<80){const f=(80-md2)/80*.3; p.vx+=(dx2/md2)*f; p.vy+=(dy2/md2)*f;}
        const spd=Math.hypot(p.vx,p.vy);
        if(spd>.65){p.vx*=.94;p.vy*=.94;} if(spd<.06){p.vx+=rnd(-.007,.007);p.vy+=rnd(-.007,.007);}
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-8)p.x=W+8; if(p.x>W+8)p.x=-8; if(p.y<-8)p.y=H+8; if(p.y>H+8)p.y=-8;
      });
      raf=requestAnimationFrame(frame);
    };
    const onMove=e=>{mouse.x=e.clientX;mouse.y=e.clientY;};
    const onLeave=()=>{mouse.x=-9999;mouse.y=-9999;};
    window.addEventListener("resize",init,{passive:true});
    window.addEventListener("mousemove",onMove,{passive:true});
    window.addEventListener("mouseleave",onLeave);
    init(); frame();
    return ()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",init);window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseleave",onLeave);};
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}} />;
}

/* ─── CURSOR ─── */
function Cursor() {
  const dotRef=useRef(null), ringRef=useRef(null);
  useEffect(()=>{
    let mx=0,my=0,rx=0,ry=0,raf;
    const dot=dotRef.current,ring=ringRef.current;
    const onMove=e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+"px";dot.style.top=my+"px";};
    const loop=()=>{rx+=(mx-rx)*.14;ry+=(my-ry)*.14;ring.style.left=rx+"px";ring.style.top=ry+"px";raf=requestAnimationFrame(loop);};
    const on=()=>document.body.classList.add("cur-hov");
    const off=()=>document.body.classList.remove("cur-hov");
    document.querySelectorAll("a,button").forEach(el=>{el.addEventListener("mouseenter",on);el.addEventListener("mouseleave",off);});
    document.addEventListener("mousemove",onMove,{passive:true}); loop();
    return ()=>{cancelAnimationFrame(raf);document.removeEventListener("mousemove",onMove);};
  },[]);
  return(<><div ref={dotRef} className="cur-dot"/><div ref={ringRef} className="cur-ring"/></>);
}

/* ─── ROLES ─── */
const ROLES = [
  { value:"frontend", label:"Frontend",   icon:"🖥️", desc:"HTML, CSS, JS, React & UI patterns",       tag:"Popular" },
  { value:"backend",  label:"Backend",    icon:"⚙️", desc:"APIs, databases, system architecture",     tag:"" },
  { value:"mern",     label:"MERN Stack", icon:"🚀", desc:"MongoDB, Express, React, Node.js",          tag:"Hot" },
  { value:"dsa",      label:"DSA",        icon:"🧩", desc:"Data structures, algorithms & complexity", tag:"" },
  { value:"pm",       label:"Product",    icon:"📋", desc:"Product sense, metrics & case studies",    tag:"" },
  { value:"hr",       label:"HR Round",   icon:"🤝", desc:"Behavioral, STAR & communication",         tag:"" },
];

/* ═══════════════════════════════
   INTERVIEW SETUP
═══════════════════════════════ */
export default function InterviewSetup() {
  const [role, setRole] = useState("");
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const navigate = useNavigate();
  const navLinks = [["dashboard","Dashboard"],["setup","New Interview"],["history","History"],["profile","Profile"]];

  useEffect(()=>{ setTimeout(()=>setVisible(true), 80); },[]);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>10);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  const go = id => { setMobOpen(false); navigate("/"+id); };

  return (
    <>
      <style>{CSS}</style>
      <ParticleCanvas/>
      <Cursor/>

      {/* NAV */}
      <nav className={`nav ${scrolled ? "sc" : ""}`}>
        <div className="ni">
          <a className="logo" onClick={() => navigate("/")} >PrepX</a>
          <ul className="nl">
            {navLinks.map(([id, lbl]) => (
              <li key={id}>
                <a className={id === "setup" ? "act" : ""} onClick={() => go(id)}>
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

      {/* STAGE */}
      <div className="stage">
        <div className={`setup-wrap ${visible?"in":""}`}>

          <div className="chip"><span className="cdot"/>Choose Your Role</div>

          <h1 className="setup-title">
            What are you{" "}
            <span className="gt">interviewing</span>
            {" "}for?
          </h1>
          <p className="setup-sub">Pick a role and we'll generate tailored questions just for you.</p>

          {/* ROLE GRID */}
          <div className="role-grid">
            {ROLES.map(({value,label,icon,desc,tag})=>(
              <button
                key={value}
                className={`role-card ${role===value?"selected":""}`}
                onClick={()=>setRole(value)}
              >
                {tag && <span className="rc-tag">{tag}</span>}
                <span className="rc-icon">{icon}</span>
                <span className="rc-label">{label}</span>
                <span className="rc-desc">{desc}</span>
                {role===value && <span className="rc-check">✓</span>}
              </button>
            ))}
          </div>

          {/* START BUTTON */}
          <button
            className={`cta-btn ${!role?"disabled":""}`}
            onClick={()=>{ if(role) navigate("/session", { state: { role } }); }}
            disabled={!role}
          >
            <span className="btn-glow"/>
            {role ? `🎤 Start ${ROLES.find(r=>r.value===role)?.label} Interview →` : "Select a role to continue"}
          </button>

        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════
   CSS
═══════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root{
  --bg:#060910;--bg2:#0b1018;--bg3:#111827;
  --c:#00e5ff;--v:#7b5cfa;--r:#ff6b6b;--g:#4ade80;
  --txt:#e8edf5;--muted:#8492aa;--soft:#b0bcd0;
  --border:rgba(255,255,255,0.08);
  --head:'Outfit',sans-serif;--body:'Plus Jakarta Sans',sans-serif;
}
html,body{min-height:100%;background:var(--bg);color:var(--txt);font-family:var(--body);font-size:16px;line-height:1.7;overflow-x:hidden;cursor:none;}
@media(max-width:640px){body{cursor:auto;}}

.cur-dot{position:fixed;width:10px;height:10px;background:var(--c);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .15s,height .15s,background .15s;mix-blend-mode:screen;}
.cur-ring{position:fixed;width:34px;height:34px;border:1.5px solid rgba(0,229,255,.35);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .15s,height .15s,border-color .15s;}
body.cur-hov .cur-dot{width:18px;height:18px;background:var(--v);}
body.cur-hov .cur-ring{width:50px;height:50px;border-color:var(--v);}
@media(max-width:640px){.cur-dot,.cur-ring{display:none;}}

nav,section{position:relative;z-index:1;}
.nav{position:fixed;top:0;left:0;right:0;z-index:500;padding:0 clamp(16px,4vw,40px);transition:background .35s,border-color .35s;}
.nav.sc{background:rgba(6,9,16,.92);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);}
.ni{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px;}
.logo{font-family:var(--head);font-weight:800;font-size:1.28rem;letter-spacing:-.03em;text-decoration:none;color:var(--txt);display:flex;align-items:center;gap:10px;cursor:pointer;transition:opacity .2s;background:none;border:none;}
.logo:hover{opacity:.8;}
.ldot{width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);animation:pp 2s ease-in-out infinite;flex-shrink:0;}
@keyframes pp{0%,100%{box-shadow:0 0 6px var(--c);transform:scale(1)}50%{box-shadow:0 0 22px var(--c);transform:scale(1.35)}}
.nl{display:flex;gap:2px;list-style:none;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:100px;padding:4px;}
.nl a{display:block;text-decoration:none;color:var(--muted);font-family:var(--head);font-size:.83rem;font-weight:500;padding:7px 18px;border-radius:100px;transition:color .2s,background .2s;white-space:nowrap;cursor:pointer;letter-spacing:.01em;}
.nl a:hover,.nl a.act{color:var(--txt);background:rgba(255,255,255,.08);}
.ncta{font-family:var(--head);font-weight:700;font-size:.84rem;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;padding:9px 24px;border-radius:100px;letter-spacing:.02em;box-shadow:0 0 20px rgba(0,229,255,.22);transition:transform .2s,box-shadow .2s;white-space:nowrap;cursor:pointer;border:none;}
.ncta:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(0,229,255,.42);}
.ham{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:6px;border:none;background:none;z-index:600;}
.ham span{display:block;width:22px;height:2px;background:var(--txt);border-radius:2px;transition:transform .3s,opacity .3s;transform-origin:center;}
.ham.o span:nth-child(1){transform:translateY(7px) rotate(45deg);}
.ham.o span:nth-child(2){opacity:0;transform:scaleX(0);}
.ham.o span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
.mob{position:fixed;top:0;right:0;bottom:0;width:min(310px,85vw);background:rgba(8,12,20,.97);backdrop-filter:blur(32px);border-left:1px solid var(--border);z-index:550;transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);padding:96px 32px 40px;display:flex;flex-direction:column;gap:6px;}
.mob.o{transform:translateX(0);}
.mob a{text-decoration:none;color:var(--soft);font-family:var(--head);font-size:1.05rem;font-weight:500;padding:13px 0;border-bottom:1px solid var(--border);transition:color .18s,padding-left .18s;display:flex;align-items:center;gap:10px;cursor:pointer;}
.mob a:hover{color:var(--txt);padding-left:8px;}
.mob .mcta{border:none;margin-top:18px;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;padding:15px 24px;border-radius:12px;justify-content:center;font-weight:700;font-size:.95rem;}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:540;opacity:0;pointer-events:none;transition:opacity .28s;}
.ov.o{opacity:1;pointer-events:all;}
@media(max-width:768px){.nl,.ncta{display:none}.ham{display:flex}}

.chip{display:inline-flex;align-items:center;gap:8px;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.2);border-radius:100px;padding:7px 22px;font-family:var(--head);font-size:.7rem;font-weight:600;color:var(--c);letter-spacing:.12em;text-transform:uppercase;margin-bottom:20px;}
.cdot{width:6px;height:6px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);animation:pp 1.5s infinite;flex-shrink:0;}
.gt{background:linear-gradient(130deg,var(--c) 0%,var(--v) 55%,var(--r) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

.stage{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:100px clamp(20px,5vw,48px) 60px;position:relative;z-index:2;}

.setup-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:720px;width:100%;opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1);}
.setup-wrap.in{opacity:1;transform:translateY(0);}

/* Big display heading matching screenshot style */
.setup-title{
  font-family:var(--head);
  font-size:clamp(2rem,5vw,3.5rem);
  font-weight:900;
  letter-spacing:-.04em;
  line-height:1.1;
  color:var(--txt);
  margin-bottom:14px;
}
.setup-sub{font-family:var(--body);font-size:.95rem;color:var(--soft);margin-bottom:36px;max-width:400px;line-height:1.75;}

/* ROLE GRID */
.role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;width:100%;margin-bottom:32px;}
@media(max-width:600px){.role-grid{grid-template-columns:repeat(2,1fr);}}
@media(max-width:380px){.role-grid{grid-template-columns:1fr;}}

.role-card{
  position:relative;
  background:var(--bg2);
  border:1px solid var(--border);
  border-radius:18px;
  padding:22px 16px 20px;
  cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:6px;
  transition:transform .22s cubic-bezier(.34,1.2,.64,1),border-color .22s,box-shadow .22s,background .22s;
  text-align:center;
  overflow:hidden;
}
.role-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--c),var(--v));opacity:0;transition:opacity .22s;}
.role-card:hover::before{opacity:1;}
.role-card:hover{
  transform:translateY(-6px);
  border-color:rgba(0,229,255,.25);
  box-shadow:0 20px 48px rgba(0,0,0,.4),0 0 24px rgba(0,229,255,.06);
  background:var(--bg3);
}
.role-card.selected{
  border-color:var(--c);
  background:rgba(0,229,255,.04);
  box-shadow:0 0 0 1px var(--c) inset,0 20px 48px rgba(0,0,0,.35),0 0 32px rgba(0,229,255,.1);
  transform:translateY(-4px);
}
.role-card.selected::before{opacity:1;}
.rc-tag{position:absolute;top:10px;left:10px;font-family:var(--head);font-size:.58rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#060910;background:var(--c);padding:2px 8px;border-radius:100px;}
.rc-icon{font-size:1.7rem;display:block;margin-bottom:6px;}
.rc-label{font-family:var(--head);font-size:1rem;font-weight:800;color:var(--txt);letter-spacing:-.01em;}
.rc-desc{font-family:var(--body);font-size:.72rem;color:var(--muted);line-height:1.5;}
.rc-check{
  position:absolute;top:10px;right:10px;
  width:20px;height:20px;border-radius:50%;
  background:linear-gradient(135deg,var(--c),var(--v));
  color:#000;font-size:.65rem;font-weight:900;
  display:flex;align-items:center;justify-content:center;
}

/* CTA button */
.cta-btn{
  position:relative;display:inline-flex;align-items:center;gap:10px;
  background:linear-gradient(135deg,var(--c),var(--v));
  color:#fff;font-family:var(--head);font-weight:800;font-size:1rem;
  padding:16px 48px;border-radius:14px;border:none;cursor:pointer;
  letter-spacing:.02em;
  box-shadow:0 0 36px rgba(0,229,255,.22),0 10px 36px rgba(123,92,250,.18);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,opacity .25s;
  overflow:hidden;
}
.cta-btn:hover:not(.disabled){transform:translateY(-4px) scale(1.03);box-shadow:0 0 60px rgba(0,229,255,.38),0 18px 50px rgba(123,92,250,.28);}
.cta-btn.disabled{opacity:.38;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-glow{position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.18) 50%,transparent 60%);transform:translateX(-100%);transition:transform .55s ease;pointer-events:none;}
.cta-btn:hover:not(.disabled) .btn-glow{transform:translateX(100%);}

@media(max-width:480px){
  .setup-title{font-size:1.7rem;}
  .cta-btn{padding:14px 32px;font-size:.9rem;width:100%;}
}
`;