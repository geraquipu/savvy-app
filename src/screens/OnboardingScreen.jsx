import React from 'react';
import { C, SERIF } from '../constants/colors';

function OnboardingScreen({ onDone }) {
  return (
    <div style={{ position:"fixed", inset:0, background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, zIndex:300, display:"flex", flexDirection:"column", overflowY:"auto" }}>

      {/* Passer */}
      <div style={{ padding:"52px 20px 0", display:"flex", justifyContent:"flex-end", flexShrink:0 }}>
        <button onClick={onDone} style={{ fontSize:12, color:"rgba(253,252,248,.45)", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:"5px 14px", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
          Passer →
        </button>
      </div>

      {/* Centre — logo + tagline */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px", textAlign:"center" }}>

        {/* Logo animé */}
        <div style={{ position:"relative", marginBottom:32 }}>
          <div style={{ position:"absolute", inset:-24, borderRadius:"50%", border:"1px solid rgba(185,134,74,.12)", animation:"spin 25s linear infinite" }}/>
          <div style={{ position:"absolute", inset:-14, borderRadius:"50%", border:"1px solid rgba(185,134,74,.08)", animation:"spin 18s linear infinite reverse" }}/>
          <div style={{ width:88, height:88, borderRadius:26, background:"rgba(185,134,74,.1)", border:"1.5px solid rgba(185,134,74,.25)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <span style={{ fontSize:38, fontWeight:900, fontFamily:SERIF, letterSpacing:"-2px", color:C.goldB }}>
              sav<em style={{ fontStyle:"italic" }}>vy</em>
            </span>
          </div>
        </div>

        {/* Titre principal */}
        <h1 style={{ fontSize:30, fontWeight:700, color:C.white, fontFamily:SERIF, lineHeight:1.25, margin:"0 0 14px", letterSpacing:"-.5px", maxWidth:300 }}>
          Parlez avec quelqu'un<br/>
          <em style={{ color:C.goldB, fontStyle:"italic" }}>qui l'a déjà fait.</em>
        </h1>
        <p style={{ fontSize:14, color:"rgba(253,252,248,.55)", lineHeight:1.7, margin:"0 0 40px", maxWidth:280 }}>
          Des experts vérifiés, disponibles pour vous aider à prendre de meilleures décisions — rapidement.
        </p>

        {/* 3 piliers */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:300, marginBottom:40 }}>
          {[
            { icon:<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.goldB} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label:"Une expérience réellement vécue" },
          ].map((p,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:13, background:"rgba(255,255,255,.06)", borderRadius:13, padding:"13px 16px", border:"1px solid rgba(185,134,74,.15)" }}>
              <div style={{ flexShrink:0 }}>{p.icon}</div>
              <span style={{ fontSize:13, color:"rgba(253,252,248,.75)", fontWeight:500 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA bas */}
      <div style={{ padding:"0 24px 44px" }}>
        <button onClick={onDone} style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:700, fontSize:17, background:`linear-gradient(135deg,${C.goldB},#B8864A)`, color:C.white, fontFamily:SERIF, letterSpacing:".2px", boxShadow:"0 4px 24px rgba(185,134,74,.4)" }}>
          ✦ Découvrir Savvy
        </button>
        <p style={{ textAlign:"center", fontSize:11, color:"rgba(253,252,248,.25)", margin:"14px 0 0", lineHeight:1.6 }}>
          En continuant, tu acceptes nos <span style={{ color:"rgba(253,252,248,.4)" }}>Conditions d'utilisation</span>
        </p>
      </div>
    </div>
  );
}

export default OnboardingScreen;
