-- Les REVOKE des migrations 004 et 006 n'ont eu AUCUN effet.
--
-- En PostgreSQL, un privilège accordé au niveau TABLE couvre toutes les
-- colonnes, présentes et futures. Retirer une colonne d'un tel privilège est
-- impossible :
--
--   GRANT  UPDATE ON experts TO authenticated;         -- table entière
--   REVOKE UPDATE (verified) ON experts FROM authenticated;  -- sans effet
--
-- Le seul moyen est de retirer le privilège de table, puis de le ré-accorder
-- colonne par colonne en omettant celles à protéger.
--
-- Conséquence : jusqu'à l'exécution de ce fichier, `bookings.paid` et
-- `experts.verified` restent écrivables par n'importe quel compte, malgré les
-- deux migrations précédentes.

do $$
declare
  cols text;
begin
  -- ── bookings : tout sauf les colonnes d'argent ──
  select string_agg(quote_ident(column_name), ', ' order by column_name)
    into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'bookings'
    and column_name not in ('paid','stripe_session_id','expert_amount','stripe_transfer_id');

  execute 'revoke update on public.bookings from authenticated';
  execute format('grant update (%s) on public.bookings to authenticated', cols);

  -- ── experts : tout sauf le badge de confiance et la visibilité ──
  select string_agg(quote_ident(column_name), ', ' order by column_name)
    into cols
  from information_schema.columns
  where table_schema = 'public' and table_name = 'experts'
    and column_name not in ('verified','active');

  execute 'revoke update on public.experts from authenticated';
  execute format('grant update (%s) on public.experts to authenticated', cols);
end $$;

-- ── Vérification : ces deux requêtes doivent renvoyer 0 ligne ──
select 'FAILLE bookings: ' || column_name
from information_schema.column_privileges
where grantee='authenticated' and privilege_type='UPDATE' and table_name='bookings'
  and column_name in ('paid','stripe_session_id','expert_amount','stripe_transfer_id');

select 'FAILLE experts: ' || column_name
from information_schema.column_privileges
where grantee='authenticated' and privilege_type='UPDATE' and table_name='experts'
  and column_name in ('verified','active');
