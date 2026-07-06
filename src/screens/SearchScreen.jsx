import React, { useState, useRef } from 'react';
import { C, SERIF } from '../constants/colors';
import { CATS, SUBCATS } from '../constants/data';
import { ExpertCard } from '../components/ui';

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

function SearchScreen({ initQ="", initCat=null, onExpert, onBack, experts=[], expertsLoaded=true }) {
  const [q, setQ] = useState(initQ);
  const [activeCat, setActiveCat] = useState(initCat);
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [pilier, setPilier] = useState("tous");
  const [filters, setFilters] = useState({ prix:null, langue:null, format:null, dispo:null, note:null });
  const [showFilters, setShowFilters] = useState(false);
  const catBarRef = useRef(null);
  const scrollCats = (dir) => { if(catBarRef.current) catBarRef.current.scrollBy({left: dir*160, behavior:"smooth"}); };
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savvy_search_history")||"[]"); } catch { return []; }
  });

  const saveSearch = (term) => {
    if (!term.trim() || term.length < 2) return;
    const updated = [term, ...history.filter(h=>h!==term)].slice(0,6);
    setHistory(updated);
    try { localStorage.setItem("savvy_search_history", JSON.stringify(updated)); } catch {}
  };

  const toggleFilter = (key, val) => setFilters(f => ({...f, [key]: f[key]===val?null:val}));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Filter experts
  let filtered = [...experts];
  if (activeCat) { filtered = filtered.filter(e=>e.cat===activeCat); }
  if (pilier==="top")      filtered = [...filtered].sort((a,b)=>b.rating-a.rating);
  if (pilier==="verifies") filtered = filtered.filter(e=>e.verified);
  if (q.trim().length>1) {
    const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
    const words = norm(q).trim().split(/\s+/).filter(Boolean);
    filtered = filtered.filter(e => {
      const hay = norm(e.name+" "+e.role+" "+e.tagline+" "+(e.location||"")+" "+(e.bio||"")+" "+(e.creds||[]).join(" "));
      return words.every(w => hay.includes(w));
    });
  }
  if (filters.prix==="0-50")   filtered = filtered.filter(e=>(e.phases||[])[0]?.price&&e.phases[0].price<=50);
  if (filters.prix==="50-200") filtered = filtered.filter(e=>(e.phases||[])[0]?.price&&e.phases[0].price>50&&e.phases[0].price<=200);
  if (filters.prix==="200+")   filtered = filtered.filter(e=>!(e.phases||[])[0]?.price||e.phases[0].price>200);
  if (filters.langue) filtered = filtered.filter(e=>(e.langs||[]).includes(filters.langue));
  if (filters.note==="4")   filtered = filtered.filter(e=>e.rating>=4);
  if (filters.note==="4.5") filtered = filtered.filter(e=>e.rating>=4.5);
  if (filters.note==="5")   filtered = filtered.filter(e=>e.rating>=4.9);

  const catObj = activeCat ? CATS.find(c=>c.id===activeCat) : null;
  const subcats = activeCat ? (SUBCATS[activeCat]||[]) : [];

  const POPULAR = [
    "Trouver un appart sans garant",
    "Lancer une activité en France",
    "Changer de carrière à 35 ans",
    "Exporter vers la Colombie",
    "Réussir son macaron",
    "Optimiser un laboratoire",
  ];

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:72, background:C.cream }}>

      {/* ── SEARCH BAR ───────────────────────────────────────────────── */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:20, boxShadow:`0 2px 12px ${C.sh}` }}>
        <div style={{ padding:"12px 16px 0" }}>
          {!q && !activeCat && (
            <div style={{ fontSize:12, color:C.muted, fontFamily:SERIF, fontStyle:"italic", marginBottom:8, textAlign:"center" }}>
              ✦ Parlez avec quelqu'un qui l'a déjà fait.
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:9, background:C.cream2, borderRadius:13, padding:"11px 14px", border:`1.5px solid ${activeCat?catObj?.color:C.border}`, marginBottom:12, transition:"border-color .2s" }}>
            {onBack && <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", color:C.muted, flexShrink:0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m15 18-6-6 6-6"/></svg>
            </button>}
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Quel problème voulez-vous résoudre ?" style={{ border:"none", background:"none", fontSize:14, color:C.ink, flex:1, outline:"none", fontFamily:"inherit" }}/>
            {q && <button onClick={()=>setQ("")} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:20, padding:0, lineHeight:1 }}>×</button>}
          </div>
        </div>

        {/* ── NIVEAU 1 — Catégories principales ── */}
        <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
          <button onClick={()=>scrollCats(-1)} style={{ position:"absolute", left:0, zIndex:2, width:28, height:28, borderRadius:"50%", background:C.white, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 1px 6px ${C.sh}`, flexShrink:0 }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        <div ref={catBarRef} style={{ display:"flex", gap:8, overflowX:"auto", WebkitOverflowScrolling:"touch", scrollbarWidth:"none", msOverflowStyle:"none", paddingLeft:36, paddingRight:36, paddingBottom:10, marginBottom:0, touchAction:"pan-x", flex:1 }}>
          <button onClick={()=>{setActiveCat(null);setActiveSubcat(null);}} style={{ flexShrink:0, padding:"8px 16px", borderRadius:20, border:`1.5px solid ${!activeCat?C.ink:C.border}`, background:!activeCat?C.ink:"transparent", color:!activeCat?C.white:C.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", whiteSpace:"nowrap" }}>
            Tous
          </button>
          {CATS.map(cat => {
            const isActive = activeCat===cat.id;
            return (
              <button key={cat.id} onClick={()=>{ setActiveCat(isActive?null:cat.id); setActiveSubcat(null); }}
                style={{ flexShrink:0, padding:"8px 16px", borderRadius:20, border:`1.5px solid ${isActive?cat.color:C.border}`, background:isActive?cat.color:"transparent", color:isActive?C.white:C.ink, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:15 }}>{cat.icon}</span>
                {cat.label}
                {isActive && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            );
          })}
        </div>
          <button onClick={()=>scrollCats(1)} style={{ position:"absolute", right:0, zIndex:2, width:28, height:28, borderRadius:"50%", background:C.white, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 1px 6px ${C.sh}`, flexShrink:0 }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* ── NIVEAU 2 — Sous-catégories (animées) ── */}
        {activeCat && subcats.length > 0 && (
          <div style={{ overflow:"visible", marginBottom:8 }}>
            <div style={{ display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", WebkitOverflowScrolling:"touch", paddingBottom:6, marginLeft:-16, marginRight:-16, paddingLeft:16, paddingRight:16, touchAction:"pan-x" }}>
              {subcats.map(sc => {
                const isActive = activeSubcat===sc.id;
                return (
                  <button key={sc.id} onClick={()=>setActiveSubcat(isActive?null:sc.id)}
                    style={{ flexShrink:0, padding:"6px 13px", borderRadius:20, border:`1.5px solid ${isActive?catObj.color:C.border}`, background:isActive?catObj.bg:"transparent", color:isActive?catObj.color:C.muted, fontSize:11, fontWeight:isActive?700:500, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:13 }}>{sc.icon}</span>
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PILIERS + FILTRES ── */}
        <div style={{ display:"flex", alignItems:"center", gap:0, borderTop:`1px solid ${C.borderF}` }}>
          {[{id:"tous",label:"Tous"},{id:"top",label:"⭐ Top notés"},{id:"verifies",label:"✓ Vérifiés"}].map(p=>(
            <button key={p.id} onClick={()=>setPilier(p.id)} style={{ flex:1, padding:"10px 4px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:pilier===p.id?700:400, color:pilier===p.id?C.ink:C.muted, borderBottom:pilier===p.id?`2.5px solid ${C.ink}`:"2px solid transparent", transition:"all .15s" }}>{p.label}</button>
          ))}
          <button onClick={()=>setShowFilters(v=>!v)} style={{ padding:"10px 12px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600, color:activeFilterCount>0?C.gold:C.muted, borderBottom:showFilters?`2.5px solid ${C.gold}`:"2px solid transparent", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={4} y1={6} x2={20} y2={6}/><line x1={8} y1={12} x2={16} y2={12}/><line x1={11} y1={18} x2={13} y2={18}/></svg>
            {activeFilterCount>0?` (${activeFilterCount})`:""} Filtres
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div style={{ background:C.cream2, padding:"12px 14px 14px", borderTop:`1px solid ${C.border}`, marginLeft:-16, marginRight:-16, paddingLeft:16, paddingRight:16 }}>
            {[
              {key:"prix",   label:"Prix",         options:[{v:"0-50",l:"< 50€"},{v:"50-200",l:"50–200€"},{v:"200+",l:"200€+"}]},
              {key:"langue", label:"Langue",        options:[{v:"FR",l:"FR"},{v:"EN",l:"EN"},{v:"ES",l:"ES"}]},
              {key:"format", label:"Format",        options:[{v:"video",l:"Vidéo"},{v:"appel",l:"Appel"},{v:"chat",l:"Chat"},{v:"doc",l:"Document"}]},
              {key:"dispo",  label:"Disponibilité", options:[{v:"auj",l:"Aujourd'hui"},{v:"sem",l:"Cette semaine"},{v:"mois",l:"Ce mois"}]},
              {key:"note",   label:"Note minimum",  options:[{v:"4",l:"4★+"},{v:"4.5",l:"4.5★+"},{v:"5",l:"5★ only"}]},
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:6 }}>{f.label}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {f.options.map(o=>(
                    <button key={o.v} onClick={()=>toggleFilter(f.key,o.v)} style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${filters[f.key]===o.v?C.gold:C.border}`, background:filters[f.key]===o.v?C.goldL:C.white, color:filters[f.key]===o.v?C.gold:C.soft, fontSize:11, fontWeight:filters[f.key]===o.v?700:400, cursor:"pointer", fontFamily:"inherit" }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {activeFilterCount>0 && <button onClick={()=>setFilters({prix:null,langue:null,format:null,dispo:null,note:null})} style={{ fontSize:11, color:C.gold, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Effacer les filtres</button>}
          </div>
        )}
      </div>

      {/* ── CONTENU ─────────────────────────────────────────────────── */}
      <div style={{ padding:"16px 16px 0" }}>

        {/* Historique si pas de recherche */}
        {!q && !activeCat && (
          <>
            {history.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Recherches récentes</div>
                  <button onClick={()=>setHistory([])} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {history.map((h,i)=>(
                    <button key={i} onClick={()=>setQ(h)} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${C.border}`, background:C.white, color:C.soft, fontSize:12, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><circle cx={12} cy={12} r={9}/><polyline points="12 7 12 12 15 15"/></svg>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recherches populaires */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:10 }}>Recherches populaires</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {POPULAR.map(p=>(
                  <button key={p} onClick={()=>{setQ(p);saveSearch(p);}} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${C.border}`, background:C.white, color:C.soft, fontSize:12, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Top catégories visuelles */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:12 }}>Top catégories</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {CATS.map(cat=>(
                  <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 15px", borderRadius:16, border:`1px solid ${C.border}`, background:C.white, cursor:"pointer", textAlign:"left", fontFamily:"inherit", boxShadow:`0 2px 8px ${C.sh}`, transition:"all .2s" }}>
                    <div style={{ width:46, height:46, borderRadius:13, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, border:`1px solid ${cat.color}20` }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:C.ink, lineHeight:1.3 }}>{cat.label}</div>
                      <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.3 }}>{cat.sub}</div>
                      {(()=>{ const n=experts.filter(e=>e.cat===cat.id).length; return n>0 ? <div style={{ fontSize:10, color:cat.color, marginTop:4, fontWeight:600 }}>{n} expert{n>1?"s":""}</div> : null; })()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Résultats */}
        {(q || activeCat) && (
          <>
            {/* Header résultats */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>
                  {activeSubcat ? subcats.find(s=>s.id===activeSubcat)?.label : catObj?.label || "Tous les experts"}
                </div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                  {filtered.length} conseiller{filtered.length>1?"s":""} disponible{filtered.length>1?"s":""}
                </div>
              </div>
              {activeCat && (
                <button onClick={()=>{setActiveCat(null);setActiveSubcat(null);}} style={{ fontSize:12, color:C.muted, background:C.cream3, border:"none", cursor:"pointer", fontFamily:"inherit", padding:"5px 11px", borderRadius:20, fontWeight:600 }}>
                  Tout voir ×
                </button>
              )}
            </div>

            {/* Expert cards */}
            {!expertsLoaded
              ? [1,2,3].map(i=><SkeletonCard key={i}/>)
              : filtered.length > 0
              ? filtered.map(e => (
                  <ExpertCard key={e.id} e={e} onClick={()=>{ if(q.trim().length>1) saveSearch(q); onExpert(e); }}/>
                ))
              : (
                <div style={{ textAlign:"center", padding:"60px 20px" }}>
                  <div style={{ width:64,height:64,borderRadius:20,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={1.5}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>
                    {experts.length===0 ? "Bientôt disponible" : "Aucun résultat"}
                  </div>
                  <div style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
                    {experts.length===0 ? "Les premiers conseillers arrivent très bientôt." : q ? `Aucun conseiller pour "${q}"` : "Aucun conseiller dans cette catégorie pour le moment."}
                  </div>
                  {experts.length>0 && <button onClick={()=>{setQ("");setActiveCat(null);setActiveSubcat(null);}} style={{ padding:"11px 24px", borderRadius:12, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF }}>
                    Réinitialiser
                  </button>}
                </div>
              )
            }
          </>
        )}
      </div>
    </div>
  );
}

export default SearchScreen;
