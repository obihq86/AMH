import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const CHROMIUM_FULL_VERSION = "130.0.2849.68";
const WINDOWS_FILE_TIME_EPOCH = 11644473600n;

// Microsoft Edge TTS-এর জন্য Sec-MS-GEC সিকিউরিটি টোকেন তৈরি
async function generateSecMsGec(): Promise<string> {
  const ticks = (BigInt(Math.floor(Date.now() / 1000)) + WINDOWS_FILE_TIME_EPOCH) * 10000000n;
  const roundedTicks = ticks - (ticks % 3000000000n);
  const strToHash = `${roundedTicks}${TRUSTED_CLIENT_TOKEN}`;
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(strToHash));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

// জিরো-ডিপেন্ডেন্সি নেটিভ WebSocket Edge Neural TTS
async function synthesizeEdgeTTS(text: string, voice: string): Promise<Uint8Array> {
  const secMsGec = await generateSecMsGec();
  const connectionId = crypto.randomUUID().replace(/-/g, "");
  const wsUrl = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}&ConnectionId=${connectionId}`;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    const audioChunks: Uint8Array[] = [];
    const timeout = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error("Edge TTS WebSocket timeout"));
    }, 8000);

    ws.onopen = () => {
      const timestamp = new Date().toISOString();
      const configMsg =
        `X-Timestamp:${timestamp}\r\n` +
        `Content-Type:application/json; charset=utf-8\r\n` +
        `Path:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: { sentenceBoundaryEnabled: "false", wordBoundaryEnabled: "false" },
                outputFormat: "audio-24khz-48kbitrate-mono-mp3",
              },
            },
          },
        });
      ws.send(configMsg);

      const requestId = crypto.randomUUID().replace(/-/g, "");
      const ssml =
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='bn-BD'>` +
        `<voice name='${voice}'>` +
        `<prosody pitch='+0Hz' rate='-5%' volume='+0%'>${escapeXml(text)}</prosody>` +
        `</voice></speak>`;

      const ssmlMsg =
        `X-RequestId:${requestId}\r\n` +
        `Content-Type:application/ssml+xml\r\n` +
        `X-Timestamp:${timestamp}\r\n` +
        `Path:ssml\r\n\r\n` +
        ssml;
      ws.send(ssmlMsg);
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        if (event.data.includes("Path:turn.end")) {
          clearTimeout(timeout);
          ws.close();
          const totalLen = audioChunks.reduce((sum, c) => sum + c.length, 0);
          const merged = new Uint8Array(totalLen);
          let offset = 0;
          for (const chunk of audioChunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          if (merged.length > 0) resolve(merged);
          else reject(new Error("Empty audio received from Edge TTS"));
        }
      } else if (event.data instanceof ArrayBuffer) {
        const view = new DataView(event.data);
        if (event.data.byteLength > 2) {
          const headerLen = view.getUint16(0);
          const audioStart = 2 + headerLen;
          if (event.data.byteLength > audioStart) {
            audioChunks.push(new Uint8Array(event.data.slice(audioStart)));
          }
        }
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Edge TTS WebSocket error"));
    };
  });
}

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const url = new URL(req.url);
      const patientName = url.searchParams.get("name")?.trim();

      if (!patientName) {
        return new Response("Patient name is required", { status: 400, headers: corsHeaders });
      }

      // নারী কণ্ঠ: "bn-BD-NabanitaNeural" | পুরুষ কণ্ঠ: "bn-BD-PradeepNeural"
      const voice = url.searchParams.get("voice") || "bn-BD-NabanitaNeural";
      const announcementText = `${patientName}, অনুগ্রহ করে চেম্বারে প্রবেশ করুন।`;

      let audioBytes: Uint8Array;

      try {
        audioBytes = await synthesizeEdgeTTS(announcementText, voice);
      } catch (edgeErr) {
        console.warn("Edge Neural TTS fallback triggered:", edgeErr);
        const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
          announcementText
        )}&tl=bn&client=tw-ob`;
        const fallbackRes = await fetch(fallbackUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        audioBytes = new Uint8Array(await fallbackRes.arrayBuffer());
      }

      return new Response(audioBytes, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBytes.byteLength.toString(),
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