-- Stripe Connect : le paiement est réparti par Stripe au moment de l'encaissement.
-- Le client paie 100 %, Stripe verse 80 % au compte du Conseiller et laisse 20 %
-- (application fee) à Savvy. La part du Conseiller ne transite jamais par le
-- compte de Savvy : c'est ce qui rend le chiffre d'affaires égal à la commission.

alter table experts add column if not exists stripe_account_id  text;
alter table experts add column if not exists stripe_charges_enabled boolean not null default false;
alter table experts add column if not exists stripe_payouts_enabled boolean not null default false;

create unique index if not exists experts_stripe_account_id_key
  on experts (stripe_account_id) where stripe_account_id is not null;

comment on column experts.stripe_account_id is
  'Compte Stripe Express du Conseiller (acct_…). Créé par la fonction connect-onboard.';
comment on column experts.stripe_charges_enabled is
  'Stripe autorise l''encaissement vers ce compte. Tant que false, aucune réservation ne peut être payée.';

-- L'expert lit son propre statut ; il ne doit jamais pouvoir l'écrire lui-même
-- (seule la fonction connect-onboard, en service_role, le met à jour d'après Stripe).
revoke update (stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled)
  on experts from authenticated;

-- Suivi du reversement, pour rapprocher avec Stripe en cas de litige.
alter table bookings add column if not exists stripe_transfer_id text;
alter table bookings add column if not exists expert_amount integer;

comment on column bookings.expert_amount is
  'Part du Conseiller en centimes, telle qu''envoyée à Stripe. Fige le calcul au moment du paiement.';
