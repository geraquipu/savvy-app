import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @deno-types="https://esm.sh/v135/web-push@3.6.7/src/index.d.ts"
import webpush from "https://esm.sh/web-push@3.6.7?target=deno";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);


/**
 * Appel interne uniquement.
 *
 * Cette fonction était joignable avec la clé anon — qui est publique, elle est
 * dans le bundle. N'importe qui pouvait donc adresser une notification au titre et au contenu de son choix à n'importe quel utilisateur dont il connaît l'identifiant.
 * Seuls les appels portant la clé de service (notify-booking, cron) passent.
 */
const isInternal = (req: Request) =>
  (req.headers.get("Authorization") || "") === `Bearer ${SUPABASE_SERVICE_KEY}`;

webpush.setVapidDetails("mailto:notifications@getsavvy.fr", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

serve(async (req) => {
  if (!isInternal(req)) return new Response("Non autorisé", { status: 403 });
  const { userId, title, body, url } = await req.json();
  if (!userId) return new Response("missing userId", { status: 400 });

  const { data: subs } = await supabase.from("push_subscriptions").select("subscription, endpoint").eq("user_id", userId);
  if (!subs?.length) return new Response(JSON.stringify({ sent: 0 }), { headers: { "Content-Type": "application/json" } });

  const payload = JSON.stringify({ title, body, url: url || "/" });
  let sent = 0;

  for (const row of subs) {
    const sub = JSON.parse(row.subscription);
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (e: any) {
      if (e.statusCode === 410 || e.statusCode === 404) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
      } else {
        console.error("push error:", e.message);
      }
    }
  }

  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
