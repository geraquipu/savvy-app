-- Empêcher deux réservations confirmées sur le même créneau.
--
-- Aujourd'hui rien ne l'interdit. Deux clients voient le même créneau, envoient
-- chacun une demande, le conseiller accepte les deux — et se retrouve avec deux
-- personnes qui ont payé pour la même demi-heure. Le navigateur du conseiller
-- ne peut pas arbitrer : entre le moment où il affiche l'agenda et celui où il
-- accepte, la situation a pu changer. Seule la base peut trancher.
--
-- Portée : créneau identique (même conseiller, même horodatage exact). Les
-- chevauchements partiels (10:00–10:30 contre 10:15–10:45) ne sont pas couverts
-- ici — cela demande une contrainte d'exclusion sur intervalles, et donc de
-- stocker une durée fiable. Le cas fréquent, deux clients qui cliquent sur le
-- même créneau affiché, est couvert.
--
-- Les demandes en attente peuvent toujours se chevaucher : c'est normal, le
-- conseiller en choisit une. C'est l'acceptation qui doit être exclusive.

-- ── Vérification préalable ──
-- Si des doublons existent déjà, l'index échouera. On les signale d'abord
-- clairement plutôt que de laisser une erreur Postgres incompréhensible.
do $$
declare n int;
begin
  select count(*) into n from (
    select expert_id, date_session
    from bookings
    where status = 'confirmed' and date_session is not null
    group by expert_id, date_session
    having count(*) > 1
  ) d;
  if n > 0 then
    raise exception
      'Impossible de créer l''index : % créneau(x) ont déjà plusieurs réservations confirmées. Les résoudre à la main d''abord (en annuler une).', n;
  end if;
end $$;

create unique index if not exists bookings_no_double_booking
  on bookings (expert_id, date_session)
  where status = 'confirmed' and date_session is not null;

comment on index bookings_no_double_booking is
  'Un seul rendez-vous confirmé par conseiller et par créneau. Une seconde acceptation sur le même horaire échoue au lieu de créer une double réservation.';
