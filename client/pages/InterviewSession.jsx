import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import * as faceapi from "face-api.js";

/* ─── PARTICLE CANVAS ─── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W, H, P, t = 0, raf;
    const mouse = { x: -9999, y: -9999 };
    const COLS = ["#00e5ff", "#7b5cfa", "#4ade80", "#f5c842", "#ff6b6b"];
    const rnd = (a, b) => Math.random() * (b - a) + a;
    const hexRgb = (h) => {
      h = h.replace("#", "");
      return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
    };
    const mkp = () => ({
      x: rnd(0,W), y: rnd(0,H), vx: rnd(-0.22,0.22), vy: rnd(-0.18,0.18),
      r: rnd(1,2.2), col: COLS[Math.floor(rnd(0,COLS.length))],
      a: rnd(0.2,0.55), ph: rnd(0,Math.PI*2), ps: rnd(0.007,0.016),
    });
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    const init = () => { resize(); P = Array.from({ length: Math.min(80, Math.floor(W/14)) }, mkp); };
    const aurora = () => {
      t += 0.0015;
      [[0,0,W,H*0.6,`rgba(0,229,255,${0.025+Math.sin(t)*0.008})`,0.38+Math.sin(t)*0.06],
       [W,H,0,H*0.3,`rgba(123,92,250,${0.02+Math.cos(t*0.75)*0.007})`,0.48+Math.cos(t*0.75)*0.08]
      ].forEach(([x1,y1,x2,y2,col,stop]) => {
        const g = ctx.createLinearGradient(x1,y1,x2,y2);
        g.addColorStop(0,"transparent"); g.addColorStop(stop,col); g.addColorStop(1,"transparent");
        ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      });
    };
    const frame = () => {
      ctx.clearRect(0,0,W,H); aurora();
      for (let i=0;i<P.length;i++) {
        for (let j=i+1;j<P.length;j++) {
          const p=P[i],q=P[j],d=Math.hypot(p.x-q.x,p.y-q.y);
          if (d<100) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle=`rgba(0,229,255,${(1-d/100)*0.07})`; ctx.lineWidth=0.5; ctx.stroke(); }
        }
        const p=P[i],md=Math.hypot(p.x-mouse.x,p.y-mouse.y);
        if (md<120) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(mouse.x,mouse.y); ctx.strokeStyle=`rgba(123,92,250,${(1-md/120)*0.2})`; ctx.lineWidth=0.7; ctx.stroke(); }
      }
      P.forEach((p) => {
        p.ph += p.ps;
        const a = p.a*(0.7+0.3*Math.sin(p.ph));
        const [R,G,B] = hexRgb(p.col);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = `rgba(${R},${G},${B},${a})`; ctx.shadowBlur=6; ctx.shadowColor=p.col; ctx.fill(); ctx.shadowBlur=0;
        const dx2=p.x-mouse.x,dy2=p.y-mouse.y,md2=Math.hypot(dx2,dy2);
        if (md2<80) { const f=((80-md2)/80)*0.3; p.vx+=(dx2/md2)*f; p.vy+=(dy2/md2)*f; }
        const spd=Math.hypot(p.vx,p.vy);
        if (spd>0.65){p.vx*=0.94;p.vy*=0.94;} if(spd<0.06){p.vx+=rnd(-0.007,0.007);p.vy+=rnd(-0.007,0.007);}
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-8)p.x=W+8; if(p.x>W+8)p.x=-8; if(p.y<-8)p.y=H+8; if(p.y>H+8)p.y=-8;
      });
      raf = requestAnimationFrame(frame);
    };
    const onMove=(e)=>{mouse.x=e.clientX;mouse.y=e.clientY;};
    const onLeave=()=>{mouse.x=-9999;mouse.y=-9999;};
    window.addEventListener("resize",init,{passive:true});
    window.addEventListener("mousemove",onMove,{passive:true});
    window.addEventListener("mouseleave",onLeave);
    init(); frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize",init); window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseleave",onLeave); };
  }, []);
  return <canvas ref={ref} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>;
}

/* ─── CURSOR ─── */
function Cursor() {
  const dotRef = useRef(null), ringRef = useRef(null);
  useEffect(() => {
    let mx=0,my=0,rx=0,ry=0,raf;
    const dot=dotRef.current,ring=ringRef.current;
    const onMove=(e)=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+"px";dot.style.top=my+"px";};
    const loop=()=>{rx+=(mx-rx)*0.14;ry+=(my-ry)*0.14;ring.style.left=rx+"px";ring.style.top=ry+"px";raf=requestAnimationFrame(loop);};
    document.addEventListener("mousemove",onMove,{passive:true}); loop();
    return ()=>{cancelAnimationFrame(raf);document.removeEventListener("mousemove",onMove);};
  }, []);
  return (<><div ref={dotRef} className="cur-dot"/><div ref={ringRef} className="cur-ring"/></>);
}

