# 000 — FE repo bootstrap

## Goal
Turn the scaffolded FE repo into a deployable, loop-driven project: real lint/type/test/build
gates, a Claude -> gate -> Codex review loop, and CI that auto-deploys to Firebase Hosting on
push to `main`.

## Assumptions
- Repo root is the FE root (Vite + React 19 + TypeScript).
- Backend API base is `https://api.stdiodh.xyz/api`.
- Firebase Hosting project id is `gojjibom` (recorded in `.firebaserc`).
- The live build runs in demo mode (`VITE_DEMO_MODE=true`) so the site works without a live backend.
- Only `FIREBASE_SERVICE_ACCOUNT` is provided as a GitHub Actions secret.

## API contract
No API behavior changes in this task. Request/response types stay as defined in `src/lib/types.ts`;
API calls live in `src/lib/api.ts` with a demo/mock fallback controlled by `VITE_DEMO_MODE`.

## Acceptance criteria
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` all pass on a clean `npm ci`.
- [ ] `test` script is non-interactive (`vitest run`).
- [ ] One smoke test asserts `App` renders and shows the configured API base string.
- [ ] Env flag is `VITE_DEMO_MODE` and actually controls the demo/mock path.
- [ ] Review loop files exist: `AGENTS.md`, `CLAUDE.md`, `prompts/reviewer.md`, `specs/_template.md`, `loop.sh` (executable).
- [ ] `.github/workflows/deploy.yml` gates then deploys to Firebase Hosting live on push to `main`; deploy only if gates pass.
- [ ] `.firebaserc` pins project `gojjibom`; only `FIREBASE_SERVICE_ACCOUNT` secret is required.

## Out of scope
- No product/feature UI changes beyond surfacing the API base for the smoke test.
- No backend or infra changes; no push to the remote.
