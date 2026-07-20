-- Le statut de paiement ne s'écrit que côté serveur.
--
-- L'application marquait `paid = true` depuis le navigateur au retour de
-- Stripe, en se fiant à l'URL ?payment=success&booking=<id>. Cette URL est
-- publique : la visiter suffisait à marquer n'importe quelle réservation
-- comme payée sans qu'aucun paiement n'ait eu lieu — d'où des revenus
-- affichés à un conseiller pour une session jamais réglée.
--
-- Retirer le code ne suffit pas : n'importe qui peut appeler l'API REST
-- directement avec son propre jeton. La barrière doit être en base.
-- Seul le webhook Stripe (service_role) écrit ces colonnes.

revoke update (paid, stripe_session_id, expert_amount, stripe_transfer_id)
  on bookings from authenticated;

-- refund_status reste écrit par le client (demande de remboursement) et par
-- l'admin (traitement) — il ne déplace pas d'argent par lui-même.

comment on column bookings.paid is
  'Écrit uniquement par le webhook Stripe (service_role). Jamais par le client.';
