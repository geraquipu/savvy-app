-- Nature de l'offre réservée, conservée sur la réservation.
--
-- Une offre peut être une session (un rendez-vous) ou un parcours (plusieurs
-- rendez-vous, un résultat livré, facturé à trois chiffres). Jusqu'ici la
-- réservation ne gardait que le nom et le prix : un parcours à 350 € arrivait
-- chez le conseiller comme une session ordinaire, et release-payouts n'avait
-- aucun moyen de savoir qu'il ne devait pas verser la totalité 48 h après le
-- premier rendez-vous.
--
-- On stocke donc le type dès la demande. Le versement échelonné d'un parcours
-- reste une décision à part (modèle 50/50 ou libération en fin de parcours) —
-- ces colonnes lui donnent les données nécessaires, sans la trancher ici.

alter table bookings add column if not exists phase_kind     text default 'session';
alter table bookings add column if not exists phase_sessions integer;   -- nb de RDV inclus (parcours)
alter table bookings add column if not exists phase_weeks    integer;   -- durée en semaines (parcours)
alter table bookings add column if not exists phase_outcome  text;      -- la promesse affichée au client

comment on column bookings.phase_kind is
  'session | parcours. Un parcours engage le conseiller sur plusieurs rendez-vous.';
comment on column bookings.phase_sessions is
  'Nombre de rendez-vous inclus dans un parcours (null pour une session).';
comment on column bookings.phase_weeks is
  'Durée d''un parcours en semaines (null pour une session).';
comment on column bookings.phase_outcome is
  'Résultat promis, tel qu''affiché au client au moment de la réservation.';

-- Écrites par le client au moment de la demande, comme phase_name / phase_price.
-- Elles décrivent l'offre choisie, pas un état sensible : mêmes droits que les
-- autres colonnes de description déjà accordées à authenticated (migration 011).
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name) into cols
  from information_schema.columns
  where table_schema='public' and table_name='bookings'
    and column_name not in ('paid','stripe_session_id','expert_amount','stripe_transfer_id',
                            'payout_status','payout_at','pay_deadline','pay_reminded_at');
  execute 'revoke update on public.bookings from authenticated';
  execute format('grant update (%s) on public.bookings to authenticated', cols);
end $$;
