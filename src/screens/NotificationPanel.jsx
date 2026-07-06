import React from 'react';
import { C, SERIF } from '../constants/colors';

function NotificationPanel({ onClose, onNavigate, isExpert, readNotifIds=[], onMarkRead, isNewExpert=false, expRequestsCount=0, unreadMsgsCount=0, isRealUser=false, pendingPayCount=0 }) {
  const NIcon = {
    msg:  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    bell: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    star: <svg width={16} height={16} viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>,
    euro: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    check:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    info: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>,
    user: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>,
  };
  // Utilisateurs réels → notifications basées sur des signaux réels (pas de démo)
  const buildRealNotifs = () => {
    const out = [];
    if (unreadMsgsCount > 0) out.push({ id:"real-msg", svg:NIcon.msg, title:`${unreadMsgsCount} message${unreadMsgsCount>1?"s":""} non lu${unreadMsgsCount>1?"s":""}`, sub:"Consulte tes échanges", time:"Récemment", screen:"messages" });
    if (isExpert && expRequestsCount > 0) out.push({ id:"real-req", svg:NIcon.bell, title:`${expRequestsCount} demande${expRequestsCount>1?"s":""} de session en attente`, sub:"Réponds vite pour augmenter ton taux d'acceptation", time:"Récemment", screen:"exp-sessions" });
    if (!isExpert && pendingPayCount > 0) out.push({ id:"real-pay", svg:NIcon.euro, title:`${pendingPayCount} session${pendingPayCount>1?"s":""} à finaliser`, sub:"Confirme le paiement pour valider ta session", time:"Récemment", screen:"reservations" });
    return out;
  };

  const NOTIFS_DATA = isRealUser ? buildRealNotifs() : isNewExpert ? [
    { id:1, svg:NIcon.user,  title:"Bienvenue sur Savvy !",           sub:"Ton profil est en cours de validation · 24-48h", time:"À l'instant",   screen:"profile" },
    { id:2, svg:NIcon.check, title:"Profil créé avec succès",          sub:"Complète ta bio et ajoute une photo pour 3× plus de visibilité", time:"À l'instant", screen:"profile" },
    { id:3, svg:NIcon.info,  title:"Conseil : fixe tes disponibilités",sub:"Les experts avec des créneaux visibles reçoivent 5× plus de demandes", time:"Il y a 1 min", screen:"profile" },
  ] : isExpert ? [
    { id:1, svg:NIcon.msg,   title:unreadMsgsCount>0?`${unreadMsgsCount} message${unreadMsgsCount>1?"s":""} non lu${unreadMsgsCount>1?"s":""}` :"Nouveau message de Sophie M.", sub:unreadMsgsCount>0?"Consultez vos messages clients":"Bonjour, j'aimerais un conseil sur ma reconversion...", time:"Il y a 5 min", screen:"messages" },
    { id:2, svg:NIcon.bell,  title:expRequestsCount>0?`${expRequestsCount} demande${expRequestsCount>1?"s":""} de session en attente`:"Nouvelle demande de session", sub:expRequestsCount>0?`Réponds rapidement pour augmenter ton taux d'acceptation`:"Nadia Kouki · Jeudi 11h00 · 45 min · Appel", time:"Il y a 2h", screen:"exp-sessions" },
    { id:3, svg:NIcon.star,  title:"Nouvel avis reçu",                sub:"Sophie Martin vous a laissé 5 étoiles",               time:"Hier",           screen:"exp-compte"   },
    { id:4, svg:NIcon.euro,  title:"Virement disponible",             sub:"245€ prêts à être virés sur votre IBAN",              time:"Il y a 2 jours", screen:"exp-compte"   },
  ] : [
    { id:1, svg:NIcon.euro,  title:"Sophie a accepté ta demande !",  sub:"Procède au paiement pour confirmer ta session · 45€",  time:"Il y a 5 min",   screen:"reservations", cta:"pay" },
    { id:2, svg:NIcon.msg,   title:"Nouveau message de Clément",     sub:"Je vous recommande l'Hôtel du Louvre...",             time:"Il y a 2h",       screen:"messages"    },
    { id:3, svg:NIcon.star,  title:"Laisse un avis",                 sub:"Ta session avec Marie Aubert est terminée",           time:"Hier",            screen:"reservations" },
    { id:4, svg:NIcon.user,  title:"Nouveau conseiller disponible",  sub:"Lucas Bertrand vient de rejoindre Savvy",             time:"Il y a 2 jours",  screen:"search"       },
  ];
  const readIds = readNotifIds;
  const markRead    = (id) => onMarkRead && onMarkRead(prev => prev.includes(id) ? prev : [...prev, id]);
  const markAllRead = ()   => onMarkRead && onMarkRead(NOTIFS_DATA.map(n => n.id));
  const unreadCount = NOTIFS_DATA.filter(n => !readIds.includes(n.id)).length;

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:40, background:"rgba(0,0,0,.15)" }}/>
      <div onClick={e=>e.stopPropagation()} style={{ position:"fixed", top:58, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:50, boxShadow:`0 8px 32px ${C.shM}`, borderRadius:"0 0 18px 18px", border:`1px solid ${C.border}`, borderTop:"none", overflow:"hidden" }}>
        <div style={{ padding:"14px 16px 10px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${C.borderF}` }}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Notifications</span>
            {unreadCount>0 && <span style={{background:C.gold,color:C.white,borderRadius:20,padding:"1px 7px",fontSize:10,fontWeight:700}}>{unreadCount}</span>}
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:20, lineHeight:1 }}>×</button>
        </div>
        {NOTIFS_DATA.length === 0 && (
          <div style={{ padding:"40px 24px", textAlign:"center" }}>
            <div style={{ width:48, height:48, borderRadius:14, background:C.cream2, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", color:C.faint }}>{NIcon.bell}</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:5 }}>Pas de notification</div>
            <div style={{ fontSize:12, color:C.muted, lineHeight:1.5 }}>Tu seras notifié ici dès qu'il se passe quelque chose sur ton compte.</div>
          </div>
        )}
        {NOTIFS_DATA.map(n => {
          const isRead = readIds.includes(n.id);
          return (
            <div key={n.id} onClick={() => { markRead(n.id); onNavigate && onNavigate(n.screen); onClose(); }}
              style={{ display:"flex", gap:12, padding:"12px 16px", borderBottom:`1px solid ${C.borderF}`, background:isRead?C.white:C.cream2, cursor:"pointer", transition:"background .2s" }}>
              <div style={{ width:36, height:36, borderRadius:10, background:isRead?C.cream3:C.goldL, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:isRead?C.faint:C.gold }}>{n.svg}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:isRead?400:700, color:isRead?C.muted:C.ink, marginBottom:2 }}>{n.title}</div>
                <div style={{ fontSize:11, color:C.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.sub}</div>
                <div style={{ fontSize:10, color:C.faint, marginTop:3 }}>{n.time}</div>
              </div>
              {!isRead && <div style={{ width:8, height:8, borderRadius:"50%", background:C.gold, flexShrink:0, marginTop:4 }}/>}
            </div>
          );
        })}
        <div style={{ padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          {unreadCount>0
            ? <button onClick={markAllRead} style={{ fontSize:12, color:C.gold, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>✓ Tout marquer comme lu</button>
            : <span style={{ fontSize:12, color:C.faint }}>✓ Tout est lu</span>
          }
          <button onClick={onClose} style={{ fontSize:12, color:C.muted, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Fermer</button>
        </div>
      </div>
    </>
  );
}

export default NotificationPanel;
