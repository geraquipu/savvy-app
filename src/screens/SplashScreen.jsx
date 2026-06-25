import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';
import { C, SERIF } from '../constants/colors';
import { DEMO_USERS } from '../constants/data';

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

export default SplashScreen;
