-- ── À EXÉCUTER PUIS COLLER LE RÉSULTAT ──────────────────────────────────────
-- Les politiques RLS n'existent que dans le tableau de bord Supabase : elles
-- ne sont pas versionnées, donc impossible de les relire dans le code ni de
-- savoir si quelqu'un les modifie. Cette requête les affiche.
--
-- Ce qu'on cherche en priorité : qui peut écrire dans `experts`. L'écran
-- d'administration appelle `update({active:true, verified:true})` depuis le
-- navigateur ; la liste ADMIN_EMAILS ne fait que cacher le bouton. Si la
-- politique autorise n'importe quel compte authentifié, alors n'importe qui
-- peut se marquer « conseiller vérifié » via l'API REST — le badge de
-- confiance que voient les clients.

select
  tablename,
  policyname,
  cmd            as operation,
  roles,
  qual           as condition_lecture,
  with_check     as condition_ecriture
from pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;

-- Vérifie aussi que RLS est bien ACTIVÉ sur chaque table (une politique sur
-- une table sans RLS ne protège rien).
select relname as table_name, relrowsecurity as rls_active
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by relname;
