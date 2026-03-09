import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Check, Star, Wand2, ArrowRight, MessageSquare, Users,
  Globe, Headphones, RefreshCw, Shield, Copy, Zap, Eye, EyeOff,
  LogOut, User, ChevronRight, Mail, BarChart2, Clock, Inbox
} from "lucide-react";

// ── Supabase config ───────────────────────────────────────────────────────
const SB_URL  = "https://lrvcliytsachlwrwjhpz.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydmNsaXl0c2FjaGx3cndqaHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NjUxODUsImV4cCI6MjA4ODQ0MTE4NX0.dhqJ1NhqR3EQtXx7y8nrxSx6S7VifxbUUMiucAk1yGs";
// Edge Function proxy URL — bypasses CORS for auth from any origin
const AUTH_PROXY = `${SB_URL}/functions/v1/auth-proxy`;

const sbHeaders = (token) => ({
  "apikey": SB_ANON,
  "Authorization": `Bearer ${token || SB_ANON}`,
  "Content-Type": "application/json",
});

const sbAuth = {
  signUp: async (email, password, fullName) => {
    const r = await fetch(AUTH_PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signup", email, password, fullName }),
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message || d.error || "Sign up failed");
    return d;
  },
  signIn: async (email, password) => {
    const r = await fetch(AUTH_PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "signin", email, password }),
    });
    const d = await r.json();
    if (d.error || d.error_description) throw new Error(d.error_description || d.error || "Sign in failed");
    return d;
  },
  signOut: async (token) => {
    await fetch(`${SB_URL}/auth/v1/logout`, { method: "POST", headers: sbHeaders(token) });
  },
};

const sbDb = {
  insertGeneration: async (token, userId, topic, tone, emailLength, output) => {
    await fetch(`${SB_URL}/rest/v1/email_generations`, {
      method: "POST",
      headers: { ...sbHeaders(token), "Prefer": "return=minimal" },
      body: JSON.stringify({ user_id: userId, topic, tone, length: emailLength, output }),
    });
  },
  getGenerations: async (token) => {
    const r = await fetch(`${SB_URL}/rest/v1/email_generations?select=*&order=created_at.desc&limit=30`, {
      headers: sbHeaders(token),
    });
    return r.json();
  },
};

// ── Brand ─────────────────────────────────────────────────────────────────
const P = "#7C3AED", PD = "#6D28D9", PL = "#8B5CF6";

