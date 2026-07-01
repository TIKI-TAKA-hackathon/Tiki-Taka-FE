# 004 — API 데이터 계층 (mock → 실 API 어댑터)

## Goal
화면이 하드코드 mock 대신 데이터 계층을 통해 데이터를 받도록 바꾼다. 지금은 mock을 반환하되,
`https://api.stdiodh.xyz/swagger-ui/index.html` 에 명세될 실 API로 코드 변경 없이 전환할 수 있는 구조.

## Assumptions
- 실 API는 추후 Swagger에 명세됨. 지금은 엔드포인트 미확정 → mock 반환.
- `VITE_DEMO_MODE=true`(현재 배포 기본값)면 mock, `false`면 `VITE_API_BASE_URL`로 실제 호출 + 실패 시 mock fallback.
- 무거운 의존성 추가 없이 시작(react-query는 M1에서 도입 검토).

## API contract (임시)
- `GET /senior/today` → `SeniorDay`
- `GET /caregiver/board` → `CaregiverBoard`
- Swagger 확정 시 경로/DTO를 `src/lib/api.ts`와 `src/lib/types.ts`에 맞춘다(계약 드리프트 주의).

## Acceptance criteria
- [ ] `src/lib/api.ts`: `fetchSeniorDay()`, `fetchCaregiverBoard()` — demo-mode면 mock, 아니면 fetch + fallback.
- [ ] `src/lib/useAsync.ts`: loading/error/data 상태 훅(언마운트 안전).
- [ ] 어르신 홈 + 보호자 대시보드가 데이터 계층 경유, 로딩/에러 상태 렌더.
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` green.

## Out of scope
- 나머지 화면의 데이터화(정적 UI 위주 → 후속), react-query 도입, 인증 헤더(005), 실제 엔드포인트 구현(BE).
