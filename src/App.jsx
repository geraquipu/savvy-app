import AppLoader from "./screens/AppLoader";
import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { supabase } from "./supabase";
import { C, SERIF, SANS } from "./constants/colors";
import { DEMO_USERS, CATS, SUBCATS, TRUST_LEVELS, getTrustLevel, BOOKINGS_KEY, THREADS_KEY, getBookings, saveBookings, addBooking, updateBooking, getThreads, addThread, EXPERTS, CAT_MAP, DEMO_MSGS } from "./constants/data";
import { EXPERT_EXTRAS, EXPERT_STYLE_TAGS, EXPERT_FIRST_SESSION } from "./constants/expertExtras";
import { SESSIONS_AVENIR, SESSIONS_PASSEES, SESSIONS_ANNULEES } from "./constants/sessionData";
import { Stars, Av, LoginGate, ExpertCard } from "./components/ui";
import { HomeScreen, ExpertScreen } from "./screens";

// Après un déploiement, les anciens chunks (assets/Xxx-<hash>.js) n'existent plus.
// Un onglet resté ouvert sur l'ancienne version échoue en les chargeant → écran blanc.
// On recharge la page une seule fois pour récupérer la nouvelle version.
const CHUNK_RELOAD_KEY = "savvy_chunk_reloaded";
const lazyWithReload = (factory) =>
  lazy(() =>
    factory()
      .then((mod) => { try { sessionStorage.removeItem(CHUNK_RELOAD_KEY); } catch {} return mod; })
      .catch((err) => {
        let already = false;
        try { already = sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1"; } catch {}
        if (!already) {
          try { sessionStorage.setItem(CHUNK_RELOAD_KEY, "1"); } catch {}
          window.location.reload();
          return new Promise(() => {}); // la page se recharge, on ne résout jamais
        }
        throw err; // déjà tenté : laisser remonter l'erreur (Sentry la verra)
      })
  );

// Lazy-loaded screens — only downloaded when first visited
const MessagingScreen     = lazyWithReload(() => import("./screens/MessagingScreen"));
const BookingScreen       = lazyWithReload(() => import("./screens/BookingScreen"));
const MessagesListScreen  = lazyWithReload(() => import("./screens/MessagesListScreen"));
const OnboardingScreen    = lazyWithReload(() => import("./screens/OnboardingScreen"));
const SplashScreen        = lazyWithReload(() => import("./screens/SplashScreen"));
const LandingScreen       = lazyWithReload(() => import("./screens/LandingScreen"));
const HowItWorksScreen    = lazyWithReload(() => import("./screens/HowItWorksScreen"));
const MatchScreen         = lazyWithReload(() => import("./screens/MatchScreen"));
const SearchScreen        = lazyWithReload(() => import("./screens/SearchScreen"));
const SuccessScreen       = lazyWithReload(() => import("./screens/SuccessScreen"));
const ReservationsScreen  = lazyWithReload(() => import("./screens/ReservationsScreen"));
const SignupScreen         = lazyWithReload(() => import("./screens/SignupScreen"));
const ProfileScreen        = lazyWithReload(() => import("./screens/ProfileScreen"));
const NotificationPanel    = lazyWithReload(() => import("./screens/NotificationPanel"));
const AuthModal            = lazyWithReload(() => import("./screens/AuthModal"));
const PublicProfileScreen  = lazyWithReload(() => import("./screens/PublicProfileScreen"));
const AdminScreen          = lazyWithReload(() => import("./screens/AdminScreen"));

// ── Upload photo vers Supabase Storage ──────────────────────────────────────
async function uploadPhoto(file, userId) {
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  const path = `experts/${userId || 'anon'}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

const MENU_ICONS = {
  "⚙️": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={3}/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  "💳": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={1} y={4} width={22} height={16} rx={2}/><line x1={1} y1={10} x2={23} y2={10}/></svg>,
  "⭐": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  "🤝": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M17 11l-5-5H6l-3 3 4 4"/><path d="m7 11 4 4 7-7"/><path d="m14 7 3 3-7 7-4-4"/></svg>,
  "📋": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x={8} y={2} width={8} height={4} rx={1}/></svg>,
  "🔒": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  "💬": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  "📧": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  "🍪": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={10}/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1={9} y1={9} x2={9.01} y2={9}/><line x1={15} y1={9} x2={15.01} y2={9}/></svg>,
  "🔔": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  "👤": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>,
  "💰": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  "🌍": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  "📅": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>,
  "🗓️": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/><line x1={8} y1={14} x2={8} y2={14}/><line x1={12} y1={14} x2={12} y2={14}/><line x1={16} y1={14} x2={16} y2={14}/></svg>,
  "💼": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={2} y={7} width={20} height={14} rx={2}/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1={12} y1={12} x2={12} y2={12}/></svg>,
  "⚡": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  "🔁": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  "❌": <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>,
  "💡": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><line x1={9} y1={18} x2={15} y2={18}/><line x1={10} y1={22} x2={14} y2={22}/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
};




// Client convs unread state for expert mode badge calculation
const EXPERT_CLIENT_CONVS = [
  {id:"c1", unread:0},
  {id:"c2", unread:1},
  {id:"c3", unread:0},
];


const inp = { width:"100%", padding:"10px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white };
const lbl = { fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:".5px" };

function SkeletonCard() {
  return (
    <div style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,padding:"16px",marginBottom:12}}>
      <div style={{display:"flex",gap:13,alignItems:"flex-start",marginBottom:12}}>
        <div style={{width:52,height:52,borderRadius:14,background:C.cream3,flexShrink:0,animation:"pulse 1.4s ease-in-out infinite"}}/>
        <div style={{flex:1}}>
          <div style={{height:14,background:C.cream3,borderRadius:6,marginBottom:8,width:"65%",animation:"pulse 1.4s ease-in-out infinite"}}/>
          <div style={{height:10,background:C.cream3,borderRadius:6,marginBottom:8,width:"45%",animation:"pulse 1.4s ease-in-out infinite .1s"}}/>
          <div style={{height:10,background:C.cream3,borderRadius:6,width:"55%",animation:"pulse 1.4s ease-in-out infinite .2s"}}/>
        </div>
      </div>
      <div style={{height:48,background:C.cream3,borderRadius:10,animation:"pulse 1.4s ease-in-out infinite .15s"}}/>
    </div>
  );
}


function VerBadge({ small }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.sageL, borderRadius:20, padding:small?"2px 8px":"4px 11px" }}>
    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
    <span style={{ fontSize:small?9:10, color:C.sage, fontWeight:700, letterSpacing:.2 }}>Vérifié</span>
  </span>;
}

function MetricsGrid({ metrics }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, margin:"10px 0" }}>
    {(metrics||[]).map((m,i) => <div key={i} style={{ background:C.cream, borderRadius:12, padding:"9px 11px", display:"flex", alignItems:"center", gap:9, border:`1px solid ${C.borderF}` }}>
      <span style={{ fontSize:15 }}>{m.icon}</span>
      <div>
        <div style={{ fontSize:13, fontWeight:800, color:C.ink, lineHeight:1.1, fontFamily:SERIF }}>{m.value}</div>
        <div style={{ fontSize:10, color:C.muted, lineHeight:1.3 }}>{m.label}</div>
      </div>
    </div>)}
  </div>;
}

// ExpertCard → moved to src/components/ui/ExpertCard.jsx
// ─── LoginGate → moved to src/components/ui/LoginGate.jsx ─────────────────────

// ─── ProfileSetupModal ─────────────────────────────────────────────────────────
function ProfileSetupModal({ authUser, onDone }) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [city, setCity]           = useState("");
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState(null);

  const save = async () => {
    const name = (firstName.trim()+" "+lastName.trim()).trim();
    if (!name) return;
    setSaving(true);
    const payload = { name, city: city.trim() || null };
    const { error } = await supabase.from("profiles").update(payload).eq("id", authUser.id);
    // Sans ce contrôle, un échec d'écriture marquait quand même l'installation
    // comme terminée : le nom n'était jamais enregistré, l'utilisateur
    // apparaissait « Client Savvy » partout, et l'écran ne revenait plus.
    if (error) {
      setSaving(false);
      setSaveError("Ton profil n'a pas pu être enregistré. Vérifie ta connexion et réessaie.");
      return;
    }
    try { localStorage.setItem(`savvy_setup_done_${authUser.id}`, "1"); } catch {}
    onDone({ ...authUser, name, city: city.trim() || authUser.city });
  };

  const steps = [
    // Step 0 — Bienvenue + prénom/nom
    <div key="s0" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:26,fontWeight:800,color:C.ink,fontFamily:SERIF,lineHeight:1.2}}>
        Bienvenue sur Savvy
      </div>
      <div style={{fontSize:14,color:C.muted,lineHeight:1.6}}>
        Avant de commencer, dis-nous comment tu t'appelles.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
        <input
          placeholder="Prénom"
          value={firstName}
          onChange={e=>setFirstName(e.target.value)}
          style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:15,fontFamily:"inherit",background:C.white,color:C.ink}}
        />
        <input
          placeholder="Nom"
          value={lastName}
          onChange={e=>setLastName(e.target.value)}
          style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:15,fontFamily:"inherit",background:C.white,color:C.ink}}
        />
      </div>
      <button
        onClick={()=>{ if(!firstName.trim()) return; setStep(1); }}
        style={{marginTop:8,padding:"14px",borderRadius:14,border:"none",background:firstName.trim()?C.ink:C.cream3,color:firstName.trim()?C.white:C.muted,fontSize:15,fontWeight:700,cursor:firstName.trim()?"pointer":"default",fontFamily:"inherit"}}
      >Continuer →</button>
    </div>,

    // Step 1 — Ville (optionnel)
    <div key="s1" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:22,fontWeight:800,color:C.ink,fontFamily:SERIF,lineHeight:1.2}}>
        Tu es basé(e) où ?
      </div>
      <div style={{fontSize:14,color:C.muted,lineHeight:1.6}}>
        Ça aide les experts à mieux te connaître. Tu peux sauter cette étape.
      </div>
      <input
        placeholder="Paris, Lyon, Montréal…"
        value={city}
        onChange={e=>setCity(e.target.value)}
        style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:15,fontFamily:"inherit",background:C.white,color:C.ink,marginTop:8}}
      />
      {saveError && (
        <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:11,padding:"10px 13px",marginTop:8,fontSize:12.5,color:"#B91C1C",lineHeight:1.5}}>
          {saveError}
        </div>
      )}
      <button
        onClick={()=>{ setSaveError(null); save(); }}
        disabled={saving}
        style={{marginTop:4,padding:"14px",borderRadius:14,border:"none",background:C.ink,color:C.white,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:saving?.6:1}}
      >{saving?"Enregistrement…":"C'est parti ✓"}</button>
      <button
        onClick={save}
        style={{padding:"10px",borderRadius:14,border:"none",background:"transparent",color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}
      >Passer cette étape</button>
    </div>,
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:430,background:C.cream,borderRadius:"24px 24px 0 0",padding:"32px 24px 48px",animation:"fadeSlideUp .3s ease-out"}}>
        {/* Indicateur d'étapes */}
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {[0,1].map(i=>(
            <div key={i} style={{flex:1,height:3,borderRadius:4,background:i<=step?C.ink:C.cream3,transition:"background .3s"}}/>
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  );
}

// ─── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({ onNotif, notifCount, isLoggedIn, onLogin, isExpert, appMode, onToggleMode, expertBadge=0 }) {
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:200,paddingTop:"calc(env(safe-area-inset-top) + 12px)",paddingBottom:"11px",paddingLeft:"16px",paddingRight:"16px",background:C.white,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:C.gold}}/>
        <span style={{fontSize:20,fontWeight:800,color:C.ink,letterSpacing:"-.5px",fontFamily:SANS}}>savvy</span>
      </div>

      {/* Mode toggle */}
      {isLoggedIn && isExpert && (
        <div style={{display:"flex",alignItems:"center",background:C.cream2,borderRadius:20,padding:3,border:`1px solid ${C.border}`,flexShrink:0}}>
          <button onClick={()=>onToggleMode("client")} style={{padding:"5px 12px",borderRadius:17,border:"none",cursor:"pointer",fontFamily:SANS,fontSize:11,fontWeight:600,transition:"all .2s",
            background:appMode==="client"?C.white:"transparent",
            color:appMode==="client"?C.ink:C.muted,
            boxShadow:appMode==="client"?"0 1px 4px rgba(0,0,0,.08)":"none"
          }}>Client</button>
          <button onClick={()=>onToggleMode("expert")} style={{padding:"5px 12px",borderRadius:17,border:"none",cursor:"pointer",fontFamily:SANS,fontSize:11,fontWeight:600,transition:"all .2s",
            background:appMode==="expert"?C.gold:"transparent",
            color:appMode==="expert"?C.white:C.muted,
            boxShadow:appMode==="expert"?"0 1px 4px rgba(91,140,106,.3)":"none"
          }}>Expert{appMode==="client" && expertBadge > 0 && <span style={{marginLeft:4,display:"inline-flex",alignItems:"center",justifyContent:"center",width:15,height:15,borderRadius:"50%",background:"#EF4444",color:"#fff",fontSize:8,fontWeight:700}}>{expertBadge}</span>}</button>
        </div>
      )}

      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
        {isLoggedIn ? (
          <button onClick={onNotif} style={{background:"none",border:"none",cursor:"pointer",position:"relative",padding:4,borderRadius:10}}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={1.8}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {notifCount > 0 && <div style={{position:"absolute",top:1,right:1,width:15,height:15,borderRadius:"50%",background:C.sage,color:C.white,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{notifCount}</div>}
          </button>
        ) : (
          <button onClick={onLogin} style={{padding:"7px 16px",borderRadius:20,border:"none",background:C.gold,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SANS}}>
            Connexion
          </button>
        )}
      </div>
    </div>
  );
}

// ─── BottomNav ───────────────────────────────────────────────────────────────
function BottomNav({nav, onChange, unreadCount, appMode, sessionsCount=0, reservationsCount=0}) {

  const clientItems = [
    {id:"home",        label:"Accueil",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
    {id:"messages",    label:"Échanges",     icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, badge:unreadCount},
    {id:"reservations",label:"Réservations", icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, badge:reservationsCount},
    {id:"profile",     label:"Profil",       icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>},
  ];

  const expertItems = [
    {id:"exp-dashboard", label:"Dashboard",     icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={2} y={3} width={20} height={14} rx={2}/><line x1={8} y1={21} x2={16} y2={21}/><line x1={12} y1={17} x2={12} y2={21}/></svg>},
    {id:"exp-sessions",  label:"Sessions",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, badge:sessionsCount},
    {id:"messages",      label:"Messages",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, badge:unreadCount},
    {id:"exp-dispo",     label:"Disponibilités",icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><circle cx={12} cy={12} r={9}/><polyline points="12 7 12 12 15 15"/></svg>},
    {id:"exp-compte",    label:"Mon compte",    icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>},
  ];

  const items = appMode === "expert" ? expertItems : clientItems;

  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:200,background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",paddingTop:"8px",paddingBottom:"calc(env(safe-area-inset-bottom) + 8px)"}}>
      {items.map(item=>{
        const a = nav===item.id;
        return (
          <button key={item.id} onClick={()=>onChange(item.id)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"2px 6px",border:"none",background:"none",color:a?C.gold:C.faint,fontSize:10,fontWeight:a?700:500,fontFamily:SANS,position:"relative",flex:1,transition:"color .2s"}}>
            <div style={{position:"relative",width:42,height:34,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,background:a?C.ink:"transparent",transition:"background .2s"}}>
              <div style={{color:a?C.white:"currentColor"}}>{item.icon(a)}</div>
              {item.badge>0 && <div style={{position:"absolute",top:3,right:3,width:14,height:14,borderRadius:"50%",background:"#EF4444",color:C.white,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{item.badge}</div>}
            </div>
            <span style={{fontSize:appMode==="expert"?8:9,whiteSpace:"nowrap",letterSpacing:"-.1px",color:a?C.ink:C.faint}}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Onboarding: toujours montré en démo (1 fois par session)
  // En production: utiliser localStorage.getItem("savvy_onboarded")
  const isDesktop = window.innerWidth > 768;
  const [showLoader, setShowLoader] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(!isDesktop && !sessionStorage.getItem("savvy_onboarding_seen"));
  const [showSplash, setShowSplash] = useState(!isDesktop);
  const [showLanding, setShowLanding] = useState(isDesktop);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [isExpert, setIsExpert] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [newExpertProfile, setNewExpertProfile] = useState(null); // profile créé pendant session
  const [authIntent, setAuthIntent] = useState(null); // action after login
  const [nav,    setNav]    = useState("home");
  const [bookingInfo, setBookingInfo] = useState(null);
  const [screen, setScreen] = useState("home");
  const [expert, setExpert] = useState(null);
  const [phase,  setPhase]  = useState(null);
  const [prevScreen, setPrevScreen] = useState("home");
  const [prevMsgScreen, setPrevMsgScreen] = useState("messages");
  const [searchQ,   setSearchQ]   = useState("");
  const [searchCat, setSearchCat] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showPaymentCancel, setShowPaymentCancel] = useState(false);
  const [sharedExpertId, setSharedExpertId] = useState(null); // profil partagé via /p/<id>
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [readMsgIds, setReadMsgIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savvy_read_msgs") || "[]"); } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem("savvy_read_msgs", JSON.stringify(readMsgIds)); } catch {} }, [readMsgIds]);
  const [expRequestsCount, setExpRequestsCount] = useState(() => (newExpertProfile || authUser?.real) ? 0 : 2); // synced from ProfileScreen
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // ── Push notifications : register service worker + subscribe ──
  useEffect(() => {
    if (!authUser?.real || !authUser?.id) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const VAPID_PUBLIC = "BNaRkGUch6UJgKgCALtZdv-3qjAJeeUqa8Hp0-PVHQHFsTv_ck9g4XJotLNoMZ1kNo1-ssTmGjym3TLzDyfdJQ4";
    const urlB64ToUint8 = (b64) => { const p = (b64+"===").slice(0,b64.length+(4-b64.length%4)%4).replace(/-/g,"+").replace(/_/g,"/"); const r = atob(p); return Uint8Array.from(r, c=>c.charCodeAt(0)); };
    navigator.serviceWorker.register("/sw.js").then(reg => {
      Notification.requestPermission().then(async perm => {
        if (perm !== "granted") return;
        try {
          const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8(VAPID_PUBLIC) });
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            await supabase.functions.invoke("save-push-subscription", {
              body: { subscription: sub.toJSON() },
              headers: { Authorization: `Bearer ${session.access_token}` },
            });
          }
        } catch(e) { console.warn("push subscribe:", e.message); }
      });
    }).catch(e => console.warn("sw register:", e.message));
  }, [authUser?.real, authUser?.id]);

  // ── Supabase : charger les demandes en attente pour l'expert ──
  useEffect(() => {
    if (!authUser?.real || !authUser?.id || !authUser?.isExpert || !authUser?.expertId) return;
    const eid = authUser.expertId;
    const load = () =>
      supabase.from("bookings").select("id", { count: "exact" })
        .eq("expert_id", eid).eq("status", "pending")
        .then(({ count }) => { if (count != null) setExpRequestsCount(count); });
    load();
    const channel = supabase.channel("expert-bookings-"+eid)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `expert_id=eq.${eid}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id, authUser?.isExpert]);
  const [clientPendingCount, setClientPendingCount] = useState(0);
  const [clientToPayCount, setClientToPayCount] = useState(0);  // demandes acceptées, en attente de paiement
  // ── Réservations du client qui demandent une action (à payer / à accepter) ──
  // Calculé ici (pas dans ReservationsScreen) pour que la cloche et le badge
  // se mettent à jour même si l'utilisateur n'ouvre jamais l'écran Réservations.
  useEffect(() => {
    if (!authUser?.real || !authUser?.id) { setClientPendingCount(0); return; }
    const cid = authUser.id;
    const load = () =>
      supabase.from("bookings").select("status, paid, reschedule_by, date_session")
        .eq("client_id", cid).in("status", ["pending", "confirmed"])
        .then(({ data }) => {
          if (!data) return;
          // Ne compter que les sessions encore actionnables (pas déjà passées),
          // sinon une session expirée non payée gonfle le badge à vide.
          const notPast = (b) => !b.date_session || (new Date(b.date_session).getTime() + 90*60000) > Date.now();
          const actionable = data.filter(notPast);
          // On distingue les deux états : sinon accepter une demande ne change
          // pas le compteur (1 avant, 1 après) et le client ne voit jamais que
          // le conseiller a répondu.
          const toPay = actionable.filter(b => b.status === "confirmed" && !b.paid).length;
          const waiting = actionable.filter(b => b.status === "pending").length;
          setClientToPayCount(toPay);
          setClientPendingCount(toPay + waiting);
        });
    load();
    // Nom unique : ReservationsScreen utilise déjà "client-bookings-<cid>".
    // Deux canaux avec le même nom -> "cannot add postgres_changes after subscribe()".
    const channel = supabase.channel("client-bookings-badge-" + cid)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `client_id=eq.${cid}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [authUser?.real, authUser?.id]);
  const [realUnreadCount, setRealUnreadCount] = useState(0);
  const [appMode, setAppMode] = useState("client"); // "client" | "expert"
  const [expInitSection, setExpInitSection] = useState(null); // section to open in ProfileScreen
  const [dbExperts, setDbExperts] = useState([]);
  const [expertsLoaded, setExpertsLoaded] = useState(false);

  // ── Supabase : charger les experts ──
  // Experts réels + un seul profil démo (Clément) qui sert de guide/modèle
  // pour la création de profil. À retirer plus tard.
  const GUIDE_DEMO = EXPERTS[0]; // Clément Rousseau — exemple de profil complet
  useEffect(() => {
    supabase.from("experts").select("*").eq("active", true).order("created_at", { ascending: false })
      .then(({ data }) => {
        const real = data || [];
        setDbExperts([...real, GUIDE_DEMO]); // réels + Clément comme guide
        setExpertsLoaded(true);
      })
      .catch(() => { setDbExperts([GUIDE_DEMO]); setExpertsLoaded(true); });
  }, []);

  // ── Supabase : compter les messages non lus (badge notif/menu) pour utilisateurs réels ──
  useEffect(() => {
    if (!authUser?.real || !authUser?.id) { setRealUnreadCount(0); return; }
    let cancelled = false;
    const load = () => {
      const isExpertMode = appMode === "expert" && authUser?.expertId;
      const q = isExpertMode
        ? supabase.from("messages").select("*").eq("expert_id", authUser.expertId).order("created_at", { ascending: false })
        : supabase.from("messages").select("*").or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`).order("created_at", { ascending: false });
      q.then(({ data }) => {
        if (cancelled || !data) { setRealUnreadCount(0); return; }
        const seen = new Map();
        for (const m of data) {
          const key = isExpertMode ? (m.sender_id===authUser.id ? m.receiver_id : m.sender_id) : m.expert_id;
          if (!key || seen.has(key)) continue;
          seen.set(key, m);
        }
        let count = 0;
        for (const [key, m] of seen) {
          const convKey = isExpertMode ? "cli-"+key : "exp-"+key;
          // Non lu = dernier message entrant, pas encore lu en base (read_at)
          // ni marqué lu localement (readMsgIds).
          if (m.sender_id !== authUser.id && !m.read_at && !readMsgIds.includes(convKey)) count++;
        }
        setRealUnreadCount(count);
      });
    };
    load();
    const channel = supabase.channel("unread-msgs-"+authUser.id+"-"+appMode)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [authUser?.real, authUser?.id, authUser?.expertId, appMode, readMsgIds]);

  // ── Supabase : restaurer la session + charger le profil ──
  const loadProfile = async (u) => {
    const googlePhoto = u.user_metadata?.avatar_url || u.user_metadata?.picture || null;
    const base = { email:u.email, name:u.user_metadata?.full_name || u.user_metadata?.name || u.email.split("@")[0], isExpert:false, real:true, id:u.id };
    try {
      // Colonnes explicites (pas de email : donnée personnelle protégée au niveau colonne).
      // L'email de l'utilisateur vient de la session auth (u.email), pas de cette table.
      const PROFILE_COLS = "id, name, city, expert_domain";
      let { data } = await supabase.from("profiles").select(PROFILE_COLS).eq("id", u.id).maybeSingle();
      if (!data) {
        // Le trigger handle_new_user a peut-être échoué — on crée le profil manuellement
        const { data: created } = await supabase.from("profiles")
          .upsert({ id: u.id, name: u.user_metadata?.name || base.name }, { onConflict: "id" })
          .select(PROFILE_COLS).single();
        data = created;
      }
      if (data) {
        let photoUrl = null;
        let expertId = null;
        let isApprovedExpert = false;
        const { data: exp } = await supabase.from("experts").select("id, photo_url, active").eq("user_id", u.id).maybeSingle();
        if (exp) {
          photoUrl = exp.photo_url || googlePhoto;
          expertId = exp.id || null;
          isApprovedExpert = !!exp.active;
        } else {
          photoUrl = googlePhoto;
        }
        return { ...base, name:data.name||base.name, city:data.city, isExpert:isApprovedExpert, expertDomain:data.expert_domain, photoUrl, expertId, pendingExpert: !!exp && !exp.active };
      }
    } catch (e) {
      // On retombe sur le profil minimal : l'utilisateur apparaît sans nom et,
      // s'il est conseiller, sans accès à son espace. Silencieux, c'était
      // indiagnosticable.
      console.warn("[loadProfile] échec, profil minimal utilisé:", e?.message || e);
    }
    return base;
  };
  useEffect(() => {
    const needsSetup = (profil, u) => {
      if (!profil.real) return false;
      try { if (localStorage.getItem(`savvy_setup_done_${u.id}`)) return false; } catch {}
      return !profil.name || profil.name === u.email?.split("@")[0];
    };
    // Handle shared expert profile links: getsavvy.fr/p/<expertId>
    const pMatch = window.location.pathname.match(/^\/p\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    if (pMatch) {
      setSharedExpertId(pMatch[1]);
      setShowLanding(false); setShowOnboarding(false); setShowSplash(false);
      setScreen("public"); setNav("home");
    }
    // Handle Stripe payment return
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const bookingId = urlParams.get("booking");
    if (paymentStatus === "success" && bookingId) {
      // On ne marque JAMAIS payé depuis le navigateur : seul le webhook Stripe
      // (service role) fait foi. Cette URL est publique — la visiter suffisait
      // à marquer n'importe quelle réservation comme payée sans qu'un euro
      // n'ait bougé, et c'est ce qui a créé de faux revenus côté conseiller.
      // Ici on se contente d'emmener l'utilisateur voir sa réservation ; le
      // statut se mettra à jour quand Stripe aura confirmé.
      window.history.replaceState({}, "", window.location.pathname);
      // Emmener l'utilisateur vers ses réservations pour voir la session payée
      setScreen("reservations"); setNav("reservations");
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 5000);
    } else if (paymentStatus === "cancel") {
      // L'utilisateur a quitté Stripe sans payer : la session reste "à payer",
      // rien n'est perdu. On nettoie l'URL et on le rassure.
      window.history.replaceState({}, "", window.location.pathname);
      setScreen("reservations"); setNav("reservations");
      setShowPaymentCancel(true);
      setTimeout(() => setShowPaymentCancel(false), 6000);
    }

    supabase.auth.getSession().then(async ({ data:{ session } }) => {
      if (session?.user) {
        const profil = await loadProfile(session.user);
        setAuthUser(profil);
        if (profil.isExpert) setIsExpert(true);
        setIsLoggedIn(true);
        setShowOnboarding(false);
        if (needsSetup(profil, session.user)) setShowProfileSetup(true);
      }
      setAuthReady(true);
    });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) return; // logout géré par onLogout
      if (_event === "SIGNED_IN") {
        const profil = await loadProfile(session.user);
        try {
          localStorage.removeItem("savvy_bookings");
          localStorage.removeItem("savvy_threads");
        } catch {}
        setAuthUser(prev => prev?.real ? prev : profil);
        if (profil.isExpert) setIsExpert(true);
        setIsLoggedIn(true);
        setShowSplash(false);
        setShowLanding(false);
        if (needsSetup(profil, session.user)) setShowProfileSetup(true);
        // Si venía del flujo experto (Google/Apple OAuth) → llevar al signup de experto
        const expertIntent = localStorage.getItem("savvy_expert_intent");
        if (expertIntent && !profil.isExpert && !profil.pendingExpert) {
          localStorage.removeItem("savvy_expert_intent");
          setScreen("signup");
          setNav("profile");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const goHome   = () => { setScreen("home");   setNav("home"); };
  const goExpert = e  => { setPrevScreen(screen); setNav("home"); setExpert(e); setScreen("expert"); };
  const goMsg    = (e, from=null) => {
    if (e === "__search__") { handleNav("search"); return; }
    if (!isLoggedIn) { setAuthIntent(()=>()=>{ setExpert(e); setPrevMsgScreen(from||nav); setScreen("message"); }); setShowAuth(true); return; }
    setExpert(e); setPrevMsgScreen(from||nav); setScreen("message");
  };
  const goBook   = (e,p) => {
    if (!isLoggedIn) { setAuthIntent(()=>()=>{ setExpert(e); setPhase(p); setScreen("booking"); }); setShowAuth(true); return; }
    setExpert(e); setPhase(p); setScreen("booking");
  };
  const goSearch = (q="", cat=null) => {
    setSearchQ(q||""); setSearchCat(cat);
    setScreen("search"); setNav("home");
  };
  const handleNav = id => {
    // Screens that require login
    if (!isLoggedIn && (id === "messages" || id === "reservations" || id === "profile" || id.startsWith("exp-"))) {
      setShowAuth(true);
      return;
    }
    // Expert-mode nav items → go to profile with specific section
    if (id === "exp-dashboard") { setNav(id); setExpInitSection("dashboard"); setScreen("profile"); return; }
    if (id === "exp-sessions")  { setNav(id); setExpInitSection("sesiones"); setScreen("profile"); return; }
    if (id === "exp-dispo")     { setNav(id); setExpInitSection("disponibilidades"); setScreen("profile"); return; }
    if (id === "exp-compte")    { setNav(id); setExpInitSection(null); setScreen("profile"); return; }
    if (id === "admin")         { setScreen("admin"); return; }
    // Normal nav
    setNav(id);
    setExpInitSection(null);
    if(id==="home")         setScreen("home");
    if(id==="search")       setScreen("search");
    if(id==="messages")     setScreen("messages");
    if(id==="reservations") setScreen("reservations");
    if(id==="profile")      setScreen("profile");
  };

  // "search" est maintenant dans main pour avoir la TopBar et BottomNav
  const main = ["home","search","match","messages","reservations","profile","public"].includes(screen);
  const unread = !isLoggedIn ? 0
    : authUser?.real ? realUnreadCount
    : appMode==="expert" ? (isExpert && !newExpertProfile ? EXPERT_CLIENT_CONVS.reduce((s,c)=>s+(readMsgIds.includes("cli-"+c.id)?0:c.unread),0) : 0)
    : DEMO_MSGS.reduce((s,m)=>s+(readMsgIds.includes("exp-"+m.id)?0:m.unread),0);

  // Fallback de pantalla para lazy screens individuales
  const ScreenFallback = <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",minHeight:200}}><div style={{width:6,height:6,borderRadius:"50%",background:C.goldB,animation:"pulse 1.2s ease-in-out infinite"}}/></div>;

  return <>
  {showLoader && <AppLoader authReady={authReady} onDone={()=>{ localStorage.setItem("savvy_loaded","1"); setShowLoader(false); }}/>}
  <div style={{fontFamily:SANS}}>
    {showPaymentSuccess && (
      <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:99999,background:"#1C1917",color:"#fff",borderRadius:14,padding:"14px 22px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 24px rgba(0,0,0,0.25)",fontFamily:SANS,fontSize:14,fontWeight:600,maxWidth:360,animation:"fadeSlideUp .3s ease-out"}}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth={2.5} style={{flexShrink:0}}><polyline points="20 6 9 17 4 12"/></svg>
        <div>
          <div>Paiement confirmé !</div>
          <div style={{fontSize:11,fontWeight:400,opacity:0.7,marginTop:2}}>Votre session est réservée avec succès.</div>
        </div>
      </div>
    )}
    {showPaymentCancel && (
      <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:99999,background:"#1C1917",color:"#fff",borderRadius:14,padding:"14px 22px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 24px rgba(0,0,0,0.25)",fontFamily:SANS,fontSize:14,fontWeight:600,maxWidth:360,animation:"fadeSlideUp .3s ease-out"}}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth={2.5} style={{flexShrink:0}}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
        <div>
          <div>Paiement non finalisé</div>
          <div style={{fontSize:11,fontWeight:400,opacity:0.7,marginTop:2}}>Aucun débit. Ta session reste à payer — tu peux réessayer quand tu veux.</div>
        </div>
      </div>
    )}
    <style>{`
      *{box-sizing:border-box}
      body,button,input,textarea,select{font-family:\'DM Sans\',-apple-system,BlinkMacSystemFont,\'Inter\',sans-serif}
      @keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
      @keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      .screen-enter{animation:fadeSlideUp .22s ease-out both}
      *{box-sizing:border-box} ::-webkit-scrollbar{width:0} ::-webkit-scrollbar-horizontal{height:0}
      input::placeholder,textarea::placeholder{color:#A8A29E}
      input:focus,textarea:focus{border-color:#8B6330!important;box-shadow:0 0 0 3px rgba(139,99,48,.10);outline:none}
      select:focus{border-color:#8B6330!important;outline:none}
      button:active{opacity:.82} button{transition:opacity .15s}
    `}</style>
    <div style={{width:"100%",maxWidth:430,margin:"0 auto",background:C.cream,minHeight:"100vh",display:"flex",flexDirection:"column",boxShadow:"0 0 40px rgba(0,0,0,.1)",paddingTop:`calc(env(safe-area-inset-top) + 56px)`,paddingBottom:`calc(env(safe-area-inset-bottom) + 64px)`,...(["message"].includes(screen)?{height:"100vh",overflow:"hidden"}:{})}}>
      {isLoggedIn && authUser?.pendingExpert && (
        <div style={{position:"fixed",inset:0,zIndex:60,background:C.ink,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:20}}>⏳</div>
          <div style={{fontSize:24,fontWeight:800,color:C.white,fontFamily:SERIF,marginBottom:12,lineHeight:1.3}}>Candidature en cours d'examen</div>
          <div style={{fontSize:14,color:"rgba(253,252,248,.65)",lineHeight:1.7,marginBottom:32}}>
            Ton profil de conseiller est en cours de vérification par l'équipe Savvy. Tu recevras une confirmation sous 24–48h.
          </div>
          <div style={{background:"rgba(255,255,255,.08)",borderRadius:14,padding:"16px 20px",width:"100%",maxWidth:320,marginBottom:32}}>
            <div style={{fontSize:12,color:"rgba(253,252,248,.5)",marginBottom:8}}>Connecté en tant que</div>
            <div style={{fontSize:15,fontWeight:700,color:C.white}}>{authUser?.name}</div>
            <div style={{fontSize:12,color:"rgba(253,252,248,.4)",marginTop:2}}>{authUser?.email}</div>
          </div>
          <button onClick={()=>{ supabase.auth.signOut(); setIsLoggedIn(false); setAuthUser(null); setIsExpert(false); setShowSplash(!isDesktop?true:false); setShowLanding(isDesktop?true:false); }} style={{padding:"13px 28px",borderRadius:12,border:"1px solid rgba(255,255,255,.2)",background:"transparent",color:"rgba(253,252,248,.7)",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            Se déconnecter
          </button>
        </div>
      )}
      {showLanding && !isLoggedIn && authReady && (
        <div style={{position:"fixed",inset:0,zIndex:50,overflowY:"auto",background:C.cream}}>
          <Suspense fallback={null}>
            <LandingScreen
              onStart={()=>{ localStorage.setItem("savvy_visited","1"); setShowLanding(false); setShowSplash(true); }}
              onExplore={()=>{ localStorage.setItem("savvy_visited","1"); setShowLanding(false); setScreen("home"); setNav("home"); }}
              onExpert={()=>{ localStorage.setItem("savvy_visited","1"); setShowLanding(false); setShowAuth(true); setAuthIntent("register"); }}
            />
          </Suspense>
        </div>
      )}
      {showOnboarding && !isLoggedIn && authReady && <Suspense fallback={null}><OnboardingScreen onDone={()=>{ sessionStorage.setItem("savvy_onboarding_seen","1"); setShowOnboarding(false); setShowSplash(true); }}/></Suspense>}
      {!showOnboarding && showSplash && !isLoggedIn && authReady && <Suspense fallback={null}><SplashScreen isAdmin={authUser?.email==="geraquipu@hotmail.com"} onSkip={()=>{ setShowSplash(false); setScreen("home"); setNav("home"); }} onSuccess={(user)=>{ setIsLoggedIn(true); setAuthUser(user); setIsExpert(!!user.isExpert); setNewExpertProfile(null); setShowSplash(false); setScreen("home"); setNav("home"); }} onRegister={()=>{ setShowSplash(false); setShowAuth(true); setAuthIntent("register"); }}/></Suspense>}
      {main && <TopBar onNotif={()=>setShowNotif(v=>!v)} notifCount={isLoggedIn?(authUser?.real?((authUser?.isExpert&&appMode==="expert"?expRequestsCount:clientPendingCount)+realUnreadCount):Math.max(0,(newExpertProfile?3:4)-readNotifIds.length)):0} isLoggedIn={isLoggedIn} onLogin={()=>setShowSplash(true)} isExpert={isExpert} appMode={appMode} onToggleMode={m=>{ setAppMode(m); if(m==="expert"){ setNav("exp-dashboard"); setExpInitSection("dashboard"); setScreen("profile"); } else { setNav("home"); setExpInitSection(null); setScreen("home"); } }} expertBadge={appMode==="client" ? expRequestsCount : 0}/>}
      {showAuth && <Suspense fallback={null}><AuthModal onClose={()=>setShowAuth(false)} onSuccess={(user)=>{ setIsLoggedIn(true); setAuthUser(user); setIsExpert(!!user.isExpert); setNewExpertProfile(null); setShowAuth(false); setShowSplash(false); setAuthIntent(null); }} initialRegister={authIntent==="register"} isAdmin={authUser?.email==="geraquipu@hotmail.com"}/></Suspense>}
      {showProfileSetup && authUser?.real && <ProfileSetupModal authUser={authUser} onDone={updated=>{ setAuthUser(updated); setShowProfileSetup(false); }}/>}
      {showNotif && <Suspense fallback={null}><NotificationPanel onClose={()=>setShowNotif(false)} onNavigate={(s)=>{ setShowNotif(false); handleNav(s); }} readNotifIds={readNotifIds} onMarkRead={setReadNotifIds} isExpert={isExpert&&appMode==="expert"} isNewExpert={!!newExpertProfile} expRequestsCount={expRequestsCount} unreadMsgsCount={unread} isRealUser={!!authUser?.real} pendingPayCount={clientPendingCount} toPayCount={clientToPayCount}/></Suspense>}
      {screen==="home"         && <div key="home" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><HomeScreen onExpert={goExpert} onSearch={q=>goSearch(q)} onCat={id=>goSearch("",id)} onMatch={()=>{setScreen("match");setNav("home");}} isLoggedIn={isLoggedIn} authUser={authUser} isExpert={isExpert} experts={dbExperts}/></div>}
      {screen==="match"        && <Suspense fallback={ScreenFallback}><div key="match" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><MatchScreen onExpert={goExpert} onBrowseAll={()=>goSearch("")} experts={dbExperts}/></div></Suspense>}
      {screen==="search"       && <Suspense fallback={ScreenFallback}><div key="search" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><SearchScreen initQ={searchQ} initCat={searchCat} onExpert={goExpert} onBack={()=>{setScreen("home");setNav("home");}} experts={dbExperts} expertsLoaded={expertsLoaded}/></div></Suspense>}
      {screen==="messages"     && <Suspense fallback={ScreenFallback}><div key="messages" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><MessagesListScreen onConv={e=>goMsg(e)} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)} readMsgIds={readMsgIds} onMarkMsgRead={id=>setReadMsgIds(p=>p.includes(id)?p:[...p,id])} appMode={appMode} isNewExpert={!!newExpertProfile} isRealUser={!!authUser?.real} authUser={authUser} dbExperts={dbExperts}/></div></Suspense>}
      {screen==="reservations" && <Suspense fallback={ScreenFallback}><div key="reservations" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><ReservationsScreen onExpert={goExpert} onMsg={goMsg} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)} onNavigate={handleNav} isRealUser={!!authUser?.real} authUser={authUser}/></div></Suspense>}
      {screen==="public"       && <Suspense fallback={ScreenFallback}><PublicProfileScreen onBack={()=>{ if(sharedExpertId){ setSharedExpertId(null); window.history.replaceState({},"","/"); setScreen("home"); setNav("home"); } else { setScreen("profile"); setNav("profile"); } }} onBook={goBook} onMsg={goMsg} expertId={sharedExpertId?undefined:(authUser?.isExpert?(EXPERTS.find(ex=>ex.initials===DEMO_USERS.expert.initials)||EXPERTS[7])?.id:undefined)} realExpertId={sharedExpertId || (authUser?.real && authUser?.isExpert ? authUser?.expertId : null)}/></Suspense>}
      {screen==="profile"      && <Suspense fallback={ScreenFallback}><ProfileScreen key={expInitSection||"profile"} authUser={authUser} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)} onNavigate={(s)=>handleNav(s)} newExpertProfile={newExpertProfile}
          isExpert={isExpert}
          appMode={appMode}
          initExpSection={expInitSection}
          onRequestsChange={n=>setExpRequestsCount(n)}
          onBecomeExpert={()=>setIsExpert(true)}
          onSignup={()=>{ setPrevScreen("profile"); setScreen("signup"); }}
          onViewPublic={() => { setPrevScreen("profile"); setScreen("public"); }}
          onLogout={() => { supabase.auth.signOut(); setIsLoggedIn(false); setAuthUser(null); setIsExpert(false); setScreen("home"); setNav("home"); setAppMode("client"); }}
          uploadPhoto={uploadPhoto}
          dbExperts={dbExperts}
        /></Suspense>}
      {screen==="admin"        && <Suspense fallback={ScreenFallback}><AdminScreen authUser={authUser} onBack={()=>{ setScreen("profile"); setNav("profile"); }}/></Suspense>}
      {screen==="expert"       && expert && <ExpertScreen e={expert} onBack={()=>{setScreen(prevScreen);}} onBook={goBook} onMsg={goMsg}/>}
      {screen==="message"      && expert && <Suspense fallback={ScreenFallback}><MessagingScreen e={expert} onBack={()=>{setScreen(prevMsgScreen);setNav(prevMsgScreen);}} authUser={authUser}/></Suspense>}
      {screen==="booking"      && expert && phase && <Suspense fallback={ScreenFallback}><BookingScreen e={expert} ph={phase} onBack={()=>setScreen("expert")} onConfirm={(info)=>{ setBookingInfo(info); setScreen("success"); }}/></Suspense>}
      {screen==="success"      && expert && phase && <Suspense fallback={ScreenFallback}><SuccessScreen e={expert} ph={phase} onHome={goHome} onMsg={()=>goMsg(expert)} bookingDate={bookingInfo?.date} bookingSlot={bookingInfo?.slot} bookingNote={bookingInfo?.note} bookingFormat={bookingInfo?.format} bookingDuree={bookingInfo?.duree} authUser={authUser}/></Suspense>}
      {screen==="signup" && <Suspense fallback={ScreenFallback}><SignupScreen
  authUser={authUser}
  uploadPhoto={uploadPhoto}
  onBack={() => { if(prevScreen==="profile"){setScreen("profile");setNav("profile");}else{goHome();}}}
  onDone={(expertProfile) => {
    setNewExpertProfile(expertProfile);
    setIsExpert(true);
    // Mettre à jour authUser avec la photo et le nom du profil expert
    if (expertProfile?.photoUrl || expertProfile?.prenom) {
      setAuthUser(prev => prev ? {
        ...prev,
        photoUrl: expertProfile.photoUrl || prev.photoUrl,
        name: expertProfile.prenom ? (expertProfile.prenom+" "+(expertProfile.nom||"")).trim() : prev.name,
        isExpert: true,
      } : prev);
    }
    if (authUser?.real && authUser?.id) {
      supabase.from("profiles").update({
        is_expert: true,
        expert_domain: expertProfile?.domain || expertProfile?.role || null,
        name: expertProfile?.prenom ? (expertProfile.prenom+" "+(expertProfile.nom||"")).trim() : undefined,
      }).eq("id", authUser.id).then(({error})=>{ if(error) console.warn("profil expert non sauvegardé:", error.message); });
    }
    setScreen("profile");
    setNav("profile");
  }}
/></Suspense>}
      {main && <BottomNav nav={nav} onChange={handleNav} unreadCount={unread} appMode={appMode} sessionsCount={newExpertProfile ? 0 : expRequestsCount} reservationsCount={(isLoggedIn && appMode==="client") ? clientPendingCount : 0}/>}
    </div>
  </div>
  </>;
}
