---
trigger: always_on
---
# Project Rules: Ansari Medical Hall - Patient Manager
# Hard Account Quota Ceiling: RPM = 5/min | TPM = 125,000/min

## 1. Strict Quota, Token & File-Reading Discipline (Prevent HTTP 429)
- **Strict Quota Awareness:** Operate strictly within **5 Requests Per Minute (RPM)** and **125,000 Tokens Per Minute (TPM)**. Every unnecessary tool call wastes per-minute quota and triggers `Something went wrong` (HTTP 429).
- **NEVER read `Ansari Medical Hall - Patient Manager_V8.0.tsx` in full** (it is 16,490+ lines long and reading it once exceeds the 125,000 TPM rate limit).
- **Always read `CODEBASE_MAP.md` first** before inspecting any source code file to locate exact function, component, or section line numbers.
- **Targeted Line-Range Reading:** Whenever a file exceeds 100 lines, read ONLY the specific `start_line` and `end_line` range needed for the current task (strictly **40–80 lines at a time**, maximum 2 code slices per turn).
- **Use Targeted Search:** For UI/JSX sections inside `Ansari Medical Hall - Patient Manager_V8.0.tsx` (lines `L9800 - L16490`), use keyword/code search first to pinpoint the exact line number, then read only the surrounding 30–50 lines.

## 2. Batch Actions & Ignore Non-Essential Directories
- **Minimize Tool Calls:** Complete each task in **2 to 4 tool calls total** (1. Read `CODEBASE_MAP.md` -> 2. Read target slice -> 3. Apply surgical edit). Do NOT run `npm run build`, `tsc`, or verification scripts unless explicitly instructed by the user.
- **Excluded Folders:** Do NOT scan, read, or list files inside `tools/`, `dist/`, `dist-tv/`, `dist-tv-out/`, `node_modules/`, `public/`, or `.git/` unless explicitly instructed by the user.

## 3. Safe Code Editing, Architecture Protection & Map Maintenance
- **Minimal Diffs:** Make surgical, targeted edits to the specific lines required. Never rewrite or output large unmodified blocks of `Ansari Medical Hall - Patient Manager_V8.0.tsx`.
- **Preserve Existing Architecture:** Keep single-file state logic, Supabase sync (`src/SupabaseGate.tsx`, `src/lib/clinicApi.ts`), Bengali TTS (`supabase/functions/speak-name/index.ts`, `src/hooks/usePatientVoiceCall.js`), and theme configurations intact unless asked to modify them.
- **Keep Map Updated:** Whenever new functions are added or significant line shifts occur in `Ansari Medical Hall - Patient Manager_V8.0.tsx`, remind the user to run `node generate-map.cjs` (or run it if terminal access is permitted) to refresh `CODEBASE_MAP.md`.
