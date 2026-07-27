/* ─────────────────────────────────────────────────────────────────────────
   Offres (phases) — source de vérité unique.

   Historique : deux chemins de création produisaient deux formes différentes.
     · SignupScreen : { name, what: "Chat 30min", format: "chat", price }
     · Éditeur      : { name, what, desc, price, duree: "30 min", formats: ["chat"] }
   Chaque écran devinait la durée dans un champ différent → bugs à répétition.

   Forme canonique :
     { id, name, desc, price, durationMin: 30, formats: ["chat"],
       kind: "session" | "parcours",
       outcome, sessionsIncluded, deliverables, durationWeeks }

   normalizeOffer() accepte les trois formes : aucune migration de données
   nécessaire. Tout écran qui lit une offre doit passer par ici.
   ───────────────────────────────────────────────────────────────────────── */

export const FORMAT_META = {
  video: { id: "video", label: "Vidéocall",       short: "Vidéo",    sub: "En direct · face à face" },
  audio: { id: "audio", label: "Appel audio",     short: "Audio",    sub: "Téléphone · voix uniquement" },
  doc:   { id: "doc",   label: "Document écrit",  short: "Document", sub: "Livrable PDF · 24-48h" },
  chat:  { id: "chat",  label: "Accompagnement",  short: "Chat",     sub: "Échanges par messagerie" },
};

export const FORMAT_IDS = Object.keys(FORMAT_META);

/**
 * Type d'offre.
 *
 * Une plateforme qui ne vend que des sessions à 20 € laisse 4 € de commission :
 * il faudrait 500 ventes par mois pour en vivre. Le « parcours » vend un
 * résultat, pas du temps — et se facture à la hauteur de la décision qu'il
 * évite de rater. Une session reste utile : c'est la porte d'entrée.
 *
 * Nommé « parcours » et non « accompagnement » : ce dernier mot désigne déjà
 * le format `chat` à l'écran, et deux choses différentes sous le même nom se
 * confondent toujours au pire moment.
 */
export const OFFER_KINDS = {
  session: {
    id: "session",
    label: "Session",
    sub: "Une question précise, un rendez-vous",
    hint: "Le client repart avec une réponse claire.",
  },
  parcours: {
    id: "parcours",
    label: "Parcours",
    sub: "Plusieurs rendez-vous, un résultat livré",
    hint: "Tu accompagnes le client jusqu'au bout d'une décision.",
  },
};

export const OFFER_KIND_IDS = Object.keys(OFFER_KINDS);

/** Ramène n'importe quelle valeur sur un type connu. Défaut : session. */
export function normalizeKind(value) {
  const v = String(value || "").toLowerCase();
  return OFFER_KINDS[v] ? v : "session";
}

/** Semaines proposées pour un parcours. */
export const PARCOURS_WEEKS = [1, 2, 4, 6, 8, 12];

/** Durées proposées à l'expert quand il crée une offre. */
export const OFFER_DURATIONS = [15, 30, 45, 60, 90, 120];

/** "15 min" | "1h" | "1h30" | "2h" | "24h" → minutes. */
export function parseDurationMin(value) {
  if (typeof value === "number" && isFinite(value)) return value;
  if (!value) return null;
  const s = String(value).toLowerCase().trim();
  const hm = s.match(/(\d+)\s*h\s*(\d+)/); if (hm) return Number(hm[1]) * 60 + Number(hm[2]);
  const h  = s.match(/(\d+)\s*h/);         if (h)  return Number(h[1]) * 60;
  const m  = s.match(/(\d+)\s*min/);       if (m)  return Number(m[1]);
  return null;
}

/** 30 → "30 min" · 60 → "1h" · 90 → "1h30" · 1440 → "24h" */
export function formatDuration(min) {
  const n = Number(min);
  if (!isFinite(n) || n <= 0) return "1h";
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60), rest = n % 60;
  return rest ? `${h}h${String(rest).padStart(2, "0")}` : `${h}h`;
}

/** Ramène n'importe quelle étiquette de format sur un id connu. */
export function normalizeFormatId(value) {
  if (!value) return null;
  const v = String(value).toLowerCase();
  if (FORMAT_META[v]) return v;
  if (v.includes("vid")) return "video";
  if (v.includes("audio") || v.includes("appel") || v.includes("téléphone")) return "audio";
  if (v.includes("doc") || v.includes("pdf") || v.includes("écrit")) return "doc";
  if (v.includes("chat") || v.includes("mess") || v.includes("accompagn")) return "chat";
  return null;
}

