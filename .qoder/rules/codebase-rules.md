# Project Rules: Ansari Medical Hall - Patient Manager

## 1. Strict Token & File-Reading Discipline (Prevent HTTP 429)
- **NEVER read `Ansari Medical Hall - Patient Manager_V8.0.tsx` in full** (it is 16,490+ lines long and will immediately exhaust free-tier TPM rate limits).
- **Always read `CODEBASE_MAP.md` first** before inspecting any source code file to locate exact function, component, or section line numbers.
- **Targeted Line-Range Reading:** Whenever a file exceeds 100 lines, read ONLY the specific `start_line` and `end_line` range needed for the current task (typically 40–120 lines at a time).
- **Use Targeted Search:** For UI/JSX sections inside `Ansari Medical Hall - Patient Manager_V8.0.tsx` (lines `L9800 - L16490`), use keyword/code search first to pinpoint the exact line number, then read only the surrounding 30–60 lines.

## 2. Ignore Non-Essential Directories
- Do NOT scan, read, or list files inside `tools/`, `dist/`, `dist-tv/`, `dist-tv-out/`, `node_modules/`, `public/`, or `.git/` unless explicitly instructed by the user.

## 3. Safe Code Editing & Map Maintenance
- **Minimal Diffs:** Make surgical, targeted edits to the specific lines required. Never rewrite or output large unmodified blocks of `Ansari Medical Hall - Patient Manager_V8.0.tsx`.
- **Preserve Existing Architecture:** Keep single-file state logic, Supabase sync (`src/SupabaseGate.tsx`, `src/lib/clinicApi.ts`), Bengali TTS (`supabase/functions/speak-name/index.ts`, `src/hooks/usePatientVoiceCall.js`), and theme configurations intact unless asked to modify them.
- **Keep Map Updated:** Whenever new functions are added or significant line shifts occur in `Ansari Medical Hall - Patient Manager_V8.0.tsx`, remind the user to run `node generate-map.cjs` (or run it if terminal access is permitted) to refresh `CODEBASE_MAP.md`.
