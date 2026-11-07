# অনলাইনে চালু করার ধাপ

## Server-side PIN secret তৈরি

Project-এর root folder-এ terminal খুলে চালান:

```powershell
node tools/generate-clinic-secrets.mjs
```

Prompt-এ আপনার ৮ অঙ্কের numeric password লিখুন। টাইপ করার সময় password দেখা যাবে না। Tool `CLINIC_PIN_HASH` এবং `CLINIC_SESSION_SECRET` তৈরি করবে; password নিজে output বা source file-এ রাখা হয় না। এই generated values নিরাপদে কপি করে Vercel-এর environment variables-এ বসান। PIN chat বা source code-এ পাঠাবেন না।

## Vercel ও Supabase

প্রথমে Supabase **Project Settings → API** থেকে Project URL এবং `service_role` secret key নিন। `service_role` key কখনো browser/client environment variable-এ দেবেন না।

Vercel → **Project → Settings → Environment Variables**-এ Production environment-এর জন্য যোগ করুন:

- `SUPABASE_URL` — Supabase Project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase server-only service role secret
- `CLINIC_PIN_HASH` — local secret generator-এর output
- `CLINIC_SESSION_SECRET` — একই generator-এর output

এরপর নতুন deployment তৈরি করুন। Service role key শুধু server API functions-এ ব্যবহৃত হবে; `VITE_` prefix দেবেন না। API প্রতি IP-তে ১৫ মিনিটে ৫টি ভুল চেষ্টা হলে ১৫ মিনিটের জন্য login বন্ধ করে এবং ১২ ঘণ্টার HttpOnly session cookie দেয়।

Deployment Protection চালু রেখেই Supabase Dashboard → **SQL Editor**-এ `supabase/migrations/20261107010000_enable_server_pin_gateway.sql`-এর সম্পূর্ণ SQL চালান। এটি `clinic_sync_state`-এ browser-এর direct access বন্ধ করে, এবং rate-limit table ও server-only functions তৈরি করে। এরপর PIN login, database read/write ও cloud logout যাচাই করুন।

এই ব্যবস্থায় Supabase Auth email account বা allowlist user তৈরি করতে হবে না। ৮ অঙ্কের numeric password-এ অক্ষরভিত্তিক password-এর চেয়ে কম সম্ভাব্য combination থাকে; PIN কাউকে দেবেন না, এবং যাচাই শেষ না হওয়া পর্যন্ত Vercel Deployment Protection চালু রাখুন।

## পুরোনো ডেটা

প্রথম সফল login-এ app এই browser-এ cache করা clinic data খুঁজবে। Supabase table ফাঁকা হলে, data cloud-এ কপি করার আগে app স্পষ্ট সম্মতি চাইবে। **এই ডিভাইসের তথ্য ক্লাউডে কপি করুন** বেছে নিলে এই browser-এর cache কপি হবে; **এখন নয়** বেছে নিলে cloud sync বন্ধ থাকবে এবং স্থানীয় data অক্ষত থাকবে।

বাস্তব রোগীর তথ্য ব্যবহারের আগে Supabase project-এর access, backup/restore ব্যবস্থা এবং আপনার এলাকার প্রযোজ্য privacy requirements যাচাই করুন।
