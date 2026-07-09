import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { C, SERIF } from '../constants/colors';
import { addBooking, addThread } from '../constants/data';

const ICN = {
  date: <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>,
  time: <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={9}/><polyline points="12 7 12 12 15 15"/></svg>,
  fmt:  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x={1} y={5} width={15} height={14} rx={2}/></svg>,
  eur:  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/></svg>,
  bell: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  card: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={1} y={4} width={22} height={16} rx={2}/><line x1={1} y1={10} x2={23} y2={10}/></svg>,
  msg:  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
};

function SuccessScreen({e, ph, onHome, onMsg, bookingDate, bookingSlot, bookingNote, bookingFormat, bookingDuree, authUser}) {
  const savedRef = useRef(false);
  const [saveError, setSaveError] = useState(null);
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const id = `booking_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    // Combine date + slot time (e.g. "16:00") into a single datetime
    let bookingDateTime = bookingDate ? new Date(bookingDate) : null;
    if (bookingDateTime && bookingSlot) {
      const [h, m] = bookingSlot.split(":").map(Number);
      if (!isNaN(h)) { bookingDateTime.setHours(h, m || 0, 0, 0); }
    }
    const hoursUntil = bookingDateTime ? Math.max(1, Math.round((bookingDateTime - new Date()) / 3600000)) : 48;
    const dateStr = bookingDateTime
      ? bookingDateTime.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})
      : "À confirmer";
    const bookingData = {
      id,
      expertId: e.id,
      expertInitials: e.initials,
      expertName: e.name,
      expertBg: e.bg,
      expertCol: e.color,
      phase: ph?.name || "Session conseil",
      format: bookingFormat || ph?.format || "Vidéo",
      date: dateStr,
      slot: bookingSlot || "À confirmer",
      duration: bookingDuree || ph?.duree || (ph?.format?.includes("30")?"30 min":ph?.format?.includes("2h")?"2h":"1h"),
      price: ph?.price || 0,
      status: "pending",
      topic: (bookingNote && bookingNote.trim()) ? bookingNote.trim() : `${ph?.name||"Session"} – ${e.name.split(" ")[0]}`,
      timestamp: Date.now(),
      hoursUntil,
    };
    addBooking(bookingData);
    // Sauvegarder dans Supabase si utilisateur réel
    if (authUser?.real && authUser?.id) {
      const expertId = typeof e.id === "string" && e.id.includes("-") ? e.id : null;
      if (expertId) {
        (async () => {
          let { data: inserted, error } = await supabase.from("bookings").insert({
            client_id: authUser.id,
            expert_id: expertId,
            phase_name: bookingData.phase,
            phase_price: bookingData.price,
            status: "pending",
            date_session: bookingDateTime ? bookingDateTime.toISOString() : null,
            notes: bookingData.topic,
            session_format: bookingData.format,
            session_duration: bookingData.duration,
          }).select().single();
          if (error && /session_format|session_duration|column/.test(error.message||"")) {
            // Colonnes pas encore créées → retente sans elles
            ({ data: inserted, error } = await supabase.from("bookings").insert({
              client_id: authUser.id, expert_id: expertId,
              phase_name: bookingData.phase, phase_price: bookingData.price,
              status: "pending", date_session: bookingDateTime ? bookingDateTime.toISOString() : null,
              notes: bookingData.topic,
            }).select().single());
          }
          if (error) {
            console.warn("Booking Supabase:", error.message);
            setSaveError("La réservation n'a pas pu être enregistrée (" + error.message + "). Contactez le support.");
            return;
          }
          // Notifier l'expert (email + push) de la nouvelle demande
          supabase.functions.invoke("notify-booking", { body: { record: inserted, type: "INSERT" } }).catch(()=>{});
          // Envoyer le message du client dans la boîte de l'expert (s'il en a écrit un)
          if (bookingNote && bookingNote.trim()) {
            let receiverId = e.user_id || null;
            if (!receiverId) {
              const { data: exp } = await supabase.from("experts").select("user_id").eq("id", expertId).single();
              receiverId = exp?.user_id || null;
            }
            if (receiverId) {
              const { error: mErr } = await supabase.from("messages").insert({
                sender_id: authUser.id,
                receiver_id: receiverId,
                expert_id: expertId,
                content: bookingNote.trim(),
              });
              if (mErr) console.warn("Message initial Supabase:", mErr.message);
            }
          }
        })();
      }
    }
    addThread({
      id: `thread_${e.initials}_${Date.now()}`,
      expertId: e.id,
      expertInitials: e.initials,
      expertName: e.name,
      expertBg: e.bg,
      expertCol: e.color,
      lastMsg: `Demande de session : ${ph?.name||"conseil"}`,
      time: "À l'instant",
      unread: 0,
      timestamp: Date.now(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.cream, paddingBottom:36 }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"52px 24px 36px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(110,139,61,.08)" }}/>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,.08)", border:"1.5px solid rgba(255,255,255,.2)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
        </div>
        <h1 style={{ fontSize:22, fontWeight:700, color:"white", fontFamily:SERIF, margin:"0 0 8px", letterSpacing:"-.2px" }}>
          Demande envoyée ✦
        </h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,.65)", margin:"0", lineHeight:1.7 }}>
          Votre demande a été transmise à <strong style={{color:"rgba(255,255,255,.9)"}}>{e.name.split(" ")[0]}</strong>.<br/>
          Vous serez notifié dès qu'il répondra.
        </p>
      </div>

      <div style={{ padding:"20px 20px 0" }}>
        {saveError && (
          <div style={{ background:"#FEF2F2", borderRadius:13, padding:"11px 14px", marginBottom:14, border:"1px solid #FCA5A5", display:"flex", gap:9, alignItems:"center" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
            <span style={{ fontSize:12, color:"#B91C1C", lineHeight:1.5 }}>{saveError}</span>
          </div>
        )}
        {/* Réponse attendue */}
        {(()=>{ const rt=e.metrics?.find(m=>m.label?.includes("réponse")||m.label?.includes("response")); return rt ? (
          <div style={{ background:"#FFFBEB", borderRadius:13, padding:"11px 14px", marginBottom:14, border:"1px solid #FDE68A", display:"flex", gap:9, alignItems:"center" }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize:12, color:"#92400E", lineHeight:1.5 }}>⚡ Répond généralement <strong>{rt.value}</strong></span>
          </div>
        ) : null; })()}

        {/* Récap demande */}
        <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:14, boxShadow:`0 2px 12px ${C.sh}` }}>
          <div style={{ height:4, background:`linear-gradient(90deg,${e.color},${e.bg})` }}/>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:e.bg, color:e.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{e.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{e.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>{e.role?.split("·")[0]?.trim()}</div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:"#92400E", background:"#FEF3C7", borderRadius:20, padding:"3px 10px" }}>En attente</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { icon:"date", label:"Date proposée", value: bookingDate ? bookingDate.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"}) : "À confirmer" },
                { icon:"time", label:"Créneau", value: bookingSlot || "À confirmer" },
                { icon:"fmt", label:"Format", value: ph?.format || "Vidéo" },
                { icon:"eur", label:"Si accepté", value: ph?.price ? `${ph.price}€` : "Devis" },
              ].map(item => (
                <div key={item.label} style={{ background:C.cream2, borderRadius:10, padding:"9px 11px" }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:2, display:"flex", alignItems:"center", gap:4 }}>{ICN[item.icon]} {item.label}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.ink }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ce qui se passe ensuite */}
        <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:12 }}>Et ensuite ?</div>
          {[
            { icon:"bell", text:`Vous recevrez une notification quand ${e.name.split(" ")[0]} accepte.` },
            { icon:"card", text:"Le paiement n'est demandé qu'après l'acceptation de l'expert." },
            { icon:"msg", text:`Écrivez à ${e.name.split(" ")[0]} pour plus de précisions.` },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:i<2?10:0 }}>
              <span style={{ flexShrink:0, color:C.gold, display:"flex", marginTop:1 }}>{ICN[s.icon]}</span>
              <span style={{ fontSize:12, color:C.soft, lineHeight:1.55 }}>{s.text}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={() => onMsg(e)} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:C.ink, color:C.white, fontFamily:SERIF, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Écrire à {e.name.split(" ")[0]}
          </button>
          <button onClick={onHome} style={{ width:"100%", padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:14, background:C.white, color:C.ink, fontFamily:"inherit" }}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessScreen;
