import React, { useState } from 'react';
import { C, SERIF, SANS } from '../constants/colors';
import { EXPERTS } from '../constants/data';

const STATS = [
  { n: "500+", l: "Experts vérifiés" },
  { n: "4.9★", l: "Note moyenne" },
  { n: "15min", l: "Réponse moyenne" },
];

const HOW = [
  { icon: "🔍", t: "Décris ta situation", s: "En quelques mots, dis-nous ce dont tu as besoin." },
  { icon: "🤝", t: "Savvy trouve l'expert", s: "On te connecte avec quelqu'un qui l'a déjà vécu." },
  { icon: "✅", t: "Obtiens ta réponse", s: "Par chat, vidéo ou document — selon ta préférence." },
];

const USECASES = [
  { icon: "🏠", t: "Trouver un logement sans garant" },
  { icon: "💼", t: "Créer son auto-entreprise" },
  { icon: "🎓", t: "S'inscrire à une école française" },
  { icon: "✈️", t: "Organiser un voyage à Paris" },
  { icon: "💶", t: "Comprendre sa fiche de paie" },
  { icon: "🏗️", t: "Trouver des fournisseurs B2B" },
];

function LandingScreen({ onStart, onExplore, onExpert }) {
  const [hovered, setHovered] = useState(null);
  const featured = EXPERTS.slice(0, 3);

  return (
    <div style={{ fontFamily: SANS, background: C.cream, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Nav ── */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,250,248,.92)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 22, fontWeight: 900, fontFamily: SERIF, letterSpacing: "-1px", color: C.ink }}>
          sav<em style={{ color: C.goldB, fontStyle: "italic" }}>vy</em>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onExplore} style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.ink, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Explorer
          </button>
          <button onClick={onStart} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: C.ink, color: C.white, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Connexion
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(160deg, ${C.ink} 0%, #1A1512 100%)`, padding: "96px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: `${C.gold}18` }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: `${C.gold}10` }} />

        <div style={{ display: "inline-block", background: `${C.gold}25`, border: `1px solid ${C.gold}50`, borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: C.goldB, marginBottom: 20, letterSpacing: 0.5 }}>
          ✦ Disponible en France
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, fontFamily: SERIF, color: C.white, margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-0.5px" }}>
          Parlez avec quelqu'un<br />
          <em style={{ color: C.goldB, fontStyle: "italic" }}>qui l'a déjà fait.</em>
        </h1>

        <p style={{ fontSize: 16, color: "rgba(253,252,248,.65)", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
          Des experts vérifiés disponibles en quelques minutes — par chat, vidéo ou document.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 320, margin: "0 auto 40px" }}>
          <button onClick={onStart} style={{ padding: "16px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.goldB})`, color: C.white, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: SERIF, boxShadow: `0 6px 24px ${C.gold}50` }}>
            Trouver mon expert →
          </button>
          <button onClick={onExplore} style={{ padding: "14px", borderRadius: 14, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.08)", color: "rgba(253,252,248,.8)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Explorer sans compte
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
          {STATS.map(s => (
            <div key={s.n} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.white, fontFamily: SERIF }}>{s.n}</div>
              <div style={{ fontSize: 10, color: "rgba(253,252,248,.45)", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Comment ça marche ── */}
      <div style={{ padding: "48px 24px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Comment ça marche</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: SERIF, color: C.ink, margin: 0 }}>Simple comme bonjour</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {HOW.map((h, i) => (
            <div key={i} style={{ background: C.white, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 16, boxShadow: `0 2px 8px ${C.sh}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: C.goldL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{h.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 4, fontFamily: SERIF }}>{h.t}</div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{h.s}</div>
              </div>
              <div style={{ marginLeft: "auto", flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: C.ink, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Experts à la une ── */}
      <div style={{ padding: "0 24px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Nos experts</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: SERIF, color: C.ink, margin: 0 }}>Des vrais experts,<br />pas des bots</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {featured.map(e => (
            <div key={e.id} onClick={onExplore} style={{ background: C.white, borderRadius: 16, padding: "16px", border: `1px solid ${C.border}`, cursor: "pointer", boxShadow: `0 2px 8px ${C.sh}`, transition: "box-shadow .15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: e.bg, color: e.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, flexShrink: 0, border: `2px solid ${e.color}25`, fontFamily: SERIF }}>{e.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, fontFamily: SERIF, marginBottom: 2 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.role.split("·")[0].trim()}</div>
                  <div style={{ display: "flex", gap: 1, marginTop: 4 }}>
                    {[1,2,3,4,5].map(s => <svg key={s} width={9} height={9} viewBox="0 0 12 12" fill={C.gold}><path d="M6 1l1.5 3H11l-2.5 2 1 3L6 7.5 2.5 9l1-3L1 4h3.5z"/></svg>)}
                    <span style={{ fontSize: 10, color: C.muted, marginLeft: 4 }}>5.0</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.ink, fontFamily: SERIF }}>{e.offres?.length ? `dès ${Math.min(...e.offres.map(o=>o.price))}€` : "Disponible"}</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>par session</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: C.soft, lineHeight: 1.5, fontStyle: "italic", borderTop: `1px solid ${C.borderF}`, paddingTop: 10 }}>
                "{e.tagline?.slice(0, 90)}{e.tagline?.length > 90 ? "…" : ""}"
              </div>
            </div>
          ))}
        </div>
        <button onClick={onExplore} style={{ width: "100%", marginTop: 16, padding: "14px", borderRadius: 14, border: `1.5px solid ${C.border}`, background: "transparent", color: C.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Voir tous les experts →
        </button>
      </div>

      {/* ── Use cases ── */}
      <div style={{ background: C.cream2, padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Exemples</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: SERIF, color: C.ink, margin: 0 }}>Pour quoi peut-on t'aider ?</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {USECASES.map((u, i) => (
            <div key={i} onClick={onStart} style={{ background: C.white, borderRadius: 13, padding: "14px 12px", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{u.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>{u.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Deviens expert ── */}
      <div style={{ padding: "48px 24px", background: C.white }}>
        <div style={{ background: `linear-gradient(135deg, ${C.ink}, #2C2825)`, borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: SERIF, color: C.white, margin: "0 0 10px" }}>Tu es expert dans ton domaine ?</h2>
          <p style={{ fontSize: 14, color: "rgba(253,252,248,.65)", lineHeight: 1.6, margin: "0 0 24px" }}>
            Monétise ton expérience. Réponds aux questions de clients qui ont besoin de toi — à ton rythme.
          </p>
          <button onClick={onExpert} style={{ padding: "14px 28px", borderRadius: 13, border: "none", background: `linear-gradient(135deg, ${C.gold}, ${C.goldB})`, color: C.white, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: SERIF, boxShadow: `0 4px 16px ${C.gold}40` }}>
            Rejoindre comme expert →
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: "24px", background: C.ink, textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 900, fontFamily: SERIF, color: C.white, marginBottom: 8 }}>
          sav<em style={{ color: C.goldB, fontStyle: "italic" }}>vy</em>
        </div>
        <div style={{ fontSize: 11, color: "rgba(253,252,248,.4)", lineHeight: 1.8 }}>
          © 2026 Savvy · France<br />
          contact@getsavvy.fr
        </div>
      </div>

    </div>
  );
}

export default LandingScreen;
