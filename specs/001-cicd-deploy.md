# 001 — Make CI/CD deploy to Firebase Hosting (verified green)

## Goal
Get the `Deploy` GitHub Actions workflow to build and deploy the FE to Firebase Hosting on push to
`main`, and prove it end-to-end: the Actions run is green AND the live site responds.

## Assumptions
- Deploy-target repo: `TIKI-TAKA-hackathon/Tiki-Taka-FE` (public), branch `main`.
- Firebase Hosting project id: `gojjibom` (live channel). Backend API: `https://api.stdiodh.xyz/api`.
- Exactly one GitHub Actions secret is used: `FIREBASE_SERVICE_ACCOUNT` (service-account JSON with
  Firebase Hosting deploy permission). `VITE_API_BASE_URL` + `VITE_DEMO_MODE=true` are baked into the
  workflow build step; project id lives in `.firebaserc`. No other secrets.
- A bootstrap commit (`.github/workflows/deploy.yml`, `.firebaserc`=gojjibom, single-secret model,
  `VITE_DEMO_MODE`, review-loop files, old workflows removed) currently exists only locally / on a
  different remote. Landing it on the deploy-target repo's `main` is part of this task.
- The running agent has git push rights and `gh` authenticated for the target repo, plus network
  access. NOTE: the read-only review loop (`loop.sh`) CANNOT push — run this as a write-enabled task.

## API contract
No API/behavior change. Build-time env only: `VITE_API_BASE_URL=https://api.stdiodh.xyz/api`,
`VITE_DEMO_MODE=true` (set in the workflow build step).

## Acceptance criteria
- [ ] `npm ci && npm run lint && npx tsc --noEmit && npm test && npm run build` pass locally.
- [ ] `gh secret list -R TIKI-TAKA-hackathon/Tiki-Taka-FE` shows `FIREBASE_SERVICE_ACCOUNT`.
- [ ] Target repo `main` has the bootstrap: `deploy.yml` present; `fe-ci.yml` and
      `fe-deploy-firebase.yml` absent; `.firebaserc` = `gojjibom`; env example uses `VITE_DEMO_MODE`.
- [ ] The latest `Deploy` run on `main` is **success** (`gh run watch --exit-status`).
- [ ] Live site returns HTTP 200: `curl -I https://gojjibom.web.app` (and serves the app).

## Out of scope
- No app/product/UI changes beyond what deployment requires.
- Do not reintroduce `fe-ci.yml` / `fe-deploy-firebase.yml`; keep the single `deploy.yml`.
- Never commit secrets or the service-account JSON (keep it gitignored).

## Procedure (iterate until green, max 5 pushes)
1. `git remote -v`. Ensure the target repo is a remote; add if needed:
   `git remote add team https://github.com/TIKI-TAKA-hackathon/Tiki-Taka-FE.git`.
2. Ensure local `main` contains the bootstrap commit; if the target `main` lacks it, prepare to push it.
3. Make local gates green: `npm ci && npm run lint && npx tsc --noEmit && npm test && npm run build`.
   Fix surgically if red.
4. `gh secret list -R TIKI-TAKA-hackathon/Tiki-Taka-FE`. If `FIREBASE_SERVICE_ACCOUNT` is missing,
   STOP and ask the human to add it (Settings -> Secrets and variables -> Actions). Do not fabricate it.
5. Push: `git push team main` (or the correct target remote).
6. Watch: `gh run watch -R TIKI-TAKA-hackathon/Tiki-Taka-FE --exit-status` (or poll `gh run list`).
7. On failure: `gh run view --log-failed`, fix the root cause (surgical), commit, push, repeat.
8. On success: `curl -I https://gojjibom.web.app` -> expect 200. Report the run URL and live URL.

## Likely failure modes to check first
- Service account lacks the Firebase Hosting deploy role, or the JSON is malformed / partial.
- `projectId` / `.firebaserc` doesn't match the real Firebase project (`gojjibom`), or Hosting isn't
  initialized for that project.
- `npm ci` lockfile/Node mismatch, or a lint/type/test failure introduced by the bootstrap.

## Report
Conclusion first: run status + URL, live URL status, exactly what changed, and any human action still
required (e.g. missing secret or IAM role). Do not overstate; if you could not verify the live deploy,
say so.