/* ─── SCORE RING ─── */
function ScoreRing({ score }) {
  const pct=(score/10)*100,r=54,circ=2*Math.PI*r,offset=circ-(pct/100)*circ;
  const color=score>=8?"#4ade80":score>=6?"#00e5ff":score>=4?"#f5c842":"#ff6b6b";
  const grade=score>=9?"A+":score>=8?"A":score>=7?"B+":score>=6?"B":score>=5?"C+":"C";
  return (
    <div className="score-ring-wrap">
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="10"/>
        <circle cx="75" cy="75" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 75 75)" style={{transition:"stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)"}}/>
      </svg>
      <div className="sr-center">
        <span className="sr-score" style={{color}}>{score}<span className="sr-denom">/10</span></span>
        <span className="sr-grade" style={{color}}>{grade}</span>
      </div>
    </div>
  );
}

/* ─── CAMERA BOX ─── */
function CameraBox({ videoRef, faceDetected, cameraReady, cameraError }) {
  return (
    <div className="camera-box">
      <div className="camera-border" style={{
        borderColor: !cameraReady ? "rgba(255,255,255,0.15)" : faceDetected ? "#4ade80" : "#ff6b6b",
      }}>
        <video ref={videoRef} autoPlay muted playsInline width="200" height="150" className="camera-video"/>
        {!cameraReady && !cameraError && (
          <div className="camera-overlay">
            <div className="cam-spinner"/>
            <span>Starting camera…</span>
          </div>
        )}
        {cameraError && (
          <div className="camera-overlay">
            <span style={{fontSize:28}}>📷</span>
            <span style={{fontSize:12,color:"#ff6b6b",textAlign:"center"}}>Camera blocked.<br/>Check browser permissions.</span>
          </div>
        )}
        {cameraReady && (
          <>
            <div className="camera-badge" style={{
              background: faceDetected ? "rgba(74,222,128,0.15)" : "rgba(255,107,107,0.15)",
              borderColor: faceDetected ? "#4ade80" : "#ff6b6b",
              color: faceDetected ? "#4ade80" : "#ff6b6b",
            }}>
              <span className="badge-dot" style={{background: faceDetected ? "#4ade80" : "#ff6b6b"}}/>
              {faceDetected ? "Face detected" : "No face"}
            </div>
            <div className="camera-live"><span className="live-dot"/>REC</div>
          </>
        )}
      </div>
      <p className="camera-hint">
        {!cameraReady && !cameraError ? "Initializing…"
          : cameraError ? "Camera unavailable"
          : faceDetected ? "Good — keep looking at camera"
          : "⚠️ Look at the camera"}
      </p>
    </div>
  );
}

