import React, { useState } from 'react';
import { C, SERIF, SANS } from '../../constants/colors';
import { EXPERTS, getBookings, getTrustLevel } from '../../constants/data';
import { SESSIONS_AVENIR, SESSIONS_PASSEES } from '../../constants/sessionData';
import { MENU_ICONS } from '../../constants/menuIcons.jsx';
import { legalLine, legalShort, EMAIL_CONTACT, DOMAIN, SITE_URL } from '../../constants/company';

const AVIS_DONNES = [
  { id:1, eid:1, date:"15 mai 2025", stars:5, text:"Marie est extraordinaire — pédagogue, patiente et très pro. Mes macarons sont enfin réussis !" },
  { id:2, eid:4, date:"8 mai 2025",  stars:5, text:"Lucas connaît chaque détail de la douane colombienne. Rapport livré en 24h, impeccable." },
];

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

const generateFacturesPDF = (userName, isExpert) => {
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
      + `<div class="footer">${legalLine()} &middot; ${EMAIL_CONTACT} &middot; &copy; 2025</div>`
      + '<div class="noprint" style="margin-top:24px;text-align:center">'
      + '<button onclick="window.print()" style="background:#1C1917;color:#fff;border:none;padding:11px 24px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer">'
      + 'Enregistrer en PDF</button></div>'
      + '</body></html>';
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
  };
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

export function ClientView({
  USER, authUser, isExpert,
  onNavigate, onSignup, onBecomeExpert, onLogout,
  photoUrl, photoInputRef,
  setCancelModal,
  openSection, setOpenSection,
  helpMsgSent, setHelpMsgSent, helpMsgText, setHelpMsgText,
  convoOpen, setConvoOpen,
  editingInfo, setEditingInfo, editInfoVal, setEditInfoVal, editInfoSaved, setEditInfoSaved,
  userEmail, setUserEmail,
  setShowPwdModal, setShowDeleteModal,
  clientSection, setClientSection, clientSubSection, setClientSubSection,
  clientSessionFilter, setClientSessionFilter,
  clientPayFilter, setClientPayFilter,
  clientCercleTab, setClientCercleTab,
  clientShowReferModal, setClientShowReferModal,
  clientNotifToggles, setClientNotifToggles,
  clientSearchPay, setClientSearchPay,
  clientMoisFilter, setClientMoisFilter,
  dbExperts,
  setUserName,
}) {
    const section = clientSection; const setSection = setClientSection;
    const subSection = clientSubSection; const setSubSection = setClientSubSection;
    // États remontés au niveau composant (règles des hooks) — étaient déclarés
    // dans des blocs conditionnels (avis, modal parrainage) → crash #310.
    const [avisNote, setAvisNote] = useState(0);
    const [avisTxt, setAvisTxt] = useState("");
    const [avisSent, setAvisSent] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
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
                  <div style={{fontSize:10,color:"rgba(253,252,248,.5)",marginTop:3}}>{DOMAIN}</div>
                  <div style={{fontSize:10,color:"rgba(253,252,248,.4)",marginTop:1}}>{legalShort()}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:"rgba(253,252,248,.5)"}}>Paris, France</div>
                  <div style={{fontSize:10,color:"rgba(253,252,248,.5)"}}>{EMAIL_CONTACT}</div>
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
            <div style={{fontSize:11,color:C.muted,lineHeight:1.7}}>{legalLine()}<br/>{EMAIL_CONTACT} · {DOMAIN}</div>
            <div style={{fontSize:10,color:C.faint,marginTop:10}}>2026 Savvy TM All rights reserved<br/>Donnees protegees conformement au RGPD</div>
          </div>
        </div>
      );

      if (subSection === "avis") return (()=>{
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
            <div style={{display:"flex",gap:8}}>
              {[
                {icon:"🔍", t:"Explorer", nav:"search"},
                {icon:"📅", t:"Réservations", nav:"reservations"},
                {icon:"💬", t:"Messages", nav:"messages"},
              ].map(s=>(
                <div key={s.t} onClick={()=>{ if(s.nav==="expert"){onBecomeExpert&&onBecomeExpert();onSignup&&onSignup();}else{onNavigate&&onNavigate(s.nav);}}}
                  style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"12px 8px",background:"rgba(253,252,248,.08)",borderRadius:12,cursor:"pointer",border:"1px solid rgba(253,252,248,.12)",textAlign:"center"}}>
                  <span style={{fontSize:20}}>{s.icon}</span>
                  <span style={{fontSize:11,fontWeight:700,color:C.white,lineHeight:1.3}}>{s.t}</span>
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
              <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:SERIF}}>Ton expérience peut changer la vie de quelqu'un.</div>
              <div style={{fontSize:11,color:"rgba(253,252,248,.6)",marginTop:1}}>Devenir conseiller · Gagne jusqu'à 80%</div>
            </div>
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={C.goldB} strokeWidth={2.5}><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        )}
      </div>

      {/* ── Partager Savvy modal (client) ── */}
      {showReferModal && (()=>{
        const INVITE_URL = `${SITE_URL}/invite`;
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
}
