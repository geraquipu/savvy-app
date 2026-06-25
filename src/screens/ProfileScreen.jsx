import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';
import { C, SERIF, SANS } from '../constants/colors';
import { DEMO_USERS, CATS, SUBCATS, TRUST_LEVELS, getTrustLevel, getBookings, EXPERTS } from '../constants/data';
import { EXPERT_EXTRAS, EXPERT_STYLE_TAGS, EXPERT_FIRST_SESSION } from '../constants/expertExtras';
import { SESSIONS_AVENIR, SESSIONS_PASSEES, SESSIONS_ANNULEES } from '../constants/sessionData';
import { Stars, Av } from '../components/ui';
import { MENU_ICONS } from '../constants/menuIcons.jsx';

const AVIS_DONNES = [
  { id:1, eid:1, date:"15 mai 2025", stars:5, text:"Marie est extraordinaire — pédagogue, patiente et très pro. Mes macarons sont enfin réussis !" },
  { id:2, eid:4, date:"8 mai 2025",  stars:5, text:"Lucas connaît chaque détail de la douane colombienne. Rapport livré en 24h, impeccable." },
];

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

const generateFacturesPDF = (userName, isExpert) => {
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

const generateCGUPDF = () => {
  const body = '<h2>Conditions G&eacute;n&eacute;rales d&#39;Utilisation</h2>'
    + '<p style="font-size:12px;color:#78716C">Derni&egrave;re mise &agrave; jour : 1er janvier 2025</p>'
    + '<h2>1. Objet</h2>'
    + '<p>Savvy est une marketplace mettant en relation des experts (&laquo;&nbsp;Conseillers&nbsp;&raquo;) avec des particuliers ou professionnels souhaitant b&eacute;n&eacute;ficier de conseils bas&eacute;s sur une exp&eacute;rience r&eacute;elle.</p>'
    + '<h2>2. Commission Savvy</h2>'
    + '<p>Savvy pr&egrave;l&egrave;ve une commission de 20% sur chaque transaction. Le Conseiller re&ccedil;oit 80% du montant pay&eacute; par le Client.</p>'
    + '<h2>3. Politique d&#39;annulation</h2>'
    + '<p>+48h avant la session&nbsp;: remboursement 100%. Entre 24h et 48h&nbsp;: remboursement 70%. Moins de 24h&nbsp;: remboursement 50%. Si l&#39;expert annule&nbsp;: remboursement int&eacute;gral automatique.</p>'
    + '<h2>4. Responsabilit&eacute;s</h2>'
    + '<p>Savvy agit en tant qu&#39;interm&eacute;diaire technique. Les conseils prodigu&eacute;s sont sous la responsabilit&eacute; exclusive du Conseiller.</p>'
    + '<h2>5. Protection des donn&eacute;es</h2>'
    + '<p>Le traitement des donn&eacute;es personnelles est conforme au RGPD. Pour toute demande&nbsp;: privacy@savvy.fr</p>';
  openPDF('CGU Savvy', body);
};

function TrustBadge({ score, size="sm" }) {
  const level = getTrustLevel(score||0);
  if (size === "lg") return (
    <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, background:level.bg, border:`1.5px solid ${level.border}`, borderRadius:20, padding:"5px 14px" }}>
        <span style={{ fontSize:12, fontWeight:700, color:level.color }}>{level.label}</span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <div style={{ height:4, width:80, background:"rgba(0,0,0,.08)", borderRadius:2, overflow:"hidden" }}>
          <div style={{ width:`${score}%`, height:"100%", background:level.color, borderRadius:2 }}/>
        </div>
        <span style={{ fontSize:10, color:level.color, fontWeight:700 }}>{score}/100</span>
      </div>
    </div>
  );
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:level.bg, border:`1px solid ${level.border}`, borderRadius:20, padding:"3px 10px" }}>
      <span style={{ fontSize:10, fontWeight:700, color:level.color }}>{level.label}</span>
    </div>
  );
}

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
                <span style={{fontSize:16,flexShrink:0}}>{fmt.icon}</span>
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
          onSave({name:name.trim(),price:Number(price),duree,formats});
        }} style={{flex:2,padding:"10px",borderRadius:10,border:"none",background:C.ink,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>Enregistrer ✓</button>
      </div>
    </div>
  );
}

