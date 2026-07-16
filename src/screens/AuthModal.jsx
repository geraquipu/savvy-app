import React, { useState, useRef } from 'react';
import { supabase } from '../supabase';
import { C, SERIF } from '../constants/colors';
import { DEMO_USERS } from '../constants/data';

function AuthModal({ onClose, onSuccess, initialRegister, isAdmin }) {
  const [step, setStep] = useState(initialRegister?"register_method":"choice");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [isRegister, setIsRegister] = useState(!!initialRegister);
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
      setLoading(true);
      try {
        if(initialRegister) localStorage.setItem("savvy_expert_intent","1");
        await supabase.auth.signInWithOAuth({
          provider,
          options: { redirectTo: window.location.origin }
        });
      } catch { setLoading(false); }
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
    if(step==="register_method"){setStep("choice");return;}
    if(step==="register_form"){setStep("register_method");return;}
    if(step==="register_sent"){setStep("choice");return;}
    if(step==="register"){setStep("choice");return;}
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
            <span style={{fontSize:20,fontWeight:900,fontFamily:SERIF,letterSpacing:"-1px"}}><span style={{color:C.white}}>sa</span><span style={{color:C.goldB,fontStyle:"italic"}}>vv</span><span style={{color:C.white}}>y</span></span>
          </div>
          <button onClick={onClose} style={{background:C.cream2,border:`1px solid ${C.border}`,borderRadius:9,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:C.muted}}>×</button>
        </div>

        {/* ── CHOICE (login only) ──────────────────────────────────────────── */}
        {step==="choice" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>Content de te revoir !</h2>
            <p style={{fontSize:13,color:C.muted,margin:0}}>Connecte-toi à ton compte Savvy</p>
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

          {/* Email login */}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Adresse email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="camille@exemple.com" type="email" style={inp2}
              onKeyDown={e=>e.key==="Enter"&&email.includes("@")&&setStep("email")}/>
          </div>
          <button onClick={()=>{if(!email.includes("@")){alert("Email invalide");return;}setIsRegister(false);setStep("email");}}
            style={{width:"100%",padding:"13px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:C.ink,color:C.white,fontFamily:SERIF,marginBottom:12}}>
            Se connecter →
          </button>
          <div style={{textAlign:"center",marginBottom:20,fontSize:12,color:C.muted}}>
            Pas encore de compte ?{" "}
            <button onClick={()=>{ setEmail(""); setPassword(""); setConfirmPassword(""); setFirstName(""); setLastName(""); setStep("register_method"); }} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:700,fontFamily:"inherit",fontSize:12}}>S'inscrire gratuitement</button>
          </div>

          {/* ── Mode démo — solo admin ────────────────────────────────── */}
          {isAdmin && <div style={{borderTop:`1px solid ${C.border}`,paddingTop:16}}>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:.6,textAlign:"center",marginBottom:12}}>
              ✦ Mode démo — tester l'app
            </div>
            <div style={{display:"flex",gap:9}}>
              {Object.values(DEMO_USERS).map(u => (
                <button key={u.email} onClick={()=>onSuccess({...u})}
                  style={{flex:1,padding:"12px 10px",borderRadius:14,border:`1.5px solid ${u.isExpert?C.goldB:C.navyL}`,background:u.isExpert?C.goldL:C.navyL,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:u.avatar_bg,color:u.avatar_color,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,margin:"0 auto 7px",border:`1.5px solid ${u.avatar_color}30`}}>{u.initials}</div>
                  <div style={{fontSize:12,fontWeight:700,color:C.ink,marginBottom:2}}>{u.name.split(" ")[0]}</div>
                  <div style={{fontSize:10,color:C.muted,lineHeight:1.3}}>{u.isExpert?"Expert ✦":"Client ✦"}</div>
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:C.faint,textAlign:"center",marginTop:10}}>
              Comptes de démonstration — aucun vrai compte créé
            </div>
          </div>}
        </>}

        {/* ── REGISTER METHOD ──────────────────────────────────────── */}
        {step==="register_method" && <>
          <div style={{textAlign:"center",marginBottom:24}}>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>Comment veux-tu créer ton compte ?</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
            <button onClick={()=>setStep("register_form")}
              style={{width:"100%",padding:"14px",borderRadius:13,border:`1.5px solid ${C.border}`,background:C.white,color:C.ink,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2}><rect x={2} y={4} width={20} height={16} rx={2}/><path d="m2 7 10 7 10-7"/></svg>
              Adresse email
            </button>
            <button onClick={()=>loginAs("google")}
              style={{width:"100%",padding:"14px",borderRadius:13,border:`1.5px solid ${C.border}`,background:C.white,color:C.ink,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <svg width={20} height={20} viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button onClick={()=>loginAs("apple")}
              style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:C.ink,color:C.white,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </button>
          </div>
          <div style={{textAlign:"center",fontSize:12,color:C.muted}}>
            Déjà un compte ?{" "}
            <button onClick={()=>setStep("choice")} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:700,fontFamily:"inherit",fontSize:12}}>Se connecter</button>
          </div>
        </>}

        {/* ── REGISTER FORM (prénom + nom + email → magic link) ─────── */}
        {step==="register_form" && <>
          <div style={{textAlign:"center",marginBottom:22}}>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>Tes informations</h2>
            <p style={{fontSize:13,color:C.muted,margin:0}}>On t'envoie un lien sécurisé pour confirmer</p>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:12}}>
            <div style={{flex:1}}>
              <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Prénom <span style={{color:"#DC2626"}}>*</span></label>
              <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Marie" type="text" style={inp2} autoFocus/>
            </div>
            <div style={{flex:1}}>
              <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Nom <span style={{color:"#DC2626"}}>*</span></label>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Dupont" type="text" style={inp2}/>
            </div>
          </div>
          <div style={{marginBottom:18}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Adresse email <span style={{color:"#DC2626"}}>*</span></label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="marie@exemple.com" type="email" style={inp2}/>
            <p style={{fontSize:11,color:C.faint,margin:"6px 0 0",lineHeight:1.5}}>On t'enverra un lien sécurisé pour continuer.</p>
          </div>
          <button onClick={async()=>{
            if(!firstName.trim()){alert("Entre ton prénom.");return;}
            if(!lastName.trim()){alert("Entre ton nom.");return;}
            if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){alert("Entre une adresse email valide.\nExemple : marie@gmail.com");return;}
            setLoading(true);
            try {
              const { error } = await supabase.auth.signInWithOtp({ email, options:{ data:{ first_name:firstName.trim(), last_name:lastName.trim(), name:firstName.trim()+" "+lastName.trim() }, shouldCreateUser:true } });
              setLoading(false);
              if(error){ alert("Erreur : "+error.message); return; }
              setStep("register_sent");
            } catch(err){ setLoading(false); alert("Connexion impossible. Vérifie ta connexion internet."); }
          }} disabled={loading||!firstName.trim()||!lastName.trim()||!email.includes("@")}
            style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:(loading||!firstName.trim()||!lastName.trim()||!email.includes("@"))?"default":"pointer",fontWeight:700,fontSize:14,background:(loading||!firstName.trim()||!lastName.trim()||!email.includes("@"))?C.cream3:C.ink,color:(loading||!firstName.trim()||!lastName.trim()||!email.includes("@"))?C.muted:C.white,fontFamily:SERIF,marginBottom:12,transition:"background .2s"}}>
            {loading?"⏳ Envoi en cours…":"Envoyer le lien →"}
          </button>
          <p style={{textAlign:"center",fontSize:11,color:C.faint,margin:0,lineHeight:1.6}}>
            En continuant, tu acceptes nos <span style={{color:C.gold,fontWeight:600}}>Conditions d'utilisation</span> et notre <span style={{color:C.gold,fontWeight:600}}>Politique de confidentialité</span>.
          </p>
        </>}

        {/* ── REGISTER SENT (confirmation lien envoyé) ──────────────── */}
        {step==="register_sent" && <>
          <div style={{textAlign:"center",padding:"10px 0 24px"}}>
            <div style={{width:64,height:64,borderRadius:20,background:C.goldL,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",border:`1px solid ${C.goldB}30`}}>
              <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth={1.8}><rect x={2} y={4} width={20} height={16} rx={2}/><path d="m2 7 10 7 10-7"/></svg>
            </div>
            <h2 style={{fontSize:22,fontWeight:700,color:C.ink,margin:"0 0 10px",fontFamily:SERIF}}>Vérifie ta boîte mail</h2>
            <p style={{fontSize:14,color:C.muted,margin:"0 0 6px",lineHeight:1.6}}>
              On a envoyé un lien à
            </p>
            <p style={{fontSize:14,fontWeight:700,color:C.ink,margin:"0 0 18px"}}>{email}</p>
            <p style={{fontSize:13,color:C.muted,margin:"0 0 24px",lineHeight:1.6}}>
              Clique sur le lien dans l'email pour activer ton compte. Pense à vérifier tes spams si tu ne vois rien.
            </p>
            <button onClick={onClose} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,background:C.ink,color:C.white,fontFamily:SERIF,marginBottom:12}}>
              J'ai compris ✓
            </button>
            <button onClick={async()=>{
              setLoading(true);
              await supabase.auth.signInWithOtp({ email, options:{ data:{ first_name:firstName, last_name:lastName, name:firstName+" "+lastName }, shouldCreateUser:true } });
              setLoading(false);
              alert("Lien renvoyé à "+email+" !");
            }} style={{background:"none",border:"none",cursor:"pointer",color:C.gold,fontWeight:600,fontFamily:"inherit",fontSize:13}}>
              {loading?"Envoi…":"Renvoyer le lien"}
            </button>
          </div>
        </>}

        {/* ── EMAIL + PASSWORD (login) ────────────────────────────── */}
        {step==="email" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 6px",fontFamily:SERIF}}>{isRegister?"Créer mon compte":"Content de te revoir"}</h2>
            <p style={{fontSize:13,color:C.muted,margin:0}}>{email}</p>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:4,display:"block",textTransform:"uppercase",letterSpacing:.5}}>{isRegister?"Choisis ton mot de passe":"Mot de passe"}</label>
            {isRegister && <p style={{fontSize:11,color:C.muted,margin:"0 0 8px",lineHeight:1.5}}>Min. 8 caractères, 1 chiffre et 1 caractère spécial (!@#$…)</p>}
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
          <button onClick={async ()=>{
            if(!password){alert("Entre ton mot de passe.");return;}
            if(isRegister&&password!==confirmPassword){alert("Les mots de passe ne correspondent pas.");return;}
            if(isRegister&&password.length<8){alert("Mot de passe : minimum 8 caractères.");return;}
            if(isRegister&&!/[0-9]/.test(password)){alert("Mot de passe : ajoute au moins un chiffre.");return;}
            if(isRegister&&!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)){alert("Mot de passe : ajoute au moins un caractère spécial (!@#$…).");return;}
            setLoading(true);
            try {
              const { data, error } = isRegister
                ? await supabase.auth.signUp({ email, password, options:{ data:{ name: email.split("@")[0] } } })
                : await supabase.auth.signInWithPassword({ email, password });
              setLoading(false);
              if (error) {
                const msgs = {
                  "Invalid login credentials":"Email ou mot de passe incorrect.",
                  "User already registered":"Un compte existe déjà avec cet email. Connecte-toi.",
                  "Email not confirmed":"Confirme ton email avant de te connecter (vérifie ta boîte mail).",
                };
                alert(msgs[error.message] || "Erreur : "+error.message);
                return;
              }
              const u = data.user;
              onSuccess({ email:u.email, name:u.user_metadata?.name || u.email.split("@")[0], isExpert:false, real:true });
            } catch(err) {
              setLoading(false);
              alert("Connexion impossible. Vérifie ta connexion internet.");
            }
          }} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:loading?"wait":"pointer",fontWeight:700,fontSize:14,background:loading?C.cream3:C.ink,color:loading?C.muted:C.white,fontFamily:SERIF}}>
            {loading?"⏳ Un instant…":(isRegister?"Créer mon compte →":"Se connecter →")}
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
          <p style={{textAlign:"center",fontSize:11,color:C.faint,marginTop:12}}>Pour la démo : n'importe quel code à 6 chiffres.</p>
        </>}

        {/* ── RESET ──────────────────────────────────────────────────── */}
        {step==="reset" && <>
          <div style={{textAlign:"center",marginBottom:20}}>
            <h2 style={{fontSize:20,fontWeight:700,color:C.ink,margin:"0 0 8px",fontFamily:SERIF}}>Mot de passe oublié</h2>
            <p style={{fontSize:13,color:C.muted,lineHeight:1.6}}>On t'envoie un lien pour réinitialiser.</p>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:600,color:C.muted,marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:.5}}>Ton email</label>
            <input value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="camille@exemple.com" type="email" style={inp2} autoFocus/>
          </div>
          <button onClick={async ()=>{if(!resetEmail.includes("@")){alert("Email invalide");return;} await supabase.auth.resetPasswordForEmail(resetEmail); setStep("reset_sent");}}
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

export default AuthModal;
