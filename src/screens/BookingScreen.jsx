import React, { useState, useEffect } from 'react'
import { C, SERIF } from '../constants/colors'
import { supabase } from '../supabase'
import { FormatIcon } from '../constants/menuIcons.jsx'
import { FORMAT_META, FORMAT_IDS, normalizeOffer, normalizeOffers, formatDuration, durationCeiling, offerSubtitle, slotStepFor, parseDurationMin } from '../constants/offers'

const BOOKING_FORMATS = FORMAT_IDS.map(id => ({ id, label: FORMAT_META[id].label, sub: FORMAT_META[id].sub }));

// Rétro-compat : parseDuree renvoie des minutes (utilisé par d'autres écrans)
export function parseDuree(str) {
  return parseDurationMin(str) ?? 30;
}

export function CalendarPicker({ expert, onDone, onSelect, slotMinutes = 30 }) {
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
      .select("date_session, session_duration, phase_name")
      .eq("expert_id", expert.id)
      .in("status", ["pending","confirmed"])
      .gte("date_session", from.toISOString())
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach(b => {
          if (!b.date_session) return;
          const dt = new Date(b.date_session);
          // On bloque toute la DURÉE, pas seulement l'heure de début : une
          // session d'1h à 10:00 ne marquait que "10:00", donc 10:15, 10:30 et
          // 10:45 restaient réservables par-dessus. Avec des offres de 15 min
          // le chevauchement était garanti.
          const mins = parseDurationMin(b.session_duration) || 60;
          for (let off = 0; off < mins; off += 15) {
            const t = new Date(dt.getTime() + off * 60000);
            const key = t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0");
            const hhmm = String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0");
            if (!map[key]) map[key] = [];
            if (!map[key].includes(hhmm)) map[key].push(hhmm);
          }
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

  // Les conseillers de démonstration ont un identifiant numérique ; les vrais
  // un uuid. Le repli « lun-ven 9h-16h » ne concerne que la démo : proposer des
  // créneaux qu'un conseiller réel n'a jamais ouverts revient à prendre un
  // rendez-vous à sa place, peut-être pendant ses heures de travail.
  const isDemoExpert = !(typeof expert?.id === "string" && expert.id.includes("-"));
  const useFallback = !hasDispo && isDemoExpert;
  const noRealDispo = !hasDispo && !isDemoExpert;

  const isAvail = (d) => {
    if (!d) return false;
    const cmp = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d <= cmp) return false;
    if (noRealDispo) return false;
    if (useFallback) {
      const day = d.getDay();
      return day !== 0 && day !== 6;
    }
    return !!savedDays[fmtKey(d)];
  };

  const getSlots = (d) => {
    if (!d) return [];
    if (noRealDispo) return [];
    if (useFallback) return ["09:00","10:00","11:00","14:00","15:00","16:00"];
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
      <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
        <div style={{ width:44, height:44, borderRadius:"50%", background:C.sageL, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
      <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Proposition envoyée !</div>
      <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:20 }}>
        Tu as proposé le <b style={{ color:C.ink }}>{selDate?.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</b> à <b style={{ color:C.ink }}>{selSlot}</b>.<br/>
        En attente de confirmation par {expert.name.split(" ")[0]}.
      </div>
      <button onClick={onDone} style={{ width:"100%", padding:"13px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:SERIF }}>Parfait !</button>
    </div>
  );

  // Conseiller réel sans aucun créneau ouvert : on le dit, et on propose la
  // seule action qui a du sens — lui écrire. Afficher un calendrier vide sans
  // explication laisse croire à une panne.
  if (noRealDispo) return (
    <div style={{ background:C.cream2, borderRadius:14, border:`1px solid ${C.border}`, padding:"22px 18px", textAlign:"center" }}>
      <div style={{ display:"flex", justifyContent:"center", marginBottom:11 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:C.white, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>
        </div>
      </div>
      <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:6 }}>
        {expert?.name?.split(" ")[0] || "Ce conseiller"} n'a pas encore ouvert de créneaux
      </div>
      <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.6 }}>
        Écris-lui pour convenir d'un moment — il recevra ta demande et pourra ouvrir une date.
      </div>
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
  // Si l'offre n'a qu'un format, on le pré-sélectionne (moins de friction)
  useEffect(() => {
    const o = selectedPhase ? normalizeOffer(selectedPhase) : null;
    setSelectedFormat(o && o.formats.length === 1 ? o.formats[0] : null);
  }, [selectedPhase]);
  const [booking, setBooking] = useState({ date:null, slot:null });
  const [note, setNote] = useState("");
  // Envoi de la demande (le paiement réel se fait ensuite via Stripe Checkout,
  // écran Réservations). Aucun formulaire de carte ici : Savvy ne touche jamais
  // les données bancaires — c'est Stripe qui les collecte, sur sa page.
  const [sending, setSending] = useState(false);

  // Offre normalisée = source de vérité unique (durée, formats, prix).
  const offer = selectedPhase ? normalizeOffer(selectedPhase) : null;
  const formatsToShow = offer
    ? BOOKING_FORMATS.filter(f => offer.formats.includes(f.id))
    : BOOKING_FORMATS;

  // Une offre qui ne propose qu'un format transforme l'étape « Choisir le
  // format » en écran à une seule option : le client vient de lire
  // « Vidéocall » sur l'offre, on lui redemande de choisir Vidéocall. On saute
  // l'étape et le parcours passe de 4 à 3 écrans.
  const singleFormat = formatsToShow.length === 1;
  const steps = singleFormat
    ? [{s:"offre",l:"Offre"},{s:"date",l:"Date"},{s:"confirm",l:"Demande"}]
    : [{s:"offre",l:"Offre"},{s:"format",l:"Format"},{s:"date",l:"Date"},{s:"confirm",l:"Demande"}];

  // Valeurs transmises à la réservation
  const chosenFormat = FORMAT_META[selectedFormat]?.short || "Vidéo";
  const chosenDuree = offer ? formatDuration(offer.durationMin) : "1h";
  const slotStep = offer ? slotStepFor(offer.durationMin) : 60;

  const Header = () => (
    <div style={{ background:C.white, padding:"13px 16px 12px", borderBottom:`1px solid ${C.border}`, boxShadow:`0 1px 6px ${C.sh}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:11, marginBottom:12 }}>
        <button onClick={() => step==="offre" ? onBack() : step==="format" ? setStep("offre") : step==="date" ? setStep(singleFormat ? "offre" : "format") : setStep("date")} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:34, height:34, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>
          {step==="offre" ? "Choisir une offre" : step==="format" ? "Choisir le format" : step==="date" ? "Choisir la date" : "Envoyer la demande"}
        </span>
      </div>
      {/* Progress */}
      <div style={{ display:"flex", gap:6 }}>
        {steps.map((item,i) => (
          <div key={item.s} style={{ flex:1, height:3, borderRadius:2, background:steps.findIndex(x=>x.s===step) >= i ? C.gold : C.cream3, transition:"background .3s" }}/>
        ))}
      </div>
      <div style={{ display:"flex", gap:0, marginTop:8 }}>
        {steps.map((item,i)=>(
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
            const nb = normalizeOffer(p);
            const isParcours = nb.kind === "parcours";
            return (
              <div key={p.id} onClick={()=>setSelectedPhase(p)}
                style={{ background:isSel?C.ink:C.white, borderRadius:14, border:`2px solid ${isSel?C.ink:(isParcours?C.goldB:C.border)}`, padding:"14px 16px", cursor:"pointer", transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ flex:1 }}>
                    {isParcours && (
                      <span style={{ fontSize:9.5, fontWeight:800, letterSpacing:.4, padding:"2px 8px", borderRadius:20, background:isSel?"rgba(255,255,255,.15)":C.goldL, color:isSel?C.white:C.gold, marginBottom:5, display:"inline-block" }}>
                        PARCOURS · {nb.sessionsIncluded} RDV{nb.durationWeeks?` · ${nb.durationWeeks} sem.`:""}
                      </span>
                    )}
                    <div style={{ fontSize:14, fontWeight:700, color:isSel?C.white:C.ink, fontFamily:SERIF }}>{nb.name}</div>
                    {p.tag && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:isSel?"rgba(255,255,255,.15)":C.goldL, color:isSel?C.white:C.gold, fontWeight:700, marginTop:4, display:"inline-block" }}>{p.tag}</span>}
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    <span style={{ fontSize:20, fontWeight:700, color:isSel?C.white:C.ink, fontFamily:SERIF }}>{nb.price}€</span>
                    <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${isSel?"transparent":C.border}`, background:isSel?C.white:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {isSel && <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </div>
                </div>
                {/* Format et durée viennent de l'offre normalisée : la durée
                    s'affiche comme un plafond ("jusqu'à 30 min"), pas comme un
                    temps dû. La description libre de l'expert vient dessous. */}
                <div style={{ fontSize:12, color:isSel?"rgba(253,252,248,.7)":C.muted, lineHeight:1.5 }}>
                  {offerSubtitle(p)}{isParcours?" / rendez-vous":""}
                </div>
                {/* La promesse : c'est ce que le client paie, surtout à 3 chiffres. */}
                {nb.outcome && (
                  <div style={{ fontSize:12, color:isSel?"rgba(253,252,248,.85)":C.ink, lineHeight:1.5, marginTop:7, paddingLeft:9, borderLeft:`3px solid ${isSel?"rgba(255,255,255,.3)":C.gold}` }}>
                    <span style={{ fontWeight:700 }}>À la fin : </span>{nb.outcome}
                  </div>
                )}
                {isParcours && nb.deliverables && (
                  <div style={{ fontSize:11.5, color:isSel?"rgba(253,252,248,.6)":C.soft, lineHeight:1.5, marginTop:5 }}>
                    {nb.deliverables}
                  </div>
                )}
                {(() => {
                  const free = (p.what || p.desc || "").trim();
                  const auto = /^(vidéocall|appel audio|document|chat|accompagnement)\s*\d/i.test(free);
                  return free && !auto ? (
                    <div style={{ fontSize:12, color:isSel?"rgba(253,252,248,.55)":C.soft, lineHeight:1.5, marginTop:3 }}>{free}</div>
                  ) : null;
                })()}
              </div>
            );
          })}
        </div>
        <button onClick={()=>{
            if(!selectedPhase){alert("Choisissez une offre."); return;}
            // Un seul format possible : on le retient et on passe directement
            // à la date, au lieu d'un écran à une option.
            if (singleFormat) { setSelectedFormat(formatsToShow[0].id); setStep("date"); return; }
            setStep("format");
          }}
          style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:SERIF,
            background:selectedPhase?`linear-gradient(135deg,${C.gold},${C.goldB})`:C.cream3, color:selectedPhase?C.white:C.muted }}>
          {/* Le titre de l'offre est déjà lu juste au-dessus : le répéter dans
              le bouton alourdit sans rien apprendre. */}
          {selectedPhase ? "Continuer →" : "Sélectionnez une offre"}
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
                <div style={{ width:48, height:48, borderRadius:13, background:isSelected?"rgba(253,252,248,.12)":C.cream2, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:isSelected?C.white:C.gold }}><FormatIcon f={f.id} size={22}/></div>
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
          {selectedFormat ? `Continuer avec ${BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.label} →` : "Sélectionnez un format"}
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
          <span style={{ display:"flex", color:C.gold }}><FormatIcon f={selectedFormat} size={20}/></span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.ink }}>{BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.label}</div>
            <div style={{ fontSize:11, color:C.muted }}>Format sélectionné</div>
          </div>
          {/* Rien à modifier quand l'offre n'accepte qu'un format. */}
          {!singleFormat && (
            <button onClick={()=>setStep("format")} style={{ fontSize:11, color:C.gold, fontWeight:700, background:C.goldL, border:`1px solid ${C.goldB}`, borderRadius:20, padding:"3px 10px", cursor:"pointer", fontFamily:"inherit" }}>Modifier</button>
          )}
        </div>

        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:12, fontFamily:SERIF }}>Choisir une date & un créneau</div>
        <CalendarPicker expert={e} slotMinutes={slotStep} onSelect={({date,slot})=>setBooking({date,slot})}/>

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
    onConfirm({date:booking.date, slot:booking.slot, note, format:chosenFormat, duree:chosenDuree});
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
                {(()=>{ const rt=e.metrics?.find(m=>m.label?.includes("réponse")||m.label?.includes("response")); return rt ? <div style={{ fontSize:10, color:C.sage, fontWeight:600, marginTop:2, display:"flex", alignItems:"center", gap:4 }}><svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Répond généralement {rt.value}</div> : null; })()}
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:20, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{selectedPhase?.price ? `${selectedPhase.price}€` : "Devis"}</div>
                <div style={{ fontSize:10, color:C.muted }}>à régler si accepté</div>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                {icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x={1} y={5} width={15} height={14} rx={2}/></svg>, label:"Format", value:BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.label},
                {icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, label:"Date proposée", value:booking.date?.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})},
                {icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>, label:"Créneau", value:booking.slot},
                {icon:<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 14 14"/></svg>, label:"Durée", value:chosenDuree},
              ].map(item=>(
                <div key={item.label} style={{ background:C.cream2, borderRadius:10, padding:"9px 11px" }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:2, display:"flex", alignItems:"center", gap:4 }}>{item.icon} {item.label}</div>
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
            { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, step:"1", title:"Demande envoyée", sub:`${e.name.split(" ")[0]} la reçoit.` },
            { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>, step:"2", title:"Si elle est acceptée", sub:"Tu reçois une notification." },
            { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={1} y={4} width={22} height={16} rx={2}/><line x1={1} y1={10} x2={23} y2={10}/></svg>, step:"3", title:"Paiement sécurisé", sub:"Tu payes seulement après acceptation." },
          ].map((s,i)=>(
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:i<2?12:0 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:C.goldL, color:C.gold, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${C.goldB}30` }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:C.ink }}>{s.title}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{s.sub}</div>
              </div>
            </div>
          ))}
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
