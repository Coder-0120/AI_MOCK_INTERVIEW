import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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

/* ═══════════════════════════════
   LOGIN
═══════════════════════════════ */
const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{ setTimeout(()=>setVisible(true), 80); },[]);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>10);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <ParticleCanvas/>
      <Cursor/>

      {/* NAV */}
      <nav className={`nav ${scrolled?"sc":""}`}>
        <div className="ni">
          <a className="logo" onClick={()=>navigate("/")}><span className="ldot"/>InterviewAI</a>

          {/* Desktop nav — auth pages only show Login & Register */}
          <ul className="nl">
            {/* <li><a className="act" onClick={()=>navigate("/")}>Login</a></li> */}
            {/* <li><a onClick={()=>navigate("/register")}>Register</a></li> */}
          </ul>

          {/* <button className="ncta" onClick={()=>navigate("/register")}>Get Started →</button> */}
          <button className={`ham ${mobOpen?"o":""}`} onClick={()=>setMobOpen(!mobOpen)}><span/><span/><span/></button>
        </div>
      </nav>

      {/* Mobile overlay + drawer */}
      <div className={`ov ${mobOpen?"o":""}`} onClick={()=>setMobOpen(false)}/>
      <div className={`mob ${mobOpen?"o":""}`}>
        <a onClick={()=>{ setMobOpen(false); navigate("/"); }}>🔑 Login</a>
        <a onClick={()=>{ setMobOpen(false); navigate("/register"); }}>🚀 Register</a>
        <a className="mcta" onClick={()=>{ setMobOpen(false); navigate("/register"); }}>🎤 Start Free</a>
      </div>

      {/* STAGE */}
      <div className="stage">
        <div className={`auth-wrap ${visible?"in":""}`}>

          <div className="chip"><span className="cdot"/>Welcome Back</div>
          <h1 className="auth-title">Login to <span className="gt">InterviewAI</span></h1>
          <p className="auth-sub">Continue your AI-powered interview preparation</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                className="field-input"
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                className="field-input"
                type="password"
                name="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className={`submit-btn ${loading?"loading":""}`} disabled={loading}>
              <span className="btn-glow"/>
              {loading ? "Logging in…" : "Login →"}
            </button>
          </form>

          <p className="switch-text">
            Don't have an account?{" "}
            <a className="switch-link" onClick={()=>navigate("/register")}>Register</a>
          </p>

        </div>
      </div>
    </>
  );
};

export default Login;

/* ═══════════════════════════════
   CSS
═══════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#060910;--bg2:#0b1018;--bg3:#111827;
  --c:#00e5ff;--v:#7b5cfa;--r:#ff6b6b;--g:#4ade80;
  --txt:#e8edf5;--muted:#8492aa;--soft:#b0bcd0;
  --border:rgba(255,255,255,0.08);
  --head:'Syne',sans-serif;--body:'DM Sans',sans-serif;
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
.nl a{display:block;text-decoration:none;color:var(--muted);font-size:.84rem;font-weight:500;padding:7px 17px;border-radius:100px;transition:color .2s,background .2s;white-space:nowrap;cursor:pointer;}
.nl a:hover,.nl a.act{color:var(--txt);background:rgba(255,255,255,.08);}
.ncta{font-family:var(--head);font-weight:700;font-size:.84rem;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;padding:9px 24px;border-radius:100px;letter-spacing:.01em;box-shadow:0 0 20px rgba(0,229,255,.22);transition:transform .2s,box-shadow .2s;white-space:nowrap;cursor:pointer;border:none;}
.ncta:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(0,229,255,.42);}
.ham{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:6px;border:none;background:none;z-index:600;}
.ham span{display:block;width:22px;height:2px;background:var(--txt);border-radius:2px;transition:transform .3s,opacity .3s;transform-origin:center;}
.ham.o span:nth-child(1){transform:translateY(7px) rotate(45deg);}
.ham.o span:nth-child(2){opacity:0;transform:scaleX(0);}
.ham.o span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}
.mob{position:fixed;top:0;right:0;bottom:0;width:min(310px,85vw);background:rgba(8,12,20,.97);backdrop-filter:blur(32px);border-left:1px solid var(--border);z-index:550;transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);padding:96px 32px 40px;display:flex;flex-direction:column;gap:6px;}
.mob.o{transform:translateX(0);}
.mob a{text-decoration:none;color:var(--soft);font-size:1.05rem;font-weight:500;padding:13px 0;border-bottom:1px solid var(--border);transition:color .18s,padding-left .18s;display:flex;align-items:center;gap:10px;cursor:pointer;}
.mob a:hover{color:var(--txt);padding-left:8px;}
.mob .mcta{border:none;margin-top:18px;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;padding:15px 24px;border-radius:12px;justify-content:center;font-family:var(--head);font-weight:700;font-size:.95rem;}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:540;opacity:0;pointer-events:none;transition:opacity .28s;}
.ov.o{opacity:1;pointer-events:all;}
@media(max-width:768px){.nl,.ncta{display:none}.ham{display:flex}}

.chip{display:inline-flex;align-items:center;gap:8px;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.2);border-radius:100px;padding:7px 22px;font-size:.72rem;font-weight:600;color:var(--c);letter-spacing:.1em;text-transform:uppercase;margin-bottom:20px;}
.cdot{width:6px;height:6px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);animation:pp 1.5s infinite;flex-shrink:0;}
.gt{background:linear-gradient(130deg,var(--c) 0%,var(--v) 55%,var(--r) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

/* STAGE */
.stage{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:100px clamp(20px,5vw,48px) 60px;position:relative;z-index:2;}

