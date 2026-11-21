---
description: Audit Supabase queries in Ansari Medical Hall to minimize bandwidth egress and enforce TypeScript types.
---

Audit the Supabase queries in the specified file or recent changes ($ARGUMENTS) for the "Ansari Medical Hall - Patient Manager" project:

1. **Date Filtering (Egress Control):** Ensure patient queue and appointment queries strictly filter by date (e.g., today's date or specific date range) instead of fetching all historical records.
2. **Column Selection:** Flag any `select('*')` calls and suggest selecting only required columns to reduce payload size.
3. **Realtime & Polling:** Check for duplicate Supabase realtime subscriptions, missing cleanup (`removeChannel`), or aggressive polling loops.
4. **Type Safety:** Verify that query payloads and responses align with interfaces in `src/types/clinicTypes.ts`.
5. **Edge Function Safety:** If `speak-name` Edge Function is called, verify no redundant audio fetches occur.

Output Rules:
- Follow CLAUDE.md Caveman Mode (ultra-concise, bulleted findings with exact file paths and line numbers).
- Do not modify files unless explicitly asked; only report issues and exact fixes.