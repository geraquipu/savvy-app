import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';
import { C, SERIF, SANS } from '../constants/colors';
import { DEMO_USERS, CATS, SUBCATS, TRUST_LEVELS, getTrustLevel, getBookings, EXPERTS, getCountdown } from '../constants/data';
import { EXPERT_EXTRAS, EXPERT_STYLE_TAGS, EXPERT_FIRST_SESSION } from '../constants/expertExtras';
import { SESSIONS_AVENIR, SESSIONS_PASSEES, SESSIONS_ANNULEES } from '../constants/sessionData';
import { Stars, Av } from '../components/ui';
import { MENU_ICONS } from '../constants/menuIcons.jsx';
import { ClientView } from './profile/ClientView';
import { ExpertView } from './profile/ExpertView';

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


function ProfileScreen({ onSignup, onViewPublic, isExpert, onBecomeExpert, onLogout, authUser, isLoggedIn, onLogin, onNavigate, newExpertProfile, initExpSection, appMode, onRequestsChange, uploadPhoto, dbExperts=[] }) {
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
  const [realPaidBookings, setRealPaidBookings] = useState([]);
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
      const { error } = await supabase.from("experts").update({ phases: newOffres }).eq("user_id", authUser.id);
      if (error) console.warn("[saveOffres]", error.message);
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
    if (!authUser?.real || !authUser?.id) return;
    if (authUser?.expertId) { setResolvedExpertId(authUser.expertId); return; }
    // Fallback: chercher l'expertId même si isExpert n'est pas encore confirmé
    supabase.from("experts").select("id").eq("user_id", authUser.id).single()
      .then(({data}) => {
        if (data?.id) setResolvedExpertId(data.id);
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
          status: b.status, hoursUntil: b.date_session ? Math.round((new Date(b.date_session) - Date.now()) / 3600000) : 999,
          startTs: b.date_session ? new Date(b.date_session).getTime() : null,
        };
      };
      // Store paid bookings with client names
      setRealPaidBookings(data.filter(b => b.paid && b.status === "confirmed").map(b=>({
        ...b, client_name: profileMap[b.client_id] || "Client Savvy"
      })));
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
              <button onClick={async()=>{
                if(r._fromLS) updateBooking(r.id, {status:"cancelled"});
                if(!r._fromLS && r.id){
                  let { data: upd, error } = await supabase.from("bookings").update({status:"cancelled", cancel_reason:"Demande refusée par l'expert", cancelled_by:"expert"}).eq("id", r.id).select().single();
                  if(error) ({ data: upd } = await supabase.from("bookings").update({status:"cancelled"}).eq("id", r.id).select().single());
                  if(upd) supabase.functions.invoke("notify-booking", { body: { record: upd, type: "UPDATE" } }).catch(()=>{});
                }
                setExpCancelled(prev=>[{...r,statut:"refusé",motif:"Refusé par l'expert"},...prev]);
                setExpRequests(prev=>prev.filter(x=>x.id!==r.id));
                setClientProfileModal(null);
              }} style={{flex:1,padding:"13px",borderRadius:13,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                ✕ Refuser
              </button>
              <button onClick={async()=>{
                const confirmed={...r,statut:"confirmé",hoursUntil:r.date==="Demain"?22:r.date==="Aujourd'hui"?6:168};
                if(r._fromLS) updateBooking(r.id, {status:"confirmed"});
                if(!r._fromLS && r.id) {
                  const { data: upd } = await supabase.from("bookings").update({status:"confirmed"}).eq("id", r.id).select().single();
                  if(upd) supabase.functions.invoke("notify-booking", { body: { record: upd, type: "UPDATE" } }).catch(()=>{});
                }
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

            {/* Politique d'annulation */}
            <div style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:C.ink,marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>Politique d'annulation Savvy</div>
              {cancelModal.type==="exp" ? (
                <ul style={{margin:0,paddingLeft:16,fontSize:11,color:C.muted,lineHeight:1.7}}>
                  <li>Ton client est notifié immédiatement (email + notification).</li>
                  <li>S'il avait payé, il est <strong>remboursé à 100%</strong> sous 5 à 10 jours ouvrés.</li>
                  <li>Le motif choisi lui est communiqué.</li>
                  <li>Les annulations répétées réduisent ta visibilité sur Savvy.</li>
                </ul>
              ) : (
                <ul style={{margin:0,paddingLeft:16,fontSize:11,color:C.muted,lineHeight:1.7}}>
                  <li>Annulation gratuite jusqu'à <strong>24h avant</strong> la session.</li>
                  <li>Moins de 24h avant : la session peut ne pas être remboursée.</li>
                  <li>L'expert est notifié de ton annulation.</li>
                </ul>
              )}
            </div>

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
            <button onClick={async()=>{
              const s = cancelModal.session;
              const motif = cancelModal.selectedMotif==="Autre"?(cancelModal.motifTexte||"Autre"):cancelModal.selectedMotif;
              const cancelledBy = cancelModal.type==="exp" ? "expert" : "client";
              if(s._fromLS) updateBooking(s.id, {status:"cancelled"});
              if(!s._fromLS && s.id){
                // Tente d'enregistrer le motif ; retombe sur status seul si les colonnes n'existent pas encore
                let { data: upd, error } = await supabase.from("bookings").update({status:"cancelled", cancel_reason:motif||null, cancelled_by:cancelledBy}).eq("id", s.id).select().single();
                if(error) ({ data: upd } = await supabase.from("bookings").update({status:"cancelled"}).eq("id", s.id).select().single());
                if(upd) supabase.functions.invoke("notify-booking", { body: { record: upd, type: "UPDATE" } }).catch(()=>{});
              }
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
          try{
            const url=await uploadPhoto(f,authUser?.id);
            setPhotoUrl(url);
            if(authUser?.id){
              const {error}=await supabase.from(mode==="expert"?"experts":"profiles").update({photo_url:url}).eq(mode==="expert"?"user_id":"id",authUser.id);
              if(error) alert("Erreur photo : "+error.message);
            }
          }catch(err){ alert("Erreur upload : "+(err?.message||"Réessaie")); }
        }}
      />
      <div style={{ flex:1, overflowY:"auto", paddingBottom:80, background:C.cream }}>
        <Header/>
        {mode === "client" ? (
          <ClientView
            USER={USER} authUser={authUser} isExpert={isExpert}
            onNavigate={onNavigate} onSignup={onSignup} onBecomeExpert={onBecomeExpert} onLogout={onLogout}
            photoUrl={photoUrl} photoInputRef={photoInputRef}
            setCancelModal={setCancelModal}
            openSection={openSection} setOpenSection={setOpenSection}
            helpMsgSent={helpMsgSent} setHelpMsgSent={setHelpMsgSent} helpMsgText={helpMsgText} setHelpMsgText={setHelpMsgText}
            convoOpen={convoOpen} setConvoOpen={setConvoOpen}
            editingInfo={editingInfo} setEditingInfo={setEditingInfo} editInfoVal={editInfoVal} setEditInfoVal={setEditInfoVal} editInfoSaved={editInfoSaved} setEditInfoSaved={setEditInfoSaved}
            userEmail={userEmail} setUserEmail={setUserEmail}
            setShowPwdModal={setShowPwdModal} setShowDeleteModal={setShowDeleteModal}
            clientSection={clientSection} setClientSection={setClientSection}
            clientSubSection={clientSubSection} setClientSubSection={setClientSubSection}
            clientSessionFilter={clientSessionFilter} setClientSessionFilter={setClientSessionFilter}
            clientPayFilter={clientPayFilter} setClientPayFilter={setClientPayFilter}
            clientCercleTab={clientCercleTab} setClientCercleTab={setClientCercleTab}
            clientShowReferModal={clientShowReferModal} setClientShowReferModal={setClientShowReferModal}
            clientNotifToggles={clientNotifToggles} setClientNotifToggles={setClientNotifToggles}
            clientSearchPay={clientSearchPay} setClientSearchPay={setClientSearchPay}
            clientMoisFilter={clientMoisFilter} setClientMoisFilter={setClientMoisFilter}
            dbExperts={dbExperts}
            setUserName={setUserName}
          />
        ) : (
          <ExpertView
            USER={USER} EXPERT_DATA={EXPERT_DATA} isExpert={isExpert} authUser={authUser}
            newExpertProfile={newExpertProfile} isNewExpert={isNewExpert} sbExpertData={sbExpertData}
            onNavigate={onNavigate} onSignup={onSignup} onBecomeExpert={onBecomeExpert} onLogout={onLogout}
            photoUrl={photoUrl} photoInputRef={photoInputRef}
            setCancelModal={setCancelModal} setClientProfileModal={setClientProfileModal}
            openSection={openSection} setOpenSection={setOpenSection}
            helpMsgSent={helpMsgSent} setHelpMsgSent={setHelpMsgSent} helpMsgText={helpMsgText} setHelpMsgText={setHelpMsgText}
            convoOpen={convoOpen} setConvoOpen={setConvoOpen}
            expSection={expSection} setExpSection={setExpSection}
            expSubSection={expSubSection} setExpSubSection={setExpSubSection}
            expSessionFilter={expSessionFilter} setExpSessionFilter={setExpSessionFilter}
            expRevFilter={expRevFilter} setExpRevFilter={setExpRevFilter}
            realPaidBookings={realPaidBookings}
            expNotifToggles={expNotifToggles} setExpNotifToggles={setExpNotifToggles}
            expShowShareModal={expShowShareModal} setExpShowShareModal={setExpShowShareModal}
            expRequests={expRequests} setExpRequests={setExpRequests}
            expConfirmed={expConfirmed} setExpConfirmed={setExpConfirmed}
            expCancelled={expCancelled} setExpCancelled={setExpCancelled}
            expSessionTab={expSessionTab} setExpSessionTab={setExpSessionTab}
            expOffres={expOffres} setExpOffres={setExpOffres} saveOffres={saveOffres}
            offresOpen={offresOpen} setOffresOpen={setOffresOpen}
            editingOffer={editingOffer} setEditingOffer={setEditingOffer}
            editOfferData={editOfferData} setEditOfferData={setEditOfferData}
            dispoMonth={dispoMonth} setDispoMonth={setDispoMonth}
            dispoSelected={dispoSelected} setDispoSelected={setDispoSelected}
            dispoHours={dispoHours} setDispoHours={setDispoHours}
            dispoKey={dispoKey} dispoSaved={dispoSaved} setDispoSaved={setDispoSaved}
            resolvedExpertId={resolvedExpertId}
            showRevenu={showRevenu} setShowRevenu={setShowRevenu}
            showCardModal={showCardModal} setShowCardModal={setShowCardModal}
            showEditExpert={showEditExpert} setShowEditExpert={setShowEditExpert}
            showExpertProfile={showExpertProfile} setShowExpertProfile={setShowExpertProfile}
            sessionConfirmToast={sessionConfirmToast} setSessionConfirmToast={setSessionConfirmToast}
            profileEdits={profileEdits} saveProfileEdit={saveProfileEdit}
            editingParam={editingParam} setEditingParam={setEditingParam}
            editParamVal={editParamVal} setEditParamVal={setEditParamVal}
            setShowPwdModal={setShowPwdModal} setShowDeleteModal={setShowDeleteModal}
            onRequestsChange={onRequestsChange}
          />
        )}
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
              <div style={{ fontSize:11, color:C.muted, marginBottom:16 }}>Conforme au RGPD · Mis à jour le 25 juin 2026</div>
              {[
                {title:"1. Responsable du traitement",text:"Savvy (auto-entrepreneur, France). Contact : privacy@getsavvy.fr"},
                {title:"2. Données collectées",text:"Savvy collecte uniquement les données nécessaires au service : nom et prénom, adresse email, photo de profil (optionnelle), données de paiement (traitées et chiffrées par Stripe — Savvy ne stocke jamais les numéros de carte), historique des réservations et sessions, messages échangés avec les Conseillers."},
                {title:"3. Finalités du traitement",text:"Tes données sont utilisées pour : (a) créer et gérer ton compte, (b) traiter les paiements et remboursements, (c) te mettre en relation avec des Conseillers, (d) t\'envoyer des confirmations de réservation par email, (e) améliorer la qualité du service, (f) respecter nos obligations légales et fiscales."},
                {title:"4. Base légale",text:"Le traitement est fondé sur l\'exécution du contrat (art. 6.1.b RGPD) pour les données nécessaires au service, et sur notre intérêt légitime (art. 6.1.f RGPD) pour l\'amélioration du service."},
                {title:"5. Destinataires des données",text:"Savvy ne vend jamais tes données. Elles sont partagées uniquement avec nos sous-traitants certifiés : Stripe (paiements, certifié PCI-DSS), Supabase (hébergement base de données, serveurs en Europe), Resend (envoi d\'emails transactionnels). Les Conseillers voient uniquement ton prénom et ta photo de profil."},
                {title:"6. Transferts hors UE",text:"Certains sous-traitants (Stripe, Supabase) peuvent traiter des données hors de l\'UE avec des garanties appropriées (clauses contractuelles types de la Commission européenne)."},
                {title:"7. Durée de conservation",text:"Données de compte : durée de vie du compte + 3 ans. Données de paiement : 5 ans (obligation légale fiscale). Messages : 2 ans après la dernière activité. Tu peux demander la suppression anticipée à privacy@getsavvy.fr."},
                {title:"8. Tes droits (RGPD)",text:"Tu disposes des droits suivants : accès, rectification, suppression (\"droit à l\'oubli\"), portabilité, limitation du traitement, opposition. Pour exercer ces droits : privacy@getsavvy.fr. Réponse sous 30 jours. Tu peux également déposer une réclamation auprès de la CNIL (cnil.fr)."},
                {title:"9. Cookies",text:"Savvy n\'utilise pas de cookies publicitaires ni de trackers tiers. Un cookie de session est utilisé uniquement pour maintenir ta connexion."},
                {title:"10. Contact",text:"Responsable du traitement : Savvy — privacy@getsavvy.fr"},
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
              <div style={{width:56,height:56,borderRadius:"50%",background:"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px"}}>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1={10} y1={11} x2={10} y2={17}/><line x1={14} y1={11} x2={14} y2={17}/></svg>
              </div>
              <div style={{fontSize:18,fontWeight:800,color:"#DC2626",fontFamily:SERIF,marginBottom:8}}>Supprimer le compte</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Cette action est <strong>irréversible</strong>. Toutes tes données, sessions et messages seront supprimés définitivement.</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setShowDeleteModal(false)} style={{flex:1,padding:"14px",borderRadius:13,border:`1.5px solid ${C.border}`,background:C.white,color:C.ink,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
              <button onClick={async()=>{
                setShowDeleteModal(false);
                if (authUser?.real) {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    await supabase.functions.invoke("delete-account", {
                      headers: { Authorization: `Bearer ${session?.access_token}` },
                    });
                  } catch(e) { console.warn("delete-account:", e); }
                }
                onLogout&&onLogout();
              }} style={{flex:1,padding:"14px",borderRadius:13,border:"none",background:"#DC2626",color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Supprimer</button>
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
          const [meetLink, setMeetLink] = useState(sbExpertData?.meet_link || "");
          const [saving, setSaving] = useState(false);
          const handleSave = async () => {
            setSaving(true);
            if (authUser?.real) {
              const { error } = await supabase.from("experts").update({ tagline, bio, role, meet_link: meetLink||null }).eq("user_id", authUser.id);
              if (error) {
                console.error("Bio save error:", error.message, error.code);
                alert("Erreur lors de la sauvegarde : " + error.message);
                setSaving(false);
                return;
              }
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
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:.5 }}>Lien de visio (Zoom / Meet / Teams)</label>
                  <input value={meetLink} onChange={e=>setMeetLink(e.target.value)} placeholder="https://zoom.us/j/... ou https://meet.google.com/..." style={{ width:"100%", padding:"12px 14px", borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>
                  <div style={{ fontSize:11, color:C.muted, marginTop:5 }}>Ce lien sera envoyé au client quand tu confirmes une session.</div>
                </div>
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
            {(() => {
              const realName = authUser?.real ? (authUser?.name || `${EXPERT_DATA.prenom} ${EXPERT_DATA.nom}`) : `${EXPERT_DATA.prenom} ${EXPERT_DATA.nom}`;
              const realLoc = authUser?.real ? (sbExpertData?.location || "France") : EXPERT_DATA.location;
              const realSince = authUser?.real
                ? (sbExpertData?.created_at ? new Date(sbExpertData.created_at).toLocaleDateString("fr-FR",{month:"long",year:"numeric"}) : "récemment")
                : EXPERT_DATA.since;
              return <>
                {photoUrl
                  ? <img src={photoUrl} alt="" style={{ width:96, height:96, borderRadius:"50%", objectFit:"cover", border:`4px solid ${C.goldB}`, boxShadow:`0 0 0 6px rgba(185,134,74,.2)`, margin:"0 auto 16px", display:"block" }}/>
                  : <div style={{ width:96, height:96, borderRadius:"50%", background:`linear-gradient(135deg,${C.goldL},#FDE68A)`, color:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:34, border:`4px solid ${C.goldB}`, boxShadow:`0 0 0 6px rgba(185,134,74,.2)`, fontFamily:SERIF, margin:"0 auto 16px" }}>{USER.initials}</div>
                }
                <div style={{ fontSize:24, fontWeight:700, color:C.white, fontFamily:SERIF, marginBottom:4 }}>{realName}</div>
                <div style={{ fontSize:12, color:"rgba(253,252,248,.55)", marginBottom:14 }}>📍 {realLoc} · Membre depuis {realSince}</div>
              </>;
            })()}
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
                {n: authUser?.real ? realStats.sessions : (EXPERT_DATA.impact.sessions||0), l:"Sessions"},
                {n: authUser?.real ? (realStats.reviewCount>0 ? realStats.rating+"★" : "Nouveau") : (expertUser?.rating>0?(expertUser.rating+"★"):"Nouveau"), l:"Note moyenne"},
                {n: authUser?.real ? (sbExpertData?.created_at ? new Date(sbExpertData.created_at).toLocaleDateString("fr-FR",{month:"short",year:"numeric"}) : "—") : EXPERT_DATA.since, l:"Membre depuis"},
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
                "{authUser?.real ? (sbExpertData?.tagline || authUser?.tagline || "Expert Savvy") : EXPERT_DATA.probleme}"
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
