import React, { useState, useEffect } from 'react'
import { C, SERIF } from '../constants/colors'
import { supabase } from '../supabase'

const BOOKING_FORMATS = [
  { id:"video", icon:"🎥", label:"Vidéocall", sub:"En direct · face à face" },
  { id:"audio", icon:"🎧", label:"Appel audio", sub:"Téléphone · voix uniquement" },
  { id:"doc",   icon:"📄", label:"Document écrit", sub:"Livrable PDF · 24-48h" },
  { id:"chat",  icon:"💬", label:"Accompagnement", sub:"Échanges par messagerie" },
];

// Convertit une durée ("15 min", "1h", "1h30", "2h"…) en minutes
function parseDuree(str) {
  if (!str) return 30;
  const s = String(str).toLowerCase().trim();
  const hm = s.match(/(\d+)\s*h\s*(\d+)/); if (hm) return Number(hm[1])*60 + Number(hm[2]);
  const h = s.match(/(\d+)\s*h/);          if (h)  return Number(h[1])*60;
  const m = s.match(/(\d+)\s*min/);        if (m)  return Number(m[1]);
  const n = s.match(/(\d+)/);              if (n)  return Number(n[1]);
  return 30;
}

function CalendarPicker({ expert, onDone, onSelect, slotMinutes = 30 }) {
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
          const dt = new Date(b.date_session);
          const key = dt.getFullYear()+"-"+String(dt.getMonth()+1).padStart(2,"0")+"-"+String(dt.getDate()).padStart(2,"0");
          const t = String(dt.getHours()).padStart(2,"0")+":"+String(dt.getMinutes()).padStart(2,"0");
          if (!map[key]) map[key] = [];
          map[key].push(t);
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

  const [savedDays, setSavedDays] = useState({});
  const [savedHours, setSavedHours] = useState({});
  const [hasDispo, setHasDispo] = useState(false);

  // Load availability from Supabase (real experts) or localStorage (demo)
  useEffect(() => {
    const expertId = expert?.id;
    if (!expertId) return;

    // Try Supabase first
    supabase.from("availability").select("*").eq("expert_id", expertId)
      .then(({ data }) => {
        if (data?.length) {
          const days = {}, hours = {};
          const today2 = new Date(); today2.setHours(0,0,0,0);
          for (let i = 1; i <= 90; i++) {
            const d = new Date(today2); d.setDate(today2.getDate() + i);
            const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
            const row = data.find(r => r.day_of_week === dow);
            if (row) {
              // Clé LOCAL pour matcher fmtKey() utilisé dans isAvail (sinon décalage d'un jour)
              const key = d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
              days[key] = true;
              hours[key] = row.start_time + "-" + row.end_time;
            }
          }
          setSavedDays(days);
          setSavedHours(hours);
          setHasDispo(true);
          return;
        }
        // Fallback: localStorage (demo experts)
        const _r = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } };
        const lsDays = _r(`savvy_dispo_days_${expert?.initials}`) || _r(`savvy_dispo_days_${expertId}`) || {};
        const lsHours = _r(`savvy_dispo_hours_${expert?.initials}`) || _r(`savvy_dispo_hours_${expertId}`) || {};
        setSavedDays(lsDays);
        setSavedHours(lsHours);
        setHasDispo(Object.values(lsDays).some(v => v));
      });
  }, [expert?.id]);

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
    const step = slotMinutes > 0 ? slotMinutes : 30;
    while (cur + step <= end) {
      slots.push(String(Math.floor(cur/60)).padStart(2,"0")+":"+String(cur%60).padStart(2,"0"));
      cur += step;
    }
    return slots;
  };

  if (done) return (
    <div style={{ textAlign:"center", padding:"20px 0" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>✅</div>
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

function BookingScreen({ e, ph, onBack, onConfirm }) {
  const [step, setStep] = useState("offre"); // offre → format → date → confirm
  const [selectedPhase, setSelectedPhase] = useState(ph);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [booking, setBooking] = useState({ date:null, slot:null });
  const [note, setNote] = useState("");
  // Payment states at component level (React hooks rules)
  const [payMethod, setPayMethod] = useState("card");
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [paying, setPaying] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [payDone, setPayDone] = useState(false);
  const [sending, setSending] = useState(false);

  // Card type detection
  const getCardType = num => {
    const n = num.replace(/\s/g,"");
    if (/^4/.test(n)) return "visa";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
    if (/^3[47]/.test(n)) return "amex";
    return null;
  };
  const cardType = getCardType(cardNum);
  const CardTypeLogo = ({type, active}) => {
    if (!type) return null;
    const logos = {
      visa: <svg width={38} height={12} viewBox="0 0 38 12"><text x="0" y="11" fill={active?"white":"rgba(255,255,255,.4)"} fontSize="13" fontWeight="800" fontFamily="Arial,sans-serif">VISA</text></svg>,
      mastercard: (
        <svg width={32} height={20} viewBox="0 0 32 20">
          <circle cx={11} cy={10} r={10} fill={active?"#EB001B":"rgba(235,0,27,.4)"}/>
          <circle cx={21} cy={10} r={10} fill={active?"#F79E1B":"rgba(247,158,27,.4)"}/>
          <path d="M16 3.5a10 10 0 0 1 0 13 10 10 0 0 1 0-13z" fill={active?"#FF5F00":"rgba(255,95,0,.4)"}/>
        </svg>
      ),
      amex: <svg width={36} height={12} viewBox="0 0 36 12"><text x="0" y="11" fill={active?"white":"rgba(255,255,255,.4)"} fontSize="11" fontWeight="800" fontFamily="Arial,sans-serif">AMEX</text></svg>,
    };
    return logos[type]||null;
  };

  // Payment helpers at component level
  const formatCard = v => {
    const n = v.replace(/[^0-9]/g,"");
    const isAmex = /^3[47]/.test(n);
    if (isAmex) return n.slice(0,15).replace(/^(\d{4})(\d{0,6})(\d{0,5})/,"$1 $2 $3").trim();
    return n.slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  };
  const formatExp  = v => { const d=v.replace(/[^0-9]/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };
  const isCardValid = cardNum.replace(/\s/g,"").length>=15 && cardExp.length===5 && cardCvv.length>=3 && cardName.length>2;
  const handlePay = async () => {
    if (payMethod==="apple") { setPaying(true); await new Promise(r=>setTimeout(r,1500)); setPayDone(true); await new Promise(r=>setTimeout(r,900)); onConfirm({date:booking.date, slot:booking.slot, note}); return; }
    if (!isCardValid) { alert("Vérifie les informations de ta carte."); return; }
    setPaying(true); await new Promise(r=>setTimeout(r,1800)); setPayDone(true); await new Promise(r=>setTimeout(r,900));
    onConfirm({date:booking.date, slot:booking.slot, note});
  };

  // Determine available formats from the phase.
  // Priorité au tableau `formats` (l'expert peut en activer plusieurs),
  // sinon on retombe sur le champ `format` unique.
  const normFmt = (raw) => {
    const pf = (raw||"").toLowerCase();
    if (pf.includes("vid")) return "video";
    if (pf.includes("audio") || pf.includes("appel")) return "audio";
    if (pf.includes("doc") || pf.includes("pdf")) return "doc";
    if (pf.includes("chat") || pf.includes("mess")) return "chat";
    return null;
  };
  const phaseFormatIds = Array.isArray(selectedPhase?.formats) && selectedPhase.formats.length
    ? selectedPhase.formats.map(normFmt).filter(Boolean)
    : (selectedPhase?.format ? [normFmt(selectedPhase.format)].filter(Boolean) : []);
  const availableFormats = phaseFormatIds.length
    ? BOOKING_FORMATS.filter(f => phaseFormatIds.includes(f.id))
    : BOOKING_FORMATS;
  const formatsToShow = availableFormats.length > 0 ? availableFormats : BOOKING_FORMATS;

  const Header = () => (
    <div style={{ background:C.white, padding:"13px 16px 12px", borderBottom:`1px solid ${C.border}`, boxShadow:`0 1px 6px ${C.sh}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:12 }}>
        <button onClick={() => step==="offre" ? onBack() : step==="format" ? setStep("offre") : step==="date" ? setStep("format") : setStep("date")} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:34, height:34, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>
          {step==="offre" ? "Choisir une offre" : step==="format" ? "Choisir le format" : step==="date" ? "Choisir la date" : "Envoyer la demande"}
        </span>
      </div>
      {/* Progress */}
      <div style={{ display:"flex", gap:6 }}>
        {["offre","format","date","confirm"].map((s,i) => (
          <div key={s} style={{ flex:1, height:3, borderRadius:2, background:["offre","format","date","confirm"].indexOf(step) >= i ? C.gold : C.cream3, transition:"background .3s" }}/>
        ))}
      </div>
      <div style={{ display:"flex", gap:0, marginTop:8 }}>
        {[{s:"offre",l:"Offre"},{s:"format",l:"Format"},{s:"date",l:"Date"},{s:"confirm",l:"Demande"}].map((item,i)=>(
          <div key={item.s} style={{ flex:1, textAlign:"center", fontSize:10, color:step===item.s?C.ink:C.faint, fontWeight:step===item.s?700:400 }}>{item.l}</div>
        ))}
      </div>
    </div>
  );

  // ── STEP 0 : OFFRE ──────────────────────────────────────────────────────
  if (step === "offre") return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.cream }}>
      <Header/>
      <div style={{ flex:1, overflowY:"auto", padding:"18px 18px 24px" }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:5, fontFamily:SERIF }}>
          Quelle offre vous intéresse ?
        </div>
        <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>
          Choisissez parmi les offres de {e.name.split(" ")[0]}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
          {!(e.phases?.length) && (
            <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"20px 16px", textAlign:"center", color:C.muted, fontSize:13 }}>
              Cet expert n'a pas encore configuré ses offres.
            </div>
          )}
          {(e.phases || []).map(p => {
            const isSel = selectedPhase?.id === p.id;
            return (
              <div key={p.id} onClick={()=>setSelectedPhase(p)}
                style={{ background:isSel?C.ink:C.white, borderRadius:14, border:`2px solid ${isSel?C.ink:C.border}`, padding:"14px 16px", cursor:"pointer", transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:isSel?C.white:C.ink, fontFamily:SERIF }}>{p.name}</div>
                    {p.tag && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:isSel?"rgba(255,255,255,.15)":C.goldL, color:isSel?C.white:C.gold, fontWeight:700, marginTop:4, display:"inline-block" }}>{p.tag}</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    <span style={{ fontSize:20, fontWeight:700, color:isSel?C.white:C.ink, fontFamily:SERIF }}>{p.price}€</span>
                    <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${isSel?"transparent":C.border}`, background:isSel?C.white:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {isSel && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize:12, color:isSel?"rgba(253,252,248,.7)":C.muted, lineHeight:1.5 }}>{p.what}</div>
                <div style={{ fontSize:11, color:isSel?"rgba(253,252,248,.5)":C.faint, marginTop:6 }}>{p.format}</div>
              </div>
            );
          })}
        </div>
        <button onClick={()=>{ if(!selectedPhase){alert("Choisissez une offre."); return;} setStep("format"); }}
          style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:SERIF,
            background:selectedPhase?`linear-gradient(135deg,${C.gold},${C.goldB})`:C.cream3, color:selectedPhase?C.white:C.muted }}>
          {selectedPhase ? `Continuer avec "${selectedPhase.name}" →` : "Sélectionnez une offre"}
        </button>
      </div>
    </div>
  );

  // ── STEP 1 : FORMAT ─────────────────────────────────────────────────────
  if (step === "format") return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.cream }}>
      <Header/>
      <div style={{ flex:1, overflowY:"auto", padding:"18px 18px 24px" }}>
        {/* Offre résumé */}
        <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"13px 15px", marginBottom:20, display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ width:42, height:42, borderRadius:"50%", background:e.bg, color:e.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{e.initials}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{selectedPhase?.name}</div>
            <div style={{ fontSize:11, color:C.muted, fontStyle:"italic" }}>{selectedPhase?.what}</div>
          </div>
          <div style={{ fontSize:20, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{selectedPhase?.price ? `${selectedPhase.price}€` : "Devis"}</div>
        </div>

        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:14, fontFamily:SERIF }}>
          Comment voulez-vous travailler ensemble ?
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>
          {formatsToShow.map(f => {
            const isSelected = selectedFormat === f.id;
            return (
              <div key={f.id} onClick={()=>setSelectedFormat(f.id)} style={{ background:isSelected?C.ink:C.white, border:`2px solid ${isSelected?C.ink:C.border}`, borderRadius:14, padding:"15px 16px", cursor:"pointer", display:"flex", gap:14, alignItems:"center", transition:"all .2s" }}>
                <div style={{ width:48, height:48, borderRadius:13, background:isSelected?"rgba(253,252,248,.12)":C.cream2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{f.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:isSelected?C.white:C.ink, fontFamily:SERIF }}>{f.label}</div>
                  <div style={{ fontSize:12, color:isSelected?"rgba(253,252,248,.6)":C.muted, marginTop:2 }}>{f.sub}</div>
                </div>
                <div style={{ width:22, height:22, borderRadius:"50%", background:isSelected?C.white:"transparent", border:isSelected?"none":`2px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {isSelected && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
            );
          })}
        </div>

        {e.nda && <div style={{ background:C.goldL, borderRadius:12, padding:"10px 14px", marginBottom:16, display:"flex", gap:9, border:`1px solid ${C.goldB}` }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2} style={{ flexShrink:0, marginTop:1 }}><rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span style={{ fontSize:11, color:C.gold }}>Session sous NDA — vos données sont protégées.</span>
        </div>}

        <button onClick={()=>{ if(!selectedFormat){alert("Choisissez un format."); return;} setStep("date"); }}
          style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:selectedFormat?`linear-gradient(135deg,${C.gold},${C.goldB})`:C.cream3, color:selectedFormat?C.white:C.muted, fontFamily:SERIF, transition:"all .2s" }}>
          {selectedFormat ? `Continuer avec ${BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.icon} ${BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.label} →` : "Sélectionnez un format"}
        </button>
      </div>
    </div>
  );

  // ── STEP 2 : DATE ────────────────────────────────────────────────────────
  if (step === "date") return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.cream }}>
      <Header/>
      <div style={{ flex:1, overflowY:"auto", padding:"16px 18px 24px" }}>
        {/* Format choisi */}
        <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:20 }}>{BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.ink }}>{BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>Format sélectionné</div>
          </div>
          <button onClick={()=>setStep("format")} style={{ fontSize:11, color:C.gold, fontWeight:700, background:C.goldL, border:`1px solid ${C.goldB}`, borderRadius:20, padding:"3px 10px", cursor:"pointer", fontFamily:"inherit" }}>Modifier</button>
        </div>

        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:12, fontFamily:SERIF }}>Choisir une date & un créneau</div>
        <CalendarPicker expert={e} slotMinutes={parseDuree(selectedPhase?.duree)} onSelect={({date,slot})=>setBooking({date,slot})}/>

        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:8 }}>Décrivez votre besoin</div>
        <textarea value={note} onChange={ev=>setNote(ev.target.value)} placeholder="Quelques lignes pour que votre conseiller se prépare..." style={{ width:"100%", padding:"12px 14px", borderRadius:13, border:`1.5px solid ${C.border}`, fontSize:12, fontFamily:"inherit", color:C.ink, resize:"none", height:76, boxSizing:"border-box", outline:"none", marginBottom:14, background:C.cream2, lineHeight:1.6 }}/>

        <button onClick={()=>{ if(!booking.date||!booking.slot){alert("Choisissez une date et un créneau."); return;} setStep("confirm"); }}
          style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:SERIF, background:booking.date&&booking.slot?`linear-gradient(135deg,${C.gold},${C.goldB})`:C.cream3, color:booking.date&&booking.slot?C.white:C.muted }}>
          {booking.date&&booking.slot ? `Confirmer le ${booking.date.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} à ${booking.slot} →` : "Sélectionnez une date →"}
        </button>
      </div>
    </div>
  );

  // ── STEP 3 : RÉSUMÉ & ENVOI DE DEMANDE ──────────────────────────────────
  const handleSend = async () => {
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    onConfirm({date:booking.date, slot:booking.slot, note});
  };

  return (
    <div style={{ flex:1, overflowY:"auto", background:C.cream, paddingBottom:24 }}>
      <Header/>
      <div style={{ padding:"16px 18px" }}>

        {/* Expert card */}
        <div style={{ background:C.white, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}`, marginBottom:14, boxShadow:`0 2px 12px ${C.sh}` }}>
          <div style={{ height:4, background:`linear-gradient(90deg,${e.color},${e.bg})` }}/>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:e.bg, color:e.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{e.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{e.name}</div>
                <div style={{ fontSize:11, color:C.muted }}>{e.role?.split("·")[0]?.trim()}</div>
                {(()=>{ const rt=e.metrics?.find(m=>m.label?.includes("réponse")||m.label?.includes("response")); return rt ? <div style={{ fontSize:10, color:C.sage, fontWeight:600, marginTop:2 }}>⚡ Répond généralement {rt.value}</div> : null; })()}
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:20, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{selectedPhase?.price ? `${selectedPhase.price}€` : "Devis"}</div>
                <div style={{ fontSize:10, color:C.muted }}>à régler si accepté</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                {icon:BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.icon||"🎥", label:"Format", value:BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.label},
                {icon:"📅", label:"Date proposée", value:booking.date?.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})},
                {icon:"⏰", label:"Créneau", value:booking.slot},
                {icon:"⏱", label:"Durée", value:selectedPhase?.name?.match(/\d+\s*(min|h)/i)?.[0]||"~1h"},
              ].map(item=>(
                <div key={item.label} style={{ background:C.cream2, borderRadius:10, padding:"9px 11px" }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:C.ink }}>{item.value||"—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Note incluse */}
        {note?.trim() && (
          <div style={{ background:C.cream2, borderRadius:13, padding:"12px 14px", marginBottom:14, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:.5 }}>Votre message</div>
            <div style={{ fontSize:12, color:C.soft, lineHeight:1.6 }}>{note}</div>
          </div>
        )}

        {/* Comment ça marche */}
        <div style={{ background:C.white, borderRadius:14, padding:"14px 16px", marginBottom:14, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:12 }}>Comment ça marche</div>
          {[
            { icon:"📨", step:"1", title:"Votre demande est envoyée", sub:`${e.name.split(" ")[0]} reçoit votre demande et vous répond.` },
            { icon:"✅", step:"2", title:"L'expert accepte", sub:"Vous recevez une notification avec la date, durée et prix confirmés." },
            { icon:"💳", step:"3", title:"Vous payez", sub:"Carte, Apple Pay ou Google Pay — seulement si vous êtes prêt." },
          ].map((s,i)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:i<2?12:0 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:C.goldL, color:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, border:`1px solid ${C.goldB}30` }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:C.ink }}>{s.title}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Garantie */}
        <div style={{ display:"flex", gap:9, alignItems:"center", background:C.sageL, borderRadius:12, padding:"10px 14px", marginBottom:20, border:"1px solid rgba(16,185,129,.2)" }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize:11, color:C.sage }}>Gratuit pour envoyer · Vous payez seulement si l'expert accepte</span>
        </div>

        {/* CTA */}
        <button onClick={handleSend} disabled={sending}
          style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", cursor:sending?"wait":"pointer", fontWeight:700, fontSize:16, fontFamily:SERIF, letterSpacing:".2px", background:sending?"#10B981":`linear-gradient(135deg,${C.gold},${C.goldB})`, color:C.white, boxShadow:`0 4px 16px rgba(110,139,61,.35)`, transition:"background .3s" }}>
          {sending ? "⏳ Envoi en cours…" : `Envoyer ma demande à ${e.name.split(" ")[0]} →`}
        </button>
        <div style={{ textAlign:"center", fontSize:11, color:C.faint, marginTop:10 }}>Aucun paiement requis maintenant</div>
      </div>
    </div>
  );
}

export default BookingScreen