// ── CSS (unchanged from previous) ─────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300&display=swap');
*,*::before,*::after{box-sizing:border-box;}
h1,h2,h3,h4,h5,h6,p{margin:0;}
html{scroll-behavior:smooth;}
body{margin:0;background:#fff;font-family:'Plus Jakarta Sans',sans-serif;}

@keyframes pathDraw{0%{stroke-dashoffset:2200;opacity:.08;}25%{opacity:.45;}75%{opacity:.45;}100%{stroke-dashoffset:-2200;opacity:.08;}}
@keyframes pathDrawBg{0%{stroke-dashoffset:2200;opacity:.03;}50%{opacity:.11;}100%{stroke-dashoffset:-2200;opacity:.03;}}
@keyframes shimBg{0%{background-position:200% center;}100%{background-position:-200% center;}}
@keyframes gradBtn{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
@keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
@keyframes colFwd{from{transform:translateY(0);}to{transform:translateY(-50%);}}
@keyframes colBwd{from{transform:translateY(-50%);}to{transform:translateY(0);}}
@keyframes spring{0%{opacity:0;transform:translateY(52px) scale(.91);}65%{transform:translateY(-6px) scale(1.02);}100%{opacity:1;transform:translateY(0) scale(1);}}
@keyframes slideUp{from{opacity:0;transform:translateY(34px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.36);}50%{box-shadow:0 0 0 16px rgba(124,58,237,0);}}
@keyframes glow{0%,100%{opacity:.5;transform:scale(1);}50%{opacity:1;transform:scale(1.07);}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}

.su0{animation:slideUp .6s ease both;}
.su1{animation:slideUp .6s .11s ease both;}
.su2{animation:slideUp .6s .22s ease both;}
.su3{animation:slideUp .6s .33s ease both;}
.su4{animation:slideUp .6s .44s ease both;}
.fi {animation:fadeIn .5s ease both;}

.hp{stroke-dasharray:2200;stroke-dashoffset:2200;animation:pathDraw 20s linear infinite;will-change:stroke-dashoffset,opacity;}
.bp{stroke-dasharray:2200;stroke-dashoffset:2200;animation:pathDrawBg 28s linear infinite;will-change:stroke-dashoffset,opacity;}

.shim{display:inline-block;background:linear-gradient(90deg,#a855f7 0%,${P} 20%,#fff 50%,${P} 80%,#a855f7 100%);background-size:250% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimBg 2.8s linear infinite;contain:paint;}

.gbtn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:11px;min-width:132px;padding:14px 32px;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:700;color:#fff;border:none;cursor:pointer;background:linear-gradient(135deg,${PL},${P},${PD},${PL});background-size:300% 300%;animation:gradBtn 5s ease infinite;transition:transform .25s,box-shadow .25s;}
.gbtn:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(109,40,217,.42);}
.gbtn:active{transform:translateY(0);}
.gbtn:disabled{opacity:.6;pointer-events:none;}
.obtn{display:inline-flex;align-items:center;gap:8px;background:transparent;color:${P};border:1.5px solid ${P};border-radius:12px;padding:13px 28px;font-size:15px;font-weight:600;cursor:pointer;transition:all .25s;font-family:'Plus Jakarta Sans',sans-serif;}
.obtn:hover{background:${P};color:#fff;transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.3);}
.card{background:#fff;border-radius:20px;border:1px solid rgba(124,58,237,.12);transition:border-color .3s,box-shadow .3s,transform .3s;}
.card:hover{border-color:rgba(124,58,237,.3);box-shadow:0 16px 48px rgba(124,58,237,.09);transform:translateY(-3px);}
.fc{padding:28px;border-radius:16px;border:1px solid #f0eeff;transition:all .3s;position:relative;overflow:hidden;}
.fc::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,.07),transparent 60%);opacity:0;transition:opacity .3s;}
.fc:hover::before{opacity:1;}
.fc:hover{border-color:rgba(124,58,237,.25);box-shadow:0 8px 32px rgba(124,58,237,.09);transform:translateY(-3px);}
.cfwd{animation:colFwd 26s linear infinite;}
.cbwd{animation:colBwd 30s linear infinite;}
.pp{border:2px solid ${P}!important;box-shadow:0 24px 64px rgba(124,58,237,.18);}
.sp0{animation:spring .8s .06s cubic-bezier(.34,1.56,.64,1) both;}
.sp1{animation:spring .8s .18s cubic-bezier(.34,1.56,.64,1) both;}
.sp2{animation:spring .8s .30s cubic-bezier(.34,1.56,.64,1) both;}
.flt{animation:float 5.5s ease-in-out infinite;}
.gorb{position:absolute;border-radius:50%;filter:blur(48px);pointer-events:none;animation:glow 4s ease-in-out infinite;will-change:opacity,transform;}
.nl{color:#374151;font-weight:500;font-size:14px;cursor:pointer;background:none;border:none;font-family:'Plus Jakarta Sans',sans-serif;transition:color .2s;padding:0;}
.nl:hover{color:${P};}
.tc{padding:8px 18px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;border:1.5px solid #e5e7eb;background:#fff;color:#6b7280;font-family:'Plus Jakarta Sans',sans-serif;}
.tc.a{border-color:${P};background:${P};color:#fff;}
.tc:hover:not(.a){border-color:${PL};color:${P};}
.tt{width:46px;height:25px;border-radius:13px;background:#e5e7eb;position:relative;cursor:pointer;transition:background .25s;}
.tt.on{background:${P};}
.th{width:19px;height:19px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .25s;box-shadow:0 1px 4px rgba(0,0,0,.2);}
.th.on{transform:translateX(21px);}
.eout{width:100%;background:#fafafa;border:1px solid #e5e7eb;border-radius:12px;padding:20px;font-size:14px;line-height:1.85;color:#1f2937;resize:none;min-height:280px;outline:none;font-family:'Plus Jakarta Sans',sans-serif;transition:border-color .2s;}
.eout:focus{border-color:${PL};}
.ainput{width:100%;padding:14px 16px;border-radius:12px;font-size:14px;border:1.5px solid #e5e7eb;background:#fafafa;color:#1f2937;outline:none;transition:border-color .2s,box-shadow .2s;font-family:'Plus Jakarta Sans',sans-serif;}
.ainput:focus{border-color:${P};box-shadow:0 0 0 3px rgba(124,58,237,.1);}
.ainput::placeholder{color:#9ca3af;}
.bdg{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;font-family:'Plus Jakarta Sans',sans-serif;}
.legal-content h2{font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:#111827;margin:32px 0 12px;}
.legal-content h3{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:16px;color:#374151;margin:20px 0 8px;}
.legal-content p{color:#6b7280;line-height:1.8;font-size:15px;margin:0 0 14px;}
.legal-content ul{color:#6b7280;line-height:1.8;font-size:15px;padding-left:20px;}
.legal-content li{margin-bottom:6px;}
::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:#f9fafb;}::-webkit-scrollbar-thumb{background:${PL};border-radius:3px;}

/* ── Mobile responsive ── */
@media(max-width:768px){
  .pricing-grid{grid-template-columns:1fr!important;}
  .dash-grid{grid-template-columns:1fr!important;}
  .footer-grid{grid-template-columns:1fr!important;gap:32px!important;}
  .dash-stats{grid-template-columns:1fr 1fr!important;}
  .feat-grid{grid-template-columns:1fr 1fr!important;}
  .testi-grid{grid-template-columns:1fr!important;}
  .nav-links{display:none!important;}
  .nav-auth{display:none!important;}
  .ham-btn{display:flex!important;}
  .hero-stats{gap:24px!important;}
  .hero-preview{max-width:100%!important;margin-left:0!important;margin-right:0!important;}
  .gen-card{padding:24px!important;}
}
@media(max-width:480px){
  .dash-stats{grid-template-columns:1fr!important;}
  .feat-grid{grid-template-columns:1fr!important;}
  .hero-stats{flex-direction:column!important;gap:12px!important;align-items:center!important;}
}
`;

// ── Data ──────────────────────────────────────────────────────────────────
const TONES   = ["Professional","Friendly","Casual","Persuasive","Formal"];
const LENGTHS = ["Short","Medium","Detailed"];
const FEATURES = [
  {ic:<Wand2 size={22}/>,t:"AI-Powered Writing",d:"Claude AI crafts natural, human-sounding emails that never feel robotic."},
  {ic:<Zap size={22}/>,t:"Instant Generation",d:"Get a polished, ready-to-send email in under 5 seconds."},
  {ic:<MessageSquare size={22}/>,t:"Tone Control",d:"Professional, Casual, Persuasive — the voice adapts to every situation."},
  {ic:<Globe size={22}/>,t:"Works Everywhere",d:"Copy to Gmail, Outlook, Apple Mail, or any email client."},
  {ic:<RefreshCw size={22}/>,t:"One-Click Regenerate",d:"Not happy? Regenerate instantly. Every result feels unique."},
  {ic:<Shield size={22}/>,t:"Private & Secure",d:"Your email topics are never stored. Privacy-first, always."},
  {ic:<Users size={22}/>,t:"Team-Ready",d:"Share prompts and templates across your whole organisation."},
  {ic:<Headphones size={22}/>,t:"24/7 Support",d:"Our AI agents are always ready to help you write better emails."},
];
const TEST_A = [
  {tx:"Mailgic cut my email writing time by 80%. 20 minutes now takes 30 seconds.",nm:"Sarah K.",rl:"Startup Founder",av:"https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4"},
  {tx:"I send 50+ cold emails a week. Mailgic keeps every one sounding personal.",nm:"James T.",rl:"Sales Director",av:"https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=c0aede"},
  {tx:"As a freelancer, first impressions matter. Mailgic always puts my best foot forward.",nm:"Priya N.",rl:"Freelance Designer",av:"https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=d1f4cc"},
  {tx:"The tone controls are spot-on. Switching from formal to casual is effortless.",nm:"Marcus L.",rl:"Marketing Manager",av:"https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=ffd5dc"},
];
const TEST_B = [
  {tx:"I used to dread writing emails. Mailgic turned it into something I look forward to.",nm:"Emma W.",rl:"Product Manager",av:"https://api.dicebear.com/7.x/avataaars/svg?seed=Emma&backgroundColor=ffdfbf"},
  {tx:"The AI understands context like a human. Every email feels uniquely crafted.",nm:"Raj P.",rl:"Tech Lead",av:"https://api.dicebear.com/7.x/avataaars/svg?seed=Raj&backgroundColor=b6e3f4"},
  {tx:"Mailgic is the unfair advantage my competitors don't know about. Rates tripled.",nm:"Lisa M.",rl:"Business Owner",av:"https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa&backgroundColor=c0aede"},
  {tx:"Student life is busy. Mailgic helps me write perfect emails to professors.",nm:"Alex C.",rl:"University Student",av:"https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=d1f4cc"},
];
const PLANS = [
  {nm:"Starter",mp:0,yp:0,pr:"month",ds:"Perfect for occasional use",bt:"Get Started Free",pop:false,
   fs:["10 emails / month","3 tone options","Short & Medium length","Copy to clipboard","Email support"]},
  {nm:"Pro",mp:12,yp:9,pr:"month",ds:"For power users & professionals",bt:"Start Free Trial",pop:true,
   fs:["Unlimited emails","All 5 tone options","All length options","Email history (30 days)","Priority support","API access (beta)"]},
  {nm:"Team",mp:29,yp:23,pr:"month",ds:"For growing teams & companies",bt:"Contact Sales",pop:false,
   fs:["Everything in Pro","Up to 10 team seats","Shared templates","Analytics dashboard","Custom tones","Dedicated account manager"]},
];

// ── Logo ──────────────────────────────────────────────────────────────────
function Logo({size=32}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,userSelect:"none",cursor:"pointer"}}>
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <rect width="44" height="44" rx="9" fill={P}/>
        <rect x="7" y="13" width="30" height="21" rx="3" fill="rgba(255,255,255,.18)"/>
        <path d="M7 15.5L22 26l15-10.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="7" y="13" width="30" height="21" rx="3" stroke="#fff" strokeWidth="1.5" fill="none"/>
      </svg>
      <svg width={size*3.4} height={size} viewBox="0 0 136 44" fill="none">
        <text x="0" y="35" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="33" fill={P}>Mail</text>
        <text x="69" y="35" fontFamily="Syne,sans-serif" fontWeight="800" fontSize="33" fill="#1a1a2e">gic</text>
        <path d="M122 7l1.8 5.2L129 14l-5.2 1.8L122 21l-1.8-5.2L115 14l5.2-1.8Z" fill="#1a1a2e"/>
        <circle cx="130" cy="5" r="2" fill="#1a1a2e"/>
        <circle cx="115" cy="4" r="1.3" fill="#1a1a2e"/>
      </svg>
    </div>
  );
}

// ── HeroShader: WebGL rainbow wave — NO STATE CHANGES = NO FLICKER ────────
// Script is loaded imperatively inside useEffect (no useState for readiness)
function HeroShader() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let animId = null;
    let renderer = null, geo = null, mat = null;

    const init = () => {
      if (!canvas || !window.THREE || renderer) return;
      const THREE = window.THREE;
      const scene = new THREE.Scene();
      // pixel ratio = 1 always for performance
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
      renderer.setPixelRatio(1);
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);
      const uniforms = {
        resolution: { value: [canvas.clientWidth, canvas.clientHeight] },
        time: { value: 0 }, xScale: { value: 1.0 }, yScale: { value: 0.5 }, distortion: { value: 0.05 },
      };
      geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(
        new Float32Array([-1,-1,0, 1,-1,0, -1,1,0, 1,-1,0, -1,1,0, 1,1,0]), 3
      ));
      mat = new THREE.RawShaderMaterial({
        vertexShader: `attribute vec3 position;void main(){gl_Position=vec4(position,1.0);}`,
        fragmentShader: `precision mediump float;uniform vec2 resolution;uniform float time;uniform float xScale;uniform float yScale;uniform float distortion;void main(){vec2 p=(gl_FragCoord.xy*2.0-resolution)/min(resolution.x,resolution.y);float d=length(p)*distortion;float rx=p.x*(1.0+d),gx=p.x,bx=p.x*(1.0-d);float r=0.05/abs(p.y+sin((rx+time)*xScale)*yScale);float g=0.05/abs(p.y+sin((gx+time)*xScale)*yScale);float b=0.05/abs(p.y+sin((bx+time)*xScale)*yScale);gl_FragColor=vec4(r*0.6+b*0.2,g*0.08,b*0.85+r*0.15,1.0);}`,
        uniforms, side: THREE.DoubleSide,
      });
      scene.add(new THREE.Mesh(geo, mat));
      const resize = () => {
        const w = canvas.clientWidth, h = canvas.clientHeight;
        renderer.setSize(w, h, false); uniforms.resolution.value = [w, h];
      };
      resize();
      window.addEventListener("resize", resize);
      let visible = true;
      const obs = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
      obs.observe(canvas);
      const loop = () => {
        animId = requestAnimationFrame(loop);
        if (!visible) return;
        uniforms.time.value += 0.007;
        renderer.render(scene, camera);
        // Fade in smoothly on first frame — prevents white flash
        if (canvas.style.opacity === "0") canvas.style.opacity = "0.2";
      };
      loop();
    };

    // Load THREE.js imperatively — no setState, no re-render
    if (window.THREE) {
      init();
    } else {
      const existing = document.querySelector('script[data-id="threejs"]');
      if (existing) {
        existing.addEventListener("load", init);
      } else {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
        s.dataset.id = "threejs";
        s.async = true;
        s.onload = init;
        document.head.appendChild(s);
      }
    }

    return () => {
      cancelAnimationFrame(animId);
      geo?.dispose(); mat?.dispose(); renderer?.dispose();
    };
  }, []); // empty deps — runs once, never re-renders

  return (
    <canvas ref={canvasRef}
      style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",display:"block",opacity:0,pointerEvents:"none",backfaceVisibility:"hidden",transform:"translateZ(0)",transition:"opacity 0.8s ease"}}
    />
  );
}

// ── Section BG paths — memo, no rerenders ─────────────────────────────────
const SectionBg = memo(function SectionBg() {
  const paths = Array.from({length:8},(_,i)=>{
    const pos=i%2===0?1:-1;
    return {id:i,
      d:`M${-340-i*7*pos} ${-160+i*8}C${-340-i*7*pos} ${-160+i*8} ${-280-i*6*pos} ${220-i*7} ${140-i*6*pos} ${350-i*7}C${600-i*6*pos} ${480-i*7} ${660-i*6*pos} ${880-i*7} ${660-i*6*pos} ${880-i*7}`,
      color:i%3===0?PL:i%3===1?P:PD, w:0.4+i*0.03, delay:i*0.8, dur:26+i*1.2,
    };
  });
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      <svg style={{width:"100%",height:"100%",opacity:.45}} viewBox="0 0 696 400" fill="none" preserveAspectRatio="xMidYMid slice">
        {paths.map(p=>(
          <path key={p.id} d={p.d} stroke={p.color} strokeWidth={p.w} fill="none"
            className="bp" style={{animationDelay:`${p.delay}s`,animationDuration:`${p.dur}s`}}/>
        ))}
      </svg>
    </div>
  );
});

// ── Hero paths — memo, no rerenders ──────────────────────────────────────
const HeroPaths = memo(function HeroPaths({position}) {
  const paths = Array.from({length:14},(_,i)=>({
    id:i,
    d:`M${-380-i*5*position} ${-189+i*6}C${-380-i*5*position} ${-189+i*6} ${-312-i*5*position} ${216-i*6} ${152-i*5*position} ${343-i*6}C${616-i*5*position} ${470-i*6} ${684-i*5*position} ${875-i*6} ${684-i*5*position} ${875-i*6}`,
    color:i%3===0?PL:i%3===1?P:PD, w:0.5+i*0.03, delay:i*0.4, dur:22+i*0.7,
  }));
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
      <svg style={{width:"100%",height:"100%"}} viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
        {paths.map(p=>(
          <path key={p.id} d={p.d} stroke={p.color} strokeWidth={p.w} fill="none"
            className="hp" style={{animationDelay:`${p.delay}s`,animationDuration:`${p.dur}s`}}/>
        ))}
      </svg>
    </div>
  );
});

// ── Navbar ─────────────────────────────────────────────────────────────────
function Navbar({onNav,user,onLogout,page}) {
  const [scrolled,setScrolled]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",fn); return()=>window.removeEventListener("scroll",fn);
  },[]);
  const isHome=page==="home";
  const navBg=scrolled||!isHome?"rgba(255,255,255,.97)":"transparent";
  const closeMenu=()=>setMenuOpen(false);
  const handleNav=(id)=>{closeMenu();onNav(id);};
  return (
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,padding:"0 24px",background:navBg,backdropFilter:scrolled||!isHome?"blur(18px)":"none",borderBottom:scrolled||!isHome?"1px solid rgba(124,58,237,.1)":"none",transition:"all .3s ease"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:68}}>
          <div onClick={()=>handleNav("home")} style={{cursor:"pointer"}}><Logo size={28}/></div>
          {/* Desktop nav links */}
          {isHome&&(
            <div className="nav-links" style={{display:"flex",gap:26}}>
              {[["Features","features"],["Generator","generator"],["Pricing","pricing"],["Testimonials","testimonials"]].map(([l,id])=>(
                <button key={id} className="nl" onClick={()=>handleNav(id)}>{l}</button>
              ))}
            </div>
          )}
          {/* Desktop auth buttons */}
          <div className="nav-auth" style={{display:"flex",gap:10,alignItems:"center"}}>
            {user?(
              <>
                <button className="nl" style={{color:P,fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:5}} onClick={()=>handleNav("dashboard")}>
                  <User size={14}/> Dashboard
                </button>
                <button className="obtn" style={{padding:"8px 16px",fontSize:13,gap:6}} onClick={()=>{closeMenu();onLogout();}}>
                  <LogOut size={14}/> Sign out
                </button>
              </>
            ):(
              <>
                <button className="nl" style={{padding:"9px 20px",borderRadius:12,fontSize:13}} onClick={()=>handleNav("login")}>Log in</button>
                <button className="gbtn" style={{padding:"9px 20px",fontSize:13}} onClick={()=>handleNav("signup")}>
                  Get Started <ArrowRight size={14}/>
                </button>
              </>
            )}
          </div>
          {/* Hamburger — mobile only */}
          <button className="ham-btn" onClick={()=>setMenuOpen(o=>!o)}
            style={{display:"none",flexDirection:"column",gap:5,background:"none",border:"none",cursor:"pointer",padding:"4px",zIndex:210}}>
            <span style={{display:"block",width:22,height:2,borderRadius:2,background:scrolled||!isHome?"#1a1a2e":"#fff",transition:"all .25s"}}/>
            <span style={{display:"block",width:22,height:2,borderRadius:2,background:scrolled||!isHome?"#1a1a2e":"#fff",transition:"all .25s"}}/>
            <span style={{display:"block",width:16,height:2,borderRadius:2,background:scrolled||!isHome?"#1a1a2e":"#fff",transition:"all .25s"}}/>
          </button>
        </div>
      </nav>
      {/* Mobile dropdown menu */}
      {menuOpen&&(
        <div style={{position:"fixed",top:68,left:0,right:0,zIndex:199,background:"rgba(255,255,255,.99)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(124,58,237,.12)",padding:"16px 24px 24px",boxShadow:"0 8px 32px rgba(0,0,0,.08)"}}>
          {isHome&&(
            <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16,paddingBottom:16,borderBottom:"1px solid #f0eeff"}}>
              {[["Features","features"],["Generator","generator"],["Pricing","pricing"],["Testimonials","testimonials"]].map(([l,id])=>(
                <button key={id} className="nl" style={{padding:"10px 0",fontSize:15,textAlign:"left"}} onClick={()=>handleNav(id)}>{l}</button>
              ))}
            </div>
          )}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {user?(
              <>
                <button className="obtn" style={{justifyContent:"center"}} onClick={()=>handleNav("dashboard")}><User size={15}/> Dashboard</button>
                <button className="gbtn" style={{justifyContent:"center"}} onClick={()=>{closeMenu();onLogout();}}><LogOut size={15}/> Sign out</button>
              </>
            ):(
              <>
                <button className="obtn" style={{justifyContent:"center"}} onClick={()=>handleNav("login")}>Log in</button>
                <button className="gbtn" style={{justifyContent:"center"}} onClick={()=>handleNav("signup")}>Get Started Free <ArrowRight size={15}/></button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero({onNav,user}) {
  return (
    // Stable dark background — isolation prevents compositing flicker
    <section id="home" style={{minHeight:"100vh",position:"relative",display:"flex",alignItems:"center",justifyContent:"center",background:"#1a0533",overflow:"hidden",padding:"100px 24px 60px",isolation:"isolate"}}>
      {/* Rainbow shader — loads silently, no re-renders */}
      <HeroShader/>
      {/* Purple gradient overlay — always visible, covers any shader loading gap */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,rgba(26,5,51,.9) 0%,rgba(45,17,85,.75) 40%,rgba(76,29,149,.65) 100%)",pointerEvents:"none",zIndex:0}}/>
      <HeroPaths position={1}/>
      <HeroPaths position={-1}/>
      <div className="gorb" style={{width:380,height:380,background:"rgba(167,139,250,.1)",top:-80,right:-40,zIndex:0}}/>
      <div className="gorb" style={{width:240,height:240,background:"rgba(109,40,217,.08)",bottom:30,left:-40,animationDelay:"2s",zIndex:0}}/>

      <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:820,margin:"0 auto"}}>
        <div className="su0" style={{marginBottom:20}}>
          <span className="bdg" style={{background:"rgba(167,139,250,.2)",color:"#c4b5fd",border:"1px solid rgba(167,139,250,.3)"}}>✦ AI Email Generation</span>
        </div>
        <h1 className="su1" style={{fontFamily:"Syne",fontWeight:800,color:"#fff",fontSize:"clamp(46px,7.5vw,84px)",lineHeight:1.06,marginBottom:14}}>
          The <span className="shim">Magician</span><br/>for Your Mail
        </h1>
        <p className="su2" style={{color:"rgba(255,255,255,.72)",fontSize:18,lineHeight:1.72,maxWidth:520,margin:"0 auto 36px"}}>
          Write perfect professional emails in seconds. Describe your topic, pick a tone — Mailgic handles the rest.
        </p>
        <div className="su3" style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="gbtn" style={{padding:"16px 34px",fontSize:16}} onClick={()=>onNav(user?"generator":"signup")}>
            <Wand2 size={18}/> {user?"Generate Email":"Get Started Free"}
          </button>
          <button style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.12)",color:"#fff",border:"1.5px solid rgba(255,255,255,.25)",borderRadius:12,padding:"16px 32px",fontSize:16,fontWeight:600,cursor:"pointer",transition:"background .25s",fontFamily:"Plus Jakarta Sans"}}
            onClick={()=>onNav("features")}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.2)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.12)";}}
          >See How It Works</button>
        </div>
        <div className="su4 hero-stats" style={{marginTop:52,display:"flex",justifyContent:"center",gap:44,flexWrap:"wrap"}}>
          {[["50k+","Emails Generated"],["4.9★","Average Rating"],["< 5s","Generation Time"]].map(([v,l])=>(
            <div key={l} style={{textAlign:"center"}}>
              <div style={{fontFamily:"Syne",fontWeight:800,fontSize:26,color:"#c4b5fd"}}>{v}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.5)",fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
        <div className="su4 flt card hero-preview" style={{maxWidth:400,margin:"44px auto 0",padding:"20px 24px",textAlign:"left",background:"rgba(255,255,255,.97)",boxShadow:"0 20px 60px rgba(0,0,0,.3)",border:"1px solid rgba(124,58,237,.25)"}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
            {["#ff5f57","#ffbd2e","#28ca41"].map(c=><div key={c} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}
            <span style={{marginLeft:"auto",fontSize:10,color:"#9ca3af",fontWeight:700,letterSpacing:".06em"}}>MAILGIC OUTPUT</span>
          </div>
          <div style={{fontSize:11,color:"#9ca3af",marginBottom:6}}>Subject: Following Up on Our Proposal</div>
          <div style={{fontSize:12.5,color:"#374151",lineHeight:1.76}}>Hi Sarah,<br/><br/>I wanted to follow up on the proposal I sent last week. I believe our solution could significantly streamline your onboarding process…</div>
          <div style={{marginTop:12,display:"flex",gap:6}}>
            <span className="bdg" style={{background:"rgba(124,58,237,.1)",color:P,fontSize:10}}>Professional</span>
            <span className="bdg" style={{background:"#f0fdf4",color:"#16a34a",fontSize:10}}>Generated in 3.2s</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Generator ──────────────────────────────────────────────────────────────
function Generator({user,onNav}) {
  const [topic,setTopic]=useState(""); const [tone,setTone]=useState("Professional");
  const [length,setLength]=useState("Medium"); const [output,setOutput]=useState("");
  const [loading,setLoading]=useState(false); const [copied,setCopied]=useState(false);

  const generate=async()=>{
    if(!topic.trim()){return;} if(!user){onNav("signup");return;}
    setLoading(true); setOutput("");
    try{
      // Route through Supabase Edge Function — keeps API key secure, avoids CORS
      const r=await fetch(AUTH_PROXY,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({action:"generate",messages:[{role:"user",content:
          `Write a ${tone.toLowerCase()} email about: "${topic}". Length: ${length==="Short"?"2-3 paragraphs":length==="Medium"?"3-4 paragraphs":"4-6 paragraphs"}. Start with "Subject: [line]" then blank line then email body. End with sign-off. Sound natural, human. No placeholder brackets.`
        }]})});
      const d=await r.json();
      if(d.error) throw new Error(d.error.message||d.error||"Generation failed");
      const text=d.content?.map(c=>c.text||"").join("")||"Failed to generate.";
      setOutput(text);
      sbDb.insertGeneration(user.token, user.id, topic, tone, length, text).catch(()=>{});
    }catch(e){
      if(String(e).includes("Failed to fetch")||String(e).includes("NetworkError"))setOutput("Connection error. Please try again.");
      else setOutput("Generation error: "+String(e.message||e));
    }
    finally{setLoading(false);}
  };
  const copy=()=>{if(!output)return; navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2500);};

  return (
    <section id="generator" style={{padding:"100px 24px",background:"#fff",position:"relative",overflow:"hidden"}}>
      <SectionBg/>
      <div style={{maxWidth:860,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <span className="bdg" style={{background:"rgba(124,58,237,.1)",color:P,border:`1px solid rgba(124,58,237,.2)`,marginBottom:16,display:"inline-block"}}>✦ Core Feature</span>
          <h2 style={{fontFamily:"Syne",fontWeight:800,color:"#111827",fontSize:"clamp(32px,5vw,52px)",marginBottom:16}}>Generate Your Email</h2>
          <p style={{color:"#6b7280",fontSize:17,lineHeight:1.72}}>Describe what you need. We'll craft the perfect email instantly.</p>
        </div>
        <div className="card gen-card" style={{padding:"40px",boxShadow:"0 24px 80px rgba(124,58,237,.1)"}}>
          <div style={{marginBottom:28}}>
            <label style={{display:"block",fontWeight:700,fontSize:14,color:"#374151",marginBottom:10,fontFamily:"Plus Jakarta Sans"}}>What's your email about? *</label>
            <textarea value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder={user?"e.g. Follow up on a job application to TechCorp…":"Sign in to generate emails with your account…"}
              onFocus={e=>e.target.style.borderColor=P} onBlur={e=>e.target.style.borderColor=topic?P+"55":"#e5e7eb"}
              style={{width:"100%",minHeight:96,padding:16,borderRadius:12,outline:"none",resize:"vertical",border:`1.5px solid ${topic?P+"55":"#e5e7eb"}`,fontSize:14,lineHeight:1.72,color:"#1f2937",background:"#fafafa",transition:"border-color .2s",fontFamily:"Plus Jakarta Sans"}}
            />
          </div>
          <div style={{marginBottom:28}}>
            <label style={{display:"block",fontWeight:700,fontSize:14,color:"#374151",marginBottom:10,fontFamily:"Plus Jakarta Sans"}}>Tone</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {TONES.map(t=><button key={t} className={`tc ${tone===t?"a":""}`} onClick={()=>setTone(t)}>{t}</button>)}
            </div>
          </div>
          <div style={{marginBottom:32}}>
            <label style={{display:"block",fontWeight:700,fontSize:14,color:"#374151",marginBottom:10,fontFamily:"Plus Jakarta Sans"}}>Length</label>
            <div style={{display:"flex",gap:8}}>
              {LENGTHS.map(l=><button key={l} className={`tc ${length===l?"a":""}`} style={{flex:1,textAlign:"center"}} onClick={()=>setLength(l)}>{l}</button>)}
            </div>
          </div>
          <button className="gbtn" style={{width:"100%",padding:"16px",fontSize:16}} onClick={generate} disabled={loading||!topic.trim()}>
            {loading?<><RefreshCw size={18} style={{animation:"spin 1s linear infinite"}}/>Generating magic…</>:<><Wand2 size={18}/>{user?"Generate Email":"Sign in to Generate"}</>}
          </button>
          {!user&&<p style={{textAlign:"center",marginTop:16,fontSize:13,color:"#9ca3af",fontFamily:"Plus Jakarta Sans"}}><button className="nl" style={{color:P,fontWeight:600}} onClick={()=>onNav("signup")}>Create free account</button> to generate & save emails</p>}
          {(output||loading)&&(
            <div style={{marginTop:32}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <label style={{fontWeight:700,fontSize:14,color:"#374151",fontFamily:"Plus Jakarta Sans"}}>Generated Email</label>
                {output&&<div style={{display:"flex",gap:8}}>
                  <span style={{fontSize:12,color:"#9ca3af",alignSelf:"center"}}>{output.length} chars</span>
                  <button className="obtn" style={{padding:"6px 14px",fontSize:12,gap:6}} onClick={copy}>{copied?<><Check size={13}/>Copied!</>:<><Copy size={13}/>Copy</>}</button>
                  <button className="obtn" style={{padding:"6px 14px",fontSize:12}} onClick={generate}><RefreshCw size={13}/></button>
                </div>}
              </div>
              {loading
                ?<div style={{background:"#fafafa",borderRadius:12,border:"1px solid #e5e7eb",padding:20,minHeight:160,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{width:36,height:36,borderRadius:"50%",border:`3px solid rgba(124,58,237,.2)`,borderTopColor:P,animation:"spin 1s linear infinite",margin:"0 auto 12px"}}/>
                      <p style={{color:"#9ca3af",fontSize:14,fontFamily:"Plus Jakarta Sans"}}>Crafting your perfect email…</p>
                    </div>
                  </div>
                :<textarea className="eout" value={output} onChange={e=>setOutput(e.target.value)}/>
              }
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Features ───────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" style={{padding:"100px 24px",background:"#fafbff",position:"relative",overflow:"hidden"}}>
      <SectionBg/>
      <div style={{maxWidth:1100,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:60}}>
          <span className="bdg" style={{background:"rgba(124,58,237,.1)",color:P,border:`1px solid rgba(124,58,237,.2)`,marginBottom:16,display:"inline-block"}}>✦ Why Mailgic</span>
          <h2 style={{fontFamily:"Syne",fontWeight:800,color:"#111827",fontSize:"clamp(32px,5vw,52px)",marginBottom:16}}>Everything you need to<br/>write better emails</h2>
          <p style={{color:"#6b7280",fontSize:17,lineHeight:1.72,maxWidth:480,margin:"0 auto"}}>Stop wasting time on emails. Mailgic handles the writing so you can focus on what matters.</p>
        </div>
        <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(238px,1fr))",gap:20}}>
          {FEATURES.map(f=>(
            <div key={f.t} className="fc">
              <div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:28,borderRadius:"0 3px 3px 0",background:`rgba(124,58,237,.3)`}}/>
              <div style={{width:46,height:46,borderRadius:12,background:"rgba(124,58,237,.1)",display:"flex",alignItems:"center",justifyContent:"center",color:P,marginBottom:16}}>{f.ic}</div>
              <h3 style={{fontFamily:"Syne",fontWeight:700,fontSize:15.5,color:"#111827",marginBottom:8}}>{f.t}</h3>
              <p style={{fontSize:13.5,color:"#6b7280",lineHeight:1.65,fontFamily:"Plus Jakarta Sans"}}>{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ───────────────────────────────────────────────────────────
function TCol({items,rev=false}) {
  const d=[...items,...items];
  return (
    <div style={{overflow:"hidden",height:480,position:"relative"}}>
      <div className={rev?"cbwd":"cfwd"} style={{display:"flex",flexDirection:"column",gap:14}}>
        {d.map((t,i)=>(
          <div key={i} className="card" style={{padding:"18px 20px",margin:"0 4px",flexShrink:0}}>
            <p style={{fontSize:13,color:"#374151",lineHeight:1.72,marginBottom:14,fontFamily:"Plus Jakarta Sans"}}>"{t.tx}"</p>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <img src={t.av} alt={t.nm} style={{width:34,height:34,borderRadius:"50%",border:"2px solid rgba(124,58,237,.2)",flexShrink:0}} loading="lazy"/>
              <div>
                <div style={{fontWeight:700,fontSize:12.5,color:"#111827",fontFamily:"Plus Jakarta Sans"}}>{t.nm}</div>
                <div style={{fontSize:11.5,color:"#9ca3af",fontFamily:"Plus Jakarta Sans"}}>{t.rl}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function Testimonials() {
  return (
    <section id="testimonials" style={{padding:"100px 24px",background:"#fff",overflow:"hidden",position:"relative"}}>
      <SectionBg/>
      <div style={{maxWidth:1100,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <span className="bdg" style={{background:"rgba(124,58,237,.1)",color:P,border:`1px solid rgba(124,58,237,.2)`,marginBottom:16,display:"inline-block"}}>✦ Loved by Thousands</span>
          <h2 style={{fontFamily:"Syne",fontWeight:800,color:"#111827",fontSize:"clamp(32px,5vw,52px)",marginBottom:16}}>Real people. Real results.</h2>
          <p style={{color:"#6b7280",fontSize:17,lineHeight:1.72}}>Join thousands who write better emails every day.</p>
        </div>
        <div style={{position:"relative"}}>
          <div className="testi-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,maxWidth:620,margin:"0 auto"}}>
            <TCol items={TEST_A}/><TCol items={TEST_B} rev/>
          </div>
          <div style={{position:"absolute",top:0,left:0,right:0,height:72,background:"linear-gradient(to bottom,#fff,transparent)",pointerEvents:"none",zIndex:2}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:72,background:"linear-gradient(to top,#fff,transparent)",pointerEvents:"none",zIndex:2}}/>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────
function Pricing({onNav,user}) {
  const [monthly,setMonthly]=useState(true);
  const sRef=useRef(null);
  // Load confetti imperatively (no useState)
  const toggle=()=>{
    const toAnnual=monthly; setMonthly(m=>!m);
    const fire=()=>{
      if(!window.confetti||!sRef.current) return;
      const r=sRef.current.getBoundingClientRect();
      window.confetti({particleCount:55,spread:60,origin:{x:(r.left+r.width/2)/window.innerWidth,y:(r.top+r.height/2)/window.innerHeight},colors:[P,PL,PD,"#a855f7","#c4b5fd"],ticks:200,gravity:1.2,decay:.93,startVelocity:28,shapes:["circle"]});
    };
    if(toAnnual){
      if(window.confetti){fire();}
      else{
        const s=document.createElement("script");
        s.src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js";
        s.onload=fire; document.head.appendChild(s);
      }
    }
  };
  return (
    <section id="pricing" style={{padding:"100px 24px",background:"#fafbff",position:"relative",overflow:"hidden"}}>
      <SectionBg/>
      <div style={{maxWidth:1000,margin:"0 auto",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <span className="bdg" style={{background:"rgba(124,58,237,.1)",color:P,border:`1px solid rgba(124,58,237,.2)`,marginBottom:16,display:"inline-block"}}>✦ Pricing</span>
          <h2 style={{fontFamily:"Syne",fontWeight:800,color:"#111827",fontSize:"clamp(32px,5vw,52px)",marginBottom:16}}>Simple, transparent pricing</h2>
          <p style={{color:"#6b7280",fontSize:17,lineHeight:1.72}}>No hidden fees. Cancel anytime.</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginTop:28}}>
            <span style={{fontFamily:"Plus Jakarta Sans",fontSize:14,fontWeight:600,color:monthly?"#111827":"#9ca3af"}}>Monthly</span>
            <div ref={sRef} className={`tt ${!monthly?"on":""}`} onClick={toggle}><div className={`th ${!monthly?"on":""}`}/></div>
            <span style={{fontFamily:"Plus Jakarta Sans",fontSize:14,fontWeight:600,color:!monthly?"#111827":"#9ca3af"}}>Annual <span style={{color:P,fontWeight:700}}>(Save 25%)</span></span>
          </div>
        </div>
        <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,alignItems:"start"}}>
          {PLANS.map((plan,i)=>(
            <div key={plan.nm} className={`card sp${i} ${plan.pop?"pp":""}`} style={{padding:"32px 28px",position:"relative"}}>
              {plan.pop&&<div style={{position:"absolute",top:-1,right:20,background:P,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:"0 0 10px 10px",display:"flex",alignItems:"center",gap:4,fontFamily:"Plus Jakarta Sans"}}><Star size={11} fill="white"/> Most Popular</div>}
              <p style={{fontSize:11.5,fontWeight:700,color:"#9ca3af",letterSpacing:".07em",textTransform:"uppercase",marginBottom:16,fontFamily:"Plus Jakarta Sans"}}>{plan.nm}</p>
              <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4}}>
                <span style={{fontFamily:"Syne",fontWeight:800,fontSize:46,color:"#111827",transition:"all .4s ease"}}>${monthly?plan.mp:plan.yp}</span>
                <span style={{fontSize:14,color:"#9ca3af",fontFamily:"Plus Jakarta Sans"}}>/ {plan.pr}</span>
              </div>
              <p style={{fontSize:12,color:"#9ca3af",marginBottom:24,fontFamily:"Plus Jakarta Sans"}}>{monthly?"billed monthly":"billed annually"}</p>
              <p style={{fontSize:13.5,color:"#6b7280",marginBottom:24,fontFamily:"Plus Jakarta Sans"}}>{plan.ds}</p>
              <ul style={{listStyle:"none",padding:0,marginBottom:28,display:"flex",flexDirection:"column",gap:10}}>
                {plan.fs.map(f=>(
                  <li key={f} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <Check size={15} color={P} style={{marginTop:2,flexShrink:0}}/>
                    <span style={{fontSize:13.5,color:"#374151",lineHeight:1.5,fontFamily:"Plus Jakarta Sans"}}>{f}</span>
                  </li>
                ))}
              </ul>
              <button className={plan.pop?"gbtn":"obtn"} style={{width:"100%",justifyContent:"center",padding:"13px"}} onClick={()=>onNav(user?"generator":"signup")}>{plan.bt}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────
function Footer({onNav}) {
  const Lnk=({label,id})=>(
    <li><button onClick={()=>onNav(id)} style={{fontSize:13.5,color:"#9ca3af",fontFamily:"Plus Jakarta Sans",background:"none",border:"none",cursor:"pointer",padding:0,transition:"color .2s",display:"flex",alignItems:"center",gap:4}} onMouseEnter={e=>{e.currentTarget.style.color=PL;}} onMouseLeave={e=>{e.currentTarget.style.color="#9ca3af";}}>{label} <ChevronRight size={12}/></button></li>
  );
  return (
    <footer style={{background:"#0f0a1e",padding:"64px 24px 32px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:48,marginBottom:48}}>
          <div>
            <Logo size={28}/>
            <p style={{fontSize:13,color:"#6b7280",marginTop:8,fontFamily:"Plus Jakarta Sans",fontWeight:300,fontStyle:"italic",letterSpacing:".01em"}}>magician for your mail</p>
            <p style={{fontSize:14,color:"#9ca3af",lineHeight:1.75,marginTop:12,maxWidth:260,fontFamily:"Plus Jakarta Sans"}}>AI-powered email generation for founders, freelancers, and professionals.</p>
          </div>
          <div>
            <h4 style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:16,color:"#fff"}}>Product</h4>
            <ul style={{listStyle:"none",padding:0,display:"flex",flexDirection:"column",gap:10}}>
              <Lnk label="Generator" id="generator"/>
              <Lnk label="Features" id="features"/>
              <Lnk label="Pricing" id="pricing"/>
              <Lnk label="Testimonials" id="testimonials"/>
            </ul>
          </div>
          <div>
            <h4 style={{fontFamily:"Syne",fontWeight:700,fontSize:14,marginBottom:16,color:"#fff"}}>Legal</h4>
            <ul style={{listStyle:"none",padding:0,display:"flex",flexDirection:"column",gap:10}}>
              <Lnk label="Privacy Policy" id="privacy"/>
              <Lnk label="Terms of Service" id="terms"/>
              <Lnk label="Security" id="security"/>
              <Lnk label="Cookie Policy" id="cookies"/>
            </ul>
          </div>
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:28,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <p style={{fontSize:13,color:"#6b7280",fontFamily:"Plus Jakarta Sans"}}>© 2026 Mailgic. All rights reserved.</p>
          <p style={{fontSize:13,color:"#6b7280",fontFamily:"Plus Jakarta Sans"}}>Made with <span style={{color:P}}>♥</span> — the magician for your mail</p>
        </div>
      </div>
    </footer>
  );
}

// ── Auth Pages (Login + Signup) — DIRECT REST API, no SDK ─────────────────
function AuthPage({mode="login",onNav,onAuth}) {
  const [email,setEmail]=useState(""); const [pass,setPass]=useState(""); const [name,setName]=useState("");
  const [showP,setShowP]=useState(false); const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(""); const [msg,setMsg]=useState("");
  const isLogin=mode==="login";

  const submit=async()=>{
    if(!email.trim()||!pass.trim()||((!isLogin)&&!name.trim())) return;
    setErr(""); setMsg(""); setLoading(true);
    try{
      if(isLogin){
        const d=await sbAuth.signIn(email,pass);
        if(!d.access_token) throw new Error(d.error_description||d.error||"Sign in failed");
        const usr={id:d.user.id,email:d.user.email,token:d.access_token,name:d.user.user_metadata?.full_name||""};
        onAuth(usr); onNav("dashboard");
      }else{
        const d=await sbAuth.signUp(email,pass,name);
        // Case 1: got session immediately (email confirm disabled / auto-confirm trigger)
        const token = d.access_token || d.session?.access_token;
        if(token && d.user){
          const usr={id:d.user.id,email:d.user.email,token,name:d.user.user_metadata?.full_name||name};
          onAuth(usr); onNav("dashboard");
        } else if(d.user){
          // Case 2: user created but needs email confirmation
          setMsg("Account created! Please check your email to confirm, then log in.");
        } else {
          throw new Error(d.error?.message||d.error||"Sign up failed");
        }
      }
    }catch(e){
      const m=String(e.message||e||"");
      if(m.includes("Failed to fetch")||m.includes("NetworkError")) setErr("Network error — check your connection.");
      else if(m.includes("Email not confirmed")) setErr("Please confirm your email first, then log in.");
      else if(m.includes("Invalid login credentials")) setErr("Wrong email or password. Please try again.");
      else if(m.includes("already registered")||m.includes("already been registered")) setErr("Email already registered — try logging in.");
      else if(m.includes("Password should be")) setErr("Password must be at least 6 characters.");
      else setErr(m||"Something went wrong. Please try again.");
    }finally{setLoading(false);}
  };

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"#1a0533",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#1a0533 0%,#2d1155 40%,#4c1d95 100%)",pointerEvents:"none",zIndex:0}}/>
      <HeroPaths position={1}/>
      <div className="gorb" style={{width:300,height:300,background:"rgba(167,139,250,.12)",top:-60,right:-30,zIndex:0}}/>

      <div style={{position:"relative",zIndex:10,padding:"20px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div onClick={()=>onNav("home")}><Logo size={26}/></div>
        <button className="nl" style={{color:"rgba(255,255,255,.7)",fontSize:13}} onClick={()=>onNav("home")}>← Back to home</button>
      </div>

      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 24px",position:"relative",zIndex:10}}>
        <div className="fi" style={{width:"100%",maxWidth:420,background:"rgba(255,255,255,.97)",borderRadius:24,padding:"40px 36px",boxShadow:"0 32px 80px rgba(0,0,0,.35)"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <Logo size={32}/>
            <h2 style={{fontFamily:"Syne",fontWeight:800,fontSize:24,color:"#111827",marginTop:20,marginBottom:6}}>
              {isLogin?"Welcome back":"Create your account"}
            </h2>
            <p style={{fontSize:14,color:"#9ca3af",fontFamily:"Plus Jakarta Sans"}}>
              {isLogin?"Sign in to your Mailgic account":"Start writing better emails today — free"}
            </p>
          </div>

          {err&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#dc2626",fontFamily:"Plus Jakarta Sans"}}>{err}</div>}
          {msg&&<div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:"#16a34a",fontFamily:"Plus Jakarta Sans"}}>{msg}</div>}

          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {!isLogin&&(
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6,fontFamily:"Plus Jakarta Sans"}}>Full Name</label>
                <input className="ainput" type="text" placeholder="Alex Johnson" value={name} onChange={e=>setName(e.target.value)}/>
              </div>
            )}
            <div>
              <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:6,fontFamily:"Plus Jakarta Sans"}}>Email address</label>
              <input className="ainput" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <label style={{fontSize:13,fontWeight:600,color:"#374151",fontFamily:"Plus Jakarta Sans"}}>Password</label>
                {isLogin&&<span style={{fontSize:12,color:"#9ca3af",fontFamily:"Plus Jakarta Sans"}}>Min 6 characters</span>}
              </div>
              <div style={{position:"relative"}}>
                <input className="ainput" type={showP?"text":"password"} placeholder={isLogin?"Enter your password":"Min 8 characters"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={{paddingRight:44}}/>
                <button onClick={()=>setShowP(s=>!s)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9ca3af",display:"flex",alignItems:"center"}}>
                  {showP?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
          </div>

          <button className="gbtn" style={{width:"100%",justifyContent:"center",padding:"15px",fontSize:15,marginTop:24}} onClick={submit} disabled={loading||!email||!pass||(!isLogin&&!name)}>
            {loading?<><RefreshCw size={16} style={{animation:"spin 1s linear infinite"}}/>{isLogin?"Signing in…":"Creating account…"}</>:isLogin?"Sign in to Mailgic":"Create Free Account"}
          </button>

          <div style={{display:"flex",alignItems:"center",gap:12,margin:"24px 0"}}>
            <div style={{flex:1,height:1,background:"#e5e7eb"}}/><span style={{fontSize:12,color:"#9ca3af",fontFamily:"Plus Jakarta Sans",whiteSpace:"nowrap"}}>or</span><div style={{flex:1,height:1,background:"#e5e7eb"}}/>
          </div>
          <p style={{textAlign:"center",fontSize:14,color:"#6b7280",fontFamily:"Plus Jakarta Sans"}}>
            {isLogin?"Don't have an account?":"Already have an account?"}{" "}
            <button className="nl" style={{color:P,fontWeight:700,fontSize:14}} onClick={()=>onNav(isLogin?"signup":"login")}>
              {isLogin?"Sign up free":"Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({user,onNav,onLogout}) {
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState(null);
  const [copied,setCopied]=useState(false);

  useEffect(()=>{
    setLoading(true);
    sbDb.getGenerations(user.token)
      .then(d=>{ if(Array.isArray(d)) setHistory(d); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[user.token]);

  const stats={
    total: history.length,
    tones: history.reduce((a,g)=>{ a[g.tone]=(a[g.tone]||0)+1; return a; },{}),
    thisWeek: history.filter(g=>new Date(g.created_at)>new Date(Date.now()-7*86400000)).length,
  };
  const topTone=Object.entries(stats.tones).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—";

  const copy=(text)=>{ navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const fmt=(d)=>new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});

  return (
    <div style={{minHeight:"100vh",background:"#f8f6ff",paddingTop:68}}>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1a0533 0%,#4c1d95 100%)",padding:"48px 24px 56px",position:"relative",overflow:"hidden"}}>
        <HeroPaths position={1}/>
        <div style={{position:"absolute",inset:0,background:"rgba(26,5,51,.3)",zIndex:0}}/>
        <div style={{maxWidth:1100,margin:"0 auto",position:"relative",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
            <div>
              <p style={{fontSize:13,color:"rgba(255,255,255,.6)",fontFamily:"Plus Jakarta Sans",marginBottom:6}}>Welcome back,</p>
              <h1 style={{fontFamily:"Syne",fontWeight:800,fontSize:"clamp(24px,4vw,38px)",color:"#fff",marginBottom:4}}>
                {user.name||user.email?.split("@")[0]} 👋
              </h1>
              <p style={{fontSize:14,color:"rgba(255,255,255,.55)",fontFamily:"Plus Jakarta Sans"}}>{user.email}</p>
            </div>
            <button className="gbtn" style={{padding:"12px 24px",fontSize:14}} onClick={()=>{onNav("home");setTimeout(()=>document.getElementById("generator")?.scrollIntoView({behavior:"smooth",block:"start"}),100);}}>
              <Wand2 size={16}/> New Email
            </button>
          </div>
          {/* Stat cards */}
          <div className="dash-stats" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:36}}>
            {[
              {ic:<Mail size={20}/>,val:stats.total,label:"Total Emails"},
              {ic:<Clock size={20}/>,val:stats.thisWeek,label:"This Week"},
              {ic:<BarChart2 size={20}/>,val:topTone,label:"Favourite Tone"},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,.1)",backdropFilter:"blur(12px)",borderRadius:16,padding:"20px 24px",border:"1px solid rgba(255,255,255,.15)"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,color:"rgba(196,181,253,.8)"}}>{s.ic}<span style={{fontSize:12,fontFamily:"Plus Jakarta Sans",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>{s.label}</span></div>
                <div style={{fontFamily:"Syne",fontWeight:800,fontSize:30,color:"#fff"}}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="dash-grid" style={{maxWidth:1100,margin:"0 auto",padding:"36px 24px 80px",display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:24,alignItems:"start"}}>
        {/* Email history list */}
        <div>
          <h2 style={{fontFamily:"Syne",fontWeight:800,fontSize:20,color:"#111827",marginBottom:20,display:"flex",alignItems:"center",gap:8}}>
            <Inbox size={20} color={P}/> Email History
          </h2>
          {loading?(
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200}}>
              <div style={{width:36,height:36,borderRadius:"50%",border:`3px solid rgba(124,58,237,.2)`,borderTopColor:P,animation:"spin 1s linear infinite"}}/>
            </div>
          ):history.length===0?(
            <div className="card" style={{padding:"40px",textAlign:"center"}}>
              <Mail size={40} color="#e5e7eb" style={{margin:"0 auto 16px"}}/>
              <p style={{color:"#9ca3af",fontFamily:"Plus Jakarta Sans",fontSize:14}}>No emails generated yet.</p>
              <button className="gbtn" style={{padding:"10px 20px",fontSize:13,marginTop:16}} onClick={()=>{onNav("home");setTimeout(()=>document.getElementById("generator")?.scrollIntoView({behavior:"smooth",block:"start"}),100);}}>Generate your first email</button>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {history.map((g,i)=>(
                <div key={g.id||i} onClick={()=>setSelected(selected?.id===g.id?null:g)}
                  style={{background:"#fff",borderRadius:14,border:`1.5px solid ${selected?.id===g.id?P+"55":"rgba(124,58,237,.12)"}`,padding:"16px 18px",cursor:"pointer",transition:"all .2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontFamily:"Plus Jakarta Sans",fontWeight:600,fontSize:13.5,color:"#111827",marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",minWidth:0}}>{g.topic}</p>
                      <div style={{display:"flex",gap:6}}>
                        <span className="bdg" style={{background:"rgba(124,58,237,.1)",color:P,fontSize:10}}>{g.tone}</span>
                        <span className="bdg" style={{background:"#f3f4f6",color:"#6b7280",fontSize:10}}>{g.length}</span>
                      </div>
                    </div>
                    <span style={{fontSize:11,color:"#9ca3af",fontFamily:"Plus Jakarta Sans",whiteSpace:"nowrap",flexShrink:0}}>{fmt(g.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email viewer */}
        <div style={{position:"sticky",top:88}}>
          <h2 style={{fontFamily:"Syne",fontWeight:800,fontSize:20,color:"#111827",marginBottom:20,display:"flex",alignItems:"center",gap:8}}>
            <Mail size={20} color={P}/> {selected?"Email Preview":"Select an email"}
          </h2>
          {selected?(
            <div className="card" style={{padding:"28px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,gap:12}}>
                <div>
                  <p style={{fontFamily:"Plus Jakarta Sans",fontWeight:700,fontSize:14,color:"#111827",marginBottom:6}}>{selected.topic}</p>
                  <div style={{display:"flex",gap:6}}>
                    <span className="bdg" style={{background:"rgba(124,58,237,.1)",color:P,fontSize:10}}>{selected.tone}</span>
                    <span className="bdg" style={{background:"#f3f4f6",color:"#6b7280",fontSize:10}}>{selected.length}</span>
                    <span className="bdg" style={{background:"#f3f4f6",color:"#6b7280",fontSize:10}}>{fmt(selected.created_at)}</span>
                  </div>
                </div>
                <button className="obtn" style={{padding:"8px 14px",fontSize:12,gap:6,flexShrink:0}} onClick={()=>copy(selected.output||"")}>
                  {copied?<><Check size={13}/>Copied!</>:<><Copy size={13}/>Copy</>}
                </button>
              </div>
              <div style={{background:"#fafafa",borderRadius:12,border:"1px solid #e5e7eb",padding:"20px",fontSize:13.5,lineHeight:1.85,color:"#374151",fontFamily:"Plus Jakarta Sans",maxHeight:420,overflowY:"auto",whiteSpace:"pre-wrap"}}>
                {selected.output||"No content saved."}
              </div>
            </div>
          ):(
            <div className="card" style={{padding:"60px 40px",textAlign:"center",border:"2px dashed rgba(124,58,237,.15)"}}>
              <Mail size={40} color="rgba(124,58,237,.2)" style={{margin:"0 auto 16px"}}/>
              <p style={{color:"#9ca3af",fontFamily:"Plus Jakarta Sans",fontSize:14}}>Click any email on the left to preview its content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Legal Pages ────────────────────────────────────────────────────────────
const LEGAL={
  privacy:{title:"Privacy Policy",updated:"March 2025",content:`<h2>1. Information We Collect</h2><p>When you use Mailgic, we collect information you provide directly to us, such as when you create an account, use our email generation service, or contact us for support.</p><h3>Account Information</h3><p>When you register, we collect your name, email address, and password. This information is used to create and manage your account.</p><h3>Email Generation Data</h3><p>We store the topics, tones, and lengths you select when generating emails, along with the generated output. This data is associated with your account and used to improve our services.</p><h2>2. How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p><h2>3. Data Security</h2><p>We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorised access, disclosure, alteration, and destruction. Your data is stored using Supabase's secure infrastructure with row-level security policies.</p><h2>4. Data Retention</h2><p>We retain your account information and generated email history for as long as your account is active. You may request deletion of your account and associated data at any time.</p><h2>5. Your Rights</h2><p>You have the right to access, update, or delete your personal information at any time. You may also opt out of marketing communications while still receiving transactional emails.</p><h2>6. Contact Us</h2><p>If you have any questions about this Privacy Policy, please contact us at privacy@mailgic.app.</p>`},
  terms:{title:"Terms of Service",updated:"March 2025",content:`<h2>1. Acceptance of Terms</h2><p>By accessing and using Mailgic, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this service.</p><h2>2. Description of Service</h2><p>Mailgic is an AI-powered email generation platform. We provide tools to help you draft professional emails using artificial intelligence. The service is provided "as is" and we make no warranties about the suitability of generated content for any specific purpose.</p><h2>3. User Responsibilities</h2><p>You are responsible for maintaining the confidentiality of your account credentials. You agree not to use Mailgic to generate spam, phishing emails, or any content that violates applicable laws or regulations.</p><h2>4. Intellectual Property</h2><p>The Mailgic service, including its original content, features, and functionality, is owned by Mailgic and protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p><h2>5. Limitations of Liability</h2><p>Mailgic shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of, or inability to use, the service.</p><h2>6. Modifications to Terms</h2><p>We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the new terms.</p>`},
  security:{title:"Security",updated:"March 2025",content:`<h2>Our Commitment to Security</h2><p>At Mailgic, security is a top priority. We have implemented comprehensive security measures to protect your data and ensure the integrity of our services.</p><h2>Infrastructure Security</h2><p>Mailgic is built on Supabase's enterprise-grade infrastructure, which includes:</p><ul><li>Data encrypted at rest using AES-256</li><li>Data encrypted in transit using TLS 1.3</li><li>Row-level security policies ensuring users can only access their own data</li><li>Regular automated backups with point-in-time recovery</li></ul><h2>Authentication</h2><p>We use industry-standard JWT authentication. Passwords are hashed using bcrypt. We support secure session management with automatic expiry.</p><h2>API Security</h2><p>All API calls are authenticated and authorised. We use Supabase's Row Level Security (RLS) to ensure data isolation between users.</p><h2>Responsible Disclosure</h2><p>If you discover a security vulnerability, please report it to security@mailgic.app.</p>`},
  cookies:{title:"Cookie Policy",updated:"March 2025",content:`<h2>What Are Cookies</h2><p>Cookies are small text files stored on your device when you visit a website. They help us provide a better experience by remembering your preferences.</p><h2>Essential Cookies</h2><p>These cookies are necessary for the website to function properly. They include authentication tokens that keep you logged in and session cookies that maintain your preferences during a visit.</p><h2>Analytics Cookies</h2><p>We use analytics cookies to understand how visitors interact with our website. All analytics data is anonymised and aggregated.</p><h2>Preference Cookies</h2><p>These cookies remember your settings such as tone preferences and email length selections.</p><h2>Managing Cookies</h2><p>You can control cookies through your browser settings. Note that disabling certain cookies may affect the functionality of Mailgic.</p><h2>Third-Party Cookies</h2><p>We use Supabase for authentication and data storage. We do not use advertising or tracking cookies from third-party ad networks.</p>`}
};

function LegalPage({id,onNav}) {
  const page=LEGAL[id]||LEGAL.privacy;
  useEffect(()=>{window.scrollTo({top:0});},[id]);
  return (
    <div style={{minHeight:"100vh",background:"#fff",position:"relative",overflow:"hidden"}}>
      <SectionBg/>
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(255,255,255,.96)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(124,58,237,.1)",padding:"0 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div onClick={()=>onNav("home")}><Logo size={26}/></div>
          <button className="obtn" style={{padding:"8px 18px",fontSize:13}} onClick={()=>onNav("home")}>← Back to home</button>
        </div>
      </div>
      <div style={{maxWidth:760,margin:"0 auto",padding:"60px 24px 100px",position:"relative",zIndex:1}}>
        <div style={{marginBottom:40}}>
          <span className="bdg" style={{background:"rgba(124,58,237,.1)",color:P,border:`1px solid rgba(124,58,237,.2)`,marginBottom:16,display:"inline-block"}}>Legal</span>
          <h1 style={{fontFamily:"Syne",fontWeight:800,fontSize:"clamp(28px,4vw,44px)",color:"#111827",marginBottom:12}}>{page.title}</h1>
          <p style={{fontSize:14,color:"#9ca3af",fontFamily:"Plus Jakarta Sans"}}>Last updated: {page.updated}</p>
        </div>
        <div className="legal-content" dangerouslySetInnerHTML={{__html:page.content}}/>
        <div style={{marginTop:56,padding:"28px",background:"#fafbff",borderRadius:16,border:"1px solid rgba(124,58,237,.1)"}}>
          <h3 style={{fontFamily:"Syne",fontWeight:700,fontSize:15,color:"#111827",marginBottom:16}}>Other Legal Documents</h3>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {Object.entries(LEGAL).filter(([k])=>k!==id).map(([k,v])=>(
              <button key={k} onClick={()=>onNav(k)} className="obtn" style={{padding:"8px 16px",fontSize:13}}>{v.title}</button>
            ))}
          </div>
        </div>
      </div>
      <Footer onNav={onNav}/>
    </div>
  );
}

// ── 404 Page ───────────────────────────────────────────────────────────────
function NotFound({onNav}) {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#fafbff",padding:"24px",textAlign:"center"}}>
      <SectionBg/>
      <div style={{position:"relative",zIndex:1}}>
        <div style={{fontFamily:"Syne",fontWeight:800,fontSize:"clamp(80px,20vw,160px)",color:"rgba(124,58,237,.1)",lineHeight:1,marginBottom:-20}}>404</div>
        <div style={{fontSize:40,marginBottom:16}}>👻</div>
        <h2 style={{fontFamily:"Syne",fontWeight:800,fontSize:28,color:"#111827",marginBottom:12}}>Page not found</h2>
        <p style={{color:"#6b7280",fontSize:16,marginBottom:32,maxWidth:360,fontFamily:"Plus Jakarta Sans"}}>The page you're looking for has vanished into thin air. Let's get you back on track.</p>
        <button className="gbtn" onClick={()=>onNav("home")}><ArrowRight size={16}/> Back to Home</button>
      </div>
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────────────────
function HomePage({onNav,user}) {
  return (
    <>
      <Hero onNav={onNav} user={user}/>
      <Generator onNav={onNav} user={user}/>
      <Features/>
      <Testimonials/>
      <Pricing onNav={onNav} user={user}/>
      <Footer onNav={onNav}/>
    </>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState("home");
  const [user,setUser]=useState(null);
  const [ready,setReady]=useState(false);

  // Brief mount delay so fonts load before render — prevents FOUT flash
  useEffect(()=>{ const t=setTimeout(()=>setReady(true),120); return()=>clearTimeout(t); },[]);

  const nav=useCallback((id)=>{
    const SECTIONS=["features","generator","pricing","testimonials"];
    if(page==="home"&&(SECTIONS.includes(id)||id==="home")){
      if(id==="home"){window.scrollTo({top:0,behavior:"smooth"});return;}
      const el=document.getElementById(id);
      if(el){el.scrollIntoView({behavior:"smooth",block:"start"});return;}
    }
    const PAGES=["login","signup","dashboard","privacy","terms","security","cookies"];
    if(PAGES.includes(id)){setPage(id);window.scrollTo({top:0});return;}
    if(id==="home"||SECTIONS.includes(id)){
      setPage("home");
      setTimeout(()=>{
        if(id==="home"){window.scrollTo({top:0,behavior:"smooth"});return;}
        document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
      },60);
    }
  },[page]);

  const logout=useCallback(async()=>{
    if(user?.token) await sbAuth.signOut(user.token).catch(()=>{});
    setUser(null); setPage("home");
  },[user]);

  if(!ready) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#1a0533"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <Logo size={36}/>
        <div style={{width:32,height:32,borderRadius:"50%",border:"3px solid rgba(139,92,246,.3)",borderTopColor:"#8B5CF6",animation:"spin 0.8s linear infinite"}}/>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  const VALID_PAGES=["home","login","signup","dashboard","privacy","terms","security","cookies"];
  const isValid=VALID_PAGES.includes(page);

  return (
    <>
      <style>{CSS}</style>
      <Navbar onNav={nav} user={user} onLogout={logout} page={page}/>
      {page==="home"&&<HomePage onNav={nav} user={user}/>}
      {page==="dashboard"&&user&&<Dashboard user={user} onNav={nav} onLogout={logout}/>}
      {page==="dashboard"&&!user&&<AuthPage mode="login" onNav={nav} onAuth={setUser}/>}
      {page==="login"&&<AuthPage mode="login" onNav={nav} onAuth={setUser}/>}
      {page==="signup"&&<AuthPage mode="signup" onNav={nav} onAuth={setUser}/>}
      {["privacy","terms","security","cookies"].includes(page)&&<LegalPage id={page} onNav={nav}/>}
      {!isValid&&<NotFound onNav={nav}/>}
    </>
  );
}
