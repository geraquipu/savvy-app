import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { C, SERIF } from '../constants/colors';
import { EXPERTS, getBookings, updateBooking, addBooking, getCountdown } from '../constants/data';
import { SESSIONS_AVENIR, SESSIONS_PASSEES, SESSIONS_ANNULEES } from '../constants/sessionData';
import { LoginGate } from '../components/ui';
import { DOMAIN } from '../constants/company';
import { MENU_ICONS, FormatIcon } from '../constants/menuIcons.jsx';

function CalendarPicker({ expert, onDone, onSelect }) {
  const today = new Date();
  const [selDate, setSelDate] = useState(null);
  const [selSlot, setSelSlot] = useState(null);
  const [done, setDone] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [bookedSlots, setBookedSlots] = useState({}); // { "2026-06-25": ["09:00","10:00"] }

  // Load already-booked slots for this expert from Supabase
  useEffect(() => {
    if (!expert?.id) return;
    const from = new Date();
    from.setHours(0,0,0,0);
    supabase.from("bookings")
      .select("date_session")
      .eq("expert_id", expert.id)
      .in("status", ["pending","confirmed"])
      .gte("date_session", from.toISOString())
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach(b => {
          if (!b.date_session) return;
          const key = b.date_session.slice(0,10);
          if (!map[key]) map[key] = [];
          const t = new Date(b.date_session).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
          if (t) map[key].push(t);
        });
        setBookedSlots(map);
      });
  }, [expert?.id]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const DAYS = ["Lu","Ma","Me","Je","Ve","Sa","Di"];

  const _readDispo = (suffix) => { try { const v = localStorage.getItem(`savvy_dispo_days_${suffix}`); return v ? JSON.parse(v) : null; } catch { return null; } };
  const _readDispoH = (suffix) => { try { const v = localStorage.getItem(`savvy_dispo_hours_${suffix}`); return v ? JSON.parse(v) : null; } catch { return null; } };
  const savedDays  = _readDispo(expert?.initials) || _readDispo(expert?.id) || {};
  const savedHours = _readDispoH(expert?.initials) || _readDispoH(expert?.id) || {};
  const hasDispo = Object.values(savedDays).some(v=>v);

  const fmtKey = (d) => d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");

  const isAvail = (d) => {
    if (!d) return false;
    const cmp = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d <= cmp) return false;
    if (!hasDispo) {
      // fallback demo: weekdays only
      const day = d.getDay();
      return day !== 0 && day !== 6;
    }
    return !!savedDays[fmtKey(d)];
  };

  const getSlots = (d) => {
    if (!d) return [];
    if (!hasDispo) return ["09:00","10:00","11:00","14:00","15:00","16:00"];
    const key = fmtKey(d);
    const range = savedHours[key] || "09:00-18:00";
    const [startStr, endStr] = range.split("-");
    const [sh, sm] = startStr.split(":").map(Number);
    const [eh, em] = endStr.split(":").map(Number);
    const slots = [];
    let cur = sh * 60 + (sm||0);
    const end = eh * 60 + (em||0);
    while (cur + 30 <= end) {
      slots.push(String(Math.floor(cur/60)).padStart(2,"0")+":"+String(cur%60).padStart(2,"0"));
      cur += 30;
    }
    return slots;
  };

  if (done) return (
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><span style={{width:52,height:52,borderRadius:"50%",background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg></span></div>
      <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Proposition envoyée !</div>
      <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:20 }}>
        Tu as proposé le <b style={{ color:C.ink }}>{selDate?.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</b> à <b style={{ color:C.ink }}>{selSlot}</b>.<br/>
        En attente de confirmation par {expert.name.split(" ")[0]}.
      </div>
      <button onClick={onDone} style={{ width:"100%", padding:"13px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:SERIF }}>Parfait !</button>
    </div>
  );

  return (
    <div>
      {/* Expert availability banner */}
      {expert && (
        <div style={{ display:"flex", alignItems:"center", gap:9, background:C.sageL, borderRadius:11, padding:"9px 13px", marginBottom:12, border:"1px solid rgba(16,185,129,.2)" }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, flexShrink:0 }}>{expert.initials}</div>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:C.sage }}>Disponibilités de {expert.name.split(" ")[0]}</div>
            <div style={{ fontSize:10, color:C.sage, marginTop:1 }}>Les jours verts sont ses créneaux libres · Temps de réponse {expert.metrics?.[3]?.value||"< 4h"}</div>
          </div>
        </div>
      )}
      {/* Header mois */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <button onClick={() => { const prev = new Date(year, month-1, 1); const now = new Date(today.getFullYear(), today.getMonth(), 1); if (prev >= now) setViewMonth(prev); }} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", opacity:(month===today.getMonth()&&year===today.getFullYear())?0.3:1 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{MONTHS[month]} {year}</span>
        <button onClick={() => setViewMonth(new Date(year, month+1, 1))} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
      {/* Jours */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:4 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontSize:10, fontWeight:600, color:C.muted, padding:"4px 0" }}>{d}</div>)}
      </div>
      {/* Grille */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:16 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i}/>;
          const avail = isAvail(d);
          const sel = d && selDate && d.toDateString() === selDate.toDateString();
          return (
            <div key={i} onClick={() => { if(avail){ setSelDate(d); setSelSlot(null); }}} style={{ aspectRatio:"1", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"50%", cursor:avail?"pointer":"default", background:sel?C.ink:"transparent", position:"relative" }}>
              <span style={{ fontSize:12, fontWeight:sel?700:avail?500:400, color:sel?C.white:avail?C.ink:"#D6D0C8" }}>{d.getDate()}</span>
              {avail && !sel && <div style={{ position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)", width:4, height:4, borderRadius:"50%", background:C.sage }}/>}
            </div>
          );
        })}
      </div>
      {/* Créneaux */}
      {selDate && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:9 }}>
            {selDate.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {getSlots(selDate).map(s => {
              const dateKey = selDate.getFullYear()+"-"+String(selDate.getMonth()+1).padStart(2,"0")+"-"+String(selDate.getDate()).padStart(2,"0");
              const isBooked = (bookedSlots[dateKey]||[]).includes(s);
              const isSel = selSlot===s;
              return (
                <button key={s}
                  onClick={() => { if(isBooked) return; setSelSlot(s); if(onSelect) onSelect({date:selDate, slot:s}); }}
                  disabled={isBooked}
                  title={isBooked ? "Créneau déjà réservé" : ""}
                  style={{
                    padding:"9px 18px", borderRadius:11, fontSize:14, fontWeight:700, fontFamily:SERIF,
                    cursor: isBooked ? "not-allowed" : "pointer",
                    border: `2px solid ${isBooked ? C.border : isSel ? C.ink : C.border}`,
                    background: isBooked ? C.cream3 : isSel ? C.ink : C.white,
                    color: isBooked ? C.faint : isSel ? C.white : C.ink,
                    textDecoration: isBooked ? "line-through" : "none",
                    opacity: isBooked ? 0.5 : 1,
                    position:"relative",
                  }}>
                  {s}
                  {isBooked && <span style={{position:"absolute",top:-6,right:-6,background:"#EF4444",color:"#fff",fontSize:8,fontWeight:800,borderRadius:20,padding:"1px 4px"}}>Pris</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Only show button in standalone mode (no onSelect parent) */}
      {!onSelect && (
        <button
          onClick={() => { if(!selDate||!selSlot){ alert("Sélectionne une date et un créneau."); return; } setDone(true); }}
          style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:14,
            background:selDate&&selSlot?C.ink:C.cream3,
            color:selDate&&selSlot?C.white:C.muted,
            fontFamily:SERIF }}>
          {selDate && selSlot ? `Proposer le ${selDate.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} à ${selSlot} →` : "Sélectionne une date →"}
        </button>
      )}
    </div>
  );
}

function CancelModal({ session, onClose, onMsg }) {
  const [step, setStep] = useState("menu");
  const [newBooking, setNewBooking] = useState({ date:null, slot:null });

  const expert = session?.expert;
  if (!expert) return null;

  const backdropClick = () => {
    if (step === "menu" || step === "done_reprog") onClose(false);
    if (step === "done_cancel") onClose(true);
    else setStep("menu");
  };

  return (
    <>
      <div onClick={backdropClick} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", maxHeight:"88vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* ── Menu ─────────────────────────────────────────────────────────── */}
        {step === "menu" && <>
          <div style={{ padding:"20px 20px 0", flexShrink:0 }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 18px" }}/>
            <div style={{ fontSize:17, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:4 }}>Gérer cette session</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.5 }}>
              <b style={{ color:C.ink }}>{expert.name}</b> · {session.date} à {session.time}
            </div>
          </div>
          <div style={{ padding:"0 20px 30px", display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={() => setStep("reprog")} style={{ width:"100%", padding:"14px 16px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, background:C.ink, color:C.white, fontFamily:"inherit", display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
              <span style={{ display:"flex", opacity:.85 }}>{MENU_ICONS["🔁"]}</span>
              <div>
                <div style={{ fontFamily:SERIF }}>Reprogrammer</div>
                <div style={{ fontSize:11, fontWeight:400, opacity:.7, marginTop:1 }}>Proposer une nouvelle date</div>
              </div>
            </button>
            <button onClick={() => { onMsg && onMsg(expert, "reservations"); onClose(); }} style={{ width:"100%", padding:"13px 16px", borderRadius:13, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ display:"flex", color:C.soft }}>{MENU_ICONS["💬"]}</span>
              <div style={{ textAlign:"left" }}>
                <div>Envoyer un message</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Parler à {expert.name.split(" ")[0]}</div>
              </div>
            </button>
            <button onClick={() => setStep("cancel_confirm")} style={{ width:"100%", padding:"13px 16px", borderRadius:13, border:"1.5px solid #FEE2E2", cursor:"pointer", fontWeight:600, fontSize:13, background:"#FFF5F5", color:"#B91C1C", fontFamily:"inherit", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ display:"flex", color:"#B91C1C" }}>{MENU_ICONS["❌"]}</span>
              <div style={{ textAlign:"left" }}>
                <div>Annuler la session</div>
                <div style={{ fontSize:11, color:"#EF4444", marginTop:1 }}>Remboursement selon délai de préavis</div>
              </div>
            </button>
          </div>
        </>}

        {/* ── Reprogrammer ─────────────────────────────────────────────────── */}
        {step === "reprog" && <>
          <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 14px" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button onClick={() => setStep("menu")} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Proposer une nouvelle date</div>
                <div style={{ fontSize:11, color:C.muted }}>avec {expert.name.split(" ")[0]}</div>
              </div>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 18px 20px" }}>
            <div style={{ fontSize:12, color:C.gold, background:C.goldL, borderRadius:11, padding:"10px 13px", border:`1px solid ${C.goldB}`, marginBottom:14, lineHeight:1.6 }}>
              Ta proposition sera envoyée à {expert.name.split(" ")[0]} pour confirmation.
            </div>
            <CalendarPicker expert={expert} onSelect={({date,slot}) => setNewBooking({date,slot})}/>
            <button onClick={async () => {
              if (!newBooking.date || !newBooking.slot) { alert("Choisis une date et un créneau."); return; }
              // Réservation réelle → mettre à jour la date et repasser en attente de confirmation
              if (session._fromSB && session.id) {
                const [h, m] = newBooking.slot.split(":").map(Number);
                const dt = new Date(newBooking.date); dt.setHours(h||0, m||0, 0, 0);
                // Enregistre l'ancien créneau pour signaler une reprogrammation
                const prevIso = session.startTs ? new Date(session.startTs).toISOString() : null;
                let { error } = await supabase.from("bookings").update({ date_session: dt.toISOString(), status: "pending", reschedule_from: prevIso }).eq("id", session.id);
                if (error) { ({ error } = await supabase.from("bookings").update({ date_session: dt.toISOString(), status: "pending" }).eq("id", session.id)); }
                if (error) { alert("Erreur : " + error.message); return; }
              }
              setStep("done_reprog");
            }} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:SERIF, marginTop:8,
              background: newBooking.date && newBooking.slot ? C.gold : C.cream3,
              color: newBooking.date && newBooking.slot ? C.white : C.muted }}>
              {newBooking.date && newBooking.slot
                ? `Proposer le ${newBooking.date.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} à ${newBooking.slot}`
                : "Sélectionne une date →"}
            </button>
          </div>
        </>}

        {/* ── Confirmer annulation ──────────────────────────────────────────── */}
        {step === "cancel_confirm" && <>
          <div style={{ padding:"20px 20px 0", flexShrink:0 }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 16px" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <button onClick={() => setStep("menu")} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div style={{ fontSize:16, fontWeight:700, color:"#B91C1C", fontFamily:SERIF }}>Annuler la session ?</div>
            </div>
          </div>
          <div style={{ padding:"0 20px 30px", flex:1 }}>
            <div style={{ background:"#FFF5F5", borderRadius:13, padding:"14px", marginBottom:14, border:"1px solid #FEE2E2" }}>
              <div style={{ fontSize:13, color:"#7F1D1D", lineHeight:1.7 }}>
                Session avec <b>{expert.name}</b> · <b>{session.date} à {session.time}</b>
              </div>
            </div>
            <div style={{ background:C.cream2, borderRadius:11, padding:"11px 13px", marginBottom:20, fontSize:12, color:C.muted, lineHeight:1.6 }}>
              ℹ️ {expert.name.split(" ")[0]} sera informé de l\'annulation. Remboursement automatique si +24h avant la session.
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setStep("menu")} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:700, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit" }}>← Retour</button>
              <button onClick={() => setStep("done_cancel")} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:13, background:"#B91C1C", color:C.white, fontFamily:SERIF }}>Confirmer l'annulation</button>
            </div>
          </div>
        </>}

        {/* ── Reprog OK ────────────────────────────────────────────────────── */}
        {step === "done_reprog" && (
          <div style={{ padding:"32px 22px 36px", textAlign:"center" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 22px" }}/>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><span style={{width:60,height:60,borderRadius:"50%",background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg></span></div>
            <div style={{ fontSize:18, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Session reprogrammée !</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:6 }}>
              Nouvelle date proposée :<br/>
              <b style={{ color:C.ink }}>{newBooking.date?.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</b> à <b style={{ color:C.ink }}>{newBooking.slot}</b>
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:24 }}>En attente de confirmation par {expert.name.split(" ")[0]}</div>
            <button onClick={() => onClose(false)} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:C.ink, color:C.white, fontFamily:SERIF }}>Parfait !</button>
          </div>
        )}

        {/* ── Cancel OK ────────────────────────────────────────────────────── */}
        {step === "done_cancel" && (
          <div style={{ padding:"32px 22px 36px", textAlign:"center" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 22px" }}/>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><span style={{width:60,height:60,borderRadius:"50%",background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg></span></div>
            <div style={{ fontSize:18, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Session annulée</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:14 }}>
              Ta session avec {expert.name.split(" ")[0]} a été annulée.<br/>
              {expert.name.split(" ")[0]} vient d\'en être informé(e).
            </div>
            <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:12, padding:"11px 14px", marginBottom:22, fontSize:12, color:"#166534", lineHeight:1.6 }}>
              Si tu avais déjà payé, ton remboursement est traité automatiquement sous 5 à 10 jours ouvrés.
            </div>
            <button onClick={() => onClose(true)} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:C.ink, color:C.white, fontFamily:SERIF }}>Compris</button>
          </div>
        )}
      </div>
    </>
  );
}

