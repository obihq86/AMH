// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default {
  async fetch(req: Request): Promise<Response> {
    // ব্রাউজারের Preflight (OPTIONS) রিকোয়েস্ট হ্যান্ডেল করা
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const url = new URL(req.url);
      const patientName = url.searchParams.get("name")?.trim();

      if (!patientName) {
        return new Response("Patient name is required", {
          status: 400,
          headers: corsHeaders,
        });
      }

      // বাংলায় ঘোষণা করার সম্পূর্ণ বাক্য
      const announcementText = `${patientName}, অনুগ্রহ করে চেম্বারে প্রবেশ করুন।`;

      // Google Translate TTS থেকে সরাসরি বাংলা MP3 অডিও আনা
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        announcementText
      )}&tl=bn&client=tw-ob`;

      const ttsResponse = await fetch(ttsUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": "https://translate.google.com/",
        },
      });

      if (!ttsResponse.ok) {
        throw new Error(`TTS fetch failed with status: ${ttsResponse.status}`);
      }

      const audioBuffer = await ttsResponse.arrayBuffer();

      // সরাসরি MP3 অডিও ফাইল হিসেবে রিটার্ন করা
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.byteLength.toString(),
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  },
};