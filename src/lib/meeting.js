import { supabase } from "../supabase";
import { openMeetingRoom, meetingUrl } from "../constants/config";

/**
 * Ouvre la salle d'une session.
 *
 * L'adresse est demandée au serveur, qui signe un jeton d'accès : personne
 * n'a besoin de se connecter à Google pour créer la salle, et le conseiller
 * y entre en modérateur. Avant, le premier arrivé — souvent le client, qui
 * venait de payer — tombait sur « aucun modérateur n'est encore arrivé ».
 *
 * Le navigateur n'autorise `window.open` que pendant le clic lui-même. Comme
 * il faut d'abord demander le jeton au serveur, l'ouverture arriverait trop
 * tard et serait bloquée. On ouvre donc l'onglet tout de suite, vide, et on
 * y charge la salle dès que le jeton arrive.
 *
 * Si le serveur ne répond pas, on ouvre la salle publique plutôt que de
 * laisser le bouton sans effet : une salle imparfaite vaut mieux qu'un
 * rendez-vous manqué.
 *
 * @returns {Promise<{ok: boolean, code?: string, error?: string}>}
 */
export async function openSessionRoom(booking, { customLink = null } = {}) {
  if (customLink) {
    openMeetingRoom(customLink);
    return { ok: true };
  }

  // Comptes de démonstration : aucune réservation réelle derrière, le
  // serveur n'a rien à signer. `id` seul ne suffit pas à distinguer les deux
  // (les sessions de démo en ont un, qui n'existe pas en base).
  if (!booking?._fromSB) {
    openMeetingRoom(meetingUrl(booking?.id));
    return { ok: true };
  }

  // Ouvert pendant le clic — sinon le navigateur le bloque.
  //
  // Sans l'option `noopener` : avec elle, window.open ouvre bien l'onglet mais
  // renvoie toujours `null`. On n'avait donc aucune prise dessus, et l'onglet
  // restait sur about:blank pendant que la salle se chargeait par-dessus
  // Savvy dans l'onglet d'origine. On coupe `opener` à la main juste après,
  // ce qui donne la même protection.
  let win = null;
  try {
    win = window.open("", "_blank");
    if (win) win.opener = null;
  } catch { win = null; }

  const go = (url) => {
    if (win && !win.closed) win.location.replace(url);
    else window.location.href = url;   // popup refusée : on navigue sur place
  };
  const giveUp = () => { try { if (win && !win.closed) win.close(); } catch { /* déjà fermée */ } };

  try {
    const { data, error } = await supabase.functions.invoke("meeting-token", {
      body: { bookingId: booking.id },
    });

    if (data?.url) {
      // Trace de diagnostic : « jaas » = salle privée Savvy, « public » =
      // repli sur meet.jit.si (il manque un secret côté serveur).
      console.info(`[salle] ${data.provider || "?"}${data.moderator ? " · modérateur" : ""}`);
      go(data.url);
      return { ok: true };
    }

    // Refus explicite du serveur (non payée, hors fenêtre) : on ne contourne
    // pas la règle en ouvrant quand même la salle publique.
    const code = data?.code || null;
    if (code && ["unpaid", "not_confirmed", "too_early", "too_late"].includes(code)) {
      giveUp();
      return { ok: false, code, error: data?.error || null };
    }

    console.warn("[meeting-token]", data?.error || error?.message || "réponse sans url");
  } catch (e) {
    console.warn("[meeting-token] exception", e?.message || e);
  }

  go(meetingUrl(booking.id));
  return { ok: true, code: "fallback" };
}
