import { C } from "../../constants/colors";

function Stars({ n, count }) {
  return <div style={{ display:"flex", alignItems:"center", gap:4 }}>
    <span style={{ fontSize:12, fontWeight:700, color:"#D97706" }}>★ {n}</span>
    {count !== undefined && <span style={{ fontSize:11, color:C.faint }}>· {count} avis</span>}
  </div>;
}

export default Stars;