/* ═══════════════════════════════
   SESSION
═══════════════════════════════ */
export default function Session() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const role = state?.role;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [listening, setListening] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [faceOffSeconds, setFaceOffSeconds] = useState(0);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const faceOffRef = useRef(0);
  const cameraInitialized = useRef(false);
  const token = localStorage.getItem("token");

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* FETCH QUESTIONS */
  useEffect(() => {
    if (!role) return;
    axios.post("http://localhost:5000/api/interview/questions", { role })
      .then((res) => setQuestions(res.data.questions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [role]);

  /* CAMERA — starts only after loading=false */
  useEffect(() => {
    if (loading) return;
    if (cameraInitialized.current) return;
    cameraInitialized.current = true;

    let localStream = null;
    let interval = null;

    const init = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "https://justadudewhohacks.github.io/face-api.js/models"
        );
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });
        streamRef.current = localStream;
        const video = videoRef.current;
        if (!video) { console.error("videoRef not ready"); return; }
        video.srcObject = localStream;
        await new Promise((resolve) => {
          if (video.readyState >= 2) { resolve(); } else {
            const onReady = () => { video.removeEventListener("loadeddata", onReady); resolve(); };
            const onMeta = () => { video.removeEventListener("loadedmetadata", onMeta); resolve(); };
            video.addEventListener("loadeddata", onReady, { once: true });
            video.addEventListener("loadedmetadata", onMeta, { once: true });
          }
        });
        try { await video.play(); } catch (playErr) { console.warn("video.play() failed:", playErr); }
        setCameraReady(true);
        interval = setInterval(async () => {
          const v = videoRef.current;
          if (!v || v.readyState < 2 || v.paused) return;
          try {
            const detections = await faceapi.detectAllFaces(v, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.3 }));
            const detected = detections.length > 0;
            setFaceDetected(detected);
            if (!detected) { faceOffRef.current += 1; setFaceOffSeconds(faceOffRef.current); }
          } catch (_) {}
        }, 1000);
        detectionIntervalRef.current = interval;
      } catch (err) {
        console.error("Camera/model error:", err);
        setCameraError(true);
      }
    };
    init();
    return () => {
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  /* SPEECH RECOGNITION */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech Recognition not supported in this browser."); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setAnswers((prev) => { const updated = [...prev]; updated[current] = text; return updated; });
      setListening(false);
      setAnswered(true);
    };
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, [current]);

  /* STOP CAMERA */
  const stopCamera = () => {
    if (detectionIntervalRef.current) { clearInterval(detectionIntervalRef.current); detectionIntervalRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach((track) => track.stop()); streamRef.current = null; }
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; }
    setCameraReady(false); setFaceDetected(false);
  };

  const startRecording = () => {
    if (!recognitionRef.current || listening) return;
    setListening(true); setAnswered(false);
    recognitionRef.current.start();
  };

  const nextQuestion = async () => {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1); setAnswered(false);
    } else {
      setSubmitting(true);
      stopCamera();
      try {
        const res = await axios.post("http://localhost:5000/api/interview/feedback", {
          role, questions, answers, cameraStats: { faceOffSeconds: faceOffRef.current },
        });
        setFeedback(res.data.feedback);
        setScore(res.data.score);
        await axios.post(
          "http://localhost:5000/api/interview/save",
          { role, questions, answers, feedback: res.data.feedback, score: res.data.score, cameraStats: { faceOffSeconds: faceOffRef.current } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCompleted(true);
      } catch (err) {
        console.error(err);
        alert("Something went wrong. Please try again.");
      } finally { setSubmitting(false); }
    }
  };

  const progress = questions.length > 0 ? (current / questions.length) * 100 : 0;
  const go = (id) => { setMobOpen(false); navigate("/" + id); };

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
            {[["dashboard","Dashboard"],["setup","New Interview"],["history","History"],["profile","Profile"]].map(([id,lbl]) => (
              <li key={id}><a onClick={() => go(id)}>{lbl}</a></li>
            ))}
          </ul>
          <button className="ncta" onClick={() => navigate("/setup")}>Start Free →</button>
          <button className={`ham ${mobOpen?"o":""}`} onClick={() => setMobOpen(!mobOpen)}><span/><span/><span/></button>
        </div>
      </nav>
      <div className={`ov ${mobOpen?"o":""}`} onClick={() => setMobOpen(false)}/>
      <div className={`mob ${mobOpen?"o":""}`}>
        {[["dashboard","🏠","Dashboard"],["setup","🎤","New Interview"],["history","📊","History"],["profile","👤","Profile"]].map(([id,e,lbl]) => (
          <a key={id} onClick={() => go(id)}>{e} {lbl}</a>
        ))}
        <a className="mcta" onClick={() => navigate("/setup")}>🎤 Start Mock Interview</a>
      </div>

      {/* STAGE */}
      <div className="stage">
        <div className={`session-wrap ${visible?"in":""}`}>

          {/* LOADING */}
          {loading && (
            <div className="load-state">
              <div className="spinner"/>
              <p className="load-txt">Generating your <span className="gt">{role}</span> questions…</p>
            </div>
          )}

          {/* INTERVIEW */}
          {!loading && !completed && questions.length > 0 && (
            <>
              <div className="sess-header">
                <div className="chip"><span className="cdot"/>{role?.toUpperCase()} INTERVIEW</div>
                <span className="q-counter">{current+1} / {questions.length}</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{width:`${progress}%`}}/>
              </div>
              <div className="interview-row">
                <div className="interview-left">
                  <div className="q-card">
                    <div className="q-label">Question {current+1}</div>
                    <p className="q-text">{questions[current]}</p>
                  </div>
                  <div className="answer-area">
                    {answered && answers[current] && (
                      <div className="answer-bubble">
                        <span className="ab-label">Your answer</span>
                        <p className="ab-text">"{answers[current]}"</p>
                      </div>
                    )}
                  </div>
                </div>
                <CameraBox videoRef={videoRef} faceDetected={faceDetected} cameraReady={cameraReady} cameraError={cameraError}/>
              </div>
              <div className="controls">
                <button className={`mic-btn ${listening?"active":""}`} onClick={startRecording} disabled={listening}>
                  <span className="mic-icon">{listening?"🔴":"🎤"}</span>
                  {listening ? "Listening…" : answered ? "Re-record" : "Speak Answer"}
                  {listening && <span className="pulse-ring"/>}
                </button>
                <button className={`next-btn ${!answered?"dim":""}`} onClick={nextQuestion} disabled={!answered || submitting}>
                  {submitting ? (<><span className="btn-spinner"/>Submitting…</>) : current === questions.length-1 ? "Submit Interview →" : "Next Question →"}
                  <span className="btn-glow"/>
                </button>
              </div>
              {cameraReady && faceOffSeconds > 5 && (
                <div className="eye-warn">👁️ You've looked away for {faceOffSeconds}s — interviewers notice eye contact!</div>
              )}
            </>
          )}

          {/* RESULTS */}
          {completed && (
            <div className="result-wrap">
              <div className="chip"><span className="cdot"/>Interview Complete</div>
              <h1 className="result-title">Great job, <span className="gt">Champion!</span> 🎉</h1>
              <p className="result-sub">Here's how you performed in your {role} interview.</p>
              <ScoreRing score={score ?? 0}/>
              <div className="stat-row">
                <div className="stat-card">
                  <span className="stat-label">Eye Contact</span>
                  <span className="stat-val" style={{color: faceOffSeconds<10?"#4ade80":faceOffSeconds<30?"#f5c842":"#ff6b6b"}}>
                    {faceOffSeconds<10 ? "Excellent" : faceOffSeconds<30 ? "Needs work" : "Poor"}
                  </span>
                  <span className="stat-sub">Looked away {faceOffSeconds}s total</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Questions</span>
                  <span className="stat-val" style={{color:"#00e5ff"}}>{questions.length}</span>
                  <span className="stat-sub">Answered</span>
                </div>
              </div>
              <div className="feedback-card">
                <div className="fb-label">💡 AI Feedback</div>
                <p className="fb-text">{feedback}</p>
              </div>
              <div className="result-actions">
                <button className="cta-btn" onClick={() => navigate("/setup")}><span className="btn-glow"/>🔁 Try Another Role</button>
                <button className="ghost-btn" onClick={() => navigate("/dashboard")}>📊 View Dashboard</button>
              </div>
            </div>
          )}

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
.cur-dot{position:fixed;width:10px;height:10px;background:var(--c);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);mix-blend-mode:screen;}
.cur-ring{position:fixed;width:34px;height:34px;border:1.5px solid rgba(0,229,255,.35);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);}
@media(max-width:640px){.cur-dot,.cur-ring{display:none;}}
.nav{position:fixed;top:0;left:0;right:0;z-index:500;padding:0 clamp(16px,4vw,40px);transition:background .35s,border-color .35s;}
.nav.sc{background:rgba(6,9,16,.92);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);}
.ni{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:68px;}
.logo{font-family:var(--head);font-weight:800;font-size:1.28rem;letter-spacing:-.03em;text-decoration:none;color:var(--txt);display:flex;align-items:center;gap:10px;cursor:pointer;background:none;border:none;}
.ldot{width:9px;height:9px;border-radius:50%;background:var(--c);box-shadow:0 0 10px var(--c);animation:pp 2s ease-in-out infinite;flex-shrink:0;}
@keyframes pp{0%,100%{box-shadow:0 0 6px var(--c);transform:scale(1)}50%{box-shadow:0 0 22px var(--c);transform:scale(1.35)}}
.nl{display:flex;gap:2px;list-style:none;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:100px;padding:4px;}
.nl a{display:block;text-decoration:none;color:var(--muted);font-family:var(--head);font-size:.83rem;font-weight:800;padding:7px 18px;border-radius:100px;transition:color .2s,background .2s;white-space:nowrap;cursor:pointer;letter-spacing:.01em;}
.nl a:hover{color:var(--txt);background:rgba(255,255,255,.08);}
.ncta{font-family:var(--head);font-weight:700;font-size:.84rem;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;padding:9px 24px;border-radius:100px;letter-spacing:.02em;box-shadow:0 0 20px rgba(0,229,255,.22);cursor:pointer;border:none;transition:transform .2s,box-shadow .2s;}
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
.session-wrap{width:100%;max-width:900px;display:flex;flex-direction:column;align-items:center;text-align:center;opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.4,0,.2,1),transform .7s cubic-bezier(.4,0,.2,1);}
.session-wrap.in{opacity:1;transform:translateY(0);}
.load-state{display:flex;flex-direction:column;align-items:center;gap:20px;}
.spinner{width:44px;height:44px;border:3px solid rgba(0,229,255,.1);border-top-color:var(--c);border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.load-txt{font-family:var(--head);font-size:1.05rem;color:var(--soft);font-weight:500;}
.sess-header{width:100%;display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}
.q-counter{font-family:var(--head);font-size:.82rem;font-weight:700;color:var(--muted);background:rgba(255,255,255,.04);border:1px solid var(--border);padding:5px 16px;border-radius:100px;letter-spacing:.04em;}
.prog-track{width:100%;height:4px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden;margin-bottom:24px;}
.prog-fill{height:100%;background:linear-gradient(90deg,var(--c),var(--v));border-radius:3px;transition:width .6s cubic-bezier(.4,0,.2,1);}
.interview-row{width:100%;display:flex;gap:16px;align-items:flex-start;margin-bottom:16px;}
.interview-left{flex:1;display:flex;flex-direction:column;gap:12px;min-width:0;}

/* Q card with big question text */
.q-card{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:28px 26px;position:relative;overflow:hidden;text-align:left;}
.q-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--c),var(--v) 60%,transparent);}
.q-label{font-family:var(--head);font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;color:var(--c);margin-bottom:12px;font-weight:700;}
.q-text{font-family:var(--head);font-size:clamp(1rem,2.2vw,1.2rem);color:var(--txt);font-weight:700;line-height:1.55;letter-spacing:-.02em;}

