import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { C, SERIF } from '../constants/colors';
import { EXPERTS } from '../constants/data';
import { EXPERT_EXTRAS } from '../constants/expertExtras';

function PublicProfileScreen({ onBack, onBook, onMsg, expertId, realExpertId }) {
  const [sbExpert, setSbExpert] = useState(null);
  const [sbReviews, setSbReviews] = useState([]);
  const [sbStats, setSbStats] = useState(null);
  useEffect(() => {
    if (!realExpertId) return;
    supabase.from("experts").select("*").eq("id", realExpertId).maybeSingle().then(({ data }) => { if (data) setSbExpert(data); });
    supabase.from("reviews").select("*").eq("expert_id", realExpertId).order("created_at", { ascending: false }).limit(10).then(({ data }) => { if (data) setSbReviews(data); });
    supabase.from("bookings").select("id, client_id").eq("expert_id", realExpertId).eq("status", "confirmed").then(({ data }) => {
      if (data) setSbStats({ sessions: data.length, clients: new Set(data.map(b=>b.client_id)).size });
    });
  }, [realExpertId]);
  // Use real data if available, else demo
  const e = realExpertId && sbExpert
    ? { ...sbExpert, name: sbExpert.name, initials: sbExpert.initials || sbExpert.name?.[0] || "?", bg: sbExpert.bg || C.cream2, color: sbExpert.color || C.ink, rating: sbReviews.length > 0 ? +(sbReviews.reduce((s,r)=>s+r.stars,0)/sbReviews.length).toFixed(1) : null, reviews: sbStats?.sessions || 0, phases: sbExpert.phases || sbExpert.offres || [], photo_url: sbExpert.photo_url || null }
    : (expertId !== undefined ? EXPERTS.find(x=>x.id===expertId) : null) || EXPERTS[0];
  const extras = realExpertId && sbReviews.length > 0
    ? { resout: [], reviews: sbReviews.map(r=>({ name: r.client_name||"Client", stars: r.stars, text: r.text||"", date: new Date(r.created_at).toLocaleDateString("fr-FR",{month:"long",year:"numeric"}) })), preuves: [] }
    : EXPERT_EXTRAS[e.id] || { resout:[], reviews:[], preuves:[] };
  // Valeurs sûres — les experts réels peuvent avoir metrics/phases vides
  const langs = e.langs || [];
  const phases = e.phases?.length ? e.phases : [{ name:"Session conseil", price: 0, format:"video" }];
  const expValue = e.metrics?.[0]?.value || (e.role?.match(/\d.*ans/)?.[0]) || "Récent";
  const repValue = e.metrics?.[3]?.value || "< 24h";
  const noteValue = e.reviews > 0 && e.rating ? `${e.rating}★` : "Nouveau";
  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80, background:C.cream }}>
      <div style={{ background:`linear-gradient(160deg,#1C1917 0%,#3D2B1F 100%)`, padding:"20px 20px 0", overflow:"hidden" }}>
        <button onClick={onBack} style={{ width:36,height:36,borderRadius:10,background:"rgba(253,252,248,.12)",border:"1px solid rgba(253,252,248,.2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          {e.photo_url || e.photoUrl
            ? <img src={e.photo_url||e.photoUrl} alt="" style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",border:`4px solid ${C.goldB}`,boxShadow:`0 0 0 6px rgba(185,134,74,.2)`,margin:"0 auto 14px",display:"block"}}/>
            : <div style={{ width:96,height:96,borderRadius:"50%",background:`linear-gradient(135deg,${C.goldL},#FDE68A)`,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:34,border:`4px solid ${C.goldB}`,boxShadow:`0 0 0 6px rgba(185,134,74,.2)`,fontFamily:SERIF,margin:"0 auto 14px" }}>{e.initials}</div>
          }
          <div style={{ fontSize:24,fontWeight:700,color:C.white,fontFamily:SERIF,letterSpacing:"-.5px" }}>{e.name}</div>
          <div style={{ fontSize:13,color:"rgba(253,252,248,.55)",marginTop:4 }}>📍 {e.location} · {e.country}</div>
          <div style={{ display:"flex",gap:6,justifyContent:"center",marginTop:10,flexWrap:"wrap" }}>
            {langs.map(l=><span key={l} style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:"rgba(185,134,74,.18)",color:C.goldB,fontWeight:600 }}>{l}</span>)}
            <span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:C.sageL,color:C.sage,fontWeight:700 }}>Très actif</span>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,.07)",borderRadius:14,padding:"12px 16px",margin:"0 0 18px",borderLeft:`3px solid ${C.goldB}` }}>
          <div style={{ fontSize:14,color:C.white,fontStyle:"italic",fontFamily:SERIF,lineHeight:1.55 }}>"{e.tagline}"</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",background:"rgba(255,255,255,.06)",borderRadius:"14px 14px 0 0",padding:"12px 10px" }}>
          {[{v:noteValue,l:"Note"},{v:`+${e.reviews||0}`,l:"Sessions"},{v:repValue,l:"Réponse"},{v:expValue,l:"Exp."}].map((s,i)=>(
            <div key={i} style={{ textAlign:"center",borderRight:i<3?`1px solid rgba(255,255,255,.1)`:"none" }}>
              <div style={{ fontSize:15,fontWeight:700,color:C.white,fontFamily:SERIF }}>{s.v}</div>
              <div style={{ fontSize:10,color:"rgba(253,252,248,.4)",marginTop:1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:C.white,padding:"14px 18px",borderBottom:`1px solid ${C.border}`,boxShadow:`0 2px 8px ${C.sh}` }}>
        <button onClick={() => onBook && onBook(e, phases[0])} style={{ width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:16,background:C.ink,color:C.white,fontFamily:SERIF }}>
          Réserver une session →
        </button>
        <div style={{ display:"flex",justifyContent:"center",gap:18,marginTop:8 }}>
          <span style={{ fontSize:12,color:C.muted }}>💶 dès <b style={{ color:C.ink }}>{phases[0].price}€</b></span>
          <span style={{ fontSize:12,color:C.muted }}>⚡ {repValue}</span>
          <span style={{ fontSize:12,color:C.muted }}>✅ Vérifié</span>
        </div>
      </div>
      <div style={{ padding:"20px 18px 0" }}>

        {/* ── Offres ── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:4 }}>Mes offres</div>
          <div style={{ fontSize:12,color:C.muted,marginBottom:14 }}>Choisis la session qui te correspond</div>
          {phases.map((p,i)=>{
            const fmtIcons = {video:"🎥",audio:"📞",doc:"📄",chat:"💬"};
            const fmts = p.formats||[p.format||"video"];
            return (
              <div key={i} style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"16px",marginBottom:10,boxShadow:`0 2px 8px ${C.sh}` }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10 }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,lineHeight:1.35,marginBottom:5 }}>{p.name}</div>
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                      {fmts.map(f=>(
                        <span key={f} style={{ fontSize:11,padding:"3px 9px",borderRadius:20,background:C.cream3,color:C.muted,fontWeight:500 }}>
                          {fmtIcons[f]||"📞"} {f==="video"?"Vidéo":f==="audio"?"Audio":f==="doc"?"Document":"Chat"}
                        </span>
                      ))}
                      {(p.duree||p.what)&&<span style={{ fontSize:11,color:C.muted,padding:"3px 0" }}>· {p.duree||(p.what?.split(" ").pop())}</span>}
                    </div>
                  </div>
                  <div style={{ flexShrink:0,textAlign:"right" }}>
                    <div style={{ fontSize:22,fontWeight:800,color:C.ink,fontFamily:SERIF,lineHeight:1 }}>{p.price}€</div>
                    <div style={{ fontSize:10,color:C.muted,marginTop:2 }}>/ session</div>
                  </div>
                </div>
                <button onClick={()=>onBook&&onBook(e,p)}
                  style={{ width:"100%",padding:"11px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,background:C.ink,color:C.white,fontFamily:SERIF }}>
                  Réserver · {p.price}€ →
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Ce que je résous ── */}
        {extras.resout.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:12 }}>Je t\'aide à…</div>
            {extras.resout.map((r,i)=>(
              <div key={i} style={{ display:"flex",gap:11,alignItems:"flex-start",background:C.white,borderRadius:12,padding:"11px 14px",border:`1px solid ${C.border}`,marginBottom:8 }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:e.color,flexShrink:0,marginTop:5 }}/>
                <span style={{ fontSize:13,color:C.soft,lineHeight:1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        )}

        {extras.reviews.slice(0,2).map((r,i)=>(
          <div key={i} style={{ background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 16px",marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
              <div><div style={{ fontSize:13,fontWeight:700,color:C.ink }}>{r.name}</div><div style={{ fontSize:10,color:C.muted }}>{r.date}</div></div>
              <div style={{ display:"flex",gap:2 }}>{[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s<=r.stars?"#B8864A":"#D6D0C8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
            </div>
            <div style={{ fontSize:12,color:C.soft,lineHeight:1.6,fontStyle:"italic" }}>"{r.text}"</div>
          </div>
        ))}
        <div style={{ display:"flex",flexDirection:"column",gap:10,paddingBottom:10,marginTop:8 }}>
          <button onClick={() => onBook && onBook(e, phases[0])} style={{ width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:15,background:C.ink,color:C.white,fontFamily:SERIF }}>
            Réserver avec {e.name.split(" ")[0]} →
          </button>
          <button onClick={() => onMsg && onMsg(e)} style={{ width:"100%",padding:"12px",borderRadius:13,border:`1.5px solid ${C.border}`,cursor:"pointer",fontWeight:600,fontSize:13,background:C.white,color:C.ink,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Poser une question d\'abord
          </button>
        </div>
      </div>
    </div>
  );
}

export default PublicProfileScreen;
