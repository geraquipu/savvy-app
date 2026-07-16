/**
 * Comptes autorisés à voir l'interface d'administration.
 *
 * SÉCURITÉ — deux règles :
 *
 * 1. N'inscrire ici qu'une adresse sur un domaine que Savvy contrôle
 *    réellement. Une adresse sur un domaine tiers (ou non enregistré) est une
 *    porte d'entrée : qui obtient le domaine obtient la boîte, donc l'admin.
 *
 * 2. Cette liste ne protège que l'affichage. La vraie barrière est côté
 *    serveur — RLS et la variable ADMIN_EMAIL des edge functions
 *    (refund-booking notamment). Ajouter quelqu'un ici ne lui donne aucun
 *    accès aux données : les deux doivent être alignés.
 */
export const ADMIN_EMAILS = ["geraquipu@hotmail.com"];

export const isAdmin = (email) => !!email && ADMIN_EMAILS.includes(email);
