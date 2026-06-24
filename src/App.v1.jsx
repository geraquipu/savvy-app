import { useState, useRef, useCallback } from "react";

const C = {
  cream:"#FDFCF8", cream2:"#F5F2EC", cream3:"#EDE8DF", white:"#FFFFFF",
  ink:"#1C1917", soft:"#44403C", muted:"#78716C", faint:"#A8A29E",
  gold:"#8B6330", goldL:"#F5EDD8", goldB:"#D4AC6E",
  sage:"#1B4332", sageL:"#D1FAE5", sageMid:"#10B981",
  navy:"#0F2744", navyL:"#DBEAFE",
  rose:"#7C2D12", roseL:"#FFEDD5",
  teal:"#065F46", tealL:"#D1FAE5",
  border:"#E7E2D9", borderF:"#F0EDE8",
  sh:"rgba(28,25,23,.07)", shM:"rgba(28,25,23,.14)",
};
const SERIF = "\'Cormorant Garant\',Georgia,serif";

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
  {id:"vie",        icon:"🏠", label:"Vie en France",  sub:"Vivienda · Trabajo · Estudios",      color:"#8B6330", bg:"#F5EDD8"},
  {id:"tourisme",   icon:"✈️", label:"Tourisme",        sub:"Voyages · Gastronomie · Loisirs",    color:"#0369A1", bg:"#E0F2FE"},
  {id:"business",   icon:"💼", label:"Business",        sub:"Import · Export · Création",         color:"#0F2744", bg:"#DBEAFE"},
  {id:"industrie",  icon:"🏗️", label:"Industrie",       sub:"Production · Machines · Logistique", color:"#065F46", bg:"#D1FAE5"},
  {id:"techno",     icon:"💻", label:"Technologie",     sub:"Dev · IA · Automatisation",          color:"#6D28D9", bg:"#EDE9FE"},
  {id:"finances",   icon:"💶", label:"Finances",        sub:"Investissements · Fiscalité",        color:"#92400E", bg:"#FEF3C7"},
];

const SUBCATS = {
  vie: [
    {id:"vivienda",    icon:"🏠", label:"Vivienda"},
    {id:"trabajo",     icon:"💼", label:"Travail & Emploi"},
    {id:"estudios",    icon:"🎓", label:"Études"},
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
    {id:"machines",    icon:"⚙️", label:"Maquinaria"},
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
  { id:"explorador",      min:0,  max:30,  icon:"🟢", label:"Explorador",           color:"#059669", bg:"#D1FAE5", border:"rgba(5,150,105,.25)" },
  { id:"practicant",      min:30, max:60,  icon:"🟡", label:"Praticant",            color:"#92400E", bg:"#FEF3C7", border:"rgba(146,64,14,.25)"  },
  { id:"expert",          min:60, max:80,  icon:"🔵", label:"Expert",               color:"#1D4ED8", bg:"#DBEAFE", border:"rgba(29,78,216,.25)"  },
  { id:"expert_verifie",  min:80, max:95,  icon:"🟣", label:"Expert vérifié",       color:"#7C3AED", bg:"#EDE9FE", border:"rgba(124,58,237,.25)" },
  { id:"referent",        min:95, max:100, icon:"🔥", label:"Référent Savvy",       color:"#B45309", bg:"#FEF3C7", border:"rgba(180,83,9,.25)"   },
];

const getTrustLevel = (score) => TRUST_LEVELS.find(l => score >= l.min && score < l.max) || TRUST_LEVELS[TRUST_LEVELS.length-1];

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
    rating:0, reviews:0, verified:false,
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
  { id:1, eid:0, lastMsg:"Super, votre hôtel est réservé ! Vous allez adorer le quartier Marais.", time:"09:30", unread:2 },
  { id:2, eid:1, lastMsg:"Pour le macaron, la clé c\'est la tant-pour-tant bien tamisée.",         time:"Hier",  unread:0 },
  { id:3, eid:2, lastMsg:"Votre labo peut gagner 30% de productivité avec 3 ajustements simples.", time:"Lun",   unread:1 },
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

function Av({ e, size=44 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:e.bg, color:e.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:Math.round(size*.36), flexShrink:0, border:`1.5px solid ${C.border}` }}>{e.initials}</div>;
}

function Stars({ n, count }) {
  return <div style={{ display:"flex", alignItems:"center", gap:3 }}>
    {[1,2,3,4,5].map(i => <svg key={i} width={11} height={11} viewBox="0 0 12 12" fill={i<=Math.floor(n)?"#B8864A":"#D6D0C8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
    {count !== undefined && <span style={{ fontSize:11, color:C.muted, marginLeft:3 }}>{n} ({count})</span>}
  </div>;
}

function VerBadge({ small }) {
  return <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.goldL, border:`1px solid ${C.goldB}`, borderRadius:20, padding:small?"2px 7px":"4px 10px" }}>
    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
    <span style={{ fontSize:small?10:11, color:C.gold, fontWeight:700, letterSpacing:.3 }}>Expérience confirmée</span>
  </span>;
}

function MetricsGrid({ metrics }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, margin:"10px 0" }}>
    {metrics.map((m,i) => <div key={i} style={{ background:C.cream2, borderRadius:10, padding:"8px 10px", display:"flex", alignItems:"center", gap:8 }}>
      <span style={{ fontSize:16 }}>{m.icon}</span>
      <div>
        <div style={{ fontSize:13, fontWeight:800, color:C.ink, lineHeight:1.1, fontFamily:SERIF }}>{m.value}</div>
        <div style={{ fontSize:10, color:C.muted, lineHeight:1.3 }}>{m.label}</div>
      </div>
    </div>)}
  </div>;
}

function ExpertCard({ e, onClick }) {
  return <div onClick={onClick} style={{ background:C.white, borderRadius:18, border:`1px solid ${C.border}`, cursor:"pointer", overflow:"hidden", marginBottom:14, boxShadow:`0 2px 12px ${C.sh}` }}>
    <div style={{ height:5, background:`linear-gradient(90deg,${e.color},${e.bg})` }}/>
    <div style={{ padding:"14px 16px 16px" }}>
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <Av e={e} size={52}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
            <span style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF, letterSpacing:"-.3px" }}>{e.name}</span>
            <span style={{ fontSize:13 }}>{e.country}</span>
          </div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:5, lineHeight:1.4 }}>{e.role}</div>
          <Stars n={e.rating} count={e.reviews}/>
        </div>
      </div>
      <div style={{ margin:"10px 0 6px", padding:"9px 12px", background:C.cream2, borderRadius:10, borderLeft:`3px solid ${e.color}` }}>
        <span style={{ fontSize:12, color:C.soft, fontStyle:"italic", lineHeight:1.5 }}>«&nbsp;{e.tagline}&nbsp;»</span>
      </div>
      <MetricsGrid metrics={e.metrics}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:10, borderTop:`1px solid ${C.borderF}` }}>
        <VerBadge small/>
        <div style={{ textAlign:"right" }}>
          <span style={{ fontSize:11, color:C.muted }}>dès </span>
          <span style={{ fontSize:21, fontWeight:700, color:C.ink, fontFamily:SERIF, letterSpacing:"-.5px" }}>{e.phases[0].price ? `${e.phases[0].price}€` : "devis"}</span>
        </div>
      </div>
    </div>
  </div>;
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

