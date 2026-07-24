import { createPortal } from 'react-dom';
import { C, SERIF } from '../constants/colors';

/**
 * Écran d'attente pendant l'ouverture de la salle.
 *
 * Le bouton « Rejoindre » demande d'abord un jeton au serveur : entre le clic
 * et l'ouverture de l'onglet, il ne se passait rien à l'écran. Une seconde de
 * silence au moment d'entrer en session, c'est exactement le moment où on
 * reclique en pensant que ça n'a pas marché.
 *
 * Le passage vers la visio reste ainsi à l'intérieur de Savvy.
 *
 * Rendu dans <body> : l'app vit dans un conteneur avec `transform`, qui
 * devient le repère des éléments `position:fixed`. Le voile s'affichait bien,
 * mais la carte se centrait dans ce conteneur — souvent hors de l'écran. Le
 * client voyait la page grisée sans le message.
 */
export default function JoiningOverlay({ withName = null }) {
  return createPortal(
    <div style={{ position:"fixed", inset:0, background:"rgba(28,31,23,0.72)", zIndex:9500,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:C.white, borderRadius:20, padding:"30px 26px", maxWidth:330, width:"100%",
                    textAlign:"center", boxShadow:"0 12px 40px rgba(0,0,0,.25)" }}>
        <div style={{ width:52, height:52, margin:"0 auto 16px", borderRadius:"50%",
                      border:`3px solid ${C.cream3}`, borderTopColor:C.sage,
                      animation:"spin .9s linear infinite" }}/>
        <div style={{ fontSize:16, fontWeight:700, color:C.ink, fontFamily:SERIF, marginBottom:7 }}>
          Connexion à votre session…
        </div>
        <div style={{ fontSize:12.5, color:C.muted, lineHeight:1.6 }}>
          Nous préparons votre salle vidéo.
          {withName ? ` ${withName} vous y rejoint.` : ""}
        </div>
      </div>
    </div>,
    document.body,
  );
}
