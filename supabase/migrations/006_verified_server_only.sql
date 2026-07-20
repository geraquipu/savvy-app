-- Le badge « vérifié » ne s'attribue pas soi-même.
--
-- La politique RLS de `experts` autorise un conseiller à modifier sa propre
-- ligne :  UPDATE  using (auth.uid() = user_id)
-- Elle protège la LIGNE, pas les COLONNES. N'importe quel conseiller inscrit
-- pouvait donc appeler l'API REST sur sa propre ligne :
--
--   PATCH /rest/v1/experts?id=eq.<son_id>   {"verified": true, "active": true}
--
-- et afficher aux clients le badge de confiance sans validation de notre part.
-- Même faille que `bookings.paid` : protection au niveau ligne, absente au
-- niveau colonne.
--
-- Ces deux colonnes ne sont désormais écrites que par la fonction
-- approve-expert (service_role), qui vérifie l'email de l'appelant.

revoke update (verified, active) on experts from authenticated;

comment on column experts.verified is
  'Badge de confiance affiché aux clients. Écrit uniquement par la fonction approve-expert (service_role).';
comment on column experts.active is
  'Visibilité du profil dans le catalogue. Écrit uniquement par approve-expert.';

-- ── Vérification ──────────────────────────────────────────────────────────
-- Doit renvoyer les colonnes encore écrivables par `authenticated` :
-- verified et active NE DOIVENT PLUS y figurer.
--
-- select column_name from information_schema.column_privileges
-- where table_name = 'experts' and grantee = 'authenticated' and privilege_type = 'UPDATE';
