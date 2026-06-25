import { C, SERIF, SANS } from "../../constants/colors";

function Av({ e, size=44 }) {
  const r = Math.round(size * .28);
  return <div style={{ width:size, height:size, borderRadius:r, background:e.bg||C.goldL, color:e.color||C.gold, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:Math.round(size*.34), flexShrink:0, fontFamily:SANS, letterSpacing:"-.5px" }}>{e.initials}</div>;
}

export default Av;
