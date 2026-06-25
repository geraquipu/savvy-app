import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

const C = {
  // Surfaces
  cream:"#FAFAF8", cream2:"#F3F2EE", cream3:"#ECEAE5", white:"#FFFFFF",
  // Texte
  ink:"#1C1F17",    // olive nuit — titres
  soft:"#1F2937",   // gris nuit — corps
  muted:"#6B7280",  // gris — sous-titres
  faint:"#9CA3AF",  // gris clair — meta
  // Marque principale — vert olive
  gold:"#6E8B3D",   goldL:"#EEF3E2", goldB:"#4A6029",
  // Succès / vérifié — vert vif
  sage:"#0F9D58",   sageL:"#E8F5EE", sageMid:"#059669",
  // Secondaire — bleu nuit
  navy:"#1E3A5F",   navyL:"#E8EFF8",
  // Alerte — ambre
  rose:"#D97706",   roseL:"#FEF3C7",
  // Neutre support
  teal:"#3D6B4F",   tealL:"#D1FAE5",
  // Bordures & ombres
  border:"#E8E5E0", borderF:"#F0EFEB",
  sh:"rgba(26,40,32,.06)", shM:"rgba(26,40,32,.12)",
};
const SERIF = "'Cormorant Garant',Georgia,serif";
const SANS  = "'DM Sans',-apple-system,BlinkMacSystemFont,'Inter',sans-serif";

