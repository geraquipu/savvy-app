import React, { useEffect, useState } from 'react';
import { C, SERIF } from '../constants/colors';

function AppLoader({ onDone, authReady }) {
  const [phase, setPhase] = useState(0);
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setAnimDone(true), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (animDone && authReady) onDone();
  }, [animDone, authReady]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: C.ink,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column",
      transition: "opacity .5s ease",
      opacity: phase === 2 ? 0 : 1,
    }}>
      {/* Logo animado */}
      <div style={{
        transition: "opacity .6s ease, transform .6s cubic-bezier(.34,1.56,.64,1)",
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "scale(1)" : "scale(.85)",
      }}>
        <div style={{ fontSize: 52, fontWeight: 900, fontFamily: SERIF, letterSpacing: "-2.5px", lineHeight: 1 }}>
          <span style={{ color: C.white }}>sav</span>
          <em style={{ color: C.goldB, fontStyle: "italic" }}>vy</em>
        </div>
      </div>

      {/* Tagline */}
      <div style={{
        marginTop: 14,
        fontSize: 13,
        color: "rgba(253,252,248,.45)",
        fontFamily: SERIF,
        letterSpacing: ".5px",
        transition: "opacity .6s ease .3s",
        opacity: phase >= 1 ? 1 : 0,
      }}>
        Parlez avec quelqu'un qui l'a déjà fait.
      </div>

      {/* Dot pulsante */}
      <div style={{
        position: "absolute",
        bottom: 60,
        width: 6, height: 6,
        borderRadius: "50%",
        background: C.goldB,
        animation: "pulse 1.2s ease-in-out infinite",
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity .4s ease .5s",
      }}/>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: .3; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

export default AppLoader;
