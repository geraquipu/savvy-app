export const DEMO_USERS = {
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

export const CATS = [
  {id:"vie",        icon:"🏠", label:"Vie en France",  sub:"Logement · Travail · Études",        color:"#8B6330", bg:"#F5EDD8"},
  {id:"tourisme",   icon:"✈️", label:"Tourisme",        sub:"Voyages · Gastronomie · Loisirs",    color:"#0369A1", bg:"#E0F2FE"},
  {id:"business",   icon:"💼", label:"Business",        sub:"Import · Export · Création",         color:"#0F2744", bg:"#DBEAFE"},
  {id:"industrie",  icon:"🏗️", label:"Industrie",       sub:"Production · Machines · Logistique", color:"#065F46", bg:"#D1FAE5"},
  {id:"techno",     icon:"💻", label:"Technologie",     sub:"Dev · IA · Automatisation",          color:"#6D28D9", bg:"#EDE9FE"},
  {id:"finances",   icon:"💶", label:"Finances",        sub:"Investissements · Fiscalité",        color:"#92400E", bg:"#FEF3C7"},
];

export const SUBCATS = {
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
export const TRUST_LEVELS = [
  { id:"explorador",      min:0,  max:30,  icon:"",  label:"Explorador",      color:"#059669", bg:"#E8F5EE", border:"rgba(15,157,88,.2)"   },
  { id:"practicant",      min:30, max:60,  icon:"",  label:"Praticant",       color:"#92400E", bg:"#FEF3C7", border:"rgba(146,64,14,.2)"   },
  { id:"expert",          min:60, max:80,  icon:"",  label:"Expert",          color:"#1E3A5F", bg:"#E8EFF8", border:"rgba(30,58,95,.2)"    },
  { id:"expert_verifie",  min:80, max:95,  icon:"",  label:"Expert vérifié",  color:"#5B3E99", bg:"#F0EAFF", border:"rgba(91,62,153,.2)"   },
  { id:"referent",        min:95, max:100, icon:"",  label:"Référent Savvy",  color:"#92400E", bg:"#FEF3C7", border:"rgba(146,64,14,.2)"   },
];

export const getTrustLevel = (score) => TRUST_LEVELS.find(l => score >= l.min && score < l.max) || TRUST_LEVELS[TRUST_LEVELS.length-1];

// ─── Shared booking bus (localStorage) ────────────────────────────────────────
export const BOOKINGS_KEY = "savvy_bookings";
export const THREADS_KEY  = "savvy_threads";
export const getBookings  = () => { try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY)||"[]"); } catch { return []; } };
export const saveBookings = (arr) => { try { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(arr)); } catch {} };
export const addBooking   = (b) => { const arr = getBookings(); saveBookings([...arr.filter(x=>x.id!==b.id), b]); };
export const updateBooking = (id, patch) => { saveBookings(getBookings().map(b=>b.id===id?{...b,...patch}:b)); };
export const getThreads   = () => { try { return JSON.parse(localStorage.getItem(THREADS_KEY)||"[]"); } catch { return []; } };
export const addThread    = (t) => { const arr = getThreads(); if(!arr.find(x=>x.id===t.id)) { localStorage.setItem(THREADS_KEY, JSON.stringify([t,...arr])); } };

export const EXPERTS = [
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

export const CAT_MAP = {
  vie:       [9],
  tourisme:  [1,2],
  business:  [4,5],
  industrie: [3,6,8],
  techno:    [7],
  finances:  [],
};

export const DEMO_MSGS = [
  { id:1, eid:0, lastMsg:"Super, votre hôtel est réservé ! Vous allez adorer le quartier Marais.", time:"09:30", unread:0, session:{format:"📄 Document",dur:"1h",price:"10€",date:"Demain 10h00"} },
  { id:2, eid:1, lastMsg:"Pour le macaron, la clé c\'est la tant-pour-tant bien tamisée.",         time:"Hier",  unread:0, session:{format:"📹 Vidéo",dur:"1h",price:"25€",date:"Mar. 3 juin 11h00"} },
  { id:3, eid:2, lastMsg:"Votre labo peut gagner 30% de productivité avec 3 ajustements simples.", time:"Lun",   unread:1, session:{format:"📹 Vidéo",dur:"2h",price:"150€",date:"Sam. 31 mai 14h00"} },
];


export function getCountdown(hoursUntil) {
  if (hoursUntil == null) return null;
  if (hoursUntil <= 0)   return { label:"En cours ●", color:"#10B981", pulse:true };
  if (hoursUntil < 1)    return { label:"Dans moins d'1h", color:"#EF4444", pulse:true };
  if (hoursUntil < 3)    return { label:`Dans ${Math.round(hoursUntil)}h`, color:"#EF4444", pulse:false };
  if (hoursUntil < 24)   return { label:"Aujourd'hui", color:"#F59E0B", pulse:false };
  if (hoursUntil < 48)   return { label:"Demain", color:"#6366F1", pulse:false };
  return null;
}
