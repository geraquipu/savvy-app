import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return new Response("Unauthorized", { status: 401 });

  // Verify the calling user's JWT to get their id
  const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authError || !user) return new Response("Unauthorized", { status: 401 });

  const userId = user.id;

  // Delete related data first (in case no cascade)
  await supabase.from("bookings").delete().eq("client_id", userId);
  await supabase.from("bookings").delete().eq("expert_id",
    (await supabase.from("experts").select("id").eq("user_id", userId).single()).data?.id
  );
  await supabase.from("experts").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);

  // Delete the auth user
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
