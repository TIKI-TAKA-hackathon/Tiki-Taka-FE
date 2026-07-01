# CLAUDE.md — 고찌봄 (Tiki-Taka) Frontend

Implementer rules for this repo (Vite + React 19 + TypeScript). The review checklist and the
verification gates live in `AGENTS.md`; the reviewer prompt is `prompts/reviewer.md`.

## Think before coding
- State the goal in one or two sentences before changing anything.
- If the request is ambiguous and a wrong implementation would be costly, ask first.
- Trivial fixes (typos, obvious type errors) — just do them.

## Simplicity first
- Write the minimum code that satisfies the task.
- No speculative features, abstractions, premature configurability, or defensive handling
  for impossible cases.

## Surgical changes
- Touch only the files the task requires; match the existing style.
- Do not reformat or refactor unrelated code. Every changed line traces to the task.
- If you find unrelated problems, mention them instead of fixing them.

## TypeScript
- Idiomatic TypeScript. No `any`; avoid non-null `!` that hides real nullability.
- Keep nullable types explicit. Request/response types must match the backend DTOs.

## Verify with commands
- Before finishing, make these green: `npm run lint && npx tsc --noEmit && npm test && npm run build`.
- If a gate cannot run, say why and describe the manual checks performed.

## Reporting
- Conclusion first: what changed, verification results, honest risks. Do not overstate certainty.

## Comments
- Code comments in English only.
