-- Délai de paiement : une réservation acceptée mais jamais réglée finit par
-- libérer le créneau.
--
-- Aujourd'hui, une réservation confirmée non payée bloque le créneau du
-- Conseiller exactement comme une réservation payée, et personne n'est
-- prévenu entre l'acceptation et l'heure de la session. Un client peut
-- réserver cinq créneaux, n'en payer aucun, et remplir l'agenda de vide.
--
-- Nouvelle règle : le client a 24 h pour payer, et de toute façon jusqu'à
-- 2 h avant la session. Passé ce délai, la réservation est annulée et le
-- créneau redevient disponible.

alter table bookings add column if not exists pay_deadline timestamptz;
alter table bookings add column if not exists pay_reminded_at timestamptz;

comment on column bookings.pay_deadline is
  'Échéance de paiement, posée à l''acceptation par le conseiller. Passée cette date sans paiement, expire-unpaid annule la réservation.';
comment on column bookings.pay_reminded_at is
  'Date du rappel de paiement envoyé au client. Évite les rappels en double.';

-- Écrites par le serveur uniquement (accept, rappel, expiration).
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

create index if not exists bookings_pay_deadline_idx
  on bookings (pay_deadline) where paid = false and status = 'confirmed';

-- ── Réservations déjà confirmées et non payées ──
-- Elles n'ont pas d'échéance : on leur en donne une, sinon elles resteraient
-- indéfiniment à bloquer des créneaux. Celles dont la session est déjà passée
-- sont expirées tout de suite.
update bookings
set pay_deadline = least(now() + interval '24 hours', date_session - interval '2 hours')
where status = 'confirmed' and paid = false and pay_deadline is null and date_session > now();

update bookings
set status = 'cancelled', cancel_reason = 'Paiement non finalisé', cancelled_by = 'system'
where status = 'confirmed' and paid = false and date_session <= now();

-- ── L'échéance se pose toute seule à l'acceptation ──
--
-- Plutôt que de la faire écrire par l'app : il y a plusieurs chemins pour
-- accepter une demande (deux écrans aujourd'hui), et en oublier un laisserait
-- des réservations sans échéance, donc éternelles. Un trigger ne s'oublie pas.
--
-- 24 h pour payer, et de toute façon jusqu'à 2 h avant la session.

create or replace function set_pay_deadline()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'confirmed'
     and coalesce(old.status, '') <> 'confirmed'
     and new.paid is not true
     and new.pay_deadline is null then
    new.pay_deadline := least(
      now() + interval '24 hours',
      coalesce(new.date_session - interval '2 hours', now() + interval '24 hours')
    );
    -- Session dans moins de 2 h : on laisse un minimum d'une heure pour payer.
    if new.pay_deadline <= now() then
      new.pay_deadline := now() + interval '1 hour';
    end if;
  end if;

  -- Payée : l'échéance n'a plus lieu d'être.
  if new.paid is true then
    new.pay_deadline := null;
  end if;

  return new;
end $$;

drop trigger if exists trg_set_pay_deadline on bookings;
create trigger trg_set_pay_deadline
  before update on bookings
  for each row execute function set_pay_deadline();
