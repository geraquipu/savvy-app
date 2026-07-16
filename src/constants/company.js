/**
 * Source unique de vérité pour les informations légales et de contact.
 *
 * RÈGLE : ne jamais publier ici une donnée qui n'est pas vraie.
 * Des mentions légales fausses (SIRET, adresse, capital inventés) exposent
 * bien plus qu'une mention manquante — art. 6 LCEN. Tant qu'une information
 * n'est pas officielle, on l'annonce comme "en cours" plutôt que de l'inventer.
 */

// Domaine réellement détenu. NE PAS écrire "savvy.fr" : ce n'est pas le nôtre.
export const DOMAIN = "getsavvy.fr";
export const SITE_URL = `https://${DOMAIN}`;

export const EMAIL_CONTACT = `contact@${DOMAIN}`;
export const EMAIL_PRIVACY = `privacy@${DOMAIN}`;   // contact RGPD — doit rester joignable
export const EMAIL_NOTIF   = `notifications@${DOMAIN}`;

export const COMPANY_NAME = "Savvy SAS";
export const COMPANY_CITY = "Paris, France";
export const PUBLICATION_DIRECTOR = "German Quintana";

/**
 * Immatriculation : passer REGISTERED à true et renseigner SIRET / ADDRESS /
 * CAPITAL uniquement avec les valeurs officielles du Kbis. Tant que c'est
 * false, l'app affiche "immatriculation en cours" partout.
 */
export const REGISTERED = false;
export const SIRET = null;
export const ADDRESS = null;
export const CAPITAL = null;

/** Ligne d'identification affichée dans les pieds de page et mentions légales. */
export const legalLine = () =>
  REGISTERED
    ? `${COMPANY_NAME} · ${ADDRESS} · SIRET ${SIRET}`
    : `${COMPANY_NAME} (en cours d'immatriculation) · ${COMPANY_CITY}`;

/** Version courte pour les pieds de page discrets. */
export const legalShort = () =>
  REGISTERED ? `${COMPANY_NAME} · SIRET ${SIRET}` : `${COMPANY_NAME} · immatriculation en cours`;
