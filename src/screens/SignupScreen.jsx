import React, { useState } from 'react';
import { supabase } from '../supabase';
import { C, SERIF } from '../constants/colors';
import { CATS, SUBCATS } from '../constants/data';

const SIGNUP_T = {
  fr: {
    langBtn: "ES",
    // landing
    heroTitle: <>Quelqu'un cherche déjà<br/><em style={{color:"#C9A96E"}}>ce que tu sais.</em></>,
    heroSub: "Des milliers de personnes recherchent l'expérience de quelqu'un qui l'a déjà vécu.",
    heroBtn: "Je me lance",
    heroFine: "Gratuit · 2 min · Sans engagement",
    whyTitle: "Transforme ton expérience en revenus",
    whySub: "Fixe tes tarifs et sois rémunéré pour aider les autres.",
    why1t: "Ton vécu vaut plus qu'un diplôme", why1s: "Les utilisateurs recherchent des personnes qui ont déjà parcouru le chemin.",
    why2t: "Tu décides comment et quand aider", why2s: "Chat, appel, vidéo ou accompagnement par étapes — tu choisis.",
    why3t: "Savvy te protège à chaque session", why3s: "Paiements sécurisés, NDA automatique, support en français 7j/7.",
    socialTitle: "Ils ont déjà rejoint Savvy",
    createBtn: "Créer mon profil →",
    cguNote: "En créant un profil, tu acceptes les CGU Savvy",
    // step 1
    step1Title: "Présente-toi",
    addPhoto: "Ajouter photo", photoAdded: "Photo ajoutée · touche pour changer", photoHint: "Photo de profil (recommandée)",
    labelPrenom: "Prénom", labelNom: "Nom",
    labelEmail: "Email du compte", emailLocked: "Même compte que client · non modifiable",
    labelPays: "Pays de résidence", labelLangs: "Langues parlées",
    continueBtn: "Continuer →",
    errName: "Prénom et nom obligatoires.", errLang: "Sélectionne au moins une langue.",
    // step 2
    step2Title: "Ton expertise",
    step2H: "Qu'est-ce que tu sais vraiment faire ?", step2Sub: "Les clients achètent ton expérience, pas ton CV.",
    domainLabel: "Ton domaine", specialLabel: "Spécialité",
    taglineLabel: "Quel problème peux-tu résoudre en moins d'une heure ?",
    taglinePh: "Ex : J'aide les nouveaux arrivants à trouver un logement en moins de 2 semaines",
    taglineOk: "✓ Parfait", taglineHint: "Sois précis — c'est ta première impression",
    yearsLabel: "Années d'expérience",
    backBtn: "← Retour",
    errDomain: "Choisis ton domaine.", errTagline: "Écris ta phrase d'accroche (15 caractères min).", errYears: "Indique tes années d'expérience.",
    // step 3
    step3Title: "Ton offre",
    step3H: "Choisis comment tu veux interagir",
    step3Sub: "Sélectionne les formats qui te conviennent — les clients réserveront selon ta disponibilité et tes préférences.",
    durLabel: "Durée de la session",
    priceLabel: "Prix orientatif par session", priceNote: "Tu pourras ajuster le prix par format depuis ton tableau de bord.",
    errFormat: "Sélectionne au moins un format.", errPrice: "Indique un prix orientatif.",
    selectFormat: "Sélectionne au moins un format pour continuer.",
    // step 4
    step4Title: "Ta crédibilité",
    step4H: "Montre ce que tu as fait.", step4Sub: "Les clients choisissent des personnes qui ont des résultats — pas des diplômes.",
    resultLabel: "🎯 Décris un résultat réel", resultReq: "obligatoire",
    resultPh: "Ex : Trouver un appart sans garant, c'est possible — je l'ai fait 12 fois. Demande-moi comment.",
    resultOk: "✓ Parfait — concret et personnel", resultHint: "1–2 lignes · mesurable · personnel",
    proofLabel: "🔗 Renforce ta crédibilité", proofOpt: "",
    proofLien: "🔗 Lien URL", proofFile: "📎 Fichier",
    proofFilePh: "Choisir un fichier (PDF, image)",
    proofUrlPh: "https://linkedin.com/in/tonprofil ou lien portfolio",
    bioLabel: "📖 Ton histoire", bioOpt: "",
    bioNote: "Ajoute-la plus tard si tu veux — tu peux aussi la générer avec l'IA depuis ton profil.",
    bioPh: "Ex : Ancienne gestionnaire de copropriété pendant 6 ans…",
    errResult: "Décris un résultat réel (20 caractères min).",
    // step 5
    step5Title: "Tes disponibilités",
    step5H: "Quand es-tu disponible ?", step5Sub: "Les clients voient tes créneaux en temps réel — sois précis.",
    dispoNow: {title:"Je veux commencer à recevoir des clients", sub:"Mets tes créneaux en ligne tout de suite", icon:"🟢"},
    dispoLater: {title:"Je le ferai plus tard", sub:"Tu peux configurer depuis ton tableau de bord", icon:"⏸"},
    modeLabel: "Mode",
    modeRecurrent: "📅 Horaire hebdo", modeRSub: "Chaque sem.",
    modePonctuel: "🗓 Ponctuel", modePSub: "Dates précises",
    joursLabel: "Jours disponibles chaque semaine",
    timeLabel: "Plage horaire · créneaux de 30 min",
    timeFrom: "De", timeTo: "À",
    passBtn: "Passer →", saveBtn: "Enregistrer →",
    // step 6
    step6Title: "Révision ✦",
    summaryEmail: "Email", summaryPays: "Pays", summaryLangs: "Langues", summaryResult: "Résultat", summaryDispo: "Dispo",
    cguCheck: null,
    certifCheck: "Je certifie que mon expérience est authentique",
    publishBtn: "✨ Commencer à aider",
    errCgu: "Accepte les conditions pour continuer.",
    // submitted
    submittedTitle: "Candidature en cours",
    submittedSub: <>Ton profil expert est en cours de validation.<br/>Réponse sous <strong style={{color:"#C9A96E"}}>24–48h</strong>.</>,
    earn80: "Tu gardes 80% de chaque session", commNote: "Commission Savvy : 20% fixe — jamais plus",
    pendingTitle: "📌 À compléter en attendant",
    pendingPhoto: "Ajoute une photo de profil", pendingBio: "Complète ta bio", pendingDispo: "Configure tes disponibilités",
    allDone: "Profil complet — photo et bio ajoutées ✓",
    accessBtn: "Accéder à mon espace conseiller →",
  },
  es: {
    langBtn: "FR",
    // landing
    heroTitle: <>Alguien ya está buscando<br/><em style={{color:"#C9A96E"}}>lo que tú sabes.</em></>,
    heroSub: "Miles de personas buscan la experiencia de alguien que ya vivió lo mismo.",
    heroBtn: "Empezar ahora",
    heroFine: "Gratis · 2 min · Sin compromiso",
    whyTitle: "Convierte tu experiencia en ingresos",
    whySub: "Fija tus tarifas y cobra por ayudar a otros.",
    why1t: "Tu experiencia vale más que un diploma", why1s: "Los usuarios buscan personas que ya recorrieron el camino.",
    why2t: "Tú decides cómo y cuándo ayudar", why2s: "Chat, llamada, video o acompañamiento por etapas — tú eliges.",
    why3t: "Savvy te protege en cada sesión", why3s: "Pagos seguros, NDA automático, soporte 7d/7.",
    socialTitle: "Ya se unieron a Savvy",
    createBtn: "Crear mi perfil →",
    cguNote: "Al crear un perfil, aceptas los Términos y Condiciones de Savvy",
    // step 1
    step1Title: "¿Quién eres?",
    addPhoto: "Añadir foto", photoAdded: "Foto añadida · toca para cambiar", photoHint: "Foto de perfil (recomendada)",
    labelPrenom: "Nombre", labelNom: "Apellido",
    labelEmail: "Email de la cuenta", emailLocked: "Misma cuenta que cliente · no modificable",
    labelPays: "País de residencia", labelLangs: "Idiomas hablados",
    continueBtn: "Continuar →",
    errName: "Nombre y apellido obligatorios.", errLang: "Selecciona al menos un idioma.",
    // step 2
    step2Title: "Tu expertise",
    step2H: "¿En qué eres realmente bueno?", step2Sub: "Tu experiencia, no tu diploma.",
    domainLabel: "Tu área", specialLabel: "Especialidad",
    taglineLabel: "En una frase, lo que ofreces",
    taglinePh: "Ej: Ayudo a recién llegados a encontrar vivienda en menos de 2 semanas",
    taglineOk: "✓ Perfecto", taglineHint: "Sé preciso — es tu primera impresión",
    yearsLabel: "Años de experiencia",
    backBtn: "← Volver",
    errDomain: "Elige tu área.", errTagline: "Escribe tu frase (mínimo 15 caracteres).", errYears: "Indica tus años de experiencia.",
    // step 3
    step3Title: "Tu oferta",
    step3H: "Elige cómo quieres interactuar",
    step3Sub: "Selecciona los formatos que prefieres — los clientes reservarán según tu disponibilidad.",
    durLabel: "Duración de la sesión",
    priceLabel: "Precio orientativo por sesión", priceNote: "Podrás ajustar el precio por formato desde tu panel.",
    errFormat: "Selecciona al menos un formato.", errPrice: "Indica un precio orientativo.",
    selectFormat: "Selecciona al menos un formato para continuar.",
    // step 4
    step4Title: "Tu credibilidad",
    step4H: "Muestra lo que has logrado.", step4Sub: "Los clientes eligen personas con resultados — no títulos.",
    resultLabel: "🎯 Describe un resultado real", resultReq: "obligatorio",
    resultPh: "Ej: Encontrar piso sin aval es posible — lo hice 12 veces. Pregúntame cómo.",
    resultOk: "✓ Perfecto — concreto y personal", resultHint: "1–2 líneas · medible · personal",
    proofLabel: "🔗 Prueba", proofOpt: "(opcional)",
    proofLien: "🔗 Link URL", proofFile: "📎 Archivo",
    proofFilePh: "Elegir archivo (PDF, imagen)",
    proofUrlPh: "https://linkedin.com/in/tuperfil o enlace a tu portfolio",
    bioLabel: "📝 Bio", bioOpt: "(opcional)",
    bioNote: "Puedes añadirla más tarde — también puedes generarla con IA desde tu perfil.",
    bioPh: "Ej: Exgestora de comunidades durante 6 años…",
    errResult: "Describe un resultado real (mínimo 20 caracteres).",
    // step 5
    step5Title: "Tu disponibilidad",
    step5H: "¿Cuándo estás disponible?", step5Sub: "Los clientes ven tus horarios en tiempo real — sé preciso.",
    dispoNow: {title:"Lo configuro ahora", sub:"Pon tus horarios en línea enseguida", icon:"🟢"},
    dispoLater: {title:"Lo haré más tarde", sub:"Puedes configurarlo desde tu panel", icon:"⏸"},
    modeLabel: "Modo",
    modeRecurrent: "📅 Horario semanal", modeRSub: "Cada semana",
    modePonctuel: "🗓 Puntual", modePSub: "Fechas concretas",
    joursLabel: "Días disponibles cada semana",
    timeLabel: "Horario · franjas de 30 min",
    timeFrom: "De", timeTo: "A",
    passBtn: "Omitir →", saveBtn: "Guardar →",
    // step 6
    step6Title: "Revisión ✦",
    summaryEmail: "Email", summaryPays: "País", summaryLangs: "Idiomas", summaryResult: "Resultado", summaryDispo: "Disponib.",
    cguCheck: null,
    certifCheck: "Certifico que mi experiencia es auténtica",
    publishBtn: "Publicar mi perfil ✦",
    errCgu: "Acepta las condiciones para continuar.",
    // submitted
    submittedTitle: "Candidatura en proceso",
    submittedSub: <>Tu perfil de experto está siendo validado.<br/>Respuesta en <strong style={{color:"#C9A96E"}}>24–48h</strong>.</>,
    earn80: "Te quedas con el 80% de cada sesión", commNote: "Comisión Savvy: 20% fijo — nunca más",
    pendingTitle: "📌 Por completar mientras tanto",
    pendingPhoto: "Añade una foto de perfil", pendingBio: "Completa tu bio", pendingDispo: "Configura tu disponibilidad",
    allDone: "Perfil completo — foto y bio añadidas ✓",
    accessBtn: "Acceder a mi espacio consejero →",
  },
};

