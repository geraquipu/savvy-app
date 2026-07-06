import React, { useState, useEffect } from 'react'
import { C, SERIF } from '../constants/colors'
import { EXPERTS, DEMO_MSGS, getThreads } from '../constants/data'
import { Av } from '../components/ui'
import { supabase } from '../supabase'

function MessagesListScreen({onConv, isLoggedIn, onLogin, readMsgIds=[], onMarkMsgRead, appMode="client", isNewExpert=false, isRealUser=false, authUser=null, dbExperts=[]}) {
  const [realClientConvs, setRealClientConvs] = useState([]);
  const [realExpertConvs, setRealExpertConvs] = useState([]);

  // Charger les conversations expert réelles (mode client) depuis Supabase
  useEffect(() => {
    if (!(isRealUser && appMode!=="expert" && authUser?.id)) { setRealExpertConvs([]); return; }
    let cancelled = false;
    supabase.from("messages")
      .select("*")
      .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled || !data || data.length===0) { setRealExpertConvs([]); return; }
        const byExpert = new Map();
        for (const m of data) {
          if (!m.expert_id || byExpert.has(m.expert_id)) continue;
          byExpert.set(m.expert_id, m);
        }
        const convs = [...byExpert.entries()].map(([eid, m]) => {
          const expert = dbExperts.find(de=>de.id===eid) || EXPERTS.find(e=>e.id===eid);
          if (!expert) return null;
          return {
            eid, type:"expert", expert,
            lastMsg: m.content,
            time: new Date(m.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
            unread: m.sender_id!==authUser.id ? 1 : 0,
            id: eid, _fromSB: true,
          };
        }).filter(Boolean);
        setRealExpertConvs(convs);
      });
    return () => { cancelled = true; };
  }, [isRealUser, appMode, authUser?.id, dbExperts]);

  // Charger les conversations clients réelles (expert mode) depuis Supabase
  useEffect(() => {
    if (!(isRealUser && appMode==="expert" && authUser?.expertId)) { setRealClientConvs([]); return; }
    let cancelled = false;
    supabase.from("messages")
      .select("*")
      .eq("expert_id", authUser.expertId)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        if (cancelled || !data || data.length===0) { setRealClientConvs([]); return; }
        const byClient = new Map();
        for (const m of data) {
          const clientId = m.sender_id === authUser.id ? m.receiver_id : m.sender_id;
          if (!clientId || byClient.has(clientId)) continue;
          byClient.set(clientId, m);
        }
        const clientIds = [...byClient.keys()];
        const { data: profiles } = await supabase.from("profiles").select("id, name, photo_url").in("id", clientIds);
        if (cancelled) return;
        const convs = clientIds.map(cid => {
          const m = byClient.get(cid);
          const p = profiles?.find(pr=>pr.id===cid);
          return {
            id: "real-"+cid, type:"client", clientId: cid,
            name: p?.name || "Client",
            ini: (p?.name||"C").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
            bg:"#EDE9FE", col:"#7C3AED", photoUrl: p?.photo_url,
            lastMsg: m.content, time: new Date(m.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
            unread: m.sender_id!==authUser.id ? 1 : 0, session:null,
          };
        });
        setRealClientConvs(convs);
      });
    return () => { cancelled = true; };
  }, [isRealUser, appMode, authUser?.expertId, authUser?.id]);
  const [msgFilter, setMsgFilter]       = useState("tous");
  const [showSavvyChat, setShowSavvyChat] = useState(false);
  const [savvyInput, setSavvyInput]     = useState("");
  const [savvyMsgs, setSavvyMsgs]       = useState([
    {from:"savvy", txt:"Bonjour ! Je suis ton assistant Savvy. Comment puis-je t'aider aujourd'hui ?"}
  ]);
  const sendSupport = async () => {
    const txt = savvyInput.trim();
    if (!txt) return;
    setSavvyInput("");
    setSavvyMsgs(m => [...m, { from:"moi", txt }]);
    // Envoyer le message au support (email équipe)
    let delivered = false;
    if (isRealUser && authUser?.id) {
      try {
        const { data } = await supabase.functions.invoke("send-support-message", {
          body: { message: txt, fromName: authUser?.name || "Utilisateur", fromEmail: authUser?.email || null, userId: authUser.id },
        });
        delivered = !!data?.ok;
      } catch { delivered = false; }
    }
    setSavvyMsgs(m => [...m, { from:"savvy", txt: delivered
      ? "Merci ! Ton message a bien été transmis à l'équipe Savvy. On te répond par email dans les 24h."
      : "Merci pour ton message ! Écris-nous directement à contact@getsavvy.fr et on te répond au plus vite." }]);
  };
  const [searchQ, setSearchQ]           = useState("");
  const [showSearch, setShowSearch]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab]   = useState("rapides"); // "rapides" | "archives" | "commentaire"
  const [quickReplies, setQuickReplies] = useState([
    {id:1, txt:"Merci pour ta réservation ! On se retrouve bientôt 🙌"},
    {id:2, txt:"Bonjour ! Je confirme notre session. À tout à l'heure !"},
    {id:3, txt:"Super échange, n'hésite pas si tu as d'autres questions ✦"},
    {id:4, txt:"Je serai disponible à l'heure prévue. Prépare tes questions !"},
  ]);
  const [newReply, setNewReply]         = useState("");
  const [archivedIds, setArchivedIds]   = useState([]);
  const [feedbackTxt, setFeedbackTxt]   = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const markMsgRead = (id) => onMarkMsgRead && onMarkMsgRead(id);

  const _getLastMsg = (initials) => {
    try {
      const saved = JSON.parse(localStorage.getItem(`savvy_chat_${initials||"guest"}`)||"null");
      if (saved?.length) { const last = saved[saved.length-1]; return { text: last.text?.slice(0,60)+(last.text?.length>60?"…":""), from: last.from, time: last.time }; }
    } catch {}
    return null;
  };
  const lsThreads = (()=>{
    const seen = new Set();
    return getThreads()
      .sort((a,b)=>b.id-a.id) // most recent first
      .filter(t=>{ if(seen.has(t.expertInitials)) return false; seen.add(t.expertInitials); return true; })
      .map(t => {
        const lastReal = _getLastMsg(t.expertInitials);
        return {
          eid: t.expertId, type:"expert",
          expert: dbExperts.find(de=>de.id===t.expertId) || EXPERTS.find(e=>e.initials===t.expertInitials) || {name:t.expertName, initials:t.expertInitials, bg:t.expertBg||"#EDE9FE", color:t.expertCol||"#7C3AED", role:"Conseiller Savvy", id:t.expertId},
          lastMsg: lastReal?.text || t.lastMsg,
          time: lastReal?.time || t.time,
          unread: lastReal?.from==="expert" ? 1 : 0,
          id: t.id, _fromLS: true,
        };
      });
  })();
  const demoMsgIds = new Set(lsThreads.map(t=>t.expert?.initials).filter(Boolean));
  const realEidSet = new Set(realExpertConvs.map(c=>c.eid));
  const expertConvs = isRealUser ? [
    ...realExpertConvs,
    ...lsThreads.filter(t=>!realEidSet.has(t.expertId)),
  ] : [
    ...lsThreads,
    ...DEMO_MSGS.filter(m=>!demoMsgIds.has(EXPERTS[m.eid]?.initials)).map(m => ({...m, expert: EXPERTS[m.eid], type:"expert"})).filter(m => m.expert),
  ];
  const allClientConvs = isRealUser ? [] : [
    {id:"c1", type:"client", name:"Sophie M.", ini:"SM", bg:"#EDE9FE", col:"#7C3AED", lastMsg:"Super session, merci beaucoup !", time:"10:15", unread:0, rating:4.8, session:{format:"📹 Vidéo",dur:"30 min",price:"15€",date:"Aujourd'hui 14h00"}},
    {id:"c2", type:"client", name:"Lucas B.",  ini:"LB", bg:"#DBEAFE", col:"#1D4ED8", lastMsg:"Est-ce que vous êtes disponible jeudi ?", time:"Hier",  unread:1, rating:4.6, session:{format:"📞 Appel",dur:"45 min",price:"25€",date:"Jeudi 11h00"}},
    {id:"c3", type:"client", name:"Emma P.",   ini:"EP", bg:"#D1FAE5", col:"#065F46", lastMsg:"Merci beaucoup pour les conseils !", time:"Lun", unread:0, archived:true, rating:5.0, session:null},
  ];
  // New experts start with no client conversations; clients don't see "client" convs
  const clientConvs = appMode==="expert"
    ? (isRealUser ? realClientConvs : (isNewExpert ? [] : allClientConvs))
    : [];
  // In expert mode, experts only see their clients — not their own client-side expert convs
  const expertConvsDisplay = appMode==="expert" ? [] : expertConvs;

  const allBaseConvs = msgFilter==="clients" ? clientConvs : msgFilter==="experts" ? expertConvsDisplay : appMode==="expert" ? clientConvs : [...expertConvsDisplay,...clientConvs];
  const baseConvs = msgFilter==="nonlus" ? [...expertConvsDisplay,...clientConvs].filter(c=>c.unread>0&&!readMsgIds.includes((c.type==="client"?"cli-":"exp-")+(c.id||c.eid))) : allBaseConvs;
  const visibleConvs = baseConvs
    .filter(c => !archivedIds.includes(c.id||c.eid))
    .filter(c => !searchQ || (c.name||c.expert?.name||"").toLowerCase().includes(searchQ.toLowerCase()) || (c.lastMsg||"").toLowerCase().includes(searchQ.toLowerCase()));
  const archivedConvs = [...expertConvsDisplay,...clientConvs].filter(c=>archivedIds.includes(c.id||c.eid));
  const allConvs = visibleConvs;

  // ── Settings panel ─────────────────────────────────────────────
  if (showSettings) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.cream,height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 18px 14px",borderBottom:`1px solid ${C.border}`,background:C.white}}>
        <button onClick={()=>setShowSettings(false)} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{flex:1,fontSize:17,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Paramètres messagerie</div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,background:C.white}}>
        {[{id:"rapides",l:"Réponses rapides"},{id:"archives",l:"Archivés"},{id:"commentaire",l:"Nous contacter"}].map(t=>(
          <button key={t.id} onClick={()=>setSettingsTab(t.id)} style={{flex:1,padding:"11px 4px",fontSize:10,fontWeight:settingsTab===t.id?700:400,color:settingsTab===t.id?C.ink:C.muted,background:"transparent",border:"none",borderBottom:`2px solid ${settingsTab===t.id?C.ink:"transparent"}`,cursor:"pointer",fontFamily:"inherit"}}>{t.l}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        {/* ── Réponses rapides ── */}
        {settingsTab==="rapides" && (
          <div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.5}}>Tes réponses rapides apparaissent en un tap dans les conversations. L'IA peut t'en générer de nouvelles.</div>
            {quickReplies.map(r=>(
              <div key={r.id} style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 13px",marginBottom:8,display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  {editingReply===r.id
                    ? <textarea defaultValue={r.txt} id={`qr-${r.id}`} style={{width:"100%",padding:"7px 9px",borderRadius:8,border:`1px solid ${C.gold}`,fontSize:12,fontFamily:"inherit",resize:"none",outline:"none",boxSizing:"border-box"}} rows={2}/>
                    : <div style={{fontSize:13,color:C.ink,lineHeight:1.5}}>{r.txt}</div>
                  }
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  {editingReply===r.id
                    ? <button onClick={()=>{ const v=document.getElementById(`qr-${r.id}`).value; setQuickReplies(q=>q.map(x=>x.id===r.id?{...x,txt:v}:x)); setEditingReply(null); }} style={{fontSize:10,padding:"4px 9px",borderRadius:7,border:"none",background:C.sage,color:C.white,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>OK</button>
                    : <button onClick={()=>setEditingReply(r.id)} style={{fontSize:10,padding:"4px 9px",borderRadius:7,border:`1px solid ${C.border}`,background:C.cream2,color:C.muted,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                  }
                  <button onClick={()=>setQuickReplies(q=>q.filter(x=>x.id!==r.id))} style={{fontSize:10,padding:"4px 9px",borderRadius:7,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#DC2626",cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input value={newReply} onChange={e=>setNewReply(e.target.value)} placeholder="Nouvelle réponse rapide…" style={{flex:1,padding:"9px 12px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",outline:"none",background:C.white}}/>
              <button onClick={()=>{ if(newReply.trim()){setQuickReplies(q=>[...q,{id:Date.now(),txt:newReply.trim()}]);setNewReply("");} }} style={{padding:"9px 14px",borderRadius:10,border:"none",background:C.ink,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+</button>
            </div>
            <button onClick={()=>{ const suggestions=["Avec plaisir, à très vite ! ✦","N'hésite pas si tu as besoin d'autre chose.","Je suis là si tu veux approfondir le sujet !"]; setQuickReplies(q=>[...q,...suggestions.map((txt,i)=>({id:Date.now()+i,txt}))]); }} style={{width:"100%",marginTop:12,padding:"10px",borderRadius:10,border:`1px dashed ${C.gold}`,background:C.goldL,color:C.gold,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✦ Générer avec l'IA</button>
          </div>
        )}
        {/* ── Archivés ── */}
        {settingsTab==="archives" && (
          <div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Conversations masquées. Tu peux les restaurer à tout moment.</div>
            {archivedConvs.length===0
              ? <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}><div style={{display:"flex",justifyContent:"center",marginBottom:8}}><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><polyline points="21 8 21 21 3 21 3 8"/><rect x={1} y={3} width={22} height={5}/><line x1={10} y1={12} x2={14} y2={12}/></svg></div>Aucune conversation archivée</div>
              : archivedConvs.map(c=>(
                <div key={c.id||c.eid} style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:11}}>
                  {c.type==="expert"
                    ? <Av e={c.expert} size={40}/>
                    : <div style={{width:40,height:40,borderRadius:"50%",background:c.bg,color:c.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>{c.ini}</div>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{c.type==="expert"?c.expert.name:c.name}</div>
                    <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.lastMsg}</div>
                  </div>
                  <button onClick={()=>setArchivedIds(a=>a.filter(x=>x!==(c.id||c.eid)))} style={{padding:"6px 12px",borderRadius:9,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Restaurer</button>
                </div>
              ))
            }
          </div>
        )}
        {/* ── Nous contacter ── */}
        {settingsTab==="commentaire" && (
          <div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.5}}>Tu as une question, un problème ou une suggestion ? Écris-nous, on te répond rapidement.</div>
            {feedbackSent
              ? <div style={{textAlign:"center",padding:"36px 16px"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={1.5}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                  <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Message envoyé !</div>
                  <div style={{fontSize:12,color:C.muted}}>Notre équipe te répondra dans les 24h.</div>
                  <button onClick={()=>{setFeedbackSent(false);setFeedbackTxt("");}} style={{marginTop:18,padding:"10px 20px",borderRadius:10,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Envoyer un autre message</button>
                </div>
              : <>
                  <textarea value={feedbackTxt} onChange={e=>setFeedbackTxt(e.target.value)} placeholder="Dis-nous ce que tu penses ou ce qui ne va pas…" style={{width:"100%",padding:"11px 13px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",resize:"none",outline:"none",marginBottom:12,boxSizing:"border-box",minHeight:120}} rows={5}/>
                  <button onClick={()=>{if(feedbackTxt.trim())setFeedbackSent(true);}} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:feedbackTxt.trim()?C.ink:C.cream2,color:feedbackTxt.trim()?C.white:C.muted,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>Envoyer ✦</button>
                </>
            }
          </div>
        )}
      </div>
    </div>
  );

  if (showSavvyChat) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.cream,height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 18px 14px",borderBottom:`1px solid ${C.border}`,background:C.white}}>
        <button onClick={()=>setShowSavvyChat(false)} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.ink},#2C2825)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✦</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF}}>✦ Assistance Savvy</div>
          <div style={{fontSize:11,color:C.sage}}>● Réponse par email sous 24h</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>
        {savvyMsgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.from==="moi"?"flex-end":"flex-start"}}>
            {m.from==="savvy" && <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.ink},#2C2825)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,marginRight:8,flexShrink:0,alignSelf:"flex-end"}}>✦</div>}
            <div style={{maxWidth:"75%",padding:"10px 13px",borderRadius:m.from==="moi"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.from==="moi"?C.ink:C.white,color:m.from==="moi"?C.white:C.ink,fontSize:13,lineHeight:1.5,border:m.from==="moi"?"none":`1px solid ${C.border}`}}>
              {m.txt}
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 18px 28px",borderTop:`1px solid ${C.border}`,background:C.white,display:"flex",gap:10}}>
        <input value={savvyInput} onChange={e=>setSavvyInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&savvyInput.trim()){sendSupport();e.preventDefault();}}} placeholder="Écris ton message…" style={{flex:1,padding:"10px 13px",borderRadius:22,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.cream2}}/>
        <button onClick={sendSupport} style={{width:42,height:42,borderRadius:"50%",border:"none",background:C.ink,color:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
        </button>
      </div>
    </div>
  );

  return <div style={{flex:1,overflowY:"auto",paddingBottom:72,background:C.cream}}>
    {/* Header avec lupa + engrenage */}
    <div style={{padding:"18px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 2px",fontFamily:SERIF}}>Messages</h2>
        {(()=>{const n=[...expertConvsDisplay,...clientConvs].filter(c=>!archivedIds.includes(c.id||c.eid)&&(readMsgIds.includes((c.type==="client"?"cli-":"exp-")+(c.id||c.eid))?false:c.unread>0)).length; return <div style={{fontSize:12,color:n>0?C.gold:C.muted,fontWeight:n>0?600:400}}>{n>0?`${n} message${n>1?"s":""} non lu${n>1?"s":""}`:"Retrouvez tous vos échanges Savvy"}</div>; })()}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setShowSearch(v=>!v)} style={{width:36,height:36,borderRadius:10,background:showSearch?C.ink:C.cream2,border:`1px solid ${showSearch?C.ink:C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={showSearch?C.white:C.soft} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button onClick={()=>setShowSettings(true)} style={{width:36,height:36,borderRadius:10,background:C.cream2,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><circle cx={12} cy={12} r={3}/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </button>
      </div>
    </div>

    {/* Barre de recherche */}
    {showSearch && (
      <div style={{padding:"0 18px",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:"8px 12px"}}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
          <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher une conversation…" style={{flex:1,border:"none",outline:"none",fontSize:13,fontFamily:"inherit",background:"transparent",color:C.ink}}/>
          {searchQ && <button onClick={()=>setSearchQ("")} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,lineHeight:1}}>✕</button>}
        </div>
      </div>
    )}

    {/* Filter pills */}
    <div style={{display:"flex",gap:6,padding:"0 18px",marginBottom:14,overflowX:"auto"}}>
      {(appMode==="expert"
        ? [{id:"tous",l:"Tous"},{id:"nonlus",l:"Non lus"},{id:"clients",l:"Clients"}]
        : [{id:"tous",l:"Tous"},{id:"nonlus",l:"Non lus"},{id:"experts",l:"Experts"}]
      ).map(f=>(
        <button key={f.id} onClick={()=>setMsgFilter(f.id)} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${msgFilter===f.id?C.ink:C.border}`,background:msgFilter===f.id?C.ink:"transparent",color:msgFilter===f.id?C.white:C.muted,fontSize:12,fontWeight:msgFilter===f.id?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
          {f.l}
        </button>
      ))}
      {/* Supprimés chip — uniquement si au moins une conv supprimée */}
      <button onClick={()=>setMsgFilter(msgFilter==="supprimes"?"tous":"supprimes")} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${msgFilter==="supprimes"?"#DC2626":C.border}`,background:msgFilter==="supprimes"?"#DC2626":"transparent",color:msgFilter==="supprimes"?C.white:C.muted,fontSize:12,fontWeight:msgFilter==="supprimes"?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
        🗑 Supprimés
        {archivedIds.length>0 && (
          <span style={{background:msgFilter==="supprimes"?"rgba(255,255,255,.3)":"#DC2626",color:"white",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {archivedIds.length}
          </span>
        )}
      </button>
    </div>

    <div style={{padding:"0 18px"}}>
      {/* Savvy assistant row */}
      {(msgFilter==="tous"||msgFilter==="clients") && (
        <div onClick={()=>setShowSavvyChat(true)} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"14px 15px",marginBottom:10,cursor:"pointer",border:`1px solid ${C.border}`,boxShadow:`0 1px 4px rgba(110,139,61,.08)`}}>
          <div style={{position:"relative"}}>
            <div style={{width:48,height:48,borderRadius:14,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid rgba(74,96,41,.18)`,color:C.gold}}>✦</div>
            <div style={{position:"absolute",bottom:-1,right:-1,width:13,height:13,borderRadius:"50%",background:C.sage,border:`2px solid ${C.white}`}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Assistance Savvy</span>
              <span style={{fontSize:10,color:C.sage,fontWeight:600}}>● En ligne</span>
            </div>
            <div style={{fontSize:12,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Réponse moyenne : moins de 5 min</div>
          </div>
        </div>
      )}

      {(()=>{
        // Classe le time string en priorité pour tri + groupe
        const timeRank = t => t?.includes(":")?0:t==="Hier"?1:["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].includes(t)?2:3;
        const timeGroup = t => (!t||t==="À l'instant"||t?.includes(":"))?"Aujourd'hui":t==="Hier"?"Hier":["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].includes(t)?"Cette semaine":"Plus ancien";

        // Vue Supprimés
        if (msgFilter === "supprimes") {
          if (archivedConvs.length === 0) return (
            <div style={{textAlign:"center",padding:"48px 16px",color:C.muted,fontSize:13}}>
              <div style={{fontSize:32,marginBottom:12}}>🗑</div>
              Aucune conversation supprimée
            </div>
          );
          return (
            <div>
              <div style={{background:"#FEF2F2",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:"#DC2626"}}>💡 Ces conversations ont été supprimées. Tu peux les restaurer.</span>
              </div>
              {archivedConvs.map(c => (
                <div key={c.id||c.eid} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"13px 15px",marginBottom:10,border:`1px solid #FEE2E2`,opacity:.8}}>
                  <div style={{width:46,height:46,borderRadius:14,background:c.bg||C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,color:c.col||C.gold,flexShrink:0}}>{c.ini||c.expert?.initials}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:C.ink}}>{c.name||c.expert?.name}</div>
                    <div style={{fontSize:12,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.lastMsg||"Conversation supprimée"}</div>
                  </div>
                  <button onClick={()=>setArchivedIds(a=>a.filter(x=>x!==(c.id||c.eid)))} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
                    Restaurer
                  </button>
                </div>
              ))}
            </div>
          );
        }

        // Construire liste unifiée selon filtre + recherche
        const matchesSearch = c => !searchQ
          || (c.name||c.expert?.name||"").toLowerCase().includes(searchQ.toLowerCase())
          || (c.lastMsg||"").toLowerCase().includes(searchQ.toLowerCase());
        const unified = [];
        const isUnread = c => {
          const key = (c.type==="client"?"cli-":"exp-")+(c.id||c.eid);
          return c.unread > 0 && !readMsgIds.includes(key);
        };
        // En mode expert, ne montrer que les convs clients (pas les convs avec des experts)
        if(appMode!=="expert" && (msgFilter==="tous"||msgFilter==="experts"||msgFilter==="nonlus")) {
          expertConvs
            .filter(c=>!archivedIds.includes(c.id||c.eid)&&matchesSearch(c)&&(msgFilter!=="nonlus"||isUnread({...c,type:"expert"})))
            .forEach(c=>unified.push({...c,_type:"expert"}));
        }
        if(msgFilter==="tous"||msgFilter==="clients"||msgFilter==="nonlus") {
          visibleConvs
            .filter(c=>c.type==="client"&&matchesSearch(c)&&(msgFilter!=="nonlus"||isUnread(c)))
            .forEach(c=>unified.push({...c,_type:"client"}));
        }
        unified.sort((a,b)=>timeRank(a.time)-timeRank(b.time));

        // Grouper
        const ORDER = ["Aujourd'hui","Hier","Cette semaine","Plus ancien"];
        const groups = {};
        unified.forEach(c=>{ const g=timeGroup(c.time); if(!groups[g]) groups[g]=[]; groups[g].push(c); });

        return ORDER.filter(g=>groups[g]?.length).map(groupLabel=>(
          <div key={groupLabel}>
            {/* Séparateur */}
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"4px 0 10px"}}>
              <span style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.6,whiteSpace:"nowrap"}}>{groupLabel}</span>
              <div style={{flex:1,height:1,background:C.borderF}}/>
            </div>

            {groups[groupLabel].map(conv=>{
              if(conv._type==="expert"){
                const convKey="exp-"+conv.id;
                const isRead=readMsgIds.includes(convKey)||conv.unread===0;
                return (
                  <div key={conv.id} onClick={()=>{ markMsgRead(convKey); onConv(conv.expert); }} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"14px 15px",marginBottom:9,cursor:"pointer",border:`1px solid ${isRead?C.border:C.gold}`,boxShadow:`0 1px 6px ${C.sh}`,transition:"border-color .25s"}}>
                    <div style={{position:"relative"}}>
                      <Av e={conv.expert} size={46}/>
                      {!isRead&&<div style={{position:"absolute",top:-2,right:-2,width:17,height:17,borderRadius:"50%",background:C.gold,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{conv.unread}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{fontSize:14,fontWeight:isRead?600:700,color:C.ink,fontFamily:SERIF}}>{conv.expert.name}</span>
                        <span style={{fontSize:10,color:C.faint}}>{conv.time}</span>
                      </div>
                      <div style={{fontSize:10,color:isRead?C.faint:C.gold,fontWeight:600,marginBottom:conv.session?2:4}}>
                        {conv.expert?.role||"Conseiller Savvy"}
                        {conv.expert?.rating ? ` · ★${conv.expert.rating}` : ""}
                        {conv.expert?.reviews ? ` · ${conv.expert.reviews} avis` : ""}
                      </div>
                      {conv.session && <div style={{fontSize:10,color:isRead?C.faint:C.teal,fontWeight:600,marginBottom:2}}>{conv.session.format} · {conv.session.dur} · {conv.session.price} · {conv.session.date}</div>}
                      <div style={{fontSize:12,color:isRead?C.muted:C.ink,fontWeight:isRead?400:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.lastMsg}</div>
                    </div>
                    {!isRead&&<div style={{width:8,height:8,borderRadius:"50%",background:C.gold,flexShrink:0}}/>}
                  </div>
                );
              } else {
                const convKey="cli-"+conv.id;
                const isRead=readMsgIds.includes(convKey)||conv.unread===0;
                return (
                  <div key={conv.id} onClick={()=>{ markMsgRead(convKey); onConv&&onConv({name:conv.name,role:"Client",tagline:conv.lastMsg,color:conv.col,initials:conv.ini,avatar:conv.ini,bg:conv.bg,clientId:conv.clientId,photo_url:conv.photoUrl}); }} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"14px 15px",marginBottom:9,cursor:"pointer",border:`1px solid ${isRead?C.border:"#6EE7B7"}`,boxShadow:`0 1px 6px ${C.sh}`,transition:"border-color .25s"}}>
                    <div style={{position:"relative"}}>
                      <div style={{width:46,height:46,borderRadius:"50%",background:conv.bg,color:conv.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15}}>{conv.ini}</div>
                      {!isRead&&<div style={{position:"absolute",top:-2,right:-2,width:17,height:17,borderRadius:"50%",background:C.sage,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{conv.unread}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{fontSize:14,fontWeight:isRead?600:700,color:C.ink,fontFamily:SERIF}}>{conv.name}</span>
                        <span style={{fontSize:10,color:C.faint}}>{conv.time}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <span style={{fontSize:10,color:isRead?C.faint:C.sage,fontWeight:600}}>Client</span>
                        {conv.rating && <span style={{fontSize:10,color:C.gold,fontWeight:600}}>★ {conv.rating.toFixed(1)}</span>}
                        {conv.session && <span style={{fontSize:10,color:C.muted}}>{conv.session.format} · {conv.session.dur} · {conv.session.price}</span>}
                      </div>
                      {conv.session && <div style={{fontSize:10,color:isRead?C.faint:C.teal,fontWeight:600,marginBottom:2}}>🗓 {conv.session.date}</div>}
                      <div style={{fontSize:12,color:isRead?C.muted:C.ink,fontWeight:isRead?400:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.lastMsg}</div>
                    </div>
                    {!isRead&&<div style={{width:8,height:8,borderRadius:"50%",background:C.sage,flexShrink:0}}/>}
                    <button onClick={e=>{e.stopPropagation();setArchivedIds(a=>[...a,conv.id]);}} style={{flexShrink:0,width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:C.cream2,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="21 8 21 21 3 21 3 8"/><rect x={1} y={3} width={22} height={5}/><line x1={10} y1={12} x2={14} y2={12}/></svg>
                    </button>
                  </div>
                );
              }
            })}
          </div>
        ));
      })()}

      {allConvs.length===0 && (
        <div style={{textAlign:"center",padding:"48px 16px",color:C.muted,fontSize:13}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div style={{marginBottom:appMode==="client"?12:0}}>Aucune conversation pour le moment</div>
          {appMode==="client" && <button onClick={()=>onConv&&onConv("__search__")} style={{padding:"11px 22px",borderRadius:12,border:"none",background:C.sage,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Trouver quelqu'un à qui parler →</button>}
        </div>
      )}
    </div>
  </div>;
}

export default MessagesListScreen
