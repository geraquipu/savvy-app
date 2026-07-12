import React, { useState } from 'react';
import { C, SERIF, SANS } from '../constants/colors';
import { expertPayout, savvyCut } from '../constants/config';

const EXPERT_STEPS = [
  { n: "01", t: "Crée ton profil", s: "Décris ton expérience réelle en 5 minutes. Pas de CV, pas de diplômes — juste ce que tu as vécu." },
  { n: "02", t: "Configure tes offres", s: "Fixe ton tarif, ton format (vidéo, chat, document) et tes disponibilités." },
  { n: "03", t: "Reçois des demandes", s: "Les clients te contactent. Tu confirmes. Tu aides. Tu gagnes." },
];

const CLIENT_USECASES = [
  { icon: "🏠", t: "Trouver un appart sans garant à Paris" },
  { icon: "💼", t: "Lancer sa micro-entreprise en France" },
  { icon: "🎓", t: "S'inscrire dans une école française" },
  { icon: "🍫", t: "Sourcer du chocolat Valrhona à prix grossiste" },
  { icon: "📄", t: "Comprendre sa fiche de paie" },
  { icon: "🌍", t: "Réussir son installation à l'étranger" },
];

const TESTIMONIALS = [
  {
    ini: "MR", bg: "#EDE9FE", col: "#7C3AED",
    name: "María R.", role: "Expatriée colombienne, Paris",
    text: "En 30 minutes avec German, j'ai compris tout ce que j'aurais dû savoir avant d'arriver en France. Je lui aurais payé 10× plus.",
    stars: 5,
  },
  {
    ini: "TL", bg: "#DBEAFE", col: "#1D4ED8",
    name: "Thomas L.", role: "Pâtissier, Lyon",
    text: "J'avais cherché mes fournisseurs pendant 3 mois. En 45 minutes, j'avais une liste de contacts qualifiés. Incroyable.",
    stars: 5,
  },
  {
    ini: "AF", bg: "#D1FAE5", col: "#065F46",
    name: "Amina F.", role: "Étudiante, Toulouse",
    text: "Je ne savais pas que la CAF pouvait couvrir presque tout mon loyer. Quelqu'un qui l'avait vécu me l'a expliqué en 20 minutes.",
    stars: 5,
  },
];

const EARNINGS = [
  { time: "30 min", price: 25, label: "Session rapide" },
  { time: "1h",    price: 50, label: "Standard" },
  { time: "2h",    price: 90, label: "Accompagnement" },
];

