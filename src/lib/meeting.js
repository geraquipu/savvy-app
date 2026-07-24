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

  // Comptes de démonstration : aucune réservation réelle derrière.
  if (!booking?._fromSB && !booking?.id) {
    openMeetingRoom(meetingUrl(booking?.id));
    return { ok: true };
  }

  try {
    const { data, error } = await supabase.functions.invoke("meeting-token", {
      body: { bookingId: booking.id },
    });

    if (data?.url) {
      openMeetingRoom(data.url);
      return { ok: true };
    }

    // Refus explicite du serveur (non payée, hors fenêtre) : on ne contourne
    // pas la règle en ouvrant quand même la salle publique.
    const code = data?.code || null;
    if (code && ["unpaid", "not_confirmed", "too_early", "too_late"].includes(code)) {
      return { ok: false, code, error: data?.error || null };
    }

    console.warn("[meeting-token]", data?.error || error?.message || "réponse sans url");
  } catch (e) {
    console.warn("[meeting-token] exception", e?.message || e);
  }

  openMeetingRoom(meetingUrl(booking.id));
  return { ok: true, code: "fallback" };
}