.answer-area{width:100%;}
.answer-bubble{background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.14);border-radius:14px;padding:16px 20px;text-align:left;animation:fadeIn .35s ease;}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.ab-label{font-family:var(--head);font-size:.62rem;text-transform:uppercase;letter-spacing:.12em;color:var(--c);display:block;margin-bottom:7px;font-weight:700;}
.ab-text{font-family:var(--body);font-size:.88rem;color:var(--soft);font-style:italic;line-height:1.65;}

/* Camera */
.camera-box{flex-shrink:0;width:210px;display:flex;flex-direction:column;align-items:center;gap:8px;}
.camera-border{width:210px;height:158px;border-radius:16px;border:2px solid rgba(255,255,255,0.15);overflow:hidden;background:#000;position:relative;transition:border-color 0.4s ease;display:block;}
.camera-video{width:100% !important;height:100% !important;object-fit:cover;display:block;transform:scaleX(-1);}
.camera-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(0,0,0,0.7);color:var(--soft);font-size:12px;}
.cam-spinner{width:24px;height:24px;border:2px solid rgba(0,229,255,.2);border-top-color:var(--c);border-radius:50%;animation:spin .8s linear infinite;}
.camera-badge{position:absolute;bottom:6px;left:6px;display:flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;border:1px solid;font-family:var(--head);font-size:10px;font-weight:700;letter-spacing:.04em;}
.badge-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
.camera-live{position:absolute;top:6px;right:6px;display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.55);border-radius:20px;padding:3px 7px;font-family:var(--head);font-size:10px;font-weight:700;color:#fff;letter-spacing:.06em;}
.live-dot{width:6px;height:6px;border-radius:50%;background:#ff4444;animation:blink 1.2s ease-in-out infinite;flex-shrink:0;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}
.camera-hint{font-family:var(--body);font-size:11px;color:var(--muted);text-align:center;line-height:1.4;}
@media(max-width:600px){.interview-row{flex-direction:column;}.camera-box,.camera-border{width:100%;}.camera-border{height:200px;}}

.eye-warn{width:100%;margin-top:8px;padding:10px 18px;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.25);border-radius:10px;font-family:var(--body);font-size:.82rem;color:var(--r);text-align:left;animation:fadeIn .3s ease;}
.controls{display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;margin-top:4px;}
.mic-btn{position:relative;display:inline-flex;align-items:center;gap:10px;background:var(--bg2);border:1px solid var(--border);color:var(--txt);font-family:var(--head);font-weight:700;font-size:.92rem;padding:14px 36px;border-radius:14px;cursor:pointer;transition:border-color .22s,background .22s,transform .22s;width:100%;justify-content:center;letter-spacing:.01em;}
.mic-btn:hover:not(:disabled){border-color:rgba(0,229,255,.4);background:rgba(0,229,255,.05);transform:translateY(-2px);}
.mic-btn.active{border-color:var(--r);background:rgba(255,107,107,.06);color:var(--r);}
.mic-btn:disabled{opacity:.6;cursor:not-allowed;}
.mic-icon{font-size:1.1rem;}
.pulse-ring{position:absolute;inset:-4px;border-radius:18px;border:2px solid var(--r);animation:pulse 1.2s ease-out infinite;pointer-events:none;}
@keyframes pulse{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.06)}}
.next-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;font-family:var(--head);font-weight:800;font-size:.95rem;padding:15px 40px;border-radius:14px;border:none;cursor:pointer;box-shadow:0 0 30px rgba(0,229,255,.2),0 8px 28px rgba(123,92,250,.16);transition:transform .22s cubic-bezier(.34,1.56,.64,1),box-shadow .22s,opacity .22s;overflow:hidden;width:100%;letter-spacing:.02em;}
.next-btn:hover:not(.dim):not(:disabled){transform:translateY(-4px);box-shadow:0 0 50px rgba(0,229,255,.35),0 16px 44px rgba(123,92,250,.28);}
.next-btn.dim{opacity:.35;cursor:not-allowed;transform:none;box-shadow:none;}
.btn-glow{position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.18) 50%,transparent 60%);transform:translateX(-100%);transition:transform .55s ease;pointer-events:none;}
.next-btn:hover:not(.dim) .btn-glow{transform:translateX(100%);}
.btn-spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0;}