function LandingScreen({ onStart, onExplore, onExpert }) {
  const [calcIdx, setCalcIdx] = useState(1);
  const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
  const selected = EARNINGS[calcIdx];
  const monthly = Math.round(expertPayout(selected.price) * sessionsPerWeek * 4);

  return (
    <div style={{ fontFamily: SANS, background: C.cream, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Nav ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,249,247,.95)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 22, fontWeight: 900, fontFamily: SERIF, letterSpacing: "-1px", color: C.ink }}>
          sav<em style={{ color: C.goldB, fontStyle: "italic" }}>vy</em>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onExplore} style={{ padding: "7px 13px", borderRadius: 9, border: `1px solid ${C.border}`, background: "transparent", color: C.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Trouver un expert
          </button>
          <button onClick={onExpert} style={{ padding: "7px 13px", borderRadius: 9, border: "none", background: C.ink, color: C.white, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Devenir conseiller
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(160deg, ${C.ink} 0%, #1A1512 100%)`, padding: "88px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: "50%", background: `${C.gold}12` }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: `${C.gold}08` }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: `${C.gold}20`, border: `1px solid ${C.gold}40`, borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: C.goldB, marginBottom: 22, letterSpacing: 0.5 }}>
            ✦ Disponible en France · Beta ouverte
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 900, fontFamily: SERIF, color: C.white, margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
            Parle avec quelqu'un<br />
            <em style={{ color: C.goldB, fontStyle: "italic" }}>qui l'a déjà fait.</em>
          </h1>

          <p style={{ fontSize: 15, color: "rgba(253,252,248,.6)", lineHeight: 1.75, margin: "0 auto 36px", maxWidth: 310 }}>
            Accède en quelques minutes à l'expérience de quelqu'un qui a déjà résolu exactement ton problème.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "0 auto 44px" }}>
            <button onClick={onExpert} style={{ padding: "15px", borderRadius: 13, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.goldB})`, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: SERIF, boxShadow: `0 6px 24px ${C.gold}45` }}>
              ✦ Partager mon expérience →
            </button>
            <button onClick={onExplore} style={{ padding: "13px", borderRadius: 13, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.07)", color: "rgba(253,252,248,.75)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Trouver un conseiller
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {[["Dès 5€","Session"],["✦","Vérifiés"],["< 24h","Réponse"],["80%","Pour toi"]].map(([n,l]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.white, fontFamily: SERIF }}>{n}</div>
                <div style={{ fontSize: 9, color: "rgba(253,252,248,.38)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pour les conseillers ── */}
      <div style={{ padding: "52px 24px 44px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Pour les conseillers</div>
          <h2 style={{ fontSize: 27, fontWeight: 800, fontFamily: SERIF, color: C.ink, margin: "0 0 12px", letterSpacing: "-.3px", lineHeight: 1.2 }}>
            Ton expérience peut<br />changer la vie de quelqu'un.
          </h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: "0 auto", maxWidth: 300 }}>
            Pas besoin d'être professeur. Si tu as déjà résolu un problème difficile, quelqu'un cherche exactement ta réponse.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
          {[
            { icon: "💰", title: "Tu gardes 80%", sub: "Stripe te vire directement. Savvy prend 20% uniquement sur les sessions réalisées." },
            { icon: "🗓️", title: "Tes horaires, ton rythme", sub: "Active les créneaux quand tu veux. Tu peux commencer avec 2h par semaine." },
            { icon: "✦",  title: "Des clients vérifiés", sub: "Chaque demande vient d'une vraie personne avec un vrai problème. Pas de spam." },
          ].map(item => (
            <div key={item.title} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start", boxShadow: `0 2px 8px ${C.sh}` }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: C.goldL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: item.icon === "✦" ? 16 : 18, flexShrink: 0, color: C.gold, fontWeight: 800, fontFamily: item.icon === "✦" ? SERIF : "inherit" }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: SERIF, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Calculatrice revenus */}
        <div style={{ background: `linear-gradient(135deg, ${C.ink}, #2C2825)`, borderRadius: 20, padding: "22px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(253,252,248,.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Combien peux-tu gagner ?</div>
          <div style={{ display: "flex", gap: 7, marginBottom: 18 }}>
            {EARNINGS.map((e, i) => (
              <button key={i} onClick={() => setCalcIdx(i)} style={{ flex: 1, padding: "9px 4px", borderRadius: 11, border: `1.5px solid ${calcIdx === i ? C.gold : "rgba(255,255,255,.1)"}`, background: calcIdx === i ? `${C.gold}18` : "rgba(255,255,255,.04)", color: calcIdx === i ? C.goldB : "rgba(253,252,248,.45)", fontSize: 11, fontWeight: calcIdx === i ? 700 : 400, cursor: "pointer", fontFamily: "inherit", textAlign: "center" }}>
                <div style={{ fontWeight: 700 }}>{e.time}</div>
                <div style={{ fontSize: 10, marginTop: 2, opacity: .8 }}>{e.price}€</div>
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "rgba(253,252,248,.5)" }}>Sessions par semaine</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.white }}>{sessionsPerWeek}</div>
            </div>
            <input type="range" min={1} max={10} value={sessionsPerWeek} onChange={e => setSessionsPerWeek(Number(e.target.value))}
              style={{ width: "100%", accentColor: C.gold }} />
          </div>
          <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 13, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(253,252,248,.38)", marginBottom: 4 }}>Revenu mensuel estimé</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.white, fontFamily: SERIF }}>{monthly}€</div>
              <div style={{ fontSize: 9, color: "rgba(253,252,248,.28)", marginTop: 2 }}>80% × {selected.price}€ × {sessionsPerWeek} sess. × 4 sem.</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "rgba(253,252,248,.38)", marginBottom: 4 }}>Par session</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.goldB, fontFamily: SERIF }}>{expertPayout(selected.price)}€</div>
            </div>
          </div>
        </div>

        <button onClick={onExpert} style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: C.ink, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SERIF }}>
          ✦ Commencer à aider →
        </button>
      </div>

      {/* ── 3 étapes ── */}
      <div style={{ background: C.white, padding: "44px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>3 étapes</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: SERIF, color: C.ink, margin: 0 }}>Prêt en 5 minutes.</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {EXPERT_STEPS.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < EXPERT_STEPS.length - 1 ? 4 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.ink, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 11, fontWeight: 800 }}>{step.n}</div>
                {i < EXPERT_STEPS.length - 1 && <div style={{ width: 1, height: 32, background: C.border, marginTop: 6 }} />}
              </div>
              <div style={{ paddingTop: 8, paddingBottom: 28 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: SERIF, marginBottom: 5 }}>{step.t}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{step.s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Témoignages ── */}
      <div style={{ padding: "44px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Ce qu'ils disent</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: SERIF, color: C.ink, margin: 0 }}>De vraies histoires.</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px", boxShadow: `0 2px 8px ${C.sh}` }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                {[1,2,3,4,5].map(s => <svg key={s} width={12} height={12} viewBox="0 0 12 12" fill={s <= t.stars ? "#B8864A" : "#E5E0D8"}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
              </div>
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.7, fontStyle: "italic", marginBottom: 12 }}>"{t.text}"</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.bg, color: t.col, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{t.ini}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pour les clients ── */}
      <div style={{ background: C.white, padding: "44px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Pour les clients</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: SERIF, color: C.ink, margin: "0 0 10px" }}>
            Quelqu'un a déjà<br />résolu ton problème.
          </h2>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: "0 auto 24px", maxWidth: 280 }}>
            Dès 5€, parle avec quelqu'un qui l'a vécu — pas un chatbot, pas un consultant, une vraie personne.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 24 }}>
          {CLIENT_USECASES.map(u => (
            <div key={u.t} style={{ background: C.cream2, borderRadius: 12, padding: "12px 13px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{u.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>{u.t}</div>
            </div>
          ))}
        </div>
        <button onClick={onExplore} style={{ width: "100%", padding: "14px", borderRadius: 13, border: `1.5px solid ${C.border}`, background: "transparent", color: C.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: SERIF }}>
          Explorer les conseillers →
        </button>
      </div>

      {/* ── Final CTA ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.ink} 0%, #1A1512 100%)`, padding: "52px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: `${C.gold}10` }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 28, color: C.goldB, fontFamily: SERIF, fontWeight: 900, marginBottom: 16 }}>✦</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: SERIF, color: C.white, margin: "0 0 12px", lineHeight: 1.2 }}>
            Prêt à partager<br />ce que tu sais ?
          </h2>
          <p style={{ fontSize: 13, color: "rgba(253,252,248,.5)", lineHeight: 1.7, margin: "0 auto 32px", maxWidth: 270 }}>
            Des centaines de personnes cherchent en ce moment quelqu'un qui a vécu exactement leur situation.
          </p>
          <button onClick={onExpert} style={{ width: "100%", maxWidth: 300, display: "block", margin: "0 auto 14px", padding: "16px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.goldB})`, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: SERIF, boxShadow: `0 6px 24px ${C.gold}40` }}>
            Créer mon profil conseiller →
          </button>
          <button onClick={onExplore} style={{ background: "none", border: "none", color: "rgba(253,252,248,.35)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
            Ou explorer les conseillers disponibles
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ background: C.ink, padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 16, fontWeight: 900, fontFamily: SERIF, color: C.white }}>
            sav<em style={{ color: C.goldB, fontStyle: "italic" }}>vy</em>
          </div>
          <div style={{ fontSize: 10, color: "rgba(253,252,248,.22)" }}>© 2026 · France</div>
        </div>
        <div style={{ fontSize: 10, color: "rgba(253,252,248,.18)" }}>Paiements sécurisés · RGPD · Données protégées</div>
      </div>

    </div>
  );
}

export default LandingScreen;