function ProfileScreen({ onSignup, onViewPublic, isExpert, onBecomeExpert, onLogout, authUser, isLoggedIn, onLogin, onNavigate, newExpertProfile, initExpSection, appMode, onRequestsChange, uploadPhoto }) {
  const [mode, setMode] = useState(initExpSection ? "expert" : (appMode==="expert"&&isExpert ? "expert" : "client"));
  // ── Navigation sections lifted here to survive parent re-renders ──
  const [clientSection, setClientSection] = useState(null);
  const [clientSubSection, setClientSubSection] = useState(null);
  const [expSection, setExpSection] = useState(initExpSection||null);
  const [expSubSection, setExpSubSection] = useState(null);
  const [clientSessionFilter, setClientSessionFilter] = useState("semaine");
  const [clientPayFilter, setClientPayFilter] = useState("mois");
  const [clientCercleTab, setClientCercleTab] = useState("favoris");
  const [clientSearchPay, setClientSearchPay] = useState("");
  const [clientMoisFilter, setClientMoisFilter] = useState("Tous");
  const [expSessionFilter, setExpSessionFilter] = useState("semana");
  const [expRevFilter, setExpRevFilter] = useState("mes");
  const [expNotifToggles, setExpNotifToggles] = useState({ nuevas_resa:true, clientes:true, rappels:true, newsletter:false });
  const [expShowShareModal, setExpShowShareModal] = useState(false);
  const [clientShowReferModal, setClientShowReferModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(null); // {session, step:"choose"|"confirm", type:"exp"|"cli"}
  const [clientProfileModal, setClientProfileModal] = useState(null); // request object
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleHeure, setRescheduleHeure] = useState("");
  const [clientNotifToggles, setClientNotifToggles] = useState({ messages:true, reservations:true, offres:false, rappels:true });
  const [helpMsgSent, setHelpMsgSent] = useState(false);
  const [helpMsgText, setHelpMsgText] = useState("");
  const [convoOpen, setConvoOpen] = useState(null);
  const [openSection, setOpenSection] = useState(null);
  const [showRevenu, setShowRevenu] = useState(false);
  const [showFavs, setShowFavs] = useState(false);
  const [depenseFilter, setDepenseFilter] = useState("mois");
  const [notifSettings, setNotifSettings] = useState({
    messages:true, reservations:true, offres:false,
    nouvelles_resa:true, clients:true, rappels:true, newsletter:false
  });
  const toggleNotif = key => setNotifSettings(s=>({...s,[key]:!s[key]}));
  const [showAvis, setShowAvis] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditExpert, setShowEditExpert] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editOfferData, setEditOfferData] = useState({}); // {name,price,duree,formats}
  const [editingInfo, setEditingInfo] = useState(null); // "email"|"name"|null
  const [editInfoVal, setEditInfoVal] = useState("");
  const [editInfoSaved, setEditInfoSaved] = useState(false);
  const [userEmail, setUserEmail] = useState(""); // vide = utilise USER.email par défaut
  const [userName, setUserName] = useState("");
  const isNewExpert = !!newExpertProfile; // true = vient de créer son profil → tout vide
  // Sync requests count to App for BottomNav badge
  const setExpRequestsWithSync = (val) => {
    setExpRequests(val);
    const newCount = typeof val === "function" ? null : val.length;
    if (newCount !== null && onRequestsChange) onRequestsChange(newCount);
  };
  const [expOffres, setExpOffres] = useState(isNewExpert ? (newExpertProfile?.phases||[]) : null);
  const saveOffres = async (newOffres) => {
    setExpOffres(newOffres);
    if (authUser?.real && authUser?.id) {
      await supabase.from("experts").update({ offres: newOffres }).eq("user_id", authUser.id);
    }
  };
  // dispoKey must be defined before _lsBookingsForExpert which uses it in useState initializers
  const dispoKey = authUser?.id || authUser?.initials || (authUser?.isExpert ? "GQ" : "SM");
  const _lsBookingsForExpert = (status) => getBookings()
    .filter(b => b.status === status && (b.expertInitials === dispoKey || String(b.expertId) === String(authUser?.id)))
    .map(b => ({
      id: b.id, _fromLS: true,
      client: "Client Savvy", ini: "CS", bg: "#EDE9FE", col: "#7C3AED",
      date: b.date, heure: b.slot, duree: b.duration||"1h",
      format: b.format||"Vidéo", domaine: b.phase||"Conseil",
      msg: `Demande de session : ${b.topic}`, pays: "France", langue: "FR",
      why: b.topic,
      hoursUntil: b.hoursUntil||48, statut: "confirmé",
    }));
  const [expRequests, setExpRequests] = useState(() => [
    ...(_lsBookingsForExpert("pending")),
    ...((isNewExpert || authUser?.real) ? [] : [
      {id:"req1", client:"Sophie Martin", ini:"SM", bg:"#EDE9FE", col:"#7C3AED", date:"Demain", heure:"14h00", duree:"30 min", format:"Vidéo", domaine:"Reconversion pro", msg:"Bonjour, j'aimerais un conseil sur ma reconversion. Êtes-vous disponible ?", pays:"France", langue:"FR", why:"Je veux changer de secteur mais je ne sais pas par où commencer."},
      {id:"req2", client:"Nadia Kouki",   ini:"NK", bg:"#FEF3C7", col:"#92400E", date:"Jeudi",  heure:"11h00", duree:"45 min", format:"Appel", domaine:"Import/Export",    msg:"Je cherche de l'aide pour comprendre les formalités douanières.", pays:"Maroc", langue:"FR", why:"Je lance une activité d'import mais les formalités me bloquent."},
    ]),
  ]);
  const [expConfirmed, setExpConfirmed] = useState(() => [
    ...(_lsBookingsForExpert("confirmed")),
    ...((isNewExpert || authUser?.real) ? [] : [
      {id:"es1", client:"Sophie Martin",  ini:"SM", bg:"#EDE9FE", col:"#7C3AED", date:"Aujourd'hui", heure:"14h00", duree:"30 min", format:"Vidéo", statut:"confirmé",   hoursUntil:6},
      {id:"es2", client:"Lucas Bernard",  ini:"LB", bg:"#DBEAFE", col:"#1D4ED8", date:"Demain",      heure:"10h00", duree:"45 min", format:"Vidéo", statut:"confirmé",   hoursUntil:22},
      {id:"es3", client:"Emma Petit",     ini:"EP", bg:"#D1FAE5", col:"#065F46", date:"Jeudi 12 juin", heure:"16h30", duree:"60 min", format:"Vidéo", statut:"confirmé", hoursUntil:168},
      {id:"es4", client:"Pierre Durand",  ini:"PD", bg:"#FEF3C7", col:"#92400E", date:"Lun. 23 juin",  heure:"09h00", duree:"30 min", format:"Vidéo", statut:"confirmé", hoursUntil:420},
    ]),
  ]);
  const [expCancelled, setExpCancelled] = useState([]);
  const [expSessionTab, setExpSessionTab] = useState("recues"); // "recues"|"confirmees"|"annulees"
  const [readNotifIds, setReadNotifIds] = useState([]);

  // ── Charger les bookings Supabase pour l'expert réel ──
  const [resolvedExpertId, setResolvedExpertId] = useState(authUser?.expertId || null);
  useEffect(() => {
    if (!authUser?.real || !authUser?.isExpert) return;
    if (authUser?.expertId) { setResolvedExpertId(authUser.expertId); return; }
    // Fallback: chercher l'expertId si absent de authUser (session antérieure)
    supabase.from("experts").select("id").eq("user_id", authUser.id).single()
      .then(({data, error}) => {
        if(data?.id) setResolvedExpertId(data.id);
      });
  }, [authUser?.id, authUser?.expertId]);

  useEffect(() => {
    const eid = resolvedExpertId;
    if (!authUser?.real || !eid) return;
    const load = async () => {
      const { data, error } = await supabase.from("bookings")
        .select("*")
        .eq("expert_id", eid)
        .order("date_requested", { ascending: false });
      if (error) console.warn("[Sessions] bookings error:", error.message);
      if (!data) return;
      // Fetch client names from profiles
      const clientIds = [...new Set(data.map(b=>b.client_id).filter(Boolean))];
      const profileMap = {};
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", clientIds);
        (profiles||[]).forEach(p => { profileMap[p.id] = p.name; });
      }
      const toRequest = b => {
        const clientName = profileMap[b.client_id] || "Client Savvy";
        const initials = clientName.split(" ").map(w=>w[0]||"").join("").toUpperCase().slice(0,2) || "CS";
        return { id:b.id, _fromSB:true, client:clientName, ini:initials, bg:"#EDE9FE", col:"#7C3AED",
          date: b.date_session ? new Date(b.date_session).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}) : "À définir",
          heure: b.date_session ? new Date(b.date_session).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : "",
          duree:"1h", format:"Vidéo", domaine:b.phase_name||"Conseil",
          msg:`Demande : ${b.phase_name||"Session"}`, why:b.notes||"", pays:"France", langue:"FR",
          status: b.status, hoursUntil:48,
        };
      };
      const sbPending   = data.filter(b=>b.status==="pending").map(toRequest);
      const sbConfirmed = data.filter(b=>b.status==="confirmed").map(toRequest);
      const sbCancelled = data.filter(b=>b.status==="cancelled").map(toRequest);
      setExpRequests(prev => {
        const sbIds = new Set(sbPending.map(r=>r.id));
        return [...sbPending, ...prev.filter(r=>!r._fromSB&&!sbIds.has(r.id))];
      });
      setExpConfirmed(prev => {
        const sbIds = new Set(sbConfirmed.map(r=>r.id));
        return [...sbConfirmed, ...prev.filter(r=>!r._fromSB&&!sbIds.has(r.id))];
      });
      setExpCancelled(prev => {
        const sbIds = new Set(sbCancelled.map(r=>r.id));
        return [...sbCancelled, ...prev.filter(r=>!r._fromSB&&!sbIds.has(r.id))];
      });
      if(onRequestsChange) onRequestsChange(sbPending.length);
    };
    load();
    const channel = supabase.channel("expert-bookings-profile-"+eid)
      .on("postgres_changes", { event:"*", schema:"public", table:"bookings", filter:`expert_id=eq.${eid}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedExpertId]);
  const [offresOpen, setOffresOpen] = useState(false);
  const [activiteOpen, setActiviteOpen] = useState(false);
  // Disponibilités — persistent state (sauvegardé en localStorage, clé par utilisateur)
  const [dispoMonth, setDispoMonth] = useState(()=>{ const d=new Date(); return new Date(d.getFullYear(),d.getMonth(),1); });
  const [dispoSelected, setDispoSelected] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(`savvy_dispo_days_${dispoKey}`))||{}; }catch{ return {}; } });
  const [dispoHours, setDispoHours] = useState(()=>{ try{ return JSON.parse(localStorage.getItem(`savvy_dispo_hours_${dispoKey}`))||{}; }catch{ return {}; } });
  // Load availability from Supabase on mount
  useEffect(() => {
    if (!resolvedExpertId) return;
    supabase.from("availability").select("*").eq("expert_id", resolvedExpertId).then(({ data }) => {
      if (!data?.length) return;
      // Build day-of-week map → expand to next 60 days
      const dowMap = {};
      data.forEach(r => { dowMap[r.day_of_week] = { start: r.start_time, end: r.end_time }; });
      const sel = {}, hrs = {};
      const today = new Date(); today.setHours(0,0,0,0);
      for (let i = 0; i < 60; i++) {
        const d = new Date(today); d.setDate(today.getDate() + i);
        const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
        if (dowMap[dow]) {
          const key = d.toISOString().slice(0,10);
          sel[key] = true;
          hrs[key] = dowMap[dow].start + "-" + dowMap[dow].end;
        }
      }
      setDispoSelected(sel);
      setDispoHours(hrs);
    });
  }, [resolvedExpertId]);
  const [dispoEditDay, setDispoEditDay] = useState(null);
  const [dispoSaved, setDispoSaved] = useState(false);
  const _photoKey = `savvy_photo_${dispoKey}`;
  const [photoUrl, _setPhotoUrl] = useState(() => {
    const saved = newExpertProfile?.photoUrl || authUser?.photoUrl;
    if (saved) return saved;
    try { return localStorage.getItem(_photoKey) || null; } catch { return null; }
  });
  const setPhotoUrl = (url) => {
    _setPhotoUrl(url);
    try { if (url) localStorage.setItem(_photoKey, url); else localStorage.removeItem(_photoKey); } catch {}
  };
  const photoInputRef = useRef();
  const [revenuFilter, setRevenuFilter] = useState("mois");
  const [showExpertProfile, setShowExpertProfile] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [legalModal, setLegalModal] = useState(null);
  const [editNom, setEditNom] = useState(false);
  // nomValue initialized from actual user
  const getUserName = () => {
    if (authUser?.real) return authUser.name; // utilisateur Supabase réel
    if (authUser?.isExpert) return DEMO_USERS.expert.name || "German Quintana";
    return DEMO_USERS.client.name || "Sophie Martin";
  };
  const [nomValue, setNomValue] = useState(getUserName);

  // Profile edits — persistent (must be before USER so profileEdits is in scope)
  const profileEditsKey = `savvy_profile_${dispoKey}`;
  const [profileEdits, setProfileEdits] = useState(() => { try { return JSON.parse(localStorage.getItem(profileEditsKey))||{}; } catch { return {}; } });
  const saveProfileEdit = (field, val) => { const u={...profileEdits,[field]:val}; setProfileEdits(u); try{localStorage.setItem(profileEditsKey,JSON.stringify(u));}catch{} };
  const [editingParam, setEditingParam] = useState(null);
  const [editParamVal, setEditParamVal] = useState("");

  // USER — données du compte connecté (réel Supabase ou démo)
  const activeUser = authUser?.real ? authUser : (authUser?.isExpert ? DEMO_USERS.expert : DEMO_USERS.client);
  const realName = authUser?.real ? (authUser.name||"Utilisateur") : null;
  const USER = {
    initials: newExpertProfile?.initials || (authUser?.real
      ? realName.split(/[\s._-]+/).map(w=>w[0]).join("").slice(0,2).toUpperCase()
      : (activeUser?.initials || "GQ")),
    prenom:   profileEdits.prenom  || newExpertProfile?.prenom || (realName || activeUser?.name || "German Quintana").split(/[\s._-]+/)[0].replace(/^./,c=>c.toUpperCase()),
    nom:      profileEdits.nom     || newExpertProfile?.nom || (authUser?.real ? "" : (activeUser?.name || "German Quintana").split(" ").slice(1).join(" ")),
    email:    activeUser?.email || "german@savvy.fr",
    location: profileEdits.location|| newExpertProfile?.location || "Paris, France",
    since:    authUser?.real ? "Juin 2026" : "Mai 2025",
  };

  // EXPERT_DATA — données de l'expert connecté
  const [sbExpertData, setSbExpertData] = useState(null);
  const [realStats, setRealStats] = useState({ sessions: 0, clients: 0, revenu: 0, rating: null, reviewCount: 0 });
  useEffect(() => {
    if (!authUser?.real || !authUser?.isExpert) return;
    supabase.from("experts").select("*").eq("user_id", authUser.id).single()
      .then(({ data }) => {
        if (data) {
          setSbExpertData(data);
          const offers = data.offres || data.phases || [];
          if (offers.length > 0) setExpOffres(offers);
          // Load real stats
          Promise.all([
            supabase.from("bookings").select("id, phase_price, client_id", { count: "exact" }).eq("expert_id", data.id).eq("status", "confirmed"),
            supabase.from("reviews").select("stars").eq("expert_id", data.id),
          ]).then(([bookRes, revRes]) => {
            const bookings = bookRes.data || [];
            const reviews = revRes.data || [];
            const sessions = bookings.length;
            const clients = new Set(bookings.map(b => b.client_id)).size;
            const revenu = bookings.reduce((s, b) => s + Math.round((b.phase_price || 0) * 0.8), 0);
            const rating = reviews.length > 0 ? +(reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1) : null;
            setRealStats({ sessions, clients, revenu, rating, reviewCount: reviews.length });
          });
        }
      });
  }, [authUser?.id, authUser?.isExpert]);
  const expertUser = newExpertProfile || (authUser?.real ? sbExpertData : null) || (authUser?.real ? null : EXPERTS.find(e => e.initials === (activeUser?.initials || "GQ"))) || (authUser?.real ? null : EXPERTS[EXPERTS.length-1]);
  const expertExtras = newExpertProfile
    ? { resout: newExpertProfile.phases?.map(p=>p.what)||[], reviews:[], preuves: newExpertProfile.creds||[] }
    : (EXPERT_EXTRAS[expertUser?.id] || { resout:[], reviews:[], preuves:[] });
  const EXPERT_DATA = {
    prenom:    (expertUser?.name || activeUser?.name || "German Quintana").split(" ")[0],
    nom:       (expertUser?.name || activeUser?.name || "German Quintana").split(" ").slice(1).join(" "),
    initials:  expertUser?.initials || "GQ",
    location:  (expertUser?.location || "Paris") + ", " + (expertUser?.country || "France"),
    since:     "Mai 2025",
    actif:     (expertUser?.reviews || 0) > 0 ? "Très actif" : "Nouveau",
    langs:     (expertUser?.langs || ["FR"]).map(l => ({
      flag:  l==="FR"?"🇫🇷":l==="EN"?"🇬🇧":l==="ES"?"🇪🇸":l==="DE"?"🇩🇪":"🌍",
      label: l==="FR"?"Français":l==="EN"?"English":l==="ES"?"Español":l==="DE"?"Deutsch":l
    })),
    domain:    (expertUser?.role || "Industrie").split("·")[0].trim(),
    probleme:  expertUser?.tagline || "",
    impact:{
      sessions:    authUser?.real ? realStats.sessions : (expertUser?.reviews || 0),
      clients:     authUser?.real ? realStats.clients  : Math.floor((expertUser?.reviews || 0) * .87),
      satisfaction: authUser?.real ? (realStats.rating ? Math.round(realStats.rating/5*100) : 0) : (expertUser?.rating ? Math.round(expertUser.rating/5*100) : 0),
      revenu:      authUser?.real ? realStats.revenu   : (expertUser?.reviews || 0) * Math.round((expertUser?.phases?.[0]?.price || 50) * .8),
    },
    rating:      authUser?.real ? realStats.rating : (expertUser?.rating || null),
    reviewCount: authUser?.real ? realStats.reviewCount : (expertUser?.reviews || 0),
    offres: (expertUser?.offres || expertUser?.phases || []).map(p => ({
      name:    p.name,
      price:   p.price,
      format:  p.format,
      formats: p.formats,
      duree:   p.duree,
      icon:    "💼",
    })),
    preuves:    (expertExtras.preuves || []).map(t => ({ icon:"✦", text:t })),
    trustScore: expertUser?.trustScore || 72,
  };

  const [pwdStep, setPwdStep] = useState(1);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showPwdCurrent, setShowPwdCurrent] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  // Session confirm toast
  const [sessionConfirmToast, setSessionConfirmToast] = useState(null);
  if (!isLoggedIn) return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80, background:C.cream }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"36px 24px 32px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(185,134,74,.05)" }}/>
        <div style={{ position:"relative" }}>
          <div style={{ width:70, height:70, borderRadius:"50%", background:"rgba(185,134,74,.15)", border:`2px solid ${C.goldB}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:30 }}>👤</div>
          <h2 style={{ fontSize:22, fontWeight:700, color:C.white, margin:"0 0 8px", fontFamily:SERIF, letterSpacing:"-.3px" }}>
            Bienvenue sur Savvy
          </h2>
          <p style={{ fontSize:13, color:"rgba(253,252,248,.6)", margin:"0 0 24px", lineHeight:1.6 }}>
            Connecte-toi pour accéder à tes sessions,<br/>tes messages et ton profil.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={onLogin} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:`linear-gradient(135deg,${C.gold},${C.goldB})`, color:C.white, fontFamily:SERIF, boxShadow:`0 4px 16px rgba(185,134,74,.35)` }}>
              Se connecter →
            </button>
            <button onClick={onLogin} style={{ width:"100%", padding:"13px", borderRadius:13, border:"1.5px solid rgba(253,252,248,.2)", cursor:"pointer", fontWeight:600, fontSize:14, background:"transparent", color:C.white, fontFamily:"inherit" }}>
              Créer un compte gratuitement
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding:"20px 18px 0" }}>

        {/* Devenir conseiller */}
        <div onClick={onLogin} style={{ background:`linear-gradient(135deg,${C.ink},#2C2825)`, borderRadius:16, padding:"16px", marginBottom:20, display:"flex", gap:14, alignItems:"center", cursor:"pointer", border:`1px solid rgba(185,134,74,.2)` }}>
          <div style={{ width:46, height:46, borderRadius:13, background:"rgba(185,134,74,.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>✦</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.white, fontFamily:SERIF, marginBottom:3 }}>Devenir conseiller Savvy</div>
            <div style={{ fontSize:12, color:"rgba(253,252,248,.55)" }}>Partage ton expertise · garde 80%</div>
          </div>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.goldB} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        {/* Menu public */}
        <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:20 }}>

          {/* Centre d\'aide */}
          <div style={{ borderBottom:`1px solid ${C.borderF}` }}>
            <div style={{ padding:"14px 16px", cursor:"pointer" }}>
              <div style={{ display:"flex", alignItems:"center", gap:13 }}>
                <div style={{ width:38, height:38, borderRadius:11, background:"#FEF3C7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>❓</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>Centre d\'aide</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Questions fréquentes · Comment ça marche</div>
                </div>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              {/* FAQ intégrée */}
              <div style={{ marginTop:13, paddingTop:13, borderTop:`1px solid ${C.borderF}` }}>
                {[
                  {q:"Comment fonctionne Savvy ?",     a:"Tu choisis un expert, tu réserves une session et tu reçois des conseils basés sur son expérience réelle. Pas de théorie — que du vécu."},
                  {q:"Comment se passe le paiement ?", a:"Le paiement est sécurisé. Tu paies au moment de la réservation. L\'expert reçoit 80% et Savvy garde 20% pour la plateforme."},
                  {q:"Est-ce que c\'est vraiment sécurisé ?", a:"Oui. Tous les profils sont vérifiés par l\'équipe Savvy. Les paiements sont chiffrés et tu es remboursé si la session n\'a pas lieu."},
                  {q:"Puis-je annuler une réservation ?", a:"Oui, gratuitement jusqu\'à 24h avant la session. Au-delà, des frais peuvent s\'appliquer selon la politique de l\'expert."},
                ].map((faq, i) => (
                  <div key={i} style={{ marginBottom:i<3?12:0 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:4 }}>— {faq.q}</div>
                    <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Langue */}
          <div style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", cursor:"pointer", borderBottom:`1px solid ${C.borderF}` }}>
            <div style={{ width:38, height:38, borderRadius:11, background:"#DBEAFE", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:C.soft }}>{MENU_ICONS["🌍"]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>Langue</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Français · English · Español</div>
            </div>
            <div style={{ fontSize:12, fontWeight:600, color:C.gold }}>FR</div>
          </div>

          {/* Confidentialité */}
          <div style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", cursor:"pointer", borderBottom:`1px solid ${C.borderF}` }}>
            <div style={{ width:38, height:38, borderRadius:11, background:"#D1FAE5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:C.soft }}>{MENU_ICONS["🔒"]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>Confidentialité & données</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Comment on protège tes informations</div>
            </div>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          {/* CGU */}
          <div style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", cursor:"pointer", borderBottom:`1px solid ${C.borderF}` }}>
            <div style={{ width:38, height:38, borderRadius:11, background:"#EDE8DF", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:C.soft }}>{MENU_ICONS["📋"]}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>Conditions d\'utilisation</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>CGU · Politique de commission · Légal</div>
            </div>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          {/* Savvy.fr */}
          <div style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", cursor:"pointer" }}>
            <div style={{ width:38, height:38, borderRadius:11, background:C.goldL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🌐</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>savvy.fr</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Découvrir la plateforme en version web</div>
            </div>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:12, textAlign:"center" }}>Pourquoi faire confiance à Savvy ?</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              {icon:"✅", text:"Tous les experts sont vérifiés par notre équipe avant d\'être publiés"},
              {icon:"🔒", text:"Paiements chiffrés · Remboursement garanti si session annulée"},
              {icon:"⭐", text:"Conseillers vérifiés · 100% sécurisé · Réponse sous 24h"},
              {icon:"🇫🇷", text:"Plateforme française · Support en français · RGPD compliant"},
            ].map((t,i) => (
              <div key={i} style={{ display:"flex", gap:11, alignItems:"flex-start" }}>
                <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{t.icon}</span>
                <span style={{ fontSize:12, color:C.soft, lineHeight:1.55 }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Version */}
        <div style={{ textAlign:"center", fontSize:11, color:C.faint, paddingBottom:24 }}>
          Savvy · Version 1.0 · © 2025 Savvy SAS<br/>
          <span style={{ color:C.gold }}>Made with ✦ in Paris</span>
        </div>
      </div>
    </div>
  );

  const defaultUser = { initials:"CR", prenom:"Clément", nom:"Rousseau", email:"clement@gmail.com", location:"Paris, France", since:"Jan 2025" };
  const demoUser = authUser ? (authUser.isExpert ? DEMO_USERS.expert : DEMO_USERS.client) : defaultUser;

  // ── Header commun ──────────────────────────────────────────────────────────
  const Header = () => {
    // En mode expert, dashboard et menu principal ont leur propre en-tête
    if (mode === "expert" && (expSection === "dashboard" || expSection === null)) return null;
    // En mode client sur le menu principal profil, ClientView a son propre header — évite la duplication
    if (mode === "client" && !clientSection) return null;
    return (
    <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"26px 20px 20px" }}>
      <div style={{ display:"flex", gap:14, alignItems:"center" }}>
        <div style={{ position:"relative", flexShrink:0 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"rgba(185,134,74,.18)", border:`2px solid ${C.goldB}`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:22, color:C.goldB, fontFamily:SERIF }}>
            {USER.initials}
          </div>
          <div style={{ position:"absolute", bottom:2, right:2, width:13, height:13, borderRadius:"50%", background:C.sageMid, border:`2px solid ${C.ink}` }}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:19, fontWeight:700, color:C.white, fontFamily:SERIF, letterSpacing:"-.3px" }}>{USER.prenom} {USER.nom}</div>
          <div style={{ fontSize:11, color:"rgba(253,252,248,.5)", marginTop:3 }}>📍 {USER.location} · Membre {USER.since}</div>
        </div>
        {mode === "expert" && isExpert && (
          <div style={{ background:"rgba(16,185,129,.15)", border:"1px solid rgba(16,185,129,.3)", borderRadius:20, padding:"5px 11px" }}>
            <span style={{ fontSize:11, color:C.sage, fontWeight:700 }}>Actif</span>
          </div>
        )}
      </div>
      {/* Indicateur de mode actif */}
      <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ background: mode==="expert" ? "rgba(16,185,129,.15)" : "rgba(185,134,74,.15)", border:`1px solid ${mode==="expert"?"rgba(16,185,129,.3)":"rgba(185,134,74,.3)"}`, borderRadius:20, padding:"5px 13px", display:"inline-flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background: mode==="expert" ? "#10B981" : C.gold }}/>
          <span style={{ fontSize:11, fontWeight:700, color: mode==="expert" ? "#6EE7B7" : C.goldB }}>
            {mode==="expert" ? "⚡ Mode Expert actif" : "👤 Mode Client actif"}
          </span>
        </div>
      </div>
    </div>
  );};

  // ── Section helper ──────────────────────────────────────────────────────────
  const Section = ({ id, icon, title, sub, children }) => (
    <div style={{ borderBottom:`1px solid ${C.borderF}` }}>
      <div onClick={() => setOpenSection(openSection===id?null:id)} style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", cursor:"pointer", background:openSection===id?C.cream2:"transparent" }}>
        <div style={{ width:36, height:36, borderRadius:11, background:C.cream2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{icon}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{title}</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>{sub}</div>
        </div>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2} style={{ transform:openSection===id?"rotate(90deg)":"none", transition:".2s", flexShrink:0 }}><polyline points="9 18 15 12 9 6"/></svg>
      </div>
      {openSection === id && (
        <div style={{ background:C.cream2, padding:"8px 16px 14px", borderTop:`1px solid ${C.borderF}` }}>
          {children}
        </div>
      )}
    </div>
  );

  const Row = ({ label, value, danger }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${C.borderF}`, cursor:"pointer" }}>
      <span style={{ fontSize:12, color:danger?"#B91C1C":C.soft }}>{label}</span>
      {value
        ? <span style={{ fontSize:11, color:C.muted }}>{value}</span>
        : <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // VUE CLIENT
  // ════════════════════════════════════════════════════════════════════════════
  const ClientView = () => {
    const section = clientSection; const setSection = setClientSection;
    const subSection = clientSubSection; const setSubSection = setClientSubSection;
    const sessionFilter = clientSessionFilter; const setSessionFilter = setClientSessionFilter;
    const payFilter = clientPayFilter; const setPayFilter = setClientPayFilter;
    const cercleTab = clientCercleTab; const setCercleTab = setClientCercleTab;
    const showReferModal = clientShowReferModal; const setShowReferModal = setClientShowReferModal;
    const notifToggles = clientNotifToggles; const setNotifToggles = setClientNotifToggles;
    const toggleN = k => setClientNotifToggles(s=>({...s,[k]:!s[k]}));
    const searchPay = clientSearchPay; const setSearchPay = setClientSearchPay;
    const moisFilter = clientMoisFilter; const setMoisFilter = setClientMoisFilter;

    const _sessionsBase = authUser?.real ? [] : SESSIONS_AVENIR;
    const SESSIONS_BY_FILTER = {
      jour:    _sessionsBase.filter(s => s.hoursUntil <= 24),
      semaine: _sessionsBase.filter(s => s.hoursUntil <= 168),
      "2sem":  _sessionsBase.filter(s => s.hoursUntil <= 336),
      mois:    _sessionsBase,
    };

    const Toggle = ({ on, onToggle }) => (
      <div onClick={e=>{e.stopPropagation();onToggle();}} style={{width:44,height:26,borderRadius:13,background:on?"#10B981":"#D1D5DB",position:"relative",cursor:"pointer",transition:"background .25s",flexShrink:0}}>
        <div style={{position:"absolute",top:3,left:on?21:3,width:20,height:20,borderRadius:"50%",background:"white",transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
      </div>
    );

    const BackHeader = ({ title, sub, onBack }) => (
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0 14px",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
        <button onClick={onBack||(()=>{setSection(null);setSubSection(null);})} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{title}</div>
          {sub && <div style={{fontSize:11,color:C.muted,marginTop:1}}>{sub}</div>}
        </div>
      </div>
    );

    // Shared MenuRow — SVG icons only, no emojis (MENU_ICONS defined at module scope)
    const MenuRow = ({icon, bg, title, sub, badge, onClick}) => {
      const svgIcon = MENU_ICONS[icon];
      const iconColor = bg ? bg.replace(/^#/,"") : null;
      return (
        <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",background:C.white,borderRadius:14,border:`1px solid ${C.border}`,marginBottom:8,cursor:"pointer"}}>
          <div style={{width:42,height:42,borderRadius:12,background:bg||C.cream2,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.soft}}>
            {svgIcon || <span style={{fontSize:18}}>{icon}</span>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:600,color:C.ink,fontFamily:SANS}}>{title}</div>
            {sub && <div style={{fontSize:11,color:C.muted,marginTop:2,lineHeight:1.4}}>{sub}</div>}
          </div>
          {badge && <div style={{background:C.sage,color:C.white,borderRadius:20,minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,padding:"0 5px"}}>{badge}</div>}
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      );
    };

    // Sessions (direct shortcut still works)
    if (section === "sessions") return (
      <div>
        <BackHeader title="Mes sessions" sub="Ton activité avec les conseillers" onBack={()=>{setSection(null);setSubSection(null);}}/>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[{id:"jour",l:"Auj."},{id:"semaine",l:"Semaine"},{id:"2sem",l:"2 sem."},{id:"mois",l:"Mois"}].map(f=>(
            <button key={f.id} onClick={()=>setSessionFilter(f.id)} style={{flex:1,padding:"7px 4px",borderRadius:20,border:`1.5px solid ${sessionFilter===f.id?C.ink:C.border}`,background:sessionFilter===f.id?C.ink:"transparent",color:sessionFilter===f.id?C.white:C.muted,fontSize:10,fontWeight:sessionFilter===f.id?700:400,cursor:"pointer",fontFamily:"inherit"}}>
              {f.l}
            </button>
          ))}
        </div>
        {(SESSIONS_BY_FILTER[sessionFilter]||[]).length===0
          ? <div style={{textAlign:"center",padding:"32px 16px",color:C.muted,fontSize:13}}>Aucune session sur cette periode</div>
          : (SESSIONS_BY_FILTER[sessionFilter]||[]).map(s=>(
              <SessionCard key={s.id} s={s} onMsg={()=>onNavigate("messages")} onCancel={()=>setCancelModal({session:s, step:"choose", type:"cli"})} onExpert={()=>onNavigate("reservations")}/>
            ))
        }
      </div>
    );

    // ═══ MON COMPTE HUB ═══════════════════════════════════════════════════════
    if (section === "compte") {
      const goBackToCompte = () => { setSection(null); setSubSection(null); };
      const goBackToMain   = () => { setSection(null); setSubSection(null); };

      const FACTURES = [
        { id:"SAV-2025-003", mois:"mai", conseiller:"Clement Rousseau", domaine:"Vie & Reconversion",
          description:"Session video individuelle 30 min\nConseils reconversion professionnelle",
          dateSession:"15 mai 2025", dateEmission:"15 mai 2025",
          sousTotal:15, coupon:0, couponLabel:"", moyen:"Visa 4242", statut:"paye" },
        { id:"SAV-2025-002", mois:"mai", conseiller:"Marie Aubert", domaine:"Cuisine & Gastronomie",
          description:"Session video individuelle 45 min\nTechnique macarons & patisserie francaise",
          dateSession:"8 mai 2025", dateEmission:"8 mai 2025",
          sousTotal:20, coupon:0, couponLabel:"", moyen:"Visa 4242", statut:"paye" },
        { id:"SAV-2025-001", mois:"mai", conseiller:"Luis Villamil", domaine:"Business & Import/Export",
          description:"Session video individuelle 60 min\nStrategie import/export UE Amerique du Sud",
          dateSession:"2 mai 2025", dateEmission:"2 mai 2025",
          sousTotal:50, coupon:5, couponLabel:"SAVVY-BIENVENUE", moyen:"Visa 4242", statut:"paye" },
      ];

      // Recu individuel
      if (subSection && subSection.startsWith("SAV-")) {
        const f = FACTURES.find(x=>x.id===subSection);
        if (!f) return null;
        const total = f.sousTotal - f.coupon;
        return (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0 14px",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
              <button onClick={()=>setSubSection("paiements")} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div>
                <div style={{fontSize:17,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Recu de paiement</div>
                <div style={{fontSize:11,color:C.muted,marginTop:1}}>{f.id}</div>
              </div>
              <div style={{marginLeft:"auto",background:C.sageL,borderRadius:20,padding:"4px 10px"}}>
                <span style={{fontSize:10,color:C.sage,fontWeight:700}}>Paye</span>
              </div>
            </div>
            <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:14}}>
              <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,padding:"20px 20px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:24,fontWeight:800,color:C.white,fontFamily:SERIF,letterSpacing:"-.5px"}}>savvy</div>
                  <div style={{fontSize:10,color:"rgba(253,252,248,.5)",marginTop:3}}>savvy.fr</div>
                  <div style={{fontSize:10,color:"rgba(253,252,248,.4)",marginTop:1}}>Savvy SAS SIRET 123 456 789 00012</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:"rgba(253,252,248,.5)"}}>12 rue de Rivoli</div>
                  <div style={{fontSize:10,color:"rgba(253,252,248,.5)"}}>75001 Paris, France</div>
                </div>
              </div>
              <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.borderF}`}}>
                <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{USER.prenom} {USER.nom}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{USER.email} | {f.dateSession}</div>
              </div>
              <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.borderF}`}}>
                <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Conseiller: <strong style={{color:C.ink}}>{f.conseiller}</strong></div>
                <div style={{fontSize:12,color:C.muted,marginBottom:4}}>Domaine: <strong style={{color:C.ink}}>{f.domaine}</strong></div>
                <div style={{fontSize:12,color:C.muted}}>Description: <strong style={{color:C.ink}}>{f.description}</strong></div>
                <div style={{marginTop:8,fontSize:10,color:C.faint,fontStyle:"italic"}}>TVA non applicable art. 293 B du CGI</div>
              </div>
              <div style={{padding:"14px 20px"}}>
                {f.coupon>0 && (
                  <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
                    <span style={{fontSize:12,color:C.sage}}>Code promo {f.couponLabel}</span>
                    <span style={{fontSize:12,fontWeight:700,color:C.sage}}>moins {f.coupon} EUR</span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.borderF}`}}>
                  <span style={{fontSize:11,color:C.faint}}>TVA (art. 293 B CGI)</span>
                  <span style={{fontSize:11,color:C.faint}}>0,00 EUR</span>
                </div>
                <div style={{background:C.ink,borderRadius:11,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
                  <span style={{fontSize:14,fontWeight:700,color:C.white,fontFamily:SERIF}}>Total paye</span>
                  <span style={{fontSize:20,fontWeight:800,color:C.white,fontFamily:SERIF}}>{total} EUR</span>
                </div>
              </div>
            </div>
            <button onClick={()=>generateFacturesPDF(USER.prenom+" "+USER.nom,false)} style={{width:"100%",padding:"13px",borderRadius:12,border:`1.5px solid ${C.gold}`,background:C.goldL,color:C.gold,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF,marginBottom:10}}>
              Telecharger ce recu en PDF
            </button>
          </div>
        );
      }

      // Parametres du compte
      if (subSection === "parametres") {
        const acc = openSection; const setAcc = setOpenSection;
        const AccRow = ({id, icon, bg, title, sub, children}) => (
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
            <BackHeader title="Parametres du compte" onBack={goBackToCompte}/>
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
            <AccRow id="infos" icon="👤" bg="#EDE9FE" title="Informations personnelles" sub="Prenom, nom, ville, langue">
              {[["Prenom",USER.prenom],["Nom",USER.nom],["Ville","Paris, France"],["Langue","Francais"]].map(([l,v],i,arr)=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none",cursor:"pointer"}}>
                  <span style={{fontSize:13,color:C.muted}}>{l}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.ink}}>{v}</span>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              ))}
            </AccRow>
            <AccRow id="connexion" icon="🔒" bg="#DBEAFE" title="Connexion & sécurité" sub="E-mail, mot de passe">
              {/* Inline edit overlay */}
              {editingInfo && (
                <div style={{padding:"12px 16px",background:C.goldL,borderBottom:`1px solid ${C.borderF}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>
                    {editingInfo==="email"?"Modifier l'adresse e-mail":"Modifier le nom"}
                  </div>
                  <input value={editInfoVal} onChange={e=>setEditInfoVal(e.target.value)} autoFocus
                    style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.gold}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.white,marginBottom:8}}/>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{setEditingInfo(null);setEditInfoVal("");}} style={{flex:1,padding:"8px",borderRadius:9,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
                    <button onClick={()=>{
                      if(editingInfo==="email" && editInfoVal.includes("@")) setUserEmail(editInfoVal);
                      if(editingInfo==="name" && editInfoVal.trim().length>1) setUserName(editInfoVal.trim());
                      setEditInfoSaved(true); setEditingInfo(null); setEditInfoVal("");
                      setTimeout(()=>setEditInfoSaved(false),2500);
                    }} style={{flex:2,padding:"8px",borderRadius:9,border:"none",background:C.ink,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>Enregistrer ✓</button>
                  </div>
                </div>
              )}
              {editInfoSaved && <div style={{padding:"8px 16px",background:"#D1FAE5",fontSize:11,color:C.sage,fontWeight:600}}>✓ Informations mises à jour</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:`1px solid ${C.borderF}`}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.ink}}>Adresse e-mail</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>{userEmail||USER.email}</div>
                </div>
                <span onClick={()=>{setEditingInfo("email");setEditInfoVal(userEmail||USER.email);}} style={{fontSize:11,color:C.gold,fontWeight:700,cursor:"pointer"}}>Modifier</span>
              </div>
              <div onClick={()=>setShowPwdModal(true)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:`1px solid ${C.borderF}`,cursor:"pointer"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.ink}}>Mot de passe</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>••••••••</div>
                </div>
                <span style={{fontSize:11,color:C.gold,fontWeight:700}}>Modifier</span>
              </div>
              <div onClick={()=>setShowDeleteModal&&setShowDeleteModal(true)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#DC2626"}}>Supprimer le compte</div>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </AccRow>
            <AccRow id="notifs" icon="🔔" bg="#D1FAE5" title="Notifications" sub="Contrôle tes alertes">
              {[
                {k:"messages",icon:"💬",l:"Messages",desc:"Nouveaux messages de conseillers"},
                {k:"reservations",icon:"📅",l:"Réservations",desc:"Confirmations et rappels"},
                {k:"rappels",icon:"⏰",l:"Rappels",desc:"Rappel 1h avant ta session"},
                {k:"offres",icon:"✨",l:"Offres Savvy",desc:"Nouveaux conseillers et opportunités"},
              ].map((n,i,arr)=>(
                <div key={n.k} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none"}}>
                  <div style={{width:34,height:34,borderRadius:10,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{n.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{n.l}</div>
                    <div style={{fontSize:11,color:C.faint,marginTop:1}}>{n.desc}</div>
                  </div>
                  <Toggle on={notifToggles[n.k]} onToggle={()=>toggleN(n.k)}/>
                </div>
              ))}
            </AccRow>
            <button onClick={()=>{if(window.confirm("Te déconnecter de Savvy ?")){onLogout&&onLogout();}}} style={{width:"100%",marginTop:10,padding:"14px",borderRadius:13,border:"1.5px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Déconnexion
            </button>
          </div>
        );
      }

      // Paiements
      if (subSection === "paiements") {
        const MOIS = ["Tous","mai 2025","avril 2025"];
        const filtered = FACTURES.filter(f=>
          (moisFilter==="Tous"||f.mois===moisFilter.split(" ")[0]) &&
          (f.conseiller.toLowerCase().includes(searchPay.toLowerCase())||f.id.includes(searchPay))
        );
        return (
          <div>
            <BackHeader title="Paiements" sub="Solde · Méthodes · Historique" onBack={goBackToCompte}/>
            <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:16,padding:"18px 20px",marginBottom:14,color:C.white}}>
              <div style={{fontSize:11,color:"rgba(253,252,248,.5)",marginBottom:4,textTransform:"uppercase",letterSpacing:.6}}>Solde disponible</div>
              <div style={{fontSize:32,fontWeight:700,fontFamily:SERIF}}>0 EUR</div>
              <div style={{fontSize:11,color:"rgba(253,252,248,.5)",marginTop:4}}>Remboursements en attente affiches ici</div>
            </div>
            <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Méthode de paiement</div>
              <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:10,padding:"9px 0",borderBottom:`1px solid ${C.borderF}`}}>
                <span style={{fontSize:20}}>💳</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.ink}}>Visa 4242</div>
                  <div style={{fontSize:11,color:C.muted}}>Expire 12/27</div>
                </div>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:C.sageL,color:C.sage,fontWeight:700}}>Defaut</span>
              </div>
              <button style={{width:"100%",padding:"9px",borderRadius:10,border:`1px dashed ${C.gold}`,background:"transparent",color:C.gold,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+ Ajouter une methode</button>
            </div>
            <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px"}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Historique et Recus</div>
              <div style={{display:"flex",alignItems:"center",gap:8,background:C.cream2,borderRadius:10,padding:"8px 12px",marginBottom:10,border:`1px solid ${C.borderF}`}}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
                <input value={searchPay} onChange={e=>setSearchPay(e.target.value)} placeholder="Rechercher conseiller, date..." style={{flex:1,border:"none",background:"transparent",fontSize:12,color:C.ink,outline:"none",fontFamily:"inherit"}}/>
                {searchPay && <button onClick={()=>setSearchPay("")} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:C.muted,padding:0}}>x</button>}
              </div>
              <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto"}}>
                {MOIS.map(m=>(
                  <button key={m} onClick={()=>setMoisFilter(m)} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${moisFilter===m?C.ink:C.border}`,background:moisFilter===m?C.ink:"transparent",color:moisFilter===m?C.white:C.muted,fontSize:10,fontWeight:moisFilter===m?700:400,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>
                    {m}
                  </button>
                ))}
              </div>
              {filtered.length===0
                ? <div style={{textAlign:"center",padding:"24px 0",color:C.faint,fontSize:12}}>Aucun recu trouve</div>
                : filtered.map((f,i)=>(
                  <div key={f.id} onClick={()=>setSubSection(f.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<filtered.length-1?`1px solid ${C.borderF}`:"none",cursor:"pointer"}}>
                    <div style={{width:42,height:42,borderRadius:11,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>🧾</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{f.conseiller}</div>
                      <div style={{fontSize:10,color:C.muted,marginTop:2}}>{f.dateSession}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:14,fontWeight:800,color:C.ink,fontFamily:SERIF}}>{f.sousTotal-f.coupon} EUR</div>
                      <div style={{fontSize:9,color:C.sage,fontWeight:700,marginTop:2}}>Paye</div>
                    </div>
                  </div>
                ))
              }
              <button onClick={()=>generateFacturesPDF(USER.prenom+" "+USER.nom,false)} style={{width:"100%",marginTop:14,padding:"10px",borderRadius:10,border:`1px solid ${C.gold}`,background:C.goldL,color:C.gold,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                Telecharger tous les recus en PDF
              </button>
            </div>
          </div>
        );
      }

      // Mes experts favoris
      if (subSection === "favoris") return (
        <div>
          <BackHeader title="Mes experts favoris" sub="Tes conseillers de confiance" onBack={goBackToCompte}/>
          <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
            {[{id:"favoris",l:"Favoris"},{id:"historique",l:"Historique"},{id:"reco",l:"Pour toi"}].map(t=>(
              <button key={t.id} onClick={()=>setCercleTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",background:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:cercleTab===t.id?700:400,color:cercleTab===t.id?C.ink:C.muted,borderBottom:cercleTab===t.id?"2.5px solid "+C.ink:"2px solid transparent"}}>
                {t.l}
              </button>
            ))}
          </div>
          {cercleTab==="favoris" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(()=>{ try{ return JSON.parse(localStorage.getItem("savvy_favs")||"[]"); }catch{ return []; } })().map(e=>(
                <div key={e.id} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",display:"flex",gap:11,alignItems:"center"}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:e.bg||C.goldL,color:e.color||C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{e.initials}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{e.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{(e.role||"").split(".")[0].trim()}</div>
                  </div>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>
          )}
          {cercleTab==="historique" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {(authUser?.real ? [] : SESSIONS_PASSEES).map(s=>{const e=EXPERTS.find(x=>x.id===s.eid)||EXPERTS[0];return(
                <div key={s.id} onClick={()=>onNavigate&&onNavigate("reservations")} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",display:"flex",gap:11,alignItems:"center",cursor:"pointer"}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:e.bg,color:e.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{e.initials}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{e.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.date}</div>
                  </div>
                </div>
              );})}
            </div>
          )}
          {cercleTab==="reco" && (()=>{
            // Exclude experts already consulted or favourited
            const consultedIds = new Set([...SESSIONS_PASSEES.map(s=>s.eid), ...getBookings().map(b=>b.expertId)]);
            const favIds = new Set((()=>{try{return JSON.parse(localStorage.getItem("savvy_favs")||"[]");}catch{return [];}})().map(f=>f.id));
            const pool = (dbExperts||EXPERTS);
            const scored = pool.map(e=>({...e, _score:(e.rating||4)*10 + (e.reviews||0)*0.1 + Math.random()*3}))
              .sort((a,b)=>b._score-a._score);
            // Prefer new experts (not yet consulted, not fav), fall back to all
            const fresh = scored.filter(e=>!consultedIds.has(e.id)&&!favIds.has(e.id));
            const reco = (fresh.length>=3 ? fresh : scored).slice(0,3);
            return (
              <div>
                <div style={{fontSize:11,color:C.muted,marginBottom:10,paddingLeft:2}}>Basé sur tes sessions passées</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {reco.map(e=>(
                    <div key={e.id} onClick={()=>onNavigate&&onNavigate("search")} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",display:"flex",gap:11,alignItems:"center",cursor:"pointer"}}>
                      <div style={{width:42,height:42,borderRadius:"50%",background:e.bg||C.goldL,color:e.color||C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{e.initials||"?"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{e.name}</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:2}}>{(e.role||e.domain||"Conseiller").split(".")[0].trim()}</div>
                      </div>
                      <TrustBadge score={e.trustScore||70}/>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      );

      // Mon compte sub-menu
      return (
        <div>
          <BackHeader title="Mon compte" onBack={goBackToMain}/>
          <MenuRow icon="⚙️" bg="#EDE9FE" title="Parametres du compte" sub="Informations personnelles Connexion Notifications" onClick={()=>setSubSection("parametres")}/>
          <MenuRow icon="💳" bg="#DBEAFE" title="Paiements" sub="Solde disponible Methodes Historique et recus" onClick={()=>setSubSection("paiements")}/>
          <MenuRow icon="⭐" bg="#FEF3C7" title="Mes experts favoris" sub="Conseillers consultes et sauvegardes" onClick={()=>setSubSection("favoris")}/>
          <button onClick={()=>{if(window.confirm("Te déconnecter de Savvy ?")){onLogout&&onLogout();}}} style={{width:"100%",marginTop:6,padding:"14px",borderRadius:13,border:"1.5px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            Déconnexion
          </button>
        </div>
      );
    }

    // ═══ AIDE HUB ══════════════════════════════════════════════════════════════
    if (section === "aide") {
      const goBackToAide = () => { setSection(null); setSubSection(null); };
      const goBackToMain = () => { setSection(null); setSubSection(null); };

      if (subSection === "centre") return (
        <div>
          <BackHeader title="Centre d'aide" sub="On est la pour toi" onBack={goBackToAide}/>
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:16,padding:"20px",marginBottom:18,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(185,134,74,.08)"}}/>
            <div style={{position:"relative"}}>
              <div style={{fontSize:17,fontWeight:700,color:C.white,fontFamily:SERIF,marginBottom:6}}>On est la pour toi</div>
              <div style={{fontSize:12,color:"rgba(253,252,248,.6)",lineHeight:1.6,marginBottom:14}}>Notre equipe repond en moins de 2h. Choisis un sujet.</div>
              {!helpMsgSent ? (
                <>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                    {[["💳","Paiement"],["📅","Session"],["👤","Compte"],["🔒","Securite"],["💡","Autre"]].map(([ico,label])=>(
                      <button key={label} onClick={()=>setHelpMsgText(label+": ")} style={{padding:"6px 12px",borderRadius:20,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.08)",color:C.white,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                        {ico} {label}
                      </button>
                    ))}
                  </div>
                  <textarea value={helpMsgText} onChange={e=>setHelpMsgText(e.target.value)} placeholder="Decris ton probleme..." rows={3}
                    style={{width:"100%",padding:"10px 13px",borderRadius:11,border:"1px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.07)",color:C.white,fontSize:12,fontFamily:"inherit",outline:"none",resize:"none",lineHeight:1.5,marginBottom:10,boxSizing:"border-box"}}/>
                  <button onClick={()=>{ if(helpMsgText.trim().length>3){ setHelpMsgSent(true); } else alert("Ecris-nous un peu plus"); }}
                    style={{width:"100%",padding:"12px",borderRadius:11,border:"none",background:`linear-gradient(135deg,${C.gold},${C.goldB})`,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>
                    Envoyer mon message
                  </button>
                </>
              ) : (
                <div style={{textAlign:"center",padding:"8px 0"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🙌</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.white,fontFamily:SERIF,marginBottom:6}}>Message recu, merci !</div>
                  <div style={{fontSize:12,color:"rgba(253,252,248,.7)",lineHeight:1.7,marginBottom:14}}>Notre equipe te repond sous 2h.</div>
                  <button onClick={()=>{ setHelpMsgSent(false); setHelpMsgText(""); }} style={{padding:"8px 18px",borderRadius:20,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:C.white,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                    Envoyer un autre message
                  </button>
                </div>
              )}
            </div>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10,paddingLeft:2}}>Conversations passees</div>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            {[
              {icon:"✅",t:"Problème de paiement résolu",sub:"Il y a 3 semaines",msgs:[{from:"moi",txt:"Bonjour, j'ai été débité deux fois."},{from:"savvy",txt:"Bonjour ! Le remboursement a été traité sous 3–5 jours."},{from:"moi",txt:"Merci beaucoup !"},{from:"savvy",txt:"Avec plaisir"}]},
              {icon:"💬",t:"Question sur une annulation",sub:"Il y a 1 mois",msgs:[{from:"moi",txt:"Puis-je annuler 2h avant ?"},{from:"savvy",txt:"Oui, jusqu'a 1h avant la session."},{from:"moi",txt:"Merci !"}]},
            ].map((item,i,arr)=>(
              <div key={i}>
                <div onClick={()=>setConvoOpen(convoOpen===i?null:i)} style={{display:"flex",gap:11,padding:"13px 15px",borderBottom:convoOpen===i||i<arr.length-1?`1px solid ${C.borderF}`:"none",alignItems:"center",cursor:"pointer",background:convoOpen===i?C.cream2:"transparent"}}>
                  <div style={{width:36,height:36,borderRadius:10,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{item.t}</div>
                    <div style={{fontSize:11,color:C.faint,marginTop:1}}>{item.sub} Resolu</div>
                  </div>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2} style={{transform:convoOpen===i?"rotate(90deg)":"none",transition:".2s"}}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
                {convoOpen===i && (
                  <div style={{padding:"12px 15px",background:C.cream2,borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none"}}>
                    {item.msgs.map((m,mi)=>(
                      <div key={mi} style={{display:"flex",justifyContent:m.from==="moi"?"flex-end":"flex-start",marginBottom:8}}>
                        <div style={{maxWidth:"80%",padding:"9px 12px",borderRadius:m.from==="moi"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.from==="moi"?C.ink:C.white,color:m.from==="moi"?C.white:C.ink,fontSize:12,lineHeight:1.5,border:m.from==="savvy"?`1px solid ${C.borderF}`:"none"}}>
                          {m.from==="savvy"&&<div style={{fontSize:9,fontWeight:700,color:C.gold,marginBottom:3}}>Equipe Savvy</div>}
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
          <BackHeader title="Legal" onBack={goBackToAide}/>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:14}}>
            {[
              {icon:"🔒",title:"Politique de confidentialite",desc:"Comment nous protegeon tes donnees personnelles"},
              {icon:"📄",title:"Conditions generales d'utilisation",desc:"Regles d'utilisation de la plateforme Savvy"},
              {icon:"🍪",title:"Gestion des cookies",desc:"Paramètres de cookies et traceurs"},
              {icon:"⚖️",title:"Mentions legales",desc:"Informations legales de Savvy SAS"},
            ].map((item,i,arr)=>(
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
            <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:4}}>savvy</div>
            <div style={{fontSize:11,color:C.muted,lineHeight:1.7}}>Savvy SAS 12 rue de Rivoli 75001 Paris<br/>SIRET 123 456 789 00012 savvy.fr</div>
            <div style={{fontSize:10,color:C.faint,marginTop:10}}>2026 Savvy TM All rights reserved<br/>Donnees protegees conformement au RGPD</div>
          </div>
        </div>
      );

      if (subSection === "avis") return (()=>{
        const [avisNote, setAvisNote] = useState(0);
        const [avisTxt, setAvisTxt] = useState("");
        const [avisSent, setAvisSent] = useState(false);
        return (
          <div>
            <BackHeader title="Laisser un commentaire" sub="Ton avis nous aide a progresser" onBack={goBackToAide}/>
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
                  <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:4}}>Comment s'est passee ton experience ?</div>
                  <div style={{fontSize:12,color:C.muted}}>Quelques secondes pour nous aider a nous ameliorer</div>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
                  {[1,2,3,4,5].map(s=>(
                    <button key={s} onClick={()=>setAvisNote(s)} style={{fontSize:32,background:"none",border:"none",cursor:"pointer",padding:"4px",opacity:s<=avisNote?1:0.35,transition:"opacity .15s"}}>⭐</button>
                  ))}
                </div>
                <textarea value={avisTxt} onChange={e=>setAvisTxt(e.target.value)} placeholder="Dis-nous ce qui s'est bien passe ou ce qu'on peut ameliorer..." rows={4}
                  style={{width:"100%",padding:"12px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
                <button onClick={()=>{ if(avisNote>0) setAvisSent(true); }} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:avisNote>0?C.ink:C.cream3,color:avisNote>0?C.white:C.muted,fontSize:13,fontWeight:700,cursor:avisNote>0?"pointer":"not-allowed",fontFamily:SERIF}}>
                  Envoyer mon avis
                </button>
              </>}
            </div>
          </div>
        );
      })();

      // Aide sub-menu
      return (
        <div>
          <BackHeader title="Aide" onBack={goBackToMain}/>
          <MenuRow icon="💬" bg="#D1FAE5" title="Centre d'aide" sub="Chat avec l'equipe Savvy Conversations passees" onClick={()=>setSubSection("centre")}/>
          <MenuRow icon="📋" bg="#EDE8DF" title="Legal" sub="Politique de confidentialite CGU Mentions legales" onClick={()=>setSubSection("legal")}/>
          <MenuRow icon="⭐" bg="#FEF3C7" title="Laisser un commentaire" sub="Ton avis nous aide a progresser" onClick={()=>setSubSection("avis")}/>
        </div>
      );
    }

    // ═══ MAIN CLIENT MENU ══════════════════════════════════════════════════════
    const FlatRow = ({icon, label, sub, onClick, badge}) => (
      <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 20px",background:C.white,cursor:"pointer",borderBottom:`1px solid ${C.borderF}`}}>
        <div style={{color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",width:20,flexShrink:0}}>{MENU_ICONS[icon]}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:400,color:C.ink,letterSpacing:"-.1px"}}>{label}</div>
          {sub && <div style={{fontSize:11,color:C.faint,marginTop:1}}>{sub}</div>}
        </div>
        {badge && <div style={{background:C.sage,color:C.white,borderRadius:20,minWidth:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,padding:"0 5px"}}>{badge}</div>}
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    );
    const SectionHeader = ({label}) => (
      <div style={{padding:"18px 20px 6px",fontSize:13,fontWeight:600,color:C.muted,letterSpacing:".4px",textTransform:"uppercase"}}>{label}</div>
    );

    return (<>
      <div>
        {/* ── Header profil ── */}
        {authUser?.real && (
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,padding:"18px 20px",marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:SERIF,marginBottom:4}}>Bienvenue sur Savvy, {USER.prenom} 👋</div>
            <div style={{fontSize:11,color:"rgba(253,252,248,.6)",marginBottom:14,lineHeight:1.5}}>Trouve ton premier expert et réserve une session en moins de 2 minutes.</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {n:"1", t:"Explore les experts", sub:"Parcours notre sélection vérifiée", done:false, nav:"search"},
                {n:"2", t:"Réserve une session", sub:"Choisis ton format · Vidéo, Appel ou Chat", done:false, nav:"search"},
                {n:"3", t:"Deviens conseiller", sub:"Partage ton expertise · Gagne 80%", done:false, nav:"expert"},
              ].map(s=>(
                <div key={s.n} onClick={()=>{ if(s.nav==="expert"){onBecomeExpert&&onBecomeExpert();onSignup&&onSignup();}else{onNavigate&&onNavigate(s.nav);}}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"rgba(253,252,248,.07)",borderRadius:10,cursor:"pointer",border:`1px solid rgba(253,252,248,.1)`}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"rgba(185,134,74,.25)",border:`1.5px solid ${C.goldB}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:C.goldB,flexShrink:0}}>{s.n}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.white}}>{s.t}</div>
                    <div style={{fontSize:10,color:"rgba(253,252,248,.5)",marginTop:1}}>{s.sub}</div>
                  </div>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.goldB} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{background:C.white,padding:"24px 20px 20px",borderBottom:`1px solid ${C.border}`,marginBottom:8}}>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:16}}>
            <div onClick={()=>photoInputRef.current?.click()} style={{position:"relative",flexShrink:0,cursor:"pointer"}}>
              {photoUrl
                ? <img src={photoUrl} alt="profil" style={{width:64,height:64,borderRadius:"50%",objectFit:"cover"}}/>
                : <div style={{width:64,height:64,borderRadius:"50%",background:C.goldL,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:26,fontFamily:SERIF}}>{USER.initials}</div>
              }
              <div style={{position:"absolute",bottom:0,right:0,width:20,height:20,borderRadius:"50%",background:C.ink,border:`2px solid ${C.white}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2.5}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx={12} cy={13} r={4}/></svg>
              </div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{USER.email}</div>
              <div style={{fontSize:22,fontWeight:700,color:C.ink,fontFamily:SERIF,letterSpacing:"-.4px",lineHeight:1.2}}>{USER.prenom} {USER.nom}</div>
            </div>
          </div>
          {/* Parrainage inline card like Selia */}
          <div onClick={()=>setShowReferModal(true)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.goldL,borderRadius:12,cursor:"pointer",border:`1px solid ${C.goldB}20`}}>
            <div style={{color:C.gold,display:"flex"}}><svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx={9} cy={7} r={4}/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.gold}}>Référer un ami</div>
              <div style={{fontSize:11,color:C.gold,opacity:.75,marginTop:1}}>Aide quelqu'un à trouver son expert · Gagne des crédits</div>
            </div>
            <span style={{fontSize:12,color:C.gold,fontWeight:700}}>→</span>
          </div>
        </div>

        {/* ── Section Compte ── */}
        <div style={{background:C.white,borderRadius:0,overflow:"hidden",marginBottom:8}}>
          <SectionHeader label="Compte"/>
          <FlatRow icon="⚙️" label="Paramètres" sub="Informations personnelles · Connexion" onClick={()=>{setSection("compte");setSubSection("parametres");}}/>
          <FlatRow icon="💳" label="Paiements" sub="Solde · Méthodes · Historique" onClick={()=>{setSection("compte");setSubSection("paiements");}}/>
          <FlatRow icon="⭐" label="Mes experts favoris" onClick={()=>{setSection("compte");setSubSection("favoris");}}/>
        </div>

        {/* ── Section Aide ── */}
        <div style={{background:C.white,borderRadius:0,overflow:"hidden",marginBottom:8}}>
          <SectionHeader label="Aide"/>
          <FlatRow icon="💬" label="Centre d'aide" sub="Chat avec l'équipe Savvy" onClick={()=>{setSection("aide");setSubSection("centre");}}/>
          <FlatRow icon="📋" label="Légal" sub="CGU · Politique de confidentialité" onClick={()=>{setSection("aide");setSubSection("legal");}}/>
          <FlatRow icon="⭐" label="Donner votre avis sur Savvy" onClick={()=>{setSection("aide");setSubSection("avis");}}/>
        </div>

        {!isExpert && (
          <div onClick={()=>{onBecomeExpert&&onBecomeExpert();onSignup&&onSignup();}} style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
            <div style={{width:40,height:40,borderRadius:12,background:"rgba(185,134,74,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✦</div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:SERIF}}>Devenir conseiller</div>
              <div style={{fontSize:11,color:"rgba(253,252,248,.6)",marginTop:1}}>Partage ton experience Gagne 80%</div>
            </div>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.goldB} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        )}
      </div>

      {/* ── Partager Savvy modal (client) ── */}
      {showReferModal && (()=>{
        const [linkCopied, setLinkCopied] = useState(false);
        const INVITE_URL = "https://savvy.fr/invite";
        const shareVia = (ch) => {
          if (navigator.share) { navigator.share({title:"Savvy — Conseils d'experts",url:INVITE_URL}).catch(()=>{}); return; }
          const urls = {
            SMS: `sms:?body=Rejoins%20Savvy%20%E2%9C%A6%20${encodeURIComponent(INVITE_URL)}`,
            Email: `mailto:?subject=Je%20te%20recommande%20Savvy&body=Découvre%20Savvy%20%3A%20${encodeURIComponent(INVITE_URL)}`,
            WhatsApp: `https://wa.me/?text=${encodeURIComponent("Rejoins Savvy ✦ "+INVITE_URL)}`,
          };
          window.open(urls[ch.label]||INVITE_URL, "_blank");
        };
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999,padding:"0 0 env(safe-area-inset-bottom)"}}>
            <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",maxWidth:480,boxShadow:"0 -4px 40px rgba(0,0,0,.18)"}}>
              <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 22px"}}/>
              <div style={{textAlign:"center",marginBottom:22}}>
                <div style={{fontSize:36,marginBottom:10}}>✦</div>
                <div style={{fontSize:20,fontWeight:800,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Partage Savvy</div>
                <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>Aide quelqu'un à trouver l'expérience réelle dont il a besoin. Partage le lien et ils pourront réserver une session dès aujourd'hui.</div>
              </div>
              <div style={{background:C.cream2,borderRadius:12,padding:"12px 14px",marginBottom:16,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
                <div style={{flex:1,fontSize:13,color:C.ink,fontWeight:600,wordBreak:"break-all"}}>{INVITE_URL}</div>
                <button onClick={()=>{ navigator.clipboard?.writeText(INVITE_URL); setLinkCopied(true); setTimeout(()=>setLinkCopied(false),2000); }} style={{flexShrink:0,padding:"7px 12px",borderRadius:9,border:"none",background:linkCopied?C.sage:C.ink,color:C.white,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"background .2s"}}>{linkCopied?"✓ Copié !":"Copier"}</button>
              </div>
              <div style={{display:"flex",gap:10,marginBottom:14}}>
                {[{icon:"💬",label:"SMS"},{icon:"📧",label:"Email"},{icon:"📱",label:"WhatsApp"}].map(ch=>(
                  <button key={ch.label} onClick={()=>shareVia(ch)} style={{flex:1,padding:"11px 4px",borderRadius:12,border:`1px solid ${C.border}`,background:C.white,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit"}}>
                    <span style={{fontSize:20}}>{ch.icon}</span>
                    <span style={{fontSize:10,fontWeight:600,color:C.ink}}>{ch.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={()=>setShowReferModal(false)} style={{width:"100%",padding:"13px",borderRadius:13,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Fermer</button>
            </div>
          </div>
        );
      })()}
    </>)
  };

const ExpertView = () => {
    const section = expSection; const setSection = setExpSection;
    const subSection = expSubSection; const setSubSection = setExpSubSection;
    const sessionFilter = expSessionFilter; const setSessionFilter = setExpSessionFilter;
    const revFilter = expRevFilter; const setRevFilter = setExpRevFilter;
    const toggleExpN = k => setExpNotifToggles(s=>({...s,[k]:!s[k]}));
    const showShareModal = expShowShareModal; const setShowShareModal = setExpShowShareModal;
    const setCancelModalExp = (v) => setCancelModal(v ? {...v, type:"exp"} : null);
    const expertProfileUrl = "https://savvy.fr/p/"+(USER.prenom+"-"+USER.nom).toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");

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
                      <div style={{width:40,height:40,borderRadius:"50%",background:s.bg,color:s.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{s.ini}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{s.client}</div>
                        <div style={{fontSize:11,color:C.muted}}>{s.date} · {s.heure} · {s.duree}</div>
                      </div>
                      <div style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,background:"#FEE2E2",color:"#B91C1C"}}>✕ {s.motif||"Annulée"}</div>
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
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#B91C1C",textTransform:"uppercase",letterSpacing:1,display:"flex",alignItems:"center",gap:5}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>Demandes en attente</div>
                <div style={{background:"#FEE2E2",color:"#B91C1C",borderRadius:20,minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,padding:"0 5px"}}>{EXP_REQUESTS.length}</div>
              </div>
              {EXP_REQUESTS.map(r=>(
                <div key={r.id} style={{background:C.white,borderRadius:14,border:"1.5px solid #FEE2E2",padding:"13px 14px",marginBottom:10,boxShadow:"0 2px 8px rgba(185,28,28,.08)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:40,height:40,borderRadius:"50%",background:r.bg,color:r.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{r.ini}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{r.client}</div>
                      <div style={{fontSize:11,color:C.muted}}>{r.domaine} · {r.format} · {r.duree}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#B91C1C",display:"flex",gap:4,alignItems:"center"}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>{r.date}</div>
                      <div style={{fontSize:11,color:C.muted}}>{r.heure}</div>
                    </div>
                  </div>
                  {/* Profil client */}
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
                    {r.pays&&<span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,background:C.cream2,color:C.muted}}>📍 {r.pays}</span>}
                    {r.langue&&<span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,background:C.cream2,color:C.muted}}>🗣 {r.langue}</span>}
                    {r.domaine&&<span style={{fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,background:C.goldL,color:C.gold}}>{r.domaine}</span>}
                  </div>
                  {/* Message */}
                  <div style={{background:"#FFF5F5",borderRadius:9,padding:"9px 12px",marginBottom:r.why?8:11,fontSize:12,color:C.muted,fontStyle:"italic",lineHeight:1.5}}>"{r.msg}"</div>
                  {/* Pourquoi */}
                  {r.why&&<div style={{background:C.cream2,borderRadius:9,padding:"8px 12px",marginBottom:11,fontSize:11,color:C.soft,lineHeight:1.5}}>
                    <span style={{fontWeight:700,color:C.ink,fontStyle:"normal"}}>Contexte · </span>{r.why}
                  </div>}
                  <div style={{display:"flex",gap:8,marginBottom:8}}>
                    <button onClick={()=>setClientProfileModal(r)}
                      style={{flex:1,padding:"8px",borderRadius:10,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                      👤 Voir le profil
                    </button>
                    <button onClick={()=>onNavigate&&onNavigate("messages")} style={{flex:1,padding:"8px",borderRadius:10,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
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
                      if(r._fromSB) await supabase.from("bookings").update({status:"confirmed"}).eq("id",r.id);
                      setSessionConfirmToast({name:r.client, type:"confirmed"});
                      setTimeout(()=>setSessionConfirmToast(null),3000);
                      setExpSessionTab("confirmees");
                    }} style={{flex:2,padding:"10px",borderRadius:10,border:"none",background:C.sage,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>✓ Confirmer</button>
                    <button onClick={async ()=>{
                      setExpCancelled(prev=>[{...r,statut:"refusé",motif:"Refusé par l'expert"},...prev]);
                      const remaining = expRequests.filter(x=>x.id!==r.id);
                      setExpRequests(remaining);
                      if(onRequestsChange) onRequestsChange(remaining.length);
                      if(r._fromLS) updateBooking(r.id, {status:"cancelled"});
                      if(r._fromSB) await supabase.from("bookings").update({status:"cancelled"}).eq("id",r.id);
                      setSessionConfirmToast({name:r.client, type:"refused"});
                      setTimeout(()=>setSessionConfirmToast(null),3000);
                    }} style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✕ Refuser</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {expSessionTab==="confirmees" && (()=>{
            if(visible.length===0) return (
              <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg></div>
                Aucune session confirmée
              </div>
            );
            const sorted = [...visible].sort((a,b)=>a.hoursUntil-b.hoursUntil);
            const expGroups = [
              {label:"Aujourd'hui", color:"#EF4444", bg:"#FEF2F2", sessions: sorted.filter(s=>s.hoursUntil<=24)},
              {label:"Demain",      color:"#6366F1", bg:"#EEF2FF", sessions: sorted.filter(s=>s.hoursUntil>24&&s.hoursUntil<=48)},
              {label:"Cette semaine",color:"#F59E0B",bg:"#FFFBEB", sessions: sorted.filter(s=>s.hoursUntil>48&&s.hoursUntil<=168)},
              {label:"Plus tard",   color:C.muted,   bg:C.cream2,  sessions: sorted.filter(s=>s.hoursUntil>168)},
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
                          <div style={{width:40,height:40,borderRadius:"50%",background:s.bg,color:s.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{s.ini}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{s.client}</div>
                            <div style={{fontSize:11,color:C.muted,marginTop:1}}>{s.format}</div>
                          </div>
                          <div style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,background:s.statut==="confirmé"?C.sageL:"#FEF3C7",color:s.statut==="confirmé"?C.sage:"#92400E"}}>
                            {s.statut==="confirmé"?"✓ Confirmé":"⏳ En attente"}
                          </div>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:11}}>
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
                        <div style={{display:"flex",gap:7}}>
                          <button onClick={()=>onNavigate&&onNavigate("messages")} style={{flex:1,padding:"8px",borderRadius:9,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message
                          </button>
                          {s.statut==="confirmé"&&(
                            <button onClick={()=>{
                              const meetUrl = `https://meet.savvy.fr/session-${s.id}`;
                              if(navigator.share){ navigator.share({title:`Session avec ${s.client}`,url:meetUrl}).catch(()=>{}); }
                              else { try{navigator.clipboard.writeText(meetUrl);}catch{} window.open(meetUrl,"_blank"); }
                            }} style={{flex:1,padding:"8px",borderRadius:9,border:"none",background:C.sage,color:C.white,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:SERIF,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><polygon points="23 7 16 12 23 17 23 7"/><rect x={1} y={5} width={15} height={14} rx={2}/></svg>Rejoindre
                            </button>
                          )}
                          <button onClick={()=>setCancelModal({session:s,step:"choose",type:"exp"})} style={{padding:"8px 11px",borderRadius:9,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>✕</button>
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

    // ── Disponibilités (shortcut direct)
    if (section === "disponibilidades") {
      const yr = dispoMonth.getFullYear();
      const mo = dispoMonth.getMonth();
      const daysInMonth = new Date(yr, mo+1, 0).getDate();
      const firstDow = new Date(yr, mo, 1).getDay();
      const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
      const DAYS_FR = ["L","M","M","J","V","S","D"];
      const isWeekend = d => { const dow = new Date(yr,mo,d).getDay(); return dow===0||dow===6; };
      const fmtKey = d => yr+"-"+String(mo+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");
      const getStart = key => (dispoHours[key]||"09:00-18:00").split("-")[0];
      const getEnd   = key => (dispoHours[key]||"09:00-18:00").split("-")[1];
      const jours = Object.keys(dispoSelected).filter(k=>dispoSelected[k]).sort();
      const offset = firstDow===0 ? 6 : firstDow-1;
      return (
        <div>
          <BackHeaderExp title="Disponibilités" sub="Sélectionne tes jours et horaires" onBack={()=>setSection(null)}/>
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:13,padding:"13px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:11}}>
            <div style={{flexShrink:0,color:C.goldB}}><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg></div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:SERIF,marginBottom:2}}>Définis quand les clients peuvent réserver avec toi</div>
              <div style={{fontSize:11,color:"rgba(253,252,248,.65)",lineHeight:1.5}}>Les clients peuvent uniquement réserver pendant les créneaux que tu ouvres.</div>
            </div>
          </div>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 16px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <button onClick={()=>setDispoMonth(new Date(yr,mo-1,1))} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2.5}><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{MONTHS_FR[mo]} {yr}</div>
              <button onClick={()=>setDispoMonth(new Date(yr,mo+1,1))} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2.5}><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
            <div style={{display:"flex",gap:6,marginBottom:12}}>
              <button onClick={()=>{ const s={}; for(let d=1;d<=daysInMonth;d++) if(!isWeekend(d)) s[fmtKey(d)]=true; setDispoSelected(s); }}
                style={{flex:1,padding:"7px",borderRadius:20,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Lun-Ven</button>
              <button onClick={()=>{ const s={}; for(let d=1;d<=daysInMonth;d++) s[fmtKey(d)]=true; setDispoSelected(s); }}
                style={{flex:1,padding:"7px",borderRadius:20,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Tout le mois</button>
              <button onClick={()=>setDispoSelected({})}
                style={{flex:1,padding:"7px",borderRadius:20,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Effacer</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
              {DAYS_FR.map((d,i)=>(
                <div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:i>=5?C.faint:C.muted,padding:"3px 0"}}>{d}</div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
              {Array(offset).fill(null).map((_,i)=><div key={"e"+i}/>)}
              {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{
                const key=fmtKey(d);
                const sel=!!dispoSelected[key];
                const wkd=isWeekend(d);
                const hasH=!!dispoHours[key];
                const now=new Date(); now.setHours(0,0,0,0);
                const isPast=new Date(yr,mo,d)<now;
                return (
                  <button key={d}
                    onClick={()=>{ if(wkd||isPast) return; setDispoSelected(s=>({...s,[key]:!s[key]})); }}
                    style={{aspectRatio:"1",padding:2,borderRadius:9,border:`2px solid ${sel?C.sage:(wkd||isPast)?"transparent":C.borderF}`,background:sel?(hasH?"#059669":C.sageL):(wkd||isPast)?C.cream2:C.white,color:sel?(hasH?C.white:C.sage):(wkd||isPast)?C.faint:C.ink,fontSize:13,fontWeight:sel?700:400,cursor:(wkd||isPast)?"default":"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all .15s",opacity:isPast?.4:1}}>
                    {d}
                    {sel&&<div style={{fontSize:5.5,lineHeight:1.2,marginTop:1,opacity:.9,whiteSpace:"nowrap",textAlign:"center"}}>{hasH?(getStart(key).replace(":","h").slice(0,4)+"–"+getEnd(key).replace(":","h").slice(0,4)):"9h–18h"}</div>}
                  </button>
                );
              })}
            </div>
            <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontSize:11,fontWeight:700,color:jours.length>0?C.sage:C.faint}}>{jours.length} jour{jours.length!==1?"s":""} ouvert{jours.length!==1?"s":""} à la réservation</div>
              {jours.length>0 && <div style={{fontSize:10,color:C.muted}}>≈ {jours.length*9}h disponibles</div>}
            </div>
          </div>
          {jours.length>0 && (
            <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 16px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:13,fontWeight:700,color:C.ink}}>Horaires par jour</div>
                <button onClick={()=>{ const h={}; jours.forEach(k=>{h[k]="09:00-18:00";}); setDispoHours(h); }}
                  style={{fontSize:10,fontWeight:700,color:C.gold,background:C.goldL,border:`1px solid ${C.goldB}`,borderRadius:20,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>
                  9h–18h pour tous
                </button>
              </div>
              {jours.map((key,i)=>{
                const d = parseInt(key.split("-")[2]);
                return (
                  <div key={key} style={{borderBottom:i<jours.length-1?`1px solid ${C.borderF}`:"none",paddingBottom:i<jours.length-1?8:0,marginBottom:i<jours.length-1?8:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{fontSize:13,fontWeight:600,color:C.ink,minWidth:28}}>{d}</div>
                      <input type="time" value={getStart(key)} onChange={e=>setDispoHours(h=>({...h,[key]:e.target.value+"-"+getEnd(key)}))}
                        style={{flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink}}/>
                      <span style={{fontSize:12,color:C.muted}}>à</span>
                      <input type="time" value={getEnd(key)} onChange={e=>setDispoHours(h=>({...h,[key]:getStart(key)+"-"+e.target.value}))}
                        style={{flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink}}/>
                      <button onClick={()=>setDispoSelected(s=>{const n={...s};delete n[key];return n;})} style={{width:28,height:28,borderRadius:8,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#DC2626",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                    </div>
                    {jours.length>1 && <button onClick={()=>{ const hrs=dispoHours[key]||"09:00-18:00"; const h={}; jours.forEach(k=>{h[k]=hrs;}); setDispoHours(prev=>({...prev,...h})); }}
                      style={{marginTop:5,fontSize:10,color:C.muted,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:"0 0 0 28px",textDecoration:"underline"}}>
                      Appliquer à tous les jours
                    </button>}
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={async ()=>{
            localStorage.setItem(`savvy_dispo_days_${dispoKey}`, JSON.stringify(dispoSelected));
            localStorage.setItem(`savvy_dispo_hours_${dispoKey}`, JSON.stringify(dispoHours));
            // Save to Supabase if real expert
            if (resolvedExpertId) {
              const rows = Object.keys(dispoSelected).filter(k=>dispoSelected[k]).map(dateKey => {
                const dow = new Date(dateKey).getDay(); // 0=Sun..6=Sat → convert to 0=Mon
                const dowMon = dow === 0 ? 6 : dow - 1;
                const hrs = dispoHours[dateKey] || "09:00-18:00";
                const [start, end] = hrs.split("-");
                return { expert_id: resolvedExpertId, day_of_week: dowMon, start_time: start, end_time: end };
              });
              // Deduplicate by day_of_week (keep last)
              const byDow = {};
              rows.forEach(r => { byDow[r.day_of_week] = r; });
              const upsertRows = Object.values(byDow);
              if (upsertRows.length > 0) {
                await supabase.from("availability").delete().eq("expert_id", resolvedExpertId);
                await supabase.from("availability").insert(upsertRows);
              }
            }
            setDispoSaved(true); setTimeout(()=>setDispoSaved(false), 3000);
          }} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:dispoSaved?"#10B981":C.ink,color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:SERIF,transition:"background .3s"}}>
            {dispoSaved ? "✓ Disponibilités enregistrées" : "Enregistrer mes disponibilités"}
          </button>
          <div style={{marginTop:12,background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.goldB}`,display:"flex",alignItems:"flex-start",gap:10}}>
            <span style={{fontSize:18,flexShrink:0}}>✦</span>
            <div style={{fontSize:12,color:C.ink,fontWeight:700,marginBottom:4}}>✦ Plus tu es disponible, plus tu peux recevoir de demandes.</div>
            <div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>Les experts disponibles apparaissent davantage dans les résultats de recherche.</div>
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
              <div style={{fontSize:32,fontWeight:700,fontFamily:SERIF}}>{showRevenu?(EXPERT_DATA.impact.revenu>0?EXPERT_DATA.impact.revenu+"€":"0€"):"••••€"}</div>
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
            <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Historique des revenus</div>
            <div style={{textAlign:"center",padding:"18px 0",color:C.faint,fontSize:12}}>Aucune activité sur cette période</div>
            <button onClick={()=>generateFacturesPDF(EXPERT_DATA.prenom+" "+EXPERT_DATA.nom, true)} style={{width:"100%",marginTop:6,padding:"9px",borderRadius:10,border:`1px solid ${C.gold}`,background:C.goldL,color:C.gold,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📄 Télécharger mes factures PDF</button>
          </div>
        </div>
      );

      // Mes clients aidés
      if (subSection === "clients") {
        const clientsData = isNewExpert ? [] : [
          {ini:"SM", bg:"#EDE9FE", col:"#7C3AED", nom:"Sophie Martin",  nb:3, derniere:"15 mai 2025",    note:5},
          {ini:"LB", bg:"#DBEAFE", col:"#1D4ED8", nom:"Lucas Bernard",  nb:1, derniere:"8 mai 2025",     note:5},
          {ini:"EP", bg:"#D1FAE5", col:"#065F46", nom:"Emma Petit",     nb:2, derniere:"2 mai 2025",     note:4},
          {ini:"PD", bg:"#FEF3C7", col:"#92400E", nom:"Pierre Durand",  nb:1, derniere:"18 avril 2025",  note:5},
        ];
        return (
          <div>
            <BackHeaderExp title="Mes clients aidés" sub="Personnes que tu as accompagnées" onBack={goBackToCompte}/>
            {clientsData.length===0
              ? <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
                  <div style={{fontSize:40,marginBottom:12}}>🤝</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Pas encore de clients</div>
                  <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Tes premiers clients apparaîtront ici après ta première session confirmée.</div>
                </div>
              : clientsData.map(c=>(
                <div key={c.ini} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",marginBottom:10,display:"flex",alignItems:"center",gap:12,boxShadow:`0 1px 4px ${C.sh}`}}>
                  <div style={{width:44,height:44,borderRadius:"50%",background:c.bg,color:c.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{c.ini}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{c.nom}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{c.nb} session{c.nb>1?"s":""} · Dernière : {c.derniere}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                    <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s<=c.note?"#B8864A":"#E5E0D8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
                    <div style={{fontSize:10,color:C.muted}}>{c.note}/5</div>
                  </div>
                </div>
              ))
            }
            {clientsData.length>0 && <div style={{textAlign:"center",marginTop:8,fontSize:11,color:C.muted}}>{clientsData.length} clients accompagnés · {clientsData.reduce((s,c)=>s+c.nb,0)} sessions au total</div>}
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
      const nextSession = expConfirmed.length > 0 ? expConfirmed[0] : null;
      const pendingCount = expRequests.length;
      const sessionsThisWeek = expConfirmed.filter(s => (s.hoursUntil||0) <= 168).length;
      const revenuMois = isNewExpert ? 0 : EXPERT_DATA.impact.revenu;

      // Completion % for new expert
      const completionSteps = isNewExpert ? [
        { done: true,  label: "Profil créé", icon:"✅" },
        { done: !!newExpertProfile?.photo, label: "Photo ajoutée", icon:"📸" },
        { done: !!newExpertProfile?.phases?.length, label: "Offre créée", icon:"💼" },
        { done: !!newExpertProfile?.creds?.length, label: "Preuves ajoutées", icon:"🏆" },
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
                    {v: revenuMois+"€", l:"💰 revenus ce mois"},
                    {v: String(EXPERT_DATA.impact.clients), l:"👥 clients aidés"},
                    {v: EXPERT_DATA.rating ? EXPERT_DATA.rating.toFixed(1)+"★" : "—", l:"⭐ note moyenne"},
                    {v: String(sessionsThisWeek), l:"📅 sessions sem."},
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
          {!isNewExpert && EXPERT_DATA.rating && (
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
                <button style={{padding:"9px 14px",borderRadius:11,border:"none",background:"#F59E0B",color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  Rejoindre →
                </button>
              </div>
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
                  <button onClick={()=>setSection("sesiones")} style={{padding:"7px 12px",borderRadius:10,border:`1px solid ${C.goldB}`,background:C.goldL,color:C.gold,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
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
          {!isNewExpert && (() => {
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
          {!isNewExpert && (
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
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{EXPERT_DATA.domain}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s<=Math.round(EXPERT_DATA.rating||4.8)?"#B8864A":"#E5E0D8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
                <span style={{fontSize:11,fontWeight:700,color:C.gold}}>{EXPERT_DATA.rating||"4.8"}</span>
                <span style={{fontSize:10,color:C.muted}}>· {EXPERT_DATA.impact.sessions||0} sessions</span>
              </div>
            </div>
            <div onClick={()=>setShowRevenu(v=>!v)} style={{textAlign:"right",cursor:"pointer",flexShrink:0}}>
              <div style={{fontSize:20,fontWeight:800,color:EXPERT_DATA.impact.revenu>0?C.gold:C.muted,fontFamily:SERIF}}>{showRevenu?(EXPERT_DATA.impact.revenu>0?EXPERT_DATA.impact.revenu+"€":"0€"):"••••€"}</div>
              <div style={{fontSize:9,color:C.muted,marginTop:1,display:"flex",alignItems:"center",justifyContent:"flex-end",gap:3}}>revenus {showRevenu?<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx={12} cy={12} r={3}/></svg>:<svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1={1} y1={1} x2={23} y2={23}/></svg>}</div>
            </div>
          </div>
          {/* ── Profil Savvy progress ── */}
          {(()=>{
            const checks = [
              !!(photoUrl || USER.initials), // photo ou initiales = profil de base
              !!(expOffres||EXPERT_DATA.offres).length,
              !!EXPERT_DATA.preuves.length,
              Object.values(dispoSelected||{}).some(Boolean),
              EXPERT_DATA.impact.sessions > 0,
              EXPERT_DATA.rating >= 4,
            ];
            const pct = Math.round(checks.filter(Boolean).length / checks.length * 100);
            const color = pct >= 80 ? C.sage : pct >= 50 ? C.gold : "#F59E0B";
            return (
              <div style={{margin:"12px 0 4px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontSize:11,fontWeight:600,color:C.muted}}>Profil Savvy</span>
                  <span style={{fontSize:11,fontWeight:700,color}}>{pct}% complété</span>
                </div>
                <div style={{height:5,background:C.cream3,borderRadius:10,overflow:"hidden"}}>
                  <div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:10,transition:"width .4s"}}/>
                </div>
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
          <MenuRowExp icon="💼" title="Mes offres" sub={(expOffres||EXPERT_DATA.offres).length===0?"Aucune offre · Créer la première":`${(expOffres||EXPERT_DATA.offres).length} offre(s) active(s)`} onClick={()=>setOffresOpen(v=>!v)}/>
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
                                  {f==="video"||f?.includes?.("Vidéo")?"🎥 Vidéo":f==="audio"||f?.includes?.("audio")?"📞 Audio":f==="doc"||f?.includes?.("Doc")?"📄 Doc":"💬 Chat"}
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
          <MenuRowExp icon="🤝" title="Mes clients aidés" sub={(()=>{const n=EXPERT_DATA.impact.clients; return n>0?`${n} personne${n>1?"s":""} accompagnée${n>1?"s":""} grâce à Savvy`:"Personnes que tu as accompagnées";})()}  onClick={()=>{setSection("compte");setSubSection("clients");}}/>
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
  };


  const ClientProfileModalUI = clientProfileModal ? (()=>{
    const r = clientProfileModal;
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}} onClick={()=>setClientProfileModal(null)}>
        <div style={{background:C.cream,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"88vh",overflowY:"auto",paddingBottom:32}} onClick={e=>e.stopPropagation()}>
          {/* Handle */}
          <div style={{padding:"12px 0 0",display:"flex",justifyContent:"center"}}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border}}/>
          </div>

          {/* Hero client */}
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,margin:"12px 16px 0",borderRadius:16,padding:"22px 20px",display:"flex",gap:14,alignItems:"center"}}>
            <div style={{width:60,height:60,borderRadius:"50%",background:r.bg,color:r.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:22,flexShrink:0,fontFamily:SERIF}}>{r.ini}</div>
            <div>
              <div style={{fontSize:18,fontWeight:700,color:C.white,fontFamily:SERIF}}>{r.client}</div>
              <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                {r.pays&&<span style={{fontSize:10,fontWeight:600,padding:"2px 9px",borderRadius:20,background:"rgba(255,255,255,.12)",color:"rgba(253,252,248,.7)"}}>📍 {r.pays}</span>}
                {r.langue&&<span style={{fontSize:10,fontWeight:600,padding:"2px 9px",borderRadius:20,background:"rgba(255,255,255,.12)",color:"rgba(253,252,248,.7)"}}>🗣 {r.langue}</span>}
              </div>
            </div>
          </div>

          <div style={{padding:"16px 16px 0"}}>
            {/* Domaine demandé */}
            <div style={{background:C.white,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Ce qu'il·elle cherche</div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:C.goldL,color:C.gold}}>{r.domaine}</span>
                <span style={{fontSize:11,fontWeight:600,padding:"4px 12px",borderRadius:20,background:C.cream2,color:C.muted}}>{r.format} · {r.duree}</span>
              </div>
              <div style={{fontSize:13,color:C.soft,fontStyle:"italic",lineHeight:1.6}}>"{r.msg}"</div>
            </div>

            {/* Contexte / pourquoi */}
            {r.why&&(
              <div style={{background:C.white,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Contexte</div>
                <div style={{fontSize:13,color:C.ink,lineHeight:1.6}}>{r.why}</div>
              </div>
            )}

            {/* Créneau proposé */}
            <div style={{background:C.white,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px 16px",marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Créneau proposé</div>
              <div style={{display:"flex",gap:8}}>
                <span style={{fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:20,background:"#EEF2FF",color:"#4F46E5"}}>📅 {r.date}</span>
                <span style={{fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:20,background:"#EEF2FF",color:"#4F46E5"}}>⏰ {r.heure}</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{
                if(r._fromLS) updateBooking(r.id, {status:"cancelled"});
                setExpCancelled(prev=>[{...r,statut:"refusé",motif:"Refusé par l'expert"},...prev]);
                setExpRequests(prev=>prev.filter(x=>x.id!==r.id));
                setClientProfileModal(null);
              }} style={{flex:1,padding:"13px",borderRadius:13,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                ✕ Refuser
              </button>
              <button onClick={()=>{
                const confirmed={...r,statut:"confirmé",hoursUntil:r.date==="Demain"?22:r.date==="Aujourd'hui"?6:168};
                if(r._fromLS) updateBooking(r.id, {status:"confirmed"});
                setExpConfirmed(prev=>[confirmed,...prev]);
                setExpRequests(prev=>prev.filter(x=>x.id!==r.id));
                setClientProfileModal(null);
                setExpSessionTab("confirmees");
              }} style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:C.sage,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>
                ✓ Confirmer la session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  })() : null;

  const CancelModalUI = cancelModal ? (() => {
    const s = cancelModal.session;
    const name = cancelModal.type==="exp" ? s.client : (s.topic||"cette session");
    if (cancelModal.step === "choose") return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
        <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",maxWidth:480}}>
          <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>
          <div style={{fontSize:17,fontWeight:800,color:C.ink,fontFamily:SERIF,marginBottom:4}}>Que veux-tu faire ?</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Session · {s.heure||s.time} · {s.date}</div>
          <div style={{background:"#EFF6FF",borderRadius:13,padding:"14px 15px",marginBottom:10,border:"1px solid #BFDBFE",cursor:"pointer"}} onClick={()=>setCancelModal({...cancelModal,step:"reschedule"})}>
            <div style={{fontSize:14,fontWeight:700,color:"#1D4ED8",marginBottom:2}}>📅 Reprogrammer</div>
            <div style={{fontSize:11,color:"#3B82F6"}}>Propose une nouvelle date</div>
          </div>
          <div style={{background:"#FFF5F5",borderRadius:13,padding:"14px 15px",marginBottom:16,border:"1px solid #FEE2E2",cursor:"pointer"}} onClick={()=>setCancelModal({...cancelModal,step:"reason",selectedMotif:"",motifTexte:""})}>
            <div style={{fontSize:14,fontWeight:700,color:"#B91C1C",marginBottom:2}}>✕ Annuler la session</div>
            <div style={{fontSize:11,color:"#EF4444"}}>Motif obligatoire · impact sur ton score de fiabilité</div>
          </div>
          <button onClick={()=>setCancelModal(null)} style={{width:"100%",padding:"12px",borderRadius:12,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Retour</button>
        </div>
      </div>
    );
    if (cancelModal.step === "reschedule") return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
        <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",maxWidth:480}}>
          <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>
          <div style={{fontSize:17,fontWeight:800,color:C.ink,fontFamily:SERIF,marginBottom:4}}>Reprogrammer</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:20}}>Propose une nouvelle date</div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:600,color:C.ink,display:"block",marginBottom:5}}>Nouvelle date</label>
            <input type="date" value={rescheduleDate} onChange={e=>setRescheduleDate(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",color:C.ink,background:C.white}}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{fontSize:12,fontWeight:600,color:C.ink,display:"block",marginBottom:5}}>Heure souhaitée</label>
            <input type="time" value={rescheduleHeure} onChange={e=>setRescheduleHeure(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",boxSizing:"border-box",color:C.ink,background:C.white}}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setCancelModal({...cancelModal,step:"choose"})} style={{flex:1,padding:"12px",borderRadius:12,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Retour</button>
            <button onClick={()=>{
              if(!rescheduleDate||!rescheduleHeure){return;}
              // Update session with new date
              const newDate = new Date(rescheduleDate).toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"long"});
              setExpConfirmed(prev=>prev.map(s=>s.id===cancelModal.session.id?{...s,date:newDate,heure:rescheduleHeure.replace(":","")}:s));
              setCancelModal(null); setRescheduleDate(""); setRescheduleHeure("");
            }} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#1D4ED8",color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📅 Envoyer la demande</button>
          </div>
        </div>
      </div>
    );
    if (cancelModal.step === "reason") {
      const MOTIFS_EXP = ["Indisponibilité imprévue","Problème technique","Urgence personnelle","Le sujet ne correspond pas à mon expertise","Autre"];
      const MOTIFS_CLI = ["Changement de planning","J'ai trouvé une autre solution","Problème financier","L'expert ne correspond pas à mes attentes","Autre"];
      const motifs = cancelModal.type==="exp" ? MOTIFS_EXP : MOTIFS_CLI;
      return (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
          <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",maxWidth:480,maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>
            <div style={{fontSize:17,fontWeight:800,color:C.ink,fontFamily:SERIF,marginBottom:4}}>Pourquoi tu annules ?</div>
            <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Un motif est obligatoire — il aide à améliorer Savvy.</div>

            {/* Score warning */}
            <div style={{background:"#FFF5F5",border:"1px solid #FEE2E2",borderRadius:12,padding:"11px 14px",marginBottom:18,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#B91C1C",marginBottom:2}}>Impact sur ton score</div>
                <div style={{fontSize:11,color:"#DC2626",lineHeight:1.5}}>Chaque annulation {cancelModal.type==="exp"?"de ta part":"tardive"} réduit ton score de fiabilité. Un score bas limite ta visibilité sur Savvy.</div>
              </div>
            </div>

            {/* Motifs */}
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
              {motifs.map(m=>(
                <button key={m} onClick={()=>setCancelModal({...cancelModal,selectedMotif:m})}
                  style={{padding:"12px 14px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",fontSize:13,fontWeight:600,textAlign:"left",border:`1.5px solid ${cancelModal.selectedMotif===m?C.ink:C.border}`,background:cancelModal.selectedMotif===m?C.ink:C.white,color:cancelModal.selectedMotif===m?C.white:C.ink,transition:"all .15s"}}>
                  {m}
                </button>
              ))}
            </div>

            {/* Message libre si "Autre" */}
            {cancelModal.selectedMotif==="Autre" && (
              <textarea value={cancelModal.motifTexte||""} onChange={e=>setCancelModal({...cancelModal,motifTexte:e.target.value})}
                placeholder="Explique brièvement…"
                style={{width:"100%",padding:"11px 13px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",resize:"none",minHeight:70,outline:"none",boxSizing:"border-box",marginBottom:12}}/>
            )}

            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setCancelModal({...cancelModal,step:"choose"})} style={{flex:1,padding:"13px",borderRadius:12,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Retour</button>
              <button onClick={()=>{ if(!cancelModal.selectedMotif) return; setCancelModal({...cancelModal,step:"confirm"}); }}
                disabled={!cancelModal.selectedMotif}
                style={{flex:2,padding:"13px",borderRadius:12,border:"none",background:cancelModal.selectedMotif?"#B91C1C":C.cream3,color:cancelModal.selectedMotif?C.white:C.muted,fontSize:13,fontWeight:700,cursor:cancelModal.selectedMotif?"pointer":"not-allowed",fontFamily:"inherit"}}>
                Continuer →
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (cancelModal.step === "confirm") return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
        <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",maxWidth:480}}>
          <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>
          <div style={{fontSize:32,textAlign:"center",marginBottom:10}}>⚠️</div>
          <div style={{fontSize:17,fontWeight:800,color:"#B91C1C",fontFamily:SERIF,textAlign:"center",marginBottom:6}}>Confirmer l'annulation ?</div>
          <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:8,lineHeight:1.5}}>Cette action est irréversible.{cancelModal.type==="exp"?" Ton client sera notifié et remboursé automatiquement.":" Tu seras remboursé(e) selon la politique d'annulation de l'expert."}</div>
          {cancelModal.selectedMotif && (
            <div style={{background:C.cream2,borderRadius:10,padding:"9px 13px",marginBottom:20,textAlign:"center",fontSize:12,color:C.muted}}>
              Motif : <strong style={{color:C.ink}}>{cancelModal.selectedMotif==="Autre"?(cancelModal.motifTexte||"Autre"):cancelModal.selectedMotif}</strong>
            </div>
          )}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setCancelModal({...cancelModal,step:"reason"})} style={{flex:1,padding:"13px",borderRadius:12,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Retour</button>
            <button onClick={()=>{
              const s = cancelModal.session;
              const motif = cancelModal.selectedMotif==="Autre"?(cancelModal.motifTexte||"Autre"):cancelModal.selectedMotif;
              if(cancelModal.type==="exp"){
                setExpCancelled(prev=>[{...s,statut:"annulé",motif},...prev]);
                setExpConfirmed(prev=>prev.filter(x=>x.id!==s.id));
              }
              setCancelModal(null);
            }} style={{flex:1,padding:"13px",borderRadius:12,border:"none",background:"#B91C1C",color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Confirmer</button>
          </div>
        </div>
      </div>
    );
    return null;
  })() : null;

  return (
    <>
      {/* Hidden file input global — utilisé par tous les avatars */}
      <input
        ref={photoInputRef}
        id="savvy-photo-input"
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={async e=>{
          const f=e.target.files[0]; if(!f)return; e.target.value="";
          const r=new FileReader(); r.onload=ev=>setPhotoUrl(ev.target.result); r.readAsDataURL(f);
          try{ const url=await uploadPhoto(f,authUser?.id); setPhotoUrl(url);
            if(authUser?.id) await supabase.from(mode==="expert"?"experts":"profiles").update({photo_url:url}).eq(mode==="expert"?"user_id":"id",authUser.id);
          }catch{}
        }}
      />
      <div style={{ flex:1, overflowY:"auto", paddingBottom:80, background:C.cream }}>
        <Header/>
        {mode === "client" ? <ClientView/> : <ExpertView/>}
      </div>

      {CancelModalUI}
      {ClientProfileModalUI}

      {/* ── Voir mon profil ────────────────────────────────────────────── */}
      {showMyProfile && <>
        <div onClick={()=>setShowMyProfile(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50 }}/>
        <div style={{ position:"fixed", inset:0, background:C.cream, zIndex:60, overflowY:"auto" }}>
          {/* Header */}
          <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"60px 20px 36px", textAlign:"center", position:"relative" }}>
            <button onClick={()=>setShowMyProfile(false)} style={{ position:"absolute", top:52, left:16, width:36, height:36, borderRadius:10, background:"rgba(253,252,248,.12)", border:"1px solid rgba(253,252,248,.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div style={{ width:90, height:90, borderRadius:"50%", background:`linear-gradient(135deg,${C.goldL},#FDE68A)`, color:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:32, border:`3px solid ${C.goldB}`, boxShadow:`0 0 0 5px rgba(185,134,74,.2)`, fontFamily:SERIF, margin:"0 auto 16px" }}>{USER.initials}</div>
            <div style={{ fontSize:24, fontWeight:700, color:C.white, fontFamily:SERIF, marginBottom:4 }}>{nomValue}</div>
            <div style={{ fontSize:12, color:"rgba(253,252,248,.55)" }}>📍 Paris, France · Membre depuis {USER.since}</div>
          </div>
          {/* Stats Airbnb style */}
          <div style={{ background:C.white, margin:"0 0 16px", padding:"20px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
              {[
                {n:SESSIONS_AVENIR.length+SESSIONS_PASSEES.length, l:"Sessions"},
                {n:AVIS_DONNES.length, l:"Avis donnés"},
                {n:"Jan 2025", l:"Membre depuis"},
              ].map((s,i,arr)=>(
                <div key={s.l} style={{ textAlign:"center", padding:"16px 8px", borderRight:i<arr.length-1?`1px solid ${C.border}`:"none" }}>
                  <div style={{ fontSize:26, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{s.n}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          {/* À propos */}
          <div style={{ background:C.white, margin:"0 16px 16px", borderRadius:16, border:`1px solid ${C.border}`, padding:"16px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:10 }}>À propos</div>
            <div style={{ fontSize:13, color:C.soft, lineHeight:1.7 }}>
              Passionné par les voyages et toujours à la recherche de nouvelles expériences. Je rejoins Savvy pour trouver les meilleurs conseils de personnes qui ont vraiment vécu ce que je veux vivre.
            </div>
          </div>
          {/* Avis reçus */}
          <div style={{ margin:"0 16px 16px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:12 }}>Avis des conseillers</div>
            {expertExtras.reviews && expertExtras.reviews.length > 0 ? expertExtras.reviews.slice(0,3).map((r,i)=>(
              <div key={i} style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div><div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{r.name}</div><div style={{ fontSize:10, color:C.muted }}>{r.date}</div></div>
                  <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s<=r.stars?"#B8864A":"#D6D0C8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
                </div>
                <div style={{ fontSize:12, color:C.soft, lineHeight:1.6, fontStyle:"italic" }}>"{r.text}"</div>
              </div>
            )) : (
              <div style={{ background:C.cream2, borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
                <div style={{ fontSize:13, color:C.muted }}>Aucun avis pour le moment.</div>
                <div style={{ fontSize:11, color:C.faint, marginTop:4 }}>Tes premiers avis apparaîtront ici après tes sessions.</div>
              </div>
            )}
            {false && [{expert:EXPERTS[0]}].map((r,i)=>(
              <div key={i} style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:10 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:9 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:r.expert.bg, color:r.expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{r.expert.initials}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{r.expert.name}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{r.date}</div>
                  </div>
                  <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill="#B8864A"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
                </div>
                <div style={{ fontSize:12, color:C.soft, lineHeight:1.6, fontStyle:"italic" }}>"{r.text}"</div>
              </div>
            ))}
          </div>
          <div style={{ padding:"0 16px 40px" }}>
            <button onClick={()=>setShowMyProfile(false)} style={{ width:"100%", padding:"14px", borderRadius:13, border:`1px solid ${C.border}`, background:C.white, color:C.ink, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>Fermer</button>
          </div>
        </div>
      </>}

      {/* ── Mot de passe ────────────────────────────────────────────────── */}
      {showPwdModal && <>
        <div onClick={()=>{setShowPwdModal(false);setPwdStep(1);setPwdCurrent("");setPwdNew("");setPwdConfirm("");}} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", padding:"24px 22px 36px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 20px" }}/>
          {pwdStep === 3
            ? <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:44, marginBottom:14 }}>✅</div>
                <div style={{ fontSize:18, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Mot de passe modifié !</div>
                <div style={{ fontSize:13, color:C.muted, marginBottom:22 }}>Ton nouveau mot de passe est actif.</div>
                <button onClick={()=>{setShowPwdModal(false);setPwdStep(1);}} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:SERIF }}>Parfait !</button>
              </div>
            : <>
                <div style={{ fontSize:17, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:4 }}>Changer le mot de passe</div>
                <div style={{ fontSize:12, color:C.muted, marginBottom:18 }}>Étape {pwdStep}/2</div>
                {pwdStep===1 && <>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:.5 }}>Mot de passe actuel</label>
                    <div style={{ position:"relative" }}>
                      <input value={pwdCurrent} onChange={e=>setPwdCurrent(e.target.value)} type={showPwdCurrent?"text":"password"} placeholder="••••••••" style={{ width:"100%", padding:"12px 46px 12px 14px", borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.cream2 }} autoFocus/>
                      <button type="button" onClick={()=>setShowPwdCurrent(v=>!v)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:17, padding:0 }}>{showPwdCurrent?"🙈":"👁️"}</button>
                    </div>
                  </div>
                  <button onClick={()=>{ if(!pwdCurrent){alert("Entre ton mot de passe actuel.");return;} setPwdStep(2); }} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:SERIF }}>Continuer →</button>
                </>}
                {pwdStep===2 && <>
                  {[[" Nouveau mot de passe","pwdNew",pwdNew,setPwdNew,showPwdNew,setShowPwdNew],["Confirmer","pwdConfirm",pwdConfirm,setPwdConfirm,showPwdConfirm,setShowPwdConfirm]].map(([label,key,val,setter,show,setShow])=>(
                    <div key={key} style={{ marginBottom:12 }}>
                      <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:.5 }}>{label.trim()}</label>
                      <div style={{ position:"relative" }}>
                        <input value={val} onChange={e=>setter(e.target.value)} type={show?"text":"password"} placeholder="••••••••" style={{ width:"100%", padding:"12px 46px 12px 14px", borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.cream2 }} autoFocus={key==="pwdNew"}/>
                        <button type="button" onClick={()=>setShow(v=>!v)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:17, padding:0 }}>{show?"🙈":"👁️"}</button>
                      </div>
                    </div>
                  ))}
                  {pwdNew.length > 0 && pwdNew.length < 8 && <div style={{ fontSize:11, color:"#B91C1C", marginBottom:10 }}>⚠️ Minimum 8 caractères</div>}
                  <button onClick={()=>{ if(pwdNew.length<8){alert("Minimum 8 caractères.");return;} if(pwdNew!==pwdConfirm){alert("Les mots de passe ne correspondent pas.");return;} setPwdStep(3); }} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", background:pwdNew.length>=8&&pwdNew===pwdConfirm?C.ink:C.cream3, color:pwdNew.length>=8&&pwdNew===pwdConfirm?C.white:C.muted, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:SERIF }}>Enregistrer →</button>
                </>}
              </>}
        </div>
      </>}

      {/* ── Ajouter une carte ───────────────────────────────────────────── */}
      {showCardModal && <>
        <div onClick={()=>setShowCardModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", padding:"24px 22px 36px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 20px" }}/>
          <div style={{ fontSize:17, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:18 }}>Ajouter une carte</div>
          {[["Numéro de carte","1234 5678 9012 3456","cc-number"],["Titulaire","Clément Rousseau","name"],["Expiration","MM/AA","cc-exp"],["CVV","•••","cc-csc"]].map(([label,ph,auto])=>(
            <div key={label} style={{ marginBottom:12 }}>
              <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:.5 }}>{label}</label>
              <input placeholder={ph} autoComplete={auto} style={{ width:"100%", padding:"12px 14px", borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.cream2 }}/>
            </div>
          ))}
          <div style={{ display:"flex", gap:9, alignItems:"center", background:C.sageL, borderRadius:11, padding:"10px 13px", marginBottom:16 }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ fontSize:11, color:C.sage }}>Paiement sécurisé — données chiffrées SSL</span>
          </div>
          <div style={{ display:"flex", gap:9 }}>
            <button onClick={()=>setShowCardModal(false)} style={{ flex:1, padding:"13px", borderRadius:12, border:`1px solid ${C.border}`, background:C.white, color:C.ink, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Annuler</button>
            <button onClick={()=>setShowCardModal(false)} style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF }}>Ajouter la carte ✓</button>
          </div>
        </div>
      </>}

      {/* ── Legal modals ────────────────────────────────────────────────── */}
      {legalModal && <>
        <div onClick={()=>setLegalModal(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50 }}/>
        <div style={{ position:"fixed", inset:0, background:C.white, zIndex:60, overflowY:"auto" }}>
          <div style={{ padding:"52px 20px 16px", display:"flex", alignItems:"center", gap:11, borderBottom:`1px solid ${C.border}` }}>
            <button onClick={()=>setLegalModal(null)} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>
              {legalModal==="cgu"?"Conditions d\'utilisation":legalModal==="privacy"?"Politique de confidentialité":"Mes NDAs signés"}
            </div>
          </div>
          <div style={{ padding:"20px 22px 40px" }}>
            {legalModal==="cgu" && <>
              <div style={{ fontSize:11, color:C.muted, marginBottom:16 }}>Dernière mise à jour : 1er janvier 2025</div>
              {[
                {title:"1. Objet",text:"Les présentes Conditions Générales d\'Utilisation régissent l\'accès et l\'utilisation de la plateforme Savvy, accessible via l\'application mobile Savvy, éditée par Savvy SAS, société par actions simplifiée au capital de 10 000€."},
                {title:"2. Services proposés",text:"Savvy est une marketplace mettant en relation des experts (« Conseillers ») avec des particuliers ou professionnels (« Clients ») souhaitant bénéficier de conseils basés sur une expérience réelle et vécue."},
                {title:"3. Commission Savvy",text:"Savvy prélève une commission de 20% sur chaque transaction réalisée sur la plateforme. Le Conseiller reçoit 80% du montant payé par le Client. Cette commission couvre les frais de plateforme, de paiement sécurisé et de support client."},
                {title:"4. Responsabilités",text:"Savvy agit en tant qu\'intermédiaire technique. Les conseils prodigués sont sous la responsabilité exclusive du Conseiller. Savvy ne peut être tenu responsable de la qualité ou des résultats des sessions."},
                {title:"5. Remboursements",text:"Tout remboursement pour annulation dans les 24h précédant la session est traité sous 5 jours ouvrés. Au-delà de ce délai, le remboursement est soumis à l\'accord du Conseiller."},
              ].map(s=>(
                <div key={s.title} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:6 }}>{s.title}</div>
                  <div style={{ fontSize:13, color:C.soft, lineHeight:1.8 }}>{s.text}</div>
                </div>
              ))}
            </>}
            {legalModal==="privacy" && <>
              <div style={{ fontSize:11, color:C.muted, marginBottom:16 }}>Conforme au RGPD · Mis à jour le 1er janvier 2025</div>
              {[
                {title:"Données collectées",text:"Savvy collecte uniquement les données nécessaires au fonctionnement du service : nom, email, numéro de téléphone (optionnel), données de paiement (chiffrées), et historique des sessions."},
                {title:"Utilisation des données",text:"Tes données sont utilisées exclusivement pour : l\'accès à ton compte, le traitement des paiements, la communication avec les Conseillers, et l\'amélioration de l\'expérience Savvy."},
                {title:"Partage des données",text:"Savvy ne vend jamais tes données à des tiers. Les données de paiement sont traitées par notre prestataire certifié PCI-DSS. Seul le nom et la photo de profil sont visibles par les Conseillers."},
                {title:"Tes droits",text:"Conformément au RGPD, tu disposes d\'un droit d\'accès, de rectification, de suppression et de portabilité de tes données. Pour exercer ces droits : privacy@savvy.fr"},
                {title:"Conservation",text:"Tes données sont conservées pendant la durée de ton compte + 3 ans après sa suppression, conformément aux obligations légales françaises."},
              ].map(s=>(
                <div key={s.title} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:6 }}>{s.title}</div>
                  <div style={{ fontSize:13, color:C.soft, lineHeight:1.8 }}>{s.text}</div>
                </div>
              ))}
            </>}
            {legalModal==="nda" && <>
              <div style={{ fontSize:13, color:C.muted, marginBottom:16, lineHeight:1.6 }}>Les accords de confidentialité sont signés automatiquement lors de tes sessions avec des experts qui l\'exigent.</div>
              <div style={{ background:C.cream2, borderRadius:13, padding:"16px", textAlign:"center", border:`1px solid ${C.border}` }}>
                <div style={{ fontSize:20, marginBottom:8 }}>📋</div>
                <div style={{ fontSize:13, fontWeight:600, color:C.ink, marginBottom:6 }}>Aucun NDA signé pour le moment</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.6 }}>Tes NDAs apparaîtront ici après tes premières sessions avec des experts qui l\'exigent (Ahmed Rashidi, par exemple).</div>
              </div>
            </>}
          </div>
        </div>
      </>}

      {/* ── Supprimer compte ──────────────────────────────────────────── */}
      {showDeleteModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999,padding:"0 0 env(safe-area-inset-bottom)"}}>
          <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 36px",width:"100%",maxWidth:480}}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 22px"}}/>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:40,marginBottom:10}}>🗑️</div>
              <div style={{fontSize:18,fontWeight:800,color:"#DC2626",fontFamily:SERIF,marginBottom:8}}>Supprimer le compte</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Cette action est <strong>irréversible</strong>. Toutes tes données, sessions et messages seront supprimés définitivement.</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowDeleteModal(false)} style={{flex:1,padding:"14px",borderRadius:13,border:`1.5px solid ${C.border}`,background:C.white,color:C.ink,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
              <button onClick={()=>{ setShowDeleteModal(false); onLogout&&onLogout(); }} style={{flex:1,padding:"14px",borderRadius:13,border:"none",background:"#DC2626",color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modifier profil expert ─────────────────────────────────────── */}
      {showEditExpert && (() => {
        const EditExpertForm = () => {
          const [tagline, setTagline] = useState(expertUser?.tagline || "");
          const [bio, setBio] = useState(expertUser?.bio || "");
          const [role, setRole] = useState(expertUser?.role?.split("·")[0]?.trim() || "");
          const [saving, setSaving] = useState(false);
          const handleSave = async () => {
            setSaving(true);
            if (authUser?.real) {
              await supabase.from("experts").update({ tagline, bio, role }).eq("user_id", authUser.id);
              const { data } = await supabase.from("experts").select("*").eq("user_id", authUser.id).single();
              if (data) setSbExpertData(data);
            }
            setSaving(false);
            setShowEditExpert(false);
          };
          return <>
            <div onClick={()=>setShowEditExpert(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50 }}/>
            <div style={{ position:"fixed", inset:0, background:C.cream, zIndex:60, overflowY:"auto" }}>
              <div style={{ padding:"52px 20px 16px", display:"flex", alignItems:"center", gap:11, borderBottom:`1px solid ${C.border}`, background:C.white }}>
                <button onClick={()=>setShowEditExpert(false)} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:36, height:36, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Modifier mon profil expert</div>
              </div>
              <div style={{ padding:"20px 20px 40px" }}>
                {[
                  {label:"Tagline", ph:"Ex : J'aide les nouveaux arrivants à trouver un logement en 2 semaines", val:tagline, set:setTagline, multi:false},
                  {label:"Biographie", ph:"En 2-3 phrases : qui es-tu et comment aides-tu tes clients ?", val:bio, set:setBio, multi:true},
                  {label:"Domaine / Spécialité", ph:"Ex : Vie en France · Import-Export · Logement", val:role, set:setRole, multi:false},
                ].map(f => (
                  <div key={f.label} style={{ marginBottom:16 }}>
                    <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:.5 }}>{f.label}</label>
                    {f.multi
                      ? <textarea value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{ width:"100%", padding:"12px 14px", borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", height:90, resize:"none", background:C.white }}/>
                      : <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{ width:"100%", padding:"12px 14px", borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>}
                  </div>
                ))}
                <div style={{ display:"flex", gap:9 }}>
                  <button onClick={()=>setShowEditExpert(false)} style={{ flex:1, padding:"13px", borderRadius:12, border:`1px solid ${C.border}`, background:C.white, color:C.ink, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Annuler</button>
                  <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF, opacity:saving?.6:1 }}>{saving?"Enregistrement…":"Enregistrer ✓"}</button>
                </div>
              </div>
            </div>
          </>;
        };
        return <EditExpertForm/>;
      })()}

      {/* ── Voir mon profil expert ───────────────────────────────────────── */}
      {showExpertProfile && <>
        <div onClick={()=>setShowExpertProfile(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:50 }}/>
        <div style={{ position:"fixed", inset:0, background:C.cream, zIndex:60, overflowY:"auto" }}>
          {/* Hero */}
          <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"60px 20px 36px", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <button onClick={()=>setShowExpertProfile(false)} style={{ position:"absolute", top:52, left:16, width:36, height:36, borderRadius:10, background:"rgba(253,252,248,.12)", border:"1px solid rgba(253,252,248,.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div style={{ width:96, height:96, borderRadius:"50%", background:`linear-gradient(135deg,${C.goldL},#FDE68A)`, color:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:34, border:`4px solid ${C.goldB}`, boxShadow:`0 0 0 6px rgba(185,134,74,.2)`, fontFamily:SERIF, margin:"0 auto 16px" }}>{USER.initials}</div>
            <div style={{ fontSize:24, fontWeight:700, color:C.white, fontFamily:SERIF, marginBottom:4 }}>{EXPERT_DATA.prenom} {EXPERT_DATA.nom}</div>
            <div style={{ fontSize:12, color:"rgba(253,252,248,.55)", marginBottom:14 }}>📍 {EXPERT_DATA.location} · {EXPERT_DATA.since}</div>
            {/* Badge identité vérifiée */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(16,185,129,.2)", border:"1px solid rgba(16,185,129,.4)", borderRadius:20, padding:"6px 14px" }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.sageMid} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize:12, color:C.sageMid, fontWeight:700 }}>Identité vérifiée par Savvy</span>
            </div>
          </div>
          {/* Stats */}
          <div style={{ background:C.white, padding:"20px", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
              {[
                {n:EXPERT_DATA.impact.sessions||0, l:"Sessions"},
                {n:expertUser?.rating>0?(expertUser.rating+"★"):"Nouveau", l:"Note moyenne"},
                {n:EXPERT_DATA.since, l:"Membre depuis"},
              ].map((s,i,arr)=>(
                <div key={s.l} style={{ textAlign:"center", padding:"14px 8px", borderRight:i<arr.length-1?`1px solid ${C.border}`:"none" }}>
                  <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{s.n}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding:"20px 20px 40px" }}>
            {/* Tagline */}
            <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:16 }}>
              <div style={{ fontSize:13, color:C.soft, lineHeight:1.7, fontStyle:"italic" }}>
                "{EXPERT_DATA.probleme}"
              </div>
            </div>
            {/* Avis reçus des clients */}
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:12 }}>Avis reçus de mes clients</div>
            {expertExtras.reviews && expertExtras.reviews.length > 0
              ? expertExtras.reviews.map((r,i)=>(
                  <div key={i} style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <div><div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{r.name}</div><div style={{ fontSize:10, color:C.muted }}>{r.date}</div></div>
                      <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(s=><svg key={s} width={12} height={12} viewBox="0 0 12 12" fill={s<=r.stars?"#B8864A":"#D6D0C8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
                    </div>
                    <div style={{ fontSize:12, color:C.soft, lineHeight:1.6, fontStyle:"italic" }}>"{r.text}"</div>
                  </div>
                ))
              : <div style={{ background:C.cream2, borderRadius:13, padding:"20px 16px", textAlign:"center", border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:24, marginBottom:10 }}>⭐</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:6 }}>Tes premiers avis arrivent bientôt</div>
                  <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>Après tes premières sessions, tes clients pourront te laisser un avis ici.</div>
                </div>
            }
            <button onClick={()=>setShowExpertProfile(false)} style={{ width:"100%", padding:"14px", borderRadius:13, border:`1px solid ${C.border}`, background:C.white, color:C.ink, fontWeight:600, fontSize:14, cursor:"pointer", fontFamily:"inherit", marginTop:8 }}>Fermer</button>
          </div>
        </div>
      </>}

      {/* ── Modal Favoris ───────────────────────────────────────────────── */}
      {showFavs && <>
        <div onClick={()=>setShowFavs(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 14px" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              {(()=>{ const favs=(()=>{try{return JSON.parse(localStorage.getItem("savvy_favs")||"[]");}catch{return [];}})(); return (<div><div style={{ fontSize:17, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Mes favoris</div><div style={{ fontSize:12, color:C.muted }}>{favs.length} expert{favs.length!==1?"s":""} sauvegardé{favs.length!==1?"s":""}</div></div>); })()}
              <button onClick={()=>setShowFavs(false)} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:C.muted }}>×</button>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 18px 24px" }}>
            {(()=>{try{return JSON.parse(localStorage.getItem("savvy_favs")||"[]");}catch{return [];}})().map(e => (
              <div key={e.id} style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:"13px 15px", marginBottom:10, display:"flex", gap:12, alignItems:"center", boxShadow:`0 1px 6px ${C.sh}` }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:e.bg||C.goldL, color:e.color||C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{e.initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{e.name}</div>
                  <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{e.role.split("·")[0].trim()}</div>
                  <div style={{ display:"flex", gap:2, marginTop:4 }}>{[1,2,3,4,5].map(s=><svg key={s} width={10} height={10} viewBox="0 0 12 12" fill="#B8864A"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>dès {e.phases[0].price}€</div>
                  <div style={{ fontSize:11, color:C.muted }}>❤️</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>}

      {/* ── Modal Avis donnés ───────────────────────────────────────────── */}
      {showAvis && <>
        <div onClick={()=>setShowAvis(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
        <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", maxHeight:"80vh", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 14px" }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div><div style={{ fontSize:17, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Mes avis</div><div style={{ fontSize:12, color:C.muted }}>{AVIS_DONNES.length} avis donnés</div></div>
              <button onClick={()=>setShowAvis(false)} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:C.muted }}>×</button>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 18px 24px" }}>
            {AVIS_DONNES.map(a => {
              const expert = EXPERTS[a.eid];
              return <div key={a.id} style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:10 }}>
                <div style={{ display:"flex", gap:11, alignItems:"center", marginBottom:11 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{expert.initials}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{expert.name}</div>
                    <div style={{ fontSize:11, color:C.muted }}>{a.date}</div>
                  </div>
                  <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(s=><svg key={s} width={12} height={12} viewBox="0 0 12 12" fill={s<=a.stars?"#B8864A":"#D6D0C8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
                </div>
                <div style={{ fontSize:13, color:C.soft, fontStyle:"italic", lineHeight:1.6, background:C.cream2, borderRadius:10, padding:"10px 13px" }}>"{a.text}"</div>
              </div>;
            })}
          </div>
        </div>
      </>}
    </>
  );
}


export default ProfileScreen;