// ─── OnboardingScreen ──────────────────────────────────────────────────────────
function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0);

  const SLIDES = [
    {
      icon:"✦",
      accent: "#B8864A",
      bg: "linear-gradient(165deg,#1C1917 0%,#2C2825 100%)",
      tag: "Un nouveau concept",
      title: "L'Exartitude",
      titleEm: "",
      sub: "L'Exartitude, c'est la combinaison entre expérience réelle et exactitude pratique — pour vous aider à prendre de meilleures décisions.",
      visual: (
        <div style={{ position:"relative", margin:"28px auto 0", width:180, height:180 }}>
          <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1.5px solid rgba(185,134,74,.2)", animation:"spin 20s linear infinite" }}/>
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
            <div style={{ fontSize:52, fontFamily:"'Cormorant Garant',serif", fontWeight:700, color:"#B8864A", letterSpacing:-2 }}>sav<em style={{ fontStyle:"italic" }}>vy</em></div>
            <div style={{ fontSize:11, color:"rgba(253,252,248,.4)", marginTop:2 }}>Exartitude</div>
          </div>
          {["15 ans d\'exp.","47 sessions","98% succès"].map((t,i)=>(
            <div key={i} style={{ position:"absolute", background:"rgba(185,134,74,.15)", border:"1px solid rgba(185,134,74,.3)", borderRadius:20, padding:"4px 11px", fontSize:10, color:"#B8864A", fontWeight:600, whiteSpace:"nowrap",
              top: i===0?"10%":i===1?"50%":"80%",
              left: i===0?"-20px":i===1?"auto":"-10px",
              right: i===1?"-20px":"auto",
              transform: i===1?"translateY(-50%)":"none" }}>{t}</div>
          ))}
        </div>
      ),
    },
    {
      icon:"🔍",
      accent: "#10B981",
      bg: "linear-gradient(165deg,#064E3B 0%,#065F46 100%)",
      tag: "Trouvez le bon expert",
      title: "Quelqu'un qui ",
      titleEm: "l'a déjà fait",
      sub: "Pas un consultant théorique. Quelqu'un qui a résolu exactement votre problème — et dont l'expérience est vérifiée par notre système de Trust Score.",
      visual: (
        <div style={{ margin:"24px auto 0", maxWidth:280 }}>
          {[
            { initials:"CR", name:"Clément R.", score:72, level:"🔵 Expert",        color:"#F5EDD8", tc:"#8B6330" },
            { initials:"AR", name:"Ahmed R.",   score:96, level:"🔥 Référent Savvy", color:"#DBEAFE", tc:"#1D4ED8" },
            { initials:"MA", name:"Marie A.",   score:88, level:"🟣 Expert vérifié", color:"#FFEDD5", tc:"#7C2D12" },
          ].map((e,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:11, background:"rgba(255,255,255,.08)", borderRadius:13, padding:"10px 13px", marginBottom:8, border:"1px solid rgba(255,255,255,.1)" }}>
              <div style={{ width:38, height:38, borderRadius:"50%", background:e.color, color:e.tc, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:14, flexShrink:0 }}>{e.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"white" }}>{e.name}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,.5)" }}>{e.level}</div>
              </div>
              <div style={{ background:"rgba(16,185,129,.2)", borderRadius:20, padding:"3px 9px" }}>
                <span style={{ fontSize:11, color:"#10B981", fontWeight:700 }}>{e.score}/100</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon:"💶",
      accent: "#B8864A",
      bg: "linear-gradient(165deg,#1C1917 0%,#2C1810 100%)",
      tag: "Simple & transparent",
      title: "Votre temps vaut ",
      titleEm: "plus que ça",
      sub: "Une session à partir de 5€. L'expert reçoit 80%. Vous payez seulement après validation. Et chaque session renforce le système de confiance.",
      visual: (
        <div style={{ margin:"24px auto 0", maxWidth:280 }}>
          <div style={{ background:"rgba(255,255,255,.06)", borderRadius:16, padding:"16px", border:"1px solid rgba(185,134,74,.2)", marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:13, color:"rgba(253,252,248,.7)" }}>Session vidéo</span>
              <span style={{ fontSize:20, fontWeight:700, color:"white", fontFamily:"'Cormorant Garant',serif" }}>20€</span>
            </div>
            {[["Expert reçoit","16€ (80%)","#10B981"],["Savvy","4€ (20%)","rgba(253,252,248,.4)"]].map(([l,v,c])=>(
              <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(253,252,248,.5)", paddingTop:7, borderTop:"1px solid rgba(255,255,255,.06)" }}>
                <span>{l}</span><span style={{ color:c, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
          {["✅ Remboursement garanti","🔒 Paiement sécurisé SSL","⭐ Validez avant de payer"].map((t,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <span style={{ fontSize:12 }}>{t.split(" ")[0]}</span>
              <span style={{ fontSize:12, color:"rgba(253,252,248,.6)" }}>{t.slice(3)}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  const s = SLIDES[slide];

  return (
    <div style={{ position:"fixed", inset:0, background:s.bg, zIndex:300, display:"flex", flexDirection:"column", transition:"background .4s" }}>
      {/* Skip */}
      <div style={{ padding:"52px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:6 }}>
          {SLIDES.map((_,i)=>(
            <div key={i} style={{ width:i===slide?24:7, height:7, borderRadius:4, background:i===slide?s.accent:"rgba(255,255,255,.2)", transition:"all .3s" }}/>
          ))}
        </div>
        <button onClick={onDone} style={{ fontSize:12, color:"rgba(253,252,248,.5)", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.12)", borderRadius:20, padding:"5px 14px", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
          Passer →
        </button>
      </div>

      {/* Visual */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
        {s.visual}
      </div>

      {/* Content */}
      <div style={{ padding:"0 24px 32px" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`rgba(255,255,255,.08)`, border:`1px solid rgba(255,255,255,.12)`, borderRadius:20, padding:"4px 13px", marginBottom:14 }}>
          <span style={{ fontSize:10, color:s.accent, fontWeight:700, letterSpacing:.5 }}>{s.tag.toUpperCase()}</span>
        </div>
        <h2 style={{ fontSize:28, fontWeight:700, color:"white", fontFamily:"'Cormorant Garant',serif", lineHeight:1.2, margin:"0 0 12px", letterSpacing:"-.5px" }}>
          {s.title}<em style={{ color:s.accent, fontStyle:"italic" }}>{s.titleEm}</em>
        </h2>
        <p style={{ fontSize:14, color:"rgba(253,252,248,.65)", lineHeight:1.7, margin:"0 0 28px" }}>{s.sub}</p>

        {slide < SLIDES.length-1 ? (
          <button onClick={()=>setSlide(s=>s+1)} style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:`linear-gradient(135deg,${s.accent},#D4AC6E)`, color:"white", fontFamily:"'Cormorant Garant',serif", letterSpacing:".2px", boxShadow:`0 4px 20px rgba(185,134,74,.35)` }}>
            Suivant →
          </button>
        ) : (
          <button onClick={onDone} style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:`linear-gradient(135deg,${s.accent},#D4AC6E)`, color:"white", fontFamily:"'Cormorant Garant',serif", letterSpacing:".2px", boxShadow:`0 4px 20px rgba(185,134,74,.35)` }}>
            ✦ Commencer avec Savvy
          </button>
        )}
      </div>
    </div>
  );
}

// ─── SplashScreen ──────────────────────────────────────────────────────────────
function SplashScreen({ onSkip, onSuccess }) {
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
    await new Promise(r=>setTimeout(r,1400));
    setSocialLoading(null);
    onSuccess({name:provider==="google"?"Compte Google":"Compte Apple", email:`demo@${provider}.com`, isExpert:false});
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
      <button onClick={()=>{}} style={{marginTop:16,background:"none",border:"none",cursor:"pointer",color:"rgba(253,252,248,.5)",fontSize:13,fontFamily:"inherit"}}>
        Code non reçu ? Renvoyer
      </button>
    </div>
  );

  // ── Main splash ─────────────────────────────────────────────────────────────
  return (
    <div style={{position:"fixed",inset:0,background:`linear-gradient(165deg,${C.ink} 0%,#1A1512 100%)`,zIndex:200,display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* X pour passer */}
      <div style={{padding:"52px 20px 0",display:"flex",justifyContent:"flex-end"}}>
        <button onClick={onSkip} style={{width:36,height:36,borderRadius:10,background:"rgba(253,252,248,.1)",border:"1px solid rgba(253,252,248,.15)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(253,252,248,.6)",fontSize:18}}>×</button>
      </div>

      {/* Logo + tagline */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 28px",textAlign:"center",marginTop:-20}}>
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
                <div style={{fontSize:10,color:"rgba(253,252,248,.5)"}}>{u.isExpert?"🎯 Expert":"👤 Client"}</div>
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
function HomeScreen({ onExpert, onSearch, onCat, isLoggedIn, authUser, isExpert }) {
  const top = [...EXPERTS].sort((a,b) => b.rating - a.rating).slice(0,5);
  return <div style={{ flex:1, overflowY:"auto", paddingBottom:72, background:C.cream }}>
    <div style={{ padding:"28px 20px 26px", background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(185,134,74,.04)" }}/>
      <div style={{ position:"relative" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(185,134,74,.15)", border:"1px solid rgba(185,134,74,.3)", borderRadius:20, padding:"5px 14px", marginBottom:20 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:C.goldB }}/>
          <span style={{ fontSize:11, color:C.goldB, fontWeight:600, letterSpacing:.5 }}>🇫🇷 France · Expériences confirmées</span>
        </div>
        <h1 style={{ fontSize:27, fontWeight:700, color:C.white, lineHeight:1.2, margin:"0 0 10px", fontFamily:SERIF, letterSpacing:"-.5px" }}>
          Parlez avec quelqu\'un<br/><em style={{ color:C.goldB }}>qui l\'a déjà fait.</em>
        </h1>
        <p style={{ fontSize:13, color:"rgba(253,252,248,.72)", lineHeight:1.7, margin:"0 0 20px" }}>
          Évitez les erreurs. Apprenez de l\'expérience réelle.
        </p>
        <div onClick={() => onSearch("")} style={{ display:"flex", alignItems:"center", gap:10, background:C.cream, borderRadius:13, padding:"13px 16px", cursor:"pointer" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth={2}><circle cx={11} cy={11} r={8}/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{ fontSize:14, color:C.muted }}>Que cherchez-vous ?</span>
          <span style={{ marginLeft:"auto", fontSize:11, color:C.faint, background:C.cream2, padding:"2px 8px", borderRadius:8 }}>Rechercher</span>
        </div>
        <div style={{ display:"flex", gap:7, marginTop:14, overflowX:"auto", paddingBottom:2, scrollbarWidth:"none" }}>
          {["Hôtels Paris","Macaron","Export Colombie","SolidWorks","Optimisation labo"].map(t =>
            <button key={t} onClick={() => onSearch(t)} style={{ padding:"5px 12px", borderRadius:20, border:"1px solid rgba(253,252,248,.22)", background:"transparent", color:"rgba(253,252,248,.88)", fontSize:11, whiteSpace:"nowrap", cursor:"pointer", fontFamily:"inherit" }}>{t}</button>
          )}
        </div>
      </div>
    </div>
    <div style={{ background:C.white, padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr" }}>
      {[["200+","conseillers"],["98%","satisfaction"],["47","pays"],["⚡","réponse rapide"]].map(([n,l]) =>
        <div key={l} style={{ textAlign:"center" }}>
          <div style={{ fontSize:17, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{n}</div>
          <div style={{ fontSize:10, color:C.muted, marginTop:1 }}>{l}</div>
        </div>
      )}
    </div>
    <div style={{ padding:"22px 18px 0" }}>
      <h2 style={{ fontSize:18, fontWeight:700, color:C.ink, margin:"0 0 13px", fontFamily:SERIF }}>Par thème</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
        {CATS.map(cat =>
          <button key={cat.id} onClick={() => onCat(cat.id)} style={{ display:"flex", alignItems:"center", gap:11, padding:"14px 15px", borderRadius:15, border:`1px solid ${C.border}`, background:C.white, cursor:"pointer", textAlign:"left", fontFamily:"inherit", boxShadow:`0 1px 4px ${C.sh}` }}>
            <div style={{ width:44, height:44, borderRadius:13, background:cat.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{cat.icon}</div>
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

// ─── SearchScreen ─────────────────────────────────────────────────────────────
function SearchScreen({ initQ="", initCat=null, onExpert }) {
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
  let experts = [...EXPERTS];
  if (activeCat) { const ids = CAT_MAP[activeCat]||[]; experts = experts.filter(e=>ids.includes(e.id)); }
  if (pilier==="top")      experts = [...experts].sort((a,b)=>b.rating-a.rating);
  if (pilier==="verifies") experts = experts.filter(e=>e.verified);
  if (q.trim().length>1) {
    const ql=q.toLowerCase();
    experts = experts.filter(e=>e.name.toLowerCase().includes(ql)||e.role.toLowerCase().includes(ql)||e.tagline.toLowerCase().includes(ql));
  }
  if (filters.prix==="0-50")   experts = experts.filter(e=>e.phases[0].price&&e.phases[0].price<=50);
  if (filters.prix==="50-200") experts = experts.filter(e=>e.phases[0].price&&e.phases[0].price>50&&e.phases[0].price<=200);
  if (filters.prix==="200+")   experts = experts.filter(e=>!e.phases[0].price||e.phases[0].price>200);
  if (filters.langue) experts = experts.filter(e=>e.langs.includes(filters.langue));
  if (filters.note==="4")   experts = experts.filter(e=>e.rating>=4);
  if (filters.note==="4.5") experts = experts.filter(e=>e.rating>=4.5);
  if (filters.note==="5")   experts = experts.filter(e=>e.rating>=4.9);

  const catObj = activeCat ? CATS.find(c=>c.id===activeCat) : null;
  const subcats = activeCat ? (SUBCATS[activeCat]||[]) : [];

  const POPULAR = ["Hôtels Paris","Macaron","Export Colombie","SolidWorks","Optimisation labo","Tuyauterie"];

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
            ⚙️{activeFilterCount>0?` (${activeFilterCount})`:""}
          </button>
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div style={{ background:C.cream2, padding:"12px 14px 14px", borderTop:`1px solid ${C.border}`, marginLeft:-16, marginRight:-16, paddingLeft:16, paddingRight:16 }}>
            {[
              {key:"prix",   label:"💰 Prix",        options:[{v:"0-50",l:"< 50€"},{v:"50-200",l:"50–200€"},{v:"200+",l:"200€+"}]},
              {key:"langue", label:"🌐 Langue",       options:[{v:"FR",l:"🇫🇷 FR"},{v:"EN",l:"🇬🇧 EN"},{v:"ES",l:"🇪🇸 ES"}]},
              {key:"format", label:"📱 Format",       options:[{v:"video",l:"🎥 Vidéo"},{v:"appel",l:"📞 Appel"},{v:"chat",l:"💬 Chat"},{v:"doc",l:"📄 Document"}]},
              {key:"dispo",  label:"📅 Disponibilité",options:[{v:"auj",l:"Aujourd'hui"},{v:"sem",l:"Cette semaine"},{v:"mois",l:"Ce mois"}]},
              {key:"note",   label:"⭐ Note minimum", options:[{v:"4",l:"4★+"},{v:"4.5",l:"4.5★+"},{v:"5",l:"5★ only"}]},
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
                    <button key={i} onClick={()=>setQ(h)} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${C.border}`, background:C.white, color:C.soft, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                      🕐 {h}
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
                      <div style={{ fontSize:10, color:cat.color, marginTop:4, fontWeight:600 }}>{(CAT_MAP[cat.id]||[]).length} expert{(CAT_MAP[cat.id]||[]).length>1?"s":""}</div>
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
                  {experts.length} conseiller{experts.length>1?"s":""} disponible{experts.length>1?"s":""}
                </div>
              </div>
              {activeCat && (
                <button onClick={()=>{setActiveCat(null);setActiveSubcat(null);}} style={{ fontSize:12, color:C.muted, background:C.cream3, border:"none", cursor:"pointer", fontFamily:"inherit", padding:"5px 11px", borderRadius:20, fontWeight:600 }}>
                  Tout voir ×
                </button>
              )}
            </div>

            {/* Expert cards */}
            {experts.length > 0
              ? experts.map(e => (
                  <ExpertCard key={e.id} e={e} onClick={()=>{ if(q.trim().length>1) saveSearch(q); onExpert(e); }}/>
                ))
              : (
                <div style={{ textAlign:"center", padding:"60px 20px" }}>
                  <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Aucun résultat</div>
                  <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>
                    {q ? `Aucun expert pour "${q}"` : "Aucun expert dans cette catégorie pour le moment."}
                  </div>
                  <button onClick={()=>{setQ("");setActiveCat(null);setActiveSubcat(null);}} style={{ padding:"11px 24px", borderRadius:12, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF }}>
                    Réinitialiser la recherche
                  </button>
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
  const [isFav, setIsFav] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [sessionExpanded, setSessionExpanded] = useState(false);
  const extras = EXPERT_EXTRAS[e.id] || { resout:[], reviews:[], preuves:[] };
  const styleTags = EXPERT_STYLE_TAGS[e.cat] || ["Humain","Direct","Pratique"];
  const firstSession = EXPERT_FIRST_SESSION[e.id] || `Dans notre première session, je commence par comprendre précisément votre situation. On va droit au but — vous repartez avec des réponses concrètes basées sur mon expérience réelle.`;
  const bioShort = e.bio.length > 130 ? e.bio.slice(0,130)+"…" : e.bio;
  const sessionShort = firstSession.length > 140 ? firstSession.slice(0,140)+"…" : firstSession;

  return (
    <div style={{ flex:1, overflowY:"auto", paddingBottom:100, background:C.white }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div style={{ background:C.white, padding:"13px 18px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:C.cream2, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Conseillers</span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setIsFav(v=>!v)} style={{ width:36, height:36, borderRadius:10, background:isFav?"#FEE2E2":C.cream2, border:`1px solid ${isFav?"#FECACA":C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
            <div style={{ width:100, height:130, borderRadius:14, background:`linear-gradient(160deg,${e.bg},${e.color}22)`, border:`2px solid ${e.color}22`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              <div style={{ fontSize:36, fontWeight:800, color:e.color, fontFamily:SERIF }}>{e.initials}</div>
            </div>
            {/* Play button */}
            <div style={{ position:"absolute", bottom:8, right:8, width:30, height:30, borderRadius:"50%", background:"rgba(0,0,0,.55)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", backdropFilter:"blur(4px)" }}
              onClick={()=>alert("Vidéo de présentation disponible après le lancement ✦")}>
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
            {l:"Expérience", v:e.metrics[0].value},
            {l:"Calificación", v:`⭐ ${e.rating}`},
            {l:"Sessions", v:`+${e.reviews}`},
          ].map((s,i) => (
            <div key={s.l} style={{ padding:"12px 8px", textAlign:"center", borderRight:i<2?"1px solid rgba(0,0,0,.07)":"none" }}>
              <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{s.v}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"24px 18px 0" }}>
        <div style={{ height:1, background:C.border, marginBottom:24 }}/>

        {/* ── SOBRE MÍ ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:10 }}>Qui suis-je ?</div>
          <div style={{ fontSize:14, color:C.soft, lineHeight:1.8 }}>
            {bioExpanded ? e.bio : bioShort}
          </div>
          {e.bio.length > 130 && (
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
          {e.phases.slice(0,3).map(ph => {
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
        <button onClick={() => onBook(e, e.phases[0])} style={{ width:"100%", padding:"16px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:C.ink, color:C.white, fontFamily:SERIF, letterSpacing:".2px", marginBottom:8 }}>
          Parler avec {e.name.split(" ")[0]} → {e.phases[0].price ? `${e.phases[0].price}€` : "Devis"}
        </button>
        <button onClick={() => onMsg(e)} style={{ width:"100%", padding:"10px", border:"none", background:"none", cursor:"pointer", fontSize:13, color:C.muted, fontWeight:600, fontFamily:"inherit" }}>
          Poser une question d'abord
        </button>
      </div>
    </div>
  );
}

// ─── MessagingScreen ──────────────────────────────────────────────────────────
function MessagingScreen({ e, onBack }) {
  const [msgs, setMsgs] = useState([{id:1,from:"expert",text:`Bonjour ! Je suis ${e.name.split(" ")[0]}. ${e.tagline}. Quelle est votre question ?`,time:"09:30"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sugg, setSugg] = useState(null);
  const bottomRef = useRef(null);
  const send = useCallback(async(text)=>{
    const t=(text??input).trim(); if(!t||loading)return;
    setInput(""); setSugg(null);
    const userMsg={id:Date.now(),from:"client",text:t,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})};
    const updated=[...msgs,userMsg]; setMsgs(updated); setLoading(true);
    const reply=await callClaude(updated.map(m=>({role:m.from==="client"?"user":"assistant",content:m.text})),e.sys);
    const final=[...updated,{id:Date.now()+1,from:"expert",text:reply,time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}];
    setMsgs(final); setLoading(false);
    setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),50);
    const s=await getSugg(reply); if(Array.isArray(s))setSugg(s.slice(0,2));
  },[msgs,input,loading,e]);
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

  // Payment helpers at component level
  const formatCard = v => v.replace(/[^0-9]/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExp  = v => { const d=v.replace(/[^0-9]/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };
  const isCardValid = cardNum.replace(/\s/g,"").length===16 && cardExp.length===5 && cardCvv.length>=3 && cardName.length>2;
  const handlePay = async () => {
    if (payMethod==="apple") { setPaying(true); await new Promise(r=>setTimeout(r,1500)); setPaying(false); onConfirm({date:booking.date, slot:booking.slot}); return; }
    if (!isCardValid) { alert("Vérifie les informations de ta carte."); return; }
    setPaying(true); await new Promise(r=>setTimeout(r,1800)); setPaying(false);
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
          {step==="offre" ? "Choisir une offre" : step==="format" ? "Choisir le format" : step==="date" ? "Choisir la date" : "Confirmer"}
        </span>
      </div>
      {/* Progress */}
      <div style={{ display:"flex", gap:6 }}>
        {["offre","format","date","confirm"].map((s,i) => (
          <div key={s} style={{ flex:1, height:3, borderRadius:2, background:["offre","format","date","confirm"].indexOf(step) >= i ? C.gold : C.cream3, transition:"background .3s" }}/>
        ))}
      </div>
      <div style={{ display:"flex", gap:0, marginTop:8 }}>
        {[{s:"offre",l:"Offre"},{s:"format",l:"Format"},{s:"date",l:"Date"},{s:"confirm",l:"Paiement"}].map((item,i)=>(
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

  // ── STEP 3 : CONFIRM & PAY ───────────────────────────────────────────────
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.cream, paddingBottom:24 }}>
      <Header/>
      <div style={{ padding:"16px 18px" }}>
        {/* Récap */}
        <div style={{ background:C.white, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}`, marginBottom:14, boxShadow:`0 2px 12px ${C.sh}` }}>
          <div style={{ height:5, background:`linear-gradient(90deg,${e.color},${e.bg})` }}/>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:13 }}>
              <div style={{ width:42, height:42, borderRadius:"50%", background:e.bg, color:e.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{e.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{e.name}</div>
                <div style={{ fontSize:12, color:C.soft }}>{selectedPhase?.name}</div>
              </div>
              <div style={{ fontSize:24, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{selectedPhase?.price ? `${selectedPhase.price}€` : "Devis"}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
              {[
                {icon:BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.icon, label:"Format", value:BOOKING_FORMATS.find(f=>f.id===selectedFormat)?.label},
                {icon:"📅", label:"Date", value:booking.date?.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"short"})},
                {icon:"⏰", label:"Heure", value:booking.slot},
                {icon:"💶", label:"À payer", value:selectedPhase?.price?`${selectedPhase.price}€`:"Devis"},
              ].map(item=>(
                <div key={item.label} style={{ background:C.cream2, borderRadius:10, padding:"9px 11px" }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{item.value||"—"}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Politique d\'annulation */}
        <div style={{ background:C.cream2, borderRadius:13, padding:"12px 14px", marginBottom:14, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:8 }}>📋 Politique d\'annulation</div>
          {[
            {icon:"✅", text:"Annulation gratuite jusqu\'à 48h avant la session"},
            {icon:"⚠️", text:"Entre 24h et 48h avant : remboursement de 70%"},
            {icon:"❌", text:"Moins de 24h avant : remboursement de 50%"},
          ].map((item,i)=>(
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:i<2?7:0 }}>
              <span style={{ fontSize:13, flexShrink:0 }}>{item.icon}</span>
              <span style={{ fontSize:11, color:C.soft, lineHeight:1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:9, alignItems:"center", background:C.sageL, borderRadius:12, padding:"10px 14px", marginBottom:16, border:"1px solid rgba(16,185,129,.2)" }}>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize:11, color:C.sage }}>Paiement sécurisé · Remboursement garanti si la session n\'a pas lieu</span>
        </div>

        {/* Méthode de paiement */}
        <>
            {/* Méthode selector */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:10 }}>💳 Méthode de paiement</div>
              <div style={{ display:"flex", gap:9 }}>
                <button onClick={()=>setPayMethod("card")} style={{ flex:1, padding:"11px 8px", borderRadius:12, border:`2px solid ${payMethod==="card"?C.ink:C.border}`, background:payMethod==="card"?C.ink:C.white, cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <svg width={22} height={16} viewBox="0 0 24 18" fill="none" stroke={payMethod==="card"?C.white:C.ink} strokeWidth={1.5}><rect x={1} y={1} width={22} height={16} rx={3}/><path d="M1 6h22"/><path d="M5 12h4" strokeLinecap="round"/></svg>
                  <span style={{ fontSize:11, fontWeight:700, color:payMethod==="card"?C.white:C.ink }}>Carte</span>
                </button>
                <button onClick={()=>setPayMethod("apple")} style={{ flex:1, padding:"11px 8px", borderRadius:12, border:`2px solid ${payMethod==="apple"?C.ink:C.border}`, background:payMethod==="apple"?C.ink:C.white, cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                  <svg width={18} height={22} viewBox="0 0 24 24" fill={payMethod==="apple"?C.white:C.ink}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <span style={{ fontSize:11, fontWeight:700, color:payMethod==="apple"?C.white:C.ink }}>Apple Pay</span>
                </button>
              </div>
            </div>

            {/* Card form */}
            {payMethod==="card" && (
              <div style={{ background:C.cream2, borderRadius:13, padding:"14px", marginBottom:14, border:`1px solid ${C.border}` }}>
                <div style={{ marginBottom:10 }}>
                  <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.5 }}>Numéro de carte</label>
                  <input value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))} placeholder="4242 4242 4242 4242" inputMode="numeric"
                    style={{ width:"100%", padding:"11px 13px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:"monospace", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white, letterSpacing:1 }}/>
                </div>
                <div style={{ display:"flex", gap:10, marginBottom:10 }}>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.5 }}>Expiration</label>
                    <input value={cardExp} onChange={e=>setCardExp(formatExp(e.target.value))} placeholder="MM/AA" inputMode="numeric"
                      style={{ width:"100%", padding:"11px 13px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.5 }}>CVV</label>
                    <input value={cardCvv} onChange={e=>setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="•••" inputMode="numeric" type="password"
                      style={{ width:"100%", padding:"11px 13px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:15, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:10, fontWeight:700, color:C.muted, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:.5 }}>Nom sur la carte</label>
                  <input value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="GERMAN QUINTANA"
                    style={{ width:"100%", padding:"11px 13px", borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:14, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white, textTransform:"uppercase" }}/>
                </div>
              </div>
            )}

            {/* Apple Pay button */}
            {payMethod==="apple" && (
              <div style={{ background:C.ink, borderRadius:13, padding:"16px", marginBottom:14, textAlign:"center" }}>
                <div style={{ fontSize:13, color:"rgba(255,255,255,.7)", marginBottom:6 }}>Tu vas payer {selectedPhase?.price}€ avec</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <svg width={20} height={24} viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <span style={{ fontSize:22, fontWeight:700, color:"white", fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif" }}>Apple Pay</span>
                </div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginTop:6 }}>Authentification par Face ID / Touch ID</div>
              </div>
            )}

            {/* Security badges */}
            <div style={{ display:"flex", gap:8, alignItems:"center", background:C.sageL, borderRadius:11, padding:"9px 13px", marginBottom:14, border:"1px solid rgba(16,185,129,.2)" }}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize:11, color:C.sage }}>Paiement sécurisé SSL · Remboursement garanti si la session n\'a pas lieu</span>
            </div>

            {/* Pay button */}
            <button onClick={handlePay} disabled={paying}
              style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", cursor:paying?"wait":"pointer", fontWeight:700, fontSize:16, fontFamily:SERIF, letterSpacing:".2px",
                background: paying ? C.cream3 : payMethod==="apple" ? C.ink : `linear-gradient(135deg,${C.ink},#2C2825)`,
                color: paying ? C.muted : C.white,
                boxShadow: paying ? "none" : `0 4px 16px rgba(28,25,23,.2)` }}>
              {paying
                ? "⏳ Traitement en cours…"
                : payMethod==="apple"
                  ? `Payer ${selectedPhase?.price||""}€ avec Apple Pay`
                  : `🔒 Payer ${selectedPhase?.price||""}€ par carte →`}
            </button>
          </>
      </div>
    </div>
  );
}

// ─── SuccessScreen ─────────────────────────────────────────────────────────────
function SuccessScreen({e, ph, onHome, onMsg, bookingDate, bookingSlot}) {
  const confirmNum = "SAV-" + Math.floor(10000 + Math.random()*90000);
  return (
    <div style={{ flex:1, overflowY:"auto", background:C.cream, paddingBottom:30 }}>
      {/* Hero confirmation */}
      <div style={{ background:`linear-gradient(165deg,${C.sage} 0%,#145226 100%)`, padding:"48px 24px 36px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,.05)" }}/>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,.15)", border:"2px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
          <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1 style={{ fontSize:24, fontWeight:700, color:"white", fontFamily:SERIF, margin:"0 0 8px", letterSpacing:"-.3px" }}>
          Réservation confirmée !
        </h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,.75)", margin:"0 0 16px", lineHeight:1.6 }}>
          Un email de confirmation a été envoyé à ton adresse.
        </p>
        <div style={{ background:"rgba(255,255,255,.12)", borderRadius:20, padding:"6px 16px", display:"inline-block" }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.8)", fontWeight:600 }}>N° {confirmNum}</span>
        </div>
      </div>

      <div style={{ padding:"20px 20px 0" }}>
        {/* Carte session */}
        <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:16, boxShadow:`0 4px 20px ${C.sh}` }}>
          <div style={{ height:5, background:`linear-gradient(90deg,${e.color},${e.bg})` }}/>
          <div style={{ padding:"16px" }}>
            <div style={{ display:"flex", gap:13, alignItems:"center", marginBottom:14 }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:e.bg, color:e.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:18, border:`2px solid ${C.border}`, fontFamily:SERIF, flexShrink:0 }}>{e.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{e.name}</div>
                <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>{e.role.split("·")[0].trim()}</div>
              </div>
              <div style={{ fontSize:22, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{ph?.price ? `${ph.price}€` : "Devis"}</div>
            </div>
            {/* Détails session */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
              {[
                { icon:"📅", label:"Date", value: bookingDate ? bookingDate.toLocaleDateString("fr-FR",{weekday:"short",day:"numeric",month:"long"}) : "À confirmer" },
                { icon:"⏰", label:"Heure", value: bookingSlot || "À confirmer" },
                { icon:"🎯", label:"Format", value: ph.format || "Vidéo" },
                { icon:"💶", label:"Payé", value: ph?.price ? `${ph.price}€` : "Devis" },
              ].map(item => (
                <div key={item.label} style={{ background:C.cream2, borderRadius:11, padding:"10px 12px" }}>
                  <div style={{ fontSize:10, color:C.muted, marginBottom:3 }}>{item.icon} {item.label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prochaines étapes */}
        <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:12 }}>Prochaines étapes</div>
          {[
            { icon:"📧", text:"Email de confirmation envoyé avec le lien de la session" },
            { icon:"💬", text:"Tu peux écrire à " + e.name.split(" ")[0] + " pour te préparer" },
            { icon:"📅", text:"Ajoute la session à ton calendrier pour ne pas oublier" },
          ].map((s,i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:i<2?10:0 }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{s.icon}</span>
              <span style={{ fontSize:13, color:C.soft, lineHeight:1.55 }}>{s.text}</span>
            </div>
          ))}
        </div>

        {/* Garantie */}
        <div style={{ background:C.sageL, borderRadius:12, padding:"11px 14px", marginBottom:20, display:"flex", gap:9, alignItems:"center", border:`1px solid rgba(16,185,129,.2)` }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize:12, color:C.sage, lineHeight:1.5 }}>Paiement sécurisé · Remboursement garanti si la session n\'a pas lieu</span>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={() => onMsg(e)} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:C.ink, color:C.white, fontFamily:SERIF }}>
            💬 Envoyer un message à {e.name.split(" ")[0]}
          </button>
          <button onClick={onHome} style={{ width:"100%", padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:14, background:C.white, color:C.ink, fontFamily:"inherit" }}>
            Retour à l\'accueil
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MessagesListScreen ────────────────────────────────────────────────────────
function MessagesListScreen({onConv, isLoggedIn, onLogin}) {
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
  const [readMsgIds, setReadMsgIds]     = useState([]);
  const markMsgRead = (id) => setReadMsgIds(prev => prev.includes(id) ? prev : [...prev, id]);

  const expertConvs = DEMO_MSGS.map(m => ({...m, expert: EXPERTS[m.eid], type:"expert"})).filter(m => m.expert);
  const clientConvs = [
    {id:"c1", type:"client", name:"Sophie M.", ini:"SM", bg:"#EDE9FE", col:"#7C3AED", lastMsg:"Super session, merci beaucoup !", time:"10:15", unread:0},
    {id:"c2", type:"client", name:"Lucas B.",  ini:"LB", bg:"#DBEAFE", col:"#1D4ED8", lastMsg:"Est-ce que vous êtes disponible jeudi ?", time:"Hier",  unread:1},
    {id:"c3", type:"client", name:"Emma P.",   ini:"EP", bg:"#D1FAE5", col:"#065F46", lastMsg:"Merci beaucoup pour les conseils !", time:"Lun", unread:0, archived:true},
  ];

  const baseConvs = msgFilter==="clients" ? clientConvs : msgFilter==="experts" ? expertConvs : [...expertConvs,...clientConvs];
  const visibleConvs = baseConvs
    .filter(c => !archivedIds.includes(c.id||c.eid))
    .filter(c => !searchQ || (c.name||c.expert?.name||"").toLowerCase().includes(searchQ.toLowerCase()) || (c.lastMsg||"").toLowerCase().includes(searchQ.toLowerCase()));
  const archivedConvs = [...expertConvs,...clientConvs].filter(c=>archivedIds.includes(c.id||c.eid));
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
        {[{id:"rapides",l:"💬 Réponses rapides"},{id:"archives",l:"📦 Archivés"},{id:"commentaire",l:"✉️ Nous contacter"}].map(t=>(
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
                    : <button onClick={()=>setEditingReply(r.id)} style={{fontSize:10,padding:"4px 9px",borderRadius:7,border:`1px solid ${C.border}`,background:C.cream2,color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>✏️</button>
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
              ? <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}><div style={{fontSize:32,marginBottom:8}}>📦</div>Aucune conversation archivée</div>
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
                  <div style={{fontSize:36,marginBottom:10}}>✅</div>
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
          <div style={{fontSize:15,fontWeight:700,color:C.ink,fontFamily:SERIF}}>Assistance Savvy</div>
          <div style={{fontSize:11,color:C.sage}}>● En ligne</div>
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
        <div style={{fontSize:12,color:C.muted}}>Vos conversations</div>
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
    <div style={{display:"flex",gap:6,padding:"0 18px",marginBottom:14}}>
      {[{id:"tous",l:"Tous"},{id:"experts",l:"Experts"},{id:"clients",l:"Clients"}].map(f=>(
        <button key={f.id} onClick={()=>setMsgFilter(f.id)} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${msgFilter===f.id?C.ink:C.border}`,background:msgFilter===f.id?C.ink:"transparent",color:msgFilter===f.id?C.white:C.muted,fontSize:12,fontWeight:msgFilter===f.id?700:400,cursor:"pointer",fontFamily:"inherit"}}>
          {f.l}
        </button>
      ))}
    </div>

    <div style={{padding:"0 18px"}}>
      {/* Savvy assistant row */}
      {(msgFilter==="tous"||msgFilter==="clients") && (
        <div onClick={()=>setShowSavvyChat(true)} style={{display:"flex",gap:12,alignItems:"center",background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:16,padding:"14px 15px",marginBottom:10,cursor:"pointer",boxShadow:`0 2px 12px rgba(28,22,16,.18)`}}>
          <div style={{position:"relative"}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(185,134,74,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:"2px solid rgba(185,134,74,.4)"}}>✦</div>
            <div style={{position:"absolute",bottom:-1,right:-1,width:14,height:14,borderRadius:"50%",background:C.sage,border:`2px solid ${C.ink}`}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:14,fontWeight:700,color:C.white,fontFamily:SERIF}}>Assistance Savvy</span>
              <span style={{fontSize:10,color:"rgba(253,252,248,.5)"}}>En ligne</span>
            </div>
            <div style={{fontSize:12,color:"rgba(253,252,248,.65)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Une question ? On est là pour toi ✦</div>
          </div>
        </div>
      )}

      {/* Expert conversations */}
      {(msgFilter==="tous"||msgFilter==="experts") && expertConvs.map(conv=>{
        const convKey = "exp-"+conv.id;
        const isRead = readMsgIds.includes(convKey) || conv.unread===0;
        return (
        <div key={conv.id} onClick={()=>{ markMsgRead(convKey); onConv(conv.expert); }} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"14px 15px",marginBottom:10,cursor:"pointer",border:`1px solid ${isRead?C.border:C.gold}`,boxShadow:`0 1px 6px ${C.sh}`,transition:"border-color .25s"}}>
          <div style={{position:"relative"}}>
            <Av e={conv.expert} size={48}/>
            {!isRead&&<div style={{position:"absolute",top:-2,right:-2,width:18,height:18,borderRadius:"50%",background:C.gold,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{conv.unread}</div>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:14,fontWeight:isRead?600:700,color:C.ink,fontFamily:SERIF}}>{conv.expert.name}</span>
              <span style={{fontSize:11,color:C.muted}}>{conv.time}</span>
            </div>
            <div style={{fontSize:11,color:isRead?C.muted:C.gold,fontWeight:600,marginBottom:2}}>Expert</div>
            <div style={{fontSize:12,color:isRead?C.muted:C.ink,fontWeight:isRead?400:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.lastMsg}</div>
          </div>
          {!isRead && <div style={{width:8,height:8,borderRadius:"50%",background:C.gold,flexShrink:0}}/>}
        </div>
        );
      })}

      {/* Client conversations */}
      {(msgFilter==="tous"||msgFilter==="clients") && visibleConvs.filter(c=>c.type==="client").map(conv=>{
        const convKey = "cli-"+conv.id;
        const isRead = readMsgIds.includes(convKey) || conv.unread===0;
        return (
        <div key={conv.id} onClick={()=>markMsgRead(convKey)} style={{display:"flex",gap:12,alignItems:"center",background:C.white,borderRadius:16,padding:"14px 15px",marginBottom:10,cursor:"pointer",border:`1px solid ${isRead?C.border:"#6EE7B7"}`,boxShadow:`0 1px 6px ${C.sh}`,transition:"border-color .25s"}}>
          <div style={{position:"relative"}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:conv.bg,color:conv.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16}}>{conv.ini}</div>
            {!isRead&&<div style={{position:"absolute",top:-2,right:-2,width:18,height:18,borderRadius:"50%",background:C.sage,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{conv.unread}</div>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
              <span style={{fontSize:14,fontWeight:isRead?600:700,color:C.ink,fontFamily:SERIF}}>{conv.name}</span>
              <span style={{fontSize:11,color:C.muted}}>{conv.time}</span>
            </div>
            <div style={{fontSize:11,color:isRead?C.muted:C.sage,fontWeight:600,marginBottom:2}}>Client</div>
            <div style={{fontSize:12,color:isRead?C.muted:C.ink,fontWeight:isRead?400:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.lastMsg}</div>
          </div>
          {!isRead && <div style={{width:8,height:8,borderRadius:"50%",background:C.sage,flexShrink:0}}/>}
          <button onClick={e=>{e.stopPropagation();setArchivedIds(a=>[...a,conv.id]);}} style={{flexShrink:0,width:30,height:30,borderRadius:9,border:`1px solid ${C.border}`,background:C.cream2,color:C.muted,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}} title="Archiver">
            📦
          </button>
        </div>
        );
      })}

      {allConvs.length===0 && (
        <div style={{textAlign:"center",padding:"48px 16px",color:C.muted,fontSize:13}}>
          <div style={{fontSize:36,marginBottom:12}}>💬</div>
          Aucune conversation dans cette catégorie
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

  // Expert-specific availability based on their profile
  const expertSlots = expert?.phases?.[0]?.format?.includes("Vidéo")
    ? ["09:00","10:00","11:00","14:00","15:00","17:00"]
    : ["10:00","14:00","16:00"];

  const isAvail = (d) => {
    if (!d || d <= today) return false;
    const day = d.getDay();
    // Weekends available only if expert offers it
    if (day === 0) return false; // Sunday never
    if (day === 6 && expert?.id > 3) return true; // Some experts work Saturdays
    if (day === 6) return false;
    return true;
  };

  const getSlots = (d) => {
    if (!d) return [];
    const day = d.getDay();
    if (day === 6) return ["10:00","11:00"]; // Saturday — shorter
    if (day === 1 || day === 3) return expertSlots.slice(0,3); // Mon/Wed — morning
    if (day === 2 || day === 4) return expertSlots.slice(2,5); // Tue/Thu — afternoon
    return expertSlots.slice(0,4); // Fri — full day
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
        <button onClick={() => setViewMonth(new Date(year, month-1, 1))} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
            {getSlots(selDate).map(s => (
              <button key={s} onClick={() => { setSelSlot(s); if(onSelect) onSelect({date:selDate, slot:s}); }} style={{ padding:"9px 18px", borderRadius:11, border:`2px solid ${selSlot===s?C.ink:C.border}`, background:selSlot===s?C.ink:C.white, color:selSlot===s?C.white:C.ink, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:SERIF }}>
                {s}
              </button>
            ))}
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
              <span style={{ fontSize:22 }}>🔁</span>
              <div>
                <div style={{ fontFamily:SERIF }}>Reprogrammer</div>
                <div style={{ fontSize:11, fontWeight:400, opacity:.7, marginTop:1 }}>Proposer une nouvelle date</div>
              </div>
            </button>
            <button onClick={() => { onMsg && onMsg(expert, "reservations"); onClose(); }} style={{ width:"100%", padding:"13px 16px", borderRadius:13, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22 }}>💬</span>
              <div style={{ textAlign:"left" }}>
                <div>Envoyer un message</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Parler à {expert.name.split(" ")[0]}</div>
              </div>
            </button>
            <button onClick={() => setStep("cancel_confirm")} style={{ width:"100%", padding:"13px 16px", borderRadius:13, border:"1.5px solid #FEE2E2", cursor:"pointer", fontWeight:600, fontSize:13, background:"#FFF5F5", color:"#B91C1C", fontFamily:"inherit", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22 }}>❌</span>
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

function SessionCard({ s, onMsg, onCancel, onExpert }) {
  const expert = EXPERTS[s.eid];
  if (!expert) return null;
  const isToday = s.date === "Demain";
  return (
    <div style={{ background:C.white, borderRadius:18, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:14, boxShadow:`0 2px 12px ${C.sh}` }}>
      <div style={{ height:4, background:`linear-gradient(90deg,${expert.color},${expert.bg})` }}/>
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ width:42, height:42, borderRadius:"50%", background:expert.bg, color:expert.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:15, border:`1.5px solid ${C.border}` }}>{expert.initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>{expert.name}</div>
              <div style={{ fontSize:11, color:C.muted }}>{expert.role.split("·")[0].trim()}</div>
            </div>
          </div>
          <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:s.status==="confirmed"?C.sageL:"#FEF3C7", color:s.status==="confirmed"?C.sage:"#92400E", fontWeight:700 }}>
            {s.statusLabel}
          </span>
        </div>
        <div style={{ background:C.cream2, borderRadius:10, padding:"9px 12px", marginBottom:12, borderLeft:`2px solid ${expert.color}` }}>
          <div style={{ fontSize:12, color:C.soft, lineHeight:1.5 }}>💡 {s.topic}</div>
        </div>
        <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:14 }}>
          <span style={{ fontSize:12, color:C.muted }}>📅 {s.date} · {s.time}</span>
          <span style={{ fontSize:12, color:C.muted }}>⏱ {s.duration}</span>
          <span style={{ fontSize:12, color:C.muted }}>{s.format}</span>
          <span style={{ fontSize:12, color:C.muted }}>💶 {s.price}€</span>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {isToday && (
            <button style={{ flex:2, padding:"10px", borderRadius:11, border:"none", cursor:"pointer", fontWeight:700, fontSize:12, background:C.sage, color:C.white, fontFamily:"inherit" }}>
              🟢 Entrer dans la session
            </button>
          )}
          <button onClick={() => onMsg && onMsg(expert, "reservations")} style={{ flex:1, padding:"10px", borderRadius:11, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:12, background:C.white, color:C.ink, fontFamily:"inherit" }}>
            💬 Message
          </button>
          <button onClick={() => onCancel && onCancel(s)} style={{ flex:1, padding:"10px", borderRadius:11, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:12, background:C.white, color:C.muted, fontFamily:"inherit" }}>
            ···
          </button>
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
      <div style={{ fontSize:12, color:C.soft, background:C.cream2, borderRadius:9, padding:"8px 11px", marginBottom:10 }}>💡 {s.topic}</div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => onResume && onResume({...s, expert})} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:12, background:C.white, color:C.ink, fontFamily:"inherit" }}>
          📋 Résumé
        </button>
        <button onClick={() => onReview && onReview({...s, expert})} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${C.goldB}`, cursor:"pointer", fontWeight:700, fontSize:12, background:C.goldL, color:C.gold, fontFamily:"inherit" }}>
          ⭐ Avis
        </button>
        <button onClick={() => onExpert && onExpert(expert)} style={{ flex:1, padding:"9px", borderRadius:10, border:`1px solid ${C.goldB}`, cursor:"pointer", fontWeight:700, fontSize:12, background:C.goldL, color:C.gold, fontFamily:"inherit" }}>
          🔁 Répéter
        </button>
      </div>
    </div>
  );
}

function ReservationsScreen({ onExpert, onMsg, isLoggedIn, onLogin }) {
  const [tab, setTab] = useState("avenir");
  const [cancelSession, setCancelSession] = useState(null);
  const [resumeSession, setResumeSession] = useState(null);
  const [reviewSession, setReviewSession] = useState(null);
  const [calView, setCalView] = useState(false);
  // Local mutable sessions state
  const [sessionsAvenir, setSessionsAvenir] = useState([...SESSIONS_AVENIR]);
  const [sessionsCancelees, setSessionsCancelees] = useState([...SESSIONS_ANNULEES]);
  if (!isLoggedIn) return (
    <LoginGate icon="📅" title="Tes réservations t\'attendent" sub="Connecte-toi pour voir et gérer tes sessions avec les experts." onLogin={onLogin}/>
  );

  const TABS = [
    { id:"avenir",   label:"🟢 À venir",  count:sessionsAvenir.length   },
    { id:"passees",  label:"⚪ Passées",   count:SESSIONS_PASSEES.length  },
    { id:"annulees", label:"❌ Annulées",  count:SESSIONS_ANNULEES.length },
  ];

  return (
    <>
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
            sessionsAvenir.length > 0
              ? sessionsAvenir.map(s => <SessionCard key={s.id} s={s} onMsg={onMsg} onCancel={setCancelSession} onExpert={onExpert}/>)
              : (
                <div style={{ textAlign:"center", padding:"60px 20px" }}>
                  <div style={{ fontSize:40, marginBottom:14 }}>📅</div>
                  <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>Aucune session à venir</div>
                  <div style={{ fontSize:13, color:C.muted, marginBottom:20 }}>Trouve un expert et réserve ta première session.</div>
                </div>
              )
          )}
          {/* Passées */}
          {tab === "passees" && (
            SESSIONS_PASSEES.length > 0
              ? SESSIONS_PASSEES.map(s => <PastCard key={s.id} s={s} onExpert={onExpert} onResume={setResumeSession} onReview={setReviewSession}/>)
              : <div style={{ textAlign:"center", padding:"48px 0", color:C.muted }}>Aucune session passée.</div>
          )}
          {/* Annulées */}
          {tab === "annulees" && (
            SESSIONS_ANNULEES.length > 0 ? (
              sessionsCancelees.map(s => {
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
                        <span style={{ fontSize:10, padding:"3px 9px", borderRadius:20, background:"#FFF5F5", color:"#B91C1C", fontWeight:700, border:"1px solid #FEE2E2" }}>❌ Annulée</span>
                      </div>
                      <div style={{ background:"#FFF5F5", borderRadius:10, padding:"9px 13px", marginBottom:10 }}>
                        <div style={{ fontSize:12, color:C.soft }}>💡 {s.topic}</div>
                      </div>
                      <div style={{ display:"flex", gap:14, flexWrap:"wrap", marginBottom:10 }}>
                        <span style={{ fontSize:11, color:C.muted }}>📅 {s.date} · {s.time}</span>
                        <span style={{ fontSize:11, color:C.muted }}>{s.format}</span>
                        <span style={{ fontSize:11, color:C.muted }}>💶 {s.price}€</span>
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
                <div style={{ fontSize:40, marginBottom:14 }}>✅</div>
                <div style={{ fontSize:15, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:6 }}>Aucune annulation</div>
                <div style={{ fontSize:12, color:C.muted }}>Super — tes sessions se passent bien !</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modals */}
      {reviewSession && <ReviewModal session={reviewSession} onClose={()=>setReviewSession(null)}/>}
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
function SignupScreen({ onBack, onDone, authUser }) {
  const [step, setStep] = useState(0); // 0 = landing, 1-5 = étapes
  const [finalProfile, setFinalProfile] = useState(null);
  const [form, setForm] = useState({
    photoUrl: authUser?.photoUrl || "",
    prenom:   (authUser?.name || "").split(" ")[0] || "",
    nom:      (authUser?.name || "").split(" ").slice(1).join(" ") || "",
    email:    authUser?.email || "",
    city:"",
    category:"", specialty:"", price:0,
    phases:[{ name:"", what:"", format:"video", formats:[], price:"" }],
    creds:["","",""],
  });;
  const patch = (p) => setForm(f => ({...f,...p}));
  const pct = [0, 20, 40, 60, 80, 100][step] || 0;

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
        <span style={{ marginLeft:"auto", fontSize:11, color:C.muted, background:C.cream2, padding:"2px 9px", borderRadius:20, fontWeight:600 }}>{step}/5</span>
      </div>
      {/* Progress bar */}
      <div style={{ height:3, background:C.cream3, borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.sage},${C.sageMid})`, borderRadius:2, transition:"width .4s ease" }}/>
      </div>
      {/* Dots */}
      <div style={{ display:"flex", gap:5, justifyContent:"center", marginTop:8 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ width:i < step ? 20 : 7, height:7, borderRadius:4, background:i < step ? C.sageMid : i === step ? C.ink : C.cream3, transition:"all .3s ease" }}/>
        ))}
      </div>
    </div>
  );

  // ── Submitted ──────────────────────────────────────────────────────────────
  if (form.submitted) return (
    <div style={{ flex:1, overflowY:"auto", background:C.cream }}>
      {/* Hero célébration */}
      <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"48px 24px 40px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(185,134,74,.06)" }}/>
        <div style={{ position:"absolute", bottom:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(185,134,74,.06)" }}/>
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:56, marginBottom:14 }}>🎉</div>
          <h1 style={{ fontSize:26, fontWeight:700, color:C.white, fontFamily:SERIF, margin:"0 0 10px", letterSpacing:"-.5px" }}>
            Bienvenue dans Savvy,<br/><em style={{ color:C.goldB }}>{form.prenom} !</em>
          </h1>
          <p style={{ fontSize:14, color:"rgba(253,252,248,.65)", lineHeight:1.7, margin:0 }}>
            Ton dossier est en cours d\'examen.<br/>
            Réponse sous <b style={{ color:C.goldB }}>24–48h</b> à <b style={{ color:C.goldB }}>{form.email}</b>
          </p>
        </div>
      </div>

      <div style={{ padding:"24px 20px 32px" }}>
        {/* Revenus */}
        <div style={{ background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`, borderRadius:18, padding:"20px", marginBottom:18, border:`1px solid ${C.goldB}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:52, height:52, borderRadius:15, background:C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>💰</div>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Tu gardes 80%</div>
              <div style={{ fontSize:12, color:C.muted }}>de chaque session réservée</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[{v:"10€",l:"→ tu reçois",s:"8€"},{v:"50€",l:"→ tu reçois",s:"40€"},{v:"150€",l:"→ tu reçois",s:"120€"}].map((ex,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,.7)", borderRadius:11, padding:"10px 8px", textAlign:"center" }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.gold, fontFamily:SERIF }}>{ex.v}</div>
                <div style={{ fontSize:9, color:C.muted }}>{ex.l}</div>
                <div style={{ fontSize:15, fontWeight:800, color:C.ink, fontFamily:SERIF }}>{ex.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Prochaines étapes */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:13 }}>En attendant la validation</div>
          {[
            {icon:"📸", title:"Ajoute une photo de profil", sub:"Les profils avec photo convertissent 3× plus", done:false},
            {icon:"✍️", title:"Affine ta bio", sub:"2-3 phrases percutantes sur ton expérience réelle", done:false},
            {icon:"📲", title:"Partage ton profil", sub:"Dis à tes contacts que tu rejoins Savvy", done:false},
          ].map((s,i)=>(
            <div key={i} style={{ display:"flex", gap:13, alignItems:"flex-start", background:C.white, borderRadius:14, padding:"13px 15px", marginBottom:9, border:`1px solid ${C.border}` }}>
              <div style={{ width:42, height:42, borderRadius:12, background:C.cream2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{s.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>{s.title}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:2, lineHeight:1.5 }}>{s.sub}</div>
              </div>
              <div style={{ width:22, height:22, borderRadius:"50%", background:C.cream3, border:`1.5px solid ${C.border}`, flexShrink:0, marginTop:2 }}/>
            </div>
          ))}
        </div>

        {/* Savvy te protège */}
        <div style={{ background:C.white, borderRadius:14, padding:"14px 16px", marginBottom:20, border:`1px solid ${C.border}` }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:10 }}>Ce que Savvy fait pour toi</div>
          {["Paiements sécurisés — tu es toujours payé","NDA automatique sur chaque session","Support client en français 7j/7","Commission fixe 20% — jamais plus"].map((t,i)=>(
            <div key={i} style={{ display:"flex", gap:9, alignItems:"flex-start", marginBottom:8 }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.sage} strokeWidth={2.5} style={{ flexShrink:0, marginTop:1 }}><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize:12, color:C.soft, lineHeight:1.5 }}>{t}</span>
            </div>
          ))}
        </div>

        <button onClick={() => { if(onDone && finalProfile) onDone(finalProfile); else onBack(); }} style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:16, cursor:"pointer", fontFamily:SERIF, letterSpacing:".2px" }}>
          ⭐ Accéder à mon profil conseiller
        </button>
        <div style={{ textAlign:"center", fontSize:11, color:C.faint, marginTop:12 }}>
          Savvy · Made with ✦ in Paris
        </div>
      </div>
    </div>
  );

  // ── STEP 0 — Landing ────────────────────────────────────────────────────────
  if (step === 0) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", background:C.cream }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(165deg,${C.ink} 0%,#2C2825 100%)`, padding:"40px 24px 36px", position:"relative", overflow:"hidden", textAlign:"center" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(185,134,74,.05)" }}/>
        <div style={{ position:"relative" }}>
          <div style={{ fontSize:38, marginBottom:16 }}>✦</div>
          <h1 style={{ fontSize:28, fontWeight:700, color:C.white, lineHeight:1.25, margin:"0 0 12px", fontFamily:SERIF, letterSpacing:"-.5px" }}>
            Quelqu\'un a besoin<br/>
            <em style={{ color:C.goldB }}>exactement de ce<br/>que tu sais faire.</em>
          </h1>
          <p style={{ fontSize:14, color:"rgba(253,252,248,.72)", lineHeight:1.7, margin:"0 0 24px", maxWidth:280, marginLeft:"auto", marginRight:"auto" }}>
            Des milliers de personnes cherchent un conseil de quelqu\'un qui l\'a vraiment vécu. Sois cette personne.
          </p>
          <button onClick={() => setStep(1)} style={{ padding:"15px 36px", borderRadius:50, border:"none", cursor:"pointer", fontWeight:700, fontSize:16, background:`linear-gradient(135deg,${C.gold},${C.goldB})`, color:C.white, fontFamily:SERIF, letterSpacing:".3px", boxShadow:`0 4px 20px rgba(185,134,74,.4)` }}>
            Je me lance →
          </button>
          <div style={{ fontSize:11, color:"rgba(253,252,248,.4)", marginTop:12 }}>Gratuit · 2 min · Sans engagement</div>
        </div>
      </div>

      {/* Pourquoi Savvy */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 22px 30px" }}>
        <h2 style={{ fontSize:17, fontWeight:700, color:C.ink, marginBottom:16, fontFamily:SERIF, textAlign:"center" }}>Pourquoi rejoindre Savvy ?</h2>
        {[
          { icon:"💰", title:"Tu gardes 80%", sub:"Fixe ton propre tarif. Savvy prend seulement 20% pour la plateforme." },
          { icon:"🎯", title:"Ta vraie expérience = ta valeur", sub:"Pas de diplôme requis. Ce qui compte, c\'est ce que tu as réellement vécu." },
          { icon:"⚡", title:"Commence en 2 minutes", sub:"Crée ton profil maintenant. Tu es en ligne dès validation de l\'équipe Savvy." },
          { icon:"🔒", title:"Tu contrôles tout", sub:"Tes disponibilités, tes tarifs, tes phases. Tu décides comment tu travailles." },
        ].map(item => (
          <div key={item.title} style={{ display:"flex", gap:14, alignItems:"flex-start", marginBottom:18 }}>
            <div style={{ width:44, height:44, borderRadius:13, background:C.goldL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0, border:`1px solid ${C.goldB}` }}>{item.icon}</div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:3 }}>{item.title}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{item.sub}</div>
            </div>
          </div>
        ))}

        {/* Social proof */}
        <div style={{ background:C.white, borderRadius:16, padding:"16px", border:`1px solid ${C.border}`, marginTop:6 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.6, marginBottom:12 }}>Ils ont déjà rejoint Savvy</div>
          {[
            { name:"Patrick G.", role:"Expert labo pâtisserie", earn:"1 240€", months:"ce mois" },
            { name:"Marie A.",   role:"Chef pâtissière",        earn:"680€",   months:"ce mois" },
            { name:"Lucas B.",   role:"Expert export Colombie", earn:"950€",   months:"ce mois" },
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
          Créer mon profil →
        </button>
        <div style={{ textAlign:"center", fontSize:11, color:C.muted, marginTop:10 }}>
          En créant un profil, tu acceptes les <span style={{ color:C.gold, fontWeight:600 }}>CGU Savvy</span>
        </div>
      </div>
    </div>
  );

  // ── STEP 1 — Infos de base ──────────────────────────────────────────────────
  if (step === 1) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.cream }}>
      <Hdr title="Qui es-tu ?"/>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 18px 24px" }}>

        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:14, color:C.ink, fontWeight:600, fontFamily:SERIF, margin:"0 0 4px" }}>
            Bienvenue ! On a juste besoin de quelques infos pour commencer. 👋
          </p>
          <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.6 }}>
            Pas de prise de tête. Tu peux toujours modifier ton profil plus tard.
          </p>
        </div>

        {/* Photo de profil */}
        <div style={{ textAlign:"center", marginBottom:22 }}>
          <input id="signup-photo-input" type="file" accept="image/*" style={{ display:"none" }}
            onChange={e=>{ const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onload=ev=>patch({photoUrl:ev.target.result}); r.readAsDataURL(f); } e.target.value=""; }}/>
          <label htmlFor="signup-photo-input" style={{ display:"inline-block", cursor:"pointer" }}>
            {form.photoUrl
              ? <img src={form.photoUrl} alt="profil" style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover", border:`3px solid ${C.gold}`, display:"block", margin:"0 auto 8px" }}/>
              : <div style={{ width:80, height:80, borderRadius:"50%", background:C.goldL, border:`2px dashed ${C.goldB}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
                  <div style={{ fontSize:24 }}>📷</div>
                  <div style={{ fontSize:9, color:C.gold, fontWeight:600, marginTop:2 }}>Ajouter</div>
                </div>
            }
          </label>
          <div style={{ fontSize:11, color:C.muted }}>{form.photoUrl ? "✅ Photo ajoutée — tape pour changer" : "Photo de profil · optionnelle mais recommandée"}</div>
        </div>

        {/* Prénom + Nom sur une ligne */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:13 }}>
          {[["Prénom","prenom","Clément"],["Nom","nom","Rousseau"]].map(([label,key,ph]) => (
            <div key={key}>
              <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:".5px" }}>{label}</label>
              <input value={form[key]} onChange={e => patch({[key]:e.target.value})} placeholder={ph}
                style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>
            </div>
          ))}
        </div>

        {/* Email — ton email, pas "email professionnel" */}
        <div style={{ marginBottom:13 }}>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:".5px" }}>Ton email</label>
          <input value={form.email} onChange={e => patch({email:e.target.value})} placeholder="hola@toi.com" type="email"
            style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>
          <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>📧 Pour recevoir la confirmation de ton profil.</div>
        </div>

        {/* Pays */}
        <div style={{ marginBottom:13 }}>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:".5px" }}>Où tu vis</label>
          <select value={form.pays} onChange={e => patch({pays:e.target.value})}
            style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}>
            {PAYS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Langues */}
        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:8, display:"block", textTransform:"uppercase", letterSpacing:".5px" }}>Langues</label>
          <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
            {LANGS.map(l => (
              <button key={l} onClick={() => patch({langs:(form.langs||[]).includes(l)?(form.langs||[]).filter(x=>x!==l):[...(form.langs||[]),l]})}
                style={{ padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit",
                  background:(form.langs||[]).includes(l)?C.ink:C.cream3, color:(form.langs||[]).includes(l)?C.white:C.soft, transition:"all .15s" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => {
          if (!form.prenom.trim() || !form.nom.trim()) { alert("Ton prénom et ton nom sont nécessaires."); return; }
          if (!form.email.includes("@")) { alert("Ton email semble invalide."); return; }
          if (!(form.langs||[]).length) { alert("Sélectionne au moins une langue."); return; }
          setStep(2);
        }} style={{ width:"100%", padding:"14px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:SERIF }}>
          Continuer →
        </button>
      </div>
    </div>
  );

  // ── STEP 2 — Domaine ────────────────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.cream }}>
      <Hdr title="Ton expertise"/>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 18px 24px" }}>

        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:14, color:C.ink, fontWeight:600, fontFamily:SERIF, margin:"0 0 4px" }}>Qu\'est-ce que tu sais vraiment faire ?</p>
          <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.6 }}>Pas besoin de diplôme. Ce qui compte, c\'est ce que tu as réellement vécu.</p>
        </div>

        {/* Catégorie — icons repensés */}
        <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:10, textTransform:"uppercase", letterSpacing:".5px" }}>Ton domaine</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9, marginBottom:20 }}>
          {CATS.map(cat => (
            <button key={cat.id} onClick={() => patch({category:cat.id})}
              style={{ padding:"14px 12px", borderRadius:14, cursor:"pointer", textAlign:"center", fontFamily:"inherit",
                border:form.category===cat.id?`2px solid ${cat.color}`:`1px solid ${C.border}`,
                background:form.category===cat.id?cat.bg:C.white,
                boxShadow:form.category===cat.id?`0 2px 12px rgba(0,0,0,.08)`:"none",
                transition:"all .15s" }}>
              <div style={{ fontSize:26, marginBottom:6 }}>{cat.icon}</div>
              <div style={{ fontSize:12, fontWeight:700, color:form.category===cat.id?cat.color:C.ink, lineHeight:1.3 }}>{cat.label}</div>
              <div style={{ fontSize:10, color:C.muted, marginTop:3, lineHeight:1.3 }}>{cat.sub}</div>
            </button>
          ))}
        </div>

        {/* Spécialité — reformulée */}
        <div style={{ marginBottom:20 }}>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:8, display:"block", textTransform:"uppercase", letterSpacing:".5px" }}>
            Quel problème tu sais résoudre ?
          </label>
          <div style={{ position:"relative" }}>
            <input value={form.specialty} onChange={e => patch({specialty:e.target.value})}
              placeholder={SPECIALTY_EXAMPLES[exIdx]}
              style={{ width:"100%", padding:"11px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white, lineHeight:1.5 }}/>
          </div>
          {/* Exemples cliquables */}
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:11, color:C.muted, marginBottom:7 }}>Des exemples pour t\'inspirer :</div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {SPECIALTY_EXAMPLES.slice(0,4).map((ex,i) => (
                <button key={i} onClick={() => patch({specialty:ex})}
                  style={{ textAlign:"left", padding:"7px 11px", borderRadius:9, border:`1px solid ${C.border}`, background:form.specialty===ex?C.goldL:C.cream2, cursor:"pointer", fontSize:11, color:form.specialty===ex?C.gold:C.soft, fontFamily:"inherit", fontWeight:form.specialty===ex?700:400 }}>
                  → {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info tarif — pas de champ redondant, le prix est dans chaque offre */}
        <div style={{ background:C.goldL, borderRadius:12, padding:"12px 14px", marginBottom:24, border:`1px solid ${C.goldB}`, display:"flex", gap:9, alignItems:"flex-start" }}>
          <span style={{ fontSize:18, flexShrink:0 }}>💡</span>
          <div>
            <div style={{ fontSize:12, color:C.gold, fontWeight:700, marginBottom:4 }}>C\'est toi qui décides — à l\'étape suivante ✦</div>
            <div style={{ fontSize:11, color:C.gold, opacity:.9, lineHeight:1.7 }}>
              Chaque offre a son propre prix. Commence à partir de 5€ si tu veux, ou facture ce que ton expérience vaut vraiment — il n\'y a pas de plafond.<br/>
              <span style={{ fontWeight:700 }}>Tu gardes 80% de chaque session.</span> Savvy retient 20% pour la plateforme.
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:9 }}>
          <button onClick={() => setStep(1)} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:700, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit" }}>← Retour</button>
          <button onClick={() => {
            if (!form.category) { alert("Choisis ton domaine."); return; }
            if (!form.specialty.trim()) { alert("Décris le problème que tu sais résoudre."); return; }
            setStep(3);
          }} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF }}>Continuer →</button>
        </div>
      </div>
    </div>
  );

  // ── STEP 3 — Preuves ────────────────────────────────────────────────────────
  if (step === 3) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.cream }}>
      <Hdr title="Tes preuves"/>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 18px 24px" }}>
        <div style={{ marginBottom:18 }}>
          <p style={{ fontSize:14, color:C.ink, fontWeight:600, fontFamily:SERIF, margin:"0 0 4px" }}>Montre ce que tu as vraiment fait.</p>
          <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.6 }}>Optionnel mais très recommandé — les profils avec preuves se vendent 3× plus.</p>
        </div>

        {/* Bio */}
        <div style={{ marginBottom:18 }}>
          <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:5, display:"block", textTransform:"uppercase", letterSpacing:".5px" }}>En 2 phrases, qui es-tu ?</label>
          <textarea value={form.bio} onChange={e => patch({bio:e.target.value})} maxLength={200}
            placeholder="Ex : J\'ai géré l\'import de parfums de Grasse en France pendant 8 ans. Je t\'aide à éviter les erreurs que j\'ai moi-même faites."
            style={{ width:"100%", padding:"11px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:12, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white, height:80, resize:"none", lineHeight:1.6 }}/>
          <div style={{ fontSize:11, color:C.muted, textAlign:"right", marginTop:3 }}>{(form.bio||"").length}/200</div>
        </div>

        {/* Preuves flexibles */}
        <div style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:10, textTransform:"uppercase", letterSpacing:".5px" }}>
          Preuves d\'expérience <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optionnel)</span>
        </div>

        {(form.proofs||[]).map((proof, i) => (
          <div key={i} style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, marginBottom:10, overflow:"hidden" }}>
            {/* Type selector */}
            <div style={{ display:"flex", borderBottom:`1px solid ${C.borderF}`, overflowX:"auto" }}>
              {PROOF_TYPES.map(t => (
                <button key={t.id} onClick={() => {
                  const proofs=[...form.proofs]; proofs[i]={...proofs[i],type:t.id}; patch({proofs});
                }} style={{ padding:"8px 12px", border:"none", background:proof.type===t.id?C.goldL:"transparent", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:proof.type===t.id?700:400, color:proof.type===t.id?C.gold:C.muted, whiteSpace:"nowrap", borderBottom:proof.type===t.id?`2px solid ${C.gold}`:"2px solid transparent", transition:"all .15s" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            {/* Input */}
            <div style={{ padding:"10px 13px", display:"flex", gap:8, alignItems:"flex-start" }}>
              <input value={proof.content} onChange={e => {
                const proofs=[...form.proofs]; proofs[i]={...proofs[i],content:e.target.value}; patch({proofs});
              }} placeholder={PROOF_TYPES.find(t=>t.id===proof.type)?.hint || ""}
                style={{ flex:1, border:"none", background:"none", fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none" }}/>
              {i > 0 && <button onClick={() => patch({proofs:form.proofs.filter((_,j)=>j!==i)})}
                style={{ background:"none", border:"none", cursor:"pointer", color:C.faint, fontSize:18, padding:0, flexShrink:0 }}>×</button>}
            </div>
          </div>
        ))}

        <button onClick={() => patch({proofs:[...form.proofs,{type:"cas",content:""}]})}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"11px 14px", borderRadius:12, border:`1px dashed ${C.goldB}`, cursor:"pointer", color:C.gold, fontSize:12, fontWeight:700, background:"transparent", fontFamily:"inherit", justifyContent:"center", marginBottom:22 }}>
          + Ajouter une preuve
        </button>

        <div style={{ display:"flex", gap:9 }}>
          <button onClick={() => setStep(2)} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:700, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit" }}>← Retour</button>
          <button onClick={() => setStep(4)} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF }}>Continuer →</button>
        </div>
      </div>
    </div>
  );

  // ── STEP 4 — Ton offre (résultat) ─────────────────────────────────────────
  const FORMATS_SIMPLE = [
    { id:"video",   icon:"🎥", label:"Vidéocall",         sub:"Appel vidéo en direct" },
    { id:"audio",   icon:"🎧", label:"Appel audio",       sub:"Appel téléphonique" },
    { id:"doc",     icon:"📄", label:"Document / guide",  sub:"Livrable écrit ou PDF" },
    { id:"chat",    icon:"💬", label:"Accompagnement",    sub:"Échanges par messagerie" },
  ];

  if (step === 4) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.cream }}>
      <Hdr title="Ton offre"/>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 18px 24px" }}>

        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:14, color:C.ink, fontWeight:600, fontFamily:SERIF, margin:"0 0 4px" }}>
            Quel résultat ton client va-t\'il obtenir ?
          </p>
          <p style={{ fontSize:12, color:C.muted, margin:0, lineHeight:1.6 }}>
            Décris ce qu\'il repart avec — pas comment tu travailles, mais ce qu\'il gagne.
          </p>
        </div>

        {(form.phases||[]).map((ph, i) => (
          <div key={i} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", marginBottom:14 }}>
            {/* Header offre */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 15px", background:C.cream2, borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:C.ink, color:C.white, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800 }}>{i+1}</div>
                <span style={{ fontSize:13, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Offre {i+1}</span>
              </div>
              {i > 0 && (
                <button onClick={() => patch({phases:form.phases.filter((_,j)=>j!==i)})}
                  style={{ background:"none", border:"none", cursor:"pointer", color:C.faint, fontSize:20, padding:0 }}>×</button>
              )}
            </div>

            <div style={{ padding:"14px 15px", display:"flex", flexDirection:"column", gap:12 }}>

              {/* Résultat — le titre de l\'offre orienté bénéfice */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:".5px" }}>
                  Ce que le client obtient
                </label>
                <input value={ph.name||""} onChange={e => { const phases=[...form.phases]; phases[i]={...phases[i],name:e.target.value}; patch({phases}); }}
                  placeholder="Ex : Un plan d\'import clé-en-main pour la Colombie"
                  style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>
              </div>

              {/* Description résultat — min 80 chars */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:".5px" }}>
                    Décris le résultat en détail
                  </label>
                  <span style={{ fontSize:10, fontWeight:700, color:(ph.what||"").length>=80?C.sage:(ph.what||"").length>0?"#92400E":C.faint }}>
                    {(ph.what||"").length}/80 min
                  </span>
                </div>
                <textarea value={ph.what||""} onChange={e => { const phases=[...form.phases]; phases[i]={...phases[i],what:e.target.value}; patch({phases}); }}
                  placeholder="Ex : Tu repars avec une liste de fournisseurs fiables, les documents douaniers pré-remplis et un plan étape par étape."
                  style={{ width:"100%", padding:"10px 13px", borderRadius:11, border:`1.5px solid ${(ph.what||"").length>=80?C.sage:(ph.what||"").length>0?"#FDE68A":C.border}`, fontSize:12, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white, height:80, resize:"none", lineHeight:1.6, transition:"border-color .2s" }}/>
                {(ph.what||"").length>0 && (ph.what||"").length<80 && (
                  <div style={{ fontSize:10, color:"#92400E", marginTop:4 }}>
                    ✏️ Encore {80-(ph.what||"").length} caractères — plus de détail = plus de réservations
                  </div>
                )}
                {(ph.what||"").length>=80 && (
                  <div style={{ fontSize:10, color:C.sage, marginTop:4 }}>✅ Parfait !</div>
                )}
              </div>

              {/* Format — multi-select, expert choisit tout ce qu'il propose */}
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
                  <label style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:".5px" }}>
                    Comment ça se passe ?
                  </label>
                  <span style={{ fontSize:10, color:C.muted }}>Plusieurs choix possibles</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                  {FORMATS_SIMPLE.map(f => {
                    const formats = Array.isArray(ph?.formats) ? ph.formats : (ph?.format ? [ph.format] : []);
                    const isSelected = formats.includes(f.id);
                    const toggle = () => {
                      const next = isSelected ? formats.filter(x=>x!==f.id) : [...formats, f.id];
                      const phases=[...form.phases]; phases[i]={...phases[i], formats:next, format:next[0]||""}; patch({phases});
                    };
                    return (
                      <button key={f.id} onClick={toggle}
                        style={{ padding:"10px 11px", borderRadius:11, cursor:"pointer", fontFamily:"inherit", textAlign:"left", position:"relative",
                          border:isSelected?`2px solid ${C.ink}`:`1px solid ${C.border}`,
                          background:isSelected?C.ink:C.white,
                          transition:"all .15s" }}>
                        {isSelected && (
                          <div style={{ position:"absolute", top:6, right:8, width:16, height:16, borderRadius:"50%", background:C.white, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                        )}
                        <div style={{ fontSize:18, marginBottom:3 }}>{f.icon}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:isSelected?C.white:C.ink }}>{f.label}</div>
                        <div style={{ fontSize:10, color:isSelected?"rgba(253,252,248,.6)":C.muted, marginTop:1 }}>{f.sub}</div>
                      </button>
                    );
                  })}
                </div>
                {Array.isArray(ph.formats) && ph.formats.length>1 && (
                  <div style={{ fontSize:10, color:C.sage, marginTop:6 }}>
                    ✅ Le client choisira parmi tes {ph.formats.length} formats au moment de réserver
                  </div>
                )}
              </div>

              {/* Prix simple */}
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:".5px" }}>
                  Tarif pour ce résultat
                </label>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ position:"relative", flex:1 }}>
                    <input type="number" min={1} value={ph.price||""} onChange={e => { const phases=[...form.phases]; phases[i]={...phases[i],price:parseFloat(e.target.value)||""}; patch({phases}); }}
                      placeholder="50"
                      style={{ width:"100%", padding:"11px 40px 11px 13px", borderRadius:11, border:`1px solid ${C.border}`, fontSize:20, fontFamily:SERIF, fontWeight:700, color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>
                    <span style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", fontSize:18, fontWeight:700, color:C.muted, fontFamily:SERIF }}>€</span>
                  </div>
                  {ph.price > 0 && (
                    <div style={{ background:C.sageL, borderRadius:11, padding:"9px 13px", flexShrink:0, textAlign:"center", minWidth:70 }}>
                      <div style={{ fontSize:16, fontWeight:700, color:C.sage, fontFamily:SERIF }}>{Math.round(ph.price*.8)}€</div>
                      <div style={{ fontSize:9, color:C.sage, marginTop:1 }}>pour toi</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Ajouter une offre */}
        <button onClick={() => patch({phases:[...form.phases,{name:"",format:"video",price:"",what:""}]})}
          style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"12px 14px", borderRadius:13, border:`1px dashed ${C.goldB}`, cursor:"pointer", color:C.gold, fontSize:13, fontWeight:700, background:"transparent", fontFamily:"inherit", justifyContent:"center", marginBottom:22 }}>
          + Ajouter une offre
        </button>

        <div style={{ display:"flex", gap:9 }}>
          <button onClick={() => setStep(3)} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:700, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit" }}>← Retour</button>
          <button onClick={() => {
            if (!form.phases.some(p => p.name.trim() && p.price > 0)) {
              alert("Ajoute au moins une offre avec un résultat et un prix.");
              return;
            }
            const profile = {
              id: Date.now(),
              initials: ((form.prenom[0]||"") + (form.nom[0]||"")).toUpperCase(),
              name: form.prenom + " " + form.nom,
              email: form.email,
              photoUrl: form.photoUrl,
              city: form.pays,
              category: form.category,
              tagline: form.bio || form.specialty,
              phases: form.phases,
              creds: (form.proofs||[]).map(p=>p.content).filter(Boolean),
              trustScore: 42,
              color: "#6D28D9", bg: "#EDE9FE",
              isNew: true,
            };
            setFinalProfile(profile);
            setStep(5);
          }} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF }}>
            Continuer →
          </button>
        </div>
      </div>
    </div>
  );

  // ── STEP 5 — Validation ─────────────────────────────────────────────────────
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:C.cream }}>
      <Hdr title="Dernière étape 🎉"/>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 18px 24px" }}>

        {/* Message de confiance */}
        <div style={{ background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`, borderRadius:16, padding:"20px", marginBottom:22, border:`1px solid ${C.goldB}`, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:10 }}>✦</div>
          <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:8 }}>
            Tu es presque prêt(e) !
          </div>
          <div style={{ fontSize:13, color:C.soft, lineHeight:1.7 }}>
            Notre équipe examine chaque profil en moins de <b>24–48h</b> pour garantir la qualité de Savvy.<br/>
            Tu recevras une confirmation à <b style={{ color:C.gold }}>{form.email || "ton email"}</b>.
          </div>
        </div>

        {/* Récapitulatif du profil */}
        <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:18 }}>
          <div style={{ padding:"12px 15px", borderBottom:`1px solid ${C.borderF}`, background:C.cream2 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:.5 }}>Ton profil en un coup d\'œil</div>
          </div>
          <div style={{ padding:"12px 15px" }}>
            {[
              { label:"Nom",      value:`${form.prenom} ${form.nom}`.trim() || "—" },
              { label:"Email",    value:form.email || "—" },
              { label:"Domaine",  value:CATS.find(c=>c.id===form.category)?.label || "—" },
              { label:"Problème", value:form.specialty || "—" },
              { label:"Offres",   value:`${(form.phases||[]).filter(p=>p&&p.name&&p.price).length} offre(s) créée(s)` },
            ].map(row => (
              <div key={row.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:`1px solid ${C.borderF}` }}>
                <span style={{ fontSize:12, color:C.muted }}>{row.label}</span>
                <span style={{ fontSize:12, fontWeight:600, color:C.ink, maxWidth:"60%", textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Paiement — informatif seulement */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.ink, marginBottom:4 }}>💰 Tes paiements s\'activent après validation</div>
          <div style={{ fontSize:11, color:C.muted, marginBottom:12, lineHeight:1.6 }}>Tu choisiras ta méthode de paiement depuis ton tableau de bord une fois ton profil approuvé.</div>
          <div style={{ display:"flex", gap:8 }}>
            {[{icon:"🏦",label:"Virement SEPA",sub:"Recommandé",highlight:true},{icon:"🅿️",label:"PayPal",sub:"Très utilisé",highlight:false},{icon:"💜",label:"Revolut",sub:"Rapide",highlight:false}].map(opt => (
              <div key={opt.label} style={{ flex:1, padding:"10px 8px", borderRadius:11, border:`1px solid ${opt.highlight?C.goldB:C.border}`, background:opt.highlight?C.goldL:C.cream2, textAlign:"center" }}>
                <div style={{ fontSize:18, marginBottom:3 }}>{opt.icon}</div>
                <div style={{ fontSize:11, fontWeight:700, color:opt.highlight?C.gold:C.ink }}>{opt.label}</div>
                <div style={{ fontSize:9, color:C.muted, marginTop:1 }}>{opt.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CGU simplifié */}
        <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:13, padding:"14px", marginBottom:20 }}>
          {[
            ["cgu","J\'accepte les Conditions Générales Savvy (commission 20%)"],
            ["certif","Je certifie que mon expérience est authentique"],
          ].map(([key,txt]) => (
            <div key={key} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
              <input type="checkbox" id={key} checked={form[key]} onChange={e => patch({[key]:e.target.checked})}
                style={{ width:16, height:16, cursor:"pointer", marginTop:2, accentColor:C.gold }}/>
              <label htmlFor={key} style={{ fontSize:12, color:C.soft, cursor:"pointer", lineHeight:1.5 }}>{txt}</label>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:9 }}>
          <button onClick={() => setStep(4)} style={{ flex:1, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:700, fontSize:13, background:C.white, color:C.ink, fontFamily:"inherit" }}>← Retour</button>
          <button onClick={() => {
            if (!form.cgu || !form.certif) { alert("Accepte les conditions pour continuer."); return; }
            patch({submitted:true});
          }} style={{ flex:2, padding:"14px", borderRadius:13, border:"none",
            background:form.cgu&&form.certif?`linear-gradient(135deg,${C.ink},#2C2825)`:C.cream3,
            color:form.cgu&&form.certif?C.white:C.muted,
            fontWeight:700, fontSize:15, cursor:form.cgu&&form.certif?"pointer":"not-allowed",
            fontFamily:SERIF, letterSpacing:".3px",
            boxShadow:form.cgu&&form.certif?`0 4px 16px rgba(28,25,23,.2)`:"none" }}>
            ⭐ Lancer mon activité
          </button>
        </div>

        <div style={{ textAlign:"center", fontSize:11, color:C.faint, marginTop:12 }}>
          Tes données sont protégées. Savvy ne les partage jamais.
        </div>
      </div>
    </div>
  );
}

// ─── TrustBadge ────────────────────────────────────────────────────────────────
function TrustBadge({ score, size="sm" }) {
  const level = getTrustLevel(score||0);
  if (size === "lg") return (
    <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, background:level.bg, border:`1.5px solid ${level.border}`, borderRadius:20, padding:"5px 14px" }}>
        <span style={{ fontSize:14 }}>{level.icon}</span>
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
      <span style={{ fontSize:11 }}>{level.icon}</span>
      <span style={{ fontSize:10, fontWeight:700, color:level.color }}>{level.label}</span>
    </div>
  );
}

// ─── ProfileScreen ─────────────────────────────────────────────────────────────
function ProfileScreen({ onSignup, onViewPublic, isExpert, onBecomeExpert, onLogout, authUser, isLoggedIn, onLogin, onNavigate, newExpertProfile, initExpSection }) {
  const [mode, setMode] = useState(initExpSection ? "expert" : "client");
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
  const [showEditExpert, setShowEditExpert] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [editOfferData, setEditOfferData] = useState({}); // {name,price,duree,formats}
  const [expOffres, setExpOffres] = useState(null); // null = use EXPERT_DATA default
  const [expRequests, setExpRequests] = useState([
    {id:"req1", client:"Sophie Martin", ini:"SM", bg:"#EDE9FE", col:"#7C3AED", date:"Demain", heure:"14h00", duree:"30 min", format:"Vidéo", domaine:"Reconversion pro", msg:"Bonjour, j'aimerais un conseil sur ma reconversion. Êtes-vous disponible ?"},
    {id:"req2", client:"Nadia Kouki",   ini:"NK", bg:"#FEF3C7", col:"#92400E", date:"Jeudi",  heure:"11h00", duree:"45 min", format:"Appel", domaine:"Import/Export",    msg:"Je cherche de l'aide pour comprendre les formalités douanières."},
  ]);
  const [expConfirmed, setExpConfirmed] = useState([
    {id:"es1", client:"Sophie Martin",  ini:"SM", bg:"#EDE9FE", col:"#7C3AED", date:"Aujourd'hui", heure:"14h00", duree:"30 min", format:"Vidéo", statut:"confirmé",   hoursUntil:6},
    {id:"es2", client:"Lucas Bernard",  ini:"LB", bg:"#DBEAFE", col:"#1D4ED8", date:"Demain",      heure:"10h00", duree:"45 min", format:"Vidéo", statut:"confirmé",   hoursUntil:22},
    {id:"es3", client:"Emma Petit",     ini:"EP", bg:"#D1FAE5", col:"#065F46", date:"Jeudi 12 juin", heure:"16h30", duree:"60 min", format:"Vidéo", statut:"confirmé", hoursUntil:168},
    {id:"es4", client:"Pierre Durand",  ini:"PD", bg:"#FEF3C7", col:"#92400E", date:"Lun. 23 juin",  heure:"09h00", duree:"30 min", format:"Vidéo", statut:"confirmé", hoursUntil:420},
  ]);
  const [expCancelled, setExpCancelled] = useState([]);
  const [expSessionTab, setExpSessionTab] = useState("recues"); // "recues"|"confirmees"|"annulees"
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [offresOpen, setOffresOpen] = useState(false);
  const [activiteOpen, setActiviteOpen] = useState(false);
  // Disponibilités — persistent state
  const [dispoMonth, setDispoMonth] = useState(new Date(2025, 4, 1));
  const [dispoSelected, setDispoSelected] = useState({});
  const [dispoHours, setDispoHours] = useState({});
  const [dispoEditDay, setDispoEditDay] = useState(null);
  const [dispoSaved, setDispoSaved] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const photoInputRef = useRef();
  const [revenuFilter, setRevenuFilter] = useState("mois");
  const [showExpertProfile, setShowExpertProfile] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [legalModal, setLegalModal] = useState(null);
  const [editNom, setEditNom] = useState(false);
  // nomValue initialized from actual user
  const getUserName = () => {
    if (authUser?.isExpert) return DEMO_USERS.expert.name || "German Quintana";
    return DEMO_USERS.client.name || "Sophie Martin";
  };
  const [nomValue, setNomValue] = useState(getUserName);

  // USER — données du compte connecté
  const activeUser = authUser?.isExpert ? DEMO_USERS.expert : DEMO_USERS.client;
  const USER = {
    initials: activeUser?.initials || "GQ",
    prenom:   (activeUser?.name || "German Quintana").split(" ")[0],
    nom:      (activeUser?.name || "German Quintana").split(" ").slice(1).join(" "),
    email:    activeUser?.email || "german@savvy.fr",
    location: "Paris, France",
    since:    "Mai 2025",
  };

  // EXPERT_DATA — données de l'expert connecté
  // Use newly created profile if exists, otherwise find in EXPERTS array
  const expertUser = newExpertProfile || EXPERTS.find(e => e.initials === (activeUser?.initials || "GQ")) || EXPERTS[EXPERTS.length-1];
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
    offres: (expertUser?.phases || []).map(p => ({
      name:   p.name,
      price:  p.price,
      format: p.format,
      icon:   p.id==="p0" ? "📦" : p.id==="p1" ? "📊" : "💡",
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
            <div style={{ width:38, height:38, borderRadius:11, background:"#DBEAFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🌍</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>Langue</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Français · English · Español</div>
            </div>
            <div style={{ fontSize:12, fontWeight:600, color:C.gold }}>FR</div>
          </div>

          {/* Confidentialité */}
          <div style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", cursor:"pointer", borderBottom:`1px solid ${C.borderF}` }}>
            <div style={{ width:38, height:38, borderRadius:11, background:"#D1FAE5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🔒</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.ink }}>Confidentialité & données</div>
              <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Comment on protège tes informations</div>
            </div>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          {/* CGU */}
          <div style={{ display:"flex", alignItems:"center", gap:13, padding:"13px 16px", cursor:"pointer", borderBottom:`1px solid ${C.borderF}` }}>
            <div style={{ width:38, height:38, borderRadius:11, background:"#EDE8DF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>📋</div>
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
              {icon:"⭐", text:"200+ conseillers actifs · 98% de satisfaction sur 1 200 sessions"},
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
  const Header = () => (
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
            <span style={{ fontSize:11, color:C.sageMid, fontWeight:700 }}>🟢 Actif</span>
          </div>
        )}
      </div>
      {/* Toggle */}
      <div style={{ display:"flex", background:"rgba(255,255,255,.1)", borderRadius:12, padding:3, marginTop:16, gap:3 }}>
        {[{id:"client",icon:"👤",label:"Client"},{id:"expert",icon:"🎯",label:"Expert"}].map(tab => (
          <button key={tab.id} onClick={() => setMode(tab.id)} style={{ flex:1, padding:"9px 0", borderRadius:10, border:"none", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"inherit", transition:"all .2s",
            background:mode===tab.id?C.white:"transparent",
            color:mode===tab.id?C.ink:"rgba(253,252,248,.55)",
            boxShadow:mode===tab.id?`0 1px 6px rgba(0,0,0,.12)`:"none" }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );

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

    const SESSIONS_BY_FILTER = {
      jour:    SESSIONS_AVENIR.filter(s => s.hoursUntil <= 24),
      semaine: SESSIONS_AVENIR.filter(s => s.hoursUntil <= 168),
      "2sem":  SESSIONS_AVENIR.filter(s => s.hoursUntil <= 336),
      mois:    SESSIONS_AVENIR,
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

    // Shared MenuRow
    const MenuRow = ({icon, bg, title, sub, badge, onClick}) => (
      <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:C.white,borderRadius:14,border:`1px solid ${C.border}`,marginBottom:10,cursor:"pointer",boxShadow:`0 1px 4px ${C.sh}`}}>
        <div style={{width:44,height:44,borderRadius:13,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icon}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{title}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{sub}</div>
        </div>
        {badge && <div style={{background:C.sage,color:C.white,borderRadius:20,minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,padding:"0 5px"}}>{badge}</div>}
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    );

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
      const goBackToCompte = () => setSubSection(null);
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
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${acc===id?C.goldB:C.border}`,overflow:"hidden",marginBottom:10,transition:"border-color .2s"}}>
            <div onClick={()=>setAcc(acc===id?null:id)} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 16px",cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{title}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:1}}>{sub}</div>
              </div>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5} style={{transform:acc===id?"rotate(90deg)":"none",transition:".2s",flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            {acc===id && <div style={{borderTop:`1px solid ${C.borderF}`,padding:"4px 0 8px"}}>{children}</div>}
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
              <label htmlFor="savvy-photo-input" style={{padding:"7px 13px",borderRadius:20,border:`1px solid ${C.goldB}`,background:C.goldL,color:C.gold,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                {photoUrl?"Changer":"Photo"}
              </label>
              <input id="savvy-photo-input" ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setPhotoUrl(ev.target.result);r.readAsDataURL(f);}e.target.value="";}}/>
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
            <AccRow id="connexion" icon="🔒" bg="#DBEAFE" title="Connexion et securite" sub="E-mail, mot de passe">
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
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>...</div>
                </div>
                <span style={{fontSize:11,color:C.gold,fontWeight:700}}>Modifier</span>
              </div>
              <div onClick={()=>{if(window.confirm("Supprimer ton compte Savvy ? Action irreversible.")){alert("Compte supprime.");}}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",cursor:"pointer"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#DC2626"}}>Supprimer le compte</div>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </AccRow>
            <AccRow id="notifs" icon="🔔" bg="#D1FAE5" title="Notifications" sub="Controle tes alertes">
              {[
                {k:"messages",icon:"💬",l:"Messages",desc:"Nouveaux messages de conseillers"},
                {k:"reservations",icon:"📅",l:"Reservations",desc:"Confirmations et rappels"},
                {k:"rappels",icon:"⏰",l:"Rappels",desc:"Rappel 1h avant ta session"},
                {k:"offres",icon:"✨",l:"Offres Savvy",desc:"Nouveaux conseillers et opportunites"},
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
            <button onClick={()=>{if(window.confirm("Te deconnecter de Savvy ?")){onLogout&&onLogout();}}} style={{width:"100%",marginTop:10,padding:"14px",borderRadius:13,border:"1.5px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              Deconnexion
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
            <BackHeader title="Paiements" sub="Solde Methodes Historique" onBack={goBackToCompte}/>
            <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:16,padding:"18px 20px",marginBottom:14,color:C.white}}>
              <div style={{fontSize:11,color:"rgba(253,252,248,.5)",marginBottom:4,textTransform:"uppercase",letterSpacing:.6}}>Solde disponible</div>
              <div style={{fontSize:32,fontWeight:700,fontFamily:SERIF}}>0 EUR</div>
              <div style={{fontSize:11,color:"rgba(253,252,248,.5)",marginTop:4}}>Remboursements en attente affiches ici</div>
            </div>
            <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>Methode de paiement</div>
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
              {[EXPERTS[1],EXPERTS[3],EXPERTS[4]].map(e=>(
                <div key={e.id} onClick={()=>onNavigate&&onNavigate("reservations")} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",display:"flex",gap:11,alignItems:"center",cursor:"pointer"}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:e.bg,color:e.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{e.initials}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{e.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{e.role.split(".")[0].trim()}</div>
                  </div>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              ))}
            </div>
          )}
          {cercleTab==="historique" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {SESSIONS_PASSEES.map(s=>{const e=EXPERTS.find(x=>x.id===s.eid)||EXPERTS[0];return(
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
          {cercleTab==="reco" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[EXPERTS[0],EXPERTS[2],EXPERTS[6]].map(e=>(
                <div key={e.id} onClick={()=>onNavigate&&onNavigate("reservations")} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",display:"flex",gap:11,alignItems:"center",cursor:"pointer"}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:e.bg,color:e.color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{e.initials}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{e.name}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{e.role.split(".")[0].trim()}</div>
                  </div>
                  <TrustBadge score={e.trustScore||70}/>
                </div>
              ))}
            </div>
          )}
        </div>
      );

      // Mon compte sub-menu
      return (
        <div>
          <BackHeader title="Mon compte" onBack={goBackToMain}/>
          <MenuRow icon="⚙️" bg="#EDE9FE" title="Parametres du compte" sub="Informations personnelles Connexion Notifications" onClick={()=>setSubSection("parametres")}/>
          <MenuRow icon="💳" bg="#DBEAFE" title="Paiements" sub="Solde disponible Methodes Historique et recus" onClick={()=>setSubSection("paiements")}/>
          <MenuRow icon="⭐" bg="#FEF3C7" title="Mes experts favoris" sub="Conseillers consultes et sauvegardes" onClick={()=>setSubSection("favoris")}/>
        </div>
      );
    }

    // ═══ AIDE HUB ══════════════════════════════════════════════════════════════
    if (section === "aide") {
      const goBackToAide = () => setSubSection(null);
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
              {icon:"✅",t:"Probleme de paiement resolu",sub:"Il y a 3 semaines",msgs:[{from:"moi",txt:"Bonjour, j'ai ete debite deux fois."},{from:"savvy",txt:"Bonjour ! Le remboursement a ete traite sous 3-5 jours."},{from:"moi",txt:"Merci beaucoup !"},{from:"savvy",txt:"Avec plaisir"}]},
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
              {icon:"🍪",title:"Gestion des cookies",desc:"Parametres de cookies et traceurs"},
              {icon:"⚖️",title:"Mentions legales",desc:"Informations legales de Savvy SAS"},
            ].map((item,i,arr)=>(
              <div key={i} onClick={()=>alert(item.title+" disponible au lancement officiel")} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 16px",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none",cursor:"pointer"}}>
                <div style={{width:38,height:38,borderRadius:11,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{item.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{item.title}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>{item.desc}</div>
                </div>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
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

      if (subSection === "avis") return (
        <div>
          <BackHeader title="Laisser un commentaire" sub="Ton avis nous aide a progresser" onBack={goBackToAide}/>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:36,marginBottom:8}}>⭐</div>
              <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:4}}>Comment s'est passee ton experience ?</div>
              <div style={{fontSize:12,color:C.muted}}>Quelques secondes pour nous aider a nous ameliorer</div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>alert("Note "+s+"/5 enregistree merci !")} style={{fontSize:32,background:"none",border:"none",cursor:"pointer",padding:"4px"}}>⭐</button>
              ))}
            </div>
            <textarea placeholder="Dis-nous ce qui s'est bien passe ou ce qu'on peut ameliorer..." rows={4}
              style={{width:"100%",padding:"12px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
            <button onClick={()=>alert("Merci pour ton commentaire !")} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:C.ink,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>
              Envoyer mon avis
            </button>
          </div>
        </div>
      );

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
    return (<>
      <div>
        <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"18px",marginBottom:16,display:"flex",gap:14,alignItems:"center",boxShadow:`0 2px 8px ${C.sh}`}}>
          {photoUrl
            ? <img src={photoUrl} alt="profil" style={{width:62,height:62,borderRadius:"50%",objectFit:"cover",border:`2.5px solid ${C.goldB}`,flexShrink:0}}/>
            : <div style={{width:62,height:62,borderRadius:"50%",background:`linear-gradient(135deg,${C.goldL},#FDE68A)`,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:24,fontFamily:SERIF,flexShrink:0,border:`2px solid ${C.goldB}`}}>{USER.initials}</div>
          }
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:20,fontWeight:700,color:C.ink,fontFamily:SERIF,letterSpacing:"-.3px"}}>{USER.prenom} {USER.nom}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{USER.email}</div>
            <div style={{fontSize:11,color:C.faint,marginTop:3}}>Paris, France</div>
          </div>
        </div>

        <div onClick={()=>{setSection("compte");setSubSection(null);}} style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"18px",marginBottom:12,cursor:"pointer",boxShadow:`0 2px 8px ${C.sh}`}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>👤</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:C.ink}}>Mon compte</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Parametres Paiements Experts favoris</div>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{icon:"⚙️",bg:"#EDE9FE",l:"Parametres"},{icon:"💳",bg:"#DBEAFE",l:"Paiements"},{icon:"⭐",bg:"#FEF3C7",l:"Mes favoris"}].map(item=>(
              <div key={item.l} style={{background:item.bg,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:3}}>{item.icon}</div>
                <div style={{fontSize:10,fontWeight:600,color:C.ink,lineHeight:1.2}}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div onClick={()=>{setSection("aide");setSubSection(null);}} style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"18px",marginBottom:16,cursor:"pointer",boxShadow:`0 2px 8px ${C.sh}`}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>💬</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:C.ink}}>Aide</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Centre d'aide Legal Laisser un avis</div>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{icon:"🤝",bg:"#D1FAE5",l:"Centre d'aide"},{icon:"📋",bg:"#EDE8DF",l:"Legal"},{icon:"⭐",bg:"#FEF3C7",l:"Avis"}].map(item=>(
              <div key={item.l} style={{background:item.bg,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:3}}>{item.icon}</div>
                <div style={{fontSize:10,fontWeight:600,color:C.ink,lineHeight:1.2}}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div onClick={()=>setShowReferModal(true)} style={{background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.goldB}`,display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:14}}>
          <div style={{width:40,height:40,borderRadius:12,background:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✦</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:C.gold,fontFamily:SERIF}}>Partage Savvy avec quelqu'un</div>
            <div style={{fontSize:11,color:C.gold,opacity:.8,marginTop:1}}>Aide quelqu'un a trouver l'experience reelle dont il a besoin</div>
          </div>
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
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
      {showReferModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999,padding:"0 0 env(safe-area-inset-bottom)"}}>
          <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",maxWidth:480,boxShadow:"0 -4px 40px rgba(0,0,0,.18)"}}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 22px"}}/>
            <div style={{textAlign:"center",marginBottom:22}}>
              <div style={{fontSize:36,marginBottom:10}}>✦</div>
              <div style={{fontSize:20,fontWeight:800,color:C.ink,fontFamily:SERIF,marginBottom:6}}>Partage Savvy</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>Aide quelqu'un à trouver l'expérience réelle dont il a besoin. Partage le lien et ils pourront réserver une session dès aujourd'hui.</div>
            </div>
            <div style={{background:C.cream2,borderRadius:12,padding:"12px 14px",marginBottom:16,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1,fontSize:13,color:C.ink,fontWeight:600,wordBreak:"break-all"}}>https://savvy.fr/invite</div>
              <button onClick={()=>{ navigator.clipboard?.writeText("https://savvy.fr/invite"); alert("Lien copié !"); }} style={{flexShrink:0,padding:"7px 12px",borderRadius:9,border:"none",background:C.ink,color:C.white,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Copier</button>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:14}}>
              {[{icon:"💬",label:"SMS"},  {icon:"📧",label:"Email"}, {icon:"📱",label:"WhatsApp"}].map(ch=>(
                <button key={ch.label} onClick={()=>alert(`Partage via ${ch.label}`)} style={{flex:1,padding:"11px 4px",borderRadius:12,border:`1px solid ${C.border}`,background:C.white,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit"}}>
                  <span style={{fontSize:20}}>{ch.icon}</span>
                  <span style={{fontSize:10,fontWeight:600,color:C.ink}}>{ch.label}</span>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowReferModal(false)} style={{width:"100%",padding:"13px",borderRadius:13,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Fermer</button>
          </div>
        </div>
      )}
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
        <button onClick={onBack||(()=>{setSection(null);setSubSection(null);})} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:10,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <div style={{fontSize:17,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{title}</div>
          {sub && <div style={{fontSize:11,color:C.muted,marginTop:1}}>{sub}</div>}
        </div>
      </div>
    );

    const MenuRowExp = ({icon, bg, title, sub, badge, onClick}) => (
      <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:C.white,borderRadius:14,border:`1px solid ${C.border}`,marginBottom:10,cursor:"pointer",boxShadow:`0 1px 4px ${C.sh}`}}>
        <div style={{width:44,height:44,borderRadius:13,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{icon}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{title}</div>
          <div style={{fontSize:11,color:C.muted,marginTop:2}}>{sub}</div>
        </div>
        {badge && <div style={{background:C.sage,color:C.white,borderRadius:20,minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,padding:"0 5px"}}>{badge}</div>}
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
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
          <BackHeaderExp title="Mes sessions" sub="Tes rendez-vous à venir" onBack={()=>{setSection(null);setSubSection(null);}}/>

          {/* ── Onglets Reçues / Confirmées / Annulées ── */}
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {[{id:"recues",l:"🔔 Reçues",count:EXP_REQUESTS.length},{id:"confirmees",l:"✓ Confirmées",count:EXP_SESSIONS.length},{id:"annulees",l:"✕ Annulées",count:expCancelled.length}].map(t=>(
              <button key={t.id} onClick={()=>setExpSessionTab(t.id)} style={{flex:1,padding:"7px 4px",borderRadius:20,border:`1.5px solid ${expSessionTab===t.id?C.ink:C.border}`,background:expSessionTab===t.id?C.ink:"transparent",color:expSessionTab===t.id?C.white:C.muted,fontSize:10,fontWeight:expSessionTab===t.id?700:400,cursor:"pointer",fontFamily:"inherit",position:"relative"}}>
                {t.l}
                {t.count>0&&<span style={{marginLeft:4,background:expSessionTab===t.id?"rgba(255,255,255,.25)":C.sage,color:C.white,borderRadius:20,padding:"0 4px",fontSize:9}}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* ── Contenu par onglet ── */}
          {expSessionTab==="recues" && EXP_REQUESTS.length===0 && (
            <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}>
              <div style={{fontSize:32,marginBottom:10}}>🎉</div>
              Toutes les demandes ont été traitées !
            </div>
          )}

          {expSessionTab==="annulees" && (
            <div>
              {expCancelled.length===0
                ? <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}><div style={{fontSize:32,marginBottom:10}}>✅</div>Aucune annulation</div>
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
                    <div style={{marginTop:8,fontSize:11,color:"#B91C1C",background:"#FFF5F5",borderRadius:8,padding:"7px 10px"}}>
                      💳 Remboursement automatique traité sous 3–5 jours ouvrés.
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {expSessionTab==="recues" && EXP_REQUESTS.length>0 && (
            <div style={{marginBottom:18}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#B91C1C",textTransform:"uppercase",letterSpacing:1}}>🔔 Demandes en attente</div>
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
                      <div style={{fontSize:11,fontWeight:600,color:"#B91C1C"}}>📅 {r.date}</div>
                      <div style={{fontSize:11,color:C.muted}}>{r.heure}</div>
                    </div>
                  </div>
                  <div style={{background:"#FFF5F5",borderRadius:9,padding:"8px 11px",marginBottom:11,fontSize:12,color:C.muted,fontStyle:"italic",lineHeight:1.4}}>"{r.msg}"</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{
                      const confirmed = {...r, statut:"confirmé", hoursUntil: r.date==="Demain"?22:r.date==="Aujourd'hui"?6:168};
                      setExpConfirmed(prev=>[confirmed,...prev]);
                      setExpRequests(prev=>prev.filter(x=>x.id!==r.id));
                      setExpSessionTab("confirmees");
                      alert(`✅ Session confirmée avec ${r.client} !\n\nUn message de confirmation a été envoyé automatiquement.`);
                    }} style={{flex:2,padding:"10px",borderRadius:10,border:"none",background:C.sage,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>✓ Confirmer</button>
                    <button onClick={()=>{
                      setExpCancelled(prev=>[{...r,statut:"refusé",motif:"Refusé par l'expert"},...prev]);
                      setExpRequests(prev=>prev.filter(x=>x.id!==r.id));
                    }} style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✕ Refuser</button>
                    <button onClick={()=>onNavigate&&onNavigate("messages")} style={{width:40,height:40,borderRadius:10,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {expSessionTab==="confirmees" && visible.length===0
            ? <div style={{textAlign:"center",padding:"36px 16px",color:C.muted,fontSize:13}}>
                <div style={{fontSize:32,marginBottom:12}}>📅</div>
                Aucune session confirmée sur cette période
              </div>
            : expSessionTab==="confirmees" && visible.map(s=>(
              <div key={s.id} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"14px 15px",marginBottom:10,boxShadow:`0 1px 6px ${C.sh}`}}>
                <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12}}>
                  <div style={{width:42,height:42,borderRadius:"50%",background:s.bg,color:s.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,flexShrink:0}}>{s.ini}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{s.client}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:1}}>Client · {s.format}</div>
                  </div>
                  <div style={{padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,background:s.statut==="confirmé"?C.sageL:"#FEF3C7",color:s.statut==="confirmé"?C.sage:"#92400E"}}>
                    {s.statut==="confirmé"?"✓ Confirmé":"⏳ En attente"}
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                  {[{icon:"📅",v:s.date},{icon:"🕐",v:s.heure},{icon:"⏱",v:s.duree}].map(d=>(
                    <div key={d.icon} style={{background:C.cream2,borderRadius:9,padding:"7px 8px",textAlign:"center"}}>
                      <div style={{fontSize:14}}>{d.icon}</div>
                      <div style={{fontSize:10,fontWeight:600,color:C.ink,marginTop:2}}>{d.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>onNavigate&&onNavigate("messages")} style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${C.border}`,background:C.cream2,color:C.ink,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>💬 Message</button>
                  {s.statut==="confirmé" && (
                    <button onClick={()=>alert(`Session avec ${s.client}`)} style={{flex:1,padding:"9px",borderRadius:10,border:"none",background:C.sage,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>🎥 Rejoindre</button>
                  )}
                  <button onClick={()=>setCancelModal({session:s, step:"choose", type:"exp"})} style={{padding:"9px 12px",borderRadius:10,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#B91C1C",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>✕ Gérer</button>
                </div>
              </div>
            ))
          }
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
          <BackHeaderExp title="Disponibilités" sub="Sélectionne tes jours et horaires" onBack={()=>{setSection(null);setSubSection(null);}}/>
          <div style={{background:`linear-gradient(135deg,${C.ink},#2C2825)`,borderRadius:13,padding:"13px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:11}}>
            <span style={{fontSize:22,flexShrink:0}}>🌟</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:SERIF,marginBottom:2}}>Ton temps, leur avenir</div>
              <div style={{fontSize:11,color:"rgba(253,252,248,.65)",lineHeight:1.5}}>En définissant tes disponibilités, tu ouvres la porte à ceux qui ont besoin de toi.</div>
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
                return (
                  <button key={d}
                    onClick={()=>{ if(wkd) return; setDispoSelected(s=>({...s,[key]:!s[key]})); }}
                    style={{aspectRatio:"1",padding:2,borderRadius:9,border:`2px solid ${sel?C.sage:wkd?"transparent":C.borderF}`,background:sel?(hasH?"#059669":C.sageL):wkd?C.cream2:C.cream2,color:sel?(hasH?C.white:C.sage):wkd?C.faint:C.ink,fontSize:13,fontWeight:sel?700:400,cursor:wkd?"default":"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                    {d}
                    {sel&&<div style={{fontSize:5.5,lineHeight:1.2,marginTop:1,opacity:.9,whiteSpace:"nowrap",textAlign:"center"}}>{hasH?(getStart(key).replace(":","h").slice(0,4)+"–"+getEnd(key).replace(":","h").slice(0,4)):"+h"}</div>}
                  </button>
                );
              })}
            </div>
            <div style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:10}}>{jours.length} jour{jours.length!==1?"s":""} sélectionné{jours.length!==1?"s":""}</div>
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
                  <div key={key} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<jours.length-1?`1px solid ${C.borderF}`:"none"}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.ink,minWidth:28}}>{d}</div>
                    <input type="time" value={getStart(key)} onChange={e=>setDispoHours(h=>({...h,[key]:e.target.value+"-"+getEnd(key)}))}
                      style={{flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink}}/>
                    <span style={{fontSize:12,color:C.muted}}>à</span>
                    <input type="time" value={getEnd(key)} onChange={e=>setDispoHours(h=>({...h,[key]:getStart(key)+"-"+e.target.value}))}
                      style={{flex:1,padding:"6px 8px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink}}/>
                    <button onClick={()=>setDispoSelected(s=>{const n={...s};delete n[key];return n;})} style={{width:28,height:28,borderRadius:8,border:"1px solid #FEE2E2",background:"#FFF5F5",color:"#DC2626",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={()=>alert("Merci d'avoir partagé tes disponibilités ✦\n\nTon agenda est mis à jour. Tes clients pourront maintenant réserver aux créneaux que tu as choisis.")} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:C.ink,color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>
            Enregistrer mes disponibilités
          </button>
          <div style={{marginTop:12,background:`linear-gradient(135deg,${C.goldL},#FFF9F0)`,borderRadius:12,padding:"12px 14px",border:`1px solid ${C.goldB}`,display:"flex",alignItems:"flex-start",gap:10}}>
            <span style={{fontSize:18,flexShrink:0}}>✦</span>
            <div style={{fontSize:12,color:C.gold,lineHeight:1.6,fontStyle:"italic"}}>Merci de partager ton temps et ton expérience. Chaque créneau que tu ouvres, c'est une personne de plus que tu peux aider à avancer.</div>
          </div>
        </div>
      );
    }

    // ═══ MON COMPTE HUB (expert) ═══════════════════════════════════════════════
    if (section === "compte") {
      const goBackToCompte = () => setSubSection(null);
      const goBackToMain   = () => { setSection(null); setSubSection(null); };

      // Paramètres
      if (subSection === "parametres") {
        const acc = openSection; const setAcc = setOpenSection;
        const AccRowExp = ({id, icon, bg, title, sub, children}) => (
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${acc===id?C.goldB:C.border}`,overflow:"hidden",marginBottom:10,transition:"border-color .2s"}}>
            <div onClick={()=>setAcc(acc===id?null:id)} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 16px",cursor:"pointer"}}>
              <div style={{width:40,height:40,borderRadius:12,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.ink}}>{title}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:1}}>{sub}</div>
              </div>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5} style={{transform:acc===id?"rotate(90deg)":"none",transition:".2s",flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            {acc===id && <div style={{borderTop:`1px solid ${C.borderF}`,padding:"4px 0 8px"}}>{children}</div>}
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
              <label htmlFor="savvy-photo-input" style={{padding:"7px 13px",borderRadius:20,border:`1px solid ${C.goldB}`,background:C.goldL,color:C.gold,fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                {photoUrl?"Changer":"Photo"}
              </label>
              <input id="savvy-photo-input" ref={photoInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>setPhotoUrl(ev.target.result);r.readAsDataURL(f);}e.target.value="";}}/>
            </div>
            <AccRowExp id="infos" icon="👤" bg="#EDE9FE" title="Informations personnelles" sub="Prénom, nom, ville, domaine">
              {[["Prénom",USER.prenom],["Nom",USER.nom],["Ville","Paris, France"],["Langue","Français 🇫🇷"],["Domaine",EXPERT_DATA.domain]].map(([l,v],i,arr)=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none",cursor:"pointer"}}>
                  <span style={{fontSize:13,color:C.muted}}>{l}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.ink}}>{v}</span>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
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
              <div onClick={()=>{if(window.confirm("Supprimer définitivement ton compte Savvy ?")){alert("Compte supprimé.");}}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",cursor:"pointer"}}>
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
      if (subSection === "clients") return (
        <div>
          <BackHeaderExp title="Mes clients aidés" sub="Personnes que tu as accompagnées" onBack={goBackToCompte}/>
          {[
            {ini:"SM", bg:"#EDE9FE", col:"#7C3AED", nom:"Sophie Martin",  nb:3, derniere:"15 mai 2025",    note:5},
            {ini:"LB", bg:"#DBEAFE", col:"#1D4ED8", nom:"Lucas Bernard",  nb:1, derniere:"8 mai 2025",     note:5},
            {ini:"EP", bg:"#D1FAE5", col:"#065F46", nom:"Emma Petit",     nb:2, derniere:"2 mai 2025",     note:4},
            {ini:"PD", bg:"#FEF3C7", col:"#92400E", nom:"Pierre Durand",  nb:1, derniere:"18 avril 2025",  note:5},
          ].map(c=>(
            <div key={c.ini} style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"13px 15px",marginBottom:10,display:"flex",alignItems:"center",gap:12,boxShadow:`0 1px 4px ${C.sh}`}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:c.bg,color:c.col,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,flexShrink:0}}>{c.ini}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{c.nom}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:2}}>{c.nb} session{c.nb>1?"s":""} · Dernière : {c.derniere}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                <div style={{fontSize:13}}>{"⭐".repeat(c.note)}</div>
                <div style={{fontSize:10,color:C.muted}}>{c.note}/5</div>
              </div>
            </div>
          ))}
          <div style={{textAlign:"center",marginTop:8,fontSize:11,color:C.muted}}>4 clients accompagnés · 11 sessions au total</div>
        </div>
      );

      // Mon compte sub-menu (expert)
      return (
        <div>
          <BackHeaderExp title="Mon compte" onBack={goBackToMain}/>
          <MenuRowExp icon="⚙️" bg="#EDE9FE" title="Paramètres du compte" sub="Informations personnelles · Connexion · Notifications" onClick={()=>setSubSection("parametres")}/>
          <MenuRowExp icon="💰" bg="#FEF3C7" title="Mes revenus" sub="Solde disponible · SEPA · Historique & factures" onClick={()=>setSubSection("revenus")}/>
          <MenuRowExp icon="🤝" bg="#D1FAE5" title="Mes clients aidés" sub="Personnes que tu as accompagnées" onClick={()=>setSubSection("clients")}/>
        </div>
      );
    }

    // ═══ AIDE HUB (expert) ═════════════════════════════════════════════════════
    if (section === "aide") {
      const goBackToAide = () => setSubSection(null);
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
              <div key={i} onClick={()=>alert(item.title+" — disponible au lancement ✦")} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 16px",borderBottom:i<arr.length-1?`1px solid ${C.borderF}`:"none",cursor:"pointer"}}>
                <div style={{width:38,height:38,borderRadius:11,background:C.cream2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{item.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.ink}}>{item.title}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>{item.desc}</div>
                </div>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
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

      if (subSection === "avis") return (
        <div>
          <BackHeaderExp title="Laisser un commentaire" onBack={goBackToAide}/>
          <div style={{background:C.white,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:36,marginBottom:8}}>⭐</div>
              <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:4}}>Comment s'est passée ton expérience ?</div>
              <div style={{fontSize:12,color:C.muted}}>Ton avis nous aide à progresser</div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
              {[1,2,3,4,5].map(s=>(
                <button key={s} onClick={()=>alert(`Note ${s}/5 enregistrée — merci ! ✦`)} style={{fontSize:32,background:"none",border:"none",cursor:"pointer",padding:"4px"}}>⭐</button>
              ))}
            </div>
            <textarea placeholder="Dis-nous ce que tu as aimé ou ce qu'on peut améliorer…" rows={4}
              style={{width:"100%",padding:"12px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink,outline:"none",resize:"none",boxSizing:"border-box",marginBottom:12}}/>
            <button onClick={()=>alert("Merci pour ton commentaire ✦")} style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:C.ink,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>
              Envoyer mon avis →
            </button>
          </div>
        </div>
      );

      // Aide sub-menu (expert)
      return (
        <div>
          <BackHeaderExp title="Aide" onBack={goBackToMain}/>
          <MenuRowExp icon="💬" bg="#D1FAE5" title="Centre d'aide" sub="Chat avec l'équipe Savvy · Conversations passées" onClick={()=>setSubSection("centre")}/>
          <MenuRowExp icon="📋" bg="#EDE8DF" title="Légal" sub="Politique de confidentialité · CGU · Mentions légales" onClick={()=>setSubSection("legal")}/>
          <MenuRowExp icon="⭐" bg="#FEF3C7" title="Laisser un commentaire" sub="Ton avis nous aide à progresser" onClick={()=>setSubSection("avis")}/>
        </div>
      );
    }

    // ═══ MAIN EXPERT MENU ══════════════════════════════════════════════════════
    return (
      <div>
        {/* En-tête expert */}
        <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"18px",marginBottom:14,boxShadow:`0 2px 8px ${C.sh}`}}>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
            {photoUrl
              ? <img src={photoUrl} alt="profil" style={{width:62,height:62,borderRadius:"50%",objectFit:"cover",border:`2.5px solid ${C.goldB}`,flexShrink:0}}/>
              : <div style={{width:62,height:62,borderRadius:"50%",background:`linear-gradient(135deg,${C.goldL},#FDE68A)`,color:C.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:24,fontFamily:SERIF,flexShrink:0,border:`2px solid ${C.goldB}`}}>{USER.initials}</div>
            }
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
              <div style={{fontSize:9,color:C.muted,marginTop:1}}>revenus {showRevenu?"👁":"🔒"}</div>
            </div>
          </div>
          {/* Boutons d'action */}
          <div style={{display:"flex",gap:8}}>
            {[
              {icon:"✏️",label:"Modifier",action:()=>setShowEditExpert(true)},
              {icon:"👁️",label:"Mon profil",action:()=>setShowExpertProfile(true)},
              {icon:"🔗",label:"Partager",action:()=>setShowShareModal(true)},
            ].map(btn=>(
              <button key={btn.label} onClick={btn.action} style={{flex:1,padding:"9px 4px",borderRadius:11,border:`1px solid ${C.border}`,background:C.cream2,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600,color:C.ink,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <span style={{fontSize:18}}>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Mes offres actives — carte accordéon ── */}
        <div style={{background:C.white,borderRadius:16,border:`1px solid ${offresOpen?C.gold:C.border}`,marginBottom:12,overflow:"hidden",boxShadow:`0 2px 8px ${C.sh}`,transition:"border-color .2s"}}>
          {/* En-tête cliquable */}
          <div onClick={()=>setOffresOpen(v=>!v)} style={{padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>💼</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:C.ink}}>Mes offres actives</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{(expOffres||EXPERT_DATA.offres).length} offre(s) · Modifier les tarifs et formats</div>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5} style={{transition:"transform .25s",transform:offresOpen?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          {/* Contenu accordéon */}
          {offresOpen && (
            <div style={{borderTop:`1px solid ${C.borderF}`,padding:"12px 14px 14px"}}>
              {(expOffres||EXPERT_DATA.offres).map((o,i)=>(
                <div key={i} style={{background:editingOffer===i?C.goldL:C.cream2,borderRadius:13,border:`1px solid ${editingOffer===i?C.gold:C.border}`,padding:"12px 14px",marginBottom:8,transition:"all .2s"}}>
                  {editingOffer===i ? (
                    <div>
                      <input value={editOfferData.name||""} onChange={e=>setEditOfferData(d=>({...d,name:e.target.value}))} placeholder="Nom de l'offre" style={{width:"100%",padding:"8px 11px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",marginBottom:8,boxSizing:"border-box",background:C.white}}/>
                      <div style={{display:"flex",gap:8,marginBottom:10}}>
                        <input value={editOfferData.price||""} onChange={e=>setEditOfferData(d=>({...d,price:e.target.value}))} placeholder="Prix EUR" type="number" style={{width:80,padding:"8px 11px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",color:C.ink,outline:"none",background:C.white}}/>
                        <input value={editOfferData.duree||""} onChange={e=>setEditOfferData(d=>({...d,duree:e.target.value}))} placeholder="Durée" style={{flex:1,padding:"8px 11px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",color:C.ink,outline:"none",background:C.white}}/>
                      </div>
                      <div style={{marginBottom:10}}>
                        <div style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:.4}}>Formats proposés</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                          {[{v:"video",l:"🎥 Vidéo"},{v:"audio",l:"🎧 Appel audio"},{v:"doc",l:"📄 Document"},{v:"chat",l:"💬 Chat écrit"}].map(fmt=>{
                            const fmts = editOfferData.formats||[];
                            const checked = fmts.includes(fmt.v);
                            return (
                              <label key={fmt.v} onClick={()=>setEditOfferData(d=>({...d,formats:checked?fmts.filter(x=>x!==fmt.v):[...fmts,fmt.v]}))} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:9,border:`1.5px solid ${checked?C.gold:C.border}`,background:checked?C.goldL:C.white,cursor:"pointer",fontSize:12,fontWeight:checked?700:400,color:checked?C.gold:C.muted}}>
                                <span style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${checked?C.gold:C.border}`,background:checked?C.gold:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:9,color:C.white}}>{checked?"✓":""}</span>
                                {fmt.l}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={()=>{setEditingOffer(null);setEditOfferData({});}} style={{flex:1,padding:"8px",borderRadius:9,border:`1px solid ${C.border}`,background:C.white,color:C.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
                        <button onClick={()=>{
                          const base = expOffres||EXPERT_DATA.offres;
                          const updated = base.map((x,j)=>j===i?{...x,name:editOfferData.name||x.name,price:Number(editOfferData.price)||x.price,duree:editOfferData.duree||x.duree,formats:editOfferData.formats||x.formats}:x);
                          setExpOffres(updated); setEditingOffer(null); setEditOfferData({});
                        }} style={{flex:2,padding:"8px",borderRadius:9,border:"none",background:C.ink,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SERIF}}>Enregistrer ✓</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",gap:11}}>
                      <div style={{width:38,height:38,borderRadius:11,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{o.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{o.name}</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:1}}>{o.formats?o.formats.map(f=>f==="video"?"🎥":f==="audio"?"🎧":f==="doc"?"📄":"💬").join(" "):o.format}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF}}>{o.price}€</div>
                        <button onClick={()=>{setEditingOffer(i);setEditOfferData({name:o.name,price:String(o.price),duree:o.duree||"30 min",formats:o.formats||(o.format?.toLowerCase().includes("vid")?["video"]:o.format?.toLowerCase().includes("doc")?["doc"]:["chat"])});}} style={{fontSize:10,color:C.gold,fontWeight:700,background:C.white,border:`1px solid ${C.goldB}`,borderRadius:20,padding:"2px 9px",cursor:"pointer",fontFamily:"inherit",marginTop:4}}>✏️ Modifier</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button style={{width:"100%",padding:"9px",borderRadius:10,border:`1.5px dashed ${C.gold}`,background:"transparent",color:C.gold,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:SERIF,marginTop:4}}>+ Ajouter une offre</button>
            </div>
          )}
        </div>

        {/* ── Mon activité — carte accordéon ── */}
        <div style={{background:C.white,borderRadius:16,border:`1px solid ${activiteOpen?"#6EE7B7":C.border}`,marginBottom:12,overflow:"hidden",boxShadow:`0 2px 8px ${C.sh}`,transition:"border-color .2s"}}>
          {/* En-tête cliquable */}
          <div onClick={()=>setActiviteOpen(v=>!v)} style={{padding:"16px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>⚡</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:C.ink}}>Mon activité</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Sessions · Disponibilités</div>
            </div>
            {expRequests.length>0 && <div style={{background:C.sage,color:C.white,borderRadius:20,minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,padding:"0 5px",flexShrink:0}}>{expRequests.length}</div>}
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5} style={{transition:"transform .25s",transform:activiteOpen?"rotate(90deg)":"rotate(0deg)",flexShrink:0}}><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          {/* Contenu accordéon */}
          {activiteOpen && (
            <div style={{borderTop:`1px solid ${C.borderF}`,padding:"10px 14px 14px"}}>
              <div onClick={()=>{setActiviteOpen(false);setSection("sesiones");}} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 14px",borderRadius:13,border:`1px solid ${C.border}`,background:C.cream2,cursor:"pointer",marginBottom:8}}>
                <div style={{width:40,height:40,borderRadius:12,background:"#DBEAFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>📅</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.ink}}>Mes sessions</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>Demandes en attente · Planning</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {expRequests.length>0 && <div style={{background:C.sage,color:C.white,borderRadius:20,minWidth:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,padding:"0 5px"}}>{expRequests.length}</div>}
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
              <div onClick={()=>{setActiviteOpen(false);setSection("disponibilidades");}} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 14px",borderRadius:13,border:`1px solid ${C.border}`,background:C.cream2,cursor:"pointer"}}>
                <div style={{width:40,height:40,borderRadius:12,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>🗓️</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.ink}}>Mes disponibilités</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:1}}>Jours et horaires · {Object.keys(dispoSelected).filter(k=>dispoSelected[k]).length} jour(s) configuré(s)</div>
                </div>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2}><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          )}
        </div>

        {/* Mon compte card */}
        <div onClick={()=>{setSection("compte");setSubSection(null);}} style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"18px",marginBottom:12,cursor:"pointer",boxShadow:`0 2px 8px ${C.sh}`}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:"#EDE9FE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>👤</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:C.ink}}>Mon compte</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Paramètres · Revenus</div>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[{icon:"⚙️",bg:"#EDE9FE",l:"Paramètres"},{icon:"💰",bg:"#FEF3C7",l:"Mes revenus"}].map(item=>(
              <div key={item.l} style={{background:item.bg,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:3}}>{item.icon}</div>
                <div style={{fontSize:10,fontWeight:600,color:C.ink,lineHeight:1.2}}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Aide card */}
        <div onClick={()=>{setSection("aide");setSubSection(null);}} style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:"18px",marginBottom:16,cursor:"pointer",boxShadow:`0 2px 8px ${C.sh}`}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:14,background:"#D1FAE5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>💬</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:700,color:C.ink}}>Aide</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>Centre d'aide · Légal · Laisser un avis</div>
            </div>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[{icon:"🤝",bg:"#D1FAE5",l:"Centre d'aide"},{icon:"📋",bg:"#EDE8DF",l:"Légal"},{icon:"⭐",bg:"#FEF3C7",l:"Avis"}].map(item=>(
              <div key={item.l} style={{background:item.bg,borderRadius:10,padding:"10px 6px",textAlign:"center"}}>
                <div style={{fontSize:18,marginBottom:3}}>{item.icon}</div>
                <div style={{fontSize:10,fontWeight:600,color:C.ink,lineHeight:1.2}}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal partager profil */}
        {showShareModal && (
          <>
            <div onClick={()=>setShowShareModal(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:200}}/>
            <div onClick={e=>e.stopPropagation()} style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.white,zIndex:201,borderRadius:"20px 20px 0 0",padding:"20px 20px 40px"}}>
              <div style={{width:36,height:4,borderRadius:2,background:"#E5E0D8",margin:"0 auto 18px"}}/>
              <div style={{textAlign:"center",marginBottom:20}}>
                <div style={{fontSize:32,marginBottom:10}}>🔗</div>
                <div style={{fontSize:18,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:8}}>Partage ton profil</div>
                <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>Chaque client qui arrive est quelqu'un qui te fait confiance.</div>
              </div>
              <div style={{background:C.cream2,borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                <span style={{fontSize:12,color:C.muted,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{expertProfileUrl}</span>
                <button onClick={()=>{ try{ navigator.clipboard.writeText(expertProfileUrl); }catch(e){} alert("Lien copié !"); }} style={{fontSize:11,color:C.gold,fontWeight:700,background:C.goldL,border:`1px solid ${C.goldB}`,borderRadius:20,padding:"5px 13px",cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>
                  Copier
                </button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {[
                  {icon:"🟢",label:"WhatsApp",url:`https://wa.me/?text=${encodeURIComponent("Consulte mon profil conseiller sur Savvy ✦ "+expertProfileUrl)}`},
                  {icon:"🔵",label:"Facebook",url:`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(expertProfileUrl)}`},
                  {icon:"🐦",label:"X / Twitter",url:`https://twitter.com/intent/tweet?text=${encodeURIComponent("Consulte mon profil conseiller sur Savvy ✦")}&url=${encodeURIComponent(expertProfileUrl)}`},
                  {icon:"📧",label:"Email",url:`mailto:?subject=${encodeURIComponent("Mon profil Savvy")}&body=${encodeURIComponent("Bonjour, voici mon profil conseiller : "+expertProfileUrl)}`},
                ].map(s=>(
                  <button key={s.label} onClick={()=>window.open(s.url,"_blank")} style={{padding:"13px 10px",borderRadius:13,border:`1px solid ${C.border}`,background:C.cream2,cursor:"pointer",fontFamily:"inherit",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                    <span style={{fontSize:24}}>{s.icon}</span>
                    <span style={{fontSize:11,fontWeight:700,color:C.ink}}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  };


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
          <div style={{background:"#FFF5F5",borderRadius:13,padding:"14px 15px",marginBottom:16,border:"1px solid #FEE2E2",cursor:"pointer"}} onClick={()=>setCancelModal({...cancelModal,step:"confirm"})}>
            <div style={{fontSize:14,fontWeight:700,color:"#B91C1C",marginBottom:2}}>✕ Annuler la session</div>
            <div style={{fontSize:11,color:"#EF4444"}}>Un remboursement sera traité selon la politique d'annulation</div>
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
            <button onClick={()=>{ if(!rescheduleDate||!rescheduleHeure){alert("Veuillez remplir la date et l'heure");return;} alert(`Demande envoyée pour le ${rescheduleDate} à ${rescheduleHeure.replace(":","h")}`); setCancelModal(null); setRescheduleDate(""); setRescheduleHeure(""); }} style={{flex:2,padding:"12px",borderRadius:12,border:"none",background:"#1D4ED8",color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📅 Envoyer la demande</button>
          </div>
        </div>
      </div>
    );
    if (cancelModal.step === "confirm") return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:9999}}>
        <div style={{background:C.white,borderRadius:"20px 20px 0 0",padding:"28px 20px 32px",width:"100%",maxWidth:480}}>
          <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 20px"}}/>
          <div style={{fontSize:32,textAlign:"center",marginBottom:10}}>⚠️</div>
          <div style={{fontSize:17,fontWeight:800,color:"#B91C1C",fontFamily:SERIF,textAlign:"center",marginBottom:6}}>Confirmer l'annulation ?</div>
          <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:22,lineHeight:1.5}}>Cette action est irréversible.{cancelModal.type==="exp"?" Ton client sera notifié et remboursé automatiquement.":" Tu seras remboursé(e) selon la politique d'annulation de l'expert."}</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setCancelModal({...cancelModal,step:"choose"})} style={{flex:1,padding:"13px",borderRadius:12,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Retour</button>
            <button onClick={()=>{ alert("Session annulée."+(cancelModal.type==="exp"?" Ton client a été notifié.":" Tu seras remboursé(e) sous 3–5 jours.")); setCancelModal(null); }} style={{flex:1,padding:"13px",borderRadius:12,border:"none",background:"#B91C1C",color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Annuler</button>
          </div>
        </div>
      </div>
    );
    return null;
  })() : null;

  return (
    <>
      {/* Hidden file input — label trick most reliable cross-browser */}
      <input
        id="savvy-photo-input"
        type="file"
        accept="image/*"
        style={{ display:"none" }}
        onChange={e=>{ const f=e.target.files[0]; if(f){ const r=new FileReader(); r.onload=ev=>setPhotoUrl(ev.target.result); r.readAsDataURL(f); } e.target.value=""; }}
      />
      <div style={{ flex:1, overflowY:"auto", paddingBottom:80, background:C.cream }}>
        <Header/>
        {mode === "client" ? <ClientView/> : <ExpertView/>}
      </div>

      {CancelModalUI}

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

      {/* ── Modifier profil expert ─────────────────────────────────────── */}
      {showEditExpert && <>
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
              {label:"Tagline", ph:"Je t\'aide à planifier des séjours parfaits à Paris", multi:false},
              {label:"Biographie", ph:"En 2-3 phrases : qui es-tu et comment aides-tu tes clients ?", multi:true},
              {label:"Spécialité", ph:"Séjours Paris · Hôtels · Restaurants · Bons plans", multi:false},
            ].map(f => (
              <div key={f.label} style={{ marginBottom:16 }}>
                <label style={{ fontSize:11, fontWeight:600, color:C.muted, marginBottom:6, display:"block", textTransform:"uppercase", letterSpacing:.5 }}>{f.label}</label>
                {f.multi
                  ? <textarea placeholder={f.ph} style={{ width:"100%", padding:"12px 14px", borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", height:80, resize:"none", background:C.white }}/>
                  : <input placeholder={f.ph} style={{ width:"100%", padding:"12px 14px", borderRadius:11, border:`1.5px solid ${C.border}`, fontSize:13, fontFamily:"inherit", color:C.ink, outline:"none", boxSizing:"border-box", background:C.white }}/>}
              </div>
            ))}
            <div style={{ display:"flex", gap:9 }}>
              <button onClick={()=>setShowEditExpert(false)} style={{ flex:1, padding:"13px", borderRadius:12, border:`1px solid ${C.border}`, background:C.white, color:C.ink, fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>Annuler</button>
              <button onClick={()=>setShowEditExpert(false)} style={{ flex:2, padding:"13px", borderRadius:12, border:"none", background:C.ink, color:C.white, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:SERIF }}>Enregistrer ✓</button>
            </div>
          </div>
        </div>
      </>}

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
              <div><div style={{ fontSize:17, fontWeight:700, color:C.ink, fontFamily:SERIF }}>Mes favoris</div><div style={{ fontSize:12, color:C.muted }}>{CLIENT_FAVS_DATA.length} experts sauvegardés</div></div>
              <button onClick={()=>setShowFavs(false)} style={{ background:C.cream2, border:`1px solid ${C.border}`, borderRadius:9, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:C.muted }}>×</button>
            </div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"14px 18px 24px" }}>
            {CLIENT_FAVS_DATA.map(e => (
              <div key={e.id} style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:"13px 15px", marginBottom:10, display:"flex", gap:12, alignItems:"center", boxShadow:`0 1px 6px ${C.sh}` }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:e.bg, color:e.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:16, border:`1.5px solid ${C.border}`, flexShrink:0 }}>{e.initials}</div>
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
function NotificationPanel({ onClose, onNavigate, isExpert, readNotifIds=[], onMarkRead }) {
  const NOTIFS_DATA = [
    { id:1, icon:"💬", title:"Nouveau message de Clément",   sub:"Je vous recommande l'Hôtel du Louvre...", time:"Il y a 5 min",    screen:"messages"    },
    { id:2, icon:"✅", title:"Réservation confirmée",         sub:"Session avec Patrick Gazet · demain 14h",  time:"Il y a 2h",      screen:"reservations" },
    { id:3, icon:"⭐", title:"Laissez un avis",               sub:"Ta session avec Marie Aubert est terminée",time:"Hier",           screen:"reservations" },
    { id:4, icon:"🎯", title:"Nouveau conseiller disponible", sub:"Lucas Bertrand vient de rejoindre Savvy",  time:"Il y a 2 jours", screen:"search"       },
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
              <div style={{ width:38, height:38, borderRadius:"50%", background:isRead?C.cream3:C.goldL, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{n.icon}</div>
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
function AuthModal({ onClose, onSuccess }) {
  const [step, setStep] = useState("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [isRegister, setIsRegister] = useState(false);
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
      setSocialLoading(provider);
      await new Promise(r=>setTimeout(r,1400));
      setSocialLoading(null);
      const emails={google:"utilisateur@gmail.com",apple:"utilisateur@icloud.com"};
      onSuccess({email:emails[provider],name:provider==="google"?"Compte Google":"Compte Apple",isExpert:false});
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

        {/* ── CHOICE ─────────────────────────────────────────────────────── */}
        {step==="choice" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>Bienvenue !</h2>
            <p style={{fontSize:13,color:C.muted,margin:0}}>Connecte-toi pour accéder à Savvy</p>
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

          {/* Email */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Adresse email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="camille@exemple.com" type="email" style={inp2}
              onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&setStep("email")}/>
          </div>
          <button onClick={()=>{if(!email.includes("@")){alert("Email invalide");return;}setStep("email");}}
            style={{width:"100%",padding:"13px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:C.ink,color:C.white,fontFamily:SERIF,marginBottom:12}}>
            Continuer avec mon email →
          </button>
          <div style={{textAlign:"center",marginBottom:20,fontSize:12,color:C.muted}}>
            Pas de compte ?{" "}
            <button onClick={()=>{setIsRegister(true);setStep("email");}} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:700,fontFamily:"inherit",fontSize:12}}>S\'inscrire gratuitement</button>
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
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.3}}>{u.isExpert?"🎯 Expert":"👤 Client"}</div>
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:C.faint,textAlign:"center",marginTop:10}}>
              Comptes de démonstration — aucun vrai compte créé
            </div>
          </div>
        </>}

        {/* ── EMAIL + PASSWORD ───────────────────────────────────────── */}
        {step==="email" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>{isRegister?"Créer mon compte":"Content de te revoir"}</h2>
            <p style={{fontSize:13,color:C.muted,margin:0}}>{email}</p>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Mot de passe</label>
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
          <button onClick={()=>{
            if(!password){alert("Entre ton mot de passe.");return;}
            if(isRegister&&password!==confirmPassword){alert("Les mots de passe ne correspondent pas.");return;}
            setStep("otp");
          }} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:C.ink,color:C.white,fontFamily:SERIF}}>
            {isRegister?"Créer mon compte →":"Se connecter →"}
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
          <button onClick={()=>{if(!resetEmail.includes("@")){alert("Email invalide");return;}setStep("reset_sent");}}
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
            <span style={{ fontSize:11,padding:"3px 10px",borderRadius:20,background:"rgba(16,185,129,.15)",color:C.sageMid,fontWeight:700 }}>🟢 Très actif</span>
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
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:16,fontWeight:700,color:C.ink,fontFamily:SERIF,marginBottom:12 }}>Je t\'aide à…</div>
          {extras.resout.map((r,i)=>(
            <div key={i} style={{ display:"flex",gap:11,alignItems:"flex-start",background:C.white,borderRadius:12,padding:"11px 14px",border:`1px solid ${C.border}`,marginBottom:8 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:e.color,flexShrink:0,marginTop:5 }}/>
              <span style={{ fontSize:13,color:C.soft,lineHeight:1.5 }}>{r}</span>
            </div>
          ))}
        </div>
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
  return <div style={{padding:"11px 16px 10px",background:C.white,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,gap:8}}>
    <div style={{fontSize:24,fontWeight:700,fontFamily:SERIF,letterSpacing:"-1px",color:C.ink,flexShrink:0}}>sav<em style={{color:C.gold,fontStyle:"italic"}}>vy</em></div>

    {/* Mode toggle — only for experts */}
    {isLoggedIn && isExpert && (
      <div style={{display:"flex",alignItems:"center",background:C.cream2,borderRadius:20,padding:3,border:`1px solid ${C.border}`,flexShrink:0}}>
        <button onClick={()=>onToggleMode("client")} style={{padding:"5px 12px",borderRadius:17,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all .2s",
          background:appMode==="client"?C.white:"transparent",
          color:appMode==="client"?C.ink:C.muted,
          boxShadow:appMode==="client"?"0 1px 4px rgba(0,0,0,.1)":"none"
        }}>👤 Client</button>
        <button onClick={()=>onToggleMode("expert")} style={{padding:"5px 12px",borderRadius:17,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all .2s",
          background:appMode==="expert"?C.ink:"transparent",
          color:appMode==="expert"?C.white:C.muted,
          boxShadow:appMode==="expert"?"0 1px 4px rgba(0,0,0,.2)":"none"
        }}>⚡ Expert</button>
      </div>
    )}

    <div style={{display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
      {!isExpert && <div style={{fontSize:11,background:C.goldL,color:C.gold,padding:"4px 12px",borderRadius:20,fontWeight:700,border:`1px solid ${C.goldB}`}}>🇫🇷 France</div>}
      {isLoggedIn ? (
        <button onClick={onNotif} style={{background:"none",border:"none",cursor:"pointer",position:"relative",padding:3}}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.soft} strokeWidth={1.8}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          {notifCount > 0 && <div style={{position:"absolute",top:0,right:0,width:16,height:16,borderRadius:"50%",background:C.gold,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{notifCount}</div>}
        </button>
      ) : (
        <button onClick={onLogin} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${C.border}`,background:C.white,color:C.ink,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          Connexion
        </button>
      )}
    </div>
  </div>;
}

// ─── BottomNav ───────────────────────────────────────────────────────────────
function BottomNav({nav, onChange, unreadCount, appMode}) {

  const clientItems = [
    {id:"home",        label:"Accueil",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>},
    {id:"messages",    label:"Messages",     icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, badge:unreadCount},
    {id:"reservations",label:"Réservations", icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>},
    {id:"profile",     label:"Profil",       icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>},
  ];

  const expertItems = [
    {id:"exp-dashboard", label:"Dashboard",     icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={2} y={3} width={20} height={14} rx={2}/><line x1={8} y1={21} x2={16} y2={21}/><line x1={12} y1={17} x2={12} y2={21}/></svg>},
    {id:"exp-sessions",  label:"Sessions",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={16} y1={2} x2={16} y2={6}/><line x1={8} y1={2} x2={8} y2={6}/><line x1={3} y1={10} x2={21} y2={10}/></svg>, badge:2},
    {id:"messages",      label:"Messages",      icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, badge:unreadCount},
    {id:"exp-dispo",     label:"Disponibilités",icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><circle cx={12} cy={12} r={9}/><polyline points="12 7 12 12 15 15"/></svg>},
    {id:"exp-compte",    label:"Mon compte",    icon:a=><svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={a?2.5:1.8}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx={12} cy={7} r={4}/></svg>},
  ];

  const items = appMode === "expert" ? expertItems : clientItems;

  return (
    <div style={{background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-around",padding:"10px 0 19px",flexShrink:0}}>
      {items.map(item=>{
        const a = nav===item.id;
        return (
          <button key={item.id} onClick={()=>onChange(item.id)}
            style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"3px 6px",border:"none",background:"none",color:a?C.ink:C.faint,fontSize:10,fontWeight:a?700:400,fontFamily:"inherit",position:"relative",flex:1}}>
            <div style={{position:"relative"}}>
              {item.icon(a)}
              {item.badge>0&&<div style={{position:"absolute",top:-4,right:-6,width:16,height:16,borderRadius:"50%",background:C.gold,color:C.white,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",border:`2px solid ${C.white}`}}>{item.badge}</div>}
            </div>
            <span style={{fontSize:appMode==="expert"?9:10,whiteSpace:"nowrap"}}>{item.label}</span>
            {a && <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:28,height:3,borderRadius:2,background:C.ink}}/>}
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
  const [readNotifIds, setReadNotifIds] = useState([]);
  const [appMode, setAppMode] = useState("client"); // "client" | "expert"
  const [expInitSection, setExpInitSection] = useState(null); // section to open in ProfileScreen

  const goHome   = () => { setScreen("home");   setNav("home"); };
  const goExpert = e  => { setPrevScreen(screen); setNav("home"); setExpert(e); setScreen("expert"); };
  const goMsg    = (e, from=null) => {
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
    if (id === "exp-dashboard") { setNav(id); setExpInitSection("compte"); setScreen("profile"); return; }
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
  const main = ["home","search","messages","reservations","profile","public"].includes(screen);
  const unread = isLoggedIn ? DEMO_MSGS.reduce((s,m)=>s+m.unread,0) : 0;

  return <div style={{fontFamily:"DM Sans, Helvetica Neue, sans-serif"}}>
    <style>{`
      @import url(\'https://fonts.googleapis.com/css2?family=Cormorant+Garant:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@400;500;700;800&display=swap\');
      @keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}} @keyframes spin{to{transform:rotate(360deg)}} @keyframes spin{to{transform:rotate(360deg)}}
      *{box-sizing:border-box} ::-webkit-scrollbar{width:0} ::-webkit-scrollbar-horizontal{height:0}
      input::placeholder,textarea::placeholder{color:#A8A29E}
      input:focus,textarea:focus{border-color:#8B6330!important;box-shadow:0 0 0 3px rgba(139,99,48,.10);outline:none}
      select:focus{border-color:#8B6330!important;outline:none}
      button:active{opacity:.82} button{transition:opacity .15s}
    `}</style>
    <div style={{width:"100%",maxWidth:430,margin:"0 auto",background:C.cream,minHeight:"100vh",display:"flex",flexDirection:"column",boxShadow:"0 0 40px rgba(0,0,0,.1)",...(["message","signup"].includes(screen)?{height:"100vh",overflow:"hidden"}:{})}}>
      {showOnboarding && !isLoggedIn && <OnboardingScreen onDone={()=>{ setShowOnboarding(false); setShowSplash(true); }}/>}
      {!showOnboarding && showSplash && !isLoggedIn && <SplashScreen onSkip={()=>{ setShowSplash(false); setScreen("home"); setNav("home"); }} onSuccess={(user)=>{ setIsLoggedIn(true); setAuthUser(user); if(user.isExpert) setIsExpert(true); setShowSplash(false); setScreen("home"); setNav("home"); }}/>}
      {main && <TopBar onNotif={()=>setShowNotif(v=>!v)} notifCount={isLoggedIn?Math.max(0,4-readNotifIds.length):0} isLoggedIn={isLoggedIn} onLogin={()=>setShowSplash(true)} isExpert={isExpert} appMode={appMode} onToggleMode={m=>{ setAppMode(m); if(m==="expert"){ setNav("exp-dashboard"); setExpInitSection("compte"); setScreen("profile"); } else { setNav("home"); setExpInitSection(null); setScreen("home"); } }}/>}
      {showAuth && <AuthModal onClose={()=>setShowAuth(false)} onSuccess={(user)=>{ setIsLoggedIn(true); setAuthUser(user); if(user.isExpert) setIsExpert(true); setShowAuth(false); setShowSplash(false); setAuthIntent(null); }}/>}
      {showNotif && <NotificationPanel onClose={()=>setShowNotif(false)} onNavigate={(s)=>{ setShowNotif(false); handleNav(s); }} readNotifIds={readNotifIds} onMarkRead={(ids)=>setReadNotifIds(ids)}/>}
      {screen==="home"         && <HomeScreen onExpert={goExpert} onSearch={q=>goSearch(q)} onCat={id=>goSearch("",id)} isLoggedIn={isLoggedIn} authUser={authUser} isExpert={isExpert}/>}
      {screen==="search"       && <SearchScreen initQ={searchQ} initCat={searchCat} onExpert={goExpert}/>}
      {screen==="messages"     && <MessagesListScreen onConv={e=>goMsg(e)} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)}/>}
      {screen==="reservations" && <ReservationsScreen onExpert={goExpert} onMsg={goMsg} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)}/>}
      {screen==="public"        && <PublicProfileScreen onBack={()=>{setScreen("profile");setNav("profile");}} onBook={goBook} onMsg={goMsg} expertId={authUser?.isExpert?(EXPERTS.find(ex=>ex.initials===DEMO_USERS.expert.initials)||EXPERTS[7])?.id:undefined}/>}
      {screen==="profile"      && <ProfileScreen key={expInitSection||"profile"} authUser={authUser} isLoggedIn={isLoggedIn} onLogin={()=>setShowAuth(true)} onNavigate={(s)=>handleNav(s)} newExpertProfile={newExpertProfile}
          isExpert={isExpert}
          initExpSection={expInitSection}
          onBecomeExpert={()=>setIsExpert(true)}
          onSignup={()=>{ setPrevScreen("profile"); setScreen("signup"); }}
          onViewPublic={() => { setPrevScreen("profile"); setScreen("public"); }}
          onLogout={() => { setIsLoggedIn(false); setAuthUser(null); setIsExpert(false); setScreen("home"); setNav("home"); setAppMode("client"); }}
        />}
      {screen==="expert"       && expert && <ExpertScreen e={expert} onBack={()=>{setScreen(prevScreen);}} onBook={goBook} onMsg={goMsg}/>}
      {screen==="message"      && expert && <MessagingScreen e={expert} onBack={()=>{setScreen(prevMsgScreen);setNav(prevMsgScreen);}}/>}
      {screen==="booking"      && expert && phase && <BookingScreen e={expert} ph={phase} onBack={()=>setScreen("expert")} onConfirm={(info)=>{ setBookingInfo(info); setScreen("success"); }}/>}
      {screen==="success"      && expert && phase && <SuccessScreen e={expert} ph={phase} onHome={goHome} onMsg={()=>goMsg(expert)} bookingDate={bookingInfo?.date} bookingSlot={bookingInfo?.slot}/>}
      {screen==="signup" && <SignupScreen
  authUser={authUser}
  onBack={() => { if(prevScreen==="profile"){setScreen("profile");setNav("profile");}else{goHome();}}}
  onDone={(expertProfile) => {
    setNewExpertProfile(expertProfile);
    setIsExpert(true);
    setScreen("profile");
    setNav("profile");
  }}
/>}
      {main && <BottomNav nav={nav} onChange={handleNav} unreadCount={unread} appMode={appMode}/>}
    </div>
  </div>;
}
