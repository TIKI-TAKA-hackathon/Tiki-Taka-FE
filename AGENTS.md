# Frontend — Vite / React 19 / TypeScript
(Codex acts as reviewer only here. Rules live in CLAUDE.md. Below is the checklist to enforce on a diff.)
## Review checklist (FE)
Flag only what breaks correctness or a stated requirement.
Correctness & state
- Behavior matches the SPEC; state transitions correct.
- effect dependencies correct; no state update after unmount; no stale closures.
- loading / empty / error states all handled — never assume the API succeeds.
Types & API contract
- No `any`; no non-null `!` that hides real nullability.
- Request/response types match the backend DTOs (contract drift is the #1 cross-stack bug).
Rendering & perf
- No needless re-renders; virtualize large lists.
- Memoize only where it measurably matters.
Security
- No XSS via raw HTML injection (dangerouslySetInnerHTML) of untrusted data.
- No secrets in the bundle; no sensitive data in localStorage; no tokens in URLs.
Accessibility
- Semantic elements, labels, keyboard nav, focus handling; aria only where needed.
Consistency & tests
- Follows existing component patterns; no unrelated reformatting.
- No leftover console.log/debugger; no swallowed promise rejections.
- Behavior tests for logic; edge case per branch.
## Verify (implementer must make these green)
npm run lint && npx tsc --noEmit && npm test && npm run build