function ReviewModal({ session, onClose, authUser, onExpert }) {
  const [q1, setQ1] = useState(null); // "oui" | "partiel" | "non"
  const [q2, setQ2] = useState(null); // "oui" | "non"
  const [q3, setQ3] = useState(0);   // 1–5
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const isComplete = q1 !== null && q2 !== null && q3 > 0;

  const handleSubmit = async () => {
    if (!isComplete) { alert("Réponds aux 3 questions pour continuer."); return; }
    setSaving(true);
    if (authUser?.real && session.expert?.id) {
      await supabase.from("reviews").insert({
        expert_id: session.expert.id,
        client_id: authUser.id,
        booking_id: session.bookingId || null,
        stars: q3,
        text: text.trim() || null,
        client_name: authUser.name || "Client",
      });
    }
    setSaving(false);
    setDone(true);
  };

  if (done) return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", padding:"32px 22px 40px", textAlign:"center" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 22px" }}/>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <div style={{ width:56, height:56, borderRadius:"50%", background:C.goldL, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill={C.goldB} stroke="none"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.5l7.1-.6z"/></svg>
          </div>
        </div>
        <div style={{ fontSize:20, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:10 }}>Merci pour ton retour !</div>
        <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:14 }}>
          {session.expert?.name?.split(" ")[0]} appréciera ton avis — et tu aides les prochains à choisir le bon expert.
        </div>
        <div style={{ background:C.goldL, borderRadius:13, padding:"11px 14px", marginBottom:20, border:`1px solid ${C.goldB}`, fontSize:12, color:C.gold, lineHeight:1.6 }}>
          Ton évaluation alimente le Savvy Trust Score de la communauté.
        </div>
        {/* Prolonger l'élan : re-réserver ou recommander */}
        <button onClick={()=>{ onClose(); onExpert && onExpert(session.expert); }} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:SERIF, marginBottom:10 }}>
          Réserver de nouveau avec {session.expert?.name?.split(" ")[0]}
        </button>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={async ()=>{
            const url = `https://getsavvy.fr/p/${session.expert?.id}`;
            const first = (session.expert?.name||"").split(" ")[0];
            try { if (navigator.share) { await navigator.share({ title:`${session.expert?.name} sur Savvy`, text:`Je te recommande ${first} sur Savvy`, url }); return; } } catch {}
            try { await navigator.clipboard.writeText(url); alert("Lien du profil copié !"); } catch {}
          }} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, background:C.white, color:C.ink, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={18} cy={5} r={3}/><circle cx={6} cy={12} r={3}/><circle cx={18} cy={19} r={3}/><line x1={8.6} y1={13.5} x2={15.4} y2={17.5}/><line x1={15.4} y1={6.5} x2={8.6} y2={10.5}/></svg>
            Recommander
          </button>
          <button onClick={onClose} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, background:C.white, color:C.muted, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
            Fermer
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ padding:"20px 20px 0", position:"sticky", top:0, background:C.white, zIndex:1 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 16px" }}/>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16, paddingBottom:14, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:46, height:46, borderRadius:"50%", background:session.expert?.bg, color:session.expert?.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:17, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{session.expert?.initials}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Évaluer {session.expert?.name?.split(" ")[0]}</div>
              <div style={{ fontSize:11, color:C.muted }}>Session du {session.date}</div>
            </div>
          </div>
        </div>

        <div style={{ padding:"0 20px 28px" }}>

          {/* Note en étoiles — action principale */}
          <div style={{ textAlign:"center", marginBottom:22, paddingTop:2 }}>
            <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:14 }}>
              Comment s'est passée la session ?
            </div>
            <div style={{ display:"flex", gap:6, justifyContent:"center" }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={()=>setQ3(s)} onMouseEnter={()=>setHovered(s)} onMouseLeave={()=>setHovered(0)}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:3, transition:"transform .15s", transform:s<=(hovered||q3)?"scale(1.18)":"scale(1)" }}>
                  <svg width={44} height={44} viewBox="0 0 24 24" fill={s<=(hovered||q3)?"#B8864A":"#E7E2D9"}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </button>
              ))}
            </div>
            {q3 > 0 && <div style={{ fontSize:13, color:C.gold, fontWeight:700, marginTop:10 }}>
              {["","Décevant","Peut mieux faire","Correct","Très bien","Excellent !"][q3]}
            </div>}
            <div style={{ fontSize:11, color:C.faint, marginTop:6 }}>Ta note publique sur le profil de {session.expert?.name?.split(" ")[0]}</div>
          </div>

          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:12, borderTop:`1px solid ${C.borderF}`, paddingTop:16 }}>Pour affiner ton avis</div>

          {/* Q1 — Résolution du problème */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:4 }}>
              {session.expert?.name?.split(" ")[0]} a-t-il résolu ton problème ?
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>La question la plus importante.</div>
            <div style={{ display:"flex", gap:8 }}>
              {[
                {v:"oui",    l:"Oui, complètement",   bg:"#D1FAE5", border:"rgba(5,150,105,.4)",  color:"#065F46"},
                {v:"partiel",l:"Partiellement",        bg:"#FEF3C7", border:"rgba(217,119,6,.4)",  color:"#92400E"},
                {v:"non",    l:"Non",                   bg:"#FEE2E2", border:"rgba(185,28,28,.4)",  color:"#B91C1C"},
              ].map(opt => (
                <button key={opt.v} onClick={()=>setQ1(opt.v)}
                  style={{ flex:1, padding:"10px 6px", borderRadius:12, border:`2px solid ${q1===opt.v?opt.border:"transparent"}`, background:q1===opt.v?opt.bg:C.cream2, cursor:"pointer", fontFamily:"inherit", fontSize:10, fontWeight:q1===opt.v?700:500, color:q1===opt.v?opt.color:C.muted, textAlign:"center", lineHeight:1.4, transition:"all .2s" }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Q2 — Expérience réelle */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:4 }}>
              Avait-il une expérience réelle sur le sujet ?
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>Pas une formation — une vraie expérience vécue.</div>
            <div style={{ display:"flex", gap:8 }}>
              {[
                {v:"oui", l:"Oui, clairement", bg:"#D1FAE5", border:"rgba(5,150,105,.4)", color:"#065F46"},
                {v:"non",  l:"Je ne sais pas",  bg:"#FEE2E2", border:"rgba(185,28,28,.4)", color:"#B91C1C"},
              ].map(opt => (
                <button key={opt.v} onClick={()=>setQ2(opt.v)}
                  style={{ flex:1, padding:"12px 10px", borderRadius:12, border:`2px solid ${q2===opt.v?opt.border:"transparent"}`, background:q2===opt.v?opt.bg:C.cream2, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:q2===opt.v?700:500, color:q2===opt.v?opt.color:C.muted, textAlign:"center", transition:"all .2s" }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Commentaire optionnel */}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:.5 }}>
              Commentaire <span style={{ fontWeight:400, textTransform:"none" }}>(optionnel)</span>
            </label>
            <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Partage ce qui t\'a le plus aidé..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, resize:"none", height:66, boxSizing:"border-box", outline:"none", background:C.cream2, lineHeight:1.6 }}/>
          </div>

          {/* Indicateur Trust Score */}
          {isComplete && (
            <div style={{ background:C.goldL, borderRadius:12, padding:"10px 13px", marginBottom:16, border:`1px solid ${C.goldB}`, fontSize:11, color:C.gold, lineHeight:1.6 }}>
              ✦ Ton évaluation va {q1==="oui"?"augmenter":q1==="partiel"?"légèrement affecter":"réduire"} le Trust Score de {session.expert?.name?.split(" ")[0]}.
            </div>
          )}

          <div style={{ display:"flex", gap:9 }}>
            <button onClick={onClose} style={{ flex:1, padding:"13px", borderRadius:12, border:`1px solid ${C.border}`, background:C.white, color:C.ink, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Plus tard</button>
            <button onClick={handleSubmit} disabled={saving}
              style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background:isComplete?C.ink:C.cream3, color:isComplete?C.white:C.muted, fontWeight:700, fontSize:14, cursor:isComplete?"pointer":"not-allowed", fontFamily:SERIF, transition:"all .2s" }}>
              {saving ? "Envoi…" : "Publier mon évaluation ✦"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}


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
  const uid = `savvy-${Date.now()}@${DOMAIN}`;
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

/**
 * Signalement d'un problème sur une session (expert absent, souci technique…).
 * Envoie le contexte au support. Si la session était payée et que l'expert ne
 * s'est pas présenté, la réservation entre dans la file de remboursement admin.
 */
function ReportModal({ session, onClose, authUser }) {
  const [reason, setReason] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [delivered, setDelivered] = useState(true);
  const expertName = session.expert?.name || session.expertData?.name || "l'expert";
  const first = expertName.split(" ")[0];

  const REASONS = [
    { v:"absent",    l:`${first} ne s'est pas présenté(e)` },
    { v:"technique", l:"Problème technique (audio, vidéo, lien)" },
    { v:"contenu",   l:"La session ne correspondait pas à la réservation" },
    { v:"autre",     l:"Autre" },
  ];

  const submit = async () => {
    if (!reason) return;
    setSending(true);
    const label = REASONS.find(r => r.v === reason)?.l || reason;
    const body =
      `SIGNALEMENT SESSION\n\n` +
      `Motif : ${label}\n` +
      `Expert : ${expertName}\n` +
      `Session : ${session.date || "?"} ${session.time || ""}\n` +
      `Réservation : ${session.id}\n` +
      `Montant : ${session.price || 0}€ — ${session.paid ? "PAYÉE" : "non payée"}\n\n` +
      `Message du client :\n${text.trim() || "(aucun)"}`;
    try {
      const { data } = await supabase.functions.invoke("send-support-message", {
        body: { message: body, fromName: authUser?.name || "Utilisateur", fromEmail: authUser?.email || null, userId: authUser?.id },
      });
      setDelivered(!!data?.ok);
      // Expert absent + session payée -> candidat au remboursement (file admin)
      if (reason === "absent" && session.paid && session.id) {
        await supabase.from("bookings").update({ refund_status: "requested" }).eq("id", session.id);
      }
    } catch { setDelivered(false); }
    setSending(false);
    setDone(true);
  };

  if (done) return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", padding:"32px 22px 40px", textAlign:"center" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 22px" }}/>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:C.sageL, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <div style={{ fontSize:19, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>
          {delivered ? "Signalement reçu" : "On a bien noté"}
        </div>
        <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:22 }}>
          {delivered
            ? <>Notre équipe examine maintenant ta demande.<br/>Tu recevras une réponse sous 24 heures.</>
            : <>Écris-nous à <b style={{color:C.ink}}>contact@getsavvy.fr</b> pour qu'on traite ça au plus vite.</>}
          {reason === "absent" && session.paid && delivered && (
            <><br/><b style={{ color:C.ink }}>Ta demande de remboursement est bien enregistrée.</b></>
          )}
        </div>
        <button onClick={onClose} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:SERIF }}>Compris</button>
      </div>
    </>
  );

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", padding:"26px 20px 34px", maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 18px" }}/>
        <div style={{ fontSize:18, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:5 }}>Signaler un problème</div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:18, lineHeight:1.5 }}>
          Dis-nous simplement ce qui s'est passé. L'équipe Savvy examine chaque situation avec attention,
          pour trouver une solution juste pour tout le monde.
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
          {REASONS.map(r => (
            <button key={r.v} onClick={()=>setReason(r.v)}
              style={{ padding:"13px 14px", borderRadius:12, cursor:"pointer", fontFamily:"inherit", textAlign:"left", fontSize:13,
                border:`2px solid ${reason===r.v?C.ink:C.border}`, background:reason===r.v?C.cream2:C.white,
                color:reason===r.v?C.ink:C.soft, fontWeight:reason===r.v?700:500, transition:"all .15s" }}>
              {r.l}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Décris ce qui s'est passé (optionnel)…"
          style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, resize:"none", height:70, boxSizing:"border-box", outline:"none", background:C.cream2, lineHeight:1.6, marginBottom:16 }}/>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, background:C.white, color:C.muted, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Annuler</button>
          <button onClick={submit} disabled={!reason||sending}
            style={{ flex:2, padding:"13px", borderRadius:13, border:"none", background:reason&&!sending?C.ink:C.cream3, color:reason&&!sending?C.white:C.muted, fontWeight:700, fontSize:14, cursor:reason&&!sending?"pointer":"default", fontFamily:SERIF }}>
            {sending ? "Envoi…" : "Envoyer le signalement"}
          </button>
        </div>
      </div>
    </>
  );
}

