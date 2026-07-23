import React, { useState } from 'react';
import { C, SERIF } from '../constants/colors';
import { Ico } from '../constants/menuIcons.jsx';
import { CATS, CAT_MAP } from '../constants/data';
import { Av } from '../components/ui';

function MatchScreen({ onExpert, onBrowseAll, experts=[] }) {
  const [step, setStep]       = useState(0); // 0=situation 1=besoin 2=quand 3=results
  const [situation, setSituation] = useState(null);
  const [besoin, setBesoin]       = useState(null);
  const [quand, setQuand]         = useState(null);
  const [animDir, setAnimDir]     = useState("forward");

  const go = (next) => { setAnimDir("forward"); setTimeout(()=>setStep(next),0); };
  const back = ()  => { setAnimDir("back");    setTimeout(()=>setStep(s=>s-1),0); };

  // ── Step 0 — Situation ──────────────────────────────────────────
  const situations = CATS.map(c => ({ id:c.id, icon:c.icon, label:c.label, color:c.color, bg:c.bg||C.cream2 }));

  // ── Step 1 — Ce que tu cherches ─────────────────────────────────
  const besoins = [
    { id:"reponse",  icon:"🎯", label:"Une réponse concrète",      sub:"J'ai une question précise, je veux une réponse directe" },
    { id:"plan",     icon:"🗺️", label:"Un plan d'action",          sub:"Je veux des étapes claires pour avancer" },
    { id:"vecu",     icon:"🤝", label:"Quelqu'un qui l'a vécu",    sub:"Parler à quelqu'un qui a traversé la même chose" },
    { id:"explorer", icon:"💭", label:"Je ne sais pas encore",     sub:"Je veux explorer mes options avec un expert" },
  ];

  // ── Step 2 — Quand ──────────────────────────────────────────────
  const quands = [
    { id:"auj",      icon:"⚡", label:"Aujourd'hui",        sub:"Je suis disponible maintenant ou ce soir" },
    { id:"semaine",  icon:"📅", label:"Cette semaine",      sub:"Dans les prochains jours" },
    { id:"flexible", icon:"🗓️", label:"Je suis flexible",  sub:"Peu importe, je m'adapte" },
  ];

  // ── Step 3 — Résultats ───────────────────────────────────────────
  const getMatches = () => {
    // Filtre par catégorie: d'abord par champ `cat`, sinon par CAT_MAP (données démo)
    let pool = experts;
    if (situation) {
      const byCat = experts.filter(e => e.cat === situation);
      const byIds = experts.filter(e => (CAT_MAP[situation]||[]).includes(e.id));
      pool = byCat.length > 0 ? byCat : byIds.length > 0 ? byIds : experts;
    }
    // Score & sort
    const scored = pool.map(e => ({
      ...e,
      score: (e.rating||4) * 10
        + (besoin==="reponse" ? (e.reviews||0)*0.01 : 0)
        + (besoin==="vecu"    ? (e.reviews||0)*0.05 : 0)
        + (quand==="auj"      ? (e.available ? 20 : 0) : 0)
        + Math.random()*2
    }));
    return scored.sort((a,b)=>b.score-a.score).slice(0,3);
  };

  const matches = step===3 ? getMatches() : [];

  const Progress = () => (
    <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:24}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{height:3,borderRadius:2,transition:"all .3s",
          width: i<step ? 28 : i===step ? 40 : 20,
          background: i<step ? C.ink : i===step ? C.gold : C.border
        }}/>
      ))}
    </div>
  );

  const StepLabel = ({n,title,sub}) => (
    <div style={{marginBottom:22,textAlign:"center"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>
        Étape {n} sur 3
      </div>
      <div style={{fontSize:22,fontWeight:700,color:C.ink,fontFamily:SERIF,lineHeight:1.25,marginBottom:6}}>{title}</div>
      {sub && <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>{sub}</div>}
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:80,background:C.cream}}>
      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
        {step>0 && step<3 && (
          <button onClick={back} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF}}>
            {step===0?"Trouver votre expert":step===1?"Ce que vous cherchez":step===2?"Votre disponibilité":"Vos experts"}
          </div>
        </div>
        <button onClick={onBrowseAll} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.muted,fontWeight:600,fontFamily:"inherit",flexShrink:0}}>
          Voir tout
        </button>
      </div>

      <div style={{padding:"24px 18px 0"}}>
        {/* ── STEP 0 — Situation ── */}
        {step===0 && <>
          <Progress/>
          <StepLabel n={1} title="Quelle est votre situation ?" sub="Choisissez le thème qui vous correspond le mieux"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {situations.map(s=>(
              <button key={s.id} onClick={()=>{ setSituation(s.id); go(1); }}
                style={{padding:"16px 12px",borderRadius:16,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",textAlign:"center",fontFamily:"inherit",boxShadow:`0 2px 8px ${C.sh}`,transition:"all .2s",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <div style={{width:48,height:48,borderRadius:14,background:s.bg||C.cream2,display:"flex",alignItems:"center",justifyContent:"center",color:s.color||C.soft}}><Ico k={s.icon} size={24}/></div>
                <span style={{fontSize:12,fontWeight:700,color:C.ink,lineHeight:1.2}}>{s.label}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>{ setSituation(null); go(1); }} style={{width:"100%",marginTop:12,padding:"12px",borderRadius:13,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            Je ne sais pas encore →
          </button>
        </>}

        {/* ── STEP 1 — Besoin ── */}
        {step===1 && <>
          <Progress/>
          <StepLabel n={2} title="Qu'est-ce que vous cherchez ?" sub="Pour qu'on trouve le profil qui correspond vraiment"/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {besoins.map(b=>(
              <button key={b.id} onClick={()=>{ setBesoin(b.id); go(2); }}
                style={{display:"flex",alignItems:"center",gap:14,padding:"16px 16px",borderRadius:16,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",textAlign:"left",fontFamily:"inherit",boxShadow:`0 2px 8px ${C.sh}`,transition:"all .2s"}}>
                <div style={{width:46,height:46,borderRadius:14,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{b.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:3}}>{b.label}</div>
                  <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}>{b.sub}</div>
                </div>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </>}

        {/* ── STEP 2 — Quand ── */}
        {step===2 && <>
          <Progress/>
          <StepLabel n={3} title="Quand êtes-vous disponible ?" sub="On adapte la sélection à votre agenda"/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {quands.map(q=>(
              <button key={q.id} onClick={()=>{ setQuand(q.id); go(3); }}
                style={{display:"flex",alignItems:"center",gap:14,padding:"18px 16px",borderRadius:16,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",textAlign:"left",fontFamily:"inherit",boxShadow:`0 2px 8px ${C.sh}`,transition:"all .2s"}}>
                <div style={{width:46,height:46,borderRadius:14,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{q.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:3}}>{q.label}</div>
                  <div style={{fontSize:12,color:C.muted}}>{q.sub}</div>
                </div>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </>}

        {/* ── STEP 3 — Résultats ── */}
        {step===3 && <>
          {/* Résumé du match */}
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:20,padding:"20px 18px",marginBottom:20,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(185,134,74,.08)"}}/>
            <div style={{fontSize:11,color:C.goldB,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>✦ Résultat de votre match</div>
            <div style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:SERIF,lineHeight:1.2,marginBottom:10}}>
              Nous avons trouvé<br/><em style={{color:C.goldB}}>3 experts pour vous</em>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {situation && <span style={{background:"rgba(255,255,255,.1)",color:"rgba(253,252,248,.8)",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:600}}>
                {situations.find(s=>s.id===situation)?.icon} {situations.find(s=>s.id===situation)?.label}
              </span>}
              {besoin && <span style={{background:"rgba(255,255,255,.1)",color:"rgba(253,252,248,.8)",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:600}}>
                {besoins.find(b=>b.id===besoin)?.icon} {besoins.find(b=>b.id===besoin)?.label}
              </span>}
              {quand && <span style={{background:"rgba(255,255,255,.1)",color:"rgba(253,252,248,.8)",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:600}}>
                {quands.find(q=>q.id===quand)?.icon} {quands.find(q=>q.id===quand)?.label}
              </span>}
            </div>
          </div>

          {/* Les 3 experts matchés */}
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            {matches.map((e,i)=>(
              <div key={e.id} onClick={()=>onExpert(e)}
                style={{background:C.white,borderRadius:18,border:`1.5px solid ${i===0?C.gold:C.border}`,padding:"16px",cursor:"pointer",boxShadow:i===0?`0 4px 20px rgba(185,134,74,.18)`:`0 2px 8px ${C.sh}`,position:"relative",overflow:"hidden",transition:"all .2s"}}>
                {i===0 && (
                  <div style={{position:"absolute",top:12,right:12,background:`linear-gradient(135deg,${C.gold},#D4A853)`,color:C.white,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700}}>
                    ✦ Meilleur match
                  </div>
                )}
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Av e={e} size={54}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:2,paddingRight:i===0?80:0}}>{e.name}</div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:6}}>{e.role}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}>
                        <svg width={12} height={12} viewBox="0 0 12 12" fill={C.gold}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>
                        <span style={{fontSize:12,fontWeight:700,color:C.gold}}>{e.rating}</span>
                      </div>
                      <span style={{fontSize:11,color:C.muted}}>·</span>
                      <span style={{fontSize:11,color:C.muted}}>{e.sessions||e.reviews||0} sessions</span>
                      {e.verified && <span style={{fontSize:10,background:"#D1FAE5",color:"#065F46",borderRadius:20,padding:"2px 7px",fontWeight:700}}>✓ Vérifié</span>}
                    </div>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:12,color:C.soft,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                  "{e.tagline}"
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.ink}}>À partir de <span style={{fontSize:17,fontFamily:SERIF,color:C.gold}}>{e.phases?.[0]?.price||49}€</span></div>
                  <div style={{padding:"8px 16px",borderRadius:10,background:C.ink,color:C.white,fontSize:12,fontWeight:700,fontFamily:SERIF}}>Voir le profil →</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommencer ou voir tout */}
          <div style={{display:"flex",gap:10,paddingBottom:12}}>
            <button onClick={()=>setStep(0)} style={{flex:1,padding:"12px",borderRadius:13,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              ↩ Recommencer
            </button>
            <button onClick={onBrowseAll} style={{flex:1,padding:"12px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>
              Voir tous →
            </button>
          </div>
        </>}
      </div>
    </div>
  );
}

export default MatchScreen;
