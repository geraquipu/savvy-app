-- Enregistrement du planning : tout ou rien.
--
-- L'app faisait DELETE puis INSERT en deux appels séparés, sans vérifier le
-- résultat, et affichait « Planning enregistré » dans tous les cas. Si
-- l'INSERT échouait (réseau coupé, ligne invalide, RLS), le conseiller se
-- retrouvait avec un agenda VIDE et un message de succès. Plus aucune
-- réservation possible, sans que personne comprenne pourquoi.
--
-- Cette fonction fait les deux dans la même transaction : soit le nouveau
-- planning remplace l'ancien, soit rien ne change.

create or replace function save_availability(
  p_expert_id uuid,
  p_rows      jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  -- Un conseiller n'enregistre que SON planning.
  select user_id into v_owner from experts where id = p_expert_id;
  if v_owner is null or v_owner <> auth.uid() then
    raise exception 'Non autorisé';
  end if;

  delete from availability where expert_id = p_expert_id;

  if jsonb_array_length(coalesce(p_rows, '[]'::jsonb)) > 0 then
    insert into availability (expert_id, day_of_week, start_time, end_time)
    select p_expert_id,
           (r->>'day_of_week')::int,
           (r->>'start_time')::time,
           (r->>'end_time')::time
    from jsonb_array_elements(p_rows) as r
    -- Un créneau qui finit avant de commencer n'a pas de sens : il serait
    -- accepté en base et produirait zéro créneau réservable.
    where (r->>'end_time')::time > (r->>'start_time')::time;
  end if;
end $$;

revoke all on function save_availability(uuid, jsonb) from public;
grant execute on function save_availability(uuid, jsonb) to authenticated;

comment on function save_availability is
  'Remplace le planning d''un conseiller de façon atomique. Vérifie que l''appelant en est le propriétaire.';
