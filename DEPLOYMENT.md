# অনলাইনে চালু করার ধাপ

## Supabase

1. Supabase Dashboard → **SQL Editor**-এ `supabase/migrations/20261107000000_create_clinic_sync_state.sql`-এর SQL চালান।
2. Dashboard → **Authentication → Users** থেকে প্রতিষ্ঠানের জন্য একটি শক্তিশালী shared login তৈরি করুন। পাসওয়ার্ড সোর্স কোডে বা চ্যাটে রাখবেন না। Authentication-এর public sign-up-ও বন্ধ রাখুন।
3. Authentication → Users-এ ওই ব্যবহারকারীর UUID কপি করে SQL Editor-এ চালান (ইমেইলটি নিজেরটির সঙ্গে বদলান):

   ```sql
   insert into public.clinic_authorized_users (user_id)
   select id from auth.users where email = 'your-shared-login@example.com'
   on conflict do nothing;
   ```

4. এই অ্যাপের লগইন স্ক্রিনে সেই account ব্যবহার হবে। রোগীর তথ্য কেবল allowlist-এ থাকা user-দের জন্য RLS-সুরক্ষিত `clinic_sync_state` টেবিলে রাখা হয়; শুধু sign-up করলেই ডেটা দেখা যাবে না।

## Vercel

1. GitHub-এর private `AMH` repository Vercel-এ import করে Vite project deploy করুন। Build command `npm run build`, output directory `dist`।
2. Vercel → **Settings → Environment Variables**-এ যোগ করুন:
   - `VITE_SUPABASE_URL` — Supabase Project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase publishable key
3. Production deployment-এ Redeploy করুন. `service_role`/secret key কখনো Vercel client-side environment variable-এ দেবেন না।

## পুরোন data

প্রথম login-এ app এই browser-এ cache করা clinic data খুঁজবে. Supabase table ফাঁকা হলে, data-কে cloud-এ কপি করার আগে app স্পষ্ট সম্মতি চাইবে. **এই ডিভাইসের তথ্য ক্লাউডে কপি করুন** বেছে নিলে এই browser-এর cache কপি হবে; **এখন নয়** বেছে নিলে cloud sync বন্ধ থাকবে এবং স্থানীয় data অক্ষত থাকবে।

বাস্তব রোগীর তথ্য ব্যবহারের আগে Supabase project-এর access, backup/restore ব্যবস্থা এবং আপনার এলাকার প্রযোজ্য privacy requirements যাচাই করুন।
