# <NNN> — <Task title>

## Goal
One or two sentences: what this task delivers and why.

## Assumptions
- List the assumptions this task relies on. Call out anything ambiguous.

## API contract
Endpoints touched and their request/response shapes. These MUST match the backend DTOs
(contract drift is the #1 cross-stack bug). Reference `src/lib/types.ts` and `src/lib/api.ts`.

## Acceptance criteria
- [ ] Observable, testable outcome 1.
- [ ] Observable, testable outcome 2.
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` all pass.

## Out of scope
- What this task deliberately does NOT change.
