-- Suivi du reversement au Conseiller.
--
-- Le paiement est désormais encaissé sur le compte Savvy et transféré au
-- Conseiller après la session (voir create-checkout-session). Il faut donc
-- savoir où en est chaque réservation.

alter table bookings add column if not exists payout_status text not null default 'pending';
alter table bookings add column if not exists payout_at timestamptz;

comment on column bookings.payout_status is
  'pending = encaissé, pas encore reversé · done = transféré au Conseiller · skipped = remboursé, aucun transfert';

-- Écrit uniquement par release-payouts / refund-booking (service_role).
revoke update on bookings from authenticated;
do $$
declare cols text;
begin
  select string_agg(quote_ident(column_name), ', ' order by column_name) into cols
  from information_schema.columns
  where table_schema='public' and table_name='bookings'
    and column_name not in ('paid','stripe_session_id','expert_amount','stripe_transfer_id','payout_status','payout_at');
  execute format('grant update (%s) on public.bookings to authenticated', cols);
end $$;

create index if not exists bookings_payout_pending_idx
  on bookings (payout_status, date_session) where paid = true;
