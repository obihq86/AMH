# অনলাইনে চালু করার ধাপ

## লগইন

অ্যাপের স্টাফ/অ্যাডমিন লগইন, গেস্ট মোড এবং TV MOOD আগের মতো অ্যাপের ভেতরেই পরিচালিত হয়। Supabase বা Vercel কোনো PIN যাচাই করে না এবং লগইন সেশন নিয়ন্ত্রণ করে না। Staff PIN ও login preference অ্যাপের আগের নিয়ম অনুযায়ী থাকে।

## Vercel ও Supabase

Supabase **Project Settings → API** থেকে Project URL এবং `service_role` secret key নিন। `service_role` key কখনো browser/client environment variable-এ দেবেন না।

Vercel → **Project → Settings → Environment Variables**-এ Production environment-এর জন্য যোগ করুন:

- `SUPABASE_URL` — Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase server-only service role secret

এরপর নতুন deployment তৈরি করুন। Service role key শুধু server API functions-এ ব্যবহৃত হবে; `VITE_` prefix দেবেন না।

Supabase Dashboard → **SQL Editor**-এ `supabase/migrations/20261107010000_enable_server_pin_gateway.sql`-এর সম্পূর্ণ SQL চালান। এটি Supabase table-এ browser-এর direct access বন্ধ রাখে। App-এর cloud data read/write Vercel API দিয়ে হয়; এই API-তে app-এর login যাচাই করা হয় না।

## Guest ও TV Mode এবং ডেটার প্রবেশাধিকার

Guest Mode আগের মতো সিরিয়ালের আবেদন করতে ও live queue দেখতে পারবে; TV MOOD live display board দেখাবে। Cloud data-ও app-এর login screen থেকে সরাসরি পড়া যাবে।

এটি public access: internet-এ যে কেউ app-এর login screen-এ না ঢুকেই API দিয়ে clinic data পড়তে বা বদলাতে পারে। Staff login শুধু app-এর UI নিয়ন্ত্রণ করে; cloud API-এর authorization নয়। তাই public access গ্রহণযোগ্য নয় এমন রোগীর/ক্লিনিকের তথ্য production-এ রাখবেন না।

## TV browser links

The Vercel build includes the legacy-browser-compatible TV page at `/tv.html`. Use the same Vercel hostname with a board number for each screen:

- TV-1: `/tv.html?tv=1`
- TV-2: `/tv.html?tv=2`
- TV-3: `/tv.html?tv=3`
- TV-4: `/tv.html?tv=4`

These are four separate TV links on one Vercel domain. Separate domain names or subdomains require those domains to be added to the Vercel project and their DNS to point to Vercel.

## পুরোনো ডেটা

এই browser-এ local clinic data থাকলে এবং Supabase-এ এখনো data না থাকলে, App খোলার আগে সেটি cloud-এ কপি করার সম্মতি চাওয়া হবে। **এই ডিভাইসের তথ্য ক্লাউডে কপি করুন** বেছে নিলে এই browser-এর cache কপি হবে; **এখন নয়** বেছে নিলে cloud sync বন্ধ থাকবে এবং স্থানীয় data অক্ষত থাকবে।

Supabase Free Plan-এ scheduled database backup নেই; গুরুত্বপূর্ণ data-র আলাদা backup রাখুন।
