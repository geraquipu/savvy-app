import React from 'react';
import { C, SERIF } from '../../constants/colors';

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

export default ExpertCard;
