// Runs every minute (scheduled via pg_cron, see migrations/20260716000100_schedule_reminders.sql).
// Finds posts due within the next few minutes and sends a Telegram reminder with the
// caption ready to copy and the image ready to download, so publishing stays a manual,
// one-tap action on Instagram.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const REMINDER_WINDOW_MINUTES = 5;
const PHOTO_CAPTION_LIMIT = 1024;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendTelegramMessage(text: string) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML" }),
  });
  if (!res.ok) console.error("sendMessage failed", await res.text());
}

async function sendTelegramPhoto(photoUrl: string, caption: string) {
  const truncated = caption.length > PHOTO_CAPTION_LIMIT
    ? caption.slice(0, PHOTO_CAPTION_LIMIT - 1) + "…"
    : caption;
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, photo: photoUrl, caption: truncated, parse_mode: "HTML" }),
  });
  if (!res.ok) console.error("sendPhoto failed", await res.text());
}

Deno.serve(async () => {
  const windowEnd = new Date(Date.now() + REMINDER_WINDOW_MINUTES * 60_000).toISOString();

  const { data: duePosts, error } = await supabase
    .from("posts")
    .select("id, caption, media_path, scheduled_at, page:pages(name), category:categories(name)")
    .eq("reminder_sent", false)
    .lte("scheduled_at", windowEnd);

  if (error) {
    console.error("query failed", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  for (const post of duePosts ?? []) {
    const time = new Date(post.scheduled_at).toLocaleString("it-IT", { timeZone: "Europe/Rome" });
    const pageName = (post.page as { name?: string } | null)?.name ?? "Pagina";
    const categoryName = (post.category as { name?: string } | null)?.name;
    const header = categoryName ? `${pageName} · ${categoryName}` : pageName;
    const caption = `📅 <b>${header}</b> — ${time}\n\n${post.caption || "(nessuna caption)"}`;

    if (post.media_path) {
      const { data: pub } = supabase.storage.from("media").getPublicUrl(post.media_path);
      await sendTelegramPhoto(pub.publicUrl, caption);
    } else {
      await sendTelegramMessage(caption);
    }

    await supabase
      .from("posts")
      .update({ reminder_sent: true, status: "promemoria_inviato" })
      .eq("id", post.id);
  }

  return new Response(JSON.stringify({ processed: duePosts?.length ?? 0 }), {
    headers: { "Content-Type": "application/json" },
  });
});