function PaymentModal({ session, expert, onClose }) {
  const [paying, setPaying] = useState(false);
  const [err, setErr] = useState(null);

  const handlePay = async () => {
    setPaying(true);
    setErr(null);
    try {
      // Le prix et les parties sont lus en base côté serveur : on n'envoie que l'id.
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { bookingId: session.id },
      });
      if (data?.code === "expert_not_onboarded") {
        throw new Error(`${expert.name.split(" ")[0]} finalise encore sa configuration de paiement. On te prévient dès que c'est bon — rien n'est perdu.`);
      }
      if (error || !data?.url) throw new Error(data?.error || error?.message || "Erreur paiement");
      window.location.href = data.url;
    } catch (e) {
      setErr(e.message);
      setPaying(false);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(28,31,23,0.6)",zIndex:9000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.white,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:430,padding:"24px 20px 40px",boxShadow:"0 -4px 32px rgba(0,0,0,0.2)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Confirmer le paiement</div>
            <div style={{fontSize:12,color:C.muted,marginTop:3}}>Session avec {expert.name.split(" ")[0]}</div>
          </div>
          <button onClick={onClose} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
        </div>

        <div style={{background:C.cream2,borderRadius:14,padding:"14px 16px",marginBottom:20}}>
          <div style={{fontSize:13,color:C.muted,marginBottom:4}}>{session.topic || session.phase_name || "Session"}</div>
          <div style={{fontSize:26,fontWeight:800,color:C.ink,fontFamily:SERIF}}>{session.price}€</div>
        </div>

        {err && <div style={{fontSize:12,color:"#EF4444",marginBottom:12,textAlign:"center"}}>{err}</div>}

        <button onClick={handlePay} disabled={paying}
          style={{width:"100%",padding:"15px",borderRadius:13,border:"none",cursor:paying?"default":"pointer",fontWeight:700,fontSize:15,fontFamily:SERIF,
            background:paying?C.cream3:C.ink,color:paying?C.muted:C.white,transition:"all .2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {paying ? "Connexion à Stripe…" : `Payer ${session.price}€ →`}
        </button>

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:12}}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{fontSize:10,color:C.faint}}>Paiement 100% sécurisé · Powered by Stripe</span>
        </div>
      </div>
    </div>
  );
}

