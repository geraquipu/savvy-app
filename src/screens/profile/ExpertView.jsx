import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { C, SERIF, SANS } from '../../constants/colors';
import { EXPERTS, getCountdown, updateBooking } from '../../constants/data';
import { SESSIONS_AVENIR, SESSIONS_PASSEES, SESSIONS_ANNULEES } from '../../constants/sessionData';
import { MENU_ICONS } from '../../constants/menuIcons.jsx';

const OFFER_EXAMPLES = [
  "Trouver des fournisseurs dans mon secteur",
  "Comprendre les formalités douanières",
  "Créer une micro-entreprise pas à pas",
  "Trouver un logement sans garant",
  "Préparer un entretien d'embauche",
  "Lancer une activité en ligne",
  "Obtenir un visa de travail",
  "Négocier son salaire",
];
const OFFER_FORMATS = [
  {v:"video", icon:"🎥", l:"Vidéo", sub:"Face à face en visio"},
  {v:"audio", icon:"📞", l:"Appel audio", sub:"Simple et rapide"},
  {v:"doc",   icon:"📄", l:"Document", sub:"Analyse écrite ou guide"},
  {v:"chat",  icon:"💬", l:"Chat écrit", sub:"Échange par messages"},
];
const OFFER_DUREES = ["15 min","30 min","45 min","1h","1h30","2h"];

function OfferEditForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial.name||"");
  const [what, setWhat] = useState(initial.what||initial.desc||"");
  const [price, setPrice] = useState(initial.price ? String(initial.price) : "");
  const [duree, setDuree] = useState(initial.duree||"30 min");
  const [formats, setFormats] = useState(initial.formats||["video"]);
  const [showExamples, setShowExamples] = useState(!initial.name);
  const toggleFmt = (v) => setFormats(f => f.includes(v) ? f.filter(x=>x!==v) : [...f,v]);
  return (
    <div>
      {/* Nom */}
      <div style={{marginBottom:10}}>
        <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>Titre de l'offre</label>
        <input
          value={name}
          onChange={e=>{setName(e.target.value);setShowExamples(false);}}
          onFocus={()=>{if(!name)setShowExamples(true);}}
          placeholder="Ex : Trouver des fournisseurs en Europe"
          style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${name?C.sage:C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.white,transition:"border-color .2s"}}
        />
        {showExamples && !name && (
          <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:4}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:2}}>Idées d'offres :</div>
            {OFFER_EXAMPLES.slice(0,4).map(ex=>(
              <div key={ex} onClick={()=>{setName(ex);setShowExamples(false);}}
                style={{padding:"7px 11px",borderRadius:8,background:C.cream3,fontSize:12,color:C.ink,cursor:"pointer",border:`1px solid ${C.border}`}}>
                {ex}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{marginBottom:10}}>
        <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>Description <span style={{fontWeight:400,textTransform:"none"}}>(ce que le client obtient)</span></label>
        <textarea
          value={what}
          onChange={e=>setWhat(e.target.value)}
          placeholder="Ex : Un plan d'action concret pour réussir ton examen dès le premier passage"
          rows={2}
          style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.white,resize:"none",lineHeight:1.5}}
        />
      </div>

      {/* Prix + Durée */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <div style={{flex:1}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>Prix (€)</label>
          <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Ex : 25" type="number" min="1"
            style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1.5px solid ${price?C.sage:C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.white}}/>
        </div>
        <div style={{flex:1.5}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.4}}>Durée</label>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {OFFER_DUREES.map(d=>(
              <button key={d} onClick={()=>setDuree(d)}
                style={{padding:"6px 10px",borderRadius:20,border:`1.5px solid ${duree===d?C.sage:C.border}`,background:duree===d?C.sageL||"#f0f4ef":C.white,color:duree===d?C.sage:C.muted,fontSize:11,fontWeight:duree===d?700:400,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Format */}
      <div style={{marginBottom:12}}>
        <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:7,textTransform:"uppercase",letterSpacing:.4}}>Format de la session</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {OFFER_FORMATS.map(fmt=>{
            const checked = formats.includes(fmt.v);
            return (
              <div key={fmt.v} onClick={()=>toggleFmt(fmt.v)}
                style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:10,border:`1.5px solid ${checked?C.gold:C.border}`,background:checked?C.goldL:C.white,cursor:"pointer",transition:"all .15s"}}>
                <span style={{display:"flex",flexShrink:0,color:"currentColor"}}>{MENU_ICONS[fmt.icon]||fmt.icon}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:checked?700:500,color:checked?C.gold:C.ink}}>{fmt.l}</div>
                  <div style={{fontSize:10,color:C.muted}}>{fmt.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
        {formats.length===0&&<div style={{fontSize:11,color:"#dc2626",marginTop:5}}>Sélectionne au moins un format</div>}
      </div>

      {/* Aperçu prix */}
      {price && (
        <div style={{background:C.cream3,borderRadius:9,padding:"8px 12px",marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:C.muted}}>Tu gardes</span>
          <span style={{fontSize:14,fontWeight:700,color:C.sage||C.ink}}>{Math.round(Number(price)*0.8)}€ <span style={{fontSize:10,fontWeight:400,color:C.muted}}>/ session (80%)</span></span>
        </div>
      )}

      <div style={{display:"flex",gap:8}}>
        <button onClick={onCancel} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
        <button onClick={()=>{
          if(!name.trim()||!price){alert("Remplis le titre et le prix.");return;}
          if(formats.length===0){alert("Sélectionne au moins un format.");return;}
          onSave({name:name.trim(),what:what.trim(),desc:what.trim(),price:Number(price),duree,formats});
        }} style={{flex:2,padding:"10px",borderRadius:10,border:"none",background:C.ink,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>Enregistrer ✓</button>
      </div>
    </div>
  );
}

const generateFacturesPDF = (userName, isExpert) => {
  const openPDF = (title, bodyHTML) => {
    const html = '<html><head><meta charset="UTF-8"><title>' + title + '</title>'
      + '<style>body{font-family:-apple-system,sans-serif;padding:40px;max-width:700px;margin:0 auto;color:#1C1917}'
      + '.logo{font-size:26px;font-weight:700;font-family:Georgia,serif;margin-bottom:24px}'
      + 'table{width:100%;border-collapse:collapse;margin:20px 0}'
      + 'th{background:#1C1917;color:#fff;padding:9px 12px;text-align:left;font-size:12px}'
      + 'td{padding:9px 12px;border-bottom:1px solid #eee;font-size:13px}'
      + 'h2{font-family:Georgia,serif;margin:24px 0 8px}'
      + 'p{font-size:13px;line-height:1.8;color:#44403C}'
      + '.footer{margin-top:40px;font-size:11px;color:#999;text-align:center;border-top:1px solid #eee;padding-top:16px}'
      + '@media print{.noprint{display:none}}</style></head><body>'
      + '<div class="logo">sav<em style="color:#B8864A;font-style:italic">vy</em></div>'
      + bodyHTML
      + '<div class="footer">Savvy SAS &middot; Paris, France &middot; contact@savvy.fr &middot; &copy; 2025</div>'
      + '<div class="noprint" style="margin-top:24px;text-align:center">'
      + '<button onclick="window.print()" style="background:#1C1917;color:#fff;border:none;padding:11px 24px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer">'
      + 'Enregistrer en PDF</button></div>'
      + '</body></html>';
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
  };
  const date = new Date().toLocaleDateString('fr-FR');
  const rows = isExpert
    ? '<tr><td>15 mai 2025</td><td>Sophie Martin</td><td>M&eacute;thode inventaire 1h</td><td>60&euro;</td><td>12&euro;</td><td style="color:#065F46;font-weight:700">48&euro;</td></tr>'
    + '<tr><td>8 mai 2025</td><td>Antoine Dupont</td><td>Tableau Excel KPIs</td><td>40&euro;</td><td>8&euro;</td><td style="color:#065F46;font-weight:700">32&euro;</td></tr>'
    : '<tr><td>Demain</td><td>German Quintana</td><td>M&eacute;thode inventaire 1h</td><td style="font-weight:700">60&euro;</td></tr>'
    + '<tr><td>15 mai 2025</td><td>Marie Aubert</td><td>Question p&acirc;tisserie</td><td style="font-weight:700">20&euro;</td></tr>'
    + '<tr><td>8 mai 2025</td><td>Lucas Bertrand</td><td>Export Colombie</td><td style="font-weight:700">50&euro;</td></tr>';
  const headers = isExpert
    ? '<th>Date</th><th>Client</th><th>Session</th><th>Montant</th><th>Commission 20%</th><th>Re&ccedil;u 80%</th>'
    : '<th>Date</th><th>Conseiller</th><th>Session</th><th>Montant</th>';
  const body = '<h2>' + (isExpert ? 'Mes revenus — ' : 'Mes paiements — ') + userName + '</h2>'
    + '<p style="font-size:12px;color:#78716C">G&eacute;n&eacute;r&eacute; le ' + date + '</p>'
    + '<table><thead><tr>' + headers + '</tr></thead><tbody>' + rows + '</tbody></table>'
    + '<p style="font-size:12px;color:#78716C">'
    + (isExpert ? '&bull; Ces revenus sont imposables en France. Conservez ce document pour votre d&eacute;claration.'
                : '&bull; Ces d&eacute;penses peuvent &ecirc;tre d&eacute;ductibles si usage professionnel.')
    + '</p>';
  openPDF((isExpert ? 'Revenus' : 'Factures') + ' Savvy — ' + userName, body);
};

function downloadICS({ expertName, topic, date, slot, durationH=1 }) {
  // date can be a Date object or a label string — we build a best-effort date
  let start;
  if (date instanceof Date) {
    const [h, m] = (slot||"09:00").split(":").map(Number);
    start = new Date(date); start.setHours(h, m, 0, 0);
  } else {
    const now = new Date();
    if ((date||"").toLowerCase().includes("demain")) now.setDate(now.getDate()+1);
    const [h, m] = (slot||"09:00").split(":").map(Number);
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  }
  const end = new Date(start.getTime() + durationH * 60 * 60 * 1000);
  const fmt = d => d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z/,"Z");
  const uid = `savvy-${Date.now()}@savvy.fr`;
  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Savvy//FR","CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Session Savvy · ${expertName}`,
    `DESCRIPTION:${topic||"Session de conseil Savvy"}`,
    "BEGIN:VALARM","TRIGGER:-PT60M","ACTION:DISPLAY","DESCRIPTION:Rappel 1h avant ta session Savvy","END:VALARM",
    "BEGIN:VALARM","TRIGGER:-PT15M","ACTION:DISPLAY","DESCRIPTION:Ta session Savvy commence dans 15 min","END:VALARM",
    "END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([ics], {type:"text/calendar;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=`session-savvy.ics`; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

// ── Inbox messages pour l'expert ────────────────────────────────────────────
function ExpertInbox({ authUser, onBack }) {
  const [threads, setThreads] = React.useState([]);
  const [activeThread, setActiveThread] = React.useState(null);
  const [replyText, setReplyText] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [msgs, setMsgs] = React.useState([]);
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    if (!authUser?.id || !authUser?.expertId) return;
    supabase.from("messages")
      .select("*")
      .eq("expert_id", authUser.expertId)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        if (!data) return;
        // Group by client — the client is whoever is NOT the expert on each message
        const byClient = {};
        data.forEach(m => {
          const clientId = m.sender_id !== authUser.id ? m.sender_id : m.receiver_id;
          if (!clientId || clientId === authUser.id) return;
          if (!byClient[clientId]) byClient[clientId] = { clientId, messages: [] };
          byClient[clientId].messages.push(m);
        });
        // Fetch real client names
        const ids = Object.keys(byClient);
        const nameMap = {};
        if (ids.length > 0) {
          const { data: profs } = await supabase.from("profiles").select("id, name").in("id", ids);
          (profs||[]).forEach(p => { nameMap[p.id] = p.name; });
        }
        setThreads(Object.values(byClient).map(t => ({
          ...t,
          name: nameMap[t.clientId] || "Client Savvy",
          latest: t.messages[0],
          unread: t.messages.filter(m => m.sender_id !== authUser.id && !m.read_at).length,
        })));
      });
  }, [authUser?.id, authUser?.expertId]);

  const openThread = (thread) => {
    setActiveThread(thread);
    const sorted = [...thread.messages].sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    setMsgs(sorted);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),100);
    // Marquer les messages du client comme lus (read_at)
    supabase.from("messages").update({ read_at: new Date().toISOString() })
      .eq("expert_id", authUser.expertId).eq("sender_id", thread.clientId).is("read_at", null)
      .then(({ error }) => { if (error) console.warn("mark read inbox:", error.message); });
    setThreads(prev => prev.map(t => t.clientId===thread.clientId ? { ...t, unread: 0 } : t));

    // Subscribe to new messages in real time
    const ch = supabase.channel(`expert-inbox-${thread.clientId}`)
      .on("postgres_changes", { event:"INSERT", schema:"public", table:"messages",
        filter:`expert_id=eq.${authUser.expertId}` }, ({ new: m }) => {
        const cid = m.sender_id === authUser.id ? m.receiver_id : m.sender_id;
        if (cid !== thread.clientId) return;
        setMsgs(prev => prev.some(x=>x.id===m.id) ? prev : [...prev,m]);
        setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
      }).subscribe();
    return () => supabase.removeChannel(ch);
  };

  const sendReply = async () => {
    if (!replyText.trim() || sending || !activeThread) return;
    setSending(true);
    const { data, error } = await supabase.from("messages").insert({
      sender_id: authUser.id,
      receiver_id: activeThread.clientId,
      expert_id: authUser.expertId,
      content: replyText.trim(),
    }).select().single();
    if (error) console.warn("sendReply error:", error.message);
    if (!error && data) {
      setMsgs(prev => [...prev, data]);
      setReplyText("");
      setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
    }
    setSending(false);
  };

  if (activeThread) {
    const clientDisplayName = activeThread.name || "Client Savvy";
    const initials = clientDisplayName.split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2) || "CS";
    return (
      <div style={{display:"flex",flexDirection:"column",height:"100vh",background:C.cream}}>
        <div style={{background:C.white,padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:11,flexShrink:0}}>
          <button onClick={()=>setActiveThread(null)} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:9,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div style={{width:40,height:40,borderRadius:"50%",background:"#EDE9FE",color:"#7C3AED",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>{initials}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{clientDisplayName}</div>
            <div style={{fontSize:11,color:C.muted}}>Conversation privée</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 14px"}}>
          {msgs.map(m => {
            const isMe = m.sender_id === authUser.id;
            return (
              <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",marginBottom:10}}>
                <div style={{maxWidth:"82%",padding:"11px 15px",borderRadius:isMe?"18px 18px 5px 18px":"18px 18px 18px 5px",background:isMe?`linear-gradient(135deg,${C.ink},#2C2825)`:C.white,color:isMe?C.white:C.ink,fontSize:13,lineHeight:1.6,boxShadow:!isMe?`0 2px 10px ${C.sh}`:`0 1px 4px rgba(28,25,23,.12)`}}>
                  {m.content}
                </div>
                <div style={{fontSize:10,color:C.faint,marginTop:3}}>{new Date(m.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>
        <div style={{padding:"10px 14px 22px",background:C.white,borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",gap:9,alignItems:"center"}}>
            <input value={replyText} onChange={e=>setReplyText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendReply()} placeholder="Votre réponse..." style={{flex:1,padding:"11px 15px",borderRadius:13,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",background:C.cream2}}/>
            <button onClick={sendReply} disabled={!replyText.trim()||sending} style={{width:44,height:44,borderRadius:"50%",background:replyText.trim()&&!sending?C.ink:C.cream3,border:"none",cursor:replyText.trim()&&!sending?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.5}><line x1={22} y1={2} x2={11} y2={13}/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:C.cream,minHeight:"100vh"}}>
      <div style={{background:C.white,padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:11}}>
        <button onClick={onBack} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:9,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Messages clients</div>
          <div style={{fontSize:11,color:C.muted}}>{threads.length} conversation{threads.length!==1?"s":""}</div>
        </div>
      </div>
      <div style={{padding:"12px 14px"}}>
        {threads.length === 0 ? (
          <div style={{textAlign:"center",padding:"60px 20px",color:C.muted}}>
            <div style={{fontSize:48,marginBottom:12}}>💬</div>
            <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Aucun message</div>
            <div style={{fontSize:13,color:C.muted}}>Les messages de tes clients apparaîtront ici.</div>
          </div>
        ) : threads.map(t => {
          const tName = t.name || "Client Savvy";
          const initials = tName.split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2) || "CS";
          return (
            <div key={t.clientId} onClick={()=>openThread(t)} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",marginBottom:10,display:"flex",alignItems:"center",gap:12,cursor:"pointer",boxShadow:`0 1px 4px ${C.sh}`}}>
              <div style={{position:"relative",flexShrink:0}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"#EDE9FE",color:"#7C3AED",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14}}>{initials}</div>
                {t.unread>0&&<div style={{position:"absolute",top:-2,right:-2,width:16,height:16,borderRadius:"50%",background:C.ink,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,border:`2px solid ${C.white}`}}>{t.unread}</div>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:t.unread>0?700:500,color:C.ink,marginBottom:2}}>{tName}</div>
                <div style={{fontSize:12,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.latest?.content||""}</div>
              </div>
              <div style={{fontSize:10,color:C.faint,flexShrink:0}}>{t.latest?new Date(t.latest.created_at).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}):""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ExpertView({
  USER, EXPERT_DATA, isExpert, authUser, newExpertProfile, isNewExpert, sbExpertData,
  onNavigate, onSignup, onBecomeExpert, onLogout,
  photoUrl, photoInputRef,
  setCancelModal, setClientProfileModal,
  openSection, setOpenSection,
  helpMsgSent, setHelpMsgSent, helpMsgText, setHelpMsgText,
  convoOpen, setConvoOpen,
  expSection, setExpSection,
  expSubSection, setExpSubSection,
  expSessionFilter, setExpSessionFilter,
  expRevFilter, setExpRevFilter,
  expNotifToggles, setExpNotifToggles,
  expShowShareModal, setExpShowShareModal,
  expRequests, setExpRequests,
  expConfirmed, setExpConfirmed,
  expCancelled, setExpCancelled,
  expSessionTab, setExpSessionTab,
  expOffres, setExpOffres, saveOffres,
  offresOpen, setOffresOpen,
  editingOffer, setEditingOffer,
  editOfferData, setEditOfferData,
  dispoMonth, setDispoMonth,
  dispoSelected, setDispoSelected,
  dispoHours, setDispoHours,
  dispoKey, dispoSaved, setDispoSaved,
  resolvedExpertId,
  showRevenu, setShowRevenu,
  showCardModal, setShowCardModal,
  showEditExpert, setShowEditExpert,
  showExpertProfile, setShowExpertProfile,
  sessionConfirmToast, setSessionConfirmToast,
  profileEdits, saveProfileEdit,
  editingParam, setEditingParam,
  editParamVal, setEditParamVal,
  setShowPwdModal, setShowDeleteModal,
  onRequestsChange,
  realPaidBookings = [],
}) {
    const section = expSection; const setSection = setExpSection;
    const subSection = expSubSection; const setSubSection = setExpSubSection;
    const [joinNotice, setJoinNotice] = React.useState(null);
    // Rejoindre : ouvre la salle si on est dans la fenêtre (15 min avant → 75 min après),
    // sinon affiche un message amical avec l'heure exacte.
    const handleJoin = (s) => {
      const now = Date.now();
      if (!s?.startTs) {
        const roomId = s?.id ? String(s.id).replace(/-/g,"").slice(0,16) : "savvy";
        window.open(`https://meet.jit.si/savvy-${roomId}`, "_blank");
        return;
      }
      const openAt = s.startTs - 15*60000, closeAt = s.startTs + 75*60000;
      if (now >= openAt && now <= closeAt) {
        const roomId = String(s.id).replace(/-/g,"").slice(0,16) || "savvy";
        window.open(`https://meet.jit.si/savvy-${roomId}`, "_blank");
        return;
      }
      const hhmm = new Date(s.startTs).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
      const dayStr = new Date(s.startTs).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
      if (now < openAt) {
        const mins = Math.round((openAt - now)/60000);
        const wait = mins < 60 ? `dans ${mins} min` : mins < 1440 ? `dans ${Math.round(mins/60)} h` : `le ${dayStr}`;
        setJoinNotice({ type:"early", text:`La salle s'ouvre 15 min avant, à ${new Date(openAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}. Reviens ${wait} — ta session avec ${s.client||"ton client"} est à ${hhmm}. ☕` });
      } else {
        setJoinNotice({ type:"late", text:`Cette session (${hhmm}) est terminée. Retrouve-la dans tes sessions passées.` });
      }
      setTimeout(()=>setJoinNotice(null), 6000);
    };
    const sessionFilter = expSessionFilter; const setSessionFilter = setExpSessionFilter;
    const revFilter = expRevFilter; const setRevFilter = setExpRevFilter;

    // Ingresos reales calculados desde reservas pagadas
    const getStart = (filter) => {
      const now = new Date();
      if (filter === "hoy") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (filter === "semana") return new Date(now.getTime() - 7*24*3600000);
      return new Date(now.getFullYear(), now.getMonth(), 1);
    };
    const realRevenuTotal = authUser?.real ? realPaidBookings.reduce((s,b)=>s+(b.phase_price||0)*0.8,0) : EXPERT_DATA.impact.revenu;
    const realRevenu = authUser?.real
      ? realPaidBookings.filter(b=>new Date(b.date_session)>=getStart(revFilter)).reduce((s,b)=>s+(b.phase_price||0)*0.8,0)
      : EXPERT_DATA.impact.revenu;
    const calcRevenu = (filter) => authUser?.real
      ? realPaidBookings.filter(b=>new Date(b.date_session)>=getStart(filter)).reduce((s,b)=>s+(b.phase_price||0)*0.8,0)
      : EXPERT_DATA.impact.revenu;
    const realClientsCount = authUser?.real ? new Set(realPaidBookings.map(b=>b.client_id)).size : EXPERT_DATA.impact.clients;
    const realSessionsCount = authUser?.real ? realPaidBookings.length : EXPERT_DATA.impact.sessions;
    const toggleExpN = k => setExpNotifToggles(s=>({...s,[k]:!s[k]}));
    const showShareModal = expShowShareModal; const setShowShareModal = setExpShowShareModal;
    const setCancelModalExp = (v) => setCancelModal(v ? {...v, type:"exp"} : null);
    const expertProfileUrl = resolvedExpertId
      ? "https://getsavvy.fr/p/"+resolvedExpertId
      : "https://getsavvy.fr";

    const ToggleExp = ({ on, onToggle }) => (
      <div onClick={e=>{e.stopPropagation();onToggle();}} style={{width:44,height:26,borderRadius:13,background:on?"#10B981":"#D1D5DB",position:"relative",cursor:"pointer",transition:"background .25s",flexShrink:0}}>
        <div style={{position:"absolute",top:3,left:on?21:3,width:20,height:20,borderRadius:"50%",background:"white",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
      </div>
    );

    const BackHeaderExp = ({ title, sub, onBack }) => (
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0 14px",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
        <button onClick={onBack||(()=>{setSection("dashboard");setSubSection(null);})} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{title}</div>
          {sub && <div style={{fontSize:11,color:C.muted,marginTop:1}}>{sub}</div>}
        </div>
      </div>
    );

    const MenuRowExp = ({icon, bg, title, sub, badge, onClick}) => (
      <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 20px",background:C.white,cursor:"pointer",borderBottom:`1px solid ${C.borderF}`}}>
        <div style={{color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",width:20,flexShrink:0}}>{MENU_ICONS[icon]||<span style={{fontSize:14}}>{icon}</span>}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:400,color:C.ink,letterSpacing:"-.1px"}}>{title}</div>
          {sub && <div style={{fontSize:11,color:C.faint,marginTop:1}}>{sub}</div>}
        </div>
        {badge && <div style={{background:C.sage,color:C.white,borderRadius:20,minWidth:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,padding:"0 5px"}}>{badge}</div>}
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    );

    if (!isExpert) return (
      <div style={{ padding:"24px 18px" }}>
        <div style={{ background:`linear-gradient(135deg,${C.ink},#2C2825)`, borderRadius:18, padding:"28px 22px", position:"relative", overflow:"hidden", textAlign:"center" }}>
          <div style={{ position:"absolute", top:-30, right:-30, width:130, height:130, borderRadius:"50%", background:"rgba(185,134,74,.08)" }}/>
          <div style={{ position:"relative" }}>
            <div style={{ fontSize:36, marginBottom:14 }}>✦</div>
            <div style={{ fontSize:20, fontWeight:700, color:C.white, fontFamily:SERIF, marginBottom:8 }}>Tu n'es pas encore conseiller</div>
            <div style={{ fontSize:13, color:"rgba(253,252,248,.65)", lineHeight:1.7, marginBottom:20 }}>
              Crée ton profil en 5 minutes et commence à partager ton expérience réelle.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, marginBottom:22 }}>
              {[{icon:"💰",v:"80%",l:"pour toi"},{icon:"⏰",v:"Libre",l:"tes horaires"},{icon:"✅",v:"Gratuit",l:"inscription"}].map(s => (
                <div key={s.l} style={{ background:"rgba(255,255,255,.07)", borderRadius:12, padding:"11px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.white, fontFamily:SERIF }}>{s.v}</div>
                  <div style={{ fontSize:10, color:"rgba(253,252,248,.5)", marginTop:1 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { onBecomeExpert && onBecomeExpert(); onSignup && onSignup(); }}
              style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:`linear-gradient(135deg,${C.gold},${C.goldB})`, color:C.white, fontFamily:SERIF }}>
              Créer mon profil conseiller →
            </button>
          </div>
        </div>
      </div>
    );

    // ── Messages (boîte de réception expert) ────────────────────────────────
    if (section === "messages") {
      return <ExpertInbox authUser={authUser} onBack={()=>{setSection(null);setSubSection(null);}} />;
    }

    // ── Sesiones (shortcut direct)
    if (section === "sesiones") {
      // Use lifted state from ProfileScreen
      const EXP_REQUESTS = expRequests;
      const EXP_SESSIONS = expConfirmed;
      const FILTERS_EXP = [
        {id:"jour",   l:"Auj.",    max:24},
        {id:"semaine",l:"Semaine", max:168},
        {id:"2sem",   l:"2 sem.",  max:336},
        {id:"mois",   l:"Mois",    max:99999},
      ];
      const visible = EXP_SESSIONS.filter(s => s.hoursUntil <= (FILTERS_EXP.find(f=>f.id===sessionFilter)||FILTERS_EXP[3]).max);
      return (
        <div>
          <BackHeaderExp title="Mes sessions" sub="Tes rendez-vous à venir" onBack={()=>setSection(null)}/>

          {/* Toast confirm/refuse */}
          {sessionConfirmToast && (
            <div style={{background:sessionConfirmToast.type==="confirmed"?C.sage:"#B91C1C",color:C.white,borderRadius:14,padding:"11px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,boxShadow:`0 4px 16px rgba(0,0,0,.12)`}}>
              <span style={{fontSize:18}}>{sessionConfirmToast.type==="confirmed"?"✅":"✕"}</span>
              <div>
                <div style={{fontSize:13,fontWeight:700}}>{sessionConfirmToast.type==="confirmed"?"Session confirmée !":"Demande refusée"}</div>
                <div style={{fontSize:11,opacity:.85}}>{sessionConfirmToast.name} {sessionConfirmToast.type==="confirmed"?"a été notifié(e)":"ne recevra pas de confirmation"}</div>
              </div>
            </div>
          )}

          {/* ── Onglets Reçues / Confirmées / Annulées ── */}
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {[{id:"recues",l:"Reçues",count:EXP_REQUESTS.length},{id:"confirmees",l:"Confirmées",count:EXP_SESSIONS.length},{id:"annulees",l:"Annulées",count:expCancelled.length}].map(t=>(
              <button key={t.id} onClick={()=>setExpSessionTab(t.id)} style={{flex:1,padding:"7px 4px",borderRadius:20,border:`1.5px solid ${expSessionTab===t.id?C.ink:C.border}`,background:expSessionTab===t.id?C.ink:"transparent",color:expSessionTab===t.id?C.white:C.muted,fontSize:10,fontWeight:expSessionTab===t.id?700:400,cursor:"pointer",fontFamily:"inherit",position:"relative"}}>
                {t.l}
                {t.count>0&&<span style={{marginLeft:4,background:expSessionTab===t.id?"rgba(255,255,255,.25)":C.sage,color:C.white,borderRadius:20,padding:"0 4px",fontSize:9}}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* ── Contenu par onglet ── */}
          {expSessionTab==="recues" && EXP_REQUESTS.length===0 && (
            <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={1.5}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
              Toutes les demandes ont été traitées !
            </div>
          )}

          {expSessionTab==="annulees" && (
            <div>
              {expCancelled.length===0
                ? <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}><div style={{display:"flex",justifyContent:"center",marginBottom:10}}><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>Aucune annulation</div>
                : expCancelled.map(s=>(
                  <div key={s.id} style={{background:C.white,borderRadius:14,border:"1px solid #FEE2E2",padding:"13px 14px",marginBottom:10,opacity:.8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {s.photoUrl
                        ? <img src={s.photoUrl} alt="" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                        : <div style={{width:40,height:40,borderRadius:"50%",background:s.bg,color:s.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{s.ini}</div>}
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{s.client}</div>
                        <div style={{fontSize:11,color:C.muted}}>{s.date} · {s.heure} · {s.duree}</div>
                      </div>
                      <div style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,background:"#FEE2E2",color:"#B91C1C",display:"flex",alignItems:"center",gap:4}}><svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>{s.motif||"Annulée"}</div>
                    </div>
                    <div style={{marginTop:8,fontSize:11,color:"#B91C1C",background:"#FFF5F5",borderRadius:8,padding:"7px 10px",display:"flex",gap:6,alignItems:"center"}}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{flexShrink:0}}><rect x={1} y={4} width={22} height={16} rx={2}/><line x1={1} y1={10} x2={23} y2={10}/></svg>
                      Remboursement automatique traité sous 3–5 jours ouvrés.
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {expSessionTab==="recues" && EXP_REQUESTS.length>0 && (
            <div style={{marginBottom:18}}>
              {/* Bandeau d'urgence */}
              <div style={{background:`linear-gradient(135deg,#FFFBEB,#FEF3C7)`,border:"1px solid #FDE68A",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
                <div style={{flexShrink:0,color:"#92400E"}}><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg></div>
                <div>
                  <div style={{fontSize:12,fontWeight:800,color:"#92400E"}}>{EXP_REQUESTS.length} nouvelle{EXP_REQUESTS.length>1?"s":""} demande{EXP_REQUESTS.length>1?"s":""}</div>
                  <div style={{fontSize:11,color:"#B45309",lineHeight:1.4}}>Réponds sous 24h — les clients apprécient les réponses rapides.</div>
                </div>
              </div>
              {EXP_REQUESTS.map(r=>{
                const gain = Math.round((r.prix||0)*0.8);
                const commission = (r.prix||0) - gain;
                return (
                <div key={r.id} style={{background:C.white,borderRadius:16,border:"1.5px solid #FDE68A",padding:"15px 16px",marginBottom:12,boxShadow:"0 2px 10px rgba(245,158,11,.10)"}}>
                  {/* En-tête : client protagoniste */}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:13}}>
                    {r.photoUrl
                      ? <img src={r.photoUrl} alt="" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                      : <div style={{width:48,height:48,borderRadius:"50%",background:r.bg,color:r.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,flexShrink:0}}>{r.ini}</div>}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,lineHeight:1.2}}>{r.client}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3,fontSize:11,color:C.muted}}>
                        {r.pays&&<span style={{display:"flex",alignItems:"center",gap:3}}><svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx={12} cy={10} r={3}/></svg>{r.pays}</span>}
                        {r.langue&&<span>· {r.langue}</span>}
                      </div>
                    </div>
                    <div style={{padding:"4px 11px",borderRadius:20,fontSize:10,fontWeight:700,background:"#FEF3C7",color:"#92400E",flexShrink:0}}>En attente</div>
                  </div>

                  {r.createdAt && (()=>{
                    const diff = Date.now() - new Date(r.createdAt).getTime();
                    const min = Math.max(0, Math.round(diff/60000));
                    const txt = min < 1 ? "à l'instant" : min < 60 ? `il y a ${min} min` : min < 1440 ? `il y a ${Math.round(min/60)} h` : `il y a ${Math.round(min/1440)} j`;
                    return <div style={{fontSize:10,color:C.faint,marginBottom:11}}>Réservation reçue {txt}</div>;
                  })()}

                  {/* Sujet (une seule fois) */}
                  <div style={{marginBottom:11}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:4,display:"flex",alignItems:"center",gap:5}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><circle cx={12} cy={12} r={6}/><circle cx={12} cy={12} r={2}/></svg>Demande</div>
                    <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,lineHeight:1.35}}>{r.domaine}</div>
                  </div>

                  {/* Message du client — protagoniste */}
                  {r.why && (
                    <div style={{background:C.cream2,borderRadius:11,padding:"12px 14px",marginBottom:12,borderLeft:`3px solid ${C.goldB}`}}>
                      <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:5,display:"flex",alignItems:"center",gap:5}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message du client</div>
                      <div style={{fontSize:13,color:C.ink,lineHeight:1.55}}>{r.why}</div>
                    </div>
                  )}

                  {/* Résumé */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:"7px 14px",padding:"11px 0",borderTop:`1px solid ${C.borderF}`,borderBottom:`1px solid ${C.borderF}`,marginBottom:12}}>
                    <span style={{fontSize:11,color:C.soft,display:"flex",alignItems:"center",gap:5}}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>{r.date}</span>
                    <span style={{fontSize:11,color:C.soft,display:"flex",alignItems:"center",gap:5}}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>{r.heure}</span>
                    <span style={{fontSize:11,color:C.soft,display:"flex",alignItems:"center",gap:5}}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 14 14"/></svg>{r.duree}</span>
                    <span style={{fontSize:11,color:C.soft,display:"flex",alignItems:"center",gap:5}}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x={1} y={5} width={15} height={14} rx={2}/></svg>{r.format}</span>
                  </div>

                  {/* Ce que tu reçois — mis en avant */}
                  <div style={{background:C.sageL||"#F0F5EF",borderRadius:11,padding:"11px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:11,color:C.sage,fontWeight:600}}>Tu reçois</div>
                      <div style={{fontSize:20,fontWeight:800,color:C.sage,fontFamily:SERIF,lineHeight:1.1}}>{gain}€</div>
                    </div>
                    <div style={{textAlign:"right",fontSize:10,color:C.muted,lineHeight:1.5}}>
                      <div>Prix client : {r.prix||0}€</div>
                      <div>Commission Savvy : {commission}€</div>
                    </div>
                  </div>

                  <div style={{display:"flex",gap:8,marginBottom:8}}>
                    <button onClick={()=>setClientProfileModal(r)}
                      style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>
                      Voir le profil
                    </button>
                    <button onClick={()=>setSection("messages")} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Message
                    </button>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={async ()=>{
                      const confirmed = {...r, statut:"confirmé", hoursUntil: r.date==="Demain"?22:r.date==="Aujourd'hui"?6:168};
                      setExpConfirmed(prev=>[confirmed,...prev]);
                      const remaining = expRequests.filter(x=>x.id!==r.id);
                      setExpRequests(remaining);
                      if(onRequestsChange) onRequestsChange(remaining.length);
                      if(r._fromLS) updateBooking(r.id, {status:"confirmed"});
                      if(r._fromSB) {
                        const { data: upd } = await supabase.from("bookings").update({status:"confirmed"}).eq("id",r.id).select().single();
                        if(upd) supabase.functions.invoke("notify-booking", { body: { record: upd, type: "UPDATE" } }).catch(()=>{});
                      }
                      setSessionConfirmToast({name:r.client, type:"confirmed"});
                      setTimeout(()=>setSessionConfirmToast(null),3000);
                      setExpSessionTab("confirmees");
                    }} style={{flex:2,padding:"10px",borderRadius:10,border:"none",background:C.sage,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>Confirmer</button>
                    <button onClick={async ()=>{
                      setExpCancelled(prev=>[{...r,statut:"refusé",motif:"Refusé par l'expert"},...prev]);
                      const remaining = expRequests.filter(x=>x.id!==r.id);
                      setExpRequests(remaining);
                      if(onRequestsChange) onRequestsChange(remaining.length);
                      if(r._fromLS) updateBooking(r.id, {status:"cancelled"});
                      if(r._fromSB) {
                        const { data: upd } = await supabase.from("bookings").update({status:"cancelled", cancelled_by:"expert", cancel_reason:"Refusé par l'expert"}).eq("id",r.id).select().single();
                        if(upd) supabase.functions.invoke("notify-booking", { body: { record: upd, type: "UPDATE" } }).catch(()=>{});
                      }
                      setSessionConfirmToast({name:r.client, type:"refused"});
                      setTimeout(()=>setSessionConfirmToast(null),3000);
                    }} style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>Refuser</button>
                  </div>
                </div>
                );
              })}
            </div>
          )}

          {expSessionTab==="confirmees" && (()=>{
            if(visible.length===0) return (
              <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg></div>
                Aucune session confirmée
              </div>
            );
            const isDone = (x) => x.startTs ? Date.now() > x.startTs + 90*60000 : x.hoursUntil < -1;
            const sorted = [...visible].filter(x=>!isDone(x)).sort((a,b)=>a.hoursUntil-b.hoursUntil);
            const doneSessions = [...visible].filter(isDone).sort((a,b)=>(b.startTs||0)-(a.startTs||0));
            const expGroups = [
              {label:"Aujourd'hui", color:"#EF4444", bg:"#FEF2F2", sessions: sorted.filter(s=>s.hoursUntil<=24)},
              {label:"Demain",      color:"#6366F1", bg:"#EEF2FF", sessions: sorted.filter(s=>s.hoursUntil>24&&s.hoursUntil<=48)},
              {label:"Cette semaine",color:"#F59E0B",bg:"#FFFBEB", sessions: sorted.filter(s=>s.hoursUntil>48&&s.hoursUntil<=168)},
              {label:"Plus tard",   color:C.muted,   bg:C.cream2,  sessions: sorted.filter(s=>s.hoursUntil>168)},
              {label:"Terminées",   color:C.sage,    bg:C.sageL,   sessions: doneSessions},
            ].filter(g=>g.sessions.length>0);
            return expGroups.map(group=>(
              <div key={group.label}>
                {/* Séparateur groupe */}
                <div style={{display:"flex",alignItems:"center",gap:8,margin:"4px 0 10px"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:group.color,flexShrink:0}}/>
                  <span style={{fontSize:11,fontWeight:700,color:group.color,textTransform:"uppercase",letterSpacing:.6}}>{group.label}</span>
                  <div style={{flex:1,height:1,background:C.borderF}}/>
                  <span style={{fontSize:10,color:C.faint}}>{group.sessions.length}</span>
                </div>
                {group.sessions.map(s=>{
                  const isToday=s.hoursUntil<=24, isTomorrow=s.hoursUntil>24&&s.hoursUntil<=48;
                  const borderCol=isToday?"#FCA5A5":isTomorrow?"#A5B4FC":C.border;
                  const topBar=isToday?"linear-gradient(90deg,#EF4444,#F87171)":isTomorrow?"linear-gradient(90deg,#6366F1,#818CF8)":s.hoursUntil<=168?"linear-gradient(90deg,#F59E0B,#FCD34D)":`linear-gradient(90deg,${C.sage},${C.gold})`;
                  return (
                    <div key={s.id} style={{background:C.white,borderRadius:14,border:`1px solid ${borderCol}`,marginBottom:10,overflow:"hidden",boxShadow:`0 1px 6px ${C.sh}`}}>
                      <div style={{height:3,background:topBar}}/>
                      <div style={{padding:"13px 15px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12}}>
                          {s.photoUrl
                            ? <img src={s.photoUrl} alt="" style={{width:40,height:40,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
                            : <div style={{width:40,height:40,borderRadius:"50%",background:s.bg,color:s.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{s.ini}</div>}
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{s.client}</div>
                            <div style={{fontSize:11,color:C.muted,marginTop:1}}>{s.format}</div>
                          </div>
                          <div style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,background:s.statut==="confirmé"?C.sageL:"#FEF3C7",color:s.statut==="confirmé"?C.sage:"#92400E",display:"flex",alignItems:"center",gap:4}}>
                            {s.statut==="confirmé"&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                            {s.statut==="confirmé"?"Confirmé":"En attente"}
                          </div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
                          {[
                            {svg:<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>,v:s.date},
                            {svg:<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>,v:s.heure},
                            {svg:<svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 14 14"/></svg>,v:s.duree},
                          ].map((d,i)=>(
                            <div key={i} style={{background:C.cream2,borderRadius:8,padding:"6px 7px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                              {d.svg}
                              <div style={{fontSize:10,fontWeight:600,color:C.ink}}>{d.v}</div>
                            </div>
                          ))}
                        </div>
                        {(s.prix||0)>0 && (
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.sageL||"#F0F5EF",borderRadius:8,padding:"7px 11px",marginBottom:11}}>
                            <span style={{fontSize:11,color:C.sage,fontWeight:600}}>Tu reçois</span>
                            <span style={{fontSize:14,fontWeight:800,color:C.sage,fontFamily:SERIF}}>{Math.round((s.prix||0)*0.8)}€</span>
                          </div>
                        )}
                        <div style={{display:"flex",gap:7}}>
                          <button onClick={()=>setSection("messages")} style={{flex:1,padding:"8px",borderRadius:9,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message
                          </button>
                          {s.statut==="confirmé"&&(()=>{
                            const now = Date.now();
                            const canJoin = !s.startTs || (now >= s.startTs - 15*60000 && now <= s.startTs + 75*60000);
                            return (
                            <button disabled={!canJoin} onClick={()=>{
                              if(!canJoin) return;
                              const roomId = s.id ? String(s.id).replace(/-/g,"").slice(0,16) : "savvy";
                              window.open(`https://meet.jit.si/savvy-${roomId}`, "_blank");
                            }} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:canJoin?C.sage:C.cream3,color:canJoin?C.white:C.muted,fontSize:11,fontWeight:700,cursor:canJoin?"pointer":"default",fontFamily:SERIF,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x={1} y={5} width={15} height={14} rx={2}/></svg>{canJoin?"Rejoindre":"15 min avant"}
                            </button>
                            );
                          })()}
                          <button onClick={()=>setCancelModal({session:s,step:"choose",type:"exp"})} style={{padding:"8px 11px",borderRadius:9,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center"}}><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ));
          })()}
        </div>
      );
    }

    // ── Disponibilités — planning hebdomadaire récurrent
    if (section === "disponibilidades") {
      const JOURS = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi","Dimanche"];
      // weekSchedule: { 0: {active,start,end}, …, 6: {…} } (0=lundi, 6=dimanche)
      const deriveWeek = () => {
        const def = {};
        for (let i = 0; i < 7; i++) def[i] = { active: false, start: "09:00", end: "18:00" };
        // Init from existing dispoSelected/dispoHours (date-based → derive dow)
        Object.keys(dispoSelected).filter(k => dispoSelected[k]).forEach(dateKey => {
          // Parse la clé en LOCAL (new Date("YYYY-MM-DD") parse en UTC → décalage)
          const [yy, mm, dd] = dateKey.split("-").map(Number);
          const dow = new Date(yy, mm-1, dd).getDay();
          const dowMon = dow === 0 ? 6 : dow - 1;
          const hrs = dispoHours[dateKey] || "09:00-18:00";
          const [start, end] = hrs.split("-");
          def[dowMon] = { active: true, start, end };
        });
        return def;
      };
      // Valeur dérivée des dispos Supabase (toujours à jour, même si elles
      // arrivent après le premier rendu). Tant que l'utilisateur n'a rien
      // modifié, on affiche cette valeur dérivée ; dès qu'il touche un jour,
      // on bascule sur son édition locale.
      const derivedWeek = deriveWeek();
      const [edited, setEdited] = React.useState(null);
      const weekSchedule = edited || derivedWeek;
      const setWeekSchedule = (updater) => setEdited(prev => typeof updater === "function" ? updater(prev || derivedWeek) : updater);

      const activeDays = [0,1,2,3,4,5,6].filter(i => weekSchedule[i]?.active).length;

      // Helpers horaires : "HH:MM" <-> minutes, pour garder start < end
      const toMin = (t) => { const [h,m] = (t||"0:0").split(":").map(Number); return (h||0)*60 + (m||0); };
      const toHHMM = (mins) => { const m = Math.max(0, Math.min(1439, mins)); return String(Math.floor(m/60)).padStart(2,"0") + ":" + String(m%60).padStart(2,"0"); };
      const toggle = (i) => setWeekSchedule(s => ({ ...s, [i]: { ...s[i], active: !s[i].active } }));
      const setStart = (i, v) => setWeekSchedule(s => {
        const cur = s[i]; const end = cur.end;
        // Si le début dépasse (ou égale) la fin, on repousse la fin à début + 1h
        const nextEnd = toMin(v) >= toMin(end) ? toHHMM(toMin(v) + 60) : end;
        return { ...s, [i]: { ...cur, start: v, end: nextEnd } };
      });
      const setEnd = (i, v) => setWeekSchedule(s => {
        const cur = s[i];
        // La fin doit être au moins 15 min après le début
        const minEnd = toMin(cur.start) + 15;
        const nextEnd = toMin(v) < minEnd ? toHHMM(minEnd) : v;
        return { ...s, [i]: { ...cur, end: nextEnd } };
      });
      const hasInvalid = [0,1,2,3,4,5,6].some(i => weekSchedule[i]?.active && toMin(weekSchedule[i].end) <= toMin(weekSchedule[i].start));

      return (
        <div>
          <BackHeaderExp title="Disponibilités" sub="Planning hebdomadaire récurrent" onBack={()=>setSection(null)}/>
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:13,padding:"13px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:11}}>
            <div style={{flexShrink:0,color:C.goldB}}>
              <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:SERIF,marginBottom:2}}>Ton planning se répète chaque semaine</div>
              <div style={{fontSize:11,color:"rgba(253,252,248,.65)",lineHeight:1.5}}>Active les jours et définis tes horaires — les clients voient tes créneaux disponibles.</div>
            </div>
          </div>

          <div style={{display:"flex",gap:8,marginBottom:12}}>
            <button onClick={()=>setWeekSchedule(s=>{const n={...s};for(let i=0;i<5;i++)n[i]={...n[i],active:true};return n;})}
              style={{flex:1,padding:"8px",borderRadius:20,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Lun–Ven</button>
            <button onClick={()=>setWeekSchedule(s=>{const n={...s};for(let i=0;i<7;i++)n[i]={...n[i],active:true};return n;})}
              style={{flex:1,padding:"8px",borderRadius:20,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Tous les jours</button>
            <button onClick={()=>setWeekSchedule(s=>{const n={...s};for(let i=0;i<7;i++)n[i]={...n[i],active:false};return n;})}
              style={{flex:1,padding:"8px",borderRadius:20,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Effacer</button>
          </div>

          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"6px 0",marginBottom:14}}>
            {JOURS.map((label, i) => {
              const day = weekSchedule[i];
              const isWkd = i >= 5;
              return (
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:i<6?`1px solid ${C.borderF}`:"none",opacity:!day.active&&isWkd?0.5:1}}>
                  <button onClick={()=>toggle(i)}
                    style={{width:44,height:26,borderRadius:13,border:"none",cursor:"pointer",flexShrink:0,background:day.active?"#10B981":C.cream3,transition:"background .2s",position:"relative"}}>
                    <div style={{position:"absolute",top:3,left:day.active?21:3,width:20,height:20,borderRadius:"50%",background:C.white,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
                  </button>
                  <div style={{fontSize:13,fontWeight:600,color:day.active?C.ink:C.muted,minWidth:80}}>{label}</div>
                  {day.active ? (()=>{
                    const invalid = toMin(day.end) <= toMin(day.start);
                    return (
                    <div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
                      <input type="time" value={day.start} onChange={e=>setStart(i,e.target.value)}
                        style={{flex:1,padding:"5px 8px",borderRadius:8,border:`1px solid ${invalid?"#FCA5A5":C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink}}/>
                      <span style={{fontSize:11,color:invalid?"#B91C1C":C.muted}}>→</span>
                      <input type="time" value={day.end} onChange={e=>setEnd(i,e.target.value)}
                        style={{flex:1,padding:"5px 8px",borderRadius:8,border:`1px solid ${invalid?"#FCA5A5":C.border}`,fontSize:12,fontFamily:"inherit",color:invalid?"#B91C1C":C.ink}}/>
                    </div>
                    );
                  })() : (
                    <div style={{fontSize:11,color:C.faint,flex:1}}>Fermé</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{fontSize:12,fontWeight:700,color:activeDays>0?C.sage:C.faint,textAlign:"center",marginBottom:hasInvalid?8:14}}>
            {activeDays > 0 ? `✓ ${activeDays} jour${activeDays>1?"s":""} ouverts à la réservation chaque semaine` : "Aucun jour sélectionné"}
          </div>

          {hasInvalid && (
            <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:11,padding:"10px 13px",marginBottom:14,fontSize:12,color:"#B91C1C",lineHeight:1.5,display:"flex",gap:8,alignItems:"flex-start"}}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{flexShrink:0,marginTop:1}}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
              <span>L'heure de fin doit être après l'heure de début. Corrige les créneaux en rouge avant d'enregistrer.</span>
            </div>
          )}

          <button disabled={hasInvalid} onClick={async ()=>{
            if (hasInvalid) return;
            if (!resolvedExpertId) {
              alert("Profil expert introuvable. Déconnecte-toi et reconnecte-toi pour réessayer.");
              return;
            }
            const rows = Object.entries(weekSchedule)
              .filter(([,d]) => d.active)
              .map(([dow, d]) => ({ expert_id: resolvedExpertId, day_of_week: Number(dow), start_time: d.start, end_time: d.end }));
            await supabase.from("availability").delete().eq("expert_id", resolvedExpertId);
            if (rows.length > 0) await supabase.from("availability").insert(rows);
            // Sync immédiat du compteur dashboard + barre de profil
            const sel = {}, hrs = {};
            const today0 = new Date(); today0.setHours(0,0,0,0);
            for (let i = 0; i < 60; i++) {
              const d = new Date(today0); d.setDate(today0.getDate() + i);
              const dowMon = d.getDay() === 0 ? 6 : d.getDay() - 1;
              const day = weekSchedule[dowMon];
              if (day?.active) { const key = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); sel[key] = true; hrs[key] = day.start + "-" + day.end; }
            }
            setDispoSelected(sel); setDispoHours(hrs);
            setDispoSaved(true); setTimeout(()=>setDispoSaved(false), 3000);
          }} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:hasInvalid?C.cream3:dispoSaved?"#10B981":C.ink,color:hasInvalid?C.muted:C.white,fontSize:14,fontWeight:700,cursor:hasInvalid?"not-allowed":"pointer",fontFamily:SERIF,transition:"background .3s"}}>
            {dispoSaved ? "✓ Planning enregistré" : "Enregistrer mon planning"}
          </button>

          <div style={{marginTop:12,background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.goldB}`,display:"flex",alignItems:"flex-start",gap:10}}>
            <span style={{fontSize:18,flexShrink:0}}>✦</span>
            <div>
              <div style={{fontSize:12,color:C.ink,fontWeight:700,marginBottom:4}}>Plus tu es disponible, plus tu reçois de demandes.</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>Les experts avec un planning complet apparaissent davantage dans les résultats.</div>
            </div>
          </div>
        </div>
      );
    }

    // ═══ MON COMPTE HUB (expert) ═══════════════════════════════════════════════
    if (section === "compte") {
      const goBackToCompte = () => { setSection(null); setSubSection(null); };
      const goBackToMain   = () => { setSection(null); setSubSection(null); };

      // Paramètres
      if (subSection === "parametres") {
        const acc = openSection; const setAcc = setOpenSection;
        const AccRowExp = ({id, icon, bg, title, sub, children}) => (
          <div style={{background:C.white,overflow:"hidden",borderBottom:acc===id?`1px solid ${C.borderF}`:"none"}}>
            <div onClick={()=>setAcc(acc===id?null:id)} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 20px",cursor:"pointer",borderBottom:`1px solid ${C.borderF}`}}>
              <div style={{color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",width:20,flexShrink:0}}>{MENU_ICONS[icon]||<span style={{fontSize:14}}>{icon}</span>}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:400,color:C.ink,letterSpacing:"-.1px"}}>{title}</div>
                {sub && <div style={{fontSize:11,color:C.faint,marginTop:1}}>{sub}</div>}
              </div>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2} style={{transform:acc===id?"rotate(90deg)":"none",transition:".2s",flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            {acc===id && <div style={{background:C.cream,padding:"12px 20px 16px"}}>{children}</div>}
          </div>
        );
        return (
          <div>
            <BackHeaderExp title="Paramètres du compte" onBack={goBackToCompte}/>
            <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px",marginBottom:14,display:"flex",gap:14,alignItems:"center"}}>
              {photoUrl
                ? <img src={photoUrl} alt="profil" style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:`2px solid ${C.goldB}`,flexShrink:0}}/>
                : <div style={{width:56,height:56,borderRadius:"50%",background:`linear-gradient(135deg,${C.goldL},#FDE68A)`,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:21,fontFamily:SERIF,flexShrink:0}}>{USER.initials}</div>
              }
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{USER.prenom} {USER.nom}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{USER.email}</div>
              </div>
              <button onClick={()=>photoInputRef.current?.click()} style={{padding:"7px 13px",borderRadius:20,border:`1px solid ${C.goldB}`,background:C.goldL,color:C.gold,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,fontFamily:"inherit"}}>
                {photoUrl?"Changer":"Photo"}
              </button>
            </div>
            <AccRowExp id="infos" icon="👤" bg="#EDE9FE" title="Informations personnelles" sub="Prénom, nom, ville, domaine">
              {[["Prénom","prenom",USER.prenom],["Nom","nom",USER.nom],["Ville","location",USER.location],["Domaine","domain",profileEdits.domain||EXPERT_DATA.domain]].map(([l,k,v],i,arr)=>(
                <div key={l} style={{padding:"11px 16px",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none"}}>
                  {editingParam===k ? (
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:C.muted,marginBottom:4,fontWeight:600}}>{l}</div>
                        <input autoFocus value={editParamVal} onChange={e=>setEditParamVal(e.target.value)}
                          onKeyDown={e=>{if(e.key==="Enter"){saveProfileEdit(k,editParamVal);setEditingParam(null);}if(e.key==="Escape")setEditingParam(null);}}
                          style={{width:"100%",padding:"7px 10px",borderRadius:9,border:`1.5px solid ${C.gold}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.white}}/>
                      </div>
                      <button onClick={()=>{saveProfileEdit(k,editParamVal);setEditingParam(null);}} style={{padding:"7px 13px",borderRadius:9,border:"none",background:C.sage,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>✓</button>
                      <button onClick={()=>setEditingParam(null)} style={{padding:"7px 10px",borderRadius:9,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>✕</button>
                    </div>
                  ) : (
                    <div onClick={()=>{setEditingParam(k);setEditParamVal(v);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
                      <span style={{fontSize:13,color:C.muted}}>{l}</span>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:13,fontWeight:600,color:C.ink}}>{v}</span>
                        <span style={{fontSize:10,color:C.gold,fontWeight:700}}>Modifier</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </AccRowExp>
            <AccRowExp id="connexion" icon="🔒" bg="#DBEAFE" title="Connexion & sécurité" sub="E-mail, mot de passe">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:`1px solid ${C.borderF}`}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.ink}}>Adresse e-mail</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>{USER.email}</div>
                </div>
                <span style={{fontSize:11,color:C.gold,fontWeight:700,cursor:"pointer"}}>Modifier</span>
              </div>
              <div onClick={()=>setShowPwdModal(true)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:`1px solid ${C.borderF}`,cursor:"pointer"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.ink}}>Mot de passe</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>••••••••</div>
                </div>
                <span style={{fontSize:11,color:C.gold,fontWeight:700}}>Modifier →</span>
              </div>
              <div onClick={()=>setShowDeleteModal(true)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#DC2626"}}>Supprimer le compte</div>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </AccRowExp>
            <AccRowExp id="notifs" icon="🔔" bg="#D1FAE5" title="Notifications" sub="Contrôle tes alertes">
              {[
                {k:"nuevas_resa",icon:"📅",l:"Nouvelles réservations",desc:"Quand quelqu'un réserve avec toi"},
                {k:"clientes",   icon:"💬",l:"Messages clients",desc:"Nouveaux messages dans ta boîte"},
                {k:"rappels",    icon:"⏰",l:"Rappels",desc:"1h avant chaque session"},
                {k:"newsletter", icon:"✨",l:"Nouveautés Savvy",desc:"Mises à jour et opportunités"},
              ].map((n,i,arr)=>(
                <div key={n.k} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none"}}>
                  <div style={{width:34,height:34,borderRadius:10,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{n.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{n.l}</div>
                    <div style={{fontSize:11,color:C.faint,marginTop:1}}>{n.desc}</div>
                  </div>
                  <ToggleExp on={expNotifToggles[n.k]} onToggle={()=>toggleExpN(n.k)}/>
                </div>
              ))}
            </AccRowExp>
            <button onClick={()=>{if(window.confirm("Te déconnecter ?")){onLogout&&onLogout();}}} style={{width:"100%",marginTop:10,padding:"14px",borderRadius:13,border:"1.5px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Déconnexion
            </button>
          </div>
        );
      }

      // Revenus
      if (subSection === "revenus") return (
        <div>
          <BackHeaderExp title="Mes revenus" sub="Solde, virements et factures" onBack={goBackToCompte}/>
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:16,padding:"18px 20px",marginBottom:14,color:C.white}}>
            <div style={{fontSize:11,color:"rgba(253,252,248,.5)",marginBottom:4,textTransform:"uppercase",letterSpacing:.6}}>Solde disponible</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:4}}>
              <div style={{fontSize:32,fontWeight:700,fontFamily:SERIF}}>{showRevenu?(realRevenuTotal>0?realRevenuTotal.toFixed(0)+"€":"0€"):"••••€"}</div>
              <button onClick={()=>setShowRevenu(v=>!v)} style={{marginBottom:6,fontSize:12,background:"rgba(255,255,255,.12)",border:"none",borderRadius:20,padding:"3px 10px",color:"rgba(253,252,248,.7)",cursor:"pointer",fontFamily:"inherit"}}>
                {showRevenu?"Masquer":"Voir"}
              </button>
            </div>
            <div style={{fontSize:11,color:"rgba(253,252,248,.5)"}}>Prochain virement SEPA après ta première session</div>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[{id:"hoy",l:"Aujourd'hui"},{id:"semana",l:"Semaine"},{id:"mes",l:"Mois"}].map(f=>(
              <button key={f.id} onClick={()=>setRevFilter(f.id)} style={{flex:1,padding:"7px 4px",borderRadius:20,border:`1.5px solid ${revFilter===f.id?C.gold:C.border}`,background:revFilter===f.id?C.goldL:"transparent",color:revFilter===f.id?C.gold:C.muted,fontSize:10,fontWeight:revFilter===f.id?700:400,cursor:"pointer",fontFamily:"inherit"}}>
                {f.l}
              </button>
            ))}
          </div>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Mode de virement</div>
            <div style={{display:"flex",alignItems:"center",gap:11,padding:"9px 0",borderBottom:`1px solid ${C.borderF}`}}>
              <span style={{fontSize:20}}>🏦</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.ink}}>SEPA — IBAN configuré</div>
                <div style={{fontSize:11,color:C.muted}}>Virement sous 3–5 jours ouvrés</div>
              </div>
              <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:C.sageL,color:C.sage,fontWeight:700}}>Actif</span>
            </div>
            <button onClick={()=>setShowCardModal(true)} style={{width:"100%",marginTop:10,padding:"9px",borderRadius:10,border:`1px dashed ${C.gold}`,background:"transparent",color:C.gold,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✏️ Modifier les coordonnées bancaires</button>
          </div>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>
              Revenus ({revFilter==="hoy"?"Aujourd'hui":revFilter==="semana"?"Cette semaine":"Ce mois"})
            </div>
            {(() => {
              const now = new Date();
              let start;
              if (revFilter==="hoy") start = new Date(now.getFullYear(),now.getMonth(),now.getDate());
              else if (revFilter==="semana") start = new Date(now-7*24*3600000);
              else start = new Date(now.getFullYear(),now.getMonth(),1);
              const filtered = authUser?.real
                ? realPaidBookings.filter(b=>new Date(b.date_session)>=start)
                : [];
              if (!filtered.length) return <div style={{textAlign:"center",padding:"18px 0",color:C.faint,fontSize:12}}>Aucune activité sur cette période</div>;
              return filtered.map((b,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<filtered.length-1?`1px solid ${C.borderF}`:"none"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{b.phase_name||"Session"}</div>
                    <div style={{fontSize:11,color:C.muted}}>{b.date_session?new Date(b.date_session).toLocaleDateString("fr-FR",{day:"numeric",month:"short"}):"—"}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:C.gold}}>+{((b.phase_price||0)*0.8).toFixed(0)}€</div>
                </div>
              ));
            })()}
            {realRevenu>0 && <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,color:C.ink}}>
              <span>Total net (80%)</span><span style={{color:C.gold}}>{realRevenu.toFixed(0)}€</span>
            </div>}
            <button onClick={()=>generateFacturesPDF(EXPERT_DATA.prenom+" "+EXPERT_DATA.nom, true)} style={{width:"100%",marginTop:10,padding:"9px",borderRadius:10,border:`1px solid ${C.gold}`,background:C.goldL,color:C.gold,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📄 Télécharger mes factures PDF</button>
          </div>
        </div>
      );

      // Mes clients aidés
      if (subSection === "clients") {
        // Agrupa por client_id para sacar clientes únicos con sus bookings
        const clientMap = {};
        (authUser?.real ? realPaidBookings : []).forEach(b => {
          const cid = b.client_id;
          if (!clientMap[cid]) clientMap[cid] = { nom: b.client_name || "Client", sessions: [], derniere: b.date_session };
          clientMap[cid].sessions.push(b);
          if (new Date(b.date_session) > new Date(clientMap[cid].derniere)) clientMap[cid].derniere = b.date_session;
        });
        const clientsData = Object.entries(clientMap).map(([cid, d]) => ({
          cid, nom: d.nom, nb: d.sessions.length,
          derniere: d.derniere ? new Date(d.derniere).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}) : "—",
          ini: d.nom.split(" ").map(w=>w[0]||"").join("").slice(0,2).toUpperCase()||"??"
        }));
        const BGSPALETTE = ["#EDE9FE","#DBEAFE","#D1FAE5","#FEF3C7","#FCE7F3"];
        const COLPALETTE = ["#7C3AED","#1D4ED8","#065F46","#92400E","#9D174D"];
        return (
          <div>
            <BackHeaderExp title="Mes clients aidés" sub="Personnes que tu as accompagnées" onBack={goBackToCompte}/>
            {clientsData.length===0
              ? <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
                  <div style={{fontSize:40,marginBottom:12}}>🤝</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Pas encore de clients</div>
                  <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Tes premiers clients apparaîtront ici après ta première session confirmée.</div>
                </div>
              : clientsData.map((c,i)=>(
                <div key={c.cid} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",marginBottom:10,display:"flex",alignItems:"center",gap:12,boxShadow:`0 1px 4px ${C.sh}`}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:BGSPALETTE[i%5],color:COLPALETTE[i%5],display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{c.ini}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{c.nom}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{c.nb} session{c.nb>1?"s":""} · Dernière : {c.derniere}</div>
                  </div>
                </div>
              ))
            }
            {clientsData.length>0 && <div style={{textAlign:"center",marginTop:8,fontSize:11,color:C.muted}}>{clientsData.length} client{clientsData.length>1?"s":""} accompagné{clientsData.length>1?"s":""} · {realPaidBookings.length} session{realPaidBookings.length>1?"s":""} au total</div>}
          </div>
        );
      }

      // Mon compte sub-menu (expert)
      return (
        <div>
          <BackHeaderExp title="Mon compte" onBack={goBackToMain}/>
          <div style={{background:C.white,overflow:"hidden",marginBottom:8}}>
            <div style={{padding:"18px 20px 6px",fontSize:13,fontWeight:600,color:C.muted,letterSpacing:".4px",textTransform:"uppercase"}}>Compte</div>
            <MenuRowExp icon="⚙️" title="Paramètres" sub="Informations personnelles · Connexion · Notifications" onClick={()=>setSubSection("parametres")}/>
            <MenuRowExp icon="💰" title="Mes revenus" sub="Solde disponible · SEPA · Historique & factures" onClick={()=>setSubSection("revenus")}/>
            <MenuRowExp icon="🤝" title="Mes clients aidés" sub="Personnes que tu as accompagnées" onClick={()=>setSubSection("clients")}/>
          </div>
          <div style={{padding:"0 20px 40px"}}>
            <button onClick={()=>{if(window.confirm("Te déconnecter de Savvy ?")){onLogout&&onLogout();}}} style={{width:"100%",padding:"14px",borderRadius:13,border:"1.5px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Déconnexion
            </button>
          </div>
        </div>
      );
    }

    // ═══ AIDE HUB (expert) ═════════════════════════════════════════════════════
    if (section === "aide") {
      const goBackToAide = () => { setSection(null); setSubSection(null); };
      const goBackToMain = () => { setSection(null); setSubSection(null); };

      if (subSection === "centre") return (
        <div>
          <BackHeaderExp title="Centre d'aide" sub="On est là pour toi" onBack={goBackToAide}/>
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:16,padding:"20px",marginBottom:18,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(185,134,74,.06)"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:28,marginBottom:10}}>🤝</div>
              <div style={{fontSize:17,fontWeight:700,color:C.white,fontFamily:SERIF,marginBottom:6}}>On est là pour toi</div>
              <div style={{fontSize:12,color:"rgba(253,252,248,.65)",lineHeight:1.8,marginBottom:14}}>Un problème avec une session ? Une question sur ton compte ?</div>
              {!helpMsgSent ? (
                <>
                  <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:14}}>
                    {["💳 Paiement","📅 Session","👤 Compte","🔒 Sécurité","💡 Autre"].map(s=>(
                      <button key={s} onClick={()=>setHelpMsgText(t=>t||s+" — ")} style={{padding:"6px 13px",borderRadius:20,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.08)",color:"rgba(253,252,248,.85)",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>
                    ))}
                  </div>
                  <textarea value={helpMsgText} onChange={e=>setHelpMsgText(e.target.value)} placeholder="Décris-nous ton problème…" rows={3}
                    style={{width:"100%",padding:"11px 13px",borderRadius:11,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",color:C.white,fontSize:12,fontFamily:"inherit",resize:"none",outline:"none",lineHeight:1.6,marginBottom:10,boxSizing:"border-box"}}/>
                  <button onClick={()=>{ if(helpMsgText.trim().length>3){ setHelpMsgSent(true); } else alert("Écris-nous un peu plus 🙏"); }}
                    style={{width:"100%",padding:"12px",borderRadius:11,border:"none",background:`linear-gradient(135deg,${C.gold},${C.goldB})`,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>
                    Envoyer mon message →
                  </button>
                </>
              ) : (
                <div style={{textAlign:"center",padding:"8px 0"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🙌</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.white,fontFamily:SERIF,marginBottom:6}}>Message reçu, merci !</div>
                  <div style={{fontSize:12,color:"rgba(253,252,248,.7)",lineHeight:1.7,marginBottom:14}}>Notre équipe te répond sous 2h.</div>
                  <button onClick={()=>{ setHelpMsgSent(false); setHelpMsgText(""); }} style={{padding:"8px 18px",borderRadius:20,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:C.white,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    Envoyer un autre message
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingLeft:2}}>Conversations passées</div>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            {[
              {icon:"✅",t:"Problème de paiement résolu",sub:"Il y a 3 semaines",msgs:[{from:"moi",txt:"Bonjour, j'ai été débité deux fois."},{from:"savvy",txt:"Remboursement traité sous 3–5 jours."},{from:"moi",txt:"Merci !"}]},
              {icon:"💬",t:"Question sur une annulation",sub:"Il y a 1 mois",msgs:[{from:"moi",txt:"Puis-je annuler une session ?"},{from:"savvy",txt:"Oui, jusqu'à 1h avant la session."}]},
            ].map((item,i,arr)=>(
              <div key={i}>
                <div onClick={()=>setConvoOpen(convoOpen===i?null:i)} style={{display:"flex",gap:11,padding:"13px 15px",borderBottom:convoOpen===i||i<arr.length-1?`1px solid ${C.borderF}`:"none",alignItems:"center",cursor:"pointer",background:convoOpen===i?C.cream2:"transparent"}}>
                  <div style={{width:36,height:36,borderRadius:10,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{item.t}</div>
                    <div style={{fontSize:11,color:C.faint,marginTop:1}}>{item.sub} · Résolu</div>
                  </div>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2} style={{transform:convoOpen===i?"rotate(90deg)":"none",transition:".2s"}}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                {convoOpen===i && (
                  <div style={{padding:"12px 15px",background:C.cream2,borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none"}}>
                    {item.msgs.map((m,mi)=>(
                      <div key={mi} style={{display:"flex",justifyContent:m.from==="moi"?"flex-end":"flex-start",marginBottom:8}}>
                        <div style={{maxWidth:"80%",padding:"9px 12px",borderRadius:m.from==="moi"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.from==="moi"?C.ink:C.white,color:m.from==="moi"?C.white:C.ink,fontSize:12,lineHeight:1.5,border:m.from==="savvy"?`1px solid ${C.borderF}`:"none"}}>
                          {m.from==="savvy"&&<div style={{fontSize:9,fontWeight:700,color:C.gold,marginBottom:3}}>✦ Équipe Savvy</div>}
                          {m.txt}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

      if (subSection === "legal") return (
        <div>
          <BackHeaderExp title="Légal" onBack={goBackToAide}/>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:14}}>
            {[{icon:"🔒",title:"Politique de confidentialité",desc:"Protection de tes données personnelles"},{icon:"📄",title:"Conditions générales d'utilisation",desc:"Règles de la plateforme Savvy"},{icon:"🍪",title:"Cookies",desc:"Paramètres de cookies"},{icon:"⚖️",title:"Mentions légales",desc:"Informations légales Savvy SAS"}].map((item,i,arr)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 16px",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none"}}>
                <div style={{width:38,height:38,borderRadius:11,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{item.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{item.title}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>{item.desc}</div>
                </div>
                <span style={{fontSize:9,fontWeight:700,color:C.muted,background:C.cream2,border:`1px solid ${C.border}`,borderRadius:8,padding:"2px 7px",flexShrink:0}}>bientôt</span>
              </div>
            ))}
          </div>
          <div style={{background:C.cream2,borderRadius:12,padding:"16px",border:`1px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:4}}>savvy ✦</div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.7}}>Savvy SAS · 12 rue de Rivoli, 75001 Paris<br/>SIRET 123 456 789 00012 · savvy.fr</div>
            <div style={{fontSize:10,color:C.faint,marginTop:10}}>© 2026 Savvy™ — All rights reserved.<br/>Données protégées conformément au RGPD.</div>
          </div>
        </div>
      );

      if (subSection === "avis") return (()=>{
        const [avisNote, setAvisNote] = useState(0);
        const [avisTxt, setAvisTxt] = useState("");
        const [avisSent, setAvisSent] = useState(false);
        return (
          <div>
            <BackHeaderExp title="Laisser un commentaire" onBack={goBackToAide}/>
            <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px"}}>
              {avisSent ? (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:44,marginBottom:12}}>🙏</div>
                  <div style={{fontSize:17,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Merci pour ton avis !</div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Ton retour nous aide à améliorer Savvy pour tout le monde.</div>
                  <button onClick={()=>{setAvisSent(false);setAvisNote(0);setAvisTxt("");}} style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Laisser un autre avis</button>
                </div>
              ) : <>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{fontSize:36,marginBottom:8}}>⭐</div>
                  <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:4}}>Comment s'est passée ton expérience ?</div>
                  <div style={{fontSize:12,color:C.muted}}>Ton avis nous aide à progresser</div>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
                  {[1,2,3,4,5].map(s=>(
                    <button key={s} onClick={()=>setAvisNote(s)} style={{fontSize:32,background:"none",border:"none",cursor:"pointer",padding:"4px",opacity:s<=avisNote?1:0.35,transition:"opacity .15s"}}>⭐</button>
                  ))}
                </div>
                <textarea value={avisTxt} onChange={e=>setAvisTxt(e.target.value)} placeholder="Dis-nous ce que tu as aimé ou ce qu'on peut améliorer…" rows={4}
                  style={{width:"100%",padding:"12px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
                <button onClick={()=>{ if(avisNote>0) setAvisSent(true); }} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:avisNote>0?C.ink:C.cream3,color:avisNote>0?C.white:C.muted,fontSize:13,fontWeight:700,cursor:avisNote>0?"pointer":"not-allowed",fontFamily:SERIF}}>
                  Envoyer mon avis →
                </button>
              </>}
            </div>
          </div>
        );
      })();

      // Aide sub-menu (expert)
      return (
        <div>
          <BackHeaderExp title="Aide" onBack={goBackToMain}/>
          <div style={{background:C.white,overflow:"hidden",marginBottom:8}}>
            <div style={{padding:"18px 20px 6px",fontSize:13,fontWeight:600,color:C.muted,letterSpacing:".4px",textTransform:"uppercase"}}>Aide</div>
            <MenuRowExp icon="💬" title="Centre d'aide" sub="Chat avec l'équipe Savvy · Conversations passées" onClick={()=>setSubSection("centre")}/>
            <MenuRowExp icon="📋" title="Légal" sub="Politique de confidentialité · CGU · Mentions légales" onClick={()=>setSubSection("legal")}/>
            <MenuRowExp icon="⭐" title="Laisser un commentaire" sub="Ton avis nous aide à progresser" onClick={()=>setSubSection("avis")}/>
          </div>
        </div>
      );
    }

    // ═══ DASHBOARD EXPERT ══════════════════════════════════════════════════════
    if (section === "dashboard") {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
      const nextSession = [...expConfirmed].filter(x=>!(x.startTs && Date.now() > x.startTs + 90*60000)).sort((a,b)=>(a.startTs||Infinity)-(b.startTs||Infinity))[0] || null;
      const pendingCount = expRequests.length;
      const sessionsThisWeek = expConfirmed.filter(s => (s.hoursUntil||0) <= 168).length;
      const revenuMois = isNewExpert ? 0 : calcRevenu("mes");

      // Completion % for new expert
      // Pour les experts réels (newExpertProfile peut être null si inscrit en session précédente)
      const expertData = newExpertProfile || sbExpertData;
      const completionSteps = isNewExpert ? [
        { done: true,  label: "Profil créé", icon:"✅" },
        { done: !!(expertData?.photo_url || expertData?.photo || photoUrl), label: "Photo ajoutée", icon:"📸" },
        { done: !!(expertData?.phases?.length), label: "Offre créée", icon:"💼" },
        { done: !!(expertData?.creds?.length), label: "Preuves ajoutées", icon:"🏆" },
        { done: Object.values(dispoSelected||{}).some(Boolean), label: "Disponibilités", icon:"🗓" },
        { done: false, label: "Première réservation", icon:"🎉" },
      ] : null;
      const completionPct = completionSteps ? Math.round(completionSteps.filter(s=>s.done).length / completionSteps.length * 100) : 100;

      return (
        <div>
          {/* ── Greeting ── */}
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:18,padding:"22px 20px",marginBottom:14,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-40,right:-40,width:160,height:160,borderRadius:"50%",background:"rgba(185,134,74,.07)"}}/>
            <div style={{position:"absolute",bottom:-30,left:-20,width:100,height:100,borderRadius:"50%",background:"rgba(185,134,74,.04)"}}/>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                {photoUrl
                  ? <img src={photoUrl} alt="" style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:`2px solid ${C.goldB}`,flexShrink:0}}/>
                  : <div style={{width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${C.goldL},#FDE68A)`,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,fontFamily:SERIF,flexShrink:0}}>{USER.initials}</div>
                }
                <div>
                  {isNewExpert
                    ? <div>
                        <div style={{fontSize:18,fontWeight:700,color:C.white,fontFamily:SERIF,letterSpacing:"-.2px"}}>Bienvenue sur Savvy ✨</div>
                        <div style={{fontSize:11,color:"rgba(253,252,248,.6)",marginTop:3}}>{USER.prenom} · Profil en cours de validation</div>
                      </div>
                    : <div>
                        <div style={{fontSize:13,color:"rgba(253,252,248,.55)",letterSpacing:.3}}>{greeting},</div>
                        <div style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:SERIF,letterSpacing:"-.3px"}}>{USER.prenom} 👋</div>
                      </div>
                  }
                </div>
              </div>

              {/* Stats rapides */}
              {isNewExpert ? (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[
                    {v: completionPct+"%", l:"profil complété"},
                    {v: "0", l:"sessions réalisées"},
                  ].map(s=>(
                    <div key={s.l} style={{background:"rgba(255,255,255,.07)",borderRadius:12,padding:"11px 10px",textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:800,color:C.white,fontFamily:SERIF}}>{s.v}</div>
                      <div style={{fontSize:9,color:"rgba(253,252,248,.45)",marginTop:2,lineHeight:1.3}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[
                    {v: revenuMois.toFixed(0)+"€", l:"revenus ce mois"},
                    {v: String(realClientsCount), l:"clients aidés"},
                    {v: authUser?.real ? "—" : (EXPERT_DATA.rating ? EXPERT_DATA.rating.toFixed(1)+"★" : "—"), l:"note moyenne"},
                    {v: String(sessionsThisWeek), l:"sessions sem."},
                  ].map(s=>(
                    <div key={s.l} style={{background:"rgba(255,255,255,.07)",borderRadius:12,padding:"11px 10px",textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:800,color:C.white,fontFamily:SERIF}}>{s.v}</div>
                      <div style={{fontSize:9,color:"rgba(253,252,248,.45)",marginTop:2,lineHeight:1.3}}>{s.l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Impact humain ── */}
          {(()=>{
            const n = authUser?.real ? realSessionsCount : (isNewExpert ? 0 : (EXPERT_DATA.impact.clients || 0));
            const label = n === 0
              ? "Tu n'as pas encore aidé quelqu'un — prêt pour ta première ?"
              : `${n} personne${n>1?"s":""} ont avancé grâce à ton expérience.`;
            return (
              <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:16,padding:"16px 18px",marginBottom:14,border:`1px solid rgba(185,134,74,.2)`}}>
                <div style={{fontSize:10,fontWeight:700,color:"rgba(253,252,248,.4)",textTransform:"uppercase",letterSpacing:.8,marginBottom:8}}>Impact</div>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:36,fontWeight:900,color:C.goldB,fontFamily:SERIF,lineHeight:1}}>{n}</div>
                  <div style={{fontSize:12,color:"rgba(253,252,248,.7)",lineHeight:1.5,flex:1}}>{label}</div>
                </div>
              </div>
            );
          })()}

          {/* ── Completion bar (new expert only) ── */}
          {isNewExpert && (
            <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.goldB}`,padding:"16px 18px",marginBottom:14,boxShadow:`0 2px 8px ${C.sh}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:700,color:C.ink}}>Complète ton profil</div>
                <div style={{fontSize:13,fontWeight:700,color:C.gold}}>{completionPct}%</div>
              </div>
              <div style={{height:6,background:C.cream3,borderRadius:10,marginBottom:12,overflow:"hidden"}}>
                <div style={{height:"100%",width:completionPct+"%",background:`linear-gradient(90deg,${C.gold},${C.goldB})`,borderRadius:10,transition:"width .4s"}}/>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {completionSteps.map((step,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:9}}>
                    <span style={{fontSize:15,width:22,textAlign:"center",flexShrink:0,opacity:step.done?1:.4}}>{step.icon}</span>
                    <div style={{fontSize:12,color:step.done?C.ink:C.muted,fontWeight:step.done?600:400,flex:1}}>{step.label}</div>
                    {step.done && <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Objectif (new expert) ── */}
          {isNewExpert && (
            <div style={{background:`linear-gradient(135deg,#EFF6FF,#DBEAFE)`,borderRadius:16,border:"1.5px solid #BFDBFE",padding:"16px 18px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <span style={{fontSize:22}}>🎯</span>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:"#1E3A8A"}}>Ton objectif</div>
                  <div style={{fontSize:12,color:"#3B82F6",fontWeight:600}}>Obtenir ta première réservation</div>
                </div>
              </div>
              <div style={{fontSize:11,color:"#1D4ED8",lineHeight:1.6}}>Active tes disponibilités et partage ton profil pour recevoir tes premières demandes.</div>
            </div>
          )}

          {/* ── Réputation (active expert) ── */}
          {!isNewExpert && !authUser?.real && EXPERT_DATA.rating && (
            <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"16px 18px",marginBottom:14,boxShadow:`0 2px 8px ${C.sh}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,color:C.ink}}>⭐ Réputation</div>
                <div style={{fontSize:22,fontWeight:800,color:C.gold,fontFamily:SERIF}}>{EXPERT_DATA.rating.toFixed(1)}</div>
              </div>
              <div style={{display:"flex",gap:3,marginBottom:10}}>
                {[1,2,3,4,5].map(i=>(
                  <div key={i} style={{flex:1,height:5,borderRadius:4,background:i <= Math.round(EXPERT_DATA.rating) ? C.gold : C.cream3}}/>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:11,color:C.muted}}>{EXPERT_DATA.impact.reviews||12} avis clients</div>
                <div style={{fontSize:11,color:C.sage,fontWeight:600}}>Top {EXPERT_DATA.impact.topPct||10}% des experts</div>
              </div>
            </div>
          )}

          {/* ── Aujourd'hui (session imminente) ── */}
          {nextSession && nextSession.hoursUntil <= 24 && (
            <div style={{background:"#FFFBEB",borderRadius:16,border:"1.5px solid #FDE68A",padding:"14px 16px",marginBottom:14,boxShadow:`0 2px 8px rgba(245,158,11,.12)`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#F59E0B",animation:"spin 2s linear infinite"}}/>
                <span style={{fontSize:11,fontWeight:800,color:"#92400E",textTransform:"uppercase",letterSpacing:.8}}>Aujourd'hui · {nextSession.heure}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:44,height:44,borderRadius:12,background:"#FEF3C7",border:"1.5px solid #FDE68A",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x={1} y={5} width={15} height={14} rx={2}/></svg>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.ink}}>{nextSession.client}</div>
                  <div style={{fontSize:11,color:"#92400E",marginTop:2}}>{nextSession.duree} · {nextSession.format}</div>
                </div>
                <button onClick={()=>handleJoin(nextSession)} style={{padding:"9px 14px",borderRadius:11,border:"none",background:"#F59E0B",color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  Rejoindre →
                </button>
              </div>
              {joinNotice && (
                <div style={{marginTop:11,background:joinNotice.type==="late"?"#FEF2F2":"#FFF7ED",border:`1px solid ${joinNotice.type==="late"?"#FECACA":"#FED7AA"}`,borderRadius:11,padding:"10px 13px",fontSize:12,color:joinNotice.type==="late"?"#B91C1C":"#92400E",lineHeight:1.5,display:"flex",gap:8,alignItems:"flex-start"}}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{flexShrink:0,marginTop:1}}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>
                  <span>{joinNotice.text}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Prochaine session ── */}
          {nextSession ? (
            <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"16px 18px",marginBottom:14,boxShadow:`0 2px 8px ${C.sh}`}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.7}}>Prochaine session</div>
                {(()=>{const cd=getCountdown(nextSession.hoursUntil); return cd?<span style={{fontSize:10,fontWeight:700,color:cd.color,background:cd.color+"18",borderRadius:20,padding:"2px 8px"}}>{cd.label}</span>:null;})()}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:13}}>
                <div style={{width:48,height:48,borderRadius:14,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.gold}}>{MENU_ICONS["📅"]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{nextSession.client}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{nextSession.date} · {nextSession.heure}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <button onClick={()=>{setExpSessionTab("confirmees");setSection("sesiones");}} style={{padding:"7px 12px",borderRadius:10,border:`1px solid ${C.goldB}`,background:C.goldL,color:C.gold,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                    Voir →
                  </button>
                  <button onClick={()=>downloadICS({expertName:nextSession.client,topic:nextSession.msg||"Session Savvy",date:nextSession.date,slot:nextSession.heure,durationH:.5})}
                    style={{padding:"5px 8px",borderRadius:8,border:"1px solid #C7D2FE",background:"#EEF2FF",color:"#6366F1",fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>
                    + Calendrier
                  </button>
                </div>
              </div>
            </div>
          ) : isNewExpert ? (
            <div style={{background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:16,border:`1px solid ${C.goldB}`,padding:"18px 18px",marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:4}}>🚀 Plus qu'une étape avant tes premières demandes</div>
              <div style={{fontSize:11,color:"#92400E",lineHeight:1.6,marginBottom:4}}>Ton profil est actuellement en cours de validation.</div>
              <div style={{fontSize:11,color:C.gold,lineHeight:1.6,marginBottom:12}}>Pendant ce temps, optimise ton profil pour être prêt dès son activation :</div>
              {[
                {icon:"🗓️", txt:"Configure tes disponibilités", action:()=>setSection("disponibilidades")},
                {icon:"💼", txt:"Vérifie tes offres et tarifs",  action:()=>{setSection(null);setSubSection(null);setOffresOpen(true);}},
              ].map(item=>(
                <div key={item.txt} onClick={item.action} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.goldB}20`,cursor:"pointer"}}>
                  <span style={{fontSize:16}}>{item.icon}</span>
                  <span style={{fontSize:12,color:C.ink,fontWeight:600,flex:1}}>{item.txt}</span>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>
          ) : (
            <div style={{background:C.cream2,borderRadius:16,border:`1px dashed ${C.border}`,padding:"18px",marginBottom:14,textAlign:"center"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={1.5}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg></div>
              <div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:3}}>Aucune session à venir</div>
              <div style={{fontSize:11,color:C.muted}}>Tes prochains rendez-vous apparaîtront ici</div>
            </div>
          )}

          {/* ── Demandes en attente ── */}
          {pendingCount > 0 && (
            <div onClick={()=>setSection("sesiones")} style={{background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:16,border:`1px solid ${C.goldB}`,padding:"16px 18px",marginBottom:14,cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:`0 2px 8px ${C.sh}`}}>
              <div style={{width:46,height:46,borderRadius:14,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative",color:C.white}}>
                {MENU_ICONS["🔔"]}
                <div style={{position:"absolute",top:-4,right:-4,background:"#EF4444",color:"white",borderRadius:"50%",minWidth:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{pendingCount}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{pendingCount} demande{pendingCount>1?"s":""} en attente</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Réponds pour confirmer tes sessions</div>
              </div>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          )}

          {/* ── Raccourcis ── */}
          <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.7,marginBottom:10}}>Accès rapide</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[
              {icon:"💼",bg:"#EDE8DF",title:"Mes offres",sub:"Tarifs & formats",action:()=>{setSection(null);setSubSection(null);setOffresOpen(true);}},
              {icon:"🗓️",bg:"#D1FAE5",title:"Disponibilités",sub:"Gérer mes créneaux",action:()=>setSection("disponibilidades")},
              {icon:"👤",bg:C.goldL,title:"Mon compte",sub:"Profil & paramètres",action:()=>{setSection(null);setSubSection(null);}},
              {icon:"📋",bg:"#EDE8DF",title:"Mes sessions",sub:"Voir le planning",action:()=>setSection("sesiones")},
            ].map(card=>(
              <div key={card.title} onClick={card.action} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px",cursor:"pointer",boxShadow:`0 1px 4px ${C.sh}`}}>
                <div style={{width:40,height:40,borderRadius:12,background:card.bg,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10,color:C.soft}}>{MENU_ICONS[card.icon]||<span style={{fontSize:18}}>{card.icon}</span>}</div>
                <div style={{fontSize:13,fontWeight:700,color:C.ink}}>{card.title}</div>
                <div style={{fontSize:10,color:C.muted,marginTop:2}}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* ── Graphique sessions (expert établi only) ── */}
          {!isNewExpert && !authUser?.real && (() => {
            const weeks = ["S-3","S-2","S-1","Cette sem."];
            const vals = [3,5,4,sessionsThisWeek||2];
            const maxV = Math.max(...vals,1);
            return (
              <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"16px 18px",marginBottom:14,boxShadow:`0 2px 8px ${C.sh}`}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.ink}}>Sessions · 4 dernières semaines</div>
                  <div style={{fontSize:11,color:C.gold,fontWeight:700}}>{vals.reduce((a,b)=>a+b,0)} total</div>
                </div>
                <div style={{display:"flex",alignItems:"flex-end",gap:8,height:70}}>
                  {vals.map((v,i)=>{
                    const pct = v/maxV*100;
                    const isLast = i===vals.length-1;
                    return (
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                        <div style={{fontSize:10,fontWeight:700,color:isLast?C.gold:C.muted}}>{v}</div>
                        <div style={{width:"100%",height:Math.max(pct*.50,4),borderRadius:"4px 4px 0 0",background:isLast?`linear-gradient(180deg,${C.gold},${C.goldB})`:C.cream3,transition:"height .4s",minHeight:4}}/>
                        <div style={{fontSize:9,color:isLast?C.gold:C.faint,fontWeight:isLast?700:400,whiteSpace:"nowrap"}}>{weeks[i]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── Dernier avis reçu (expert établi only) ── */}
          {!isNewExpert && !authUser?.real && (
            <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"16px 18px",marginBottom:14,boxShadow:`0 2px 8px ${C.sh}`}}>
              <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.7,marginBottom:10}}>Dernier avis reçu</div>
              <div style={{display:"flex",gap:5,marginBottom:8}}>
                {[1,2,3,4,5].map(s=><svg key={s} width={13} height={13} viewBox="0 0 12 12" fill="#B8864A"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
              </div>
              <div style={{fontSize:13,color:C.ink,lineHeight:1.6,fontStyle:"italic",marginBottom:8}}>
                "Session très enrichissante, des conseils concrets et directement applicables. Je recommande vivement ✦"
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:C.goldL,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>ML</div>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:C.ink}}>Marie L.</div>
                  <div style={{fontSize:10,color:C.muted}}>Il y a 2 jours</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tip contextuel ── */}
          <div style={{background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.goldB}`,display:"flex",alignItems:"flex-start",gap:10,marginBottom:14}}>
            <span style={{fontSize:18,flexShrink:0}}>✦</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:3}}>
                {isNewExpert ? "Conseil pour démarrer" : "Astuce du jour"}
              </div>
              <div style={{fontSize:12,color:C.gold,lineHeight:1.6}}>
                {isNewExpert
                  ? "Ajoute au moins 2 preuves concrètes à ton profil — les clients réservent 3× plus vite quand ils voient tes résultats."
                  : "Réponds aux demandes en moins de 2h : ton taux de réponse rapide augmente ta visibilité dans les résultats de recherche."
                }
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ═══ MAIN EXPERT MENU ══════════════════════════════════════════════════════
    return (
      <div>
        {/* En-tête expert */}
        <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"18px",marginBottom:14,boxShadow:`0 2px 8px ${C.sh}`}}>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
            <div onClick={()=>photoInputRef.current?.click()} style={{position:"relative",flexShrink:0,cursor:"pointer"}}>
              {photoUrl
                ? <img src={photoUrl} alt="profil" style={{width:62,height:62,borderRadius:"50%",objectFit:"cover",border:`2.5px solid ${C.goldB}`}}/>
                : <div style={{width:62,height:62,borderRadius:"50%",background:`linear-gradient(135deg,${C.goldL},#FDE68A)`,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:24,fontFamily:SERIF,border:`2px solid ${C.goldB}`}}>{USER.initials}</div>
              }
              <div style={{position:"absolute",bottom:0,right:0,width:20,height:20,borderRadius:"50%",background:C.ink,border:`2px solid ${C.white}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.5}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx={12} cy={13} r={4}/></svg>
              </div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:20,fontWeight:700,color:C.ink,fontFamily:SERIF,letterSpacing:"-.3px"}}>{USER.prenom} {USER.nom}</div>
              {(authUser?.tagline || profileEdits?.tagline || newExpertProfile?.tagline || (!authUser?.real && EXPERT_DATA.tagline)) && (
                <div style={{fontSize:12,color:C.ink,fontStyle:"italic",marginTop:2,lineHeight:1.4,fontFamily:SERIF}}>«&nbsp;{authUser?.tagline || profileEdits?.tagline || newExpertProfile?.tagline || EXPERT_DATA.tagline}&nbsp;»</div>
              )}
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{authUser?.real ? (authUser?.expertDomain || profileEdits?.domain || "Conseiller Savvy") : EXPERT_DATA.domain}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                {authUser?.real ? (
                  <span style={{fontSize:10,color:C.muted}}>{realSessionsCount} session{realSessionsCount!==1?"s":""} · {realSessionsCount===0?"Pas encore d'avis":"En attente d'avis"}</span>
                ) : (<>
                  <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s<=Math.round(EXPERT_DATA.rating||4.8)?"#B8864A":"#E5E0D8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
                  <span style={{fontSize:11,fontWeight:700,color:C.gold}}>{EXPERT_DATA.rating||"4.8"}</span>
                  <span style={{fontSize:10,color:C.muted}}>· {EXPERT_DATA.impact.sessions||0} sessions</span>
                </>)}
              </div>
            </div>
            <div onClick={()=>setShowRevenu(v=>!v)} style={{textAlign:"right",cursor:"pointer",flexShrink:0}}>
              <div style={{fontSize:20,fontWeight:800,color:realRevenuTotal>0?C.gold:C.muted,fontFamily:SERIF}}>{showRevenu?(realRevenuTotal>0?realRevenuTotal.toFixed(0)+"€":"0€"):"••••€"}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:1,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:3}}>revenus {showRevenu?<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></svg>:<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1={1} y1={1} x2={23} y2={23}/></svg>}</div>
            </div>
          </div>
          {/* ── Profil Savvy progress ── */}
          {(()=>{
            // Pour les experts réels : champs réels du profil (sbExpertData)
            const items = authUser?.real ? [
              {ok: !!(photoUrl || sbExpertData?.photo_url), l:"Photo"},
              {ok: !!sbExpertData?.tagline?.trim(), l:"Tagline"},
              {ok: !!sbExpertData?.bio?.trim(), l:"Bio"},
              {ok: (expOffres || sbExpertData?.phases || []).length > 0, l:"Offre"},
              {ok: (sbExpertData?.creds || []).length > 0, l:"Preuves"},
              {ok: Object.values(dispoSelected||{}).some(Boolean), l:"Disponibilités"},
            ] : [
              {ok: !!(photoUrl || USER.initials), l:"Photo"},
              {ok: !!(expOffres||EXPERT_DATA.offres).length, l:"Offre"},
              {ok: !!EXPERT_DATA.preuves.length, l:"Preuves"},
              {ok: Object.values(dispoSelected||{}).some(Boolean), l:"Disponibilités"},
              {ok: EXPERT_DATA.impact.sessions > 0, l:"Première session"},
              {ok: EXPERT_DATA.rating >= 4, l:"Note 4+"},
            ];
            const checks = items.map(i=>i.ok);
            const missing = items.filter(i=>!i.ok).map(i=>i.l);
            const pct = Math.round(checks.filter(Boolean).length / checks.length * 100);
            const color = pct >= 80 ? C.sage : pct >= 50 ? C.gold : "#F59E0B";
            return (
              <div style={{margin:"12px 0 4px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:600,color:C.muted}}>Profil Savvy</span>
                  <span style={{fontSize:11,fontWeight:700,color}}>{
                    pct >= 100 ? "✦ Profil complet" :
                    pct >= 80  ? `Presque là — ${pct}%` :
                    pct >= 50  ? `À mi-chemin vers un profil Premium — ${pct}%` :
                    `Encore quelques étapes avant d'être recommandé — ${pct}%`
                  }</span>
                </div>
                <div style={{height:5,background:C.cream3,borderRadius:10,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:10,transition:"width .4s"}}/>
                </div>
                {pct < 100 && (
                  <>
                    <button onClick={()=>{
                      if(authUser?.real){
                        if(!(photoUrl || sbExpertData?.photo_url)) { photoInputRef?.current?.click(); return; }
                        if(!(expOffres || sbExpertData?.phases || []).length) { setOffresOpen(true); return; }
                        if(!Object.values(dispoSelected||{}).some(Boolean)) { setSection("disponibilidades"); return; }
                        setShowEditExpert(true); return;
                      }
                      if(!(expOffres||EXPERT_DATA.offres).length) setOffresOpen(true);
                      else if(!Object.values(dispoSelected||{}).some(Boolean)) setSection("disponibilidades");
                      else setShowEditExpert(true);
                    }} style={{marginTop:8,width:"100%",padding:"8px",borderRadius:10,border:`1px solid ${color}`,background:"transparent",color,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                      Compléter mon profil → {pct}%
                    </button>
                    <div style={{marginTop:5,fontSize:10,color:C.faint,textAlign:"center"}}>
                      {missing.length ? `Il manque : ${missing.join(" · ")}` : "Plus ton profil est complet, plus tu reçois de demandes."}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Boutons d'action */}
          <div style={{display:"flex",gap:8}}>
            {[
              {svg:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,label:"Modifier",action:()=>setShowEditExpert(true)},
              {svg:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></svg>,label:"Mon profil",action:()=>setShowExpertProfile(true)},
              {svg:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,label:"Partager",action:()=>setShowShareModal(true)},
            ].map(btn=>(
              <button key={btn.label} onClick={btn.action} style={{flex:1,padding:"9px 4px",borderRadius:11,border:`1px solid ${C.border}`,background:C.cream2,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,color:C.ink,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                {btn.svg}
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Activité ── */}
        <div style={{background:C.white,overflow:"hidden",marginBottom:8}}>
          <div style={{padding:"18px 20px 6px",fontSize:13,fontWeight:600,color:C.muted,letterSpacing:".4px",textTransform:"uppercase"}}>Activité</div>
          <MenuRowExp icon="📋" title="Mes sessions" sub="Demandes en attente · Planning" badge={expRequests.length>0?expRequests.length:undefined} onClick={()=>setSection("sesiones")}/>
          <MenuRowExp icon="🗓️" title="Disponibilités" sub={(()=>{const n=Object.keys(dispoSelected).filter(k=>dispoSelected[k]).length; return n>0?`${n} jour${n>1?"s":""} ouvert${n>1?"s":""} à la réservation`:"Aucun jour configuré";})()}  onClick={()=>setSection("disponibilidades")}/>
          <MenuRowExp icon="💬" title="Messages clients" sub="Répondre aux clients" onClick={()=>setSection("messages")}/>
          <MenuRowExp icon="💼" title="Mes offres" sub={(expOffres||EXPERT_DATA.offres).length===0?"Aucune offre · Créer la première":`${(expOffres||EXPERT_DATA.offres).length} offre(s) active(s)`} onClick={()=>setOffresOpen(v=>!v)}/>
          {["geraquipu@hotmail.com","german@savvy.fr"].includes(authUser?.email) && <MenuRowExp icon="⚙️" title="Admin Savvy" sub="Utilisateurs · Réservations · Revenue" onClick={()=>onNavigate&&onNavigate("admin")}/>}
        </div>

        {/* Mes offres accordéon (inline, sans carte) */}
        {offresOpen && (
          <div style={{background:C.white,padding:"12px 16px 14px",marginBottom:8,borderTop:`1px solid ${C.borderF}`}}>
            {(expOffres||EXPERT_DATA.offres).length===0 && editingOffer!=="new" && (
              <div style={{textAlign:"center",padding:"16px 0 10px",color:C.muted}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><rect x={2} y={7} width={20} height={14} rx={2}/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg></div>
                <div style={{fontSize:13,fontWeight:600,color:C.ink,marginBottom:4}}>Aucune offre pour le moment</div>
                <div style={{fontSize:12,color:C.muted}}>Crée ta première offre pour recevoir des réservations</div>
              </div>
            )}
            {editingOffer==="new" && (
                <div style={{background:C.goldL,borderRadius:13,border:`1px solid ${C.gold}`,padding:"12px 14px",marginBottom:8}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>✦ Nouvelle offre</div>
                  <OfferEditForm
                    initial={{}}
                    onCancel={()=>{setEditingOffer(null);setEditOfferData({});}}
                    onSave={saved=>{
                      const base = expOffres||EXPERT_DATA.offres;
                      saveOffres([...base,{...saved,icon:"💼"}]);
                      setEditingOffer(null); setEditOfferData({});
                    }}
                  />
                </div>
              )}
              {(expOffres||EXPERT_DATA.offres).map((o,i)=>(
                <div key={i} style={{background:editingOffer===i?C.goldL:C.cream2,borderRadius:13,border:`1px solid ${editingOffer===i?C.gold:C.border}`,padding:"12px 14px",marginBottom:8,transition:"all .2s"}}>
                  {editingOffer===i ? (
                    <OfferEditForm
                      initial={editOfferData}
                      onCancel={()=>{setEditingOffer(null);setEditOfferData({});}}
                      onSave={saved=>{
                        const base = expOffres||EXPERT_DATA.offres;
                        const updated = base.map((x,j)=>j===i?{...x,...saved}:x);
                        saveOffres(updated); setEditingOffer(null); setEditOfferData({});
                      }}
                    />
                  ) : (
                    <div>
                      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1,minWidth:0}}>
                          <div style={{width:34,height:34,borderRadius:10,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.gold,marginTop:1}}>{MENU_ICONS["💼"]}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF,lineHeight:1.35}}>{o.name}</div>
                            <div style={{fontSize:11,color:C.muted,marginTop:3,display:"flex",gap:5,flexWrap:"wrap",alignItems:"center"}}>
                              {(o.formats?o.formats:[o.format]).map(f=>(
                                <span key={f} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:C.cream3,color:C.muted,fontWeight:500}}>
                                  {f==="video"||f?.includes?.("Vidéo")?"Vidéo":f==="audio"||f?.includes?.("audio")?"Audio":f==="doc"||f?.includes?.("Doc")?"Document":"Chat"}
                                </span>
                              ))}
                              {(o.duree||o.what)&&<span style={{fontSize:10,color:C.muted}}>· {o.duree||(o.what?.split(" ").slice(-1)[0])}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{textAlign:"right",flexShrink:0}}>
                          <div style={{fontSize:17,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{o.price}€</div>
                        </div>
                      </div>
                      <div style={{display:"flex",justifyContent:"flex-end"}}>
                        <button onClick={()=>{setEditingOffer(i);setEditOfferData({name:o.name,price:String(o.price),duree:o.duree||"30 min",formats:o.formats||(o.format?.toLowerCase().includes("vid")?["video"]:o.format?.toLowerCase().includes("doc")?["doc"]:["chat"])});}} style={{fontSize:11,color:C.gold,fontWeight:700,background:C.white,border:`1px solid ${C.goldB}`,borderRadius:20,padding:"4px 12px",cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}><svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Modifier</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {editingOffer!=="new" && <button onClick={()=>{setEditingOffer("new");setEditOfferData({});}} style={{width:"100%",padding:"9px",borderRadius:10,border:`1.5px dashed ${C.gold}`,background:"transparent",color:C.gold,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SERIF,marginTop:4}}>+ Ajouter une offre</button>}
          </div>
        )}

        {/* ── Compte ── */}
        <div style={{background:C.white,overflow:"hidden",marginBottom:8}}>
          <div style={{padding:"18px 20px 6px",fontSize:13,fontWeight:600,color:C.muted,letterSpacing:".4px",textTransform:"uppercase"}}>Compte</div>
          <MenuRowExp icon="⚙️" title="Paramètres" sub="Informations personnelles · Notifications" onClick={()=>{setSection("compte");setSubSection("parametres");}}/>
          <MenuRowExp icon="💰" title="Mes revenus" sub="Solde disponible · SEPA · Factures" onClick={()=>{setSection("compte");setSubSection("revenus");}}/>
          <MenuRowExp icon="🤝" title="Mes clients aidés" sub={realClientsCount>0?`${realClientsCount} personne${realClientsCount>1?"s":""} accompagnée${realClientsCount>1?"s":""} grâce à Savvy`:"Personnes que tu as accompagnées"} onClick={()=>{setSection("compte");setSubSection("clients");}}/>
        </div>

        {/* ── Aide ── */}
        <div style={{background:C.white,overflow:"hidden",marginBottom:8}}>
          <div style={{padding:"18px 20px 6px",fontSize:13,fontWeight:600,color:C.muted,letterSpacing:".4px",textTransform:"uppercase"}}>Aide</div>
          <MenuRowExp icon="💬" title="Centre d'aide" sub="Chat avec l'équipe Savvy" onClick={()=>{setSection("aide");setSubSection("centre");}}/>
          <MenuRowExp icon="📋" title="Légal" sub="CGU · Politique de confidentialité" onClick={()=>{setSection("aide");setSubSection("legal");}}/>
          <MenuRowExp icon="⭐" title="Donner votre avis sur Savvy" onClick={()=>{setSection("aide");setSubSection("avis");}}/>
        </div>

        {/* Modal partager profil */}
        {showShareModal && (()=>{
          const [copied, setCopied] = useState(false);
          const doShare = async () => {
            if (navigator.share) {
              try { await navigator.share({title:"Mon profil Savvy", text:"Consulte mon profil conseiller ✦", url:expertProfileUrl}); setShowShareModal(false); return; } catch {}
            }
          };
          const doCopy = () => {
            try { navigator.clipboard.writeText(expertProfileUrl); } catch {}
            setCopied(true); setTimeout(()=>setCopied(false), 2000);
          };
          return (
          <>
            <div onClick={()=>setShowShareModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:200}}/>
            <div onClick={e=>e.stopPropagation()} style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.white,zIndex:201,borderRadius:"20px 20px 0 0",padding:"20px 20px 40px"}}>
              <div style={{width:36,height:4,borderRadius:2,background:"#E5E0D8",margin:"0 auto 18px"}}/>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:18,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Partage ton profil</div>
                <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>Chaque client qui arrive est quelqu'un qui te fait confiance.</div>
              </div>
              {navigator.share && (
                <button onClick={doShare} style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:SERIF,marginBottom:14}}>
                  Partager via mon téléphone →
                </button>
              )}
              <div style={{background:C.cream2,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <span style={{fontSize:12,color:C.muted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{expertProfileUrl}</span>
                <button onClick={doCopy} style={{fontSize:11,fontWeight:700,background:copied?C.sageL:C.goldL,color:copied?C.sage:C.gold,border:`1px solid ${copied?C.sage:C.goldB}`,borderRadius:20,padding:"5px 13px",cursor:"pointer",fontFamily:"inherit",flexShrink:0,transition:"all .2s"}}>
                  {copied ? "✓ Copié !" : "Copier"}
                </button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {[
                  {label:"WhatsApp",   color:"#25D366", url:`https://wa.me/?text=${encodeURIComponent("Consulte mon profil conseiller sur Savvy ✦ "+expertProfileUrl)}`},
                  {label:"Facebook",   color:"#1877F2", url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(expertProfileUrl)}`},
                  {label:"X / Twitter",color:"#000000", url:`https://twitter.com/intent/tweet?text=${encodeURIComponent("Consulte mon profil conseiller sur Savvy ✦")}&url=${encodeURIComponent(expertProfileUrl)}`},
                  {label:"Email",      color:"#6366F1", url:`mailto:?subject=${encodeURIComponent("Mon profil Savvy")}&body=${encodeURIComponent("Bonjour, voici mon profil conseiller : "+expertProfileUrl)}`},
                ].map(s=>(
                  <button key={s.label} onClick={()=>window.open(s.url,"_blank")} style={{padding:"12px 10px",borderRadius:13,border:`1px solid ${C.border}`,background:C.white,cursor:"pointer",fontFamily:SANS,textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                    <div style={{width:36,height:36,borderRadius:10,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                      {s.label==="WhatsApp"?"💬":s.label==="Facebook"?"📘":s.label==="X / Twitter"?"𝕏":"📧"}
                    </div>
                    <span style={{fontSize:10,fontWeight:600,color:C.soft}}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
          );
        })()}
      </div>
    )

}
