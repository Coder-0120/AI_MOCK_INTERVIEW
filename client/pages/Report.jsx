import { useState, useEffect, useRef, useCallback } from "react";

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
    const mkp = () => ({ x:rnd(0,W),y:rnd(0,H),vx:rnd(-.28,.28),vy:rnd(-.22,.22),r:rnd(1,2.5),col:COLS[Math.floor(rnd(0,COLS.length))],a:rnd(.25,.65),ph:rnd(0,Math.PI*2),ps:rnd(.008,.018) });
    const resize = () => { W=cv.width=window.innerWidth; H=cv.height=window.innerHeight; };
    const init = () => { resize(); P=Array.from({length:Math.min(120,Math.floor(W/10))},mkp); };
    const aurora = () => {
      t+=.0018;
      [[0,0,W,H*.55,`rgba(0,229,255,${.028+Math.sin(t)*.009})`,.4+Math.sin(t)*.07],[W,H,0,H*.25,`rgba(123,92,250,${.022+Math.cos(t*.75)*.008})`,.5+Math.cos(t*.75)*.09]].forEach(([x1,y1,x2,y2,col,stop])=>{
        const g=ctx.createLinearGradient(x1,y1,x2,y2); g.addColorStop(0,"transparent"); g.addColorStop(stop,col); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      });
      [{x:W*.82,y:H*.12,r:280,c:"rgba(0,229,255,.035)"},{x:W*.14,y:H*.78,r:220,c:"rgba(123,92,250,.04)"},{x:W*.5,y:H*.45,r:160,c:"rgba(245,200,66,.018)"}].forEach(({x,y,r,c})=>{
        const pr=r+Math.sin(t*1.3)*25; const g=ctx.createRadialGradient(x,y,0,x,y,pr);
        g.addColorStop(0,c); g.addColorStop(1,"transparent"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,pr,0,Math.PI*2); ctx.fill();
      });
    };
    const frame = () => {
      ctx.clearRect(0,0,W,H); aurora();
      for(let i=0;i<P.length;i++){
        for(let j=i+1;j<P.length;j++){
          const p=P[i],q=P[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
          if(d<110){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle=`rgba(0,229,255,${(1-d/110)*.1})`; ctx.lineWidth=.55; ctx.stroke(); }
        }
        const p=P[i],md=Math.hypot(p.x-mouse.x,p.y-mouse.y);
        if(md<130){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(mouse.x,mouse.y); ctx.strokeStyle=`rgba(123,92,250,${(1-md/130)*.28})`; ctx.lineWidth=.75; ctx.stroke(); }
      }
      P.forEach(p=>{
        p.ph+=p.ps; const a=p.a*(.68+.32*Math.sin(p.ph));
        const[R,G,B]=hexRgb(p.col); ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${R},${G},${B},${a})`; ctx.shadowBlur=7; ctx.shadowColor=p.col; ctx.fill(); ctx.shadowBlur=0;
        const dx2=p.x-mouse.x,dy2=p.y-mouse.y,md2=Math.hypot(dx2,dy2);
        if(md2<85){const f=(85-md2)/85*.35; p.vx+=(dx2/md2)*f; p.vy+=(dy2/md2)*f;}
        const spd=Math.hypot(p.vx,p.vy);
        if(spd>.75){p.vx*=.93;p.vy*=.93;} if(spd<.08){p.vx+=rnd(-.008,.008);p.vy+=rnd(-.008,.008);}
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

/* ─── COUNT-UP HOOK (triggers on scroll into view) ─── */
function useCountUp(target,duration=1500,decimals=0){
  const [val,setVal]=useState(0);
  const [go,setGo]=useState(false);
  const start=useCallback(()=>{if(!go)setGo(true);},[go]);
  useEffect(()=>{
    if(!go)return;
    let s=0; const step=target/(duration/16);
    const id=setInterval(()=>{
      s=Math.min(s+step,target);
      setVal(decimals?parseFloat(s.toFixed(decimals)):Math.floor(s));
      if(s>=target)clearInterval(id);
    },16);
    return()=>clearInterval(id);
  },[go,target,duration,decimals]);
  return [val,start];
}

/* ─── SCROLL REVEAL HOOK ─── */
function useReveal(threshold=0.12){
  const ref=useRef(null);
  const [vis,setVis]=useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold});
    obs.observe(el);
    return()=>obs.disconnect();
  },[threshold]);
  return [ref,vis];
}

/* ─── STAT ITEM with scroll-triggered count-up ─── */
function StatItem({target,suffix,label,decimals=0,delay=0}){
  const [val,start]=useCountUp(target,1500,decimals);
  const [ref,vis]=useReveal(.3);
  useEffect(()=>{if(vis)setTimeout(start,delay);},[vis,delay,start]);
  return(
    <div ref={ref} className="stat-item" style={{
      opacity:vis?1:0,
      transform:vis?"translateY(0) scale(1)":"translateY(30px) scale(.82)",
      transition:`opacity .7s ${delay}ms cubic-bezier(.34,1.2,.64,1), transform .7s ${delay}ms cubic-bezier(.34,1.56,.64,1)`
    }}>
      <div className="stat-num">
        <span className="cnt">{val}</span><em>{suffix}</em>
      </div>
      <div className="stat-lbl">{label}</div>
    </div>
  );
}

/* ─── REVEAL WRAPPER ─── */
function RV({children,delay=0,dir="up"}){
  const [ref,vis]=useReveal();
  const from={up:"translateY(32px)",left:"translateX(-32px)",right:"translateX(32px)"};
  return(
    <div ref={ref} style={{opacity:vis?1:0,transform:vis?"translate(0)":from[dir],transition:`opacity .6s ${delay}ms cubic-bezier(.4,0,.2,1), transform .6s ${delay}ms cubic-bezier(.4,0,.2,1)`}}>
      {children}
    </div>
  );
}

/* ─── MARQUEE ─── */
const MQ=["AI Evaluation","Emotion Detection","Voice Analysis","Role-Based Questions","Real-Time Feedback","Performance Reports","NLP Powered","Adaptive AI"];

/* ─── STEP CARD ─── */
function StepCard({num,icon,title,desc,delay}){
  const [ref,vis]=useReveal();
  return(
    <div ref={ref} className="step-card" style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(36px)",transition:`opacity .6s ${delay}ms, transform .6s ${delay}ms cubic-bezier(.4,0,.2,1)`}}>
      <div className="step-num">{num}</div>
      <div className="step-ico">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

/* ─── FEAT CARD ─── */
function FeatCard({icon,title,desc,tag,tc}){
  return(
    <div className="feat-card">
      <div className="feat-ico">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <span className={`ftag ${tc}`}>{tag}</span>
    </div>
  );
}

/* ─── ANIMATED BAR ─── */
function AnimBar({label,pct,grad}){
  const [ref,vis]=useReveal(.1);
  return(
    <div className="bar-row" ref={ref}>
      <span className="bar-lbl">{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{width:vis?`${pct}%`:"0%",background:grad,transition:"width 1.4s cubic-bezier(.4,0,.2,1)"}}/>
      </div>
      <span className="bar-pct">{pct}%</span>
    </div>
  );
}

/* ─── TESTI CARD ─── */
function TestiCard({stars,text,name,role,av,initials,delay}){
  const [ref,vis]=useReveal();
  return(
    <div ref={ref} className="t-card" style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(36px)",transition:`opacity .6s ${delay}ms, transform .6s ${delay}ms cubic-bezier(.4,0,.2,1)`}}>
      <div className="t-quote">"</div>
      <div className="stars">{"★".repeat(stars)}{"☆".repeat(5-stars)}</div>
      <p className="t-text">{text}</p>
      <div className="t-author">
        <div className={`tav ${av}`}>{initials}</div>
        <div><div className="av-name">{name}</div><div className="av-role">{role}</div></div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════ */
export default function LandingPage(){
  const [scrolled,setScrolled]=useState(false);
  const [mobOpen,setMobOpen]=useState(false);
  const [active,setActive]=useState("");

  useEffect(()=>{
    const fn=()=>{
      setScrolled(window.scrollY>20);
      ["how","features","demo","testi"].forEach(id=>{
        const el=document.getElementById(id);
        if(el){const t=el.getBoundingClientRect().top;if(t<110&&t>-el.offsetHeight*.5)setActive(id);}
      });
    };
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  const go=id=>{setMobOpen(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"});};

  return(
    <>
      <style>{CSS}</style>
      <ParticleCanvas/>
      <Cursor/>

      {/* NAV */}
      <nav className={`nav ${scrolled?"sc":""}`}>
        <div className="ni">
          <a className="logo" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}><span className="ldot"/>InterviewAI</a>
          <ul className="nl">
            {[["how","How It Works"],["features","Features"],["demo","Demo"],["testi","Reviews"]].map(([id,lbl])=>(
              <li key={id}><a className={active===id?"act":""} onClick={()=>go(id)}>{lbl}</a></li>
            ))}
          </ul>
          <button className="ncta" onClick={()=>go("cta")}>Start Free →</button>
          <button className={`ham ${mobOpen?"o":""}`} onClick={()=>setMobOpen(!mobOpen)}><span/><span/><span/></button>
        </div>
      </nav>
      <div className={`ov ${mobOpen?"o":""}`} onClick={()=>setMobOpen(false)}/>
      <div className={`mob ${mobOpen?"o":""}`}>
        {[["how","🎯","How It Works"],["features","✨","Features"],["demo","🖥️","Demo"],["testi","⭐","Reviews"]].map(([id,e,lbl])=>(
          <a key={id} onClick={()=>go(id)}>{e} {lbl}</a>
        ))}
        <a className="mcta" onClick={()=>go("cta")}>🎤 Start Free Interview</a>
      </div>

      {/* ── HERO ── */}
      <section id="hero">
        <div className="hi">
          <div className="chip"><span className="cdot"/>AI-Powered Interview Platform</div>
          <h1 className="hh">
            Ace Every Interview
            <span className="gt">With AI Precision</span>
          </h1>
          <p className="hd">Practice with an AI that reads your voice, face, and answers simultaneously — then tells you exactly what to fix. Land the job you deserve.</p>
          <div className="hbtns">
            <button className="bf" onClick={()=>go("cta")}>🎤 Start Mock Interview</button>
            <button className="bg" onClick={()=>go("demo")}>▶ Watch Demo</button>
          </div>
          {/* Stats box — numbers animate when scrolled into view */}
          <div className="hstats">
            <StatItem target={50}  suffix="K+" label="Interviews Done"  delay={0}/>
            <StatItem target={89}  suffix="%" label="Placement Rate"   delay={140}/>
            <StatItem target={30}  suffix="+" label="Roles Covered"    delay={280}/>
            <StatItem target={4.8} suffix="★" label="Avg Rating" decimals={1} delay={420}/>
          </div>
        </div>
        <div className="sc-cue"><div className="sc-line"/><span className="sc-txt">Scroll</span></div>
      </section>

      {/* MARQUEE */}
      <div className="mw">
        <div className="mt">
          {[...MQ,...MQ,...MQ,...MQ].map((t,i)=>(
            <div className="mi" key={i}>{t}<span className="ms">◆</span></div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="wrap">
          <RV><span className="slb">Process</span></RV>
          <RV delay={60}><h2 className="st">How InterviewAI Works</h2></RV>
          <RV delay={120}><p className="ss">Four intelligent layers running in real-time to give you the most realistic interview simulation possible.</p></RV>
          <div className="steps">
            <StepCard num="01" icon="🎯" title="Choose Your Role" desc="Pick SDE, HR, Product Manager, Data Science and more. Every question is tailored to your exact target job." delay={40}/>
            <StepCard num="02" icon="🤖" title="AI Interviews You" desc="Dynamic adaptive questions that evolve with your responses. Harder follow-ups when you excel, supportive probes when you struggle." delay={120}/>
            <StepCard num="03" icon="🔬" title="Multi-Layer Analysis" desc="Simultaneously analyzes what you say via NLP, how you say it via voice AI, and how you look via facial expression detection." delay={200}/>
            <StepCard num="04" icon="📊" title="Detailed Report" desc="A comprehensive PDF with scores, weakness identification, and a personalized step-by-step improvement roadmap." delay={280}/>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="wrap">
          <RV><span className="slb">Capabilities</span></RV>
          <RV delay={60}><h2 className="st">Everything You Need to Succeed</h2></RV>
          <RV delay={120}><p className="ss">From answer quality to confidence signals — we evaluate the complete picture of your performance.</p></RV>
          <RV delay={180}>
            <div className="fg">
              <FeatCard icon="🧠" title="Answer Intelligence" desc="NLP engine scores your answers on relevance, structure, clarity, and depth. Suggests stronger examples and better phrasing." tag="NLP" tc="tc"/>
              <FeatCard icon="😀" title="Emotion Detection" desc="Real-time webcam analysis detects confidence, anxiety, confusion, and engagement levels throughout your session." tag="Computer Vision" tc="tv"/>
              <FeatCard icon="🎙️" title="Voice Confidence" desc="Detects filler words, speaking pace, hesitation pauses, and vocal tone to give you an accurate confidence score." tag="Audio AI" tc="tr"/>
              <FeatCard icon="🎤" title="Dynamic Questions" desc="Industry-relevant questions generated in real-time, adapting difficulty and focus based on how you answered before." tag="Adaptive AI" tc="tc"/>
              <FeatCard icon="📈" title="Performance Dashboard" desc="Visual breakdown of overall score, communication strengths, technical gaps, and a clear improvement roadmap." tag="Analytics" tc="tg"/>
              <FeatCard icon="🔁" title="Progress Tracking" desc="Track growth across sessions and see exactly how your confidence, clarity, and technical depth improve over time." tag="Growth" tc="tv"/>
            </div>
          </RV>
        </div>
      </section>

      {/* DEMO */}
      <section id="demo">
        <div className="wrap">
          <div className="dw">
            <RV dir="left">
              <span className="slb">Live Demo</span>
              <h2 className="st">See the AI<br/>In Action</h2>
              <p className="ss">Every dimension of your performance analyzed simultaneously, in real time.</p>
              <ul className="cl">
                {["Facial confidence scoring via webcam, live","Filler word count detected as you speak","Answer quality scored out of 100 instantly","Instant actionable feedback after every answer","Exportable PDF performance report on session end"].map((t,i)=>(
                  <li key={i}><span className="ck">✓</span>{t}</li>
                ))}
              </ul>
              <button className="bf" onClick={()=>go("cta")}>Try It Now →</button>
            </RV>
            <RV dir="right">
              <div className="mkp">
                <div className="mkb">
                  <div className="d dr"/><div className="d dy"/><div className="d dg"/>
                  <span className="mklb">InterviewAI — SDE Mock Session</span>
                  <span className="rec"><span className="rdot"/>REC</span>
                </div>
                <div className="mkbd">
                  <div className="qc">
                    <div className="ql">Question 3 of 8 · Technical</div>
                    <div className="qt">Explain the difference between synchronous and asynchronous JavaScript with a real-world example.</div>
                  </div>
                  <div className="mr2">
                    <div className="mb"><div className="mv vc">87</div><div className="ml2">Answer Score</div></div>
                    <div className="mb"><div className="mv vv">74%</div><div className="ml2">Confidence</div></div>
                    <div className="mb"><div className="mv vg">B+</div><div className="ml2">Grade</div></div>
                  </div>
                  <div className="bars">
                    <AnimBar label="Relevance"   pct={92} grad="linear-gradient(90deg,var(--c),var(--v))"/>
                    <AnimBar label="Clarity"     pct={80} grad="linear-gradient(90deg,var(--v),var(--r))"/>
                    <AnimBar label="Filler Words" pct={65} grad="linear-gradient(90deg,var(--gold),var(--r))"/>
                    <AnimBar label="Eye Contact"  pct={88} grad="linear-gradient(90deg,var(--g),var(--c))"/>
                  </div>
                  <div style={{marginTop:13}}>
                    <div style={{fontSize:".63rem",color:"var(--muted)",textTransform:"uppercase",letterSpacing:".09em",marginBottom:7}}>Detected Emotions</div>
                    <div className="er">
                      <span className="em ea">😊 Confident</span>
                      <span className="em ei">😰 Nervous</span>
                      <span className="em ea">🧐 Focused</span>
                      <span className="em ei">😕 Confused</span>
                    </div>
                  </div>
                </div>
              </div>
            </RV>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testi">
        <div className="wrap">
          <RV><span className="slb">Testimonials</span></RV>
          <RV delay={60}><h2 className="st">Students Who Landed the Job</h2></RV>
          <RV delay={120}><p className="ss">Real stories from users who transformed their interview performance with InterviewAI.</p></RV>
          <div className="tg2">
            <TestiCard stars={5} text="After three sessions I could see my filler word count drop from 28 to 6. The emotion feedback was eye-opening — I had no idea I looked so anxious on camera." name="Riya Kapoor" role="SDE at Flipkart" av="a1" initials="RK" delay={40}/>
            <TestiCard stars={5} text="The role-based questions were spot-on. It asked almost exactly what came up in my actual Google interview. The AI helped me structure perfect STAR answers." name="Arjun Verma" role="Product Manager at Google" av="a2" initials="AV" delay={120}/>
            <TestiCard stars={4} text="As a fresher with zero experience, InterviewAI felt like practicing with a real interviewer. The confidence score kept pushing me until I hit 90% consistently." name="Priya Sharma" role="Data Analyst at TCS" av="a3" initials="PS" delay={200}/>
            <TestiCard stars={5} text="The performance PDF is incredible. I shared it with my placement officer and she was amazed. It pinpoints exactly what to work on for each specific role." name="Mihir Nair" role="Backend Dev at Razorpay" av="a4" initials="MN" delay={280}/>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" style={{padding:"clamp(72px,12vw,130px) clamp(20px,5vw,48px)",textAlign:"center"}}>
        <RV>
          <div className="cbox">
            <h2>Your Dream Job Starts<br/>with a Better Interview</h2>
            <p>Join thousands of students who transformed their confidence and communication skills. Start your first AI mock interview — free, right now.</p>
            <button className="bf" style={{fontSize:"1rem",padding:"15px 44px"}}>🎤 Begin Free Interview</button>
          </div>
        </RV>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="fi">
          <div className="fb">
            <a className="logo" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}><span className="ldot"/>InterviewAI</a>
            <p>AI mock interviews that analyze voice, face, and answers — giving you the edge in every job hunt.</p>
            <div className="fsc"><a>𝕏</a><a>in</a><a>⬡</a><a>◎</a></div>
          </div>
          <div className="fc"><h4>Product</h4><ul>{["Features","Demo","Changelog","Roadmap"].map(t=><li key={t}><a>{t}</a></li>)}</ul></div>
          <div className="fc"><h4>Roles</h4><ul>{["SDE / Backend","Product Manager","Data Science","HR & Soft Skills"].map(t=><li key={t}><a>{t}</a></li>)}</ul></div>
          <div className="fc"><h4>Company</h4><ul>{["About","Blog","Careers","Contact"].map(t=><li key={t}><a>{t}</a></li>)}</ul></div>
        </div>
        <div className="fbot">
          <span>© 2025 InterviewAI. All rights reserved.</span>
          <div style={{display:"flex",gap:18,flexWrap:"wrap"}}><a>Privacy Policy</a><a>Terms of Service</a></div>
        </div>
      </footer>
    </>
  );
}

/* ══════════════════
   ALL CSS
══════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#060910;--bg2:#0b1018;--bg3:#111827;
  --c:#00e5ff;--v:#7b5cfa;--r:#ff6b6b;--g:#4ade80;--gold:#f5c842;
  --txt:#e8edf5;--muted:#6b7a96;--soft:#9ca3b8;
  --border:rgba(255,255,255,0.06);
  --head:'Syne',sans-serif;--body:'DM Sans',sans-serif;
}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--txt);font-family:var(--body);font-size:16px;line-height:1.7;overflow-x:hidden;cursor:none}
@media(max-width:640px){body{cursor:auto}}

/* CURSOR */
.cur-dot{position:fixed;width:10px;height:10px;background:var(--c);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .15s,height .15s,background .15s;mix-blend-mode:screen}
.cur-ring{position:fixed;width:34px;height:34px;border:1.5px solid rgba(0,229,255,.35);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:width .15s,height .15s,border-color .15s}
body.cur-hov .cur-dot{width:18px;height:18px;background:var(--v)}
body.cur-hov .cur-ring{width:50px;height:50px;border-color:var(--v)}
@media(max-width:640px){.cur-dot,.cur-ring{display:none}}

/* LAYOUT */
section,nav,footer{position:relative;z-index:1}
.wrap{max-width:860px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}

/* NAV */
.nav{position:fixed;top:0;left:0;right:0;z-index:500;padding:0 clamp(16px,4vw,40px);transition:background .35s,border-color .35s}
.nav.sc{background:rgba(6,9,16,.88);backdrop-filter:blur(24px);border-bottom:1px solid var(--border)}
.ni{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px}
.logo{font-family:var(--head);font-weight:800;font-size:1.28rem;letter-spacing:-.03em;text-decoration:none;color:var(--txt);display:flex;align-items:center;gap:10px;cursor:pointer;transition:opacity .2s;background:none;border:none}
.logo:hover{opacity:.8}
.ldot{width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);animation:pp 2s ease-in-out infinite;flex-shrink:0}
@keyframes pp{0%,100%{box-shadow:0 0 6px var(--c);transform:scale(1)}50%{box-shadow:0 0 22px var(--c);transform:scale(1.35)}}
.nl{display:flex;gap:2px;list-style:none;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:100px;padding:4px}
.nl a{display:block;text-decoration:none;color:var(--muted);font-size:.84rem;font-weight:500;padding:7px 17px;border-radius:100px;transition:color .2s,background .2s;white-space:nowrap;cursor:pointer}
.nl a:hover,.nl a.act{color:var(--txt);background:rgba(255,255,255,.08)}
.ncta{font-family:var(--head);font-weight:700;font-size:.84rem;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;padding:9px 24px;border-radius:100px;letter-spacing:.01em;box-shadow:0 0 20px rgba(0,229,255,.22);transition:transform .2s,box-shadow .2s;white-space:nowrap;cursor:pointer;border:none}
.ncta:hover{transform:translateY(-2px);box-shadow:0 0 36px rgba(0,229,255,.42)}
.ham{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:6px;border:none;background:none;z-index:600}
.ham span{display:block;width:22px;height:2px;background:var(--txt);border-radius:2px;transition:transform .3s,opacity .3s;transform-origin:center}
.ham.o span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.ham.o span:nth-child(2){opacity:0;transform:scaleX(0)}
.ham.o span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mob{position:fixed;top:0;right:0;bottom:0;width:min(310px,85vw);background:rgba(8,12,20,.97);backdrop-filter:blur(32px);border-left:1px solid var(--border);z-index:550;transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);padding:96px 32px 40px;display:flex;flex-direction:column;gap:6px}
.mob.o{transform:translateX(0)}
.mob a{text-decoration:none;color:var(--soft);font-size:1.05rem;font-weight:500;padding:13px 0;border-bottom:1px solid var(--border);transition:color .18s,padding-left .18s;display:flex;align-items:center;gap:10px;cursor:pointer}
.mob a:hover{color:var(--txt);padding-left:8px}
.mob .mcta{border:none;margin-top:18px;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;padding:15px 24px;border-radius:12px;justify-content:center;font-family:var(--head);font-weight:700;font-size:.95rem}
.ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:540;opacity:0;pointer-events:none;transition:opacity .28s}
.ov.o{opacity:1;pointer-events:all}
@media(max-width:768px){.nl,.ncta{display:none}.ham{display:flex}}

/* HERO */
#hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;padding:120px clamp(20px,5vw,48px) 80px;position:relative}
.hi{max-width:700px;margin:0 auto}

.chip{display:inline-flex;align-items:center;gap:8px;background:rgba(0,229,255,.07);border:1px solid rgba(0,229,255,.2);border-radius:100px;padding:7px 22px;font-size:.72rem;font-weight:600;color:var(--c);letter-spacing:.1em;text-transform:uppercase;margin-bottom:34px;animation:fu .7s .1s both}
.cdot{width:6px;height:6px;border-radius:50%;background:var(--c);box-shadow:0 0 8px var(--c);animation:pp 1.5s infinite;flex-shrink:0}
@keyframes fu{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}

h1.hh{font-family:var(--head);font-size:clamp(2.6rem,6.5vw,5rem);font-weight:800;line-height:1.04;letter-spacing:-.045em;margin-bottom:24px;animation:fu .7s .22s both}
.gt{background:linear-gradient(130deg,var(--c) 0%,var(--v) 55%,var(--r) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;filter:drop-shadow(0 0 40px rgba(0,229,255,.22))}

.hd{font-size:clamp(.93rem,1.8vw,1.08rem);color:var(--soft);max-width:520px;margin:0 auto 40px;font-weight:400;line-height:1.82;animation:fu .7s .36s both}

.hbtns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;animation:fu .7s .5s both}
.bf{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;font-family:var(--head);font-weight:700;font-size:.94rem;padding:14px 34px;border-radius:14px;box-shadow:0 0 30px rgba(0,229,255,.22),0 8px 24px rgba(123,92,250,.18);transition:transform .22s,box-shadow .22s;letter-spacing:.01em;cursor:pointer;border:none}
.bf:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 0 52px rgba(0,229,255,.38),0 18px 40px rgba(123,92,250,.28)}
.bg{display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.14);color:var(--txt);font-family:var(--head);font-weight:600;font-size:.94rem;padding:14px 34px;border-radius:14px;backdrop-filter:blur(8px);transition:border-color .22s,background .22s,transform .22s;cursor:pointer;background:transparent}
.bg:hover{border-color:rgba(0,229,255,.4);background:rgba(0,229,255,.06);transform:translateY(-3px)}

/* STATS (scroll-triggered count-up) */
.hstats{display:flex;justify-content:center;gap:clamp(20px,5vw,56px);flex-wrap:wrap;
  margin:60px auto 0;padding:28px clamp(18px,4vw,40px);max-width:580px;
  background:rgba(255,255,255,.024);border:1px solid var(--border);
  border-radius:22px;backdrop-filter:blur(12px);animation:fu .7s .65s both}
.stat-item{text-align:center}
.stat-num{font-family:var(--head);font-size:clamp(1.9rem,4.5vw,2.8rem);font-weight:800;letter-spacing:-.05em;line-height:1;display:flex;align-items:baseline;justify-content:center;gap:1px}
.cnt{background:linear-gradient(160deg,#fff 20%,rgba(255,255,255,.5));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-num em{font-style:normal;color:var(--c);-webkit-text-fill-color:var(--c);font-size:clamp(1.15rem,3vw,1.85rem)}
.stat-lbl{font-size:.68rem;color:var(--muted);margin-top:6px;letter-spacing:.07em;text-transform:uppercase}

/* SCROLL CUE */
.sc-cue{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;animation:fu .7s 1.1s both}
.sc-line{width:1px;height:44px;background:linear-gradient(to bottom,var(--c),transparent);animation:scl 2s ease-in-out infinite}
@keyframes scl{0%,100%{opacity:.22;transform:scaleY(.6)}50%{opacity:1;transform:scaleY(1)}}
.sc-txt{font-size:.6rem;color:var(--muted);letter-spacing:.15em;text-transform:uppercase}

/* MARQUEE */
.mw{overflow:hidden;padding:18px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:rgba(255,255,255,.012)}
.mt{display:flex;width:max-content;animation:mr 24s linear infinite}
.mt:hover{animation-play-state:paused}
.mi{white-space:nowrap;padding:0 26px;font-family:var(--head);font-size:.78rem;font-weight:700;color:var(--muted);letter-spacing:.07em;text-transform:uppercase;display:flex;align-items:center;gap:14px;transition:color .2s}
.mi:hover{color:var(--c)}
.ms{color:var(--c);opacity:.4}
@keyframes mr{to{transform:translateX(-50%)}}

/* SECTION COMMON */
section{padding:clamp(68px,10vw,116px) 0}
.slb{display:inline-block;font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c);font-weight:600;margin-bottom:13px}
.st{font-family:var(--head);font-size:clamp(1.75rem,3.8vw,2.8rem);font-weight:800;letter-spacing:-.035em;line-height:1.1;margin-bottom:16px}
.ss{font-size:.97rem;color:var(--soft);max-width:480px;line-height:1.78}

/* HOW IT WORKS */
#how{background:var(--bg2)}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px;margin-top:52px}
.step-card{background:var(--bg3);border:1px solid var(--border);border-radius:18px;padding:30px 24px;position:relative;overflow:hidden;transition:transform .24s,border-color .24s,box-shadow .24s}
.step-card::after{content:'';position:absolute;inset:0;border-radius:18px;background:linear-gradient(135deg,rgba(0,229,255,.05),transparent);opacity:0;transition:opacity .24s}
.step-card:hover{transform:translateY(-8px);border-color:rgba(0,229,255,.3);box-shadow:0 0 36px rgba(0,229,255,.1)}
.step-card:hover::after{opacity:1}
.step-num{font-family:var(--head);font-size:2.8rem;font-weight:800;color:rgba(0,229,255,.06);line-height:1;margin-bottom:14px;transition:color .24s}
.step-card:hover .step-num{color:rgba(0,229,255,.16)}
.step-ico{width:44px;height:44px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:16px;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.16)}
.step-card h3{font-family:var(--head);font-weight:700;font-size:.97rem;margin-bottom:8px;letter-spacing:-.01em}
.step-card p{font-size:.83rem;color:var(--muted);line-height:1.66}

/* FEATURES */
#features{background:var(--bg)}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1px;margin-top:52px;background:var(--border);border:1px solid var(--border);border-radius:22px;overflow:hidden}
.feat-card{background:var(--bg2);padding:34px 28px;position:relative;overflow:hidden;transition:background .24s}
.feat-card:hover{background:var(--bg3)}
.feat-card::before{content:'';position:absolute;bottom:0;left:0;height:2px;width:0;background:linear-gradient(90deg,var(--c),var(--v));transition:width .34s}
.feat-card:hover::before{width:100%}
.feat-ico{width:48px;height:48px;border-radius:13px;display:flex;align-items:center;justify-content:center;font-size:1.38rem;margin-bottom:18px;background:linear-gradient(135deg,rgba(0,229,255,.08),rgba(123,92,250,.08));border:1px solid rgba(0,229,255,.11)}
.feat-card h3{font-family:var(--head);font-weight:700;font-size:.97rem;margin-bottom:9px;letter-spacing:-.01em}
.feat-card p{font-size:.83rem;color:var(--muted);line-height:1.66}
.ftag{display:inline-block;margin-top:13px;font-size:.65rem;letter-spacing:.07em;text-transform:uppercase;padding:3px 10px;border-radius:100px;font-weight:600}
.tc{background:rgba(0,229,255,.09);color:var(--c)}.tv{background:rgba(123,92,250,.1);color:#a78bfa}.tr{background:rgba(255,107,107,.09);color:#ff6b6b}.tg{background:rgba(245,200,66,.09);color:var(--gold)}

/* DEMO */
#demo{background:var(--bg2)}
.dw{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,6vw,70px);align-items:center}
@media(max-width:820px){.dw{grid-template-columns:1fr}}
.cl{list-style:none;margin:20px 0 28px}
.cl li{display:flex;align-items:flex-start;gap:12px;font-size:.87rem;color:var(--soft);margin-bottom:12px}
.ck{width:19px;height:19px;min-width:19px;border-radius:50%;background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.24);display:flex;align-items:center;justify-content:center;font-size:.6rem;color:var(--c);margin-top:3px}
.mkp{background:var(--bg3);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.55),0 0 50px rgba(0,229,255,.06);animation:fl 7s ease-in-out infinite}
@keyframes fl{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(.35deg)}}
.mkb{background:rgba(255,255,255,.03);border-bottom:1px solid var(--border);padding:11px 17px;display:flex;align-items:center;gap:6px}
.d{width:8px;height:8px;border-radius:50%}.dr{background:#ff5f57}.dy{background:#febc2e}.dg{background:#28c840}
.mklb{margin-left:9px;font-size:.68rem;color:var(--muted)}
.rec{margin-left:auto;display:inline-flex;align-items:center;gap:5px;background:rgba(255,107,107,.1);border:1px solid rgba(255,107,107,.22);border-radius:100px;padding:3px 9px;font-size:.66rem;color:#ff6b6b;font-weight:600}
.rdot{width:5px;height:5px;border-radius:50%;background:#ff6b6b;animation:pp 1s infinite}
.mkbd{padding:20px}
.qc{background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.1);border-radius:12px;padding:15px 17px;margin-bottom:15px}
.ql{font-size:.64rem;color:var(--c);text-transform:uppercase;letter-spacing:.09em;margin-bottom:7px}
.qt{font-size:.84rem;font-weight:500;line-height:1.52}
.mr2{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.mb{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center}
.mv{font-family:var(--head);font-size:1.3rem;font-weight:800}.ml2{font-size:.6rem;color:var(--muted);margin-top:2px}
.vc{color:var(--c)}.vv{color:#a78bfa}.vg{color:var(--g)}
.bars{display:flex;flex-direction:column;gap:8px}
.bar-row{display:flex;align-items:center;gap:8px}
.bar-lbl{font-size:.66rem;color:var(--muted);width:76px;flex-shrink:0}
.bar-track{flex:1;height:4px;background:rgba(255,255,255,.05);border-radius:3px;overflow:hidden}
.bar-fill{height:100%;border-radius:3px}
.bar-pct{font-size:.64rem;color:var(--muted);width:26px;text-align:right}
.er{display:flex;gap:5px;flex-wrap:wrap;margin-top:12px}
.em{padding:4px 11px;border-radius:100px;font-size:.68rem;font-weight:500;display:flex;align-items:center;gap:5px}
.ea{background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);color:var(--c)}
.ei{background:rgba(255,255,255,.04);border:1px solid var(--border);color:var(--muted)}

/* TESTIMONIALS */
#testi{background:var(--bg)}
.tg2{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:18px;margin-top:52px}
.t-card{background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:28px 26px;position:relative;overflow:hidden;transition:transform .24s,box-shadow .24s}
.t-card:hover{transform:translateY(-6px);box-shadow:0 0 40px rgba(123,92,250,.14)}
.t-quote{position:absolute;top:8px;right:18px;font-size:4.5rem;color:rgba(123,92,250,.07);font-family:Georgia,serif;line-height:1}
.stars{color:var(--gold);font-size:.78rem;margin-bottom:13px}
.t-text{font-size:.87rem;color:var(--soft);margin-bottom:20px;line-height:1.74;font-style:italic}
.t-author{display:flex;align-items:center;gap:10px}
.tav{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.88rem;font-family:var(--head);flex-shrink:0}
.a1{background:linear-gradient(135deg,var(--c),var(--v));color:#fff}
.a2{background:linear-gradient(135deg,var(--r),var(--gold));color:#fff}
.a3{background:linear-gradient(135deg,var(--v),var(--r));color:#fff}
.a4{background:linear-gradient(135deg,var(--g),var(--c));color:#000}
.av-name{font-weight:600;font-size:.85rem}.av-role{font-size:.73rem;color:var(--muted)}

/* CTA */
.cbox{max-width:640px;margin:0 auto;background:var(--bg2);border:1px solid rgba(0,229,255,.14);border-radius:28px;padding:clamp(44px,8vw,76px) clamp(26px,6vw,60px);position:relative;overflow:hidden;box-shadow:0 0 80px rgba(0,229,255,.04),0 0 80px rgba(123,92,250,.04)}
.cbox::before{content:'';position:absolute;top:-70px;left:50%;transform:translateX(-50%);width:400px;height:250px;background:radial-gradient(ellipse,rgba(0,229,255,.07) 0%,transparent 70%);pointer-events:none}
.cbox h2{font-family:var(--head);font-size:clamp(1.7rem,3.8vw,2.7rem);font-weight:800;letter-spacing:-.035em;line-height:1.1;margin-bottom:14px}
.cbox p{color:var(--soft);margin-bottom:32px;font-size:.97rem;line-height:1.78;max-width:430px;margin-left:auto;margin-right:auto}

/* FOOTER */
footer{background:var(--bg2);border-top:1px solid var(--border);padding:clamp(44px,8vw,72px) clamp(20px,5vw,48px) 28px}
.fi{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:clamp(24px,5vw,52px);margin-bottom:44px}
@media(max-width:720px){.fi{grid-template-columns:1fr 1fr}}
@media(max-width:440px){.fi{grid-template-columns:1fr}}
.fb p{font-size:.83rem;color:var(--muted);margin-top:11px;max-width:230px;line-height:1.74}
.fsc{display:flex;gap:9px;margin-top:17px}
.fsc a{width:33px;height:33px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:.8rem;text-decoration:none;color:var(--muted);transition:border-color .2s,color .2s,background .2s;cursor:pointer}
.fsc a:hover{border-color:rgba(0,229,255,.35);color:var(--c);background:rgba(0,229,255,.05)}
.fc h4{font-family:var(--head);font-size:.78rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--txt);margin-bottom:13px}
.fc ul{list-style:none}.fc li{margin-bottom:9px}
.fc a{text-decoration:none;color:var(--muted);font-size:.83rem;transition:color .2s;cursor:pointer}
.fc a:hover{color:var(--txt)}
.fbot{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border-top:1px solid var(--border);padding-top:20px;font-size:.77rem;color:var(--muted)}
.fbot a{color:var(--muted);text-decoration:none;transition:color .2s;cursor:pointer}
.fbot a:hover{color:var(--txt)}

/* RESPONSIVE */
@media(max-width:520px){
  h1.hh{font-size:clamp(2rem,9vw,2.8rem);letter-spacing:-.03em}
  .hd,.ss,.step-card p,.feat-card p,.t-text,.cl li{font-size:.82rem;line-height:1.7}
  .st{font-size:clamp(1.5rem,6.5vw,2rem)}
  .wrap{padding:0 16px}
  .hbtns{flex-direction:column;align-items:center}
  .bf,.bg{width:100%;max-width:290px;justify-content:center}
  .steps{grid-template-columns:1fr}
  .fg{grid-template-columns:1fr}
  .tg2{grid-template-columns:1fr}
  .hstats{gap:16px;padding:20px 16px}
  .stat-num{font-size:1.55rem}
  .stat-num em{font-size:1rem}
  .cbox h2{font-size:1.45rem}
  .dw{gap:40px}
}
@media(max-width:360px){
  h1.hh{font-size:1.75rem}
  .hstats{gap:12px}
  .stat-num{font-size:1.3rem}
}
`;