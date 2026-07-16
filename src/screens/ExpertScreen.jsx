import React, { useState, useEffect } from 'react';
import { C, SERIF } from '../constants/colors';
import { EXPERT_EXTRAS, EXPERT_STYLE_TAGS, EXPERT_FIRST_SESSION } from '../constants/expertExtras';
import { supabase } from '../supabase';

function ExpertScreen({ e: eProp, onBack, onBook, onMsg }) {
  const e = {
    ...eProp,
    name:     eProp?.name     ?? "Expert",
    role:     eProp?.role     ?? "",
    initials: eProp?.initials ?? "?",
    bg:       eProp?.bg       ?? C.cream2,
    color:    eProp?.color    ?? C.gold,
    langs:    eProp?.langs    ?? [],
    nda:      eProp?.nda      ?? false,
    tagline:  eProp?.tagline  ?? "",
    phases:   eProp?.phases   ?? eProp?.offres ?? [],
  };
  const [openPhase, setOpenPhase] = useState(null);
  const _favKey = "savvy_favs";
  const _getFavs = () => { try { return JSON.parse(localStorage.getItem(_favKey)||"[]"); } catch { return []; } };
  const [isFav, setIsFav] = useState(() => _getFavs().some(f => f.id === e.id));
  const toggleFav = () => {
    const favs = _getFavs();
    const next = isFav ? favs.filter(f => f.id !== e.id) : [...favs, {id:e.id, name:e.name, initials:e.initials, bg:e.bg, color:e.color, role:e.role, rating:e.rating}];
    localStorage.setItem(_favKey, JSON.stringify(next));
    setIsFav(!isFav);
  };
  const [bioExpanded, setBioExpanded] = useState(false);
  const [sessionExpanded, setSessionExpanded] = useState(false);
  const [dbReviews, setDbReviews] = useState([]);
  const [dbPhases, setDbPhases] = useState(null);
  useEffect(() => {
    if (!e?.id) return;
    supabase.from("reviews").select("*").eq("expert_id", e.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data?.length) setDbReviews(data); });
    // Si l'expert a été ouvert sans ses offres (ex. bouton "Répéter" depuis une
    // réservation), on charge les vraies offres depuis Supabase pour ne pas
    // retomber sur l'offre par défaut à 50€.
    const idIsUuid = typeof e.id === "string" && e.id.includes("-");
    if (idIsUuid && !(eProp?.phases?.length) && !(eProp?.offres?.length)) {
      supabase.from("experts").select("phases, offres, price").eq("id", e.id).maybeSingle()
        .then(({ data }) => { if (data) setDbPhases(data.phases?.length ? data.phases : (data.offres || null)); });
    }
  }, [e?.id]);
  const extras = EXPERT_EXTRAS[e.id] || { resout:[], reviews:[], preuves:[] };
  const allReviews = dbReviews.length > 0
    ? dbReviews.map(r => ({ name: r.client_name || "Client", stars: r.stars, text: r.text || "", date: new Date(r.created_at).toLocaleDateString("fr-FR", { month:"long", year:"numeric" }) }))
    : extras.reviews;
  const styleTags = EXPERT_STYLE_TAGS[e.cat] || ["Humain","Direct","Pratique"];
  const firstSession = EXPERT_FIRST_SESSION[e.id] || `Dans notre première session, je commence par comprendre précisément votre situation. On va droit au but — vous repartez avec des réponses concrètes basées sur mon expérience réelle.`;
  const bio = e.bio || e.tagline || "";
  const bioShort = bio.length > 130 ? bio.slice(0,130)+"…" : bio;
  const sessionShort = firstSession.length > 140 ? firstSession.slice(0,140)+"…" : firstSession;
  const phases = e.phases?.length ? e.phases
    : dbPhases?.length ? dbPhases
    : [{id:1,name:"Session conseil",what:"Conseil personnalisé basé sur mon expérience",format:"Vidéo 1h",price:e.price||50,tag:"",inc:[]}];
  const metrics = e.metrics?.length ? e.metrics : [
    {label:"Expérience", value: e.yearsExp || (e.reviews>20?"10+ ans":e.reviews>5?"5+ ans":"Récent")},
    {label:"Note", value: e.reviews > 0 && e.rating ? `⭐ ${e.rating}` : "Nouveau"},
    {label:"Sessions", value:`+${e.reviews||0}`},
  ];
  const photoSrc = e.photo_url || e.photoUrl || null;

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:100, background:C.white }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div style={{ background:C.white, padding:"13px 18px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:C.cream2, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Conseillers</span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={toggleFav} style={{ width:36, height:36, borderRadius:10, background:isFav?"#FEE2E2":C.cream2, border:`1px solid ${isFav?"#FECACA":C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill={isFav?"#DC2626":"none"} stroke={isFav?"#DC2626":C.soft} strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button onClick={()=>{ try{ navigator.share({title:e.name,text:e.tagline}); }catch(err){} }} style={{ width:36, height:36, borderRadius:10, background:C.cream2, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><circle cx={18} cy={5} r={3}/><circle cx={6} cy={12} r={3}/><circle cx={18} cy={19} r={3}/><line x1={8.59} y1={13.51} x2={15.42} y2={17.49}/><line x1={15.41} y1={6.51} x2={8.59} y2={10.49}/></svg>
          </button>
        </div>
      </div>

      {/* ── EXPERT CARD ──────────────────────────────────────────────────── */}
      <div style={{ margin:"16px 18px 0", background:e.bg, borderRadius:18, overflow:"hidden", border:`1px solid rgba(0,0,0,.07)` }}>
        <div style={{ padding:"16px", display:"flex", gap:14, alignItems:"flex-start" }}>
          {/* Photo / vidéo placeholder */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:100, height:130, borderRadius:14, background:`linear-gradient(160deg,${e.bg||C.cream2},${e.color||C.gold}22)`, border:`2px solid ${e.color||C.gold}22`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              {photoSrc
                ? <img src={photoSrc} alt={e.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div style={{ fontSize:36, fontWeight:800, color:e.color||C.gold, fontFamily:SERIF }}>{e.initials}</div>
              }
            </div>
            {/* Play button */}
            <div style={{ position:"absolute", bottom:8, right:8, width:30, height:30, borderRadius:"50%", background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", backdropFilter:"blur(4px)" }}>
              <svg width={10} height={12} viewBox="0 0 10 12" fill="white"><path d="M0 0l10 6-10 6z"/></svg>
            </div>
            {/* Flag */}
            <div style={{ position:"absolute", top:8, left:8, fontSize:16, lineHeight:1 }}>{e.country}</div>
          </div>
          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,.65)", borderRadius:20, padding:"3px 10px", marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:e.color }}>✦ Expérience confirmée</span>
            </div>
            <div style={{ fontSize:19, fontWeight:700, color:C.ink, fontFamily:SERIF, lineHeight:1.2, marginBottom:4 }}>{e.name}</div>
            <div style={{ fontSize:12, color:C.soft, lineHeight:1.5, marginBottom:8 }}>{e.role.split("·")[0].trim()}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {e.langs.map(l => <span key={l} style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:"rgba(255,255,255,.6)", color:C.soft, fontWeight:600 }}>{l}</span>)}
              {e.nda && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:"rgba(0,0,0,.08)", color:C.soft, fontWeight:700 }}>🔒 NDA</span>}
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div style={{ borderTop:"1px solid rgba(0,0,0,.07)", display:"grid", gridTemplateColumns:"1fr 1fr 1fr" }}>
          {[
            {l:"Expérience", v:metrics[0].value},
            {l:"Note", v: e.reviews > 0 && e.rating ? `⭐ ${e.rating}` : "Nouveau"},
            {l:"Sessions", v:`+${e.reviews||0}`},
          ].map((s,i) => (
            <div key={s.l} style={{ padding:"12px 8px", textAlign:"center", borderRight:i<2?"1px solid rgba(0,0,0,.07)":"none" }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{s.v}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Temps de réponse pill */}
      {(()=>{ const rt=e.metrics?.find(m=>m.label?.includes("réponse")||m.label?.includes("response")); return rt ? (
        <div style={{ margin:"10px 18px 0", background:"#FFFBEB", borderRadius:12, padding:"9px 14px", border:"1px solid #FDE68A", display:"flex", alignItems:"center", gap:8 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={{ fontSize:12, color:"#92400E" }}>Répond généralement <strong>{rt.value}</strong></span>
        </div>
      ) : null; })()}

      <div style={{ padding:"24px 18px 0" }}>
        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── SOBRE MÍ ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:10 }}>Qui suis-je ?</div>
          <div style={{ fontSize:14, color:C.soft, lineHeight:1.8 }}>
            {bioExpanded ? bio : bioShort}
          </div>
          {bio.length > 130 && (
            <button onClick={()=>setBioExpanded(v=>!v)} style={{ background:"none", border:"none", cursor:"pointer", color:e.color, fontWeight:700, fontSize:13, padding:"6px 0 0", fontFamily:"inherit" }}>
              {bioExpanded ? "Lire moins ↑" : "Lire plus →"}
            </button>
          )}
        </div>

        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── VOTRE QUESTION ─────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:6 }}>Votre question pour la session</div>
          <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:14 }}>
            Écrivez la question précise à laquelle vous voulez une réponse. {e.name.split(" ")[0]} arrivera préparé(e) — vous utilisez chaque minute de la session pour ce qui compte vraiment.
          </div>
          <textarea
            placeholder={`Ex : "Comment négocier mon salaire lors d'une reconversion à 35 ans sans expérience dans le secteur ?" `}
            rows={3}
            style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, color:C.ink, fontFamily:"inherit", lineHeight:1.6, resize:"none", background:C.cream2, outline:"none", boxSizing:"border-box" }}
          />
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"10px 13px", borderRadius:11, background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`, border:`1px solid ${C.goldB}` }}>
            <span style={{ fontSize:16 }}>💡</span>
            <span style={{ fontSize:12, color:C.gold, lineHeight:1.5 }}>
              <b>Conseil :</b> une question précise = une réponse concrète. Évitez les questions trop larges.
            </span>
          </div>
        </div>

        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── STYLE DE CONSULTATION ────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:14 }}>Style de consultation</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {styleTags.map(t => (
              <span key={t} style={{ padding:"8px 16px", borderRadius:20, border:`1.5px solid ${C.border}`, fontSize:13, color:C.ink, fontWeight:500, background:C.white }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── CE QUE JE RÉSOUS ───────────────────────────────────────── */}
        {extras.resout.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:14 }}>Je t'aide à…</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {extras.resout.map((r,i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:e.color, flexShrink:0, marginTop:6 }}/>
                  <span style={{ fontSize:14, color:C.soft, lineHeight:1.6 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── MES OFFRES ─────────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:14 }}>Mes offres</div>
          {phases.slice(0,3).map(ph => {
            const isOpen = openPhase === ph.id;
            return (
              <div key={ph.id} onClick={() => setOpenPhase(isOpen?null:ph.id)}
                style={{ background:isOpen?e.bg:C.cream, border:`1.5px solid ${isOpen?e.color:C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer", transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:4 }}>{ph.name}</div>
                    <div style={{ fontSize:12, color:C.soft, lineHeight:1.4, marginBottom:6 }}>{ph.what}</div>
                    <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:isOpen?C.white:C.cream3, color:C.soft, fontWeight:600 }}>{ph.tag}</span>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{ph.price?`${ph.price}€`:"Devis"}</div>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} style={{ transform:isOpen?"rotate(180deg)":"none", transition:".2s" }}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                    {ph.inc.map((inc,i) => (
                      <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:7 }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5} style={{ flexShrink:0, marginTop:1 }}><polyline points="20 6 9 17 4 12"/></svg>
                        <span style={{ fontSize:12, color:C.soft }}>{inc}</span>
                      </div>
                    ))}
                    <button onClick={ev=>{ev.stopPropagation();onBook(e,ph);}}
                      style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, background:C.ink, color:C.white, marginTop:12, fontFamily:SERIF }}>
                      Réserver — {ph.price?`${ph.price}€`:"devis"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── PREUVES D'EXPÉRIENCE ──────────────────────────────────── */}
        {extras.preuves.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ height:1, background:C.border, marginBottom:24 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Expérience prouvée</div>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:C.sageL, color:C.sage, fontWeight:700 }}>Vérifié ✓</span>
            </div>
            {extras.preuves.map((p,i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"0 0 12px", borderBottom:i<extras.preuves.length-1?`1px solid ${C.border}`:"none", marginBottom:i<extras.preuves.length-1?12:0 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:e.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>✦</div>
                <span style={{ fontSize:13, color:C.soft, lineHeight:1.6, paddingTop:4 }}>{p}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── AVIS CLIENTS ─────────────────────────────────────────── */}
        {extras.reviews.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ height:1, background:C.border, marginBottom:24 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Avis clients</div>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                {[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill="#B8864A"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
                <span style={{ fontSize:12, color:C.muted, marginLeft:4 }}>{e.rating} · {e.reviews} avis</span>
              </div>
            </div>
            {allReviews.map((r,i) => (
              <div key={i} style={{ padding:"0 0 16px", borderBottom:i<allReviews.length-1?`1px solid ${C.border}`:"none", marginBottom:i<allReviews.length-1?16:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{r.name}</div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{r.date}</div>
                  </div>
                  <div style={{ display:"flex", gap:2 }}>
                    {[1,2,3,4,5].map(s => <svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s<=r.stars?"#B8864A":"#D6D0C8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
                  </div>
                </div>
                {r.text && <div style={{ fontSize:13, color:C.soft, lineHeight:1.7, fontStyle:"italic" }}>"{r.text}"</div>}
              </div>
            ))}
          </div>
        )}

        {/* ── CONFIANCE ────────────────────────────────────────────── */}
        <div style={{ height:1, background:C.border, marginBottom:20 }}/>
        <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap", marginBottom:8, paddingBottom:8 }}>
          {["🔒 Paiement sécurisé","🔁 Annulation flexible","✅ Vérifié Savvy"].map(t => (
            <span key={t} style={{ fontSize:11, color:C.muted }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── STICKY BOTTOM CTA ────────────────────────────────────────────── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"12px 18px 28px", background:C.white, borderTop:`1px solid ${C.border}`, zIndex:20 }}>
        <button onClick={() => onBook(e, phases[0])} style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:C.ink, color:C.white, fontFamily:SERIF, letterSpacing:".2px", marginBottom:8 }}>
          Parler avec {e.name.split(" ")[0]} → {phases[0].price ? `${phases[0].price}€` : "Devis"}
        </button>
        <button onClick={() => onMsg(e)} style={{ width:"100%", padding:"10px", border:"none", background:"none", cursor:"pointer", fontSize:13, color:C.muted, fontWeight:600, fontFamily:"inherit" }}>
          Poser une question d'abord
        </button>
      </div>
    </div>
  );
}

export default ExpertScreen;