// Fenêtre d'accès à la session + libellé de compte à rebours
export function joinState(startTs) {
  const now = Date.now();
  if (!startTs) return { canJoin:true, label:"Rejoindre la session" };
  const openAt = startTs - 15*60000, closeAt = startTs + 75*60000;
  if (now >= openAt && now <= closeAt) return { canJoin:true, label:"Rejoindre la session" };
  if (now > closeAt) return { canJoin:false, past:true, label:"Session terminée" };
  const mins = Math.round((startTs - now)/60000);
  const label = mins >= 1440 ? `Début dans ${Math.round(mins/1440)} j`
    : mins >= 60 ? `Début dans ${Math.round(mins/60)} h`
    : `Début dans ${Math.max(1,mins)} min`;
  return { canJoin:false, label };
}

function SessionCard({ s, onMsg, onCancel, onExpert, onPay, onRespondReschedule, onReport }) {
  const expert = s.expertData || EXPERTS[s.eid] || EXPERTS.find(x=>x.initials===s.expertInitials);
  if (!expert) return null;
  const countdown = getCountdown(s.hoursUntil);
  const isToday   = s.hoursUntil <= 24;
  const isTomorrow = s.hoursUntil > 24 && s.hoursUntil <= 48;
  const isWeek     = s.hoursUntil > 48 && s.hoursUntil <= 168;
  const isPending  = s.status === "pending";
  const borderCol  = isPending ? "#F59E0B" : isToday ? "#FCA5A5" : isTomorrow ? "#A5B4FC" : C.border;
  const topBarCol  = isPending
    ? "linear-gradient(90deg,#F59E0B,#FCD34D)"
    : isToday
      ? "linear-gradient(90deg,#EF4444,#F87171)"
      : isTomorrow
        ? "linear-gradient(90deg,#6366F1,#818CF8)"
        : isWeek
          ? "linear-gradient(90deg,#F59E0B,#FCD34D)"
          : `linear-gradient(90deg,${expert.color},${expert.bg})`;
  return (
    <div style={{ background:C.white, borderRadius:18, border:`1.5px solid ${borderCol}`, overflow:"hidden", marginBottom:14, boxShadow:`0 2px 12px ${C.sh}` }}>
      <div style={{ height:4, background:topBarCol }}/>
      {/* Countdown banner */}
      {countdown && (
        <div style={{ background:isToday?"#FEF2F2":isTomorrow?"#EEF2FF":"#FFFBEB", padding:"7px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${isToday?"#FECACA":isTomorrow?"#E0E7FF":"#FDE68A"}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={countdown.color} strokeWidth={2.5}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize:12, fontWeight:700, color:countdown.color }}>{countdown.label}</span>
          </div>
          <button onClick={()=>downloadICS({expertName:expert.name, topic:s.topic, date:s.date, slot:s.time, durationH:s.duration==="2h"?2:s.duration==="30 min"?.5:1})}
            style={{ fontSize:10, fontWeight:700, color:"#6366F1", background:"#EEF2FF", border:"1px solid #C7D2FE", borderRadius:20, padding:"3px 10px", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>
            + Calendrier
          </button>
        </div>
      )}
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {expert.photoUrl
              ? <img src={expert.photoUrl} alt="" style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover", border:`1.5px solid ${C.border}`, flexShrink:0 }}/>
              : <div style={{ width:42, height:42, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, border:`1.5px solid ${C.border}` }}>{expert.initials}</div>}
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{expert.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{expert.role.split("·")[0].trim()}</div>
            </div>
          </div>
          {(()=>{
            const unpaidConfirmed = s.status==="confirmed" && !s.paid;
            const bg = s.status==="confirmed" ? (unpaidConfirmed?"#FEF3C7":C.sageL) : s.status==="pending"?"#FEF3C7":C.cream2;
            const col = s.status==="confirmed" ? (unpaidConfirmed?"#B45309":C.sage) : s.status==="pending"?"#B45309":"#92400E";
            const label = unpaidConfirmed ? "À payer" : s.statusLabel;
            return (
            <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:bg, color:col, fontWeight:700, border:(s.status==="pending"||unpaidConfirmed)?"1.5px solid #FCD34D":"none" }}>
              {label}
            </span>
            );
          })()}
        </div>
        {/* Timeline de progression */}
        {s.status!=="cancelled" && (()=>{
          const steps = [
            { label:"Demandée", done:true },
            { label:"Confirmée", done:s.status==="confirmed" },
            { label:"Payée",     done:!!s.paid },
            { label:"Session",   done:!!s.isPast },
          ];
          const curIdx = steps.findIndex(st=>!st.done);
          return (
            <div style={{ display:"flex", alignItems:"flex-start", margin:"0 4px 12px" }}>
              {steps.map((st,i)=>(
                <React.Fragment key={i}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                      background: st.done?C.sage : i===curIdx?"#FEF3C7":C.cream3,
                      border: i===curIdx?"1.5px solid #FCD34D":"none" }}>
                      {st.done
                        ? <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.5}><polyline points="20 6 9 17 4 12"/></svg>
                        : <div style={{ width:5, height:5, borderRadius:"50%", background:i===curIdx?"#B45309":C.faint }}/>}
                    </div>
                    <span style={{ fontSize:8, fontWeight:st.done||i===curIdx?700:500, color: st.done?C.sage : i===curIdx?"#B45309":C.faint, whiteSpace:"nowrap" }}>{st.label}</span>
                  </div>
                  {i<steps.length-1 && <div style={{ flex:1, height:2, borderRadius:2, marginTop:8, background: steps[i+1].done?C.sage:C.borderF }}/>}
                </React.Fragment>
              ))}
            </div>
          );
        })()}
        <div style={{ background:C.cream2, borderRadius:10, padding:"9px 12px", marginBottom:12, borderLeft:`2px solid ${expert.color}` }}>
          <div style={{ fontSize:12, color:C.soft, lineHeight:1.5 }}>{s.topic}</div>
        </div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:14 }}>
          <span style={{ fontSize:12, color:C.muted, display:"flex", gap:4, alignItems:"center" }}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>{s.date} · {s.time}</span>
          <span style={{ fontSize:12, color:C.muted, display:"flex", gap:4, alignItems:"center" }}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>{s.duration}</span>
          <span style={{ fontSize:12, color:C.muted, display:"flex", alignItems:"center", gap:4 }}><FormatIcon f={s.format} size={12}/>{(s.format||"Vidéo").replace(/[\u{1F300}-\u{1FAFF}]/gu,"").trim()}</span>
          <span style={{ fontSize:12, color:C.muted, display:"flex", gap:3, alignItems:"center" }}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>{s.price}€</span>
        </div>
        {/* Pending action hint */}
        {s.status==="pending" && !s.rescheduleFrom && (
          <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:10,padding:"9px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth={2} style={{flexShrink:0}}><circle cx={12} cy={12} r={9}/><polyline points="12 7 12 12 15 15"/></svg>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#92400E"}}>En attente de confirmation</div>
              <div style={{fontSize:11,color:"#B45309",marginTop:1}}>L'expert doit accepter votre demande avant de pouvoir procéder au paiement.</div>
            </div>
          </div>
        )}
        {/* Reprogrammation en attente */}
        {s.status==="pending" && s.rescheduleFrom && (()=>{
          const byExpert = s.rescheduleBy === "expert";
          return (
          <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:10,padding:"10px 13px",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:"#1D4ED8",marginBottom:byExpert?4:6,display:"flex",alignItems:"center",gap:6}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              {byExpert ? `Un imprévu pour ${expert.name.split(" ")[0]}` : "Ta demande a été envoyée"}
            </div>
            {byExpert && (
              <div style={{fontSize:11,color:"#1E40AF",lineHeight:1.55,marginBottom:8,opacity:.9}}>
                Pas d'inquiétude — {expert.name.split(" ")[0]} te propose un autre créneau. Ton échange est simplement décalé.
              </div>
            )}
            <div style={{fontSize:11,color:"#1E40AF",lineHeight:1.5,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              <span style={{textDecoration:"line-through",opacity:.7}}>{new Date(s.rescheduleFrom).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} · {new Date(s.rescheduleFrom).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</span>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={5} y1={12} x2={19} y2={12}/><polyline points="12 5 19 12 12 19"/></svg>
              <b>{s.date} · {s.time}</b>
            </div>
            {byExpert ? (
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button onClick={()=>onRespondReschedule&&onRespondReschedule(s,"accept")} style={{flex:2,padding:"9px",borderRadius:10,border:"none",background:C.sage,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SERIF,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>Ça me va
                </button>
                <button onClick={()=>onRespondReschedule&&onRespondReschedule(s,"refuse")} style={{flex:1,padding:"9px",borderRadius:10,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Refuser</button>
              </div>
            ) : (
              <div style={{fontSize:11,color:"#3B82F6",marginTop:5}}>{expert.name.split(" ")[0]} va te répondre — tu seras prévenu(e) dès qu'il aura confirmé.</div>
            )}
          </div>
          );
        })()}
        {/* Payment CTA for confirmed unpaid sessions */}
        {s.status==="confirmed" && !s.paid && (
          <div style={{background:"linear-gradient(135deg,#FEF3C7,#FFFBEB)",border:"1.5px solid #FDE68A",borderRadius:12,padding:"11px 13px",marginBottom:10,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
            onClick={()=>onPay&&onPay(s)}>
            <div style={{width:36,height:36,borderRadius:10,background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><rect x={1} y={4} width={22} height={16} rx={2} ry={2}/><line x1={1} y1={10} x2={23} y2={10}/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#92400E",display:"flex",alignItems:"center",gap:5}}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>{expert.name.split(" ")[0]} a accepté votre demande !</div>
              <div style={{fontSize:11,color:"#B45309",marginTop:1}}>Procédez au paiement pour confirmer · {s.price}€</div>
            </div>
            <div style={{padding:"6px 12px",borderRadius:20,background:"#F59E0B",color:"white",fontSize:12,fontWeight:700,flexShrink:0}}>Payer →</div>
          </div>
        )}
        <div style={{ display:"flex", gap:8 }}>
          {s.status==="confirmed" && s.paid && (()=>{
            // Fenêtre d'accès : 15 min avant → 75 min après le début
            const { canJoin, label } = joinState(s.startTs);
            return (
            <button disabled={!canJoin} onClick={()=>{
              if (!canJoin) return;
              const customLink = s.expertData?.meet_link;
              const roomId = s.id ? s.id.replace(/-/g,"").slice(0,16) : "savvy";
              window.open(customLink || `https://meet.jit.si/savvy-${roomId}`, "_blank");
            }} style={{ flex:2, padding:"10px", borderRadius:11, border:"none", cursor:canJoin?"pointer":"default", fontWeight:700, fontSize:12, background:canJoin?C.sage:C.cream3, color:canJoin?C.white:C.muted, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polygon points="23 7 16 12 23 17 23 7"/><rect x={1} y={5} width={15} height={14} rx={2}/></svg>
              {label}
            </button>
            );
          })()}
          <button onClick={() => onMsg && onMsg(expert, "reservations")} style={{ flex:1, padding:"10px", borderRadius:11, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:12, background:C.white, color:C.ink, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message
          </button>
          <button onClick={() => onCancel && onCancel(s)} style={{ flex:1, padding:"10px", borderRadius:11, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:12, background:C.white, color:C.ink, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={3}/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>Gérer
          </button>
        </div>
        {/* Filet de sécurité : visible seulement quand la session a (dû) commencer */}
        {onReport && s.status==="confirmed" && s.paid && joinState(s.startTs).canJoin && (
          <button onClick={() => onReport({...s, expert})} style={{ width:"100%", marginTop:9, padding:"7px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11.5, color:C.muted, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
            {expert.name.split(" ")[0]} n'est pas là ?
          </button>
        )}
      </div>
    </div>
  );
}

function PastCard({ s, onExpert, onResume, onReview, onReport }) {
  const expert = EXPERTS[s.eid] || s.expertData || { name: s.expertName || "Expert", initials: s.expertInitials || "?", bg: "#EDE8DF", color: "#8B7355", id: s.eid };
  if (!expert) return null;
  return (
    <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
        {expert.photoUrl
          ? <img src={expert.photoUrl} alt="" style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", border:`1.5px solid ${C.border}`, flexShrink:0 }}/>
          : <div style={{ width:40, height:40, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, border:`1.5px solid ${C.border}` }}>{expert.initials}</div>}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{expert.name}</div>
          <div style={{ fontSize:11, color:C.muted }}>{s.date} · {(s.format||"").replace(/[\u{1F300}-\u{1FAFF}]/gu,"").trim()}</div>
        </div>
        <div style={{ fontSize:18, fontWeight:700, color:C.muted, fontFamily:SERIF }}>{s.price}€</div>
      </div>
      <div style={{ fontSize:12, color:C.soft, background:C.cream2, borderRadius:9, padding:"8px 11px", marginBottom:10, display:"flex", gap:6, alignItems:"flex-start" }}>
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} style={{flexShrink:0,marginTop:1}}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
        {s.topic}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => onResume && onResume({...s, expert})} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:12, background:C.white, color:C.ink, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Résumé
        </button>
        <button onClick={() => onReview && onReview({...s, expert})} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${C.goldB}`, cursor:"pointer", fontWeight:700, fontSize:12, background:C.goldL, color:C.gold, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <svg width={12} height={12} viewBox="0 0 12 12" fill={C.gold} stroke="none"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>Avis
        </button>
        <button onClick={async () => {
          const url = `https://getsavvy.fr/p/${expert.id}`;
          const first = (expert.name||"").split(" ")[0];
          try { if (navigator.share) { await navigator.share({ title:`${expert.name} sur Savvy`, text:`Je te recommande ${first} sur Savvy`, url }); return; } } catch {}
          try { await navigator.clipboard.writeText(url); alert("Lien du profil copié !"); } catch {}
        }} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:12, background:C.white, color:C.ink, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={18} cy={5} r={3}/><circle cx={6} cy={12} r={3}/><circle cx={18} cy={19} r={3}/><line x1={8.6} y1={13.5} x2={15.4} y2={17.5}/><line x1={15.4} y1={6.5} x2={8.6} y2={10.5}/></svg>Partager
        </button>
        <button onClick={() => onExpert && onExpert(expert)} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${C.goldB}`, cursor:"pointer", fontWeight:700, fontSize:12, background:C.goldL, color:C.gold, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>Répéter
        </button>
      </div>
      {onReport && (
        <button onClick={() => onReport({...s, expert})} style={{ width:"100%", marginTop:9, padding:"7px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11.5, color:C.muted, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
          Signaler un problème
        </button>
      )}
    </div>
  );
}

function ReservationsScreen({ onExpert, onMsg, isLoggedIn, onLogin, onNavigate, onPendingChange, isRealUser=false, authUser=null }) {
  const [tab, setTab] = useState("avenir");
  const [cancelSession, setCancelSession] = useState(null);
  const [resumeSession, setResumeSession] = useState(null);
  const [reviewSession, setReviewSession] = useState(null);
  const [reportSession, setReportSession] = useState(null);
  const [calView, setCalView] = useState(false);
  const [paySession, setPaySession] = useState(null);
  // Rafraîchit les compte à rebours ("Début dans 3 h") sans recharger la page
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // Le client accepte / refuse le nouveau créneau proposé par l'expert
  const respondReschedule = async (s, action) => {
    if (!s?._fromSB || !s.id) return;
    const patch = action === "accept"
      ? { status: "confirmed" }
      : { status: "cancelled", cancelled_by: "client", cancel_reason: "Nouveau créneau refusé" };
    let { data: upd, error } = await supabase.from("bookings").update(patch).eq("id", s.id).select().single();
    if (error) {
      ({ data: upd, error } = await supabase.from("bookings")
        .update({ status: patch.status }).eq("id", s.id).select().single());
    }
    if (error) { alert("Erreur : " + error.message); return; }
    if (upd) supabase.functions.invoke("notify-booking", { body: { record: upd, type: "UPDATE" } }).catch(()=>{});
    setSbBookings(prev => prev.map(b => b.id === s.id
      ? { ...b, status: patch.status, statusLabel: action==="accept"?"Confirmée":"Annulée", rescheduleFrom: null, rescheduleBy: null }
      : b));
  };

  // Merge localStorage bookings with demo sessions
  const lsToSession = (b) => ({
    id: b.id,
    eid: b.expertId,
    expertInitials: b.expertInitials,
    expertData: { name:b.expertName, initials:b.expertInitials, bg:b.expertBg, color:b.expertCol, role:b.phase, id:b.expertId },
    topic: b.topic,
    date: b.date,
    time: b.slot,
    hoursUntil: b.hoursUntil || 48,
    duration: b.duration || "1h",
    format: b.format||"Vidéo",
    price: b.price || 0,
    status: b.status === "confirmed" ? "confirmed" : "pending",
    statusLabel: b.status === "confirmed" ? "Confirmée" : "En attente",
    paid: b.paid || false,
    _fromLS: true,
  });
  const [lsBookings, setLsBookings] = useState(() => getBookings());
  useEffect(() => {
    const onStorage = () => setLsBookings(getBookings());
    window.addEventListener("storage", onStorage);
    const t = setInterval(() => setLsBookings(getBookings()), 2000);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(t); };
  }, []);

  // Notification de confirmation en temps réel
  const [confirmNotif, setConfirmNotif] = useState(null);
  const prevStatusRef = useRef({});

  // Charger les bookings Supabase pour les vrais utilisateurs
  const [sbBookings, setSbBookings] = useState([]);
  useEffect(() => {
    if (!authUser?.real || !authUser?.id) return;
    const loadBookings = async () => {
      // Load bookings first
      const { data: bookingsData, error } = await supabase.from("bookings")
        .select("*")
        .eq("client_id", authUser.id)
        .order("date_requested", { ascending: false });
      if (error || !bookingsData) return;
      // Fetch expert info separately
      const expertIds = [...new Set(bookingsData.map(b=>b.expert_id).filter(Boolean))];
      const expertMap = {};
      if (expertIds.length > 0) {
        const { data: experts } = await supabase.from("experts").select("id, user_id, name, initials, bg, color, role, meet_link, photo_url").in("id", expertIds);
        (experts||[]).forEach(e => { expertMap[e.id] = e; });
      }
      const mapped = bookingsData.map(b => {
        const exp = expertMap[b.expert_id] || {};
        return {
          id: b.id,
          eid: b.expert_id,
          expertInitials: exp.initials || "?",
          expertData: { name: exp.name || "Expert", initials: exp.initials || "?", bg: exp.bg || "#EDE8DF", color: exp.color || "#8B7355", role: exp.role || "", id: b.expert_id, user_id: exp.user_id || null, meet_link: exp.meet_link || null, photoUrl: exp.photo_url || null },
          topic: b.notes || b.phase_name || "Session",
          date: b.date_session ? new Date(b.date_session).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}) : "À confirmer",
          time: b.date_session ? new Date(b.date_session).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : "À confirmer",
          hoursUntil: b.date_session ? Math.max(1, Math.round((new Date(b.date_session) - new Date()) / 3600000)) : 48,
          duration: b.session_duration || "1h",
          format: b.session_format || "Vidéo",
          price: b.phase_price || 0,
          status: b.status,
          statusLabel: b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente",
          // Seul le webhook Stripe écrit `paid`. Pas de repli localStorage :
          // le navigateur ne peut pas être la preuve qu'un paiement a eu lieu.
          paid: !!b.paid,
          rescheduleFrom: b.reschedule_from || null,
          rescheduleBy: b.reschedule_by || null,
          startTs: b.date_session ? new Date(b.date_session).getTime() : null,
          isPast: b.date_session ? (Date.now() > new Date(b.date_session).getTime() + 90*60000) : false,
          motif: b.cancel_reason || null,
          annuledBy: b.cancelled_by || null,
          _fromSB: true,
          expertName: exp.name || "Expert",
        };
      });
      // Détecter les changements de statut → notification
      mapped.forEach(b => {
        const prev = prevStatusRef.current[b.id];
        if (prev && prev !== b.status && b.status === "confirmed") {
          setConfirmNotif({ expertName: b.expertName, date: b.date, time: b.time, price: b.price });
          setTimeout(() => setConfirmNotif(null), 6000);
        }
        prevStatusRef.current[b.id] = b.status;
      });
      setSbBookings(mapped);
    };
    loadBookings();
    const channel = supabase.channel("client-bookings-"+authUser.id)
      .on("postgres_changes", { event:"*", schema:"public", table:"bookings", filter:`client_id=eq.${authUser.id}` }, loadBookings)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [authUser?.id]);

  // Deduplicate lsBookings by expertId, keeping most recent per expert per status
  const dedupedBookings = (()=>{
    const seen = new Map();
    [...lsBookings].sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)).forEach(b=>{
      const key = `${b.expertId}_${b.status}`;
      if (!seen.has(key)) seen.set(key, b);
    });
    return [...seen.values()];
  })();
  const lsPending   = dedupedBookings.filter(b=>b.status==="pending").map(lsToSession);
  const lsConfirmed = dedupedBookings.filter(b=>b.status==="confirmed").map(lsToSession);
  const lsCancelled = dedupedBookings.filter(b=>b.status==="cancelled").map(lsToSession);

  const [sessionsAvenir, setSessionsAvenir] = useState(isRealUser ? [] : [...SESSIONS_AVENIR]);
  const [sessionsCancelees, setSessionsCancelees] = useState(isRealUser ? [] : [...SESSIONS_ANNULEES]);

  // Pour les vrais utilisateurs, utiliser Supabase en priorité
  const sbPending   = sbBookings.filter(b=>b.status==="pending" && !b.isPast);
  const sbConfirmed = sbBookings.filter(b=>b.status==="confirmed" && !b.isPast);
  // "Passées" = uniquement les sessions réellement payées (donc réalisées).
  const sbPast      = sbBookings.filter(b=>b.status==="confirmed" && b.isPast && b.paid);
  // Confirmée mais jamais payée et déjà passée = expirée (le client n'a pas finalisé).
  const sbExpired   = sbBookings.filter(b=>b.status==="confirmed" && b.isPast && !b.paid)
                        .map(b=>({ ...b, statusLabel:"Expirée", annuledBy:null, expired:true }));
  const sbCancelled = sbBookings.filter(b=>b.status==="cancelled");

  // Filter demo sessions to exclude experts already in LS bookings
  const lsExpertIds = new Set(dedupedBookings.filter(b=>b.status!=="cancelled").map(b=>b.expertId));
  const filteredSessionsAvenir = sessionsAvenir.filter(s=>!lsExpertIds.has(EXPERTS[s.eid]?.id));

  // Pour utilisateurs réels → Supabase uniquement. Sinon → demo + LS
  const allAvenir   = authUser?.real
    ? [...sbPending, ...sbConfirmed]
    : [...lsPending, ...lsConfirmed, ...filteredSessionsAvenir];
  const allAnnulees = authUser?.real
    ? [...sbCancelled, ...sbExpired]
    : [...lsCancelled, ...sessionsCancelees];
  const pendingCount = allAvenir.filter(s=>s.status==="pending" || (s.status==="confirmed" && !s.paid)).length;
  useEffect(() => { onPendingChange && onPendingChange(pendingCount); }, [pendingCount]);
  // Ouvre la vue calendrier automatiquement (une seule fois) s'il y a des sessions confirmées
  const confirmedCount = allAvenir.filter(s=>s.status==="confirmed").length;
  const calAutoOpened = useRef(false);
  useEffect(() => {
    if (!calAutoOpened.current && confirmedCount > 0) { calAutoOpened.current = true; setCalView(true); }
  }, [confirmedCount]);
  if (!isLoggedIn) return (
    <LoginGate icon={<svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.6}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>} title="Tes réservations t\'attendent" sub="Connecte-toi pour voir et gérer tes sessions avec les experts." onLogin={onLogin}/>
  );

  const TABS = [
    { id:"avenir",   label:"À venir",   count:allAvenir.length   },
    { id:"passees",  label:"Passées",   count:isRealUser ? sbPast.length : SESSIONS_PASSEES.length  },
    { id:"annulees", label:"Annulées",  count:allAnnulees.length },
  ];

  const ConfirmNotifOverlay = confirmNotif && (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 16px 32px",pointerEvents:"none"}}>
      <div style={{background:"linear-gradient(135deg,#1C1917,#292524)",borderRadius:22,padding:"22px 22px 24px",width:"100%",maxWidth:420,boxShadow:"0 8px 40px rgba(0,0,0,0.35)",pointerEvents:"auto",animation:"slideUp .4s cubic-bezier(.16,1,.3,1)"}}>
        <style>{`@keyframes slideUp{from{transform:translateY(120px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <div style={{width:48,height:48,borderRadius:16,background:"linear-gradient(135deg,#D97706,#F59E0B)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff"}}><svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg></div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#FAFAF9",fontFamily:SERIF,lineHeight:1.2}}>Session confirmée !</div>
            <div style={{fontSize:12,color:"rgba(250,250,249,.6)",marginTop:3}}>{confirmNotif.expertName} a accepté votre demande</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[
            {svg:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>,val:confirmNotif.date||"À définir"},
            {svg:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>,val:confirmNotif.time||"—"},
            {svg:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth={2}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,val:`${confirmNotif.price||0}€`},
          ].map(({svg,val})=>(
            <div key={val} style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:12,padding:"9px 6px",textAlign:"center"}}>
              <div style={{display:"flex",justifyContent:"center"}}>{svg}</div>
              <div style={{fontSize:11,color:"rgba(250,250,249,.85)",fontWeight:600,marginTop:3}}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,color:"rgba(250,250,249,.5)",textAlign:"center"}}>Procédez au paiement dans vos réservations</div>
      </div>
    </div>
  );

  return (
    <>
      {ConfirmNotifOverlay}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:72, background:C.cream }}>
        {/* Header */}
        <div style={{ background:C.white, padding:"18px 18px 0", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, color:C.ink, margin:0, fontFamily:SERIF }}>Réservations</h2>
              <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>Gérez vos sessions avec vos experts</div>
            </div>
            <button onClick={() => setCalView(v=>!v)} style={{ padding:"7px 13px", borderRadius:20, border:`1px solid ${C.border}`, background:calView?C.ink:C.cream2, color:calView?C.white:C.ink, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
                {calView
                  ? <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>
                  : <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>}
                {calView ? "Fermer" : "Calendrier"}
              </span>
            </button>
          </div>
          <div style={{ display:"flex", marginTop:14 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:"10px 4px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:tab===t.id?700:400, color:tab===t.id?C.ink:C.muted, borderBottom:tab===t.id?`2.5px solid ${C.ink}`:"2px solid transparent", transition:"all .15s" }}>
                {t.label}
                {t.count > 0 && <span style={{ marginLeft:5, fontSize:10, background:tab===t.id?C.ink:C.cream3, color:tab===t.id?C.white:C.muted, borderRadius:10, padding:"1px 6px", fontWeight:700 }}>{t.count}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Vue calendrier */}
        {calView && (()=>{
          // Vue calendrier — sessions confirmées triées par date
          const calSessions = allAvenir
            .filter(s => s.status === "confirmed")
            .sort((a,b) => (a.hoursUntil||0) - (b.hoursUntil||0));
          return (
          <div style={{ padding:"14px 18px", background:C.cream2, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:12, fontFamily:SERIF }}>Tes sessions · vue calendrier</div>
            {calSessions.length === 0 ? (
              <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"22px 16px", textAlign:"center" }}>
                <div style={{ fontSize:13, color:C.muted }}>Aucune session confirmée pour le moment.</div>
              </div>
            ) : (
            <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, overflow:"hidden" }}>
              {calSessions.map((s,i) => {
                const jour = (s.date||"").split(" ").slice(0,2).join(" ") || "À définir";
                return (
                <div key={s.id||i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderBottom:i<calSessions.length-1?`1px solid ${C.borderF}`:"none" }}>
                  <div style={{ width:56, height:48, borderRadius:11, background:C.goldL, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <div style={{ fontSize:9, fontWeight:600, color:C.gold, textTransform:"uppercase" }}>{jour}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:C.gold, fontFamily:SERIF }}>{s.time||"—"}</div>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.expertData?.name || s.expertName || EXPERTS[s.eid]?.name || "Expert"}</div>
                    <div style={{ fontSize:11, color:C.muted }}>Session confirmée · {(s.format||"Vidéo").replace(/[\u{1F300}-\u{1FAFF}]/gu,"").trim()}</div>
                  </div>
                </div>
                );
              })}
            </div>
            )}
          </div>
          );
        })()}

        <div style={{ padding:"16px 18px 0" }}>

          {/* À venir */}
          {tab === "avenir" && (
            allAvenir.length > 0
              ? (()=>{
                  const groups = [
                    { label:"Aujourd'hui", color:"#EF4444", sessions: allAvenir.filter(s=>s.hoursUntil<=24) },
                    { label:"Demain",      color:"#6366F1", sessions: allAvenir.filter(s=>s.hoursUntil>24&&s.hoursUntil<=48) },
                    { label:"Cette semaine", color:"#F59E0B", sessions: allAvenir.filter(s=>s.hoursUntil>48&&s.hoursUntil<=168) },
                    { label:"Plus tard",   color:C.muted,   sessions: allAvenir.filter(s=>s.hoursUntil>168) },
                  ].filter(g=>g.sessions.length>0);
                  return groups.map(g=>(
                    <div key={g.label}>
                      <div style={{fontSize:10,fontWeight:800,color:g.color,textTransform:"uppercase",letterSpacing:1,marginBottom:8,marginTop:4,display:"flex",alignItems:"center",gap:6}}>
                        <div style={{height:1,flex:1,background:g.color+"30"}}/>
                        {g.label}
                        <div style={{height:1,flex:1,background:g.color+"30"}}/>
                      </div>
                      {g.sessions.map(s=><SessionCard key={s.id} s={s} onMsg={onMsg} onCancel={setCancelSession} onExpert={onExpert} onPay={setPaySession} onRespondReschedule={respondReschedule} onReport={setReportSession}/>)}
                    </div>
                  ));
                })()
              : (
                <div style={{ textAlign:"center", padding:"60px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg></div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Aucune session à venir</div>
                  <div style={{ fontSize:13, color:C.muted, marginBottom:6 }}>Trouve un expert et réserve ta première session.</div>
                  <div style={{ fontSize:12, color:C.gold, fontWeight:600, marginBottom:20 }}>Les meilleurs experts répondent souvent dans la journée.</div>
                  <button onClick={() => onNavigate && onNavigate("search")} style={{ padding:"12px 24px", borderRadius:12, border:"none", background:C.sage, color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Trouver quelqu'un →</button>
                </div>
              )
          )}
          {/* Passées */}
          {tab === "passees" && (
            authUser?.real
              ? sbPast.length > 0
                ? sbPast.map(s => (
                    <PastCard key={s.id} s={{...s, expert: s.expertData}} onExpert={onExpert} onResume={setResumeSession} onReview={setReviewSession} onReport={setReportSession}/>
                  ))
                : <div style={{ textAlign:"center", padding:"48px 0", color:C.muted }}>Aucune session passée.</div>
              : (!isRealUser && SESSIONS_PASSEES.length > 0)
                ? SESSIONS_PASSEES.map(s => <PastCard key={s.id} s={s} onExpert={onExpert} onResume={setResumeSession} onReview={setReviewSession}/>)
                : <div style={{ textAlign:"center", padding:"48px 0", color:C.muted }}>Aucune session passée.</div>
          )}
          {/* Annulées */}
          {tab === "annulees" && (
            allAnnulees.length > 0 ? (
              allAnnulees.map(s => {
                const expert = EXPERTS[s.eid] || s.expertData || { name: s.expertName || "Expert", initials: s.expertInitials || "?", bg: "#EDE8DF", color: "#8B7355", role: s.expertData?.role || "" };
                if (!expert) return null;
                return (
                  <div key={s.id} style={{ background:C.white, borderRadius:16, border:"1.5px solid #FEE2E2", overflow:"hidden", marginBottom:12 }}>
                    <div style={{ height:4, background:"linear-gradient(90deg,#B91C1C,#FEE2E2)" }}/>
                    <div style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", gap:11, alignItems:"center", marginBottom:11 }}>
                        {expert.photoUrl
                          ? <img src={expert.photoUrl} alt="" style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover", border:`1.5px solid ${C.border}`, flexShrink:0 }}/>
                          : <div style={{ width:42, height:42, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{expert.initials}</div>}
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{expert.name}</div>
                          <div style={{ fontSize:11, color:C.muted }}>{(expert.role||"").split("·")[0].trim()}</div>
                        </div>
                        {s.expired
                          ? <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:C.cream2, color:C.muted, fontWeight:700, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:4 }}><svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>Expirée</span>
                          : <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"#FFF5F5", color:"#B91C1C", fontWeight:700, border:"1px solid #FEE2E2", display:"flex", alignItems:"center", gap:4 }}><svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>Annulée</span>}
                      </div>
                      {s.expired && (
                        <div style={{ background:C.cream2, borderRadius:9, padding:"8px 12px", fontSize:11, color:C.muted, lineHeight:1.5, marginBottom:10 }}>
                          Le paiement n'a pas été finalisé avant la date — la session n'a pas eu lieu. Tu peux réserver un nouveau créneau quand tu veux.
                        </div>
                      )}
                      <div style={{ background:"#FFF5F5", borderRadius:10, padding:"9px 13px", marginBottom:10 }}>
                        <div style={{ fontSize:12, color:C.soft, display:"flex", gap:6, alignItems:"flex-start" }}>
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} style={{flexShrink:0,marginTop:1}}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
                          {s.topic}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:10 }}>
                        <span style={{ fontSize:11, color:C.muted, display:"flex", gap:4, alignItems:"center" }}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>{s.date} · {s.time}</span>
                        <span style={{ fontSize:11, color:C.muted }}>{(s.format||"").replace(/[\u{1F300}-\u{1FAFF}]/gu,"").trim()}</span>
                        <span style={{ fontSize:11, color:C.muted, display:"flex", gap:3, alignItems:"center" }}><svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>{s.price}€</span>
                      </div>
                      {(s.annuledBy || s.motif) && (
                      <div style={{ background:C.cream2, borderRadius:9, padding:"8px 12px", fontSize:11, color:C.muted, display:"flex", gap:7, alignItems:"center" }}>
                        {s.annuledBy && <span>Annulée par : <b style={{ color:C.ink }}>{s.annuledBy==="client"?"toi":(s.expertData?.name||s.expertName||"l\'expert")}</b></span>}
                        {s.annuledBy && s.motif && <span>·</span>}
                        {s.motif && <span>Motif : {s.motif}</span>}
                      </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <div style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:6 }}>Aucune annulation</div>
                <div style={{ fontSize:12, color:C.muted }}>Super — tes sessions se passent bien !</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modals */}
      {reviewSession && <ReviewModal session={reviewSession} onClose={()=>setReviewSession(null)} authUser={authUser} onExpert={onExpert}/>}
      {reportSession && <ReportModal session={reportSession} onClose={()=>setReportSession(null)} authUser={authUser}/>}
      {paySession && (
        <PaymentModal
          session={paySession}
          expert={paySession.expertData || EXPERTS[paySession.eid] || EXPERTS.find(x=>x.initials===paySession.expertInitials) || {name:"Expert",initials:"EX",bg:C.cream2,color:C.ink}}
          onClose={() => setPaySession(null)}
          onPaid={() => { setLsBookings(getBookings()); setPaySession(null); }}
        />
      )}

      {cancelSession && (
        <CancelModal
          session={{ ...cancelSession, expert: EXPERTS[cancelSession.eid] || cancelSession.expertData || { name: cancelSession.expertName || "Expert", initials: cancelSession.expertInitials || "?", bg: "#EDE8DF", color: "#8B7355" } }}
          onClose={async (wasCancelled) => {
            if (wasCancelled) {
              const s = cancelSession;
              // Réservation réelle (Supabase) → persister l'annulation
              if (s._fromSB && s.id) {
                const cancelPatch = { status: "cancelled", cancelled_by: "client", ...(s.paid ? { refund_status: "requested" } : {}) };
                let { data: upd, error } = await supabase.from("bookings").update(cancelPatch).eq("id", s.id).select().single();
                if (error) { ({ data: upd, error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", s.id).select().single()); }
                if (error) { console.warn("[cancel booking]", error.message); alert("Erreur lors de l'annulation : " + error.message); }
                else { if(upd) supabase.functions.invoke("notify-booking", { body: { record: upd, type: "UPDATE" } }).catch(()=>{}); setSbBookings(prev => prev.map(b => b.id === s.id ? { ...b, status: "cancelled", statusLabel: "Annulée", annuledBy: "client" } : b)); }
              } else if (s._fromLS && s.id) {
                updateBooking(s.id, { status: "cancelled" });
                setLsBookings(getBookings());
              } else {
                // session démo
                setSessionsAvenir(prev => prev.filter(x => x.id !== s.id));
                setSessionsCancelees(prev => [...prev, { ...s, annuledBy:"client", annuledDate:"Aujourd\'hui" }]);
              }
            }
            setCancelSession(null);
          }}
          onMsg={onMsg}
        />
      )}

      {resumeSession && (
        <>
          <div onClick={() => setResumeSession(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
          <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", padding:"24px 20px 36px" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 20px" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, paddingBottom:16, borderBottom:`1px solid ${C.borderF}` }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:resumeSession.expert.bg, color:resumeSession.expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, border:`1.5px solid ${C.border}` }}>
                {resumeSession.expert.initials}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{resumeSession.expert.name}</div>
                <div style={{ fontSize:12, color:C.muted }}>{resumeSession.date} · {resumeSession.format}</div>
              </div>
              <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{resumeSession.price}€</div>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:8 }}>Sujet de la session</div>
              <div style={{ background:C.cream2, borderRadius:11, padding:"11px 14px", fontSize:13, color:C.soft, lineHeight:1.6 }}>{resumeSession.topic}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:18 }}>
              {[{l:"Format",v:resumeSession.format},{l:"Durée",v:resumeSession.duration||"1h"},{l:"Montant payé",v:`${resumeSession.price}€`},{l:"Statut",v:"Terminée"}].map(item => (
                <div key={item.l} style={{ background:C.cream2, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}>{item.l}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{item.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setResumeSession(null)} style={{ flex:1, padding:"12px", borderRadius:12, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit" }}>Fermer</button>
              <button onClick={() => { onExpert && onExpert(resumeSession.expert); setResumeSession(null); }} style={{ flex:2, padding:"12px", borderRadius:12, border:`1px solid ${C.goldB}`, cursor:"pointer", fontWeight:700, fontSize:13, background:C.goldL, color:C.gold, fontFamily:"inherit" }}>
                Répéter cette session
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ReservationsScreen;
