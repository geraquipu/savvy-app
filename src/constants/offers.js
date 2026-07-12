/* ─────────────────────────────────────────────────────────────────────────
   Offres (phases) — source de vérité unique.

   Historique : deux chemins de création produisaient deux formes différentes.
     · SignupScreen : { name, what: "Chat 30min", format: "chat", price }
     · Éditeur      : { name, what, desc, price, duree: "30 min", formats: ["chat"] }
   Chaque écran devinait la durée dans un champ différent → bugs à répétition.

   Forme canonique :
     { id, name, desc, price, durationMin: 30, formats: ["chat"] }

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
  const durationMin =
    parseDurationMin(o.durationMin) ??
    parseDurationMin(o.duree) ??
    parseDurationMin(o.what) ??      // legacy signup : "Chat 30min"
    parseDurationMin(o.format) ??
    parseDurationMin(o.name) ??
    60;

  // ── Formats : tableau `formats`, sinon `format` seul ──
  let formats = [];
  if (Array.isArray(o.formats) && o.formats.length) {
    formats = o.formats.map(normalizeFormatId).filter(Boolean);
  } else if (o.format) {
    const f = normalizeFormatId(o.format);
    if (f) formats = [f];
  }
  if (!formats.length) formats = ["video"];

  return {
    id: o.id ?? index + 1,
    name: (o.name || "Session conseil").trim(),
    desc: (o.desc || o.what || "").trim(),
    price: Number(o.price) || 0,
    durationMin,
    formats,
    // conservé pour l'affichage éventuel d'un badge
    tag: o.tag || null,
  };
}

/** Normalise la liste d'offres d'un expert. */
export function normalizeOffers(list) {
  return (Array.isArray(list) ? list : []).map(normalizeOffer);
}

/**
 * Pas des créneaux dans le calendrier, en minutes.
 * Borné : un "Document 24h" ne doit pas vider le calendrier.
 */
export function slotStepFor(durationMin) {
  const n = Number(durationMin) || 60;
  return Math.min(240, Math.max(15, n));
}

/** Sous-titre lisible : "Appel audio · 15 min" */
export function offerSubtitle(offer) {
  const o = offer.durationMin ? offer : normalizeOffer(offer);
  const label = FORMAT_META[o.formats[0]]?.label || "Session";
  return `${label} · ${formatDuration(o.durationMin)}`;
}
