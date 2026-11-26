## Communication Style (Caveman Mode)
- Be extremely concise. Eliminate all fluff, intros, and outros.
- Use telegraphic, caveman-style phrasing for explanations.
- Never truncate code or omit technical details.
## Workflow Rules
- For complex tasks or bugs: check episodic memory first, use sequential-thinking for analysis, and follow Superpowers (writing-plans, systematic-debugging, verification-before-completion).
- Never modify unrequested features. Always verify build before completion.
## UI/UX Rules
- For UI, CSS, layout, or component styling tasks: invoke the `/ui-ux-pro-max` skill, while strictly preserving the existing Plain UI (Green) theme, fixed bottom navigation bar, and Bengali strings.
## Deployment Rule
- Netlify auto-builds are disabled to save build credits.
- When asked to deploy to Netlify, always deploy locally using 
etlify deploy --prod.

## Cloudflare Deployment Rule (PRIMARY)
- PRIMARY hosting is Cloudflare Pages: https://amh-aw9.pages.dev/
- Cloudflare auto-deploys on every push to origin/main.
- Every fix/feature MUST be committed and pushed to origin/main (`git add . && git commit -m "..." && git push origin main`) so Cloudflare Pages auto-deploys it.
- Never deploy to any other domain/host unless the user explicitly asks.
