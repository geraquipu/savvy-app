-- Exécution périodique du reversement aux Conseillers.
--
-- release-payouts transfère la part du Conseiller une fois la session tenue
-- et le délai de réclamation écoulé. Sans déclencheur périodique, la fonction
-- ne tourne jamais et l'argent reste indéfiniment sur le compte Savvy.
--
-- Une fois par heure suffit : le délai de réclamation est de 48 h, une heure
-- de décalage ne change rien pour personne.

-- ── 1. Voir ce qui est déjà programmé ───────────────────────────────────────
-- select jobid, schedule, jobname, command from cron.job;

-- ── 2. Programmer le reversement ────────────────────────────────────────────
--
-- La clé de service ne doit pas être écrite en clair dans un fichier suivi en
-- versions. Remplacer <SERVICE_ROLE_KEY> au moment de l'exécution, ou mieux :
-- la lire depuis Vault si le projet l'utilise.

select cron.schedule(
  'release-payouts-hourly',
  '7 * * * *',            -- à la minute 7 de chaque heure, hors des pics
  $$
  select net.http_post(
    url     := 'https://idjvhnhhjjpogdkzrucx.supabase.co/functions/v1/release-payouts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- ── 3. Vérifier ─────────────────────────────────────────────────────────────
-- select jobid, jobname, schedule, active from cron.job where jobname = 'release-payouts-hourly';
--
-- Historique des exécutions (utile si aucun virement n'apparaît) :
-- select start_time, status, return_message from cron.job_run_details
-- where jobid = (select jobid from cron.job where jobname = 'release-payouts-hourly')
-- order by start_time desc limit 10;

-- Pour supprimer : select cron.unschedule('release-payouts-hourly');