/**
 * Convertit une offre (n'importe quelle forme historique) en forme canonique.
 * Ne jette jamais : renvoie toujours une offre exploitable.
 */
export function normalizeOffer(raw, index = 0) {
  const o = raw || {};

  // ── Durée : ordre de confiance, du plus explicite au plus dérivé ──
  const rawDuration =
    parseDurationMin(o.durationMin) ??
    parseDurationMin(o.duree) ??
    parseDurationMin(o.what) ??      // legacy signup : "Chat 30min"
    parseDurationMin(o.format) ??
    parseDurationMin(o.name) ??
    60;
  // Les offres créées avant l'unité minimale (« Appel audio 15min ») restent
  // en base : on les relève ici plutôt que de migrer les données. Un livrable
  // écrit garde son délai — 24h n'est pas une durée d'entretien.
  const isDoc = normalizeFormatId(Array.isArray(o.formats) ? o.formats[0] : o.format) === "doc";
  const durationMin = isDoc ? rawDuration : Math.max(MIN_SLOT_MIN, rawDuration);

  // ── Formats : tableau `formats`, sinon `format` seul ──
  let formats = [];
  if (Array.isArray(o.formats) && o.formats.length) {
    formats = o.formats.map(normalizeFormatId).filter(Boolean);
  } else if (o.format) {
    const f = normalizeFormatId(o.format);
    if (f) formats = [f];
  }
  if (!formats.length) formats = ["video"];

  // Les offres créées avant l'existence du type sont des sessions : aucune
  // migration de données, elles se normalisent à la lecture comme le reste.
  const kind = normalizeKind(o.kind);
  const isParcours = kind === "parcours";

  return {
    id: o.id ?? index + 1,
    name: (o.name || "Session conseil").trim(),
    desc: (o.desc || o.what || "").trim(),
    price: Number(o.price) || 0,
    durationMin,
    formats,
    kind,
    // La promesse concrète : « à la fin, tu sauras quelle machine acheter ».
    // C'est elle qui justifie un prix à trois chiffres, et c'est elle qu'on
    // oppose à une réclamation.
    outcome: (o.outcome || "").trim(),
    // Renseignés seulement pour un parcours — un client doit savoir ce qu'il
    // achète avant de payer 400 €, pas après.
    sessionsIncluded: isParcours ? Math.max(1, Number(o.sessionsIncluded) || 3) : null,
    deliverables: isParcours ? (o.deliverables || "").trim() : "",
    durationWeeks: isParcours ? Math.max(1, Number(o.durationWeeks) || 4) : null,
    // conservé pour l'affichage éventuel d'un badge
    tag: o.tag || null,
  };
}

/** Normalise la liste d'offres d'un expert. */
export function normalizeOffers(list) {
  return (Array.isArray(list) ? list : []).map(normalizeOffer);
}

/**
 * Unité minimale de réservation, en minutes.
 *
 * La durée d'une offre est un PLAFOND, pas un quota : « jusqu'à 30 min ». Si la
 * réponse est claire en 8 minutes, la session s'arrête là — personne n'a
 * intérêt à meubler. Descendre sous 30 min découpait l'agenda en mosaïque,
 * multipliait les risques de chevauchement, et poussait à vendre du temps
 * plutôt que de l'expérience vécue.
 */
export const MIN_SLOT_MIN = 30;

/**
 * Pas des créneaux dans le calendrier, en minutes.
 * Borné des deux côtés : jamais sous l'unité minimale, et un "Document 24h"
 * ne doit pas vider le calendrier.
 */
export function slotStepFor(durationMin) {
  const n = Number(durationMin) || 60;
  return Math.min(240, Math.max(MIN_SLOT_MIN, n));
}

/** Durée annoncée au client : un plafond, jamais une promesse de remplissage. */
export function durationCeiling(min) {
  return `jusqu'à ${formatDuration(min)}`;
}

/** Sous-titre lisible : "Appel audio · jusqu'à 30 min" */
export function offerSubtitle(offer) {
  const o = offer.durationMin ? offer : normalizeOffer(offer);
  const label = FORMAT_META[o.formats[0]]?.label || "Session";
  // Un livrable écrit a un délai, pas une durée d'entretien.
  if (o.formats[0] === "doc") return `${label} · ${formatDuration(o.durationMin)}`;
  return `${label} · ${durationCeiling(o.durationMin)}`;
}