function SignupScreen({ onBack, onDone, authUser, uploadPhoto }) {
  const [step, setStep] = useState(0); // 0 = landing, 1-6 = étapes
  const [lang, setLang] = useState("fr");
  const T = SIGNUP_T[lang];
  const [finalProfile, setFinalProfile] = useState(null);
  const [form, setForm] = useState({
    photoUrl: authUser?.photoUrl || "",
    prenom:   (authUser?.name || "").split(" ")[0] || "",
    nom:      (authUser?.name || "").split(" ").slice(1).join(" ") || "",
    email:    authUser?.email || "",
    pays: "France", langs: [],
    category:"", subcats:[], tagline:"", yearsExp:"",
    formats: { video:{on:false,dur:"1h",price:"",name:"",desc:""}, audio:{on:false,dur:"30min",price:"",name:"",desc:""}, chat:{on:false,dur:"30min",price:"",name:"",desc:""}, doc:{on:false,dur:"48h",price:"",name:"",desc:""} },
    result1:"", proof1:"", bio:"",
    dispoJours:{}, dispoStart:"09:00", dispoEnd:"18:00", dispoChoice:"", dispoMode:"recurrent",
    proof1Type:"lien",
  });
  const patch = (p) => setForm(f => ({...f,...p}));
  // Sync photo from authUser if it arrives after mount
  React.useEffect(() => {
    if (authUser?.photoUrl && !form.photoUrl) patch({ photoUrl: authUser.photoUrl });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.photoUrl]);
  const [showCguModal, setShowCguModal] = useState(false);
  const [stepErr, setStepErr] = useState("");
  const TOTAL_STEPS = 6;
  const pct = Math.round((Math.max(0,step-1) / TOTAL_STEPS) * 100);

  const [exIdx] = useState(0);
  const OFFER_EXAMPLES_BY_CAT = {
    vie:       [{bad:"Appel vidéo 1h",    good:"S'installer en France sans galère"},
                {bad:"Visio 30 min",       good:"Trouver un appart sans garant à Paris"},
                {bad:"Consultation",       good:"Décrypter la CAF et les aides sociales"}],
    business:  [{bad:"Appel vidéo 1h",    good:"Lancer sa micro-entreprise sans erreurs"},
                {bad:"Visio 30 min",       good:"Trouver ses 10 premiers clients"},
                {bad:"Consultation",       good:"Négocier avec des fournisseurs chinois"}],
    industrie: [{bad:"Appel vidéo 1h",    good:"Optimiser son labo de pâtisserie en 1h"},
                {bad:"Visio 30 min",       good:"Réduire ses coûts de production de 20%"},
                {bad:"Consultation",       good:"Préparer son entretien ingénieur EPC"}],
    cuisine:   [{bad:"Appel vidéo 1h",    good:"Réussir son macaron à coup sûr"},
                {bad:"Visio 30 min",       good:"Trouver des fournisseurs chocolat Valrhona"},
                {bad:"Consultation",       good:"Ouvrir sa boulangerie artisanale en France"}],
  };
  const offerExamples = OFFER_EXAMPLES_BY_CAT[form.category] || OFFER_EXAMPLES_BY_CAT.vie;

  const SPECIALTY_EXAMPLES = [
    "Comment importer depuis la Chine sans erreurs",
    "Comment ouvrir un restaurant rentable",
    "Comment négocier avec des fournisseurs",
    "Comment trouver un logement à Paris",
    "Comment exporter en Colombie",
    "Comment réussir son macaron en pâtisserie",
  ];
  const LANGS = ["FR","EN","ES","DE","PT","AR","ZH","JA"];
  const PAYS  = ["France","Colombie","Allemagne","Espagne","Royaume-Uni","États-Unis","Belgique","Suisse","Autre"];
  const FORMATS = ["Appel vidéo 1h","Rapport écrit + appel 30 min","Vidéo pas à pas","Document PDF livré","Accompagnement mensuel","Devis sur mesure"];
  const PROOF_TYPES = [
    { id:"cas",      icon:"💡", label:"Cas réel",   hint:"Ex: J\'ai importé des parfums en France pendant 5 ans" },
    { id:"resultat", icon:"📈", label:"Résultat",   hint:"Ex: Réduit les coûts de 35% en 3 mois" },
    { id:"projet",   icon:"🏗️", label:"Projet",    hint:"Ex: Ouverture d\'un restaurant en 2019" },
    { id:"lien",     icon:"🔗", label:"Lien",       hint:"https://mon-site.com ou LinkedIn" },
  ];

  // ── Header progress ────────────────────────────────────────────────────────
  const Hdr = ({ title }) => (
    <div style={{ padding:"12px 18px 10px", background:C.white, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:13 }}>
        <button onClick={() => step <= 1 ? onBack() : setStep(s => s-1)}
          style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{title}</span>
        <button onClick={()=>setLang(l=>l==="fr"?"es":"fr")} style={{marginLeft:"auto",padding:"3px 10px",borderRadius:20,border:`1px solid ${C.border}`,background:C.cream2,fontSize:11,fontWeight:700,color:C.ink,cursor:"pointer",fontFamily:"inherit",letterSpacing:.3}}>{T.langBtn}</button>
        <span style={{ fontSize:11, color:C.muted, background:C.cream2, padding:"2px 9px", borderRadius:20, fontWeight:600 }}>{step}/{TOTAL_STEPS}</span>
      </div>
      {/* Progress bar */}
      <div style={{ height:3, background:C.cream3, borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.sage},${C.gold})`, borderRadius:2, transition:"width .4s ease" }}/>
      </div>
      {/* Dots */}
      <div style={{ display:"flex", gap:4, justifyContent:"center", marginTop:8 }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ width:i < step ? 18 : 6, height:6, borderRadius:3, background:i < step ? C.sage : i === step ? C.ink : C.cream3, transition:"all .3s ease" }}/>
        ))}
      </div>
    </div>
  );

  // ── Submitted ──────────────────────────────────────────────────────────────
  if (form.submitted) return (
    <div style={{flex:1,overflowY:"auto",background:C.cream}}>
      {/* Hero */}
      <div style={{background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`,padding:"52px 24px 44px",textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:16}}>✦</div>
        <h1 style={{fontSize:24,fontWeight:700,color:C.white,fontFamily:SERIF,margin:"0 0 10px",lineHeight:1.3}}>
          {T.submittedTitle}
        </h1>
        <p style={{fontSize:14,color:"rgba(253,252,248,.65)",lineHeight:1.7,margin:0}}>
          {T.submittedSub}
        </p>
      </div>

      <div style={{padding:"24px 20px 36px"}}>

        {/* Rémunération — simple */}
        <div style={{background:C.goldL,border:`1px solid ${C.goldB}`,borderRadius:15,padding:"16px 18px",marginBottom:14,display:"flex",gap:12,alignItems:"center"}}>
          <span style={{fontSize:26,flexShrink:0}}>💰</span>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{T.earn80}</div>
            <div style={{fontSize:11,color:C.gold,marginTop:2}}>{T.commNote}</div>
          </div>
        </div>

        {/* Optionnel en attendant — seulement ce qui manque */}
        {(()=>{
          const hasDispoConfigured = form.dispoChoice==="now" && Object.values(form.dispoJours||{}).some(Boolean);
          const items=[
            {icon:<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.8}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx={12} cy={13} r={4}/></svg>, label:T.pendingPhoto, done:!!form.photoUrl},
            {icon:<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.8}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, label:T.pendingBio, done:!!(form.bio&&form.bio.trim().length>10)},
            {icon:<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, label:T.pendingDispo, done:hasDispoConfigured},
          ].filter(i=>!i.done);
          if(!items.length) return (
            <div style={{background:C.sageL,border:"1px solid rgba(16,185,129,.2)",borderRadius:15,padding:"14px 18px",marginBottom:20,display:"flex",gap:10,alignItems:"center"}}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{fontSize:13,color:C.sage,fontWeight:600}}>{T.allDone}</span>
            </div>
          );
          return (
            <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:15,padding:"16px 18px",marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:12}}>{T.pendingTitle}</div>
              {items.map((item,i,arr)=>(
                <div key={item.label} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none"}}>
                  <span style={{display:"flex",alignItems:"center"}}>{item.icon}</span>
                  <span style={{fontSize:13,color:C.soft}}>{item.label}</span>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Message émotionnel */}
        <div style={{textAlign:"center",padding:"20px 16px",marginBottom:16}}>
          <div style={{fontSize:28,marginBottom:12}}>✨</div>
          <div style={{fontSize:18,fontWeight:700,color:C.ink,fontFamily:SERIF,lineHeight:1.3,marginBottom:8}}>
            Bienvenue parmi les experts Savvy.
          </div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>
            À partir d'aujourd'hui, ton expérience peut aider quelqu'un à gagner des mois.
          </div>
        </div>

        <button onClick={()=>{ if(onDone&&finalProfile) onDone(finalProfile); else onBack(); }}
          style={{width:"100%",padding:"15px",borderRadius:13,border:"none",background:`linear-gradient(135deg,${C.gold},${C.goldB})`,color:C.white,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:SERIF,boxShadow:`0 4px 20px rgba(185,134,74,.35)`}}>
          {T.accessBtn}
        </button>
      </div>
    </div>
  );

  // ── STEP 0 — Landing ────────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.cream }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"40px 24px 36px", position:"relative", overflow:"hidden", textAlign:"center" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(185,134,74,.05)" }}/>
        {/* Botón atrás */}
        <button onClick={onBack} style={{position:"absolute",top:14,left:16,width:34,height:34,borderRadius:10,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        {/* lang toggle en landing */}
        <button onClick={()=>setLang(l=>l==="fr"?"es":"fr")} style={{position:"absolute",top:14,right:16,padding:"4px 12px",borderRadius:20,border:"1px solid rgba(255,255,255,.25)",background:"rgba(255,255,255,.1)",fontSize:12,fontWeight:700,color:"rgba(253,252,248,.8)",cursor:"pointer",fontFamily:"inherit",letterSpacing:.3}}>{T.langBtn}</button>
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:38, marginBottom:16 }}>✦</div>
          <div style={{ fontSize:28, marginBottom:10 }}>🌍</div>
          <h1 style={{ fontSize:26, fontWeight:700, color:C.white, lineHeight:1.3, margin:"0 0 12px", fontFamily:SERIF, letterSpacing:"-.3px" }}>
            {T.heroTitle}
          </h1>
          <p style={{ fontSize:14, color:"rgba(253,252,248,.72)", lineHeight:1.7, margin:"0 0 24px", maxWidth:280, marginLeft:"auto", marginRight:"auto" }}>
            {T.heroSub}
          </p>
          <button onClick={() => setStep(1)} style={{ padding:"15px 36px", borderRadius:50, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:`linear-gradient(135deg,${C.gold},${C.goldB})`, color:C.white, fontFamily:SERIF, letterSpacing:".3px", boxShadow:`0 4px 20px rgba(185,134,74,.4)` }}>
            {T.heroBtn}
          </button>
          <div style={{ fontSize:11, color:"rgba(253,252,248,.4)", marginTop:12 }}>{T.heroFine}</div>
        </div>
      </div>

      {/* Pourquoi Savvy */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 22px 30px" }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ background:`linear-gradient(135deg,${C.ink},#2C2825)`, borderRadius:16, padding:"18px 20px", marginBottom:14 }}>
            <div style={{ fontSize:22, marginBottom:8 }}>💰</div>
            <div style={{ fontSize:17, fontWeight:700, color:C.white, fontFamily:SERIF, marginBottom:6 }}>{T.whyTitle}</div>
            <div style={{ fontSize:13, color:"rgba(253,252,248,.7)", lineHeight:1.6 }}>{T.whySub}</div>
          </div>
          {[
            { emoji:"🎯", title:T.why1t, sub:T.why1s },
            { emoji:"⏱",  title:T.why2t, sub:T.why2s },
            { emoji:"🛡️", title:T.why3t, sub:T.why3s },
          ].map(item => (
            <div key={item.title} style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:12, background:C.white, borderRadius:14, padding:"14px 15px", border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:24, width:44, height:44, borderRadius:13, background:C.goldL, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{item.emoji}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:3, fontFamily:SERIF }}>{item.title}</div>
                <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{ background:C.white, borderRadius:16, padding:"16px", border:`1px solid ${C.border}`, marginTop:6 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:12 }}>{T.socialTitle}</div>
          {[
            { name:"Patrick G.", role:"Expert labo pâtisserie", earn:"1 240€", months:lang==="es"?"este mes":"ce mois" },
            { name:"Marie A.",   role:"Chef pâtissière",        earn:"680€",   months:lang==="es"?"este mes":"ce mois" },
            { name:"Lucas B.",   role:"Expert export Colombie", earn:"950€",   months:lang==="es"?"este mes":"ce mois" },
          ].map(e => (
            <div key={e.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${C.borderF}` }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.ink }}>{e.name} · <span style={{ fontWeight:400, color:C.muted }}>{e.role}</span></div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.sage, fontFamily:SERIF }}>{e.earn}</div>
                <div style={{ fontSize:10, color:C.muted }}>{e.months}</div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setStep(1)} style={{ width:"100%", padding:"15px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:C.ink, color:C.white, marginTop:22, fontFamily:SERIF, letterSpacing:".3px" }}>
          {T.createBtn}
        </button>
        <div style={{ textAlign:"center", fontSize:11, color:C.muted, marginTop:10 }}>
          {T.cguNote}
        </div>
      </div>
    </div>
  );

  // helpers (LANGS, PAYS defined above)
  const PAYS2  = ["France","Colombie","Allemagne","Espagne","Royaume-Uni","États-Unis","Belgique","Suisse","Maroc","Sénégal","Côte d'Ivoire","Autre"];
  const JOURS = lang==="es"
    ? [{k:"1",l:"Lu"},{k:"2",l:"Ma"},{k:"3",l:"Mi"},{k:"4",l:"Ju"},{k:"5",l:"Vi"},{k:"6",l:"Sá"},{k:"0",l:"Do"}]
    : [{k:"1",l:"Lu"},{k:"2",l:"Ma"},{k:"3",l:"Me"},{k:"4",l:"Je"},{k:"5",l:"Ve"},{k:"6",l:"Sa"},{k:"0",l:"Di"}];
  const FMT   = [
    {id:"video", icon:"🎥", label:"Vidéocall",  sub:"En direct",         durs:["30min","1h","2h"]},
    {id:"audio", icon:"🎧", label:"Appel audio",sub:"Par téléphone",     durs:["15min","30min","1h"]},
    {id:"chat",  icon:"💬", label:"Échange écrit", sub:"Messagerie",        durs:["30min","1h"]},
    {id:"doc",   icon:"📄", label:"Document",   sub:"Livrable écrit",    durs:["24h","48h","72h"]},
  ];
  const patchFmt = (id, key, val) => patch({formats:{...form.formats,[id]:{...form.formats[id],[key]:val}}});

  // ── STEP 1 — Qui es-tu ? ────────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.cream}}>
      <Hdr title={T.step1Title}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 28px"}}>

        {/* Photo */}
        <div style={{textAlign:"center",marginBottom:22}}>
          <input id="sp-photo" type="file" accept="image/*" style={{display:"none"}} onChange={async ev=>{
            const f=ev.target.files[0]; if(!f) return; ev.target.value="";
            const reader=new FileReader(); reader.onload=e=>patch({photoUrl:e.target.result,photoUploading:true}); reader.readAsDataURL(f);
            try{const url=await uploadPhoto(f,authUser?.id||"signup"); patch({photoUrl:url,photoUploading:false});}
            catch(err){console.warn(err); patch({photoUploading:false});}
          }}/>
          <label htmlFor="sp-photo" style={{display:"inline-block",cursor:"pointer"}}>
            {form.photoUrl
              ? <div style={{position:"relative",width:88,height:88,margin:"0 auto 8px"}}>
                  <img src={form.photoUrl} alt="" style={{width:88,height:88,borderRadius:14,objectFit:"cover",border:`3px solid ${C.gold}`}}/>
                  {form.photoUploading&&<div style={{position:"absolute",inset:0,borderRadius:14,background:"rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:18,height:18,border:"2px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/></div>}
                </div>
              : <div style={{width:88,height:88,borderRadius:14,background:C.goldL,border:`2px dashed ${C.goldB}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",gap:6}}>
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.8}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx={12} cy={13} r={4}/></svg>
                  <span style={{fontSize:10,color:C.gold,fontWeight:600}}>{T.addPhoto}</span>
                </div>}
          </label>
          <div style={{fontSize:11,color:C.muted}}>{form.photoUrl?T.photoAdded:T.photoHint}</div>
        </div>

        {/* Prénom + Nom */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:13}}>
          {[[T.labelPrenom,"prenom","Clément"],[T.labelNom,"nom","Rousseau"]].map(([lbl,k,ph])=>(
            <div key={k}>
              <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>{lbl}</label>
              <input value={form[k]} onChange={e=>patch({[k]:e.target.value})} placeholder={ph}
                style={{width:"100%",padding:"11px 13px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.white}}/>
            </div>
          ))}
        </div>

        {/* Email — VERROUILLÉ */}
        <div style={{marginBottom:13}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>{T.labelEmail}</label>
          <div style={{position:"relative"}}>
            <input value={form.email} readOnly
              style={{width:"100%",padding:"11px 40px 11px 13px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.muted,outline:"none",boxSizing:"border-box",background:C.cream2,cursor:"not-allowed"}}/>
            <svg style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)"}} width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div style={{fontSize:10,color:C.muted,marginTop:3}}>{T.emailLocked}</div>
        </div>

        {/* Pays */}
        <div style={{marginBottom:13}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>{T.labelPays}</label>
          <select value={form.pays} onChange={e=>patch({pays:e.target.value})}
            style={{width:"100%",padding:"11px 13px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.white}}>
            {PAYS2.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Langues */}
        <div style={{marginBottom:24}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>{T.labelLangs}</label>
          <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
            {LANGS.map(l=>(
              <button key={l} onClick={()=>patch({langs:(form.langs||[]).includes(l)?(form.langs||[]).filter(x=>x!==l):[...(form.langs||[]),l]})}
                style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",
                  background:(form.langs||[]).includes(l)?C.ink:C.cream3,color:(form.langs||[]).includes(l)?C.white:C.soft,transition:"all .15s"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={()=>{
          if(!form.prenom.trim()||!form.nom.trim()){alert(T.errName); return;}
          if(!(form.langs||[]).length){alert(T.errLang); return;}
          setStep(2);
        }} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:SERIF}}>
          {T.continueBtn}
        </button>
      </div>
    </div>
  );

  // ── STEP 2 — Ton expertise ───────────────────────────────────────────────────
  if (step === 2) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.cream}}>
      <Hdr title={T.step2Title}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 28px"}}>

        <p style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,margin:"0 0 4px"}}>{T.step2H}</p>
        <p style={{fontSize:12,color:C.muted,margin:"0 0 12px",lineHeight:1.6}}>{T.step2Sub}</p>
        <div style={{background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:10,padding:"8px 12px",marginBottom:18,border:`1px solid ${C.goldB}`,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13,flexShrink:0}}>✦</span>
          <span style={{fontSize:11,color:"#92400E",fontStyle:"italic"}}>L'Exartitude commence par une vraie expérience.</span>
        </div>

        {/* Catégorie */}
        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>{T.domainLabel}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:20}}>
          {CATS.map(cat=>(
            <button key={cat.id} onClick={()=>patch({category:cat.id,subcats:[]})}
              style={{padding:"13px 11px",borderRadius:13,cursor:"pointer",textAlign:"center",fontFamily:"inherit",
                border:form.category===cat.id?`2px solid ${cat.color}`:`1px solid ${C.border}`,
                background:form.category===cat.id?cat.bg:C.white,transition:"all .15s"}}>
              <div style={{fontSize:24,marginBottom:5}}>{cat.icon}</div>
              <div style={{fontSize:12,fontWeight:700,color:form.category===cat.id?cat.color:C.ink,lineHeight:1.3}}>{cat.label}</div>
            </button>
          ))}
        </div>

        {/* Sous-catégorie */}
        {form.category && SUBCATS[form.category]?.length > 0 && (
          <div style={{marginBottom:18}}>
            <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:9,textTransform:"uppercase",letterSpacing:.5}}>{T.specialLabel}</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {SUBCATS[form.category].map(s=>{
                const sel=(form.subcats||[]).includes(s.id);
                return (
                  <button key={s.id} onClick={()=>patch({subcats:sel?(form.subcats||[]).filter(x=>x!==s.id):[...(form.subcats||[]),s.id]})}
                    style={{padding:"7px 14px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,border:"none",
                      background:sel?C.ink:C.cream3,color:sel?C.white:C.soft,transition:"all .15s"}}>
                    {s.icon} {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tagline — 1 phrase */}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>
            {T.taglineLabel}
          </label>
          <input value={form.tagline} onChange={e=>patch({tagline:e.target.value})} maxLength={90}
            placeholder={T.taglinePh}
            style={{width:"100%",padding:"11px 13px",borderRadius:11,border:`1px solid ${form.tagline.length>20?C.sage:C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.white,lineHeight:1.5,transition:"border-color .2s"}}/>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
            <span style={{fontSize:10,color:form.tagline.length>20?C.sage:C.faint}}>{form.tagline.length>20?T.taglineOk:T.taglineHint}</span>
            <span style={{fontSize:10,color:C.faint}}>{form.tagline.length}/90</span>
          </div>
        </div>

        {/* Années d'expérience */}
        <div style={{marginBottom:24}}>
          <label style={{fontSize:10,fontWeight:700,color:C.muted,display:"block",marginBottom:9,textTransform:"uppercase",letterSpacing:.5}}>{T.yearsLabel}</label>
          <div style={{display:"flex",gap:8}}>
            {["0–2 ans","3–5 ans","5+ ans"].map(y=>(
              <button key={y} onClick={()=>patch({yearsExp:y})}
                style={{flex:1,padding:"10px 6px",borderRadius:11,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,border:"none",
                  background:form.yearsExp===y?C.ink:C.cream3,color:form.yearsExp===y?C.white:C.soft,transition:"all .15s"}}>
                {y}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:"flex",gap:9}}>
          <button onClick={()=>setStep(1)} style={{flex:1,padding:"13px",borderRadius:13,border:`1.5px solid ${C.border}`,cursor:"pointer",fontWeight:700,fontSize:13,background:C.white,color:C.ink,fontFamily:"inherit"}}>{T.backBtn}</button>
          <button onClick={()=>{
            if(!form.category){alert(T.errDomain); return;}
            if(!form.tagline.trim()||form.tagline.length<15){alert(T.errTagline); return;}
            if(!form.yearsExp){alert(T.errYears); return;}
            setStep(3);
          }} style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:SERIF}}>{T.continueBtn}</button>
        </div>
      </div>
    </div>
  );

  // ── STEP 3 — Quel type d'aide ? ─────────────────────────────────────────────
  if (step === 3) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.cream}}>
      <Hdr title={T.step3Title}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 28px"}}>

        <p style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,margin:"0 0 4px"}}>{T.step3H}</p>
        <p style={{fontSize:12,color:C.muted,margin:"0 0 20px",lineHeight:1.6}}>{T.step3Sub}</p>

        {/* Conseil */}
        <div style={{background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:12,padding:"12px 14px",marginBottom:16,border:`1px solid ${C.goldB}`}}>
          <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:8}}>✦ Donne un nom qui parle</div>
          {offerExamples.map(ex=>(
            <div key={ex.bad} style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,fontSize:11}}>
              <span style={{color:"#B91C1C",fontWeight:600,flexShrink:0}}>❌</span>
              <span style={{color:"#92400E",textDecoration:"line-through",flex:1}}>{ex.bad}</span>
              <span style={{color:C.sage,fontWeight:600,flexShrink:0}}>✅</span>
              <span style={{color:"#065F46",fontWeight:600,flex:1}}>{ex.good}</span>
            </div>
          ))}
        </div>

        {/* Format cards */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {FMT.map(f=>{
            const on=form.formats[f.id]?.on;
            const curDur=form.formats[f.id]?.dur || f.durs[1] || f.durs[0];
            const curPrice=form.formats[f.id]?.price||"";
            const curName=form.formats[f.id]?.name||"";
            const curDesc=form.formats[f.id]?.desc||"";
            return (
              <div key={f.id} style={{borderRadius:14,border:on?`2px solid ${C.ink}`:`1px solid ${C.border}`,background:C.white,transition:"all .15s",overflow:"hidden"}}>
                {/* Header — click to toggle */}
                <button onClick={()=>{
                  const turning = !on;
                  // Video y audio son mutuamente exclusivos
                  if (turning && (f.id==="video" || f.id==="audio")) {
                    const other = f.id==="video" ? "audio" : "video";
                    patch({formats:{...form.formats,[f.id]:{...form.formats[f.id],on:true},[other]:{...form.formats[other],on:false}}});
                  } else {
                    patchFmt(f.id,"on",turning);
                  }
                }}
                  style={{width:"100%",padding:"14px 16px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",background:on?C.ink:"transparent",border:"none",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:22,flexShrink:0}}>{f.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:on?C.white:C.ink}}>{f.label}</div>
                    <div style={{fontSize:11,color:on?"rgba(253,252,248,.55)":C.muted}}>{f.sub}</div>
                  </div>
                  <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${on?C.white:C.border}`,background:on?C.white:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {on&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </button>

                {/* Detail panel */}
                {on&&(
                  <div style={{padding:"14px 16px 16px",borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:10}}>

                    {/* Nom de l'offre */}
                    <div>
                      <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Nom de ton offre *</div>
                      <input value={curName} onChange={e=>patchFmt(f.id,"name",e.target.value)}
                        placeholder={f.id==="video"?"Ex : Appel bilan pour reconversion pro":f.id==="audio"?"Ex : Conseil rapide logement étudiant":f.id==="chat"?"Ex : Questions-réponses immigrer en France":"Ex : Guide complet CAF + logement PDF"}
                        style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1.5px solid ${curName?C.ink:C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.cream}}/>
                    </div>

                    {/* Description courte */}
                    <div>
                      <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Description courte</div>
                      <input value={curDesc} onChange={e=>patchFmt(f.id,"desc",e.target.value)}
                        placeholder="Ce que le client va obtenir concrètement"
                        style={{width:"100%",padding:"10px 13px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.cream}}/>
                    </div>

                    {/* Durée + Prix */}
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Durée</div>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {f.durs.map(d=>(
                            <button key={d} onClick={()=>patchFmt(f.id,"dur",d)}
                              style={{padding:"6px 11px",borderRadius:18,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,border:`1.5px solid ${curDur===d?C.ink:C.border}`,background:curDur===d?C.ink:"transparent",color:curDur===d?C.white:C.ink,transition:"all .15s"}}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{flexShrink:0}}>
                        <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>Prix *</div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{position:"relative"}}>
                            <input type="number" min={1} value={curPrice} onChange={e=>patchFmt(f.id,"price",e.target.value)}
                              placeholder="20"
                              style={{width:80,padding:"8px 28px 8px 10px",borderRadius:10,border:`1.5px solid ${curPrice?C.ink:C.border}`,fontSize:16,fontFamily:SERIF,fontWeight:700,color:C.ink,outline:"none",boxSizing:"border-box"}}/>
                            <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:700,color:C.muted,fontFamily:SERIF}}>€</span>
                          </div>
                          {curPrice>0&&<div style={{fontSize:10,color:C.sage,fontWeight:700}}>{Math.round(curPrice*.8)}€<br/>pour toi</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {stepErr && <div style={{background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#DC2626",marginBottom:4}}>⚠️ {stepErr}</div>}

        <div style={{display:"flex",gap:9,marginTop:16}}>
          <button onClick={()=>{setStepErr(""); setStep(2);}} style={{flex:1,padding:"13px",borderRadius:13,border:`1.5px solid ${C.border}`,cursor:"pointer",fontWeight:700,fontSize:13,background:C.white,color:C.ink,fontFamily:"inherit"}}>{T.backBtn}</button>
          <button onClick={()=>{
            const activeF=FMT.filter(f=>form.formats[f.id]?.on);
            if(activeF.length===0){setStepErr(T.errFormat); return;}
            const missingName=activeF.find(f=>!form.formats[f.id]?.name?.trim());
            if(missingName){setStepErr(`Donne un nom à ton offre "${missingName.label}" — c'est ce que voient tes clients.`); return;}
            const missingPrice=activeF.find(f=>!(Number(form.formats[f.id]?.price)>0));
            if(missingPrice){setStepErr(`Ajoute un prix pour "${form.formats[missingPrice.id]?.name||missingPrice.label}".`); return;}
            setStepErr(""); setStep(4);
          }} style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:SERIF}}>{T.continueBtn}</button>
        </div>
      </div>
    </div>
  );

  // ── STEP 4 — Ta crédibilité ──────────────────────────────────────────────────
  if (step === 4) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.cream}}>
      <Hdr title={T.step4Title}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 28px"}}>

        <p style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,margin:"0 0 4px"}}>{T.step4H}</p>
        <p style={{fontSize:12,color:C.muted,margin:"0 0 12px",lineHeight:1.6}}>{T.step4Sub}</p>
        <div style={{background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:10,padding:"8px 12px",marginBottom:18,border:`1px solid ${C.goldB}`,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:13,flexShrink:0}}>✦</span>
          <span style={{fontSize:11,color:"#92400E",fontStyle:"italic"}}>Tes preuves renforcent ton Exartitude.</span>
        </div>

        {/* Résultat concret — OBLIGATOIRE */}
        <div style={{background:C.white,borderRadius:14,border:`1.5px solid ${form.result1.length>20?C.sage:C.border}`,padding:"14px 15px",marginBottom:14,transition:"border-color .2s"}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>{T.resultLabel} <span style={{color:"#EF4444",fontWeight:400,fontSize:9}}>{T.resultReq}</span></div>
          <textarea value={form.result1} onChange={e=>patch({result1:e.target.value})}
            placeholder={T.resultPh}
            style={{width:"100%",border:"none",background:"none",fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",resize:"none",lineHeight:1.6,boxSizing:"border-box",minHeight:68}}/>
          <div style={{fontSize:10,color:form.result1.length>20?C.sage:C.faint,marginTop:4}}>{form.result1.length>20?T.resultOk:T.resultHint}</div>
        </div>

        {/* Preuve — lien ou fichier */}
        <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 15px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>{T.proofLabel} <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>{T.proofOpt}</span></div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            {["lien","fichier"].map(t=>(
              <button key={t} onClick={()=>patch({proof1Type:t,proof1:""})}
                style={{flex:1,padding:"8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,border:"none",
                  background:form.proof1Type===t?C.ink:C.cream3,color:form.proof1Type===t?C.white:C.soft,transition:"all .15s"}}>
                {t==="lien"?T.proofLien:T.proofFile}
              </button>
            ))}
          </div>
          {form.proof1Type==="fichier"
            ? <>
                <input id="proof-file" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:"none"}}
                  onChange={e=>{const f=e.target.files[0]; if(f) patch({proof1:f.name});}}/>
                <label htmlFor="proof-file" style={{display:"flex",alignItems:"center",gap:8,padding:"10px 13px",borderRadius:11,border:`1px dashed ${C.goldB}`,cursor:"pointer",background:C.goldL}}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1={12} y1={3} x2={12} y2={15}/></svg>
                  <span style={{fontSize:12,color:C.gold,fontWeight:600}}>{form.proof1||T.proofFilePh}</span>
                </label>
              </>
            : <input value={form.proof1||""} onChange={e=>patch({proof1:e.target.value})}
                placeholder={T.proofUrlPh}
                style={{width:"100%",padding:"10px 13px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box"}}/>
          }
        </div>

        {/* Bio — libre, pas de limite */}
        <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 15px",marginBottom:24}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{T.bioLabel} <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>{T.bioOpt}</span></div>
          <div style={{fontSize:10,color:C.muted,marginBottom:8}}>{T.bioNote}</div>
          <textarea value={form.bio} onChange={e=>patch({bio:e.target.value})}
            placeholder={T.bioPh}
            style={{width:"100%",border:"none",background:"none",fontSize:12,fontFamily:"inherit",color:C.ink,outline:"none",resize:"none",lineHeight:1.6,boxSizing:"border-box",minHeight:60}}/>
        </div>

        <div style={{display:"flex",gap:9}}>
          <button onClick={()=>setStep(3)} style={{flex:1,padding:"13px",borderRadius:13,border:`1.5px solid ${C.border}`,cursor:"pointer",fontWeight:700,fontSize:13,background:C.white,color:C.ink,fontFamily:"inherit"}}>{T.backBtn}</button>
          <button onClick={()=>{
            if(!form.result1.trim()||form.result1.length<15){alert(T.errResult); return;}
            setStep(5);
          }} style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:SERIF}}>{T.continueBtn}</button>
        </div>
      </div>
    </div>
  );

  // ── STEP 5 — Disponibilités ──────────────────────────────────────────────────
  if (step === 5) {
    const dispoNow = form.dispoChoice === "now";
    const saveAndContinue = () => {
      if (dispoNow) {
        if(!Object.values(form.dispoJours).some(v=>v)){alert(lang==="es"?"Selecciona al menos un día.":"Sélectionne au moins un jour."); return;}
        const dispoMap={}, today=new Date();
        for(let i=1;i<=60;i++){
          const d=new Date(today); d.setDate(today.getDate()+i);
          const dow=String(d.getDay());
          if(form.dispoJours[dow]){
            const key=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
            dispoMap[key]=true;
          }
        }
        const _dk = authUser?.id || authUser?.initials || "guest";
        localStorage.setItem(`savvy_dispo_days_${_dk}`, JSON.stringify(dispoMap));
        const hMap={};
        Object.keys(dispoMap).forEach(k=>{hMap[k]=(form.dispoStart||"09:00")+"-"+(form.dispoEnd||"18:00");});
        localStorage.setItem(`savvy_dispo_hours_${_dk}`, JSON.stringify(hMap));
      }
      setStep(6);
    };
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.cream}}>
        <Hdr title={T.step5Title}/>
        <div style={{flex:1,overflowY:"auto",padding:"20px 18px 28px"}}>

          <p style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,margin:"0 0 4px"}}>{T.step5H}</p>
          <p style={{fontSize:12,color:C.muted,margin:"0 0 20px",lineHeight:1.6}}>{T.step5Sub}</p>

          {/* Choix */}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:22}}>
            {[
              {k:"now",  ...T.dispoNow},
              {k:"later",...T.dispoLater},
            ].map(opt=>(
              <button key={opt.k} onClick={()=>patch({dispoChoice:opt.k})}
                style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:14,cursor:"pointer",fontFamily:"inherit",textAlign:"left",
                  border:form.dispoChoice===opt.k?`2px solid ${C.ink}`:`1px solid ${C.border}`,
                  background:form.dispoChoice===opt.k?C.ink:C.white,transition:"all .15s"}}>
                <span style={{fontSize:24,flexShrink:0}}>{opt.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:form.dispoChoice===opt.k?C.white:C.ink}}>{opt.title}</div>
                  <div style={{fontSize:11,color:form.dispoChoice===opt.k?"rgba(253,252,248,.6)":C.muted,marginTop:2}}>{opt.sub}</div>
                </div>
                <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${form.dispoChoice===opt.k?C.white:C.border}`,background:form.dispoChoice===opt.k?C.white:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s"}}>
                  {form.dispoChoice===opt.k&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </button>
            ))}
          </div>

          {/* Setup rapide si "now" */}
          {dispoNow && (
            <div style={{animation:"fadeIn .2s ease"}}>
              {/* Mode */}
              <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:9,textTransform:"uppercase",letterSpacing:.5}}>{T.modeLabel}</div>
              <div style={{display:"flex",gap:8,marginBottom:18}}>
                {[{k:"recurrent",l:T.modeRecurrent,sub:T.modeRSub},{k:"ponctuel",l:T.modePonctuel,sub:T.modePSub}].map(m=>(
                  <button key={m.k} onClick={()=>patch({dispoMode:m.k})}
                    style={{flex:1,padding:"10px 8px",borderRadius:11,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,border:"none",textAlign:"center",
                      background:form.dispoMode===m.k?C.goldL:C.cream3,color:form.dispoMode===m.k?C.gold:C.soft,outline:form.dispoMode===m.k?`1.5px solid ${C.goldB}`:"none",transition:"all .15s"}}>
                    <div>{m.l}</div>
                    <div style={{fontSize:10,fontWeight:400,marginTop:2}}>{m.sub}</div>
                  </button>
                ))}
              </div>

              {/* Jours récurrents */}
              {form.dispoMode!=="ponctuel" && (
                <>
                  <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:9,textTransform:"uppercase",letterSpacing:.5}}>{T.joursLabel}</div>
                  <div style={{display:"flex",gap:7,marginBottom:18}}>
                    {JOURS.map(j=>(
                      <button key={j.k} onClick={()=>patch({dispoJours:{...form.dispoJours,[j.k]:!form.dispoJours[j.k]}})}
                        style={{flex:1,padding:"10px 0",borderRadius:10,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,
                          background:form.dispoJours[j.k]?C.ink:C.cream3,color:form.dispoJours[j.k]?C.white:C.soft,transition:"all .15s"}}>
                        {j.l}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Plage horaire */}
              <div style={{background:C.white,borderRadius:13,border:`1px solid ${C.border}`,padding:"14px"}}>
                <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>{T.timeLabel}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[[T.timeFrom,"dispoStart","09:00"],[T.timeTo,"dispoEnd","18:00"]].map(([lbl,k,dflt])=>(
                    <div key={k}>
                      <div style={{fontSize:11,color:C.muted,marginBottom:5}}>{lbl}</div>
                      <input type="time" value={form[k]||dflt} onChange={e=>patch({[k]:e.target.value})}
                        style={{width:"100%",padding:"10px 11px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:14,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",fontWeight:700}}/>
                    </div>
                  ))}
                </div>
              </div>

              {Object.values(form.dispoJours).some(v=>v)&&(
                <div style={{marginTop:12,background:C.sageL,borderRadius:11,padding:"9px 13px",display:"flex",gap:8,alignItems:"center"}}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{fontSize:11,color:C.sage}}>
                    {Object.entries(form.dispoJours).filter(([,v])=>v).map(([k])=>JOURS.find(j=>j.k===k)?.l).join(" · ")} · {form.dispoStart||"09:00"}–{form.dispoEnd||"18:00"}
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={{display:"flex",gap:9,marginTop:22}}>
            <button onClick={()=>setStep(4)} style={{flex:1,padding:"13px",borderRadius:13,border:`1.5px solid ${C.border}`,cursor:"pointer",fontWeight:700,fontSize:13,background:C.white,color:C.ink,fontFamily:"inherit"}}>{T.backBtn}</button>
            <button onClick={saveAndContinue}
              disabled={!form.dispoChoice}
              style={{flex:2,padding:"13px",borderRadius:13,border:"none",background:form.dispoChoice?C.ink:C.cream3,color:form.dispoChoice?C.white:C.muted,fontWeight:700,fontSize:13,cursor:form.dispoChoice?"pointer":"not-allowed",fontFamily:SERIF}}>
              {form.dispoChoice==="later"?T.passBtn:T.saveBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 6 — Révision & publication ─────────────────────────────────────────
  const activeFormats = FMT.filter(f=>form.formats[f.id]?.on);
  return (
    <><div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:C.cream}}>
      <Hdr title={T.step6Title}/>
      <div style={{flex:1,overflowY:"auto",padding:"20px 18px 28px"}}>

        {/* Preview card */}
        <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:16,boxShadow:`0 4px 20px ${C.sh}`}}>
          <div style={{height:4,background:`linear-gradient(90deg,${C.gold},${C.sage})`}}/>
          <div style={{padding:"16px"}}>
            <div style={{display:"flex",gap:13,alignItems:"flex-start",marginBottom:14}}>
              {form.photoUrl
                ? <img src={form.photoUrl} alt="" style={{width:56,height:56,borderRadius:12,objectFit:"cover",flexShrink:0,border:`2px solid ${C.border}`}}/>
                : <div style={{width:56,height:56,borderRadius:12,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:C.gold,flexShrink:0,fontFamily:SERIF}}>
                    {(form.prenom[0]||"")+(form.nom[0]||"")}
                  </div>}
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{form.prenom} {form.nom}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{CATS.find(c=>c.id===form.category)?.label||"—"} · {form.yearsExp}</div>
                <div style={{fontSize:12,color:C.soft,marginTop:5,lineHeight:1.5}}>{form.tagline}</div>
              </div>
            </div>
            {/* Formats actifs */}
            {activeFormats.length>0&&(
              <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                {activeFormats.map(f=>(
                  <span key={f.id} style={{fontSize:11,padding:"4px 10px",borderRadius:20,background:C.cream2,color:C.ink,fontWeight:600}}>
                    {f.icon} {f.label} · {form.formats[f.id].dur} · {form.formats[f.id].price}€
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Récap rapide */}
        <div style={{background:C.white,borderRadius:13,border:`1px solid ${C.border}`,padding:"12px 15px",marginBottom:16}}>
          {[
            {l:T.summaryEmail,  v:form.email},
            {l:T.summaryPays,   v:form.pays},
            {l:T.summaryLangs,  v:(form.langs||[]).join(", ")||"—"},
            {l:T.summaryResult, v:form.result1||"—"},
            {l:T.summaryDispo,  v:Object.entries(form.dispoJours).filter(([,v])=>v).map(([k])=>JOURS.find(j=>j.k===k)?.l).join(" ")||"—"},
          ].map((r,i,arr)=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none"}}>
              <span style={{fontSize:12,color:C.muted}}>{r.l}</span>
              <span style={{fontSize:12,fontWeight:600,color:C.ink,maxWidth:"60%",textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.v}</span>
            </div>
          ))}
        </div>

        {/* Exartitude Score */}
        <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:14,padding:"18px 18px",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{flexShrink:0,width:42,height:42,borderRadius:11,background:"rgba(185,134,74,.15)",border:`1px solid rgba(185,134,74,.3)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:20}}>✦</span>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:SERIF}}>Score d'Exartitude</div>
              <div style={{fontSize:22,fontWeight:800,color:"rgba(185,134,74,.4)",fontFamily:SERIF,letterSpacing:2,lineHeight:1}}>—</div>
            </div>
          </div>
          <div style={{fontSize:11,color:"rgba(253,252,248,.45)",marginBottom:10}}>Ton score sera calculé à partir de :</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {["Résultats vérifiés","Avis clients","Régularité","Réactivité","Fiabilité"].map(c=>(
              <div key={c} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"rgba(253,252,248,.65)"}}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="rgba(185,134,74,.7)" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
                {c}
              </div>
            ))}
          </div>
          <div style={{fontSize:10,color:"rgba(253,252,248,.3)",marginTop:12,fontStyle:"italic"}}>Encore indisponible — apparaîtra après tes premières missions.</div>
        </div>

        {/* CGU */}
        <div style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:13,padding:"14px",marginBottom:20}}>
          {[["cgu", lang==="es"
              ? <span>Acepto los <a href="#" onClick={e=>{e.preventDefault();setShowCguModal&&setShowCguModal(true);}} style={{color:C.gold,textDecoration:"underline"}}>Términos y Condiciones Savvy</a></span>
              : <span>J'accepte les <a href="#" onClick={e=>{e.preventDefault();setShowCguModal&&setShowCguModal(true);}} style={{color:C.gold,textDecoration:"underline"}}>Conditions Générales Savvy</a></span>
            ],["certif",T.certifCheck]].map(([key,txt])=>(
            <div key={key} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
              <input type="checkbox" id={key} checked={!!form[key]} onChange={e=>patch({[key]:e.target.checked})}
                style={{width:16,height:16,cursor:"pointer",marginTop:2,accentColor:C.gold}}/>
              <label htmlFor={key} style={{fontSize:12,color:C.soft,cursor:"pointer",lineHeight:1.5}}>{txt}</label>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:9}}>
          <button onClick={()=>setStep(5)} style={{flex:1,padding:"13px",borderRadius:13,border:`1.5px solid ${C.border}`,cursor:"pointer",fontWeight:700,fontSize:13,background:C.white,color:C.ink,fontFamily:"inherit"}}>{T.backBtn}</button>
          <button onClick={async()=>{
            if(!form.cgu||!form.certif){alert(T.errCgu); return;}
            const builtProfile={
              prenom:form.prenom, nom:form.nom,
              initials:`${form.prenom[0]||""}${form.nom[0]||""}`.toUpperCase(),
              domain:`${CATS.find(c=>c.id===form.category)?.label||""}`,
              role:`${CATS.find(c=>c.id===form.category)?.label||""} · ${form.yearsExp}`,
              tagline:form.tagline, bio:form.bio||"",
              location:form.pays, langs:form.langs||["FR"], cat:form.category,
              photoUrl:form.photoUrl||null,
              phases:activeFormats.map((f,i)=>({id:i+1,name:form.formats[f.id].name||f.label,what:form.formats[f.id].desc||`${f.label} ${form.formats[f.id].dur}`,format:f.id,price:Number(form.formats[f.id].price)||0,inc:[]})),
              creds:[form.result1,form.proof1].filter(Boolean),
              rating:null, impact:{sessions:0,clients:0,revenu:0},
              since:"2026", verified:false, active:true,
            };
            setFinalProfile(builtProfile);
            if(authUser?.real&&authUser?.id){
              const expertData={
                user_id:authUser.id,
                name:`${form.prenom} ${form.nom}`.trim(),
                initials:builtProfile.initials,
                role:builtProfile.role, tagline:form.tagline,
                bio:form.bio||"", location:form.pays, langs:form.langs||["FR"],
                cat:form.category, verified:false, active:false,
                phases:builtProfile.phases,
                creds:builtProfile.creds, metrics:[],
                photo_url:form.photoUrl?.startsWith("http")?form.photoUrl:null,
              };
              // Garantir que le profil existe avant d'insérer l'expert (FK experts_user_id_fkey)
              await supabase.from("profiles").upsert(
                { id: authUser.id, name: authUser.name || null, email: authUser.email || null },
                { onConflict: "id" }
              );
              // Try update first (if row exists), then insert
              const{data:existing}=await supabase.from("experts").select("id").eq("user_id",authUser.id).single();
              let saveError=null;
              if(existing?.id){
                const{error}=await supabase.from("experts").update(expertData).eq("user_id",authUser.id);
                saveError=error;
              } else {
                const{error}=await supabase.from("experts").insert(expertData);
                saveError=error;
              }
              if(saveError){ alert("Erreur sauvegarde: "+saveError.message); return; }
              // Update profile as expert
              await supabase.from("profiles").update({is_expert:true}).eq("id",authUser.id);
            } else if(!authUser?.real){
              alert("Tu dois être connecté pour créer un profil expert.");
              return;
            }
            patch({submitted:true});
          }} style={{flex:2,padding:"14px",borderRadius:13,border:"none",
            background:form.cgu&&form.certif?`linear-gradient(135deg,${C.gold},${C.goldB})`:C.cream3,
            color:form.cgu&&form.certif?C.white:C.muted,
            fontWeight:700,fontSize:15,cursor:form.cgu&&form.certif?"pointer":"not-allowed",fontFamily:SERIF,letterSpacing:".2px"}}>
            {T.publishBtn}
          </button>
        </div>
        <div style={{textAlign:"center",fontSize:10,color:C.faint,marginTop:10}}>Examiné par l'équipe Savvy sous 24–48h</div>
      </div>
    </div>
    {showCguModal && (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999,padding:"0 0 env(safe-area-inset-bottom)"}}>
        <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto"}}>
          <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>
          <div style={{fontSize:18,fontWeight:800,color:C.ink,fontFamily:SERIF,marginBottom:16}}>Conditions Générales Savvy</div>
          {[
            ["Commission","Savvy prélève une commission de 20% sur chaque session réalisée. Le solde est disponible sous 48h après la session."],
            ["Paiement","Les paiements sont sécurisés via Stripe. Tu reçois un virement bancaire sur le compte enregistré."],
            ["Annulation","Le client peut annuler jusqu'à 24h avant la session pour un remboursement complet. En dessous de 24h, tu conserves 50% du montant."],
            ["Authenticité","Tu certifies que toutes les informations de ton profil sont exactes et que tu es habilité à pratiquer dans ton domaine."],
            ["Comportement","Savvy se réserve le droit de suspendre tout profil en cas de comportement inapproprié ou d'avis négatifs répétés."],
          ].map(([title,body],i)=>(
            <div key={i} style={{marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:C.ink,marginBottom:4}}>{title}</div>
              <div style={{fontSize:12,color:C.soft,lineHeight:1.6}}>{body}</div>
            </div>
          ))}
          <button onClick={()=>setShowCguModal(false)} style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:8}}>Compris ✓</button>
        </div>
      </div>
    )}
    </>
  );
}

export default SignupScreen;