/* Results */
.result-wrap{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;}
.result-title{font-family:var(--head);font-size:clamp(2rem,4.5vw,3rem);font-weight:900;letter-spacing:-.04em;line-height:1.1;color:var(--txt);margin-bottom:6px;}
.result-sub{font-family:var(--body);font-size:.95rem;color:var(--soft);margin-bottom:24px;}
.score-ring-wrap{position:relative;width:150px;height:150px;margin-bottom:24px;}
.score-ring-wrap svg{position:absolute;inset:0;}
.sr-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
.sr-score{font-family:var(--head);font-size:2rem;font-weight:900;line-height:1;letter-spacing:-.04em;}
.sr-denom{font-size:.9rem;opacity:.6;font-weight:400;}
.sr-grade{font-family:var(--head);font-size:.75rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;margin-top:3px;}
.stat-row{display:flex;gap:14px;width:100%;margin-bottom:16px;}
.stat-card{flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:18px 16px;display:flex;flex-direction:column;align-items:center;gap:5px;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--c),var(--v));}
.stat-label{font-family:var(--head);font-size:.65rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);font-weight:700;}
.stat-val{font-family:var(--head);font-size:1.4rem;font-weight:900;letter-spacing:-.03em;}
.stat-sub{font-family:var(--body);font-size:.72rem;color:var(--muted);}
.feedback-card{width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:26px 24px;text-align:left;margin-bottom:24px;position:relative;overflow:hidden;}
.feedback-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#f5c842,#f97316);}
.fb-label{font-family:var(--head);font-size:.72rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#f5c842;margin-bottom:12px;}
.fb-text{font-family:var(--body);font-size:.92rem;color:var(--soft);line-height:1.8;}
.result-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;width:100%;}
.cta-btn{position:relative;display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--c),var(--v));color:#fff;font-family:var(--head);font-weight:800;font-size:.95rem;padding:14px 34px;border-radius:14px;border:none;cursor:pointer;overflow:hidden;letter-spacing:.02em;}
.cta-btn:hover{transform:translateY(-3px);}
.ghost-btn{display:inline-flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.14);color:var(--txt);font-family:var(--head);font-weight:700;font-size:.95rem;padding:14px 34px;border-radius:14px;background:transparent;cursor:pointer;letter-spacing:.02em;transition:border-color .2s,background .2s;}
.ghost-btn:hover{border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.04);}
@media(max-width:480px){.result-actions{flex-direction:column;}.cta-btn,.ghost-btn{width:100%;justify-content:center;}}
`;