.auth-wrap{display:flex;flex-direction:column;align-items:center;text-align:center;max-width:440px;width:100%;opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1);}
.auth-wrap.in{opacity:1;transform:translateY(0);}

.auth-title{font-family:var(--head);font-size:clamp(1.9rem,4.5vw,2.6rem);font-weight:800;letter-spacing:-.04em;line-height:1.1;color:var(--txt);margin-bottom:10px;}
.auth-sub{font-size:.92rem;color:var(--soft);margin-bottom:32px;max-width:320px;line-height:1.75;}

/* FORM CARD */
.auth-form{
  width:100%;
  background:rgba(11,16,24,.85);
  border:1px solid var(--border);
  border-radius:20px;
  padding:32px 28px;
  display:flex;flex-direction:column;gap:18px;
  backdrop-filter:blur(12px);
  margin-bottom:20px;
  box-shadow:0 24px 64px rgba(0,0,0,.35);
}

.field-group{display:flex;flex-direction:column;gap:7px;text-align:left;}
.field-label{font-size:.78rem;font-weight:600;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;}
.field-input{
  width:100%;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;
  color:var(--txt);font-family:var(--body);font-size:.95rem;padding:12px 16px;
  transition:border-color .2s,box-shadow .2s;outline:none;
}
.field-input::placeholder{color:var(--muted);}
.field-input:focus{border-color:rgba(0,229,255,.45);box-shadow:0 0 0 3px rgba(0,229,255,.08);}

.submit-btn{
  position:relative;display:flex;align-items:center;justify-content:center;gap:10px;
  background:linear-gradient(135deg,var(--c),var(--v));
  color:#fff;font-family:var(--head);font-weight:800;font-size:1rem;
  padding:14px 32px;border-radius:12px;border:none;cursor:pointer;
  letter-spacing:.01em;margin-top:4px;
  box-shadow:0 0 32px rgba(0,229,255,.22),0 8px 28px rgba(123,92,250,.18);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s,opacity .25s;
  overflow:hidden;
}
.submit-btn:hover:not(.loading){transform:translateY(-3px) scale(1.02);box-shadow:0 0 52px rgba(0,229,255,.38),0 14px 40px rgba(123,92,250,.28);}
.submit-btn.loading{opacity:.6;cursor:not-allowed;}
.btn-glow{position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.18) 50%,transparent 60%);transform:translateX(-100%);transition:transform .55s ease;pointer-events:none;}
.submit-btn:hover:not(.loading) .btn-glow{transform:translateX(100%);}

.switch-text{font-size:.88rem;color:var(--muted);}
.switch-link{color:var(--c);cursor:pointer;font-weight:600;text-decoration:none;transition:opacity .18s;}
.switch-link:hover{opacity:.75;}

@media(max-width:480px){
  .auth-title{font-size:1.7rem;}
  .auth-form{padding:24px 18px;}
  .submit-btn{padding:13px 24px;font-size:.9rem;}
}
`;