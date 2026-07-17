import React from 'react';
import { C, SERIF } from '../constants/colors';
import { CATS } from '../constants/data';
import { MENU_ICONS } from '../constants/menuIcons.jsx';
import { ExpertCard } from '../components/ui';

function HomeScreen({ onExpert, onSearch, onCat, onMatch, isLoggedIn, authUser, isExpert, experts=[] }) {
  const top = [...experts].sort((a,b) => b.rating - a.rating).slice(0,5);
  const prenom = authUser?.name?.split(" ")[0] || authUser?.email?.split("@")[0] || null;

  return <div style={{ flex:1, overflowY:"auto", paddingBottom:72, background:C.cream2 }}>

    {/* ── Header avec saludo ── */}
    <div style={{ padding:"28px 20px 20px", background:C.cream2 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          {prenom && isLoggedIn
            ? <div style={{ fontSize:14, color:C.muted, marginBottom:4 }}><span style={{ fontWeight:700, color:C.ink }}>{prenom}</span>, nous sommes ravis de vous voir.</div>
            : <div style={{ fontSize:14, color:C.muted, marginBottom:4 }}>Bienvenue sur Savvy</div>
          }
          <h1 style={{ fontSize:26, fontWeight:700, color:C.ink, lineHeight:1.2, margin:0, fontFamily:SERIF, letterSpacing:"-.5px" }}>
            Parlez avec quelqu'un<br/><em style={{ color:C.gold, fontStyle:"italic" }}>qui l'a déjà fait.</em>
          </h1>
        </div>
      </div>

      {/* Barre de recherche */}
      <div onClick={() => onSearch("")} style={{ display:"flex", alignItems:"center", gap:10, background:C.white, borderRadius:14, padding:"13px 16px", cursor:"pointer", border:`1.5px solid ${C.border}`, marginBottom:16 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
        <span style={{ fontSize:13, color:C.faint }}>Que cherches-tu à résoudre ?</span>
      </div>
    </div>

    {/* ── Hero banner vert ── */}
    <div style={{ margin:"0 16px 20px" }}>
      <div onClick={onMatch} style={{ borderRadius:20, overflow:"hidden", cursor:"pointer", background:`linear-gradient(135deg, ${C.ink} 0%, #2D5A3D 60%, ${C.gold} 100%)`, padding:"24px 22px", position:"relative", minHeight:140 }}>
        <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"40%", background:"radial-gradient(ellipse at right center, rgba(91,140,106,.4) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:1.2, marginBottom:10 }}>Savvy Match</div>
        <div style={{ fontSize:22, fontWeight:700, color:C.white, fontFamily:SERIF, lineHeight:1.3, marginBottom:8, letterSpacing:"-.3px" }}>
          Trouvez la personne qui a déjà vécu votre situation.
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,.7)", marginBottom:18, lineHeight:1.5 }}>Conseillers vérifiés · Réponse rapide · Dès 5€</div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.15)", backdropFilter:"blur(8px)", borderRadius:10, padding:"9px 16px", border:"1px solid rgba(255,255,255,.2)" }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.white }}>Trouver quelqu'un</span>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>

    {/* ── Accès rapide ── */}
    <div style={{ padding:"0 16px", marginBottom:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          { icon:<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>, label:"Chercher",  action:()=>onSearch("") },
          { icon:<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx={9} cy={7} r={4}/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label:"Experts",   action:()=>onSearch("") },
          { icon:<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, label:"Sessions",  action:()=>onMatch() },
          { icon:<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label:"Favoris",   action:()=>onSearch("") },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"14px 6px 12px", background:C.white, borderRadius:14, border:`1px solid ${C.border}`, cursor:"pointer", fontFamily:"inherit" }}>
            <div style={{ color:C.gold }}>{item.icon}</div>
            <span style={{ fontSize:10, fontWeight:600, color:C.ink }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>

    {/* ── Stats ── */}
    <div style={{ margin:"0 16px 24px", background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:"16px 18px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr" }}>
      {[["Dès 5€","Session"],["✦","Vérifiés"],["< 24h","Réponse"],["100%","Sécurisé"]].map(([n,l]) =>
        <div key={l} style={{ textAlign:"center" }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{n}</div>
          <div style={{ fontSize:9, color:C.muted, marginTop:2, lineHeight:1.3 }}>{l}</div>
        </div>
      )}
    </div>

    {/* ── Explorer par thème ── */}
    <div style={{ padding:"0 16px" }}>
      <h2 style={{ fontSize:18, fontWeight:700, color:C.ink, margin:"0 0 12px", fontFamily:SERIF }}>Explorer par thème</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
        {CATS.map(cat =>
          <button key={cat.id} onClick={() => onCat(cat.id)} style={{ display:"flex", alignItems:"center", gap:11, padding:"14px 15px", borderRadius:15, border:`1px solid ${C.border}`, background:C.white, cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}>
            <div style={{ width:40, height:40, borderRadius:12, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:cat.color }}>{MENU_ICONS[cat.icon]}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.ink, lineHeight:1.3 }}>{cat.label}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.3 }}>{cat.sub}</div>
            </div>
          </button>
        )}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14 }}>
        <h2 style={{ fontSize:18, fontWeight:700, color:C.ink, margin:0, fontFamily:SERIF }}>Meilleures valorations</h2>
        <button onClick={() => onSearch("")} style={{ fontSize:12, color:C.gold, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Voir tout →</button>
      </div>
      {top.map(e => <ExpertCard key={e.id} e={e} onClick={() => onExpert(e)}/>)}
    </div>
  </div>;
}

export default HomeScreen;
