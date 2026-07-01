# 001 — Push & deploy the 고찌봄 redesign (verified green + live)

## Goal
Get the current local work (고찌봄 redesign) onto the team repo's `main` and prove the deploy
end-to-end: the `Deploy` GitHub Actions run is green AND the live site serves the new 고찌봄 app.

## Assumptions
- Deploy-target repo: `TIKI-TAKA-hackathon/Tiki-Taka-FE` (public), branch `main`. It is `origin`.
- Firebase Hosting project id: `gojjibom` (live). Live URL: https://gojjibom.web.app.
- The redesign commit (`feat(fe): redesign to 고찌봄 medication check-in app`) plus secondary screens
  exist on local `main`, ahead of `origin/main`. This session cannot push (no GitHub credentials);
  run this as a write-enabled agent (git push rights + `gh` authenticated + network).
- `.github/workflows/deploy.yml` already: gates (`npm ci` → lint → `tsc --noEmit` → test → build with
  `VITE_API_BASE_URL` + `VITE_DEMO_MODE=true`) → writes `FIREBASE_SERVICE_ACCOUNT` to a temp file →
  `npx firebase-tools@15.22.4 deploy --only hosting --project gojjibom` (idempotent "already active"
  retry treated as success) → `curl -fsSI https://gojjibom.web.app`. Only secret: `FIREBASE_SERVICE_ACCOUNT`.

## Acceptance criteria
- [ ] `npm ci && npm run lint && npx tsc --noEmit && npm test && npm run build` pass locally.
- [ ] `gh secret list -R TIKI-TAKA-hackathon/Tiki-Taka-FE` shows `FIREBASE_SERVICE_ACCOUNT`.
- [ ] Local `main` (redesign) is pushed to `origin/main`.
- [ ] Latest `Deploy` run on `main` is **success** (`gh run watch --exit-status`).
- [ ] Live check: `curl -fsSL https://gojjibom.web.app` returns the 고찌봄 app (title "고찌봄 · 복약 안부",
      not the old "기억카드").

## Procedure (iterate until green, max 5 pushes)
1. `git status` / `git log --oneline -3` — confirm the redesign commit is on local `main` and `origin`
   is `TIKI-TAKA-hackathon/Tiki-Taka-FE`.
2. Make local gates green (command above); fix surgically if red.
3. `gh secret list -R TIKI-TAKA-hackathon/Tiki-Taka-FE`. If `FIREBASE_SERVICE_ACCOUNT` is missing, STOP
   and ask the human to add it (Settings → Secrets and variables → Actions). Do not fabricate it.
4. `git push origin main`.
5. `gh run watch -R TIKI-TAKA-hackathon/Tiki-Taka-FE --exit-status` (or poll `gh run list`).
6. On failure: `gh run view --log-failed`, fix the root cause (surgical), commit, push, repeat.
7. On success: `curl -sSI https://gojjibom.web.app` → 200; fetch the HTML and confirm it is the 고찌봄 app.

## Likely failure modes to check first
- Service account lacks Firebase Hosting deploy role, or the JSON secret is malformed / partial.
- `tsc`/lint/test failure introduced by the redesign; run gates locally before pushing.
- Firebase project mismatch (must be `gojjibom`), or Hosting not initialized for that project.

## Report
Conclusion first: run status + URL, live URL status + which app is served, what changed, and any human
action still required. Do not overstate; if the live deploy could not be verified, say so.
