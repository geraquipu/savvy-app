import { C, SERIF } from "../../constants/colors";

function LoginGate({ icon, title, sub, onLogin }) {
  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px", background:C.cream, textAlign:"center" }}>
      <div style={{ width:80, height:80, borderRadius:"50%", background:C.cream2, border:`1.5px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, marginBottom:20 }}>
        {icon}
      </div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.ink, margin:"0 0 10px", fontFamily:SERIF, letterSpacing:"-.3px" }}>{title}</h2>
      <p style={{ fontSize:14, color:C.muted, lineHeight:1.7, margin:"0 0 28px", maxWidth:260 }}>{sub}</p>
      <button onClick={onLogin} style={{ width:"100%", maxWidth:280, padding:"14px", borderRadius:13, border:"none", cursor:"pointer", fontWeight:700, fontSize:15, background:C.ink, color:C.white, fontFamily:SERIF, marginBottom:12 }}>
        Se connecter →
      </button>
      <button onClick={onLogin} style={{ width:"100%", maxWidth:280, padding:"13px", borderRadius:13, border:`1.5px solid ${C.border}`, cursor:"pointer", fontWeight:600, fontSize:14, background:C.white, color:C.ink, fontFamily:"inherit" }}>
        Créer un compte gratuitement
      </button>
      <p style={{ fontSize:11, color:C.faint, marginTop:16, lineHeight:1.6 }}>
        Tu peux explorer les experts et les profils sans te connecter.
      </p>
    </div>
  );
}

export default LoginGate;
