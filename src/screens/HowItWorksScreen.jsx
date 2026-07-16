import React from 'react';
import { C, SERIF } from '../constants/colors';

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
            De la recherche d'un expert jusqu\'au conseil reçu — en 4 étapes simples.
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

export default HowItWorksScreen;