// ── Upload photo vers Supabase Storage ──────────────────────────────────────
async function uploadPhoto(file, userId) {
  const ext = file.name.split('.').pop().toLowerCase() || 'jpg';
  const path = `experts/${userId || 'anon'}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

const MENU_ICONS = {
  "⚙️": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={3}/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  "💳": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={1} y={4} width={22} height={16} rx={2}/><line x1={1} y1={10} x2={23} y2={10}/></svg>,
  "⭐": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  "🤝": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M17 11l-5-5H6l-3 3 4 4"/><path d="m7 11 4 4 7-7"/><path d="m14 7 3 3-7 7-4-4"/></svg>,
  "📋": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x={8} y={2} width={8} height={4} rx={1}/></svg>,
  "🔒": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  "💬": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  "📧": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  "🍪": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={10}/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1={9} y1={9} x2={9.01} y2={9}/><line x1={15} y1={9} x2={15.01} y2={9}/></svg>,
  "🔔": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  "👤": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>,
  "💰": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  "🌍": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  "📅": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>,
  "🗓️": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/><line x1={8} y1={14} x2={8} y2={14}/><line x1={12} y1={14} x2={12} y2={14}/><line x1={16} y1={14} x2={16} y2={14}/></svg>,
  "💼": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={2} y={7} width={20} height={14} rx={2}/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1={12} y1={12} x2={12} y2={12}/></svg>,
  "⚡": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  "🔁": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>,
  "❌": <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>,
  "💡": <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><line x1={9} y1={18} x2={15} y2={18}/><line x1={10} y1={22} x2={14} y2={22}/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
};

const DEMO_USERS = {
  expert: {
    name:"German Quintana", initials:"GQ", email:"german@savvy.fr",
    role:"Expert · Inventaires & KPIs Excel", isExpert:true,
    avatar_bg:"#E0F2FE", avatar_color:"#0369A1",
  },
  client: {
    name:"Sophie Martin", initials:"SM", email:"sophie@savvy.fr",
    role:"Cliente · Membre depuis Jan 2025", isExpert:false,
    avatar_bg:"#DBEAFE", avatar_color:"#0F2744",
  },
};

const CATS = [
  {id:"vie",        icon:"🏠", label:"Vie en France",  sub:"Logement · Travail · Études",        color:"#8B6330", bg:"#F5EDD8"},
  {id:"tourisme",   icon:"✈️", label:"Tourisme",        sub:"Voyages · Gastronomie · Loisirs",    color:"#0369A1", bg:"#E0F2FE"},
  {id:"business",   icon:"💼", label:"Business",        sub:"Import · Export · Création",         color:"#0F2744", bg:"#DBEAFE"},
  {id:"industrie",  icon:"🏗️", label:"Industrie",       sub:"Production · Machines · Logistique", color:"#065F46", bg:"#D1FAE5"},
  {id:"techno",     icon:"💻", label:"Technologie",     sub:"Dev · IA · Automatisation",          color:"#6D28D9", bg:"#EDE9FE"},
  {id:"finances",   icon:"💶", label:"Finances",        sub:"Investissements · Fiscalité",        color:"#92400E", bg:"#FEF3C7"},
];

const SUBCATS = {
  vie: [
    {id:"logement",    icon:"🏠", label:"Logement"},
    {id:"travail",     icon:"💼", label:"Travail & Emploi"},
    {id:"etudes",      icon:"🎓", label:"Études"},
    {id:"admin",       icon:"📋", label:"Démarches admin"},
    {id:"sante",       icon:"🏥", label:"Santé"},
    {id:"expatriation",icon:"🌍", label:"Expatriation"},
  ],
  tourisme: [
    {id:"voyages",     icon:"✈️", label:"Voyages"},
    {id:"hotels",      icon:"🏨", label:"Hôtels & séjours"},
    {id:"gastronomie", icon:"🍽️", label:"Gastronomie"},
    {id:"loisirs",     icon:"🎭", label:"Loisirs & culture"},
    {id:"transport",   icon:"🚆", label:"Transport"},
    {id:"budget",      icon:"💶", label:"Voyager moins cher"},
  ],
  business: [
    {id:"import",      icon:"📦", label:"Importation"},
    {id:"export",      icon:"🌍", label:"Exportation"},
    {id:"creation",    icon:"🏢", label:"Créer une entreprise"},
    {id:"negociation", icon:"🤝", label:"Négociation"},
    {id:"marketing",   icon:"📈", label:"Marketing"},
    {id:"juridique",   icon:"⚖️", label:"Juridique & contrats"},
  ],
  industrie: [
    {id:"production",  icon:"🏭", label:"Production"},
    {id:"machines",    icon:"⚙️", label:"Machinerie"},
    {id:"logistique",  icon:"🚚", label:"Logistique"},
    {id:"qualite",     icon:"✅", label:"Qualité & QSE"},
    {id:"energie",     icon:"⚡", label:"Énergie"},
    {id:"maintenance", icon:"🔧", label:"Maintenance"},
  ],
  techno: [
    {id:"dev",         icon:"💻", label:"Développement"},
    {id:"ia",          icon:"🤖", label:"Intelligence artificielle"},
    {id:"auto",        icon:"⚡", label:"Automatisation"},
    {id:"data",        icon:"📊", label:"Data & Analytics"},
    {id:"cloud",       icon:"☁️", label:"Cloud & DevOps"},
    {id:"cyber",       icon:"🔒", label:"Cybersécurité"},
  ],
  finances: [
    {id:"invest",      icon:"📈", label:"Investissements"},
    {id:"fiscalite",   icon:"🧾", label:"Fiscalité"},
    {id:"gestion",     icon:"💼", label:"Gestion d\'entreprise"},
    {id:"crypto",      icon:"₿",  label:"Crypto & DeFi"},
    {id:"epargne",     icon:"🏦", label:"Épargne"},
    {id:"comptabilite",icon:"📒", label:"Comptabilité"},
  ],
};

// ─── Trust Score System ────────────────────────────────────────────────────────
const TRUST_LEVELS = [
  { id:"explorador",      min:0,  max:30,  icon:"",  label:"Explorador",      color:"#059669", bg:"#E8F5EE", border:"rgba(15,157,88,.2)"   },
  { id:"practicant",      min:30, max:60,  icon:"",  label:"Praticant",       color:"#92400E", bg:"#FEF3C7", border:"rgba(146,64,14,.2)"   },
  { id:"expert",          min:60, max:80,  icon:"",  label:"Expert",          color:"#1E3A5F", bg:"#E8EFF8", border:"rgba(30,58,95,.2)"    },
  { id:"expert_verifie",  min:80, max:95,  icon:"",  label:"Expert vérifié",  color:"#5B3E99", bg:"#F0EAFF", border:"rgba(91,62,153,.2)"   },
  { id:"referent",        min:95, max:100, icon:"",  label:"Référent Savvy",  color:"#92400E", bg:"#FEF3C7", border:"rgba(146,64,14,.2)"   },
];

const getTrustLevel = (score) => TRUST_LEVELS.find(l => score >= l.min && score < l.max) || TRUST_LEVELS[TRUST_LEVELS.length-1];

// ─── Shared booking bus (localStorage) ────────────────────────────────────────
const BOOKINGS_KEY = "savvy_bookings";
const THREADS_KEY  = "savvy_threads";
const getBookings  = () => { try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY)||"[]"); } catch { return []; } };
const saveBookings = (arr) => { try { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(arr)); } catch {} };
const addBooking   = (b) => { const arr = getBookings(); saveBookings([...arr.filter(x=>x.id!==b.id), b]); };
const updateBooking = (id, patch) => { saveBookings(getBookings().map(b=>b.id===id?{...b,...patch}:b)); };
const getThreads   = () => { try { return JSON.parse(localStorage.getItem(THREADS_KEY)||"[]"); } catch { return []; } };
const addThread    = (t) => { const arr = getThreads(); if(!arr.find(x=>x.id===t.id)) { localStorage.setItem(THREADS_KEY, JSON.stringify([t,...arr])); } };

const EXPERTS = [
  {
    id:1, initials:"CR", name:"Clément Rousseau", country:"🇫🇷",
    role:"Passionné Paris · ex-guide touristique certifié ANCT",
    tagline:"A Paris, sans conseil local, tu paieras trop cher pour un hotel mal place. Dis-moi ton budget — je t\'envoie mes 3 meilleures adresses.",
    location:"Paris", langs:["FR","EN"], rating:4.9, reviews:127, sales:312,
    color:"#8B6330", bg:"#F5EDD8", cat:"vie", verified:true,
    metrics:[
      {icon:"🗼", value:"+100", label:"séjours à Paris"},
      {icon:"🏨", value:"20",   label:"hôtels testés perso"},
      {icon:"⭐", value:"4.9",  label:"sur 127 avis"},
      {icon:"⚡", value:"< 2h", label:"temps de réponse"},
    ],
    phases:[
      {id:1,name:"Recommandation hôtel écrite",   what:"L\'hôtel parfait selon votre budget et vos dates",   format:"Réponse écrite · 24h",  price:5,  tag:"⚡ Rapide",     inc:["1 recommandation personnalisée","Quartier, prix, lien direct","Alternatives si complet"]},
      {id:2,name:"Session vidéo · planification", what:"On planifie ensemble votre séjour de A à Z",         format:"Vidéo 1h",              price:10, tag:"⭐ Populaire",  inc:["Hôtel + restaurants + transports","Itinéraire PDF envoyé","Bons plans locaux"]},
      {id:3,name:"Pack séjour Paris complet",     what:"Tout pour un séjour parfait, billets musées inclus", format:"3 sessions + guides",   price:25, tag:"🎯 Tout inclus",inc:["Hôtels · restos · musées","Billets Louvre sans queue","Messagerie 7 jours"]},
    ],
    creds:["Visité Paris +100 fois en 15 ans","20 hôtels testés personnellement","Ex-guide certifié ANCT 2012–2018","Blog voyage · 50 000 abonnés Instagram"],
    bio:"Je vis Paris depuis 15 ans. Je vous dis exactement où aller — pas de recommandations génériques, que du vécu.",
    sys:"Tu es Clément Rousseau, expert séjours Paris. Direct, pratique, chaleureux. Max 3 phrases. UNE question à la fois.",
  },
  {
    id:2, initials:"MA", name:"Marie Aubert", country:"🇫🇷",
    role:"Chef pâtissière · Diplômée Ferrandi · Paris",
    tagline:"Les recettes en ligne oublient l\'essentiel. Ce que j\'ai appris a Ferrandi, je te le donne — meme si tu n\'as jamais fait de patisserie.",
    location:"Paris", langs:["FR","EN"], rating:5.0, reviews:94, sales:234,
    color:"#7C2D12", bg:"#FFEDD5", cat:"cuisine", verified:true,
    metrics:[
      {icon:"🍰", value:"+100",    label:"recettes maîtrisées"},
      {icon:"🎓", value:"Ferrandi", label:"diplômée Paris"},
      {icon:"⭐", value:"5.0",     label:"sur 94 missions"},
      {icon:"⚡", value:"< 4h",    label:"temps de réponse"},
    ],
    phases:[
      {id:1,name:"La recette exacte + astuces",     what:"Ma recette avec tous les secrets du pro",               format:"PDF illustré · 24h",    price:10, tag:"⚡ Rapide",     inc:["Recette PDF détaillée","Erreurs à éviter","3 questions incluses"]},
      {id:2,name:"On cuisine ensemble en vidéo",    what:"Je guide chaque geste en direct — impossible de rater", format:"Vidéo 1h en direct",    price:20, tag:"⭐ Populaire",  inc:["Visio 1h en direct","Recette PDF incluse","Enregistrement 7 jours"]},
      {id:3,name:"Liste fournisseurs & où acheter", what:"Quoi acheter et où, dans votre pays",                   format:"PDF par pays · 24h",    price:15, tag:"🛒 Malin",      inc:["Marques recommandées","Liens d\'achat en ligne","Grande surface + pro"]},
      {id:4,name:"Pack complet",                    what:"Recette + cours vidéo + guide fournisseurs",            format:"Tout inclus",           price:40, tag:"🎯 Tout inclus",inc:["Phases 1+2+3","Économie 5€","Suivi messagerie 7 jours"]},
    ],
    creds:["Diplômée pâtisserie École Ferrandi Paris","+100 recettes maîtrisées et testées","Fournisseurs France, Belgique, Suisse","94 missions — 100% avis 5 étoiles"],
    bio:"Chef pâtissière diplômée Ferrandi. Je vous donne mes vraies recettes de labo et je vous dis exactement où acheter les ingrédients.",
    sys:"Tu es Marie Aubert, chef pâtissière diplômée Ferrandi. Chaleureuse et pédagogique. Max 3 phrases. En français. UNE question à la fois.",
  },
  {
    id:3, initials:"PG", name:"Patrick Gazet", country:"🇫🇷",
    role:"Expert optimisation production · laboratoires pâtisserie",
    tagline:"Un labo qui perd du temps, c\'est souvent 3 problemes que personne n\'a ose corriger. Je les trouve en 30 min — et je te dis quoi faire.",
    location:"Lyon", langs:["FR"], rating:4.9, reviews:61, sales:143,
    color:"#065F46", bg:"#D1FAE5", cat:"cuisine", verified:true,
    metrics:[
      {icon:"🏭", value:"35 ans",  label:"en laboratoires artisanaux"},
      {icon:"📈", value:"+35%",    label:"de productivité en moyenne"},
      {icon:"⭐", value:"4.9",     label:"sur 61 audits réalisés"},
      {icon:"💰", value:"−28%",    label:"de coûts de production"},
    ],
    phases:[
      {id:1,name:"Question pâtisserie écrite",         what:"Je réponds à votre question technique ou organisationnelle en détail", format:"Réponse écrite · 24h",    price:20,  tag:"⚡ Rapide",     inc:["Réponse complète et détaillée","Sources et références","1 question de suivi offerte"]},
      {id:2,name:"Consultation vidéo · conseil",       what:"On analyse ensemble votre situation et je vous donne un plan d\'action concret", format:"Vidéo 1h",      price:50,  tag:"⭐ Populaire",  inc:["Analyse de votre situation","Plan d\'action prioritaire","Compte-rendu PDF"]},
      {id:3,name:"Audit laboratoire complet",          what:"J\'audite votre labo en détail et vous livre un rapport avec toutes mes recommandations", format:"Vidéo 2h + rapport PDF", price:150, tag:"🔍 Audit pro",   inc:["Questionnaire pré-audit détaillé","Rapport PDF complet","Plan d\'action chiffré","Suivi messagerie 15 jours"]},
      {id:4,name:"Accompagnement optimisation · mensuel", what:"Je pilote votre transformation sur 4 semaines avec des résultats mesurables", format:"4 semaines · suivi hebdo", price:400, tag:"🚀 Transformation",inc:["4 sessions vidéo hebdomadaires","Messagerie illimitée","Tableaux de bord Excel fournis","Rapport final avec résultats chiffrés"]},
    ],
    creds:["35 ans de terrain en laboratoires pâtisserie artisanale","61 audits de production réalisés en France","Spécialiste lean manufacturing appliqué à la pâtisserie","Formateur certifié organisation et process labo"],
    bio:"35 ans à optimiser des laboratoires pâtisserie. Je transforme votre organisation pour que vous produisiez plus, mieux, et avec moins de pertes.",
    sys:"Tu es Patrick Gazet, expert optimisation de production en laboratoires de pâtisserie. Précis, concret, orienté résultats. Max 3 phrases. UNE question à la fois.",
  },
  {
    id:4, initials:"AM", name:"Antoine Mercier", country:"🇫🇷",
    role:"Supply chain · 12 ans en laboratoire artisanal",
    tagline:"Si ta logistique coute plus cher que prevu, c\'est rarement un hasard. 12 ans chez Renault et Decathlon — dis-moi ton probleme.",
    location:"Paris", langs:["FR","EN"], rating:4.9, reviews:38, sales:89,
    color:"#0F2744", bg:"#DBEAFE", cat:"business", verified:true,
    metrics:[
      {icon:"📦", value:"8",     label:"PME structurées"},
      {icon:"💰", value:"≤ 40%", label:"d\'économies obtenues"},
      {icon:"⭐", value:"4.9",   label:"sur 38 missions"},
      {icon:"⚡", value:"< 6h",  label:"temps de réponse"},
    ],
    phases:[
      {id:1,name:"Diagnostic de votre situation", what:"J\'analyse vos flux et vous donne vos 3 priorités d\'action", format:"Rapport + appel 30 min", price:80,  tag:"📋 Débuter",    inc:["Questionnaire pré-session","Rapport PDF avec plan d\'action","Appel vidéo 30 min"]},
      {id:2,name:"Mise en place des processus",   what:"Je construis vos outils Excel et vous forme",                 format:"3 sessions vidéo 1h",   price:350, tag:"⭐ Populaire",  inc:["3 sessions vidéo 1h","Excel : stocks · marges · commandes","Messagerie entre sessions"]},
      {id:3,name:"Accompagnement mensuel",        what:"Je pilote avec vous pendant 4 semaines",                      format:"4 semaines · suivi",    price:600, tag:"🚀 Complet",    inc:["4 sessions hebdomadaires","Messagerie illimitée","Rapport final + recommandations"]},
    ],
    creds:["12 ans supply chain laboratoires artisanaux Paris","8 PME structurées de 0 à 500 k€ CA","Excel avancé · COGS · planification · stocks","Templates prêts à l\'emploi livrés"],
    bio:"Expert supply chain de laboratoire pâtisserie. Des outils concrets pour avoir enfin de la visibilité sur vos marges et vos stocks.",
    sys:"Tu es Antoine Mercier, expert supply chain pâtisserie. Professionnel et concret. Max 3 phrases. UNE question à la fois.",
  },
  {
    id:5, initials:"LV", name:"Luis Villamil", country:"🇨🇴🇫🇷",
    role:"Expert import voitures Colombie · 6 ans terrain",
    tagline:"Importer une voiture de Colombie sans savoir exactement quoi faire, c\'est perdre entre 2 000€ et 10 000€ sans s\'en rendre compte. Je l\'ai fait 12 fois — je t\'explique chaque étape.",
    location:"Bogotá / Paris", langs:["FR","ES"], rating:4.9, reviews:34, sales:28,
    color:"#854D0E", bg:"#FEF9C3", cat:"business", verified:true,
    metrics:[
      {icon:"🚗", value:"12+",    label:"voitures importées"},
      {icon:"💡", value:"6 ans",  label:"d\'expérience terrain"},
      {icon:"🇨🇴", value:"100%", label:"expérience réelle"},
      {icon:"⚡", value:"< 4h",   label:"réponse moyenne"},
    ],
    phases:[
      {id:1, name:"Étape 1 — Viabilité",    what:"Impôts réels, marges honnêtes et coûts cachés que personne ne te dit. Avant de dépenser un centime.",  format:"🎥 Vidéo",    price:15,  tag:"✅ Par ici pour commencer", inc:["Impôts et taxes réels","Marges honnêtes","Coûts cachés détaillés"]},
      {id:2, name:"Étape 2 — Transport",    what:"Maritime ou terrestre ? Quels agents sont fiables ? Vrais délais. Mes contacts et mes erreurs passées.", format:"🎥 Vidéo",    price:30,  tag:"🚢 Concret & précis",       inc:["Comparatif maritime/terrestre","Agents fiables recommandés","Délais réels"]},
      {id:3, name:"Étape 3 — Aduanas",      what:"C\'est là où les gens perdent de l\'argent. Documentation complète, erreurs courantes, coûts inattendus.", format:"📄 Document", price:45,  tag:"📋 Le plus important",      inc:["Documentation complète","Erreurs courantes à éviter","Coûts cachés douane"]},
      {id:4, name:"Étape 4 — Vente finale", what:"Matricule, revente, légalisation. Comment sortir ton argent proprement et légalement.",                   format:"🎥 Vidéo",    price:60,  tag:"🏁 Jusqu\'au bout",         inc:["Processus matricule complet","Stratégie revente","Légalisation étape par étape"]},
    ],
    creds:["12+ voitures importées de Colombie vers l\'Europe","Maîtrise douanes France-Colombie","Réseau d\'agents et transitaires fiables"],
    bio:"6 ans d\'expérience dans l\'importation de voitures depuis la Colombie. 12+ véhicules importés, erreurs comprises.",
    sys:"Tu es Luis Villamil, expert import voitures Colombie. Direct, honnête, expérience terrain. Max 3 phrases. UNE question à la fois.",
  },
  {
    id:6, initials:"AR", name:"Ahmed Rashidi", country:"🇳🇱",
    role:"Ingénieur tuyauterie · Shell, BP, Aramco · 28 ans",
    tagline:"J\'identifie les erreurs de design avant qu\'elles vous coûtent des millions",
    location:"Pays-Bas", langs:["EN","FR","AR"], rating:5.0, reviews:44, sales:67,
    color:"#8B6330", bg:"#F5EDD8", cat:"industrie", verified:true, nda:true,
    metrics:[
      {icon:"🏭", value:"28 ans",  label:"Shell, BP, Aramco"},
      {icon:"💼", value:"+500 M€", label:"de projets supervisés"},
      {icon:"⭐", value:"5.0",     label:"sur 44 projets"},
      {icon:"⚡", value:"< 24h",   label:"temps de réponse"},
    ],
    phases:[
      {id:1,name:"Consultation technique · 1h",    what:"Je révise votre design et identifie les non-conformités",      format:"Vidéo sécurisée + rapport",  price:800,  tag:"🔍 Revue",      inc:["Analyse ASME B31.3","Rapport technique PDF","Recommandations matériaux"]},
      {id:2,name:"Révision projet · demi-journée", what:"Analyse complète des isométriques, matériaux et spécifications",format:"Session 4h + rapport",       price:2800, tag:"📐 Complet",    inc:["Analyse isométriques CAESAR II","Revue matériaux et joints","Rapport de déviations"]},
      {id:3,name:"Consulting projet · forfait",    what:"Accompagnement technique tout au long du projet",              format:"Devis selon périmètre",      price:null, tag:"🤝 Partenariat", inc:["Périmètre défini ensemble","NDA renforcé + contrat Savvy","80% expert · 20% Savvy"]},
    ],
    creds:["28 ans Shell, BP et Aramco — tuyauterie haute pression","Projets EPC +500 M€ au Qatar et Pays-Bas","Certifié ASME B31.3 · CAESAR II · AutoPIPE","MSc Génie Mécanique TU Delft 1995"],
    bio:"28 ans de tuyauterie industrielle. Je détecte les problèmes de design avant qu\'ils bloquent votre chantier.",
    sys:"Tu es Ahmed Rashidi, ingénieur tuyauterie pétrolière senior. Technique, précis. Max 3 phrases. NDA requis avant partage de données.",
  },
  {
    id:7, initials:"LK", name:"Lars Koenig", country:"🇩🇪",
    role:"Conception mécanique · SolidWorks · Munich",
    tagline:"De vos calculs jusqu\'au prototype fonctionnel, étape par étape",
    location:"Munich", langs:["DE","EN","FR"], rating:5.0, reviews:51, sales:112,
    color:"#065F46", bg:"#D1FAE5", cat:"industrie", verified:true, nda:true,
    metrics:[
      {icon:"⚙️", value:"12",     label:"startups accompagnées"},
      {icon:"🏆", value:"20 ans", label:"conception méc. ind."},
      {icon:"⭐", value:"5.0",    label:"sur 51 projets"},
      {icon:"⚡", value:"< 12h",  label:"temps de réponse"},
    ],
    phases:[
      {id:1,name:"Validation des calculs",         what:"Je vérifie vos hypothèses et dimensionne vos pièces clés",    format:"FEA + rapport technique",    price:200,  tag:"📊 Valider",    inc:["Analyse charges + FEA","Rapport dimensionnement PDF","Recommandations matériaux"]},
      {id:2,name:"Modélisation SolidWorks",        what:"Modèle 3D complet avec plans prêts pour la fabrication",      format:"Fichiers natifs + plans",    price:500,  tag:"⚙️ Design",     inc:["Modèle 3D SolidWorks (fichiers natifs)","Plans cotés PDF + DWG · 2 révisions","Nomenclature des pièces"]},
      {id:3,name:"Accompagnement mise en service", what:"Je suis avec vous pendant fabrication et tests prototype",     format:"Sessions vidéo + messagerie",price:800,  tag:"🚀 Au bout",    inc:["Sessions vidéo suivi fabrication","Messagerie illimitée","Rapport final validation"]},
      {id:4,name:"Pack projet complet",            what:"De la feuille blanche au prototype validé",                   format:"Phases 1+2+3",               price:1200, tag:"🎯 Tout inclus", inc:["Calculs + SolidWorks + Mise en service","Priorité agenda","Économie 300€"]},
    ],
    creds:["20 ans de conception mécanique industrielle","Expert SolidWorks, ANSYS, FEA","12 startups hardware de l\'idée au prototype","Dipl.-Ing. Maschinenbau TU München"],
    bio:"20 ans de conception mécanique. Je fais de vos idées des pièces réelles — du calcul au prototype fonctionnel.",
    sys:"Tu es Lars Koenig, ingénieur conception mécanique. Technique et structuré. Max 3 phrases.",
  },
  {
    id:9, initials:"SM2", name:"Sara Moreno", country:"🇫🇷🇪🇸",
    role:"Vie en France · Logement pour étrangers · CROUS",
    tagline:"Sans garant, presque tous les appartements te refuseront. Commence par le CROUS ou les résidences pour étrangers — je t\'explique tout.",
    location:"Paris", langs:["FR","ES","EN"], rating:4.8, reviews:41, sales:35,
    color:"#6D28D9", bg:"#EDE9FE", cat:"vie", verified:true,
    metrics:[
      {icon:"🏠", value:"40+",   label:"étudiants logés"},
      {icon:"📋", value:"40+",   label:"dossiers montés"},
      {icon:"⭐", value:"97%",   label:"satisfaction"},
      {icon:"⚡", value:"< 3h",  label:"réponse moyenne"},
    ],
    phases:[
      {id:1, name:"Le CROUS — comment ça marche",   what:"Ce que c\'est, qui peut en bénéficier, comment candidater, les vrais délais et les erreurs qui font rater sa chambre.",    format:"🎥 Vidéo",    price:15,  tag:"✅ Par ici pour commencer", inc:["Qui peut accéder au CROUS","Comment soumettre un dossier béton","Les erreurs qui font rater la chambre"]},
      {id:2, name:"Résidences spéciales étrangers", what:"Il existe des résidences faites pour toi. Meilleures options, critères, prix réels et comment augmenter tes chances.",       format:"🎥 Vidéo",    price:25,  tag:"🏠 Souvent ignoré",          inc:["Liste des meilleures résidences","Critères d\'acceptation réels","Astuces pour augmenter ses chances"]},
      {id:3, name:"Le problème du garant",          what:"Visale, garant physique, garant étranger, caution bancaire — chaque option expliquée honnêtement pour un dossier béton.",   format:"📄 Document", price:30,  tag:"🔑 Le vrai blocage",         inc:["Visale — comment l\'obtenir","Alternatives sans garant français","Dossier locataire béton"]},
      {id:4, name:"Trouver un appartement privé",   what:"Quelles plateformes, comment convaincre un propriétaire sans garant français. J\'ai aidé 40+ personnes avec ça.",          format:"🎥 Vidéo",    price:45,  tag:"🎯 Niveau avancé",           inc:["Meilleures plateformes 2025","Script pour convaincre le propriétaire","Astuces qui marchent vraiment"]},
    ],
    creds:["40+ étudiants et travailleurs étrangers aidés à se loger","Maîtrise complète du processus CROUS","Expérience personnelle du logement en France en tant qu\'étrangère"],
    bio:"Passée par le système de logement étudiant en France en tant qu\'étrangère. Depuis 4 ans j\'aide les nouveaux arrivants à se loger.",
    sys:"Tu es Sara Moreno, experte logement pour étrangers en France. Pratique, bienveillante, résultats concrets. Max 3 phrases. UNE question à la fois.",
  },
  {
   id:8, initials:"GQ", name:"German Quintana",
    role:"Industrie · Inventaires & KPIs Excel · 4 ans terrain",
    location:"Paris", country:"France", langs:["FR","EN","ES"],
    rating:4.9, reviews:14, verified:true,
    tagline:"Un stock mal géré fait perdre de l\'argent chaque mois sans qu\'on sache pourquoi. En 4 ans et 40 inventaires dans un labo de production, j\'ai trouvé ce qui fonctionne — je te le donne.",
    color:"#0369A1", bg:"#E0F2FE",
    trustComponents:{ experience:19, structure:22, reputation:0, consistance:14, activite:9, risque:2 },
    metrics:[
      {icon:"📦", label:"Inventaires réalisés", value:"40+"},
      {icon:"📅", label:"Années de pratique",   value:"4 ans"},
      {icon:"📊", label:"KPIs & Excel",          value:"✓ Maîtrisé"},
      {icon:"⚡", label:"Temps de réponse",       value:"< 3h"},
    ],
    nda:false,
    phases:[
      {id:"p0", name:"Méthode inventaire 1h",    price:60,  format:"🎥 Vidéo",    tag:"Le plus demandé",    what:"Méthode rapide d\'inventaire mensuel + tableau Excel prêt à utiliser dès le lendemain."},
      {id:"p1", name:"Tableau Excel KPIs",        price:40,  format:"📄 Document", tag:"Livrable clé en main",what:"Tableau Excel personnalisé avec KPIs automatiques et graphiques pour piloter ton stock."},
      {id:"p2", name:"Accompagnement complet",    price:150, format:"🎥 Vidéo",    tag:"Résultat garanti",   what:"Audit + méthode + tableau personnalisé + 2 sessions de suivi. Opérationnel en une semaine."},
    ],
    bio:"4 ans de gestion de production en laboratoire de pâtisserie. 40 inventaires mensuels réalisés. Expert Excel KPIs et trazabilité.",
    sys:"Tu es German Quintana, expert en gestion de production et inventaires Excel. Pratique et concret. Max 3 phrases.",
    creds:["40 inventaires mensuels sur 4 ans en laboratoire de production","Tableaux Excel avec KPIs automatiques et graphiques de tendance","Analyse mensuelle des écarts de stock et recommandations d\'amélioration"],
  },
];



const CAT_MAP = {
  vie:       [9],
  tourisme:  [1,2],
  business:  [4,5],
  industrie: [3,6,8],
  techno:    [7],
  finances:  [],
};

const DEMO_MSGS = [
  { id:1, eid:0, lastMsg:"Super, votre hôtel est réservé ! Vous allez adorer le quartier Marais.", time:"09:30", unread:0, session:{format:"📄 Document",dur:"1h",price:"10€",date:"Demain 10h00"} },
  { id:2, eid:1, lastMsg:"Pour le macaron, la clé c\'est la tant-pour-tant bien tamisée.",         time:"Hier",  unread:0, session:{format:"📹 Vidéo",dur:"1h",price:"25€",date:"Mar. 3 juin 11h00"} },
  { id:3, eid:2, lastMsg:"Votre labo peut gagner 30% de productivité avec 3 ajustements simples.", time:"Lun",   unread:1, session:{format:"📹 Vidéo",dur:"2h",price:"150€",date:"Sam. 31 mai 14h00"} },
];
// Client convs unread state for expert mode badge calculation
const EXPERT_CLIENT_CONVS = [
  {id:"c1", unread:0},
  {id:"c2", unread:1},
  {id:"c3", unread:0},
];

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

const inp = { width:"100%", padding:"10px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white };
const lbl = { fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:".5px" };

function SkeletonCard() {
  return (
    <div style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,padding:"16px",marginBottom:12}}>
      <div style={{display:"flex",gap:13,alignItems:"flex-start",marginBottom:12}}>
        <div style={{width:52,height:52,borderRadius:14,background:C.cream3,flexShrink:0,animation:"pulse 1.4s ease-in-out infinite"}}/>
        <div style={{flex:1}}>
          <div style={{height:14,background:C.cream3,borderRadius:6,marginBottom:8,width:"65%",animation:"pulse 1.4s ease-in-out infinite"}}/>
          <div style={{height:10,background:C.cream3,borderRadius:6,marginBottom:8,width:"45%",animation:"pulse 1.4s ease-in-out infinite .1s"}}/>
          <div style={{height:10,background:C.cream3,borderRadius:6,width:"55%",animation:"pulse 1.4s ease-in-out infinite .2s"}}/>
        </div>
      </div>
      <div style={{height:48,background:C.cream3,borderRadius:10,animation:"pulse 1.4s ease-in-out infinite .15s"}}/>
    </div>
  );
}

function Av({ e, size=44 }) {
  const r = Math.round(size * .28);
  return <div style={{ width:size, height:size, borderRadius:r, background:e.bg||C.goldL, color:e.color||C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:Math.round(size*.34), flexShrink:0, fontFamily:SANS, letterSpacing:"-.5px" }}>{e.initials}</div>;
}

function Stars({ n, count }) {
  return <div style={{ display:"flex", alignItems:"center", gap:4 }}>
    <span style={{ fontSize:12, fontWeight:700, color:"#D97706" }}>★ {n}</span>
    {count !== undefined && <span style={{ fontSize:11, color:C.faint }}>· {count} avis</span>}
  </div>;
}

function VerBadge({ small }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.sageL, borderRadius:20, padding:small?"2px 8px":"4px 11px" }}>
    <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
    <span style={{ fontSize:small?9:10, color:C.sage, fontWeight:700, letterSpacing:.2 }}>Vérifié</span>
  </span>;
}

function MetricsGrid({ metrics }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, margin:"10px 0" }}>
    {(metrics||[]).map((m,i) => <div key={i} style={{ background:C.cream, borderRadius:12, padding:"9px 11px", display:"flex", alignItems:"center", gap:9, border:`1px solid ${C.borderF}` }}>
      <span style={{ fontSize:15 }}>{m.icon}</span>
      <div>
        <div style={{ fontSize:13, fontWeight:800, color:C.ink, lineHeight:1.1, fontFamily:SERIF }}>{m.value}</div>
        <div style={{ fontSize:10, color:C.muted, lineHeight:1.3 }}>{m.label}</div>
      </div>
    </div>)}
  </div>;
}

function ExpertCard({ e, onClick, onBook }) {
  const allOffers = e.phases?.length ? e.phases : (e.offres?.length ? e.offres : []);
  const price = allOffers[0]?.price;
  const tags = (e.creds||[]).filter(Boolean).slice(0,4);
  const hasPhoto = !!(e.photo_url || e.photoUrl);
  const photoSrc = e.photo_url || e.photoUrl;

  return (
    <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:14, boxShadow:`0 1px 8px ${C.sh}` }}>
      {/* Badge top */}
      {e.verified && (
        <div style={{ padding:"10px 16px 0", display:"flex" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.sageL, borderRadius:20, padding:"3px 10px" }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize:10, fontWeight:700, color:C.sage }}>Expert vérifié</span>
          </div>
        </div>
      )}

      {/* Main info row */}
      <div style={{ display:"flex", gap:14, padding:hasPhoto||e.verified?"12px 16px 0":"16px 16px 0", alignItems:"flex-start" }}>
        {/* Photo / Avatar */}
        {hasPhoto
          ? <img src={photoSrc} alt={e.name} style={{ width:90, height:110, borderRadius:14, objectFit:"cover", flexShrink:0 }}/>
          : <div style={{ width:90, height:110, borderRadius:14, background:`linear-gradient(135deg,${e.bg||C.goldL},${e.bg||C.goldL}cc)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, flexDirection:"column", gap:4 }}>
              <span style={{ fontSize:28, fontWeight:800, color:e.color||C.gold, fontFamily:SERIF }}>{e.initials}</span>
            </div>
        }

        {/* Info */}
        <div style={{ flex:1, minWidth:0, paddingTop:2 }}>
          <div style={{ fontSize:17, fontWeight:700, color:C.ink, fontFamily:SERIF, letterSpacing:"-.3px", marginBottom:2, lineHeight:1.3 }}>{e.name}</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:8, lineHeight:1.4 }}>{e.role}{e.location ? ` · ${e.location}` : ""}</div>

          {/* Rating */}
          {e.rating != null && (
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#D97706" }}>★ {e.rating}</span>
            {e.reviews && <span style={{ fontSize:11, color:C.faint }}>({e.reviews} avis)</span>}
          </div>
          )}

          {/* Langs */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {(e.langs||[]).slice(0,3).map(l=>(
              <span key={l} style={{ fontSize:10, fontWeight:600, background:C.cream2, color:C.soft, padding:"2px 8px", borderRadius:20 }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Tagline */}
      {e.tagline && (
        <div style={{ margin:"10px 16px 0", padding:"9px 12px", background:C.cream2, borderRadius:10 }}>
          <span style={{ fontSize:12, color:C.soft, fontStyle:"italic", lineHeight:1.5 }}>«&nbsp;{e.tagline}&nbsp;»</span>
        </div>
      )}

      {/* Tags spécialités */}
      {tags.length > 0 && (
        <div style={{ padding:"10px 16px 0" }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6 }}>Se spécialise en :</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {tags.map(t => (
              <span key={t} style={{ fontSize:11, background:C.cream2, color:C.soft, padding:"3px 10px", borderRadius:20, border:`1px solid ${C.border}` }}>{t}</span>
            ))}
            {(e.creds||[]).length > 4 && (
              <span style={{ fontSize:11, background:C.cream2, color:C.faint, padding:"3px 10px", borderRadius:20, border:`1px solid ${C.border}` }}>+{(e.creds||[]).length - 4}</span>
            )}
          </div>
        </div>
      )}

      {/* Prix + boutons */}
      <div style={{ padding:"14px 16px 16px", marginTop:10, borderTop:`1px solid ${C.borderF}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:11, color:C.muted }}>À partir de </span>
          <span style={{ fontSize:18, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{price ? `${price}€` : "Sur devis"}</span>
        </div>
        <button onClick={e=>{ e.stopPropagation(); onClick && onClick(); }} style={{ padding:"9px 16px", borderRadius:10, border:`1.5px solid ${C.border}`, background:C.white, color:C.ink, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          Voir profil
        </button>
        <button onClick={e=>{ e.stopPropagation(); onBook ? onBook() : onClick && onClick(); }} style={{ padding:"9px 18px", borderRadius:10, border:"none", background:C.ink, color:C.white, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>
          Réserver
        </button>
      </div>
    </div>
  );
}

// ─── LoginGate ─────────────────────────────────────────────────────────────────
function LoginGate({ icon, title, sub, onLogin }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", background:C.cream, textAlign:"center" }}>
      <div style={{ width:80, height:80, borderRadius:"50%", background:C.cream2, border:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, marginBottom:20 }}>
        {icon}
      </div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.ink, margin:"0 0 10px", fontFamily:SERIF, letterSpacing:"-.3px" }}>{title}</h2>
      <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, margin:"0 0 28px", maxWidth:260 }}>{sub}</p>
      <button onClick={onLogin} style={{ width:"100%", maxWidth:280, padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:C.ink, color:C.white, fontFamily:SERIF, marginBottom:12 }}>
        Se connecter →
      </button>
      <button onClick={onLogin} style={{ width:"100%", maxWidth:280, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:14, background:C.white, color:C.ink, fontFamily:"inherit" }}>
        Créer un compte gratuitement
      </button>
      <p style={{ fontSize:11, color:C.faint, marginTop:16, lineHeight:1.6 }}>
        Tu peux explorer les experts et les profils sans te connecter.
      </p>
    </div>
  );
}

// ─── ProfileSetupModal ─────────────────────────────────────────────────────────
function ProfileSetupModal({ authUser, onDone }) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [city, setCity]           = useState("");
  const [saving, setSaving]       = useState(false);

  const save = async () => {
    const name = (firstName.trim()+" "+lastName.trim()).trim();
    if (!name) return;
    setSaving(true);
    const payload = { name, city: city.trim() || null };
    await supabase.from("profiles").update(payload).eq("id", authUser.id);
    try { localStorage.setItem(`savvy_setup_done_${authUser.id}`, "1"); } catch {}
    onDone({ ...authUser, name, city: city.trim() || authUser.city });
  };

  const steps = [
    // Step 0 — Bienvenue + prénom/nom
    <div key="s0" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:26,fontWeight:800,color:C.ink,fontFamily:SERIF,lineHeight:1.2}}>
        Bienvenue sur Savvy 👋
      </div>
      <div style={{fontSize:14,color:C.muted,lineHeight:1.6}}>
        Avant de commencer, dis-nous comment tu t'appelles.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:8}}>
        <input
          placeholder="Prénom"
          value={firstName}
          onChange={e=>setFirstName(e.target.value)}
          style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:15,fontFamily:"inherit",background:C.white,color:C.ink}}
        />
        <input
          placeholder="Nom"
          value={lastName}
          onChange={e=>setLastName(e.target.value)}
          style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:15,fontFamily:"inherit",background:C.white,color:C.ink}}
        />
      </div>
      <button
        onClick={()=>{ if(!firstName.trim()) return; setStep(1); }}
        style={{marginTop:8,padding:"14px",borderRadius:14,border:"none",background:firstName.trim()?C.ink:C.cream3,color:firstName.trim()?C.white:C.muted,fontSize:15,fontWeight:700,cursor:firstName.trim()?"pointer":"default",fontFamily:"inherit"}}
      >Continuer →</button>
    </div>,

    // Step 1 — Ville (optionnel)
    <div key="s1" style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{fontSize:22,fontWeight:800,color:C.ink,fontFamily:SERIF,lineHeight:1.2}}>
        Tu es basé(e) où ? 📍
      </div>
      <div style={{fontSize:14,color:C.muted,lineHeight:1.6}}>
        Ça aide les experts à mieux te connaître. Tu peux sauter cette étape.
      </div>
      <input
        placeholder="Paris, Lyon, Montréal…"
        value={city}
        onChange={e=>setCity(e.target.value)}
        style={{padding:"13px 16px",borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:15,fontFamily:"inherit",background:C.white,color:C.ink,marginTop:8}}
      />
      <button
        onClick={save}
        disabled={saving}
        style={{marginTop:4,padding:"14px",borderRadius:14,border:"none",background:C.ink,color:C.white,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",opacity:saving?.6:1}}
      >{saving?"Enregistrement…":"C'est parti ✓"}</button>
      <button
        onClick={save}
        style={{padding:"10px",borderRadius:14,border:"none",background:"transparent",color:C.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}
      >Passer cette étape</button>
    </div>,
  ];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:430,background:C.cream,borderRadius:"24px 24px 0 0",padding:"32px 24px 48px",animation:"fadeSlideUp .3s ease-out"}}>
        {/* Indicateur d'étapes */}
        <div style={{display:"flex",gap:6,marginBottom:28}}>
          {[0,1].map(i=>(
            <div key={i} style={{flex:1,height:3,borderRadius:4,background:i<=step?C.ink:C.cream3,transition:"background .3s"}}/>
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  );
}

// ─── OnboardingScreen ──────────────────────────────────────────────────────────
function OnboardingScreen({ onDone }) {
  return (
    <div style={{ position:"fixed", inset:0, background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, zIndex:300, display:"flex", flexDirection:"column", overflowY:"auto" }}>

      {/* Passer */}
      <div style={{ padding:"52px 20px 0", display:"flex", justifyContent:"flex-end", flexShrink:0 }}>
        <button onClick={onDone} style={{ fontSize:12, color:"rgba(253,252,248,.45)", background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, padding:"5px 14px", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
          Passer →
        </button>
      </div>

      {/* Centre — logo + tagline */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 28px", textAlign:"center" }}>

        {/* Logo animé */}
        <div style={{ position:"relative", marginBottom:32 }}>
          <div style={{ position:"absolute", inset:-24, borderRadius:"50%", border:"1px solid rgba(185,134,74,.12)", animation:"spin 25s linear infinite" }}/>
          <div style={{ position:"absolute", inset:-14, borderRadius:"50%", border:"1px solid rgba(185,134,74,.08)", animation:"spin 18s linear infinite reverse" }}/>
          <div style={{ width:88, height:88, borderRadius:26, background:"rgba(185,134,74,.1)", border:"1.5px solid rgba(185,134,74,.25)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <span style={{ fontSize:38, fontWeight:900, fontFamily:SERIF, letterSpacing:"-2px", color:C.goldB }}>
              sav<em style={{ fontStyle:"italic" }}>vy</em>
            </span>
          </div>
        </div>

        {/* Titre principal */}
        <h1 style={{ fontSize:30, fontWeight:700, color:C.white, fontFamily:SERIF, lineHeight:1.25, margin:"0 0 14px", letterSpacing:"-.5px", maxWidth:300 }}>
          Parlez avec quelqu'un<br/>
          <em style={{ color:C.goldB, fontStyle:"italic" }}>qui l'a déjà fait.</em>
        </h1>
        <p style={{ fontSize:14, color:"rgba(253,252,248,.55)", lineHeight:1.7, margin:"0 0 40px", maxWidth:280 }}>
          Des experts vérifiés, disponibles pour vous aider à prendre de meilleures décisions — rapidement.
        </p>

        {/* 3 piliers */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:300, marginBottom:40 }}>
          {[
            { icon:<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.goldB} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label:"Experts vérifiés par Savvy" },
            { icon:<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.goldB} strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>, label:"Conseil concret · Réponse rapide" },
            { icon:<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.goldB} strokeWidth={2}><path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/><path d="m9 12 2 2 4-4"/></svg>, label:"Satisfait ou remboursé · Dès 5€" },
          ].map((p,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:13, background:"rgba(255,255,255,.06)", borderRadius:13, padding:"13px 16px", border:"1px solid rgba(185,134,74,.15)" }}>
              <div style={{ flexShrink:0 }}>{p.icon}</div>
              <span style={{ fontSize:13, color:"rgba(253,252,248,.75)", fontWeight:500 }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA bas */}
      <div style={{ padding:"0 24px 44px" }}>
        <button onClick={onDone} style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:700, fontSize:17, background:`linear-gradient(135deg,${C.goldB},#B8864A)`, color:C.white, fontFamily:SERIF, letterSpacing:".2px", boxShadow:"0 4px 24px rgba(185,134,74,.4)" }}>
          ✦ Découvrir Savvy
        </button>
        <p style={{ textAlign:"center", fontSize:11, color:"rgba(253,252,248,.25)", margin:"14px 0 0", lineHeight:1.6 }}>
          En continuant, tu acceptes nos <span style={{ color:"rgba(253,252,248,.4)" }}>Conditions d'utilisation</span>
        </p>
      </div>
    </div>
  );
}

// ─── SplashScreen ──────────────────────────────────────────────────────────────
function SplashScreen({ onSkip, onSuccess, onRegister }) {
  const [mode, setMode] = useState("choice"); // choice | phone | otp | email_otp
  const [contact, setContact] = useState("");
  const [isPhone, setIsPhone] = useState(true);
  const [socialLoading, setSocialLoading] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const r0=useRef(),r1=useRef(),r2=useRef(),r3=useRef(),r4=useRef(),r5=useRef();
  const refs=[r0,r1,r2,r3,r4,r5];

  const handleOtp=(val,i)=>{
    const n=[...otp]; n[i]=val.slice(-1); setOtp(n);
    if(val&&i<5) refs[i+1].current?.focus();
  };
  const handleKey=(e,i)=>{ if(e.key==="Backspace"&&!otp[i]&&i>0) refs[i-1].current?.focus(); };

  const loginSocial = async(provider) => {
    setSocialLoading(provider);
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
    } catch {
      setSocialLoading(null);
    }
  };

  const inp = {width:"100%",padding:"14px 16px",borderRadius:13,border:`1.5px solid ${C.border}`,fontSize:15,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:"rgba(255,255,255,.95)"};

  // ── OTP screen ──────────────────────────────────────────────────────────────
  if (mode==="otp") return (
    <div style={{position:"fixed",inset:0,background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`,zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 28px"}}>
      <button onClick={()=>setMode("choice")} style={{position:"absolute",top:52,left:20,width:38,height:38,borderRadius:10,background:"rgba(253,252,248,.12)",border:"1px solid rgba(253,252,248,.2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{fontSize:48,marginBottom:16}}>📱</div>
        <h2 style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:SERIF,margin:"0 0 10px"}}>Code de vérification</h2>
        <p style={{fontSize:14,color:"rgba(253,252,248,.65)",lineHeight:1.6,margin:0}}>
          Code envoyé au<br/><b style={{color:C.goldB}}>{contact}</b>
        </p>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:24}}>
        {otp.map((v,i)=>(
          <input key={i} ref={refs[i]} value={v} onChange={e=>handleOtp(e.target.value,i)} onKeyDown={e=>handleKey(e,i)}
            maxLength={1} inputMode="numeric"
            style={{width:46,height:58,borderRadius:13,border:`2px solid ${v?"rgba(185,134,74,.8)":C.border}`,textAlign:"center",fontSize:24,fontWeight:700,fontFamily:SERIF,color:C.ink,outline:"none",background:v?C.goldL:C.white,transition:"all .15s"}}/>
        ))}
      </div>
      <p style={{fontSize:12,color:"rgba(253,252,248,.4)",marginBottom:20}}>Pour la démo : n\'importe quel code à 6 chiffres</p>
      <button onClick={async()=>{
        if(otp.join("").length<6){alert("Entre les 6 chiffres.");return;}
        setLoading(true);
        await new Promise(r=>setTimeout(r,1000));
        setLoading(false);
        onSuccess({name:contact,email:contact.includes("@")?contact:`${contact}@savvy.fr`,isExpert:false});
      }} disabled={loading} style={{width:"100%",padding:"15px",borderRadius:13,border:"none",cursor:loading?"wait":"pointer",fontWeight:700,fontSize:16,background:otp.join("").length===6?`linear-gradient(135deg,${C.gold},${C.goldB})`:C.cream3,color:otp.join("").length===6?C.white:C.muted,fontFamily:SERIF,boxShadow:otp.join("").length===6?`0 4px 20px rgba(185,134,74,.4)`:"none"}}>
        {loading?"Vérification…":"Confirmer →"}
      </button>
      <button onClick={()=>{ setOtp(["","","","","",""]); setFeedback("✓ Code renvoyé à "+contact); }} style={{marginTop:16,background:"none",border:"none",cursor:"pointer",color:"rgba(253,252,248,.5)",fontSize:13,fontFamily:"inherit"}}>
        Code non reçu ? Renvoyer
      </button>
    </div>
  );

  // ── Main splash ─────────────────────────────────────────────────────────────
  return (
    <div style={{position:"fixed",inset:0,background:`linear-gradient(165deg,${C.ink} 0%,#1A1512 100%)`,zIndex:200,display:"flex",flexDirection:"column",overflowY:"auto"}}>

      {/* X pour passer */}
      <div style={{padding:"52px 20px 0",display:"flex",justifyContent:"flex-end",flexShrink:0}}>
        <button onClick={onSkip} style={{width:36,height:36,borderRadius:10,background:"rgba(253,252,248,.1)",border:"1px solid rgba(253,252,248,.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(253,252,248,.6)",fontSize:18}}>×</button>
      </div>

      {/* Logo + tagline */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px 32px",textAlign:"center",marginTop:-20}}>
        <div style={{fontSize:44,fontWeight:900,fontFamily:SERIF,letterSpacing:"-2px",color:C.white,marginBottom:8}}>
          sav<em style={{color:C.goldB,fontStyle:"italic"}}>vy</em>
        </div>
        <p style={{fontSize:15,color:"rgba(253,252,248,.65)",margin:"0 0 36px",lineHeight:1.6}}>
          Parlez avec quelqu\'un<br/>qui l\'a déjà fait.
        </p>

        {/* Toggle email / téléphone */}
        <div style={{display:"flex",background:"rgba(255,255,255,.08)",borderRadius:11,padding:3,marginBottom:14,gap:3,width:"100%",maxWidth:320}}>
          {[{v:true,l:"📱 Téléphone"},{v:false,l:"✉️ Email"}].map(t=>(
            <button key={String(t.v)} onClick={()=>{setIsPhone(t.v);setContact("");}}
              style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",transition:"all .2s",
                background:isPhone===t.v?C.white:"transparent",
                color:isPhone===t.v?C.ink:"rgba(253,252,248,.55)",
                boxShadow:isPhone===t.v?`0 1px 6px rgba(0,0,0,.15)`:"none"}}>
              {t.l}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{width:"100%",maxWidth:320,marginBottom:12,position:"relative"}}>
          {isPhone && <div style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,fontWeight:600,color:C.soft,display:"flex",alignItems:"center",gap:6}}>🇫🇷 +33 <span style={{color:C.border}}>|</span></div>}
          <input value={contact} onChange={e=>setContact(e.target.value)} type={isPhone?"tel":"email"}
            placeholder={isPhone?"06 12 34 56 78":"camille@exemple.com"}
            style={{...inp,paddingLeft:isPhone?90:16}}
            onKeyDown={e=>e.key==="Enter"&&contact.length>4&&setMode("otp")}/>
        </div>

        {/* Continuer */}
        <button onClick={()=>{if(contact.length<6){alert(isPhone?"Numéro invalide":"Email invalide");return;}setMode("otp");}}
          style={{width:"100%",maxWidth:320,padding:"15px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:16,background:`linear-gradient(135deg,${C.gold},${C.goldB})`,color:C.white,fontFamily:SERIF,marginBottom:18,boxShadow:`0 4px 20px rgba(185,134,74,.4)`}}>
          Continuer →
        </button>

        {/* Divider */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,width:"100%",maxWidth:320}}>
          <div style={{flex:1,height:1,background:"rgba(255,255,255,.15)"}}/><span style={{fontSize:12,color:"rgba(253,252,248,.35)"}}>ou</span><div style={{flex:1,height:1,background:"rgba(255,255,255,.15)"}}/>
        </div>

        {/* Social buttons */}
        <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:320,marginBottom:20}}>
          <button onClick={()=>loginSocial("google")} disabled={!!socialLoading}
            style={{width:"100%",padding:"13px",borderRadius:13,border:"1.5px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.95)",color:C.ink,fontSize:14,fontWeight:600,cursor:socialLoading?"wait":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:socialLoading&&socialLoading!=="google"?.5:1}}>
            {socialLoading==="google"
              ? <><div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${C.border}`,borderTopColor:C.ink,animation:"spin .7s linear infinite"}}/> Connexion…</>
              : <><svg width={20} height={20} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continuer avec Google</>}
          </button>
          <button onClick={()=>loginSocial("apple")} disabled={!!socialLoading}
            style={{width:"100%",padding:"13px",borderRadius:13,border:"1.5px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.95)",color:C.ink,fontSize:14,fontWeight:600,cursor:socialLoading?"wait":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:socialLoading&&socialLoading!=="apple"?.5:1}}>
            {socialLoading==="apple"
              ? <><div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${C.border}`,borderTopColor:C.ink,animation:"spin .7s linear infinite"}}/> Connexion…</>
              : <><svg width={18} height={18} viewBox="0 0 24 24" fill={C.ink}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> Continuer avec Apple</>}
          </button>
        </div>

        {/* Première fois — inscription */}
        <div style={{marginBottom:14,textAlign:"center"}}>
          <span style={{fontSize:13,color:"rgba(253,252,248,.5)"}}>Première fois chez Savvy ? </span>
          <button onClick={onRegister} style={{background:"none",border:"none",cursor:"pointer",color:C.goldB,fontSize:13,fontWeight:700,fontFamily:"inherit",textDecoration:"underline",padding:0}}>
            Crée ton compte ✦
          </button>
        </div>

        {/* Explorer sans compte */}
        <button onClick={onSkip} style={{marginBottom:16,background:"none",border:"none",cursor:"pointer",color:"rgba(253,252,248,.45)",fontSize:13,fontFamily:"inherit",textDecoration:"underline"}}>
          Explorer sans compte →
        </button>

        {/* Mode démo */}
        <div style={{width:"100%",maxWidth:320,borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:16,marginBottom:8}}>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(253,252,248,.4)",textTransform:"uppercase",letterSpacing:.8,textAlign:"center",marginBottom:12}}>
            ✦ Mode démo — tester l\'app
          </div>
          <div style={{display:"flex",gap:9}}>
            {Object.values(DEMO_USERS).map(u=>(
              <button key={u.email} onClick={()=>onSuccess({...u})}
                style={{flex:1,padding:"12px 8px",borderRadius:14,border:"1.5px solid rgba(255,255,255,.15)",background:"rgba(255,255,255,.07)",cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .2s"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:u.avatar_bg||C.goldL,color:u.avatar_color||C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,margin:"0 auto 8px",border:`1.5px solid ${u.avatar_color||C.gold}30`,fontFamily:SERIF}}>
                  {u.initials}
                </div>
                <div style={{fontSize:12,fontWeight:700,color:"white",marginBottom:2}}>{u.name.split(" ")[0]}</div>
                <div style={{fontSize:9,color:"rgba(253,252,248,.55)",lineHeight:1.3,textAlign:"center"}}>{u.isExpert?"Expert ✦":"Client ✦"}</div>
              </button>
            ))}
          </div>
          <div style={{fontSize:10,color:"rgba(253,252,248,.25)",textAlign:"center",marginTop:10}}>
            Aucun compte créé — données de démonstration
          </div>
        </div>

        <p style={{fontSize:11,color:"rgba(253,252,248,.25)",textAlign:"center",lineHeight:1.6,maxWidth:280,marginTop:8}}>
          En continuant, tu acceptes les{" "}
          <span style={{color:"rgba(253,252,248,.4)"}}>Conditions d\'utilisation</span>{" "}et la{" "}
          <span style={{color:"rgba(253,252,248,.4)"}}>Politique de confidentialité</span> de Savvy.
        </p>
      </div>
    </div>
  );
}

// ─── HowItWorksScreen ──────────────────────────────────────────────────────────
function HowItWorksScreen({ onClose, onExplore }) {
  const steps = [
    {
      num:"01", icon:"🔍", color:C.gold, bg:C.goldL, border:C.goldB,
      title:"Trouve ton expert",
      sub:"Pas un consultant en costume — quelqu\'un qui l\'a vraiment vécu.",
      details:[
        "Parcours les profils par thème : Voyages, Cuisine, Business, Industrie",
        "Lis les preuves d\'expérience réelles vérifiées par Savvy",
        "Consulte les avis de clients qui ont déjà réservé",
        "Compare les formats et les tarifs — tu décides",
      ],
    },
    {
      num:"02", icon:"💬", color:"#0F2744", bg:"#DBEAFE", border:"#BFDBFE",
      title:"Pose une question d\'abord",
      sub:"Gratuit. Avant de payer quoi que ce soit.",
      details:[
        "Écris directement à l\'expert depuis son profil",
        "Vérifie que c\'est la bonne personne pour ton besoin",
        "Pas de réponse en 48h ? On t\'aide à trouver une alternative",
        "Aucun engagement jusqu\'à la réservation",
      ],
    },
    {
      num:"03", icon:"📅", color:"#065F46", bg:"#D1FAE5", border:"#6EE7B7",
      title:"Réserve ta session",
      sub:"Simple, sécurisé, garanti.",
      details:[
        "Choisis le format : vidéo, audio, document ou accompagnement",
        "Sélectionne une date et un créneau disponible",
        "Paiement sécurisé — tu n\'es débité qu\'au moment de la réservation",
        "L\'expert reçoit 80% · Savvy garde 20% pour la plateforme",
      ],
    },
    {
      num:"04", icon:"✦", color:C.gold, bg:C.goldL, border:C.goldB,
      title:"Reçois ton conseil",
      sub:"De l\'expérience réelle. Pas de la théorie.",
      details:[
        "La session se déroule selon le format choisi",
        "Des conseils concrets basés sur du vécu, pas des livres",
        "Tu valides la livraison — l\'expert est payé seulement ensuite",
        "Laisse un avis pour aider la communauté",
      ],
    },
  ];

  const guarantees = [
    { icon:"🔒", title:"Paiement sécurisé", sub:"Données chiffrées SSL · Jamais stockées" },
    { icon:"↩️", title:"Remboursement garanti", sub:"Si la session n\'a pas lieu ou ne correspond pas" },
    { icon:"📋", title:"NDA automatique", sub:"Données protégées avec les experts qui l\'exigent" },
    { icon:"✅", title:"Experts vérifiés", sub:"Chaque profil validé par l\'équipe Savvy avant publication" },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:C.cream, zIndex:200, overflowY:"auto" }}>
      {/* Header */}
      <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"52px 20px 32px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(185,134,74,.06)" }}/>
        <button onClick={onClose} style={{ position:"absolute", top:52, left:18, width:36, height:36, borderRadius:10, background:"rgba(253,252,248,.12)", border:"1px solid rgba(253,252,248,.2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ position:"relative", textAlign:"center" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>✦</div>
          <h1 style={{ fontSize:24, fontWeight:700, color:C.white, fontFamily:SERIF, margin:"0 0 10px", letterSpacing:"-.3px" }}>
            Comment fonctionne Savvy ?
          </h1>
          <p style={{ fontSize:13, color:"rgba(253,252,248,.65)", lineHeight:1.7, margin:0 }}>
            De la recherche d\'un expert jusqu\'au conseil reçu — en 4 étapes simples.
          </p>
        </div>
      </div>

      <div style={{ padding:"24px 18px 0" }}>
        {/* Steps */}
        {steps.map((s, i) => (
          <div key={i} style={{ marginBottom:16 }}>
            <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:`0 2px 12px ${C.sh}` }}>
              {/* Step header */}
              <div style={{ background:s.bg, padding:"16px 18px", borderBottom:`1px solid ${s.border}`, display:"flex", gap:14, alignItems:"center" }}>
                <div style={{ width:48, height:48, borderRadius:14, background:"rgba(255,255,255,.6)", border:`1.5px solid ${s.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
                  {s.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:11, fontWeight:800, color:s.color, letterSpacing:1 }}>{s.num}</span>
                    <div style={{ height:1, flex:1, background:`${s.color}30` }}/>
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, lineHeight:1.2 }}>{s.title}</div>
                  <div style={{ fontSize:12, color:C.muted, marginTop:3, fontStyle:"italic" }}>{s.sub}</div>
                </div>
              </div>
              {/* Step details */}
              <div style={{ padding:"14px 18px" }}>
                {s.details.map((d, j) => (
                  <div key={j} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:j<s.details.length-1?10:0 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:s.color, flexShrink:0, marginTop:6 }}/>
                    <span style={{ fontSize:13, color:C.soft, lineHeight:1.6 }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Connector */}
            {i < steps.length-1 && (
              <div style={{ display:"flex", justifyContent:"center", padding:"4px 0" }}>
                <div style={{ width:2, height:20, background:C.cream3, borderRadius:1 }}/>
              </div>
            )}
          </div>
        ))}

        {/* Garanties */}
        <div style={{ marginTop:8, marginBottom:20 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:13, textAlign:"center" }}>
            Savvy te protège à chaque étape
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
            {guarantees.map((g,i) => (
              <div key={i} style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"13px 13px", display:"flex", flexDirection:"column", gap:6 }}>
                <span style={{ fontSize:22 }}>{g.icon}</span>
                <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{g.title}</div>
                <div style={{ fontSize:11, color:C.muted, lineHeight:1.5 }}>{g.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, paddingBottom:36 }}>
          <button onClick={onExplore} style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:C.ink, color:C.white, fontFamily:SERIF, letterSpacing:".2px" }}>
            Trouver mon expert →
          </button>
          <button onClick={onClose} style={{ width:"100%", padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:14, background:C.white, color:C.ink, fontFamily:"inherit" }}>
            Retour au profil
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Generators ────────────────────────────────────────────────────────────
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

// ─── HomeScreen ───────────────────────────────────────────────────────────────
function HomeScreen({ onExpert, onSearch, onCat, onMatch, isLoggedIn, authUser, isExpert, experts=[] }) {
  const top = [...experts].sort((a,b) => b.rating - a.rating).slice(0,5);
  const prenom = authUser?.name?.split(" ")[0] || authUser?.email?.split("@")[0] || null;

  return <div style={{ flex:1, overflowY:"auto", paddingBottom:72, background:C.cream2 }}>

    {/* ── Header avec saludo ── */}
    <div style={{ padding:"28px 20px 20px", background:C.cream2 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          {prenom && isLoggedIn
            ? <div style={{ fontSize:14, color:C.muted, marginBottom:4 }}><span style={{ fontWeight:700, color:C.ink }}>{prenom}</span>, nous sommes ravis de vous voir.</div>
            : <div style={{ fontSize:14, color:C.muted, marginBottom:4 }}>Bienvenue sur Savvy</div>
          }
          <h1 style={{ fontSize:26, fontWeight:700, color:C.ink, lineHeight:1.2, margin:0, fontFamily:SERIF, letterSpacing:"-.5px" }}>
            Parlez avec quelqu'un<br/><em style={{ color:C.gold, fontStyle:"italic" }}>qui l'a déjà fait.</em>
          </h1>
        </div>
      </div>

      {/* Barre de recherche */}
      <div onClick={() => onSearch("")} style={{ display:"flex", alignItems:"center", gap:10, background:C.white, borderRadius:14, padding:"13px 16px", cursor:"pointer", border:`1.5px solid ${C.border}`, marginBottom:16 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
        <span style={{ fontSize:13, color:C.faint }}>Rechercher un expert, un domaine…</span>
      </div>
    </div>

    {/* ── Hero banner vert ── */}
    <div style={{ margin:"0 16px 20px" }}>
      <div onClick={onMatch} style={{ borderRadius:20, overflow:"hidden", cursor:"pointer", background:`linear-gradient(135deg, ${C.ink} 0%, #2D5A3D 60%, ${C.gold} 100%)`, padding:"24px 22px", position:"relative", minHeight:140 }}>
        <div style={{ position:"absolute", top:0, right:0, bottom:0, width:"40%", background:"radial-gradient(ellipse at right center, rgba(91,140,106,.4) 0%, transparent 70%)", pointerEvents:"none" }}/>
        <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:1.2, marginBottom:10 }}>Savvy · Match IA</div>
        <div style={{ fontSize:22, fontWeight:700, color:C.white, fontFamily:SERIF, lineHeight:1.3, marginBottom:8, letterSpacing:"-.3px" }}>
          Trouvez votre expert<br/>en moins d'1 minute
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,.7)", marginBottom:18, lineHeight:1.5 }}>Simple, rapide · Conseillers vérifiés · Dès 5€</div>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,.15)", backdropFilter:"blur(8px)", borderRadius:10, padding:"9px 16px", border:"1px solid rgba(255,255,255,.2)" }}>
          <span style={{ fontSize:13, fontWeight:700, color:C.white }}>Trouver mon expert</span>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>

    {/* ── Accès rapide ── */}
    <div style={{ padding:"0 16px", marginBottom:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
        {[
          { icon:<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>, label:"Chercher",  action:()=>onSearch("") },
          { icon:<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx={9} cy={7} r={4}/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label:"Experts",   action:()=>onSearch("") },
          { icon:<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, label:"Sessions",  action:()=>onMatch() },
          { icon:<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label:"Favoris",   action:()=>onSearch("") },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"14px 6px 12px", background:C.white, borderRadius:14, border:`1px solid ${C.border}`, cursor:"pointer", fontFamily:"inherit" }}>
            <div style={{ color:C.gold }}>{item.icon}</div>
            <span style={{ fontSize:10, fontWeight:600, color:C.ink }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>

    {/* ── Stats ── */}
    <div style={{ margin:"0 16px 24px", background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:"16px 18px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr" }}>
      {[["✦","Vérifiés"],["< 24h","Réponse"],["100%","Sécurisé"],["Dès 5€","Session"]].map(([n,l]) =>
        <div key={l} style={{ textAlign:"center" }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{n}</div>
          <div style={{ fontSize:9, color:C.muted, marginTop:2, lineHeight:1.3 }}>{l}</div>
        </div>
      )}
    </div>

    {/* ── Explorer par thème ── */}
    <div style={{ padding:"0 16px" }}>
      <h2 style={{ fontSize:18, fontWeight:700, color:C.ink, margin:"0 0 12px", fontFamily:SERIF }}>Explorer par thème</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
        {CATS.map(cat =>
          <button key={cat.id} onClick={() => onCat(cat.id)} style={{ display:"flex", alignItems:"center", gap:11, padding:"14px 15px", borderRadius:15, border:`1px solid ${C.border}`, background:C.white, cursor:"pointer", textAlign:"left", fontFamily:"inherit" }}>
            <div style={{ width:40, height:40, borderRadius:12, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{cat.icon}</div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:C.ink, lineHeight:1.3 }}>{cat.label}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.3 }}>{cat.sub}</div>
            </div>
          </button>
        )}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14 }}>
        <h2 style={{ fontSize:18, fontWeight:700, color:C.ink, margin:0, fontFamily:SERIF }}>Meilleures valorations</h2>
        <button onClick={() => onSearch("")} style={{ fontSize:12, color:C.gold, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Voir tout →</button>
      </div>
      {top.map(e => <ExpertCard key={e.id} e={e} onClick={() => onExpert(e)}/>)}
    </div>
  </div>;
}

// ─── MatchScreen 2.0 ──────────────────────────────────────────────────────────
function MatchScreen({ onExpert, onBrowseAll, experts=[] }) {
  const [step, setStep]       = useState(0); // 0=situation 1=besoin 2=quand 3=results
  const [situation, setSituation] = useState(null);
  const [besoin, setBesoin]       = useState(null);
  const [quand, setQuand]         = useState(null);
  const [animDir, setAnimDir]     = useState("forward");

  const go = (next) => { setAnimDir("forward"); setTimeout(()=>setStep(next),0); };
  const back = ()  => { setAnimDir("back");    setTimeout(()=>setStep(s=>s-1),0); };

  // ── Step 0 — Situation ──────────────────────────────────────────
  const situations = CATS.map(c => ({ id:c.id, icon:c.icon, label:c.label, color:c.color, bg:c.bg||C.cream2 }));

  // ── Step 1 — Ce que tu cherches ─────────────────────────────────
  const besoins = [
    { id:"reponse",  icon:"🎯", label:"Une réponse concrète",      sub:"J'ai une question précise, je veux une réponse directe" },
    { id:"plan",     icon:"🗺️", label:"Un plan d'action",          sub:"Je veux des étapes claires pour avancer" },
    { id:"vecu",     icon:"🤝", label:"Quelqu'un qui l'a vécu",    sub:"Parler à quelqu'un qui a traversé la même chose" },
    { id:"explorer", icon:"💭", label:"Je ne sais pas encore",     sub:"Je veux explorer mes options avec un expert" },
  ];

  // ── Step 2 — Quand ──────────────────────────────────────────────
  const quands = [
    { id:"auj",      icon:"⚡", label:"Aujourd'hui",        sub:"Je suis disponible maintenant ou ce soir" },
    { id:"semaine",  icon:"📅", label:"Cette semaine",      sub:"Dans les prochains jours" },
    { id:"flexible", icon:"🗓️", label:"Je suis flexible",  sub:"Peu importe, je m'adapte" },
  ];

  // ── Step 3 — Résultats ───────────────────────────────────────────
  const getMatches = () => {
    // Filtre par catégorie: d'abord par champ `cat`, sinon par CAT_MAP (données démo)
    let pool = experts;
    if (situation) {
      const byCat = experts.filter(e => e.cat === situation);
      const byIds = experts.filter(e => (CAT_MAP[situation]||[]).includes(e.id));
      pool = byCat.length > 0 ? byCat : byIds.length > 0 ? byIds : experts;
    }
    // Score & sort
    const scored = pool.map(e => ({
      ...e,
      score: (e.rating||4) * 10
        + (besoin==="reponse" ? (e.reviews||0)*0.01 : 0)
        + (besoin==="vecu"    ? (e.reviews||0)*0.05 : 0)
        + (quand==="auj"      ? (e.available ? 20 : 0) : 0)
        + Math.random()*2
    }));
    return scored.sort((a,b)=>b.score-a.score).slice(0,3);
  };

  const matches = step===3 ? getMatches() : [];

  const Progress = () => (
    <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:24}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{height:3,borderRadius:2,transition:"all .3s",
          width: i<step ? 28 : i===step ? 40 : 20,
          background: i<step ? C.ink : i===step ? C.gold : C.border
        }}/>
      ))}
    </div>
  );

  const StepLabel = ({n,title,sub}) => (
    <div style={{marginBottom:22,textAlign:"center"}}>
      <div style={{fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:1.2,marginBottom:6}}>
        Étape {n} sur 3
      </div>
      <div style={{fontSize:22,fontWeight:700,color:C.ink,fontFamily:SERIF,lineHeight:1.25,marginBottom:6}}>{title}</div>
      {sub && <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>{sub}</div>}
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",paddingBottom:80,background:C.cream}}>
      {/* Header */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
        {step>0 && step<3 && (
          <button onClick={back} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        )}
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF}}>
            {step===0?"Trouver votre expert":step===1?"Ce que vous cherchez":step===2?"Votre disponibilité":"Vos experts"}
          </div>
        </div>
        <button onClick={onBrowseAll} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:C.muted,fontWeight:600,fontFamily:"inherit",flexShrink:0}}>
          Voir tout
        </button>
      </div>

      <div style={{padding:"24px 18px 0"}}>
        {/* ── STEP 0 — Situation ── */}
        {step===0 && <>
          <Progress/>
          <StepLabel n={1} title="Quelle est votre situation ?" sub="Choisissez le thème qui vous correspond le mieux"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {situations.map(s=>(
              <button key={s.id} onClick={()=>{ setSituation(s.id); go(1); }}
                style={{padding:"16px 12px",borderRadius:16,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",textAlign:"center",fontFamily:"inherit",boxShadow:`0 2px 8px ${C.sh}`,transition:"all .2s",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <div style={{width:48,height:48,borderRadius:14,background:s.bg||C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{s.icon}</div>
                <span style={{fontSize:12,fontWeight:700,color:C.ink,lineHeight:1.2}}>{s.label}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>{ setSituation(null); go(1); }} style={{width:"100%",marginTop:12,padding:"12px",borderRadius:13,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
            Je ne sais pas encore →
          </button>
        </>}

        {/* ── STEP 1 — Besoin ── */}
        {step===1 && <>
          <Progress/>
          <StepLabel n={2} title="Qu'est-ce que vous cherchez ?" sub="Pour qu'on trouve le profil qui correspond vraiment"/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {besoins.map(b=>(
              <button key={b.id} onClick={()=>{ setBesoin(b.id); go(2); }}
                style={{display:"flex",alignItems:"center",gap:14,padding:"16px 16px",borderRadius:16,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",textAlign:"left",fontFamily:"inherit",boxShadow:`0 2px 8px ${C.sh}`,transition:"all .2s"}}>
                <div style={{width:46,height:46,borderRadius:14,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{b.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:3}}>{b.label}</div>
                  <div style={{fontSize:12,color:C.muted,lineHeight:1.4}}>{b.sub}</div>
                </div>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </>}

        {/* ── STEP 2 — Quand ── */}
        {step===2 && <>
          <Progress/>
          <StepLabel n={3} title="Quand êtes-vous disponible ?" sub="On adapte la sélection à votre agenda"/>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {quands.map(q=>(
              <button key={q.id} onClick={()=>{ setQuand(q.id); go(3); }}
                style={{display:"flex",alignItems:"center",gap:14,padding:"18px 16px",borderRadius:16,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",textAlign:"left",fontFamily:"inherit",boxShadow:`0 2px 8px ${C.sh}`,transition:"all .2s"}}>
                <div style={{width:46,height:46,borderRadius:14,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{q.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:3}}>{q.label}</div>
                  <div style={{fontSize:12,color:C.muted}}>{q.sub}</div>
                </div>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ))}
          </div>
        </>}

        {/* ── STEP 3 — Résultats ── */}
        {step===3 && <>
          {/* Résumé du match */}
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:20,padding:"20px 18px",marginBottom:20,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(185,134,74,.08)"}}/>
            <div style={{fontSize:11,color:C.goldB,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>✦ Résultat de votre match</div>
            <div style={{fontSize:22,fontWeight:700,color:C.white,fontFamily:SERIF,lineHeight:1.2,marginBottom:10}}>
              Nous avons trouvé<br/><em style={{color:C.goldB}}>3 experts pour vous</em>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {situation && <span style={{background:"rgba(255,255,255,.1)",color:"rgba(253,252,248,.8)",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:600}}>
                {situations.find(s=>s.id===situation)?.icon} {situations.find(s=>s.id===situation)?.label}
              </span>}
              {besoin && <span style={{background:"rgba(255,255,255,.1)",color:"rgba(253,252,248,.8)",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:600}}>
                {besoins.find(b=>b.id===besoin)?.icon} {besoins.find(b=>b.id===besoin)?.label}
              </span>}
              {quand && <span style={{background:"rgba(255,255,255,.1)",color:"rgba(253,252,248,.8)",borderRadius:20,padding:"4px 11px",fontSize:11,fontWeight:600}}>
                {quands.find(q=>q.id===quand)?.icon} {quands.find(q=>q.id===quand)?.label}
              </span>}
            </div>
          </div>

          {/* Les 3 experts matchés */}
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            {matches.map((e,i)=>(
              <div key={e.id} onClick={()=>onExpert(e)}
                style={{background:C.white,borderRadius:18,border:`1.5px solid ${i===0?C.gold:C.border}`,padding:"16px",cursor:"pointer",boxShadow:i===0?`0 4px 20px rgba(185,134,74,.18)`:`0 2px 8px ${C.sh}`,position:"relative",overflow:"hidden",transition:"all .2s"}}>
                {i===0 && (
                  <div style={{position:"absolute",top:12,right:12,background:`linear-gradient(135deg,${C.gold},#D4A853)`,color:C.white,borderRadius:20,padding:"3px 10px",fontSize:10,fontWeight:700}}>
                    ✦ Meilleur match
                  </div>
                )}
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <Av e={e} size={54}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:2,paddingRight:i===0?80:0}}>{e.name}</div>
                    <div style={{fontSize:12,color:C.muted,marginBottom:6}}>{e.role}</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <div style={{display:"flex",alignItems:"center",gap:3}}>
                        <svg width={12} height={12} viewBox="0 0 12 12" fill={C.gold}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>
                        <span style={{fontSize:12,fontWeight:700,color:C.gold}}>{e.rating}</span>
                      </div>
                      <span style={{fontSize:11,color:C.muted}}>·</span>
                      <span style={{fontSize:11,color:C.muted}}>{e.sessions||e.reviews||0} sessions</span>
                      {e.verified && <span style={{fontSize:10,background:"#D1FAE5",color:"#065F46",borderRadius:20,padding:"2px 7px",fontWeight:700}}>✓ Vérifié</span>}
                    </div>
                  </div>
                </div>
                <div style={{marginTop:10,fontSize:12,color:C.soft,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                  "{e.tagline}"
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.ink}}>À partir de <span style={{fontSize:17,fontFamily:SERIF,color:C.gold}}>{e.phases?.[0]?.price||49}€</span></div>
                  <div style={{padding:"8px 16px",borderRadius:10,background:C.ink,color:C.white,fontSize:12,fontWeight:700,fontFamily:SERIF}}>Voir le profil →</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommencer ou voir tout */}
          <div style={{display:"flex",gap:10,paddingBottom:12}}>
            <button onClick={()=>setStep(0)} style={{flex:1,padding:"12px",borderRadius:13,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              ↩ Recommencer
            </button>
            <button onClick={onBrowseAll} style={{flex:1,padding:"12px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>
              Voir tous →
            </button>
          </div>
        </>}
      </div>
    </div>
  );
}

// ─── SearchScreen ─────────────────────────────────────────────────────────────
function SearchScreen({ initQ="", initCat=null, onExpert, onBack, experts=[], expertsLoaded=true }) {
  const [q, setQ] = useState(initQ);
  const [activeCat, setActiveCat] = useState(initCat);
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [pilier, setPilier] = useState("tous");
  const [filters, setFilters] = useState({ prix:null, langue:null, format:null, dispo:null, note:null });
  const [showFilters, setShowFilters] = useState(false);
  const catBarRef = useRef(null);
  const scrollCats = (dir) => { if(catBarRef.current) catBarRef.current.scrollBy({left: dir*160, behavior:"smooth"}); };
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("savvy_search_history")||"[]"); } catch { return []; }
  });

  const saveSearch = (term) => {
    if (!term.trim() || term.length < 2) return;
    const updated = [term, ...history.filter(h=>h!==term)].slice(0,6);
    setHistory(updated);
    try { localStorage.setItem("savvy_search_history", JSON.stringify(updated)); } catch {}
  };

  const toggleFilter = (key, val) => setFilters(f => ({...f, [key]: f[key]===val?null:val}));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Filter experts
  let filtered = [...experts];
  if (activeCat) { const ids = CAT_MAP[activeCat]||[]; filtered = filtered.filter(e=>ids.includes(e.id)); }
  if (pilier==="top")      filtered = [...filtered].sort((a,b)=>b.rating-a.rating);
  if (pilier==="verifies") filtered = filtered.filter(e=>e.verified);
  if (q.trim().length>1) {
    const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
    const words = norm(q).trim().split(/\s+/).filter(Boolean);
    filtered = filtered.filter(e => {
      const hay = norm(e.name+" "+e.role+" "+e.tagline+" "+(e.location||"")+" "+(e.bio||"")+" "+(e.creds||[]).join(" "));
      return words.every(w => hay.includes(w));
    });
  }
  if (filters.prix==="0-50")   filtered = filtered.filter(e=>(e.phases||[])[0]?.price&&e.phases[0].price<=50);
  if (filters.prix==="50-200") filtered = filtered.filter(e=>(e.phases||[])[0]?.price&&e.phases[0].price>50&&e.phases[0].price<=200);
  if (filters.prix==="200+")   filtered = filtered.filter(e=>!(e.phases||[])[0]?.price||e.phases[0].price>200);
  if (filters.langue) filtered = filtered.filter(e=>(e.langs||[]).includes(filters.langue));
  if (filters.note==="4")   filtered = filtered.filter(e=>e.rating>=4);
  if (filters.note==="4.5") filtered = filtered.filter(e=>e.rating>=4.5);
  if (filters.note==="5")   filtered = filtered.filter(e=>e.rating>=4.9);

  const catObj = activeCat ? CATS.find(c=>c.id===activeCat) : null;
  const subcats = activeCat ? (SUBCATS[activeCat]||[]) : [];

  const POPULAR = [
    "Trouver un appart sans garant",
    "Lancer une activité en France",
    "Changer de carrière à 35 ans",
    "Exporter vers la Colombie",
    "Réussir son macaron",
    "Optimiser un laboratoire",
  ];

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:72, background:C.cream }}>

      {/* ── SEARCH BAR ───────────────────────────────────────────────── */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:20, boxShadow:`0 2px 12px ${C.sh}` }}>
        <div style={{ padding:"12px 16px 0" }}>
          {!q && !activeCat && (
            <div style={{ fontSize:12, color:C.muted, fontFamily:SERIF, fontStyle:"italic", marginBottom:8, textAlign:"center" }}>
              ✦ Parlez avec quelqu'un qui l'a déjà fait.
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:9, background:C.cream2, borderRadius:13, padding:"11px 14px", border:`1.5px solid ${activeCat?catObj?.color:C.border}`, marginBottom:12, transition:"border-color .2s" }}>
            {onBack && <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", color:C.muted, flexShrink:0 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="m15 18-6-6 6-6"/></svg>
            </button>}
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
            <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Quel problème voulez-vous résoudre ?" style={{ border:"none", background:"none", fontSize:14, color:C.ink, flex:1, outline:"none", fontFamily:"inherit" }}/>
            {q && <button onClick={()=>setQ("")} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:20, padding:0, lineHeight:1 }}>×</button>}
          </div>
        </div>

        {/* ── NIVEAU 1 — Catégories principales ── */}
        <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
          <button onClick={()=>scrollCats(-1)} style={{ position:"absolute", left:0, zIndex:2, width:28, height:28, borderRadius:"50%", background:C.white, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 1px 6px ${C.sh}`, flexShrink:0 }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.5}><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        <div ref={catBarRef} style={{ display:"flex", gap:8, overflowX:"auto", WebkitOverflowScrolling:"touch", scrollbarWidth:"none", msOverflowStyle:"none", paddingLeft:36, paddingRight:36, paddingBottom:10, marginBottom:0, touchAction:"pan-x", flex:1 }}>
          <button onClick={()=>{setActiveCat(null);setActiveSubcat(null);}} style={{ flexShrink:0, padding:"8px 16px", borderRadius:20, border:`1.5px solid ${!activeCat?C.ink:C.border}`, background:!activeCat?C.ink:"transparent", color:!activeCat?C.white:C.muted, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", whiteSpace:"nowrap" }}>
            Tous
          </button>
          {CATS.map(cat => {
            const isActive = activeCat===cat.id;
            return (
              <button key={cat.id} onClick={()=>{ setActiveCat(isActive?null:cat.id); setActiveSubcat(null); }}
                style={{ flexShrink:0, padding:"8px 16px", borderRadius:20, border:`1.5px solid ${isActive?cat.color:C.border}`, background:isActive?cat.color:"transparent", color:isActive?C.white:C.ink, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:15 }}>{cat.icon}</span>
                {cat.label}
                {isActive && <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            );
          })}
        </div>
          <button onClick={()=>scrollCats(1)} style={{ position:"absolute", right:0, zIndex:2, width:28, height:28, borderRadius:"50%", background:C.white, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 1px 6px ${C.sh}`, flexShrink:0 }}>
            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* ── NIVEAU 2 — Sous-catégories (animées) ── */}
        {activeCat && subcats.length > 0 && (
          <div style={{ overflow:"visible", marginBottom:8 }}>
            <div style={{ display:"flex", gap:7, overflowX:"auto", scrollbarWidth:"none", WebkitOverflowScrolling:"touch", paddingBottom:6, marginLeft:-16, marginRight:-16, paddingLeft:16, paddingRight:16, touchAction:"pan-x" }}>
              {subcats.map(sc => {
                const isActive = activeSubcat===sc.id;
                return (
                  <button key={sc.id} onClick={()=>setActiveSubcat(isActive?null:sc.id)}
                    style={{ flexShrink:0, padding:"6px 13px", borderRadius:20, border:`1.5px solid ${isActive?catObj.color:C.border}`, background:isActive?catObj.bg:"transparent", color:isActive?catObj.color:C.muted, fontSize:11, fontWeight:isActive?700:500, cursor:"pointer", fontFamily:"inherit", transition:"all .2s", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:13 }}>{sc.icon}</span>
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PILIERS + FILTRES ── */}
        <div style={{ display:"flex", alignItems:"center", gap:0, borderTop:`1px solid ${C.borderF}` }}>
          {[{id:"tous",label:"Tous"},{id:"top",label:"⭐ Top notés"},{id:"verifies",label:"✓ Vérifiés"}].map(p=>(
            <button key={p.id} onClick={()=>setPilier(p.id)} style={{ flex:1, padding:"10px 4px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:pilier===p.id?700:400, color:pilier===p.id?C.ink:C.muted, borderBottom:pilier===p.id?`2.5px solid ${C.ink}`:"2px solid transparent", transition:"all .15s" }}>{p.label}</button>
          ))}
          <button onClick={()=>setShowFilters(v=>!v)} style={{ padding:"10px 12px", border:"none", background:"none", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:600, color:activeFilterCount>0?C.gold:C.muted, borderBottom:showFilters?`2.5px solid ${C.gold}`:"2px solid transparent", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={4} y1={6} x2={20} y2={6}/><line x1={8} y1={12} x2={16} y2={12}/><line x1={11} y1={18} x2={13} y2={18}/></svg>
            {activeFilterCount>0?` (${activeFilterCount})`:""} Filtres
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div style={{ background:C.cream2, padding:"12px 14px 14px", borderTop:`1px solid ${C.border}`, marginLeft:-16, marginRight:-16, paddingLeft:16, paddingRight:16 }}>
            {[
              {key:"prix",   label:"Prix",         options:[{v:"0-50",l:"< 50€"},{v:"50-200",l:"50–200€"},{v:"200+",l:"200€+"}]},
              {key:"langue", label:"Langue",        options:[{v:"FR",l:"FR"},{v:"EN",l:"EN"},{v:"ES",l:"ES"}]},
              {key:"format", label:"Format",        options:[{v:"video",l:"Vidéo"},{v:"appel",l:"Appel"},{v:"chat",l:"Chat"},{v:"doc",l:"Document"}]},
              {key:"dispo",  label:"Disponibilité", options:[{v:"auj",l:"Aujourd'hui"},{v:"sem",l:"Cette semaine"},{v:"mois",l:"Ce mois"}]},
              {key:"note",   label:"Note minimum",  options:[{v:"4",l:"4★+"},{v:"4.5",l:"4.5★+"},{v:"5",l:"5★ only"}]},
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:10 }}>
                <div style={{ fontSize:10, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:6 }}>{f.label}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {f.options.map(o=>(
                    <button key={o.v} onClick={()=>toggleFilter(f.key,o.v)} style={{ padding:"5px 12px", borderRadius:20, border:`1.5px solid ${filters[f.key]===o.v?C.gold:C.border}`, background:filters[f.key]===o.v?C.goldL:C.white, color:filters[f.key]===o.v?C.gold:C.soft, fontSize:11, fontWeight:filters[f.key]===o.v?700:400, cursor:"pointer", fontFamily:"inherit" }}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {activeFilterCount>0 && <button onClick={()=>setFilters({prix:null,langue:null,format:null,dispo:null,note:null})} style={{ fontSize:11, color:C.gold, fontWeight:700, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}>Effacer les filtres</button>}
          </div>
        )}
      </div>

      {/* ── CONTENU ─────────────────────────────────────────────────── */}
      <div style={{ padding:"16px 16px 0" }}>

        {/* Historique si pas de recherche */}
        {!q && !activeCat && (
          <>
            {history.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Recherches récentes</div>
                  <button onClick={()=>setHistory([])} style={{ background:"none", border:"none", cursor:"pointer", color:C.muted }}>
                    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {history.map((h,i)=>(
                    <button key={i} onClick={()=>setQ(h)} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${C.border}`, background:C.white, color:C.soft, fontSize:12, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
                      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><circle cx={12} cy={12} r={9}/><polyline points="12 7 12 12 15 15"/></svg>
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recherches populaires */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:10 }}>Recherches populaires</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {POPULAR.map(p=>(
                  <button key={p} onClick={()=>{setQ(p);saveSearch(p);}} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${C.border}`, background:C.white, color:C.soft, fontSize:12, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:6 }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Top catégories visuelles */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:12 }}>Top catégories</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {CATS.map(cat=>(
                  <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 15px", borderRadius:16, border:`1px solid ${C.border}`, background:C.white, cursor:"pointer", textAlign:"left", fontFamily:"inherit", boxShadow:`0 2px 8px ${C.sh}`, transition:"all .2s" }}>
                    <div style={{ width:46, height:46, borderRadius:13, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0, border:`1px solid ${cat.color}20` }}>{cat.icon}</div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:C.ink, lineHeight:1.3 }}>{cat.label}</div>
                      <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.3 }}>{cat.sub}</div>
                      {(()=>{ const ids=CAT_MAP[cat.id]||[]; const n=experts.filter(e=>ids.includes(e.id)).length; return n>0 ? <div style={{ fontSize:10, color:cat.color, marginTop:4, fontWeight:600 }}>{n} expert{n>1?"s":""}</div> : null; })()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Résultats */}
        {(q || activeCat) && (
          <>
            {/* Header résultats */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>
                  {activeSubcat ? subcats.find(s=>s.id===activeSubcat)?.label : catObj?.label || "Tous les experts"}
                </div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>
                  {filtered.length} conseiller{filtered.length>1?"s":""} disponible{filtered.length>1?"s":""}
                </div>
              </div>
              {activeCat && (
                <button onClick={()=>{setActiveCat(null);setActiveSubcat(null);}} style={{ fontSize:12, color:C.muted, background:C.cream3, border:"none", cursor:"pointer", fontFamily:"inherit", padding:"5px 11px", borderRadius:20, fontWeight:600 }}>
                  Tout voir ×
                </button>
              )}
            </div>

            {/* Expert cards */}
            {!expertsLoaded
              ? [1,2,3].map(i=><SkeletonCard key={i}/>)
              : filtered.length > 0
              ? filtered.map(e => (
                  <ExpertCard key={e.id} e={e} onClick={()=>{ if(q.trim().length>1) saveSearch(q); onExpert(e); }}/>
                ))
              : (
                <div style={{ textAlign:"center", padding:"60px 20px" }}>
                  <div style={{ width:64,height:64,borderRadius:20,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
                    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={1.5}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>
                    {experts.length===0 ? "Bientôt disponible" : "Aucun résultat"}
                  </div>
                  <div style={{ fontSize:13, color:C.muted, marginBottom:20, lineHeight:1.6 }}>
                    {experts.length===0 ? "Les premiers conseillers arrivent très bientôt." : q ? `Aucun conseiller pour "${q}"` : "Aucun conseiller dans cette catégorie pour le moment."}
                  </div>
                  {experts.length>0 && <button onClick={()=>{setQ("");setActiveCat(null);setActiveSubcat(null);}} style={{ padding:"11px 24px", borderRadius:12, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF }}>
                    Réinitialiser
                  </button>}
                </div>
              )
            }
          </>
        )}
      </div>
    </div>
  );
}

// ─── ExpertScreen ─────────────────────────────────────────────────────────────
const EXPERT_EXTRAS = {
  1: {
    resout:["Trouver l\'hôtel parfait selon ton budget réel","Éviter les pièges des réservations classiques","Planifier un séjour parisien sans mauvaises surprises","Découvrir les adresses locales inconnues des touristes"],
    reviews:[{name:"Sophie M.",stars:5,text:"Des recommandations ultra-précises. J\'ai économisé 80€ et j\'étais dans un hôtel bien mieux.",date:"Mars 2025"},{name:"Antoine D.",stars:5,text:"Pas des conseils génériques — de vrais bons plans vécus. 100% recommandé.",date:"Fév. 2025"},{name:"Laure B.",stars:5,text:"Réponse rapide, très pro. Mon séjour était parfait grâce à lui.",date:"Jan. 2025"}],
    preuves:["Visité +100 hôtels à Paris sur 15 ans","Guidé +300 touristes entre 2012 et 2018","Ex-guide certifié ANCT — expérience terrain réelle"],
  },
  2: {
    resout:["Réussir tes macarons du premier coup","Maîtriser les techniques pro de pâtisserie","Trouver les bons ingrédients au meilleur prix","Éviter les erreurs classiques qui font rater les recettes"],
    reviews:[{name:"Clara T.",stars:5,text:"Marie m\'a expliqué la technique en vidéo. J\'ai enfin réussi mes éclairs après des mois d\'échec.",date:"Avr. 2025"},{name:"Hugo R.",stars:5,text:"Session claire, pédagogique et utile. Les conseils sur les fournisseurs sont en or.",date:"Mars 2025"},{name:"Emma L.",stars:5,text:"Diplômée Ferrandi — ça se sent dans la qualité des conseils.",date:"Fév. 2025"}],
    preuves:["100+ recettes maîtrisées et testées en labo","Fournisseurs validés France, Belgique et Suisse","94 missions — 100% avis 5 étoiles"],
  },
  3: {
    resout:["Optimiser la production de ton laboratoire","Réduire les coûts sans sacrifier la qualité","Identifier les goulots d\'étranglement dans ton process","Augmenter ta productivité avec des outils simples"],
    reviews:[{name:"Bertrand K.",stars:5,text:"Patrick a audité mon labo en 2h. J\'ai appliqué 3 changements et gagné 30% de capacité.",date:"Mai 2025"},{name:"Isabelle F.",stars:5,text:"Très concret, très pro. Les outils Excel sont encore utilisés chaque jour.",date:"Avr. 2025"},{name:"Maxime G.",stars:5,text:"35 ans d\'expérience terrain — pas de blabla, que du concret.",date:"Mars 2025"}],
    preuves:["35 ans de terrain en laboratoires pâtisserie","61 audits réalisés en France","-28% de coûts de production en moyenne"],
  },
  4: {
    resout:["Structurer ta supply chain de zéro","Avoir de la visibilité sur tes marges et tes stocks","Former ton équipe aux bons process","Réduire les pertes et les commandes mal gérées"],
    reviews:[{name:"Pauline V.",stars:5,text:"Antoine m\'a mis en place un système Excel complet. Je comprends enfin où va mon argent.",date:"Avr. 2025"},{name:"Rémi C.",stars:5,text:"Très structuré. Le diagnostic m\'a ouvert les yeux sur 3 problèmes invisibles.",date:"Mars 2025"},{name:"Julie M.",stars:4,text:"Bon accompagnement. Quelques ajustements mais dans l\'ensemble excellent.",date:"Fév. 2025"}],
    preuves:["12 ans de supply chain en laboratoires artisanaux","8 PME structurées de 0 à 500k€ CA","Templates Excel prêts à l\'emploi livrés"],
  },
  5: {
    resout:["Importer en Colombie sans erreurs douanières","Trouver le bon transporteur au meilleur prix","Rédiger les documents douaniers correctement","Éviter les blocages et surcoûts en douane"],
    reviews:[{name:"Marc T.",stars:5,text:"Lucas m\'a économisé 2 semaines de galère et des centaines d\'euros en taxes inutiles.",date:"Mai 2025"},{name:"Sarah B.",stars:5,text:"Super réactif — 12 min de réponse comme promis ! Vraiment impressionnant.",date:"Avr. 2025"},{name:"Florian D.",stars:5,text:"Il connaît chaque règle, chaque formulaire. Une valeur inestimable.",date:"Mars 2025"}],
    preuves:["+200 expéditions gérées sans incident","10 ans de terrain France–Colombie","Réseau de transitaires fiables certifiés"],
  },
  6: {
    resout:["Identifier les risques de design avant fabrication","Éviter les non-conformités coûteuses sur chantier","Analyser les isométriques et spécifications","Valider les matériaux et normes ASME"],
    reviews:[{name:"Julien P.",stars:5,text:"Ahmed a détecté une erreur critique sur nos isométriques. Ça nous a évité un arrêt de chantier.",date:"Avr. 2025"},{name:"Nadia S.",stars:5,text:"28 ans chez Shell et BP — ça se sent immédiatement.",date:"Mars 2025"},{name:"Thomas R.",stars:5,text:"Rapport technique clair, précis et actionnable.",date:"Fév. 2025"}],
    preuves:["28 ans Shell, BP, Aramco — tuyauterie haute pression","Projets EPC +500 M€ supervisés","Certifié ASME B31.3 · CAESAR II · AutoPIPE"],
  },
  7: {
    resout:["Valider tes calculs avant de fabriquer","Modéliser tes pièces en 3D avec SolidWorks","Accompagner la fabrication jusqu\'au prototype","Éviter les erreurs de conception coûteuses"],
    reviews:[{name:"Pierre M.",stars:5,text:"Lars a modélisé notre prototype en 3 jours. Plans parfaits, zéro retouche.",date:"Mai 2025"},{name:"Anna K.",stars:5,text:"20 ans d\'expérience — très pédagogue et précis.",date:"Avr. 2025"},{name:"Louis B.",stars:5,text:"Excellent du début à la fin. Le pack complet en vaut vraiment la peine.",date:"Mars 2025"}],
    preuves:["20 ans de conception mécanique industrielle","12 startups hardware de l\'idée au prototype","Expert SolidWorks, ANSYS et analyse FEA"],
  },
};

const EXPERT_STYLE_TAGS = {
  vie:       ["Humain","Pratique","Chaleureux","Local"],
  tourisme:  ["Passionné","Précis","Authentique"],
  cuisine:   ["Pédagogue","Patient","Créatif"],
  business:  ["Direct","Structuré","Concret","Ambitieux"],
  industrie: ["Technique","Rigoureux","Fiable"],
  techno:    ["Curieux","Méthodique","Innovant"],
};

const EXPERT_FIRST_SESSION = {
  1: "Lors de notre première session, je vous demande quelques infos simples : votre budget, vos dates et vos préférences. En 20-30 minutes, vous repartez avec une recommandation concrète — l'hôtel exact, le quartier, le lien de réservation.",
  2: "Dès le début, on parle de votre recette, de ce qui a raté et pourquoi. Je vous montre les gestes clés en direct. Vous repartez avec la recette exacte et une liste de ce qu'il faut acheter.",
  3: "Je commence toujours par écouter comment vous travaillez aujourd'hui. En 1h, j'identifie les 3 problèmes qui coûtent le plus. Vous repartez avec un plan d'action concret et chiffré.",
  4: "Ensemble, on cartographie vos flux actuels — commandes, stocks, marges. Je vous montre exactement où vous perdez de l'argent et comment le récupérer.",
  5: "On commence par votre produit : est-il exportable ? Quelles taxes ? Je vous dis tout en clair, sans jargon. Vous repartez avec une feuille de route réaliste.",
  6: "Je révise vos plans et vos isométriques. Je vous dis directement ce qui est conforme et ce qui ne l'est pas — avec les références normatives exactes.",
  7: "On valide ensemble vos hypothèses de dimensionnement. Je vous montre ce qui tient mécaniquement et ce qui doit être revu, avant que ça coûte cher en fabrication.",
};

function ExpertScreen({ e, onBack, onBook, onMsg }) {
  const [openPhase, setOpenPhase] = useState(null);
  const _favKey = "savvy_favs";
  const _getFavs = () => { try { return JSON.parse(localStorage.getItem(_favKey)||"[]"); } catch { return []; } };
  const [isFav, setIsFav] = useState(() => _getFavs().some(f => f.id === e.id));
  const toggleFav = () => {
    const favs = _getFavs();
    const next = isFav ? favs.filter(f => f.id !== e.id) : [...favs, {id:e.id, name:e.name, initials:e.initials, bg:e.bg, color:e.color, role:e.role, rating:e.rating}];
    localStorage.setItem(_favKey, JSON.stringify(next));
    setIsFav(!isFav);
  };
  const [bioExpanded, setBioExpanded] = useState(false);
  const [sessionExpanded, setSessionExpanded] = useState(false);
  const extras = EXPERT_EXTRAS[e.id] || { resout:[], reviews:[], preuves:[] };
  const styleTags = EXPERT_STYLE_TAGS[e.cat] || ["Humain","Direct","Pratique"];
  const firstSession = EXPERT_FIRST_SESSION[e.id] || `Dans notre première session, je commence par comprendre précisément votre situation. On va droit au but — vous repartez avec des réponses concrètes basées sur mon expérience réelle.`;
  const bio = e.bio || e.tagline || "";
  const bioShort = bio.length > 130 ? bio.slice(0,130)+"…" : bio;
  const sessionShort = firstSession.length > 140 ? firstSession.slice(0,140)+"…" : firstSession;
  const phases = e.phases?.length ? e.phases : [{id:1,name:"Session conseil",what:"Conseil personnalisé basé sur mon expérience",format:"Vidéo 1h",price:e.price||50,tag:"",inc:[]}];
  const metrics = e.metrics?.length ? e.metrics : [
    {label:"Expérience", value: e.yearsExp || (e.reviews>20?"10+ ans":e.reviews>5?"5+ ans":"Récent")},
    {label:"Note", value:`⭐ ${e.rating||"Nouveau"}`},
    {label:"Sessions", value:`+${e.reviews||0}`},
  ];
  const photoSrc = e.photo_url || e.photoUrl || null;

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:100, background:C.white }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div style={{ background:C.white, padding:"13px 18px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:C.cream2, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Conseillers</span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={toggleFav} style={{ width:36, height:36, borderRadius:10, background:isFav?"#FEE2E2":C.cream2, border:`1px solid ${isFav?"#FECACA":C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill={isFav?"#DC2626":"none"} stroke={isFav?"#DC2626":C.soft} strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button onClick={()=>{ try{ navigator.share({title:e.name,text:e.tagline}); }catch(err){} }} style={{ width:36, height:36, borderRadius:10, background:C.cream2, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><circle cx={18} cy={5} r={3}/><circle cx={6} cy={12} r={3}/><circle cx={18} cy={19} r={3}/><line x1={8.59} y1={13.51} x2={15.42} y2={17.49}/><line x1={15.41} y1={6.51} x2={8.59} y2={10.49}/></svg>
          </button>
        </div>
      </div>

      {/* ── EXPERT CARD ──────────────────────────────────────────────────── */}
      <div style={{ margin:"16px 18px 0", background:e.bg, borderRadius:18, overflow:"hidden", border:`1px solid rgba(0,0,0,.07)` }}>
        <div style={{ padding:"16px", display:"flex", gap:14, alignItems:"flex-start" }}>
          {/* Photo / vidéo placeholder */}
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:100, height:130, borderRadius:14, background:`linear-gradient(160deg,${e.bg||C.cream2},${e.color||C.gold}22)`, border:`2px solid ${e.color||C.gold}22`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              {photoSrc
                ? <img src={photoSrc} alt={e.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div style={{ fontSize:36, fontWeight:800, color:e.color||C.gold, fontFamily:SERIF }}>{e.initials}</div>
              }
            </div>
            {/* Play button */}
            <div style={{ position:"absolute", bottom:8, right:8, width:30, height:30, borderRadius:"50%", background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", backdropFilter:"blur(4px)" }}>
              <svg width={10} height={12} viewBox="0 0 10 12" fill="white"><path d="M0 0l10 6-10 6z"/></svg>
            </div>
            {/* Flag */}
            <div style={{ position:"absolute", top:8, left:8, fontSize:16, lineHeight:1 }}>{e.country}</div>
          </div>
          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(255,255,255,.65)", borderRadius:20, padding:"3px 10px", marginBottom:8 }}>
              <span style={{ fontSize:10, fontWeight:700, color:e.color }}>✦ Expérience confirmée</span>
            </div>
            <div style={{ fontSize:19, fontWeight:700, color:C.ink, fontFamily:SERIF, lineHeight:1.2, marginBottom:4 }}>{e.name}</div>
            <div style={{ fontSize:12, color:C.soft, lineHeight:1.5, marginBottom:8 }}>{e.role.split("·")[0].trim()}</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {e.langs.map(l => <span key={l} style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:"rgba(255,255,255,.6)", color:C.soft, fontWeight:600 }}>{l}</span>)}
              {e.nda && <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, background:"rgba(0,0,0,.08)", color:C.soft, fontWeight:700 }}>🔒 NDA</span>}
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div style={{ borderTop:"1px solid rgba(0,0,0,.07)", display:"grid", gridTemplateColumns:"1fr 1fr 1fr" }}>
          {[
            {l:"Expérience", v:metrics[0].value},
            {l:"Note", v:e.rating?`⭐ ${e.rating}`:"Nouveau"},
            {l:"Sessions", v:`+${e.reviews||0}`},
          ].map((s,i) => (
            <div key={s.l} style={{ padding:"12px 8px", textAlign:"center", borderRight:i<2?"1px solid rgba(0,0,0,.07)":"none" }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{s.v}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Temps de réponse pill */}
      {(()=>{ const rt=e.metrics?.find(m=>m.label?.includes("réponse")||m.label?.includes("response")); return rt ? (
        <div style={{ margin:"10px 18px 0", background:"#FFFBEB", borderRadius:12, padding:"9px 14px", border:"1px solid #FDE68A", display:"flex", alignItems:"center", gap:8 }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={{ fontSize:12, color:"#92400E" }}>Répond généralement <strong>{rt.value}</strong></span>
        </div>
      ) : null; })()}

      <div style={{ padding:"24px 18px 0" }}>
        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── SOBRE MÍ ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:10 }}>Qui suis-je ?</div>
          <div style={{ fontSize:14, color:C.soft, lineHeight:1.8 }}>
            {bioExpanded ? bio : bioShort}
          </div>
          {bio.length > 130 && (
            <button onClick={()=>setBioExpanded(v=>!v)} style={{ background:"none", border:"none", cursor:"pointer", color:e.color, fontWeight:700, fontSize:13, padding:"6px 0 0", fontFamily:"inherit" }}>
              {bioExpanded ? "Lire moins ↑" : "Lire plus →"}
            </button>
          )}
        </div>

        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── VOTRE QUESTION ─────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:6 }}>Votre question pour la session</div>
          <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:14 }}>
            Écrivez la question précise à laquelle vous voulez une réponse. {e.name.split(" ")[0]} arrivera préparé(e) — vous utilisez chaque minute de la session pour ce qui compte vraiment.
          </div>
          <textarea
            placeholder={`Ex : "Comment négocier mon salaire lors d'une reconversion à 35 ans sans expérience dans le secteur ?" `}
            rows={3}
            style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:`1.5px solid ${C.border}`, fontSize:13, color:C.ink, fontFamily:"inherit", lineHeight:1.6, resize:"none", background:C.cream2, outline:"none", boxSizing:"border-box" }}
          />
          <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8, padding:"10px 13px", borderRadius:11, background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`, border:`1px solid ${C.goldB}` }}>
            <span style={{ fontSize:16 }}>💡</span>
            <span style={{ fontSize:12, color:C.gold, lineHeight:1.5 }}>
              <b>Conseil :</b> une question précise = une réponse concrète. Évitez les questions trop larges.
            </span>
          </div>
        </div>

        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── STYLE DE CONSULTATION ────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:14 }}>Style de consultation</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {styleTags.map(t => (
              <span key={t} style={{ padding:"8px 16px", borderRadius:20, border:`1.5px solid ${C.border}`, fontSize:13, color:C.ink, fontWeight:500, background:C.white }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── CE QUE JE RÉSOUS ───────────────────────────────────────── */}
        {extras.resout.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:14 }}>Je t'aide à…</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {extras.resout.map((r,i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:e.color, flexShrink:0, marginTop:6 }}/>
                  <span style={{ fontSize:14, color:C.soft, lineHeight:1.6 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── MES OFFRES ─────────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:14 }}>Mes offres</div>
          {phases.slice(0,3).map(ph => {
            const isOpen = openPhase === ph.id;
            return (
              <div key={ph.id} onClick={() => setOpenPhase(isOpen?null:ph.id)}
                style={{ background:isOpen?e.bg:C.cream, border:`1.5px solid ${isOpen?e.color:C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:10, cursor:"pointer", transition:"all .2s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:4 }}>{ph.name}</div>
                    <div style={{ fontSize:12, color:C.soft, lineHeight:1.4, marginBottom:6 }}>{ph.what}</div>
                    <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:isOpen?C.white:C.cream3, color:C.soft, fontWeight:600 }}>{ph.tag}</span>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{ph.price?`${ph.price}€`:"Devis"}</div>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} style={{ transform:isOpen?"rotate(180deg)":"none", transition:".2s" }}><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}` }}>
                    {ph.inc.map((inc,i) => (
                      <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:7 }}>
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5} style={{ flexShrink:0, marginTop:1 }}><polyline points="20 6 9 17 4 12"/></svg>
                        <span style={{ fontSize:12, color:C.soft }}>{inc}</span>
                      </div>
                    ))}
                    <button onClick={ev=>{ev.stopPropagation();onBook(e,ph);}}
                      style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, background:C.ink, color:C.white, marginTop:12, fontFamily:SERIF }}>
                      Réserver — {ph.price?`${ph.price}€`:"devis"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── PREUVES D'EXPÉRIENCE ──────────────────────────────────── */}
        {extras.preuves.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ height:1, background:C.border, marginBottom:24 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Expérience prouvée</div>
              <span style={{ fontSize:10, padding:"3px 10px", borderRadius:20, background:C.sageL, color:C.sage, fontWeight:700 }}>Vérifié ✓</span>
            </div>
            {extras.preuves.map((p,i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"0 0 12px", borderBottom:i<extras.preuves.length-1?`1px solid ${C.border}`:"none", marginBottom:i<extras.preuves.length-1?12:0 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:e.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>✦</div>
                <span style={{ fontSize:13, color:C.soft, lineHeight:1.6, paddingTop:4 }}>{p}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── AVIS CLIENTS ─────────────────────────────────────────── */}
        {extras.reviews.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <div style={{ height:1, background:C.border, marginBottom:24 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Avis clients</div>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                {[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill="#B8864A"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
                <span style={{ fontSize:12, color:C.muted, marginLeft:4 }}>{e.rating} · {e.reviews} avis</span>
              </div>
            </div>
            {extras.reviews.map((r,i) => (
              <div key={i} style={{ padding:"0 0 16px", borderBottom:i<extras.reviews.length-1?`1px solid ${C.border}`:"none", marginBottom:i<extras.reviews.length-1?16:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{r.name}</div>
                    <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{r.date}</div>
                  </div>
                  <div style={{ display:"flex", gap:2 }}>
                    {[1,2,3,4,5].map(s => <svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s<=r.stars?"#B8864A":"#D6D0C8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
                  </div>
                </div>
                <div style={{ fontSize:13, color:C.soft, lineHeight:1.7, fontStyle:"italic" }}>"{r.text}"</div>
              </div>
            ))}
          </div>
        )}

        {/* ── CONFIANCE ────────────────────────────────────────────── */}
        <div style={{ height:1, background:C.border, marginBottom:20 }}/>
        <div style={{ display:"flex", justifyContent:"center", gap:16, flexWrap:"wrap", marginBottom:8, paddingBottom:8 }}>
          {["🔒 Paiement sécurisé","🔁 Annulation flexible","✅ Vérifié Savvy"].map(t => (
            <span key={t} style={{ fontSize:11, color:C.muted }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── STICKY BOTTOM CTA ────────────────────────────────────────────── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, padding:"12px 18px 28px", background:C.white, borderTop:`1px solid ${C.border}`, zIndex:20 }}>
        <button onClick={() => onBook(e, phases[0])} style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:C.ink, color:C.white, fontFamily:SERIF, letterSpacing:".2px", marginBottom:8 }}>
          Parler avec {e.name.split(" ")[0]} → {phases[0].price ? `${phases[0].price}€` : "Devis"}
        </button>
        <button onClick={() => onMsg(e)} style={{ width:"100%", padding:"10px", border:"none", background:"none", cursor:"pointer", fontSize:13, color:C.muted, fontWeight:600, fontFamily:"inherit" }}>
          Poser une question d'abord
        </button>
      </div>
    </div>
  );
}

// ─── MessagingScreen ──────────────────────────────────────────────────────────
function MessagingScreen({ e, onBack, authUser }) {
  const _msgKey = `savvy_chat_${e.initials||e.id||"guest"}`;
  const _defaultMsg = [{id:1,from:"expert",text:`Bonjour ! Je suis ${e.name.split(" ")[0]}. ${e.tagline||e.role||""}. Quelle est votre question ?`,time:"09:30"}];
  // Expert a un vrai UUID Supabase si son id est une string UUID
  const expertSbId = (typeof e.id === "string" && e.id.includes("-")) ? e.id : null;
  const isRealUser = authUser?.real && authUser?.id;

  const [msgs, setMsgs] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(_msgKey)||"null"); return saved?.length ? saved : _defaultMsg; } catch { return _defaultMsg; }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugg, setSugg] = useState(null);
  const bottomRef = useRef(null);

  // Charger l'historique Supabase au montage (utilisateur réel + expert réel)
  useEffect(() => {
    if (!isRealUser || !expertSbId) return;
    supabase.from("messages")
      .select("*")
      .eq("expert_id", expertSbId)
      .or(`sender_id.eq.${authUser.id},receiver_id.eq.${authUser.id}`)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const sbMsgs = data.map(m => ({
          id: m.id,
          from: m.sender_id === authUser.id ? "client" : "expert",
          text: m.content,
          time: new Date(m.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
          _fromSB: true,
        }));
        // Fusionner avec localStorage (Supabase prioritaire)
        setMsgs(prev => {
          const sbIds = new Set(sbMsgs.map(m=>m.id));
          const localOnly = prev.filter(m=>!m._fromSB && !sbIds.has(m.id));
          return [..._defaultMsg, ...sbMsgs, ...localOnly].slice(0,200);
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveMsgs = (m) => { try { localStorage.setItem(_msgKey, JSON.stringify(m)); } catch {} };

  const send = useCallback(async(text)=>{
    const t=(text??input).trim(); if(!t||loading)return;
    setInput(""); setSugg(null);
    const userMsg={id:Date.now(),from:"client",text:t,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};
    const updated=[...msgs,userMsg]; setMsgs(updated); saveMsgs(updated); setLoading(true);

    // Sauvegarder dans Supabase si utilisateur réel
    if (isRealUser && expertSbId) {
      supabase.from("messages").insert({
        sender_id: authUser.id,
        expert_id: expertSbId,
        content: t,
      }).then(({error}) => { if(error) console.warn("Message Supabase:", error.message); });
    }

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
        <div style={{fontSize:10,color:C.sageMid,fontWeight:600,display:"flex",alignItems:"center",gap:4,marginTop:1}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:C.sageMid}}/>IA Savvy active
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
        <span style={{fontSize:10,padding:"3px 9px",borderRadius:20,background:C.goldL,color:C.gold,fontWeight:700,border:`1px solid ${C.goldB}`}}>✦ Claude</span>
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

// ─── BookingScreen ─────────────────────────────────────────────────────────────
const BOOKING_FORMATS = [
  { id:"video", icon:"🎥", label:"Vidéocall", sub:"En direct · face à face" },
  { id:"audio", icon:"🎧", label:"Appel audio", sub:"Téléphone · voix uniquement" },
  { id:"doc",   icon:"📄", label:"Document écrit", sub:"Livrable PDF · 24-48h" },
  { id:"chat",  icon:"💬", label:"Accompagnement", sub:"Échanges par messagerie" },
];

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
    if (payMethod==="apple") { setPaying(true); await new Promise(r=>setTimeout(r,1500)); setPayDone(true); await new Promise(r=>setTimeout(r,900)); onConfirm({date:booking.date, slot:booking.slot}); return; }
    if (!isCardValid) { alert("Vérifie les informations de ta carte."); return; }
    setPaying(true); await new Promise(r=>setTimeout(r,1800)); setPayDone(true); await new Promise(r=>setTimeout(r,900));
    onConfirm({date:booking.date, slot:booking.slot});
  };

  // Determine available formats from the phase
  const availableFormats = BOOKING_FORMATS.filter(f => {
    if (!selectedPhase?.format) return true;
    const pf = (selectedPhase?.format||"").toLowerCase();
    if (pf.includes("vid")) return f.id === "video";
    if (pf.includes("audio")) return f.id === "audio";
    if (pf.includes("doc") || pf.includes("pdf")) return f.id === "doc";
    if (pf.includes("chat") || pf.includes("mess")) return f.id === "chat";
    return true;
  });
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
          {e.phases.map(p => {
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
            background:selectedPhase?C.ink:C.cream3, color:selectedPhase?C.white:C.muted }}>
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
          style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:selectedFormat?C.ink:C.cream3, color:selectedFormat?C.white:C.muted, fontFamily:SERIF, transition:"all .2s" }}>
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
        <CalendarPicker expert={e} onSelect={({date,slot})=>setBooking({date,slot})}/>

        <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:8 }}>Décrivez votre besoin</div>
        <textarea value={note} onChange={ev=>setNote(ev.target.value)} placeholder="Quelques lignes pour que votre conseiller se prépare..." style={{ width:"100%", padding:"12px 14px", borderRadius:13, border:`1.5px solid ${C.border}`, fontSize:12, fontFamily:"inherit", color:C.ink, resize:"none", height:76, boxSizing:"border-box", outline:"none", marginBottom:14, background:C.cream2, lineHeight:1.6 }}/>

        <button onClick={()=>{ if(!booking.date||!booking.slot){alert("Choisissez une date et un créneau."); return;} setStep("confirm"); }}
          style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:SERIF, background:booking.date&&booking.slot?C.ink:C.cream3, color:booking.date&&booking.slot?C.white:C.muted }}>
          {booking.date&&booking.slot ? `Confirmer le ${booking.date.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} à ${booking.slot} →` : "Sélectionnez une date →"}
        </button>
      </div>
    </div>
  );

  // ── STEP 3 : RÉSUMÉ & ENVOI DE DEMANDE ──────────────────────────────────
  const handleSend = async () => {
    setSending(true);
    await new Promise(r=>setTimeout(r,1200));
    onConfirm({date:booking.date, slot:booking.slot});
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
          style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", cursor:sending?"wait":"pointer", fontWeight:700, fontSize:16, fontFamily:SERIF, letterSpacing:".2px", background:sending?"#10B981":C.ink, color:C.white, boxShadow:`0 4px 16px rgba(28,25,23,.2)`, transition:"background .3s" }}>
          {sending ? "⏳ Envoi en cours…" : `Envoyer ma demande à ${e.name.split(" ")[0]} →`}
        </button>
        <div style={{ textAlign:"center", fontSize:11, color:C.faint, marginTop:10 }}>Aucun paiement requis maintenant</div>
      </div>
    </div>
  );
}

// ─── SuccessScreen (Demande envoyée) ───────────────────────────────────────────
function SuccessScreen({e, ph, onHome, onMsg, bookingDate, bookingSlot, authUser}) {
  const savedRef = useRef(false);
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
      format: ph?.format || "Vidéo 1h",
      date: dateStr,
      slot: bookingSlot || "À confirmer",
      duration: ph?.format?.includes("30")?"30 min":ph?.format?.includes("2h")?"2h":"1h",
      price: ph?.price || 0,
      status: "pending",
      topic: `${ph?.name||"Session"} – ${e.name.split(" ")[0]}`,
      timestamp: Date.now(),
      hoursUntil,
    };
    addBooking(bookingData);
    // Sauvegarder dans Supabase si utilisateur réel
    if (authUser?.real && authUser?.id) {
      supabase.from("bookings").insert({
        client_id: authUser.id,
        expert_id: e.supabaseId || (typeof e.id === "string" && e.id.includes("-") ? e.id : null),
        phase_name: bookingData.phase,
        phase_price: bookingData.price,
        status: "pending",
        date_session: bookingDateTime ? bookingDateTime.toISOString() : null,
        time: bookingSlot || null,
        notes: bookingData.topic,
      }).then(({error}) => { if(error) console.warn("Booking Supabase:", error.message); });
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
                { icon:"📅", label:"Date proposée", value: bookingDate ? bookingDate.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"}) : "À confirmer" },
                { icon:"⏰", label:"Créneau", value: bookingSlot || "À confirmer" },
                { icon:"🎯", label:"Format", value: ph?.format || "Vidéo" },
                { icon:"💶", label:"Si accepté", value: ph?.price ? `${ph.price}€` : "Devis" },
              ].map(item => (
                <div key={item.label} style={{ background:C.cream2, borderRadius:10, padding:"9px 11px" }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>{item.icon} {item.label}</div>
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
            { icon:"🔔", text:`Vous recevrez une notification quand ${e.name.split(" ")[0]} accepte.` },
            { icon:"💳", text:"Le paiement n'est demandé qu'après l'acceptation de l'expert." },
            { icon:"💬", text:`Écrivez à ${e.name.split(" ")[0]} pour plus de précisions.` },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:i<2?10:0 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{s.icon}</span>
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

// ─── MessagesListScreen ────────────────────────────────────────────────────────
function MessagesListScreen({onConv, isLoggedIn, onLogin, readMsgIds=[], onMarkMsgRead, appMode="client", isNewExpert=false, isRealUser=false, authUser=null}) {
  const [msgFilter, setMsgFilter]       = useState("tous");
  const [showSavvyChat, setShowSavvyChat] = useState(false);
  const [savvyInput, setSavvyInput]     = useState("");
  const [savvyMsgs, setSavvyMsgs]       = useState([
    {from:"savvy", txt:"Bonjour ! Je suis ton assistant Savvy. Comment puis-je t'aider aujourd'hui ?"}
  ]);
  const [searchQ, setSearchQ]           = useState("");
  const [showSearch, setShowSearch]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab]   = useState("rapides"); // "rapides" | "archives" | "commentaire"
  const [quickReplies, setQuickReplies] = useState([
    {id:1, txt:"Merci pour ta réservation ! On se retrouve bientôt 🙌"},
    {id:2, txt:"Bonjour ! Je confirme notre session. À tout à l'heure !"},
    {id:3, txt:"Super échange, n'hésite pas si tu as d'autres questions ✦"},
    {id:4, txt:"Je serai disponible à l'heure prévue. Prépare tes questions !"},
  ]);
  const [newReply, setNewReply]         = useState("");
  const [archivedIds, setArchivedIds]   = useState([]);
  const [feedbackTxt, setFeedbackTxt]   = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const markMsgRead = (id) => onMarkMsgRead && onMarkMsgRead(id);

  const _getLastMsg = (initials) => {
    try {
      const saved = JSON.parse(localStorage.getItem(`savvy_chat_${initials||"guest"}`)||"null");
      if (saved?.length) { const last = saved[saved.length-1]; return { text: last.text?.slice(0,60)+(last.text?.length>60?"…":""), from: last.from, time: last.time }; }
    } catch {}
    return null;
  };
  const lsThreads = (()=>{
    const seen = new Set();
    return getThreads()
      .sort((a,b)=>b.id-a.id) // most recent first
      .filter(t=>{ if(seen.has(t.expertInitials)) return false; seen.add(t.expertInitials); return true; })
      .map(t => {
        const lastReal = _getLastMsg(t.expertInitials);
        return {
          eid: t.expertId, type:"expert",
          expert: EXPERTS.find(e=>e.initials===t.expertInitials) || {name:t.expertName, initials:t.expertInitials, bg:t.expertBg||"#EDE9FE", color:t.expertCol||"#7C3AED", role:"Conseiller Savvy"},
          lastMsg: lastReal?.text || t.lastMsg,
          time: lastReal?.time || t.time,
          unread: lastReal?.from==="expert" ? 1 : 0,
          id: t.id, _fromLS: true,
        };
      });
  })();
  const demoMsgIds = new Set(lsThreads.map(t=>t.expert?.initials).filter(Boolean));
  const expertConvs = isRealUser ? lsThreads : [
    ...lsThreads,
    ...DEMO_MSGS.filter(m=>!demoMsgIds.has(EXPERTS[m.eid]?.initials)).map(m => ({...m, expert: EXPERTS[m.eid], type:"expert"})).filter(m => m.expert),
  ];
  const allClientConvs = isRealUser ? [] : [
    {id:"c1", type:"client", name:"Sophie M.", ini:"SM", bg:"#EDE9FE", col:"#7C3AED", lastMsg:"Super session, merci beaucoup !", time:"10:15", unread:0, rating:4.8, session:{format:"📹 Vidéo",dur:"30 min",price:"15€",date:"Aujourd'hui 14h00"}},
    {id:"c2", type:"client", name:"Lucas B.",  ini:"LB", bg:"#DBEAFE", col:"#1D4ED8", lastMsg:"Est-ce que vous êtes disponible jeudi ?", time:"Hier",  unread:1, rating:4.6, session:{format:"📞 Appel",dur:"45 min",price:"25€",date:"Jeudi 11h00"}},
    {id:"c3", type:"client", name:"Emma P.",   ini:"EP", bg:"#D1FAE5", col:"#065F46", lastMsg:"Merci beaucoup pour les conseils !", time:"Lun", unread:0, archived:true, rating:5.0, session:null},
  ];
  // New experts start with no client conversations; clients don't see "client" convs
  const clientConvs = (appMode==="expert" && !isNewExpert) ? allClientConvs : [];
  // In expert mode, experts only see their clients — not their own client-side expert convs
  const expertConvsDisplay = appMode==="expert" ? [] : expertConvs;

  const allBaseConvs = msgFilter==="clients" ? clientConvs : msgFilter==="experts" ? expertConvsDisplay : appMode==="expert" ? clientConvs : [...expertConvsDisplay,...clientConvs];
  const baseConvs = msgFilter==="nonlus" ? [...expertConvsDisplay,...clientConvs].filter(c=>c.unread>0&&!readMsgIds.includes((c.type==="client"?"cli-":"exp-")+(c.id||c.eid))) : allBaseConvs;
  const visibleConvs = baseConvs
    .filter(c => !archivedIds.includes(c.id||c.eid))
    .filter(c => !searchQ || (c.name||c.expert?.name||"").toLowerCase().includes(searchQ.toLowerCase()) || (c.lastMsg||"").toLowerCase().includes(searchQ.toLowerCase()));
  const archivedConvs = [...expertConvsDisplay,...clientConvs].filter(c=>archivedIds.includes(c.id||c.eid));
  const allConvs = visibleConvs;

  // ── Settings panel ─────────────────────────────────────────────
  if (showSettings) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.cream,height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 18px 14px",borderBottom:`1px solid ${C.border}`,background:C.white}}>
        <button onClick={()=>setShowSettings(false)} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{flex:1,fontSize:17,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Paramètres messagerie</div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,background:C.white}}>
        {[{id:"rapides",l:"Réponses rapides"},{id:"archives",l:"Archivés"},{id:"commentaire",l:"Nous contacter"}].map(t=>(
          <button key={t.id} onClick={()=>setSettingsTab(t.id)} style={{flex:1,padding:"11px 4px",fontSize:10,fontWeight:settingsTab===t.id?700:400,color:settingsTab===t.id?C.ink:C.muted,background:"transparent",border:"none",borderBottom:`2px solid ${settingsTab===t.id?C.ink:"transparent"}`,cursor:"pointer",fontFamily:"inherit"}}>{t.l}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        {/* ── Réponses rapides ── */}
        {settingsTab==="rapides" && (
          <div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.5}}>Tes réponses rapides apparaissent en un tap dans les conversations. L'IA peut t'en générer de nouvelles.</div>
            {quickReplies.map(r=>(
              <div key={r.id} style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:"11px 13px",marginBottom:8,display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{flex:1}}>
                  {editingReply===r.id
                    ? <textarea defaultValue={r.txt} id={`qr-${r.id}`} style={{width:"100%",padding:"7px 9px",borderRadius:8,border:`1px solid ${C.gold}`,fontSize:12,fontFamily:"inherit",resize:"none",outline:"none",boxSizing:"border-box"}} rows={2}/>
                    : <div style={{fontSize:13,color:C.ink,lineHeight:1.5}}>{r.txt}</div>
                  }
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  {editingReply===r.id
                    ? <button onClick={()=>{ const v=document.getElementById(`qr-${r.id}`).value; setQuickReplies(q=>q.map(x=>x.id===r.id?{...x,txt:v}:x)); setEditingReply(null); }} style={{fontSize:10,padding:"4px 9px",borderRadius:7,border:"none",background:C.sage,color:C.white,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>OK</button>
                    : <button onClick={()=>setEditingReply(r.id)} style={{fontSize:10,padding:"4px 9px",borderRadius:7,border:`1px solid ${C.border}`,background:C.cream2,color:C.muted,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                  }
                  <button onClick={()=>setQuickReplies(q=>q.filter(x=>x.id!==r.id))} style={{fontSize:10,padding:"4px 9px",borderRadius:7,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#DC2626",cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <input value={newReply} onChange={e=>setNewReply(e.target.value)} placeholder="Nouvelle réponse rapide…" style={{flex:1,padding:"9px 12px",borderRadius:10,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",outline:"none",background:C.white}}/>
              <button onClick={()=>{ if(newReply.trim()){setQuickReplies(q=>[...q,{id:Date.now(),txt:newReply.trim()}]);setNewReply("");} }} style={{padding:"9px 14px",borderRadius:10,border:"none",background:C.ink,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>+</button>
            </div>
            <button onClick={()=>{ const suggestions=["Avec plaisir, à très vite ! ✦","N'hésite pas si tu as besoin d'autre chose.","Je suis là si tu veux approfondir le sujet !"]; setQuickReplies(q=>[...q,...suggestions.map((txt,i)=>({id:Date.now()+i,txt}))]); }} style={{width:"100%",marginTop:12,padding:"10px",borderRadius:10,border:`1px dashed ${C.gold}`,background:C.goldL,color:C.gold,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✦ Générer avec l'IA</button>
          </div>
        )}
        {/* ── Archivés ── */}
        {settingsTab==="archives" && (
          <div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14}}>Conversations masquées. Tu peux les restaurer à tout moment.</div>
            {archivedConvs.length===0
              ? <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}><div style={{display:"flex",justifyContent:"center",marginBottom:8}}><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><polyline points="21 8 21 21 3 21 3 8"/><rect x={1} y={3} width={22} height={5}/><line x1={10} y1={12} x2={14} y2={12}/></svg></div>Aucune conversation archivée</div>
              : archivedConvs.map(c=>(
                <div key={c.id||c.eid} style={{background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:11}}>
                  {c.type==="expert"
                    ? <Av e={c.expert} size={40}/>
                    : <div style={{width:40,height:40,borderRadius:"50%",background:c.bg,color:c.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>{c.ini}</div>
                  }
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{c.type==="expert"?c.expert.name:c.name}</div>
                    <div style={{fontSize:11,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.lastMsg}</div>
                  </div>
                  <button onClick={()=>setArchivedIds(a=>a.filter(x=>x!==(c.id||c.eid)))} style={{padding:"6px 12px",borderRadius:9,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Restaurer</button>
                </div>
              ))
            }
          </div>
        )}
        {/* ── Nous contacter ── */}
        {settingsTab==="commentaire" && (
          <div>
            <div style={{fontSize:12,color:C.muted,marginBottom:14,lineHeight:1.5}}>Tu as une question, un problème ou une suggestion ? Écris-nous, on te répond rapidement.</div>
            {feedbackSent
              ? <div style={{textAlign:"center",padding:"36px 16px"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={1.5}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                  <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Message envoyé !</div>
                  <div style={{fontSize:12,color:C.muted}}>Notre équipe te répondra dans les 24h.</div>
                  <button onClick={()=>{setFeedbackSent(false);setFeedbackTxt("");}} style={{marginTop:18,padding:"10px 20px",borderRadius:10,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Envoyer un autre message</button>
                </div>
              : <>
                  <textarea value={feedbackTxt} onChange={e=>setFeedbackTxt(e.target.value)} placeholder="Dis-nous ce que tu penses ou ce qui ne va pas…" style={{width:"100%",padding:"11px 13px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",resize:"none",outline:"none",marginBottom:12,boxSizing:"border-box",minHeight:120}} rows={5}/>
                  <button onClick={()=>{if(feedbackTxt.trim())setFeedbackSent(true);}} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:feedbackTxt.trim()?C.ink:C.cream2,color:feedbackTxt.trim()?C.white:C.muted,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>Envoyer ✦</button>
                </>
            }
          </div>
        )}
      </div>
    </div>
  );

  if (showSavvyChat) return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.cream,height:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 18px 14px",borderBottom:`1px solid ${C.border}`,background:C.white}}>
        <button onClick={()=>setShowSavvyChat(false)} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.ink},#2C2825)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>✦</div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF}}>✦ Assistance Savvy</div>
          <div style={{fontSize:11,color:C.sage}}>● En ligne · Réponse &lt; 5 min</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:10}}>
        {savvyMsgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.from==="moi"?"flex-end":"flex-start"}}>
            {m.from==="savvy" && <div style={{width:28,height:28,borderRadius:"50%",background:`linear-gradient(135deg,${C.ink},#2C2825)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,marginRight:8,flexShrink:0,alignSelf:"flex-end"}}>✦</div>}
            <div style={{maxWidth:"75%",padding:"10px 13px",borderRadius:m.from==="moi"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.from==="moi"?C.ink:C.white,color:m.from==="moi"?C.white:C.ink,fontSize:13,lineHeight:1.5,border:m.from==="moi"?"none":`1px solid ${C.border}`}}>
              {m.txt}
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 18px 28px",borderTop:`1px solid ${C.border}`,background:C.white,display:"flex",gap:10}}>
        <input value={savvyInput} onChange={e=>setSavvyInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&savvyInput.trim()){const txt=savvyInput.trim();setSavvyMsgs(m=>[...m,{from:"moi",txt},{from:"savvy",txt:"Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais. En attendant, consultez notre centre d'aide pour les réponses aux questions fréquentes."}]);setSavvyInput("");e.preventDefault();}}} placeholder="Écris ton message…" style={{flex:1,padding:"10px 13px",borderRadius:22,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.cream2}}/>
        <button onClick={()=>{ if(!savvyInput.trim()) return; const txt=savvyInput.trim(); setSavvyMsgs(m=>[...m,{from:"moi",txt},{from:"savvy",txt:"Merci pour votre message ! Notre équipe vous répondra dans les plus brefs délais. En attendant, consultez notre centre d'aide pour les réponses aux questions fréquentes."}]); setSavvyInput(""); }} style={{width:42,height:42,borderRadius:"50%",border:"none",background:C.ink,color:C.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
        </button>
      </div>
    </div>
  );

  return <div style={{flex:1,overflowY:"auto",paddingBottom:72,background:C.cream}}>
    {/* Header avec lupa + engrenage */}
    <div style={{padding:"18px 18px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 2px",fontFamily:SERIF}}>Messages</h2>
        {(()=>{const n=[...expertConvsDisplay,...clientConvs].filter(c=>!archivedIds.includes(c.id||c.eid)&&(readMsgIds.includes((c.type==="client"?"cli-":"exp-")+(c.id||c.eid))?false:c.unread>0)).length; return <div style={{fontSize:12,color:n>0?C.gold:C.muted,fontWeight:n>0?600:400}}>{n>0?`${n} message${n>1?"s":""} non lu${n>1?"s":""}`:"Retrouvez tous vos échanges Savvy"}</div>; })()}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setShowSearch(v=>!v)} style={{width:36,height:36,borderRadius:10,background:showSearch?C.ink:C.cream2,border:`1px solid ${showSearch?C.ink:C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={showSearch?C.white:C.soft} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button onClick={()=>setShowSettings(true)} style={{width:36,height:36,borderRadius:10,background:C.cream2,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><circle cx={12} cy={12} r={3}/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </button>
      </div>
    </div>

    {/* Barre de recherche */}
    {showSearch && (
      <div style={{padding:"0 18px",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,background:C.white,borderRadius:12,border:`1px solid ${C.border}`,padding:"8px 12px"}}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
          <input autoFocus value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Rechercher une conversation…" style={{flex:1,border:"none",outline:"none",fontSize:13,fontFamily:"inherit",background:"transparent",color:C.ink}}/>
          {searchQ && <button onClick={()=>setSearchQ("")} style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:16,lineHeight:1}}>✕</button>}
        </div>
      </div>
    )}

    {/* Filter pills */}
    <div style={{display:"flex",gap:6,padding:"0 18px",marginBottom:14,overflowX:"auto"}}>
      {(appMode==="expert"
        ? [{id:"tous",l:"Tous"},{id:"nonlus",l:"Non lus"},{id:"clients",l:"Clients"}]
        : [{id:"tous",l:"Tous"},{id:"nonlus",l:"Non lus"},{id:"experts",l:"Experts"}]
      ).map(f=>(
        <button key={f.id} onClick={()=>setMsgFilter(f.id)} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${msgFilter===f.id?C.ink:C.border}`,background:msgFilter===f.id?C.ink:"transparent",color:msgFilter===f.id?C.white:C.muted,fontSize:12,fontWeight:msgFilter===f.id?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
          {f.l}
        </button>
      ))}
      {/* Supprimés chip — uniquement si au moins une conv supprimée */}
      <button onClick={()=>setMsgFilter(msgFilter==="supprimes"?"tous":"supprimes")} style={{padding:"7px 14px",borderRadius:20,border:`1.5px solid ${msgFilter==="supprimes"?"#DC2626":C.border}`,background:msgFilter==="supprimes"?"#DC2626":"transparent",color:msgFilter==="supprimes"?C.white:C.muted,fontSize:12,fontWeight:msgFilter==="supprimes"?700:400,cursor:"pointer",fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",gap:5}}>
        🗑 Supprimés
        {archivedIds.length>0 && (
          <span style={{background:msgFilter==="supprimes"?"rgba(255,255,255,.3)":"#DC2626",color:"white",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {archivedIds.length}
          </span>
        )}
      </button>
    </div>

    <div style={{padding:"0 18px"}}>
      {/* Savvy assistant row */}
      {(msgFilter==="tous"||msgFilter==="clients") && (
        <div onClick={()=>setShowSavvyChat(true)} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"14px 15px",marginBottom:10,cursor:"pointer",border:`1px solid ${C.border}`,boxShadow:`0 1px 4px rgba(110,139,61,.08)`}}>
          <div style={{position:"relative"}}>
            <div style={{width:48,height:48,borderRadius:14,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1px solid rgba(74,96,41,.18)`,color:C.gold}}>✦</div>
            <div style={{position:"absolute",bottom:-1,right:-1,width:13,height:13,borderRadius:"50%",background:C.sage,border:`2px solid ${C.white}`}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Assistance Savvy</span>
              <span style={{fontSize:10,color:C.sage,fontWeight:600}}>● En ligne</span>
            </div>
            <div style={{fontSize:12,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Réponse moyenne : moins de 5 min</div>
          </div>
        </div>
      )}

      {(()=>{
        // Classe le time string en priorité pour tri + groupe
        const timeRank = t => t?.includes(":")?0:t==="Hier"?1:["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].includes(t)?2:3;
        const timeGroup = t => (!t||t==="À l'instant"||t?.includes(":"))?"Aujourd'hui":t==="Hier"?"Hier":["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].includes(t)?"Cette semaine":"Plus ancien";

        // Vue Supprimés
        if (msgFilter === "supprimes") {
          if (archivedConvs.length === 0) return (
            <div style={{textAlign:"center",padding:"48px 16px",color:C.muted,fontSize:13}}>
              <div style={{fontSize:32,marginBottom:12}}>🗑</div>
              Aucune conversation supprimée
            </div>
          );
          return (
            <div>
              <div style={{background:"#FEF2F2",borderRadius:12,padding:"10px 14px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:"#DC2626"}}>💡 Ces conversations ont été supprimées. Tu peux les restaurer.</span>
              </div>
              {archivedConvs.map(c => (
                <div key={c.id||c.eid} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"13px 15px",marginBottom:10,border:`1px solid #FEE2E2`,opacity:.8}}>
                  <div style={{width:46,height:46,borderRadius:14,background:c.bg||C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,color:c.col||C.gold,flexShrink:0}}>{c.ini||c.expert?.initials}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:600,color:C.ink}}>{c.name||c.expert?.name}</div>
                    <div style={{fontSize:12,color:C.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.lastMsg||"Conversation supprimée"}</div>
                  </div>
                  <button onClick={()=>setArchivedIds(a=>a.filter(x=>x!==(c.id||c.eid)))} style={{padding:"6px 12px",borderRadius:20,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
                    Restaurer
                  </button>
                </div>
              ))}
            </div>
          );
        }

        // Construire liste unifiée selon filtre + recherche
        const matchesSearch = c => !searchQ
          || (c.name||c.expert?.name||"").toLowerCase().includes(searchQ.toLowerCase())
          || (c.lastMsg||"").toLowerCase().includes(searchQ.toLowerCase());
        const unified = [];
        const isUnread = c => {
          const key = (c.type==="client"?"cli-":"exp-")+(c.id||c.eid);
          return c.unread > 0 && !readMsgIds.includes(key);
        };
        // En mode expert, ne montrer que les convs clients (pas les convs avec des experts)
        if(appMode!=="expert" && (msgFilter==="tous"||msgFilter==="experts"||msgFilter==="nonlus")) {
          expertConvs
            .filter(c=>!archivedIds.includes(c.id||c.eid)&&matchesSearch(c)&&(msgFilter!=="nonlus"||isUnread({...c,type:"expert"})))
            .forEach(c=>unified.push({...c,_type:"expert"}));
        }
        if(msgFilter==="tous"||msgFilter==="clients"||msgFilter==="nonlus") {
          visibleConvs
            .filter(c=>c.type==="client"&&matchesSearch(c)&&(msgFilter!=="nonlus"||isUnread(c)))
            .forEach(c=>unified.push({...c,_type:"client"}));
        }
        unified.sort((a,b)=>timeRank(a.time)-timeRank(b.time));

        // Grouper
        const ORDER = ["Aujourd'hui","Hier","Cette semaine","Plus ancien"];
        const groups = {};
        unified.forEach(c=>{ const g=timeGroup(c.time); if(!groups[g]) groups[g]=[]; groups[g].push(c); });

        return ORDER.filter(g=>groups[g]?.length).map(groupLabel=>(
          <div key={groupLabel}>
            {/* Séparateur */}
            <div style={{display:"flex",alignItems:"center",gap:8,margin:"4px 0 10px"}}>
              <span style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.6,whiteSpace:"nowrap"}}>{groupLabel}</span>
              <div style={{flex:1,height:1,background:C.borderF}}/>
            </div>

            {groups[groupLabel].map(conv=>{
              if(conv._type==="expert"){
                const convKey="exp-"+conv.id;
                const isRead=readMsgIds.includes(convKey)||conv.unread===0;
                return (
                  <div key={conv.id} onClick={()=>{ markMsgRead(convKey); onConv(conv.expert); }} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"14px 15px",marginBottom:9,cursor:"pointer",border:`1px solid ${isRead?C.border:C.gold}`,boxShadow:`0 1px 6px ${C.sh}`,transition:"border-color .25s"}}>
                    <div style={{position:"relative"}}>
                      <Av e={conv.expert} size={46}/>
                      {!isRead&&<div style={{position:"absolute",top:-2,right:-2,width:17,height:17,borderRadius:"50%",background:C.gold,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{conv.unread}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{fontSize:14,fontWeight:isRead?600:700,color:C.ink,fontFamily:SERIF}}>{conv.expert.name}</span>
                        <span style={{fontSize:10,color:C.faint}}>{conv.time}</span>
                      </div>
                      <div style={{fontSize:10,color:isRead?C.faint:C.gold,fontWeight:600,marginBottom:conv.session?2:4}}>
                        {conv.expert?.role||"Conseiller Savvy"}
                        {conv.expert?.rating ? ` · ★${conv.expert.rating}` : ""}
                        {conv.expert?.reviews ? ` · ${conv.expert.reviews} avis` : ""}
                      </div>
                      {conv.session && <div style={{fontSize:10,color:isRead?C.faint:C.teal,fontWeight:600,marginBottom:2}}>{conv.session.format} · {conv.session.dur} · {conv.session.price} · {conv.session.date}</div>}
                      <div style={{fontSize:12,color:isRead?C.muted:C.ink,fontWeight:isRead?400:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.lastMsg}</div>
                    </div>
                    {!isRead&&<div style={{width:8,height:8,borderRadius:"50%",background:C.gold,flexShrink:0}}/>}
                  </div>
                );
              } else {
                const convKey="cli-"+conv.id;
                const isRead=readMsgIds.includes(convKey)||conv.unread===0;
                return (
                  <div key={conv.id} onClick={()=>{ markMsgRead(convKey); onConv&&onConv({name:conv.name,role:"Client",tagline:conv.lastMsg,color:conv.col,initials:conv.ini,avatar:conv.ini,bg:conv.bg}); }} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"14px 15px",marginBottom:9,cursor:"pointer",border:`1px solid ${isRead?C.border:"#6EE7B7"}`,boxShadow:`0 1px 6px ${C.sh}`,transition:"border-color .25s"}}>
                    <div style={{position:"relative"}}>
                      <div style={{width:46,height:46,borderRadius:"50%",background:conv.bg,color:conv.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15}}>{conv.ini}</div>
                      {!isRead&&<div style={{position:"absolute",top:-2,right:-2,width:17,height:17,borderRadius:"50%",background:C.sage,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{conv.unread}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2}}>
                        <span style={{fontSize:14,fontWeight:isRead?600:700,color:C.ink,fontFamily:SERIF}}>{conv.name}</span>
                        <span style={{fontSize:10,color:C.faint}}>{conv.time}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                        <span style={{fontSize:10,color:isRead?C.faint:C.sage,fontWeight:600}}>Client</span>
                        {conv.rating && <span style={{fontSize:10,color:C.gold,fontWeight:600}}>★ {conv.rating.toFixed(1)}</span>}
                        {conv.session && <span style={{fontSize:10,color:C.muted}}>{conv.session.format} · {conv.session.dur} · {conv.session.price}</span>}
                      </div>
                      {conv.session && <div style={{fontSize:10,color:isRead?C.faint:C.teal,fontWeight:600,marginBottom:2}}>🗓 {conv.session.date}</div>}
                      <div style={{fontSize:12,color:isRead?C.muted:C.ink,fontWeight:isRead?400:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.lastMsg}</div>
                    </div>
                    {!isRead&&<div style={{width:8,height:8,borderRadius:"50%",background:C.sage,flexShrink:0}}/>}
                    <button onClick={e=>{e.stopPropagation();setArchivedIds(a=>[...a,conv.id]);}} style={{flexShrink:0,width:28,height:28,borderRadius:8,border:`1px solid ${C.border}`,background:C.cream2,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="21 8 21 21 3 21 3 8"/><rect x={1} y={3} width={22} height={5}/><line x1={10} y1={12} x2={14} y2={12}/></svg>
                    </button>
                  </div>
                );
              }
            })}
          </div>
        ));
      })()}

      {allConvs.length===0 && (
        <div style={{textAlign:"center",padding:"48px 16px",color:C.muted,fontSize:13}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><svg width={36} height={36} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div style={{marginBottom:appMode==="client"?12:0}}>Aucune conversation pour le moment</div>
          {appMode==="client" && <button onClick={()=>onConv&&onConv("__search__")} style={{padding:"11px 22px",borderRadius:12,border:"none",background:C.sage,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Trouver un expert →</button>}
        </div>
      )}
    </div>
  </div>;
}

// ─── CalendarPicker ────────────────────────────────────────────────────────────
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
      .select("date_session, time")
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
          if (b.time) map[key].push(b.time);
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

// ─── CancelModal ───────────────────────────────────────────────────────────────
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
              💡 Ta proposition sera envoyée à {expert.name.split(" ")[0]} pour confirmation.
            </div>
            <CalendarPicker expert={expert} onSelect={({date,slot}) => setNewBooking({date,slot})}/>
            <button onClick={() => {
              if (!newBooking.date || !newBooking.slot) { alert("Choisis une date et un créneau."); return; }
              setStep("done_reprog");
            }} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:SERIF, marginTop:8,
              background: newBooking.date && newBooking.slot ? C.gold : C.cream3,
              color: newBooking.date && newBooking.slot ? C.white : C.muted }}>
              {newBooking.date && newBooking.slot
                ? `✓ Proposer le ${newBooking.date.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} à ${newBooking.slot}`
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
              ℹ️ L\'expert devra confirmer. Remboursement gratuit si +24h avant la session.
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setStep("menu")} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:700, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit" }}>← Retour</button>
              <button onClick={() => setStep("done_cancel")} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:13, background:"#B91C1C", color:C.white, fontFamily:SERIF }}>Confirmer l\'annulation</button>
            </div>
          </div>
        </>}

        {/* ── Reprog OK ────────────────────────────────────────────────────── */}
        {step === "done_reprog" && (
          <div style={{ padding:"32px 22px 36px", textAlign:"center" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 22px" }}/>
            <div style={{ fontSize:44, marginBottom:14 }}>✅</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Session reprogrammée !</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:6 }}>
              Nouvelle date proposée :<br/>
              <b style={{ color:C.ink }}>{newBooking.date?.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</b> à <b style={{ color:C.ink }}>{newBooking.slot}</b>
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:24 }}>En attente de confirmation par {expert.name.split(" ")[0]}</div>
            <button onClick={onClose} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:C.ink, color:C.white, fontFamily:SERIF }}>Parfait !</button>
          </div>
        )}

        {/* ── Cancel OK ────────────────────────────────────────────────────── */}
        {step === "done_cancel" && (
          <div style={{ padding:"32px 22px 36px", textAlign:"center" }}>
            <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 22px" }}/>
            <div style={{ fontSize:44, marginBottom:14 }}>📋</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Demande envoyée</div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:14 }}>
              Ta demande a été transmise à {expert.name.split(" ")[0]}.<br/>
              Statut : <b style={{ color:"#92400E" }}>En attente d\'annulation</b>
            </div>
            <div style={{ background:"#FEF3C7", borderRadius:12, padding:"11px 14px", marginBottom:22, fontSize:12, color:"#92400E", lineHeight:1.6 }}>
              ⏳ Le remboursement sera traité après confirmation de l\'expert.
            </div>
            <button onClick={onClose} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:C.ink, color:C.white, fontFamily:SERIF }}>Compris</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── ReviewModal — 3 questions stratégiques Savvy ──────────────────────────────
function ReviewModal({ session, onClose }) {
  const [q1, setQ1] = useState(null); // "oui" | "partiel" | "non"
  const [q2, setQ2] = useState(null); // "oui" | "non"
  const [q3, setQ3] = useState(0);   // 1–5
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  const isComplete = q1 !== null && q2 !== null && q3 > 0;

  if (done) return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:50 }}/>
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:C.white, zIndex:60, borderRadius:"24px 24px 0 0", padding:"32px 22px 40px", textAlign:"center" }}>
        <div style={{ width:36, height:4, borderRadius:2, background:C.cream3, margin:"0 auto 22px" }}/>
        <div style={{ fontSize:52, marginBottom:16 }}>✦</div>
        <div style={{ fontSize:20, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:10 }}>Merci pour ton retour !</div>
        <div style={{ fontSize:13, color:C.muted, lineHeight:1.7, marginBottom:14 }}>
          Ton évaluation alimente le <b style={{ color:C.ink }}>Savvy Trust Score</b> de {session.expert?.name?.split(" ")[0]} et aide la communauté à prendre de meilleures décisions.
        </div>
        <div style={{ background:C.goldL, borderRadius:13, padding:"11px 14px", marginBottom:22, border:`1px solid ${C.goldB}`, fontSize:12, color:C.gold, lineHeight:1.6 }}>
          💡 Ton avis contribue à l\'Exartitude de la plateforme.
        </div>
        <button onClick={onClose} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:SERIF }}>Parfait !</button>
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

          {/* Q1 — Résolution du problème */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:4 }}>
              1. Est-ce que {session.expert?.name?.split(" ")[0]} a résolu ton problème ?
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>C\'est la question la plus importante.</div>
            <div style={{ display:"flex", gap:8 }}>
              {[
                {v:"oui",    l:"✅ Oui, complètement",   bg:"#D1FAE5", border:"rgba(5,150,105,.4)",  color:"#065F46"},
                {v:"partiel",l:"⚡ Partiellement",        bg:"#FEF3C7", border:"rgba(217,119,6,.4)",  color:"#92400E"},
                {v:"non",    l:"❌ Non",                   bg:"#FEE2E2", border:"rgba(185,28,28,.4)",  color:"#B91C1C"},
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
              2. Avait-il une expérience réelle sur le sujet ?
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>Pas une formation — une vraie expérience vécue.</div>
            <div style={{ display:"flex", gap:8 }}>
              {[
                {v:"oui", l:"✅ Oui, clairement", bg:"#D1FAE5", border:"rgba(5,150,105,.4)", color:"#065F46"},
                {v:"non",  l:"❌ Je ne sais pas",  bg:"#FEE2E2", border:"rgba(185,28,28,.4)", color:"#B91C1C"},
              ].map(opt => (
                <button key={opt.v} onClick={()=>setQ2(opt.v)}
                  style={{ flex:1, padding:"12px 10px", borderRadius:12, border:`2px solid ${q2===opt.v?opt.border:"transparent"}`, background:q2===opt.v?opt.bg:C.cream2, cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:q2===opt.v?700:500, color:q2===opt.v?opt.color:C.muted, textAlign:"center", transition:"all .2s" }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Q3 — Recommandation 1-5 */}
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:4 }}>
              3. Le recommanderais-tu ?
            </div>
            <div style={{ fontSize:11, color:C.muted, marginBottom:12 }}>Ta note publique sur son profil.</div>
            <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={()=>setQ3(s)} onMouseEnter={()=>setHovered(s)} onMouseLeave={()=>setHovered(0)}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:4, transition:"transform .15s", transform:s<=(hovered||q3)?"scale(1.2)":"scale(1)" }}>
                  <svg width={38} height={38} viewBox="0 0 24 24" fill={s<=(hovered||q3)?"#B8864A":"#E7E2D9"}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                </button>
              ))}
            </div>
            {q3 > 0 && <div style={{ textAlign:"center", fontSize:13, color:C.gold, fontWeight:700, marginTop:8 }}>
              {["","Décevant — ne pas recommander","Peut mieux faire","Correct — quelques réserves","Très bien — je recommande","Excellent ! Je le recommande vivement"][q3]}
            </div>}
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
            <button onClick={()=>{ if(!isComplete){alert("Réponds aux 3 questions pour continuer."); return;} setDone(true); }}
              style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background:isComplete?C.ink:C.cream3, color:isComplete?C.white:C.muted, fontWeight:700, fontSize:14, cursor:isComplete?"pointer":"not-allowed", fontFamily:SERIF, transition:"all .2s" }}>
              Publier mon évaluation ✦
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Helpers calendrier ────────────────────────────────────────────────────────
function getCountdown(hoursUntil) {
  if (hoursUntil == null) return null;
  if (hoursUntil <= 0)   return { label:"En cours ●", color:"#10B981", pulse:true };
  if (hoursUntil < 1)    return { label:"Dans moins d'1h", color:"#EF4444", pulse:true };
  if (hoursUntil < 3)    return { label:`Dans ${Math.round(hoursUntil)}h`, color:"#EF4444", pulse:false };
  if (hoursUntil < 24)   return { label:"Aujourd'hui", color:"#F59E0B", pulse:false };
  if (hoursUntil < 48)   return { label:"Demain", color:"#6366F1", pulse:false };
  return null;
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

// ─── PaymentModal ─────────────────────────────────────────────────────────────
function PaymentModal({ session, expert, onClose, onPaid }) {
  const [cardNum, setCardNum] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  const formatCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExp  = v => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };
  const isValid = cardNum.replace(/\s/g,"").length>=15 && cardExp.length===5 && cardCvv.length>=3 && cardName.length>2;

  const handlePay = async () => {
    if (!isValid) return;
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          amount: session.price,
          expertName: expert.name,
          phaseName: session.topic || session.phase_name || "Session",
          bookingId: session.id,
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Erreur paiement");
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setPaying(false);
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(28,31,23,0.6)",zIndex:9000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:C.white,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:430,padding:"20px 20px 36px",boxShadow:"0 -4px 32px rgba(0,0,0,0.2)",maxHeight:"90vh",overflowY:"auto"}}>
        {done ? (
          <div style={{textAlign:"center",padding:"30px 10px"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:C.sageL,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{fontSize:18,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:8}}>Paiement confirmé !</div>
            <div style={{fontSize:13,color:C.muted}}>Votre session avec {expert.name.split(" ")[0]} est réservée.</div>
          </div>
        ) : (
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Procéder au paiement</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>Session avec {expert.name.split(" ")[0]} · {session.price}€</div>
              </div>
              <button onClick={onClose} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 12px",fontSize:12,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
            </div>

            {/* Apple Pay */}
            <button onClick={()=>{ setPaying(true); setTimeout(()=>{ updateBooking(session.id,{paid:true}); try{localStorage.setItem(`savvy_paid_${session.id}`,"1");}catch{} setDone(true); setPaying(false); setTimeout(()=>onPaid&&onPaid(),1800); },1200); }}
              style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:"#000",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.37c1.29.07 2.18.74 2.93.8 1.11-.23 2.18-.95 3.37-.86 1.42.14 2.49.68 3.19 1.73-2.93 1.73-2.24 5.54.51 6.61-.57 1.55-1.32 3.08-2 3.63zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple Pay
            </button>

            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <div style={{flex:1,height:1,background:C.border}}/>
              <span style={{fontSize:11,color:C.faint}}>ou carte bancaire</span>
              <div style={{flex:1,height:1,background:C.border}}/>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              <input placeholder="Nom sur la carte" value={cardName} onChange={e=>setCardName(e.target.value)}
                style={{padding:"11px 14px",borderRadius:11,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.cream2}}/>
              <input placeholder="1234 5678 9012 3456" value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))}
                inputMode="numeric"
                style={{padding:"11px 14px",borderRadius:11,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.cream2,letterSpacing:2}}/>
              <div style={{display:"flex",gap:10}}>
                <input placeholder="MM/AA" value={cardExp} onChange={e=>setCardExp(formatExp(e.target.value))}
                  inputMode="numeric"
                  style={{flex:1,padding:"11px 14px",borderRadius:11,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.cream2}}/>
                <input placeholder="CVV" value={cardCvv} onChange={e=>setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))}
                  inputMode="numeric"
                  style={{width:80,padding:"11px 14px",borderRadius:11,border:`1.5px solid ${C.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:C.cream2}}/>
              </div>
            </div>

            <button onClick={handlePay} disabled={!isValid||paying}
              style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:isValid&&!paying?"pointer":"default",fontWeight:700,fontSize:15,fontFamily:SERIF,
                background:isValid&&!paying?C.ink:C.cream3,color:isValid&&!paying?C.white:C.muted,transition:"all .2s"}}>
              {paying ? "Traitement en cours…" : `Payer ${session.price}€ →`}
            </button>

            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:10}}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span style={{fontSize:10,color:C.faint}}>Paiement sécurisé SSL · Powered by Stripe</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ReservationsScreen ────────────────────────────────────────────────────────
const SESSIONS_AVENIR = [
  { id:1, eid:0, topic:"Recommandation hôtel pour Paris en juillet",   date:"Demain",       time:"10:00", hoursUntil:20,  duration:"1h", format:"🎥 Vidéo", price:10,  status:"confirmed", statusLabel:"Confirmée"  },
  { id:2, eid:2, topic:"Optimisation de mon laboratoire — diagnostic", date:"Sam. 31 mai",  time:"14:00", hoursUntil:36,  duration:"2h", format:"🎥 Vidéo", price:150, status:"pending",   statusLabel:"En attente" },
  { id:3, eid:1, topic:"Recette signature & conseils fournisseurs",    date:"Mar. 3 juin",  time:"11:00", hoursUntil:96,  duration:"1h", format:"🎥 Vidéo", price:25,  status:"confirmed", statusLabel:"Confirmée"  },
];
const SESSIONS_PASSEES = [
  { id:3, eid:1, topic:"Recette macaron & liste fournisseurs",  date:"15 mai 2025", time:"15:00", duration:"1h", format:"🎥 Vidéo",    price:20, rating:5 },
  { id:4, eid:4, topic:"Export Colombie — est-ce faisable ?",   date:"8 mai 2025",  time:"10:30", duration:"1h", format:"📄 Document", price:50, rating:5 },
];
const SESSIONS_ANNULEES = [
  { id:5, eid:3, topic:"Supply chain · diagnostic rapide", date:"2 mai 2025", time:"11:00", duration:"30 min", format:"🎥 Vidéo", price:80, annuledBy:"client", motif:"Changement de planning" },
];
const CLIENT_FAVS_DATA = [EXPERTS[0], EXPERTS[1], EXPERTS[2], EXPERTS[3]];
const AVIS_DONNES = [
  { id:1, eid:1, date:"15 mai 2025", stars:5, text:"Marie est extraordinaire — pédagogue, patiente et très pro. Mes macarons sont enfin réussis !" },
  { id:2, eid:4, date:"8 mai 2025",  stars:5, text:"Lucas connaît chaque détail de la douane colombienne. Rapport livré en 24h, impeccable." },
];

function SessionCard({ s, onMsg, onCancel, onExpert, onPay }) {
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
            <div style={{ width:42, height:42, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, border:`1.5px solid ${C.border}` }}>{expert.initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{expert.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{expert.role.split("·")[0].trim()}</div>
            </div>
          </div>
          <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:s.status==="confirmed"?C.sageL:s.status==="pending"?"#FEF3C7":C.cream2, color:s.status==="confirmed"?C.sage:s.status==="pending"?"#B45309":"#92400E", fontWeight:700, border:s.status==="pending"?"1.5px solid #FCD34D":"none" }}>
            {s.status==="pending"?"⏳ "+s.statusLabel:s.statusLabel}
          </span>
        </div>
        <div style={{ background:C.cream2, borderRadius:10, padding:"9px 12px", marginBottom:12, borderLeft:`2px solid ${expert.color}` }}>
          <div style={{ fontSize:12, color:C.soft, lineHeight:1.5 }}>{s.topic}</div>
        </div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:14 }}>
          <span style={{ fontSize:12, color:C.muted, display:"flex", gap:4, alignItems:"center" }}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>{s.date} · {s.time}</span>
          <span style={{ fontSize:12, color:C.muted, display:"flex", gap:4, alignItems:"center" }}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>{s.duration}</span>
          <span style={{ fontSize:12, color:C.muted }}>{s.format}</span>
          <span style={{ fontSize:12, color:C.muted, display:"flex", gap:3, alignItems:"center" }}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>{s.price}€</span>
        </div>
        {/* Pending action hint */}
        {s.status==="pending" && (
          <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:10,padding:"9px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>⏳</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:"#92400E"}}>En attente de confirmation</div>
              <div style={{fontSize:11,color:"#B45309",marginTop:1}}>L'expert doit accepter votre demande avant de pouvoir procéder au paiement.</div>
            </div>
          </div>
        )}
        {/* Payment CTA for confirmed unpaid sessions */}
        {s.status==="confirmed" && !s.paid && (
          <div style={{background:"linear-gradient(135deg,#FEF3C7,#FFFBEB)",border:"1.5px solid #FDE68A",borderRadius:12,padding:"11px 13px",marginBottom:10,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
            onClick={()=>onPay&&onPay(s)}>
            <div style={{width:36,height:36,borderRadius:10,background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><rect x={1} y={4} width={22} height={16} rx={2} ry={2}/><line x1={1} y1={10} x2={23} y2={10}/></svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:"#92400E"}}>✓ {expert.name.split(" ")[0]} a accepté votre demande !</div>
              <div style={{fontSize:11,color:"#B45309",marginTop:1}}>Procédez au paiement pour confirmer · {s.price}€</div>
            </div>
            <div style={{padding:"6px 12px",borderRadius:20,background:"#F59E0B",color:"white",fontSize:12,fontWeight:700,flexShrink:0}}>Payer →</div>
          </div>
        )}
        <div style={{ display:"flex", gap:8 }}>
          {isToday && s.status==="confirmed" && (
            <button onClick={()=>{
              const meetUrl = `https://meet.savvy.fr/session-${s.id}`;
              if(navigator.share){ navigator.share({title:`Session avec ${expert.name}`,url:meetUrl}).catch(()=>{}); }
              else { try{navigator.clipboard.writeText(meetUrl);}catch{} window.open(meetUrl,"_blank"); }
            }} style={{ flex:2, padding:"10px", borderRadius:11, border:"none", cursor:"pointer", fontWeight:700, fontSize:12, background:C.sage, color:C.white, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><polygon points="23 7 16 12 23 17 23 7"/><rect x={1} y={5} width={15} height={14} rx={2}/></svg>
              Rejoindre la session
            </button>
          )}
          <button onClick={() => onMsg && onMsg(expert, "reservations")} style={{ flex:1, padding:"10px", borderRadius:11, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:12, background:C.white, color:C.ink, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message
          </button>
          <button onClick={() => onCancel && onCancel(s)} style={{ flex:1, padding:"10px", borderRadius:11, border:`1px solid #FCA5A5`, cursor:"pointer", fontWeight:600, fontSize:12, background:"#FFF5F5", color:"#B91C1C", fontFamily:"inherit" }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

function PastCard({ s, onExpert, onResume, onReview }) {
  const expert = EXPERTS[s.eid];
  if (!expert) return null;
  return (
    <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:12 }}>
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, border:`1.5px solid ${C.border}` }}>{expert.initials}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{expert.name}</div>
          <div style={{ fontSize:11, color:C.muted }}>{s.date} · {s.format}</div>
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
        <button onClick={() => onExpert && onExpert(expert)} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${C.goldB}`, cursor:"pointer", fontWeight:700, fontSize:12, background:C.goldL, color:C.gold, fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>Répéter
        </button>
      </div>
    </div>
  );
}

function ReservationsScreen({ onExpert, onMsg, isLoggedIn, onLogin, onNavigate, onPendingChange, isRealUser=false, authUser=null }) {
  const [tab, setTab] = useState("avenir");
  const [cancelSession, setCancelSession] = useState(null);
  const [resumeSession, setResumeSession] = useState(null);
  const [reviewSession, setReviewSession] = useState(null);
  const [calView, setCalView] = useState(false);
  const [paySession, setPaySession] = useState(null);

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
    format: "🎥 " + (b.format||"Vidéo"),
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
        const { data: experts } = await supabase.from("experts").select("id, name, initials, bg, color, role").in("id", expertIds);
        (experts||[]).forEach(e => { expertMap[e.id] = e; });
      }
      const mapped = bookingsData.map(b => {
        const exp = expertMap[b.expert_id] || {};
        return {
          id: b.id,
          eid: b.expert_id,
          expertInitials: exp.initials || "?",
          expertData: { name: exp.name || "Expert", initials: exp.initials || "?", bg: exp.bg || "#EDE8DF", color: exp.color || "#8B7355", role: exp.role || "", id: b.expert_id },
          topic: b.notes || b.phase_name || "Session",
          date: b.date_session ? new Date(b.date_session).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}) : "À confirmer",
          time: b.date_session ? new Date(b.date_session).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) : "À confirmer",
          hoursUntil: b.date_session ? Math.max(1, Math.round((new Date(b.date_session) - new Date()) / 3600000)) : 48,
          duration: "1h",
          format: "🎥 Vidéo",
          price: b.phase_price || 0,
          status: b.status,
          statusLabel: b.status === "confirmed" ? "Confirmée" : b.status === "cancelled" ? "Annulée" : "En attente",
          paid: !!localStorage.getItem(`savvy_paid_${b.id}`),
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
  const sbPending   = sbBookings.filter(b=>b.status==="pending");
  const sbConfirmed = sbBookings.filter(b=>b.status==="confirmed");
  const sbCancelled = sbBookings.filter(b=>b.status==="cancelled");

  // Filter demo sessions to exclude experts already in LS bookings
  const lsExpertIds = new Set(dedupedBookings.filter(b=>b.status!=="cancelled").map(b=>b.expertId));
  const filteredSessionsAvenir = sessionsAvenir.filter(s=>!lsExpertIds.has(EXPERTS[s.eid]?.id));

  // Pour utilisateurs réels → Supabase uniquement. Sinon → demo + LS
  const allAvenir   = authUser?.real
    ? [...sbPending, ...sbConfirmed]
    : [...lsPending, ...lsConfirmed, ...filteredSessionsAvenir];
  const allAnnulees = authUser?.real
    ? [...sbCancelled]
    : [...lsCancelled, ...sessionsCancelees];
  const pendingCount = allAvenir.filter(s=>s.status==="pending").length;
  useEffect(() => { onPendingChange && onPendingChange(pendingCount); }, [pendingCount]);
  if (!isLoggedIn) return (
    <LoginGate icon={<svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.6}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>} title="Tes réservations t\'attendent" sub="Connecte-toi pour voir et gérer tes sessions avec les experts." onLogin={onLogin}/>
  );

  const TABS = [
    { id:"avenir",   label:"À venir",   count:allAvenir.length   },
    { id:"passees",  label:"Passées",   count:isRealUser ? 0 : SESSIONS_PASSEES.length  },
    { id:"annulees", label:"Annulées",  count:allAnnulees.length },
  ];

  const ConfirmNotifOverlay = confirmNotif && (
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 16px 32px",pointerEvents:"none"}}>
      <div style={{background:"linear-gradient(135deg,#1C1917,#292524)",borderRadius:22,padding:"22px 22px 24px",width:"100%",maxWidth:420,boxShadow:"0 8px 40px rgba(0,0,0,0.35)",pointerEvents:"auto",animation:"slideUp .4s cubic-bezier(.16,1,.3,1)"}}>
        <style>{`@keyframes slideUp{from{transform:translateY(120px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
          <div style={{width:48,height:48,borderRadius:16,background:"linear-gradient(135deg,#D97706,#F59E0B)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:22}}>✅</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#FAFAF9",fontFamily:SERIF,lineHeight:1.2}}>Session confirmée !</div>
            <div style={{fontSize:12,color:"rgba(250,250,249,.6)",marginTop:3}}>{confirmNotif.expertName} a accepté votre demande</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {[{icon:"📅",val:confirmNotif.date||"À définir"},{icon:"⏰",val:confirmNotif.time||"—"},{icon:"💶",val:`${confirmNotif.price||0}€`}].map(({icon,val})=>(
            <div key={val} style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:12,padding:"9px 6px",textAlign:"center"}}>
              <div style={{fontSize:13}}>{icon}</div>
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
              {calView ? "✕ Fermer" : "📅 Calendrier"}
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
        {calView && (
          <div style={{ padding:"14px 18px", background:C.cream2, borderBottom:`1px solid ${C.border}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:C.ink, marginBottom:12, fontFamily:SERIF }}>Tes sessions · vue calendrier</div>
            <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, overflow:"hidden" }}>
              {[{date:"Demain",time:"10:00",expert:"Clément R.",color:C.gold,bg:C.goldL},{date:"Jeu. 29 mai",time:"14:00",expert:"Patrick G.",color:C.teal,bg:C.tealL}].map((s,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderBottom:i===0?`1px solid ${C.borderF}`:"none" }}>
                  <div style={{ width:48, height:48, borderRadius:11, background:s.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <div style={{ fontSize:9, fontWeight:600, color:s.color, textTransform:"uppercase" }}>{s.date.split(" ")[0]}</div>
                    <div style={{ fontSize:14, fontWeight:800, color:s.color, fontFamily:SERIF }}>{s.time}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{s.expert}</div>
                    <div style={{ fontSize:11, color:C.muted }}>Session confirmée · 🎥 Vidéo</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      {g.sessions.map(s=><SessionCard key={s.id} s={s} onMsg={onMsg} onCancel={setCancelSession} onExpert={onExpert} onPay={setPaySession}/>)}
                    </div>
                  ));
                })()
              : (
                <div style={{ textAlign:"center", padding:"60px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth={1.5}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg></div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Aucune session à venir</div>
                  <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Trouve un expert et réserve ta première session.</div>
                  <button onClick={() => onNavigate && onNavigate("search")} style={{ padding:"12px 24px", borderRadius:12, border:"none", background:C.sage, color:C.white, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Trouver un expert →</button>
                </div>
              )
          )}
          {/* Passées */}
          {tab === "passees" && (
            (!isRealUser && SESSIONS_PASSEES.length > 0)
              ? SESSIONS_PASSEES.map(s => <PastCard key={s.id} s={s} onExpert={onExpert} onResume={setResumeSession} onReview={setReviewSession}/>)
              : <div style={{ textAlign:"center", padding:"48px 0", color:C.muted }}>Aucune session passée.</div>
          )}
          {/* Annulées */}
          {tab === "annulees" && (
            allAnnulees.length > 0 ? (
              allAnnulees.map(s => {
                const expert = EXPERTS[s.eid];
                if (!expert) return null;
                return (
                  <div key={s.id} style={{ background:C.white, borderRadius:16, border:"1.5px solid #FEE2E2", overflow:"hidden", marginBottom:12 }}>
                    <div style={{ height:4, background:"linear-gradient(90deg,#B91C1C,#FEE2E2)" }}/>
                    <div style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", gap:11, alignItems:"center", marginBottom:11 }}>
                        <div style={{ width:42, height:42, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{expert.initials}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{expert.name}</div>
                          <div style={{ fontSize:11, color:C.muted }}>{expert.role.split("·")[0].trim()}</div>
                        </div>
                        <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"#FFF5F5", color:"#B91C1C", fontWeight:700, border:"1px solid #FEE2E2", display:"flex", alignItems:"center", gap:4 }}><svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>Annulée</span>
                      </div>
                      <div style={{ background:"#FFF5F5", borderRadius:10, padding:"9px 13px", marginBottom:10 }}>
                        <div style={{ fontSize:12, color:C.soft, display:"flex", gap:6, alignItems:"flex-start" }}>
                          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2} style={{flexShrink:0,marginTop:1}}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>
                          {s.topic}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:10 }}>
                        <span style={{ fontSize:11, color:C.muted, display:"flex", gap:4, alignItems:"center" }}><svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>{s.date} · {s.time}</span>
                        <span style={{ fontSize:11, color:C.muted }}>{s.format}</span>
                        <span style={{ fontSize:11, color:C.muted, display:"flex", gap:3, alignItems:"center" }}><svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>{s.price}€</span>
                      </div>
                      <div style={{ background:C.cream2, borderRadius:9, padding:"8px 12px", fontSize:11, color:C.muted, display:"flex", gap:7, alignItems:"center" }}>
                        <span>Annulée par : <b style={{ color:C.ink }}>{s.annuledBy==="client"?"le client":"l\'expert"}</b></span>
                        <span>·</span>
                        <span>Motif : {s.motif}</span>
                      </div>
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
      {reviewSession && <ReviewModal session={reviewSession} onClose={()=>setReviewSession(null)}/>}
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
          session={{ ...cancelSession, expert: EXPERTS[cancelSession.eid] }}
          onClose={(wasCancelled) => {
            if (wasCancelled) {
              // Move session from avenir to annulées
              const s = cancelSession;
              setSessionsAvenir(prev => prev.filter(x => x.id !== s.id));
              setSessionsCancelees(prev => [...prev, { ...s, annuledBy:"client", annuledDate:"Aujourd\'hui" }]);
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
              <div style={{ background:C.cream2, borderRadius:11, padding:"11px 14px", fontSize:13, color:C.soft, lineHeight:1.6 }}>💡 {resumeSession.topic}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:18 }}>
              {[{l:"Format",v:resumeSession.format},{l:"Durée",v:resumeSession.duration||"1h"},{l:"Montant payé",v:`${resumeSession.price}€`},{l:"Statut",v:"✅ Terminée"}].map(item => (
                <div key={item.l} style={{ background:C.cream2, borderRadius:10, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}>{item.l}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{item.v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={() => setResumeSession(null)} style={{ flex:1, padding:"12px", borderRadius:12, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit" }}>Fermer</button>
              <button onClick={() => { onExpert && onExpert(resumeSession.expert); setResumeSession(null); }} style={{ flex:2, padding:"12px", borderRadius:12, border:`1px solid ${C.goldB}`, cursor:"pointer", fontWeight:700, fontSize:13, background:C.goldL, color:C.gold, fontFamily:"inherit" }}>
                🔁 Répéter cette session
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── SignupScreen ──────────────────────────────────────────────────────────────
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
    step1Title: "Qui es-tu ?",
    addPhoto: "Ajouter photo", photoAdded: "Photo ajoutée · touche pour changer", photoHint: "Photo de profil (recommandée)",
    labelPrenom: "Prénom", labelNom: "Nom",
    labelEmail: "Email du compte", emailLocked: "Même compte que client · non modifiable",
    labelPays: "Pays de résidence", labelLangs: "Langues parlées",
    continueBtn: "Continuer →",
    errName: "Prénom et nom obligatoires.", errLang: "Sélectionne au moins une langue.",
    // step 2
    step2Title: "Ton expertise",
    step2H: "Qu'est-ce que tu sais vraiment faire ?", step2Sub: "Ton vécu, pas ton diplôme.",
    domainLabel: "Ton domaine", specialLabel: "Spécialité",
    taglineLabel: "En une phrase, ce que tu apportes",
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
    proofLabel: "🔗 Preuve", proofOpt: "(optionnel)",
    proofLien: "🔗 Lien URL", proofFile: "📎 Fichier",
    proofFilePh: "Choisir un fichier (PDF, image)",
    proofUrlPh: "https://linkedin.com/in/tonprofil ou lien portfolio",
    bioLabel: "📝 Bio", bioOpt: "(optionnel)",
    bioNote: "Ajoute-la plus tard si tu veux — tu peux aussi la générer avec l'IA depuis ton profil.",
    bioPh: "Ex : Ancienne gestionnaire de copropriété pendant 6 ans…",
    errResult: "Décris un résultat réel (20 caractères min).",
    // step 5
    step5Title: "Tes disponibilités",
    step5H: "Quand es-tu disponible ?", step5Sub: "Les clients voient tes créneaux en temps réel — sois précis.",
    dispoNow: {title:"Je configure maintenant", sub:"Mets tes créneaux en ligne tout de suite", icon:"🟢"},
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
    publishBtn: "Publier mon profil ✦",
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

function SignupScreen({ onBack, onDone, authUser }) {
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
    formats: { video:{on:false,dur:"1h",price:""}, audio:{on:false,dur:"30min",price:""}, chat:{on:false,dur:"30min",price:""}, doc:{on:false,dur:"48h",price:""} },
    result1:"", proof1:"", bio:"",
    dispoJours:{}, dispoStart:"09:00", dispoEnd:"18:00", dispoChoice:"", dispoMode:"recurrent",
    proof1Type:"lien",
  });
  const patch = (p) => setForm(f => ({...f,...p}));
  const [showCguModal, setShowCguModal] = useState(false);
  const TOTAL_STEPS = 6;
  const pct = Math.round((Math.max(0,step-1) / TOTAL_STEPS) * 100);

  const [exIdx] = useState(0);
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
            {icon:"📸", label:T.pendingPhoto, done:!!form.photoUrl},
            {icon:"✍️", label:T.pendingBio,   done:!!(form.bio&&form.bio.trim().length>10)},
            {icon:"🗓️", label:T.pendingDispo, done:hasDispoConfigured},
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
                  <span style={{fontSize:18}}>{item.icon}</span>
                  <span style={{fontSize:13,color:C.soft}}>{item.label}</span>
                </div>
              ))}
            </div>
          );
        })()}

        <button onClick={()=>{ if(onDone&&finalProfile) onDone(finalProfile); else onBack(); }}
          style={{width:"100%",padding:"15px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:SERIF}}>
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
    {id:"chat",  icon:"💬", label:"Chat",        sub:"Messagerie",        durs:["30min","1h"]},
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
        <p style={{fontSize:12,color:C.muted,margin:"0 0 20px",lineHeight:1.6}}>{T.step2Sub}</p>

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

        {/* Format cards avec durée par format */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {FMT.map(f=>{
            const on=form.formats[f.id]?.on;
            const curDur=form.formats[f.id]?.dur || f.durs[1] || f.durs[0];
            return (
              <div key={f.id} style={{borderRadius:14,border:on?`2px solid ${C.ink}`:`1px solid ${C.border}`,background:on?C.ink:C.white,transition:"all .15s",overflow:"hidden"}}>
                <button onClick={()=>patchFmt(f.id,"on",!on)}
                  style={{width:"100%",padding:"14px 16px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",background:"transparent",border:"none",display:"flex",alignItems:"center",gap:14}}>
                  <div style={{fontSize:24,flexShrink:0}}>{f.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:on?C.white:C.ink}}>{f.label}</div>
                    <div style={{fontSize:11,color:on?"rgba(253,252,248,.6)":C.muted,marginTop:1}}>{f.sub}</div>
                  </div>
                  <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${on?C.white:C.border}`,background:on?C.white:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {on&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </button>
                {on&&(
                  <div style={{padding:"0 16px 14px",borderTop:`1px solid rgba(253,252,248,.15)`}}>
                    <div style={{fontSize:10,color:"rgba(253,252,248,.6)",marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>{T.durLabel}</div>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {f.durs.map(d=>(
                        <button key={d} onClick={()=>patchFmt(f.id,"dur",d)}
                          style={{padding:"6px 12px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:600,border:`1.5px solid ${curDur===d?"rgba(253,252,248,1)":"rgba(253,252,248,.3)"}`,background:curDur===d?"rgba(253,252,248,.2)":"transparent",color:C.white,transition:"all .15s"}}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prix orientatif — un seul champ global */}
        <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px",marginBottom:8}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{T.priceLabel}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:12}}>{T.priceNote}</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{position:"relative",flex:1}}>
              <input type="number" min={1} value={form.formats.video?.price||""} onChange={e=>{
                const v=e.target.value;
                patch({formats:Object.fromEntries(FMT.map(f=>[f.id,{...form.formats[f.id],price:v}]))});
              }} placeholder="50"
                style={{width:"100%",padding:"12px 44px 12px 16px",borderRadius:12,border:`1px solid ${C.border}`,fontSize:22,fontFamily:SERIF,fontWeight:700,color:C.ink,outline:"none",boxSizing:"border-box"}}/>
              <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:18,fontWeight:700,color:C.muted,fontFamily:SERIF}}>€</span>
            </div>
            {(form.formats.video?.price||0)>0&&(
              <div style={{background:C.sageL,borderRadius:11,padding:"10px 14px",textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:16,fontWeight:700,color:C.sage,fontFamily:SERIF}}>{Math.round((form.formats.video?.price||0)*.8)}€</div>
                <div style={{fontSize:9,color:C.sage}}>pour toi</div>
              </div>
            )}
          </div>
        </div>

        {!Object.values(form.formats).some(f=>f.on)&&(
          <div style={{textAlign:"center",fontSize:12,color:C.muted,padding:"8px 0"}}>{T.selectFormat}</div>
        )}

        <div style={{display:"flex",gap:9,marginTop:16}}>
          <button onClick={()=>setStep(2)} style={{flex:1,padding:"13px",borderRadius:13,border:`1.5px solid ${C.border}`,cursor:"pointer",fontWeight:700,fontSize:13,background:C.white,color:C.ink,fontFamily:"inherit"}}>{T.backBtn}</button>
          <button onClick={()=>{
            const price=Number(form.formats.video?.price||0);
            if(!Object.values(form.formats).some(f=>f.on)){alert(T.errFormat); return;}
            if(price<=0){alert(T.errPrice); return;}
            setStep(4);
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
        <p style={{fontSize:12,color:C.muted,margin:"0 0 20px",lineHeight:1.6}}>{T.step4Sub}</p>

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
              phases:activeFormats.map((f,i)=>({id:i+1,name:f.label,what:`${f.label} ${form.formats[f.id].dur}`,format:f.id,price:Number(form.formats[f.id].price)||0,inc:[]})),
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
                cat:form.category, verified:false, active:true,
                phases:builtProfile.phases,
                creds:builtProfile.creds, metrics:[],
                photo_url:form.photoUrl?.startsWith("http")?form.photoUrl:null,
              };
              const{error}=await supabase.from("experts").insert(expertData);
              if(error) console.warn("Expert non sauvegardé:",error.message);
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

// ─── TrustBadge ────────────────────────────────────────────────────────────────
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

// ─── ProfileScreen ─────────────────────────────────────────────────────────────
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

function ProfileScreen({ onSignup, onViewPublic, isExpert, onBecomeExpert, onLogout, authUser, isLoggedIn, onLogin, onNavigate, newExpertProfile, initExpSection, appMode, onRequestsChange }) {
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
  // Use newly created profile if exists, otherwise find in EXPERTS array
  const [sbExpertData, setSbExpertData] = useState(null);
  useEffect(() => {
    if (!authUser?.real || !authUser?.isExpert) return;
    supabase.from("experts").select("*").eq("user_id", authUser.id).single()
      .then(({ data }) => {
        if (data) {
          setSbExpertData(data);
          const offers = data.offres || data.phases || [];
          if (offers.length > 0) setExpOffres(offers);
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
      sessions:    expertUser?.reviews || 0,
      clients:     Math.floor((expertUser?.reviews || 0) * .87),
      satisfaction: expertUser?.rating ? Math.round(expertUser.rating/5*100) : 0,
      revenu:      (expertUser?.reviews || 0) * Math.round((expertUser?.phases?.[0]?.price || 50) * .8),
    },
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
          <button onClick={()=>{
            localStorage.setItem(`savvy_dispo_days_${dispoKey}`, JSON.stringify(dispoSelected));
            localStorage.setItem(`savvy_dispo_hours_${dispoKey}`, JSON.stringify(dispoHours));
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

// ─── NotificationPanel ─────────────────────────────────────────────────────────
function NotificationPanel({ onClose, onNavigate, isExpert, readNotifIds=[], onMarkRead, isNewExpert=false, expRequestsCount=0, unreadMsgsCount=0 }) {
  const NIcon = {
    msg:  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    bell: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    star: <svg width={16} height={16} viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>,
    euro: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1={12} y1={1} x2={12} y2={23}/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    check:<svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    info: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10}/><line x1={12} y1={8} x2={12} y2={12}/><line x1={12} y1={16} x2={12.01} y2={16}/></svg>,
    user: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>,
  };
  const NOTIFS_DATA = isNewExpert ? [
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

// ─── AuthModal ─────────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess, initialRegister }) {
  const [step, setStep] = useState(initialRegister?"register_method":"choice");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [isRegister, setIsRegister] = useState(!!initialRegister);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const r0=useRef(),r1=useRef(),r2=useRef(),r3=useRef(),r4=useRef(),r5=useRef();
  const otpRefs=[r0,r1,r2,r3,r4,r5];

  const handleOtpInput=(val,idx)=>{
    const n=[...otp]; n[idx]=val.slice(-1); setOtp(n);
    if(val&&idx<5) otpRefs[idx+1].current?.focus();
  };
  const handleOtpKey=(e,idx)=>{
    if(e.key==="Backspace"&&!otp[idx]&&idx>0) otpRefs[idx-1].current?.focus();
  };

  const loginAs = async (provider=null) => {
    if(provider==="google"||provider==="apple"){
      setLoading(true);
      try {
        await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: window.location.origin }
        });
      } catch { setLoading(false); }
      return;
    }
    setLoading(true);
    await new Promise(r=>setTimeout(r,1200));
    setLoading(false);
    onSuccess({email,name:email.split("@")[0]||"Utilisateur",isExpert:false});
  };

  const inp2={width:"100%",padding:"13px 15px",borderRadius:12,border:`1.5px solid ${C.border}`,fontSize:14,fontFamily:"inherit",color:C.ink,outline:"none",boxSizing:"border-box",background:C.cream2};

  const goBack=()=>{
    if(step==="otp"){setStep("email");return;}
    if(step==="reset"||step==="reset_sent"){setStep("choice");return;}
    if(step==="register_method"){setStep("choice");return;}
    if(step==="register_form"){setStep("register_method");return;}
    if(step==="register_sent"){setStep("choice");return;}
    if(step==="register"){setStep("choice");return;}
    setStep("choice");
  };

  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:100}}/>
      <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"92%",maxWidth:380,background:C.white,zIndex:110,borderRadius:24,padding:"28px 26px 26px",maxHeight:"92vh",overflowY:"auto",boxShadow:`0 24px 80px rgba(0,0,0,.25)`}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
          {step!=="choice"
            ? <button onClick={goBack} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:9,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
              </button>
            : <div/>}
          <div style={{width:44,height:44,borderRadius:13,background:C.ink,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:20,fontWeight:900,color:C.white,fontFamily:SERIF,letterSpacing:"-1px"}}>sv</span>
          </div>
          <button onClick={onClose} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:9,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.muted}}>×</button>
        </div>

        {/* ── CHOICE (login only) ──────────────────────────────────────────── */}
        {step==="choice" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>Content de te revoir !</h2>
            <p style={{fontSize:13,color:C.muted,margin:0}}>Connecte-toi à ton compte Savvy</p>
          </div>

          {/* Social */}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <button onClick={()=>loginAs("google")} disabled={!!socialLoading}
              style={{width:"100%",padding:"13px",borderRadius:13,border:`1.5px solid ${C.border}`,background:C.white,color:C.ink,fontSize:14,fontWeight:600,cursor:socialLoading?"wait":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:socialLoading&&socialLoading!=="google"?.5:1}}>
              {socialLoading==="google"
                ? <><div style={{width:18,height:18,borderRadius:"50%",border:`2px solid ${C.border}`,borderTopColor:C.ink,animation:"spin .7s linear infinite"}}/> Connexion…</>
                : <><svg width={20} height={20} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Continuer avec Google</>}
            </button>
            <button onClick={()=>loginAs("apple")} disabled={!!socialLoading}
              style={{width:"100%",padding:"13px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontSize:14,fontWeight:600,cursor:socialLoading?"wait":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:socialLoading&&socialLoading!=="apple"?.5:1}}>
              {socialLoading==="apple"
                ? <><div style={{width:18,height:18,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:C.white,animation:"spin .7s linear infinite"}}/> Connexion…</>
                : <><svg width={18} height={18} viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg> Continuer avec Apple</>}
            </button>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:12,color:C.faint}}>ou</span><div style={{flex:1,height:1,background:C.border}}/>
          </div>

          {/* Email login */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Adresse email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="camille@exemple.com" type="email" style={inp2}
              onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&setStep("email")}/>
          </div>
          <button onClick={()=>{if(!email.includes("@")){alert("Email invalide");return;}setIsRegister(false);setStep("email");}}
            style={{width:"100%",padding:"13px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:C.ink,color:C.white,fontFamily:SERIF,marginBottom:12}}>
            Se connecter →
          </button>
          <div style={{textAlign:"center",marginBottom:20,fontSize:12,color:C.muted}}>
            Pas encore de compte ?{" "}
            <button onClick={()=>{ setEmail(""); setPassword(""); setConfirmPassword(""); setFirstName(""); setLastName(""); setStep("register_method"); }} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:700,fontFamily:"inherit",fontSize:12}}>S\'inscrire gratuitement</button>
          </div>

          {/* ── Mode démo ─────────────────────────────────────────────── */}
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.6,textAlign:"center",marginBottom:12}}>
              ✦ Mode démo — tester l\'app
            </div>
            <div style={{display:"flex",gap:9}}>
              {Object.values(DEMO_USERS).map(u => (
                <button key={u.email} onClick={()=>onSuccess({...u})}
                  style={{flex:1,padding:"12px 10px",borderRadius:14,border:`1.5px solid ${u.isExpert?C.goldB:C.navyL}`,background:u.isExpert?C.goldL:C.navyL,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:u.avatar_bg,color:u.avatar_color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,margin:"0 auto 7px",border:`1.5px solid ${u.avatar_color}30`}}>{u.initials}</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.ink,marginBottom:2}}>{u.name.split(" ")[0]}</div>
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.3}}>{u.isExpert?"Expert ✦":"Client ✦"}</div>
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:C.faint,textAlign:"center",marginTop:10}}>
              Comptes de démonstration — aucun vrai compte créé
            </div>
          </div>
        </>}

        {/* ── REGISTER METHOD ──────────────────────────────────────── */}
        {step==="register_method" && <>
          <div style={{textAlign:"center",marginBottom:24}}>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>Comment veux-tu créer ton compte ?</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <button onClick={()=>setStep("register_form")}
              style={{width:"100%",padding:"14px",borderRadius:13,border:`1.5px solid ${C.border}`,background:C.white,color:C.ink,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2}><rect x={2} y={4} width={20} height={16} rx={2}/><path d="m2 7 10 7 10-7"/></svg>
              Adresse email
            </button>
            <button onClick={()=>loginAs("google")}
              style={{width:"100%",padding:"14px",borderRadius:13,border:`1.5px solid ${C.border}`,background:C.white,color:C.ink,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <svg width={20} height={20} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button onClick={()=>loginAs("apple")}
              style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </button>
          </div>
          <div style={{textAlign:"center",fontSize:12,color:C.muted}}>
            Déjà un compte ?{" "}
            <button onClick={()=>setStep("choice")} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:700,fontFamily:"inherit",fontSize:12}}>Se connecter</button>
          </div>
        </>}

        {/* ── REGISTER FORM (prénom + nom + email → magic link) ─────── */}
        {step==="register_form" && <>
          <div style={{textAlign:"center",marginBottom:22}}>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>Tes informations</h2>
            <p style={{fontSize:13,color:C.muted,margin:0}}>On t'envoie un lien sécurisé pour confirmer</p>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <div style={{flex:1}}>
              <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Prénom <span style={{color:"#DC2626"}}>*</span></label>
              <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Marie" type="text" style={inp2} autoFocus/>
            </div>
            <div style={{flex:1}}>
              <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Nom <span style={{color:"#DC2626"}}>*</span></label>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Dupont" type="text" style={inp2}/>
            </div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Adresse email <span style={{color:"#DC2626"}}>*</span></label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="marie@exemple.com" type="email" style={inp2}/>
            <p style={{fontSize:11,color:C.faint,margin:"6px 0 0",lineHeight:1.5}}>On t'enverra un lien sécurisé pour continuer.</p>
          </div>
          <button onClick={async()=>{
            if(!firstName.trim()){alert("Entre ton prénom.");return;}
            if(!lastName.trim()){alert("Entre ton nom.");return;}
            if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){alert("Entre une adresse email valide.\nExemple : marie@gmail.com");return;}
            setLoading(true);
            try {
              const { error } = await supabase.auth.signInWithOtp({ email, options:{ data:{ first_name:firstName.trim(), last_name:lastName.trim(), name:firstName.trim()+" "+lastName.trim() }, shouldCreateUser:true } });
              setLoading(false);
              if(error){ alert("Erreur : "+error.message); return; }
              setStep("register_sent");
            } catch(err){ setLoading(false); alert("Connexion impossible. Vérifie ta connexion internet."); }
          }} disabled={loading||!firstName.trim()||!lastName.trim()||!email.includes("@")}
            style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:(loading||!firstName.trim()||!lastName.trim()||!email.includes("@"))?"default":"pointer",fontWeight:700,fontSize:14,background:(loading||!firstName.trim()||!lastName.trim()||!email.includes("@"))?C.cream3:C.ink,color:(loading||!firstName.trim()||!lastName.trim()||!email.includes("@"))?C.muted:C.white,fontFamily:SERIF,marginBottom:12,transition:"background .2s"}}>
            {loading?"⏳ Envoi en cours…":"Envoyer le lien →"}
          </button>
          <p style={{textAlign:"center",fontSize:11,color:C.faint,margin:0,lineHeight:1.6}}>
            En continuant, tu acceptes nos <span style={{color:C.gold,fontWeight:600}}>Conditions d'utilisation</span> et notre <span style={{color:C.gold,fontWeight:600}}>Politique de confidentialité</span>.
          </p>
        </>}

        {/* ── REGISTER SENT (confirmation lien envoyé) ──────────────── */}
        {step==="register_sent" && <>
          <div style={{textAlign:"center",padding:"10px 0 24px"}}>
            <div style={{width:64,height:64,borderRadius:20,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",border:`1px solid ${C.goldB}30`}}>
              <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.8}><rect x={2} y={4} width={20} height={16} rx={2}/><path d="m2 7 10 7 10-7"/></svg>
            </div>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 10px",fontFamily:SERIF}}>Vérifie ta boîte mail</h2>
            <p style={{fontSize:14,color:C.muted,margin:"0 0 6px",lineHeight:1.6}}>
              On a envoyé un lien à
            </p>
            <p style={{fontSize:14,fontWeight:700,color:C.ink,margin:"0 0 18px"}}>{email}</p>
            <p style={{fontSize:13,color:C.muted,margin:"0 0 24px",lineHeight:1.6}}>
              Clique sur le lien dans l'email pour activer ton compte. Pense à vérifier tes spams si tu ne vois rien.
            </p>
            <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:C.ink,color:C.white,fontFamily:SERIF,marginBottom:12}}>
              J'ai compris ✓
            </button>
            <button onClick={async()=>{
              setLoading(true);
              await supabase.auth.signInWithOtp({ email, options:{ data:{ first_name:firstName, last_name:lastName, name:firstName+" "+lastName }, shouldCreateUser:true } });
              setLoading(false);
              alert("Lien renvoyé à "+email+" !");
            }} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:600,fontFamily:"inherit",fontSize:13}}>
              {loading?"Envoi…":"Renvoyer le lien"}
            </button>
          </div>
        </>}

        {/* ── EMAIL + PASSWORD (login) ────────────────────────────── */}
        {step==="email" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>{isRegister?"Créer mon compte":"Content de te revoir"}</h2>
            <p style={{fontSize:13,color:C.muted,margin:0}}>{email}</p>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:.5}}>{isRegister?"Choisis ton mot de passe":"Mot de passe"}</label>
            {isRegister && <p style={{fontSize:11,color:C.muted,margin:"0 0 8px",lineHeight:1.5}}>Min. 8 caractères, 1 chiffre et 1 caractère spécial (!@#$…)</p>}
            <div style={{ position:"relative" }}>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type={showPwd?"text":"password"} style={{...inp2, paddingRight:44}} autoFocus/>
            <button type="button" onClick={()=>setShowPwd(v=>!v)} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:18, padding:0 }}>
              {showPwd ? "🙈" : "👁"}
            </button>
          </div>
          </div>
          {isRegister && <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Confirmer</label>
            <input value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="••••••••" type="password" style={inp2}/>
          </div>}
          {!isRegister && <button onClick={()=>setStep("reset")} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:600,fontFamily:"inherit",fontSize:12,padding:"0 0 14px",display:"block"}}>Mot de passe oublié ?</button>}
          <button onClick={async ()=>{
            if(!password){alert("Entre ton mot de passe.");return;}
            if(isRegister&&password!==confirmPassword){alert("Les mots de passe ne correspondent pas.");return;}
            if(isRegister&&password.length<8){alert("Mot de passe : minimum 8 caractères.");return;}
            if(isRegister&&!/[0-9]/.test(password)){alert("Mot de passe : ajoute au moins un chiffre.");return;}
            if(isRegister&&!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)){alert("Mot de passe : ajoute au moins un caractère spécial (!@#$…).");return;}
            setLoading(true);
            try {
              const { data, error } = isRegister
                ? await supabase.auth.signUp({ email, password, options:{ data:{ name: email.split("@")[0] } } })
                : await supabase.auth.signInWithPassword({ email, password });
              setLoading(false);
              if (error) {
                const msgs = {
                  "Invalid login credentials":"Email ou mot de passe incorrect.",
                  "User already registered":"Un compte existe déjà avec cet email. Connecte-toi.",
                  "Email not confirmed":"Confirme ton email avant de te connecter (vérifie ta boîte mail).",
                };
                alert(msgs[error.message] || "Erreur : "+error.message);
                return;
              }
              const u = data.user;
              onSuccess({ email:u.email, name:u.user_metadata?.name || u.email.split("@")[0], isExpert:false, real:true });
            } catch(err) {
              setLoading(false);
              alert("Connexion impossible. Vérifie ta connexion internet.");
            }
          }} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:loading?"wait":"pointer",fontWeight:700,fontSize:14,background:loading?C.cream3:C.ink,color:loading?C.muted:C.white,fontFamily:SERIF}}>
            {loading?"⏳ Un instant…":(isRegister?"Créer mon compte →":"Se connecter →")}
          </button>
          <button onClick={()=>setIsRegister(v=>!v)} style={{width:"100%",marginTop:10,background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:12,fontFamily:"inherit"}}>
            {isRegister?"Déjà un compte ? Se connecter":"Créer un compte"}
          </button>
        </>}

        {/* ── OTP ────────────────────────────────────────────────────── */}
        {step==="otp" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 8px",fontFamily:SERIF}}>Code de confirmation</h2>
            <p style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Code envoyé à<br/><b style={{color:C.ink}}>{email}</b></p>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:18}}>
            {otp.map((val,idx)=>(
              <input key={idx} ref={otpRefs[idx]} value={val} onChange={e=>handleOtpInput(e.target.value,idx)} onKeyDown={e=>handleOtpKey(e,idx)}
                maxLength={1} style={{width:42,height:52,borderRadius:12,border:`2px solid ${val?C.ink:C.border}`,textAlign:"center",fontSize:22,fontWeight:700,fontFamily:SERIF,color:C.ink,outline:"none",background:val?C.cream2:C.white}}/>
            ))}
          </div>
          <div style={{textAlign:"center",marginBottom:16}}>
            <span style={{fontSize:12,color:C.muted}}>Code non reçu ? </span>
            <button style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:700,fontFamily:"inherit",fontSize:12}}>Renvoyer</button>
          </div>
          <button onClick={()=>{if(otp.join("").length<6){alert("Entre les 6 chiffres.");return;}loginAs();}} disabled={loading}
            style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:loading?"wait":"pointer",fontWeight:700,fontSize:14,background:otp.join("").length===6?C.ink:C.cream3,color:otp.join("").length===6?C.white:C.muted,fontFamily:SERIF}}>
            {loading?"Connexion en cours…":(isRegister?"Créer mon compte":"Valider")}
          </button>
          <p style={{textAlign:"center",fontSize:11,color:C.faint,marginTop:12}}>Pour la démo : n\'importe quel code à 6 chiffres.</p>
        </>}

        {/* ── RESET ──────────────────────────────────────────────────── */}
        {step==="reset" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 8px",fontFamily:SERIF}}>Mot de passe oublié</h2>
            <p style={{fontSize:13,color:C.muted,lineHeight:1.6}}>On t\'envoie un lien pour réinitialiser.</p>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Ton email</label>
            <input value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="camille@exemple.com" type="email" style={inp2} autoFocus/>
          </div>
          <button onClick={async ()=>{if(!resetEmail.includes("@")){alert("Email invalide");return;} await supabase.auth.resetPasswordForEmail(resetEmail); setStep("reset_sent");}}
            style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:C.ink,color:C.white,fontFamily:SERIF}}>
            Envoyer le lien →
          </button>
        </>}

        {/* ── RESET SENT ─────────────────────────────────────────────── */}
        {step==="reset_sent" && (
          <div style={{textAlign:"center",padding:"10px 0"}}>
            <div style={{fontSize:48,marginBottom:14}}>📧</div>
            <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 10px",fontFamily:SERIF}}>Email envoyé !</h2>
            <p style={{fontSize:13,color:C.muted,lineHeight:1.7,marginBottom:18}}>Lien envoyé à<br/><b style={{color:C.ink}}>{resetEmail}</b></p>
            <div style={{background:C.goldL,borderRadius:12,padding:"11px 14px",marginBottom:20,fontSize:12,color:C.gold,border:`1px solid ${C.goldB}`}}>💡 Vérifie aussi tes spams.</div>
            <button onClick={onClose} style={{width:"100%",padding:"13px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:C.ink,color:C.white,fontFamily:SERIF}}>Retour</button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── PublicProfileScreen ───────────────────────────────────────────────────────
function PublicProfileScreen({ onBack, onBook, onMsg, expertId }) {
  // Use passed expertId or default to first expert
  const e = (expertId !== undefined ? EXPERTS.find(x=>x.id===expertId) : null) || EXPERTS[0];
  const extras = EXPERT_EXTRAS[e.id] || { resout:[], reviews:[], preuves:[] };
  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:80, background:C.cream }}>
      <div style={{ background:`linear-gradient(160deg,#1C1917 0%,#3D2B1F 100%)`, padding:"20px 20px 0", overflow:"hidden" }}>
        <button onClick={onBack} style={{ width:36,height:36,borderRadius:10,background:"rgba(253,252,248,.12)",border:"1px solid rgba(253,252,248,.2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={C.white} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ textAlign:"center", marginBottom:16 }}>
          <div style={{ width:96,height:96,borderRadius:"50%",background:`linear-gradient(135deg,${C.goldL},#FDE68A)`,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:34,border:`4px solid ${C.goldB}`,boxShadow:`0 0 0 6px rgba(185,134,74,.2)`,fontFamily:SERIF,margin:"0 auto 14px" }}>{e.initials}</div>
          <div style={{ fontSize:24,fontWeight:700,color:C.white,fontFamily:SERIF,letterSpacing:"-.5px" }}>{e.name}</div>
          <div style={{ fontSize:13,color:"rgba(253,252,248,.55)",marginTop:4 }}>📍 {e.location} · {e.country}</div>
          <div style={{ display:"flex",gap:6,justifyContent:"center",marginTop:10,flexWrap:"wrap" }}>
            {e.langs.map(l=><span key={l} style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:"rgba(185,134,74,.18)",color:C.goldB,fontWeight:600 }}>{l}</span>)}
            <span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:C.sageL,color:C.sage,fontWeight:700 }}>Très actif</span>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,.07)",borderRadius:14,padding:"12px 16px",margin:"0 0 18px",borderLeft:`3px solid ${C.goldB}` }}>
          <div style={{ fontSize:14,color:C.white,fontStyle:"italic",fontFamily:SERIF,lineHeight:1.55 }}>"{e.tagline}"</div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",background:"rgba(255,255,255,.06)",borderRadius:"14px 14px 0 0",padding:"12px 10px" }}>
          {[{v:`${e.rating}★`,l:"Note"},{v:`+${e.reviews}`,l:"Sessions"},{v:e.metrics[3].value,l:"Réponse"},{v:e.metrics[0].value,l:"Exp."}].map((s,i)=>(
            <div key={i} style={{ textAlign:"center",borderRight:i<3?`1px solid rgba(255,255,255,.1)`:"none" }}>
              <div style={{ fontSize:15,fontWeight:700,color:C.white,fontFamily:SERIF }}>{s.v}</div>
              <div style={{ fontSize:10,color:"rgba(253,252,248,.4)",marginTop:1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background:C.white,padding:"14px 18px",borderBottom:`1px solid ${C.border}`,boxShadow:`0 2px 8px ${C.sh}` }}>
        <button onClick={() => onBook && onBook(e, e.phases[0])} style={{ width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:16,background:C.ink,color:C.white,fontFamily:SERIF }}>
          Réserver une session →
        </button>
        <div style={{ display:"flex",justifyContent:"center",gap:18,marginTop:8 }}>
          <span style={{ fontSize:12,color:C.muted }}>💶 dès <b style={{ color:C.ink }}>{e.phases[0].price}€</b></span>
          <span style={{ fontSize:12,color:C.muted }}>⚡ {e.metrics[3].value}</span>
          <span style={{ fontSize:12,color:C.muted }}>✅ Vérifié</span>
        </div>
      </div>
      <div style={{ padding:"20px 18px 0" }}>

        {/* ── Offres ── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:4 }}>Mes offres</div>
          <div style={{ fontSize:12,color:C.muted,marginBottom:14 }}>Choisis la session qui te correspond</div>
          {e.phases.map((p,i)=>{
            const fmtIcons = {video:"🎥",audio:"📞",doc:"📄",chat:"💬"};
            const fmts = p.formats||[p.format||"video"];
            return (
              <div key={i} style={{ background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"16px",marginBottom:10,boxShadow:`0 2px 8px ${C.sh}` }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:10 }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF,lineHeight:1.35,marginBottom:5 }}>{p.name}</div>
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                      {fmts.map(f=>(
                        <span key={f} style={{ fontSize:11,padding:"3px 9px",borderRadius:20,background:C.cream3,color:C.muted,fontWeight:500 }}>
                          {fmtIcons[f]||"📞"} {f==="video"?"Vidéo":f==="audio"?"Audio":f==="doc"?"Document":"Chat"}
                        </span>
                      ))}
                      {(p.duree||p.what)&&<span style={{ fontSize:11,color:C.muted,padding:"3px 0" }}>· {p.duree||(p.what?.split(" ").pop())}</span>}
                    </div>
                  </div>
                  <div style={{ flexShrink:0,textAlign:"right" }}>
                    <div style={{ fontSize:22,fontWeight:800,color:C.ink,fontFamily:SERIF,lineHeight:1 }}>{p.price}€</div>
                    <div style={{ fontSize:10,color:C.muted,marginTop:2 }}>/ session</div>
                  </div>
                </div>
                <button onClick={()=>onBook&&onBook(e,p)}
                  style={{ width:"100%",padding:"11px",borderRadius:11,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,background:C.ink,color:C.white,fontFamily:SERIF }}>
                  Réserver · {p.price}€ →
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Ce que je résous ── */}
        {extras.resout.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:12 }}>Je t\'aide à…</div>
            {extras.resout.map((r,i)=>(
              <div key={i} style={{ display:"flex",gap:11,alignItems:"flex-start",background:C.white,borderRadius:12,padding:"11px 14px",border:`1px solid ${C.border}`,marginBottom:8 }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:e.color,flexShrink:0,marginTop:5 }}/>
                <span style={{ fontSize:13,color:C.soft,lineHeight:1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        )}

        {extras.reviews.slice(0,2).map((r,i)=>(
          <div key={i} style={{ background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 16px",marginBottom:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
              <div><div style={{ fontSize:13,fontWeight:700,color:C.ink }}>{r.name}</div><div style={{ fontSize:10,color:C.muted }}>{r.date}</div></div>
              <div style={{ display:"flex",gap:2 }}>{[1,2,3,4,5].map(s=><svg key={s} width={11} height={11} viewBox="0 0 12 12" fill={s<=r.stars?"#B8864A":"#D6D0C8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}</div>
            </div>
            <div style={{ fontSize:12,color:C.soft,lineHeight:1.6,fontStyle:"italic" }}>"{r.text}"</div>
          </div>
        ))}
        <div style={{ display:"flex",flexDirection:"column",gap:10,paddingBottom:10,marginTop:8 }}>
          <button onClick={() => onBook && onBook(e, e.phases[0])} style={{ width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:15,background:C.ink,color:C.white,fontFamily:SERIF }}>
            Réserver avec {e.name.split(" ")[0]} →
          </button>
          <button onClick={() => onMsg && onMsg(e)} style={{ width:"100%",padding:"12px",borderRadius:13,border:`1.5px solid ${C.border}`,cursor:"pointer",fontWeight:600,fontSize:13,background:C.white,color:C.ink,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Poser une question d\'abord
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({ onNotif, notifCount, isLoggedIn, onLogin, isExpert, appMode, onToggleMode }) {
  return (
    <div style={{padding:"12px 16px 11px",background:C.white,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,gap:8}}>
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
        <div style={{width:8,height:8,borderRadius:"50%",background:C.gold}}/>
        <span style={{fontSize:20,fontWeight:800,color:C.ink,letterSpacing:"-.5px",fontFamily:SANS}}>savvy</span>
      </div>

      {/* Mode toggle */}
      {isLoggedIn && isExpert && (
        <div style={{display:"flex",alignItems:"center",background:C.cream2,borderRadius:20,padding:3,border:`1px solid ${C.border}`,flexShrink:0}}>
          <button onClick={()=>onToggleMode("client")} style={{padding:"5px 12px",borderRadius:17,border:"none",cursor:"pointer",fontFamily:SANS,fontSize:11,fontWeight:600,transition:"all .2s",
            background:appMode==="client"?C.white:"transparent",
            color:appMode==="client"?C.ink:C.muted,
            boxShadow:appMode==="client"?"0 1px 4px rgba(0,0,0,.08)":"none"
          }}>Client</button>
          <button onClick={()=>onToggleMode("expert")} style={{padding:"5px 12px",borderRadius:17,border:"none",cursor:"pointer",fontFamily:SANS,fontSize:11,fontWeight:600,transition:"all .2s",
            background:appMode==="expert"?C.gold:"transparent",
            color:appMode==="expert"?C.white:C.muted,
            boxShadow:appMode==="expert"?"0 1px 4px rgba(91,140,106,.3)":"none"
          }}>Expert</button>
        </div>
      )}

      <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
        {isLoggedIn ? (
          <button onClick={onNotif} style={{background:"none",border:"none",cursor:"pointer",position:"relative",padding:4,borderRadius:10}}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={1.8}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            {notifCount > 0 && <div style={{position:"absolute",top:1,right:1,width:15,height:15,borderRadius:"50%",background:C.sage,color:C.white,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{notifCount}</div>}
          </button>
        ) : (
          <button onClick={onLogin} style={{padding:"7px 16px",borderRadius:20,border:"none",background:C.gold,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SANS}}>
            Connexion
          </button>
        )}
      </div>
    </div>
  );
}

// ─── BottomNav ───────────────────────────────────────────────────────────────
function BottomNav({nav, onChange, unreadCount, appMode, sessionsCount=0, reservationsCount=0}) {

  const clientItems = [
    {id:"home",        label:"Accueil",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
    {id:"messages",    label:"Échanges",     icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, badge:unreadCount},
    {id:"reservations",label:"Réservations", icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, badge:reservationsCount},
    {id:"profile",     label:"Profil",       icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>},
  ];

  const expertItems = [
    {id:"exp-dashboard", label:"Dashboard",     icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={2} y={3} width={20} height={14} rx={2}/><line x1={8} y1={21} x2={16} y2={21}/><line x1={12} y1={17} x2={12} y2={21}/></svg>},
    {id:"exp-sessions",  label:"Sessions",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, badge:sessionsCount},
    {id:"messages",      label:"Messages",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, badge:unreadCount},
    {id:"exp-dispo",     label:"Disponibilités",icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><circle cx={12} cy={12} r={9}/><polyline points="12 7 12 12 15 15"/></svg>},
    {id:"exp-compte",    label:"Mon compte",    icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>},
  ];

  const items = appMode === "expert" ? expertItems : clientItems;

  return (
    <div style={{background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"8px 0 22px",flexShrink:0}}>
      {items.map(item=>{
        const a = nav===item.id;
        return (
          <button key={item.id} onClick={()=>onChange(item.id)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"2px 6px",border:"none",background:"none",color:a?C.gold:C.faint,fontSize:10,fontWeight:a?700:500,fontFamily:SANS,position:"relative",flex:1,transition:"color .2s"}}>
            <div style={{position:"relative",width:42,height:34,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:12,background:a?C.ink:"transparent",transition:"background .2s"}}>
              <div style={{color:a?C.white:"currentColor"}}>{item.icon(a)}</div>
              {item.badge>0 && <div style={{position:"absolute",top:3,right:3,width:14,height:14,borderRadius:"50%",background:"#EF4444",color:C.white,fontSize:8,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{item.badge}</div>}
            </div>
            <span style={{fontSize:appMode==="expert"?8:9,whiteSpace:"nowrap",letterSpacing:"-.1px",color:a?C.ink:C.faint}}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Onboarding: toujours montré en démo (1 fois par session)
  // En production: utiliser localStorage.getItem("savvy_onboarded")
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSplash, setShowSplash] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [isExpert, setIsExpert] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [newExpertProfile, setNewExpertProfile] = useState(null); // profile créé pendant session
  const [authIntent, setAuthIntent] = useState(null); // action after login
  const [nav,    setNav]    = useState("home");
  const [bookingInfo, setBookingInfo] = useState(null);
  const [screen, setScreen] = useState("home");
  const [expert, setExpert] = useState(null);
  const [phase,  setPhase]  = useState(null);
  const [prevScreen, setPrevScreen] = useState("home");
  const [prevMsgScreen, setPrevMsgScreen] = useState("messages");
  const [searchQ,   setSearchQ]   = useState("");
  const [searchCat, setSearchCat] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [readMsgIds, setReadMsgIds] = useState([]);
  const [expRequestsCount, setExpRequestsCount] = useState(() => (newExpertProfile || authUser?.real) ? 0 : 2); // synced from ProfileScreen
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  // ── Supabase : charger les demandes en attente pour l'expert ──
  useEffect(() => {
    if (!authUser?.real || !authUser?.id || !authUser?.isExpert) return;
    const load = () =>
      supabase.from("bookings").select("id", { count: "exact" })
        .eq("expert_id", authUser.id).eq("status", "pending")
        .then(({ count }) => { if (count != null) setExpRequestsCount(count); });
    load();
    const channel = supabase.channel("expert-bookings-"+authUser.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `expert_id=eq.${authUser.id}` }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id, authUser?.isExpert]);
  const [clientPendingCount, setClientPendingCount] = useState(0); // synced from ReservationsScreen
  const [appMode, setAppMode] = useState("client"); // "client" | "expert"
  const [expInitSection, setExpInitSection] = useState(null); // section to open in ProfileScreen
  const [dbExperts, setDbExperts] = useState([]);
  const [expertsLoaded, setExpertsLoaded] = useState(false);

  // ── Supabase : charger les experts (fallback sur EXPERTS démo si vide) ──
  useEffect(() => {
    supabase.from("experts").select("*").eq("active", true).order("created_at", { ascending: false })
      .then(({ data }) => {
        setDbExperts(data && data.length > 0 ? data : EXPERTS);
        setExpertsLoaded(true);
      })
      .catch(() => { setDbExperts(EXPERTS); setExpertsLoaded(true); });
  }, []);

  // ── Supabase : restaurer la session + charger le profil ──
  const loadProfile = async (u) => {
    const base = { email:u.email, name:u.user_metadata?.name || u.email.split("@")[0], isExpert:false, real:true, id:u.id };
    try {
      const { data } = await supabase.from("profiles").select("*").eq("id", u.id).single();
      if (data) {
        // Charger la photo depuis experts si c'est un expert
        let photoUrl = null;
        let expertId = null;
        if (data.is_expert) {
          const { data: exp } = await supabase.from("experts").select("id, photo_url").eq("user_id", u.id).single();
          photoUrl = exp?.photo_url || null;
          expertId = exp?.id || null;
        }
        return { ...base, name:data.name||base.name, city:data.city, isExpert:!!data.is_expert, expertDomain:data.expert_domain, photoUrl, expertId };
      }
    } catch {}
    return base;
  };
  useEffect(() => {
    const needsSetup = (profil, u) => {
      if (!profil.real) return false;
      try { if (localStorage.getItem(`savvy_setup_done_${u.id}`)) return false; } catch {}
      return !profil.name || profil.name === u.email?.split("@")[0];
    };
    // Handle Stripe payment return
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const bookingId = urlParams.get("booking");
    if (paymentStatus === "success" && bookingId) {
      supabase.from("bookings").update({ paid: true }).eq("id", bookingId).then(() => {});
      try { localStorage.setItem(`savvy_paid_${bookingId}`, "1"); } catch {}
      window.history.replaceState({}, "", window.location.pathname);
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 5000);
    }

    supabase.auth.getSession().then(async ({ data:{ session } }) => {
      if (session?.user) {
        const profil = await loadProfile(session.user);
        setAuthUser(profil);
        if (profil.isExpert) setIsExpert(true);
        setIsLoggedIn(true);
        setShowOnboarding(false);
        if (needsSetup(profil, session.user)) setShowProfileSetup(true);
      }
    });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) return; // logout géré par onLogout
      if (_event === "SIGNED_IN") {
        const profil = await loadProfile(session.user);
        // Clear demo localStorage data for real users
        try {
          localStorage.removeItem("savvy_bookings");
          localStorage.removeItem("savvy_threads");
        } catch {}
        setAuthUser(prev => prev?.real ? prev : profil);
        if (profil.isExpert) setIsExpert(true);
        setIsLoggedIn(true);
        if (needsSetup(profil, session.user)) setShowProfileSetup(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const goHome   = () => { setScreen("home");   setNav("home"); };
  const goExpert = e  => { setPrevScreen(screen); setNav("home"); setExpert(e); setScreen("expert"); };
  const goMsg    = (e, from=null) => {
    if (e === "__search__") { handleNav("search"); return; }
    if (!isLoggedIn) { setAuthIntent(()=>()=>{ setExpert(e); setPrevMsgScreen(from||nav); setScreen("message"); }); setShowAuth(true); return; }
    setExpert(e); setPrevMsgScreen(from||nav); setScreen("message");
  };
  const goBook   = (e,p) => {
    if (!isLoggedIn) { setAuthIntent(()=>()=>{ setExpert(e); setPhase(p); setScreen("booking"); }); setShowAuth(true); return; }
    setExpert(e); setPhase(p); setScreen("booking");
  };
  const goSearch = (q="", cat=null) => {
    setSearchQ(q||""); setSearchCat(cat);
    setScreen("search"); setNav("home");
  };
  const handleNav = id => {
    // Screens that require login
    if (!isLoggedIn && (id === "messages" || id === "reservations" || id === "profile" || id.startsWith("exp-"))) {
      setShowAuth(true);
      return;
    }
    // Expert-mode nav items → go to profile with specific section
    if (id === "exp-dashboard") { setNav(id); setExpInitSection("dashboard"); setScreen("profile"); return; }
    if (id === "exp-sessions")  { setNav(id); setExpInitSection("sesiones"); setScreen("profile"); return; }
    if (id === "exp-dispo")     { setNav(id); setExpInitSection("disponibilidades"); setScreen("profile"); return; }
    if (id === "exp-compte")    { setNav(id); setExpInitSection(null); setScreen("profile"); return; }
    // Normal nav
    setNav(id);
    setExpInitSection(null);
    if(id==="home")         setScreen("home");
    if(id==="messages")     setScreen("messages");
    if(id==="reservations") setScreen("reservations");
    if(id==="profile")      setScreen("profile");
  };

  // "search" est maintenant dans main pour avoir la TopBar et BottomNav
  const main = ["home","search","match","messages","reservations","profile","public"].includes(screen);
  const unread = !isLoggedIn ? 0
    : authUser?.real ? 0
    : appMode==="expert" ? (isExpert && !newExpertProfile ? EXPERT_CLIENT_CONVS.reduce((s,c)=>s+(readMsgIds.includes("cli-"+c.id)?0:c.unread),0) : 0)
    : DEMO_MSGS.reduce((s,m)=>s+(readMsgIds.includes("exp-"+m.id)?0:m.unread),0);

  return <div style={{fontFamily:SANS}}>
    {showPaymentSuccess && (
      <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:99999,background:"#1C1917",color:"#fff",borderRadius:14,padding:"14px 22px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 24px rgba(0,0,0,0.25)",fontFamily:SANS,fontSize:14,fontWeight:600,maxWidth:360,animation:"fadeSlideUp .3s ease-out"}}>
        <span style={{fontSize:20}}>✅</span>
        <div>
          <div>Paiement confirmé !</div>
          <div style={{fontSize:11,fontWeight:400,opacity:0.7,marginTop:2}}>Votre session est réservée avec succès.</div>
        </div>
      </div>
    )}
    <style>{`
      *{box-sizing:border-box}
      body,button,input,textarea,select{font-family:\'DM Sans\',-apple-system,BlinkMacSystemFont,\'Inter\',sans-serif}
      @keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
      @keyframes fadeSlideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      .screen-enter{animation:fadeSlideUp .22s ease-out both}
      *{box-sizing:border-box} ::-webkit-scrollbar{width:0} ::-webkit-scrollbar-horizontal{height:0}
      input::placeholder,textarea::placeholder{color:#A8A29E}
      input:focus,textarea:focus{border-color:#8B6330!important;box-shadow:0 0 0 3px rgba(139,99,48,.10);outline:none}
      select:focus{border-color:#8B6330!important;outline:none}
      button:active{opacity:.82} button{transition:opacity .15s}
    `}</style>
    <div style={{width:"100%",maxWidth:430,margin:"0 auto",background:C.cream,minHeight:"100vh",display:"flex",flexDirection:"column",boxShadow:"0 0 40px rgba(0,0,0,.1)",...(["message"].includes(screen)?{height:"100vh",overflow:"hidden"}:{})}}>
      {showOnboarding && !isLoggedIn && <OnboardingScreen onDone={()=>{ setShowOnboarding(false); setShowSplash(true); }}/>}
      {!showOnboarding && showSplash && !isLoggedIn && <SplashScreen onSkip={()=>{ setShowSplash(false); setScreen("home"); setNav("home"); }} onSuccess={(user)=>{ setIsLoggedIn(true); setAuthUser(user); setIsExpert(!!user.isExpert); setNewExpertProfile(null); setShowSplash(false); setScreen("home"); setNav("home"); }} onRegister={()=>{ setShowSplash(false); setShowAuth(true); setAuthIntent("register"); }}/>}
      {main && <TopBar onNotif={()=>setShowNotif(v=>!v)} notifCount={isLoggedIn?(authUser?.real?(authUser?.isExpert&&appMode==="expert"?expRequestsCount:0):Math.max(0,(newExpertProfile?3:4)-readNotifIds.length)):0} isLoggedIn={isLoggedIn} onLogin={()=>setShowSplash(true)} isExpert={isExpert} appMode={appMode} onToggleMode={m=>{ setAppMode(m); if(m==="expert"){ setNav("exp-dashboard"); setExpInitSection("dashboard"); setScreen("profile"); } else { setNav("home"); setExpInitSection(null); setScreen("home"); } }}/>}
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onSuccess={(user)=>{ setIsLoggedIn(true); setAuthUser(user); setIsExpert(!!user.isExpert); setNewExpertProfile(null); setShowAuth(false); setShowSplash(false); setAuthIntent(null); }} initialRegister={authIntent==="register"}/>}
      {showProfileSetup && authUser?.real && <ProfileSetupModal authUser={authUser} onDone={updated=>{ setAuthUser(updated); setShowProfileSetup(false); }}/>}
      {showNotif && <NotificationPanel onClose={()=>setShowNotif(false)} onNavigate={(s)=>{ setShowNotif(false); handleNav(s); }} readNotifIds={readNotifIds} onMarkRead={setReadNotifIds} isExpert={isExpert&&appMode==="expert"} isNewExpert={!!newExpertProfile} expRequestsCount={expRequestsCount} unreadMsgsCount={unread}/>}
      {screen==="home"         && <div key="home" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><HomeScreen onExpert={goExpert} onSearch={q=>goSearch(q)} onCat={id=>goSearch("",id)} onMatch={()=>{setScreen("match");setNav("home");}} isLoggedIn={isLoggedIn} authUser={authUser} isExpert={isExpert} experts={dbExperts}/></div>}
      {screen==="match"        && <div key="match" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><MatchScreen onExpert={goExpert} onBrowseAll={()=>goSearch("")} experts={dbExperts}/></div>}
      {screen==="search"       && <div key="search" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><SearchScreen initQ={searchQ} initCat={searchCat} onExpert={goExpert} onBack={()=>{setScreen("home");setNav("home");}} experts={dbExperts} expertsLoaded={expertsLoaded}/></div>}
      {screen==="messages"     && <div key="messages" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><MessagesListScreen onConv={e=>goMsg(e)} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)} readMsgIds={readMsgIds} onMarkMsgRead={id=>setReadMsgIds(p=>p.includes(id)?p:[...p,id])} appMode={appMode} isNewExpert={!!newExpertProfile} isRealUser={!!authUser?.real} authUser={authUser}/></div>}
      {screen==="reservations" && <div key="reservations" className="screen-enter" style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}><ReservationsScreen onExpert={goExpert} onMsg={goMsg} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)} onNavigate={handleNav} onPendingChange={n=>setClientPendingCount(n)} isRealUser={!!authUser?.real} authUser={authUser}/></div>}
      {screen==="public"        && <PublicProfileScreen onBack={()=>{setScreen("profile");setNav("profile");}} onBook={goBook} onMsg={goMsg} expertId={authUser?.isExpert?(EXPERTS.find(ex=>ex.initials===DEMO_USERS.expert.initials)||EXPERTS[7])?.id:undefined}/>}
      {screen==="profile"      && <ProfileScreen key={expInitSection||"profile"} authUser={authUser} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)} onNavigate={(s)=>handleNav(s)} newExpertProfile={newExpertProfile}
          isExpert={isExpert}
          appMode={appMode}
          initExpSection={expInitSection}
          onRequestsChange={n=>setExpRequestsCount(n)}
          onBecomeExpert={()=>setIsExpert(true)}
          onSignup={()=>{ setPrevScreen("profile"); setScreen("signup"); }}
          onViewPublic={() => { setPrevScreen("profile"); setScreen("public"); }}
          onLogout={() => { supabase.auth.signOut(); setIsLoggedIn(false); setAuthUser(null); setIsExpert(false); setScreen("home"); setNav("home"); setAppMode("client"); }}
        />}
      {screen==="expert"       && expert && <ExpertScreen e={expert} onBack={()=>{setScreen(prevScreen);}} onBook={goBook} onMsg={goMsg}/>}
      {screen==="message"      && expert && <MessagingScreen e={expert} onBack={()=>{setScreen(prevMsgScreen);setNav(prevMsgScreen);}} authUser={authUser}/>}
      {screen==="booking"      && expert && phase && <BookingScreen e={expert} ph={phase} onBack={()=>setScreen("expert")} onConfirm={(info)=>{ setBookingInfo(info); setScreen("success"); }}/>}
      {screen==="success"      && expert && phase && <SuccessScreen e={expert} ph={phase} onHome={goHome} onMsg={()=>goMsg(expert)} bookingDate={bookingInfo?.date} bookingSlot={bookingInfo?.slot} authUser={authUser}/>}
      {screen==="signup" && <SignupScreen
  authUser={authUser}
  onBack={() => { if(prevScreen==="profile"){setScreen("profile");setNav("profile");}else{goHome();}}}
  onDone={(expertProfile) => {
    setNewExpertProfile(expertProfile);
    setIsExpert(true);
    // Persister le statut expert dans Supabase (si utilisateur réel)
    if (authUser?.real && authUser?.id) {
      supabase.from("profiles").update({
        is_expert: true,
        expert_domain: expertProfile?.domain || expertProfile?.role || null,
        name: expertProfile?.prenom ? (expertProfile.prenom+" "+(expertProfile.nom||"")).trim() : undefined,
      }).eq("id", authUser.id).then(({error})=>{ if(error) console.warn("profil expert non sauvegardé:", error.message); });
    }
    setScreen("profile");
    setNav("profile");
  }}
/>}
      {main && <BottomNav nav={nav} onChange={handleNav} unreadCount={unread} appMode={appMode} sessionsCount={newExpertProfile ? 0 : expRequestsCount} reservationsCount={(isLoggedIn && appMode==="client" && !authUser?.real) ? clientPendingCount : 0}/>}
    </div>
  </div>;
}
