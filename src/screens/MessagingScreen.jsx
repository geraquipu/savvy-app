import React, { useState, useEffect, useRef, useCallback } from 'react'
import { C, SERIF } from '../constants/colors'
import { Av } from '../components/ui'
import { supabase } from '../supabase'

async function callClaude(messages, sys) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:220, system:sys+"\n\nRéponds en 1-3 phrases courtes et naturelles.", messages }),
    });
    return (await r.json()).content?.[0]?.text ?? "Je ne peux pas répondre maintenant.";
  } catch { return "Problème technique. Réessayez dans un instant."; }
}

async function getSugg(msg) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:80,
        system:"2 suggestions client courtes (max 5 mots, français). JSON uniquement: [\"s1\",\"s2\"]. Pas de markdown.",
        messages:[{role:"user",content:`"${msg}"`}] }),
    });
    return JSON.parse((await r.json()).content?.[0]?.text.replace(/```json|```/g,"").trim()||"[]");
  } catch { return null; }
}

function MessagingScreen({ e, onBack, authUser }) {
  const _msgKey = `savvy_chat_${e.initials||e.id||"guest"}`;
  const _defaultMsg = [{id:1,from:"expert",text:`Bonjour ! Je suis ${e.name.split(" ")[0]}. ${e.tagline||e.role||""}. Quelle est votre question ?`,time:"09:30"}];
  // Expert a un vrai UUID Supabase si son id est une string UUID
  const expertSbId = (typeof e.id === "string" && e.id.includes("-")) ? e.id : null;
  // user_id = auth UUID del experto (para mensajes/RLS); id = UUID de la tabla experts
  const expertAuthId = e.user_id || null;
  const isRealUser = authUser?.real && authUser?.id;

  const [msgs, setMsgs] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(_msgKey)||"null"); return saved?.length ? saved : _defaultMsg; } catch { return _defaultMsg; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugg, setSugg] = useState(null);
  const bottomRef = useRef(null);

  // Charger l'historique + Realtime
  useEffect(() => {
    if (!isRealUser || !expertSbId) return;

    const toMsg = m => ({
      id: m.id,
      from: m.sender_id === authUser.id ? "client" : "expert",
      text: m.content,
      time: new Date(m.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
      _fromSB: true,
    });

    supabase.from("messages")
      .select("*")
      .eq("expert_id", expertSbId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const sbMsgs = data.map(toMsg);
        setMsgs(prev => {
          const sbIds = new Set(sbMsgs.map(m=>m.id));
          const localOnly = prev.filter(m=>!m._fromSB && !sbIds.has(m.id));
          return [..._defaultMsg, ...sbMsgs, ...localOnly].slice(0,200);
        });
      });

    const channel = supabase
      .channel(`chat-${expertSbId}-${authUser.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `expert_id=eq.${expertSbId}`,
      }, ({ new: m }) => {
        if (m.sender_id === authUser.id) return; // ya lo agregamos optimistamente
        setMsgs(prev => {
          if (prev.some(x => x.id === m.id)) return prev;
          return [...prev, toMsg(m)].slice(0,200);
        });
        setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveMsgs = (m) => { try { localStorage.setItem(_msgKey, JSON.stringify(m)); } catch {} };

  const send = useCallback(async(text)=>{
    const t=(text??input).trim(); if(!t||loading)return;
    setInput(""); setSugg(null);
    const userMsg={id:Date.now(),from:"client",text:t,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};
    const updated=[...msgs,userMsg]; setMsgs(updated); saveMsgs(updated); setLoading(true);

    if (isRealUser && expertSbId) {
      // Experto real → guardar mensaje y esperar respuesta real (no Claude)
      const { error: msgErr } = await supabase.from("messages").insert({
        sender_id: authUser.id,
        receiver_id: expertAuthId || expertSbId,
        expert_id: expertSbId,
        content: t,
      });
      if (msgErr) console.error("Message insert error:", msgErr.message);
      setLoading(false);
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
      return;
    }

    // Experto demo → Claude responde
    const reply=await callClaude(updated.map(m=>({role:m.from==="client"?"user":"assistant",content:m.text})),e.sys);
    const final=[...updated,{id:Date.now()+1,from:"expert",text:reply,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}];
    setMsgs(final); saveMsgs(final); setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
    const s=await getSugg(reply); if(Array.isArray(s))setSugg(s.slice(0,2));
  },[msgs,input,loading,e,isRealUser,expertSbId,authUser]);
  return <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.cream}}>
    <div style={{background:C.white,padding:"12px 16px 13px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:11,flexShrink:0,boxShadow:`0 1px 8px ${C.sh}`}}>
      <button onClick={onBack} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:9,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div style={{position:"relative",flexShrink:0}}>
        <Av e={e} size={40}/>
        <div style={{position:"absolute",bottom:0,right:0,width:11,height:11,borderRadius:"50%",background:C.sageMid,border:`2px solid ${C.white}`}}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{e.name}</div>
        <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.role.split("·")[0].trim()}</div>
        {isRealUser && expertSbId ? (
          <div style={{fontSize:10,color:"#5B8A5B",fontWeight:600,display:"flex",alignItems:"center",gap:4,marginTop:1}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#5B8A5B"}}/>Expert disponible
          </div>
        ) : (
          <div style={{fontSize:10,color:C.sageMid,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginTop:1}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.sageMid}}/>IA Savvy active
          </div>
        )}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
        {!(isRealUser && expertSbId) && <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:C.goldL,color:C.gold,fontWeight:700,border:`1px solid ${C.goldB}`}}>✦ Claude</span>}
        <div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(s=><svg key={s} width={8} height={8} viewBox="0 0 12 12" fill="#B8864A"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:"16px 14px 6px",display:"flex",flexDirection:"column"}}>
      <div style={{textAlign:"center",marginBottom:14}}>
        <span style={{fontSize:11,color:C.muted,background:C.white,padding:"5px 14px",borderRadius:20,border:`1px solid ${C.border}`}}>✦ Alimenté par Claude AI · Savvy</span>
      </div>
      {msgs.map(m=><div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.from==="client"?"flex-end":"flex-start",marginBottom:10}}>
        {m.from==="expert"&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:e.bg,color:e.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,border:`1px solid ${C.border}`}}>{e.initials[0]}</div>
          <span style={{fontSize:10,color:C.muted}}>{e.name.split(" ")[0]}</span>
        </div>}
        <div style={{maxWidth:"82%",padding:"11px 15px",borderRadius:m.from==="client"?"18px 18px 5px 18px":"18px 18px 18px 5px",background:m.from==="client"?`linear-gradient(135deg,${C.ink},#2C2825)`:C.white,color:m.from==="client"?C.white:C.ink,fontSize:13,lineHeight:1.6,boxShadow:m.from==="expert"?`0 2px 10px ${C.sh}`:`0 1px 4px rgba(28,25,23,.12)`}}>{m.text}</div>
        <div style={{fontSize:10,color:C.faint,marginTop:3}}>{m.time}</div>
      </div>)}
      {loading&&<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
        <div style={{width:20,height:20,borderRadius:"50%",background:e.bg,color:e.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800}}>{e.initials[0]}</div>
        <div style={{background:C.white,borderRadius:"18px 18px 18px 4px",padding:"11px 15px",display:"flex",gap:5}}>
          {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.faint,animation:`bounce 1.2s ${i*.2}s infinite`}}/>)}
        </div>
      </div>}
      <div ref={bottomRef}/>
    </div>
    {sugg&&!loading&&<div style={{padding:"8px 14px 2px",display:"flex",gap:7,flexWrap:"wrap",flexShrink:0}}>
      <span style={{fontSize:10,color:C.faint,alignSelf:"center",flexShrink:0}}>Suggestions :</span>
      {sugg.map((s,i)=><button key={i} onClick={()=>send(s)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${C.goldB}`,background:C.goldL,color:C.gold,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700,boxShadow:`0 1px 4px ${C.sh}`}}>{s}</button>)}
    </div>}
    <div style={{padding:"10px 14px 22px",background:C.white,borderTop:`1px solid ${C.border}`,flexShrink:0}}>
      <div style={{display:"flex",gap:9,alignItems:"center"}}>
        <input value={input} onChange={ev=>setInput(ev.target.value)} onKeyDown={ev=>ev.key==="Enter"&&send()} placeholder="Votre question..." style={{flex:1,padding:"11px 15px",borderRadius:13,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",background:C.cream2}}/>
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{width:44,height:44,borderRadius:"50%",background:input.trim()&&!loading?C.ink:C.cream3,border:"none",cursor:input.trim()&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.5}><line x1={22} y1={2} x2={11} y2={13}/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
      {msgs.length > 1 && (
        <button onClick={()=>{ localStorage.removeItem(_msgKey); setMsgs(_defaultMsg); setSugg(null); }} style={{marginTop:8,width:"100%",padding:"6px",borderRadius:9,border:`1px solid ${C.border}`,background:"transparent",color:C.faint,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
          Effacer la conversation
        </button>
      )}
    </div>
  </div>;
}

export default MessagingScreen
