# 고찌봄 · 복약 안부 (FE)

가족이 함께 챙기는 복약 안부 서비스. 어르신은 정해진 시간에 **알림을 받아 원터치(또는 음성)로 복약을 확인**하고, 보호자·복지사는 **실시간으로 복약 상태를 모니터링**합니다. Firebase Hosting에 배포되는 React SPA이며, BE가 준비되지 않아도 데모(mock) 데이터로 시연할 수 있습니다.

> 두 역할을 한 앱에서 다룹니다: **어르신**, **보호자·복지사**. 역할은 온보딩에서 진입합니다.

## 프로젝트 구조

레포 루트가 FE 루트입니다.

```text
.
├── src/
│   ├── components/      # AppLayout(반응형 셸), 공용 UI(버튼·배지·카드 등)
│   ├── lib/             # api.ts(데이터 계층), types.ts, mock.ts, env.ts, useAsync, shareStore
│   ├── routes/
│   │   ├── senior/      # 온보딩·등록·연결·알림·복약확인·카메라·완료·홈·약사진·알림함·로그인
│   │   └── caregiver/   # 대시보드·개수상세·타임라인·가족방 관리
│   └── styles/
├── specs/               # 스펙(_template, 000~004) + 실서비스화 계획서(003)
├── prompts/reviewer.md
├── .github/workflows/deploy.yml
├── AGENTS.md · CLAUDE.md · loop.sh
├── firebase.json · .firebaserc
├── package.json · vite.config.ts
```

## 로컬 실행

```bash
npm install
cp .env.example .env
npm run dev
```

기본 개발 서버는 `http://localhost:5173`.

## 환경변수

`.env.example`을 `.env`로 복사한 뒤 값을 채웁니다.

```text
VITE_API_BASE_URL=https://api.stdiodh.xyz/api/v1
VITE_FRONTEND_BASE_URL=https://gojjibom.web.app
VITE_DEMO_MODE=false
```

- `VITE_API_BASE_URL`: BE API 서버 주소(`/api/v1`).
- `VITE_FRONTEND_BASE_URL`: Firebase Hosting 주소(미설정 시 `window.location.origin`).
- `VITE_DEMO_MODE`: `true`면 API 호출 없이 데모(mock) 데이터 사용. `false`여도 API 실패 시 mock으로 폴백.

## 화면 · 플로우

- **어르신**: `/senior`(복약 알림) → `지금 확인하기` → `/senior/dose`(지금 드실 약) → `/senior/camera`(약 봉지 촬영·가족 공유) → `/senior/done`(완료, 가족에게 알림) → `/senior/today`(오늘 복약 홈). 최초 설정은 `/senior/register`(QR·연결코드).
- **보호자·복지사**: `/caregiver`(복약 상태 대시보드: 오늘 복약·복용 확인·약 개수·최근 7일·확인 필요 에스컬레이션) + `/caregiver/manage`·`/caregiver/pills`·`/caregiver/timeline`.

## 데이터 계층

화면은 `src/lib/api.ts`를 통해 데이터를 받습니다.

```ts
fetchSeniorDay()      // GET /senior/today   -> SeniorDay
fetchCaregiverBoard() // GET /caregiver/board -> CaregiverBoard
```

- `VITE_DEMO_MODE=true`면 fixture 반환, `false`면 `VITE_API_BASE_URL`로 호출하고 실패 시 fixture로 폴백.
- 응답은 BE 공통 envelope `{ data, error }`를 언랩해 사용합니다.
- 식별자(`seniorId`/`careGroupId`/`date`)는 선택 쿼리 파라미터로 전달할 수 있고, 생략 시 BE가 최신 케어그룹을 사용합니다.
- 실제 BE 계약은 `https://api.stdiodh.xyz/swagger-ui/index.html`에 명세될 예정이며, 실연동/후속 작업은 `specs/003-productionization-plan.md` 참고.

## 개발 루프 (구현 → 게이트 → 리뷰)

기능은 `specs/`에 스펙을 쓴 뒤 `loop.sh`로 돌립니다. Claude가 구현하고, 게이트를 통과하면 Codex가 read-only 리뷰어로 검토합니다.

```bash
./loop.sh specs/<task>.md [max_iters]
```

규칙은 `CLAUDE.md`, 리뷰 체크리스트·검증 게이트는 `AGENTS.md`, 리뷰어 프롬프트는 `prompts/reviewer.md`.

로컬 검증 게이트:

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

## 배포 (Firebase Hosting)

`.firebaserc`에 프로젝트 ID가 `gojjibom`으로 지정돼 있습니다. 로컬 수동 배포:

```bash
npm run build
firebase deploy --only hosting
```

### CI/CD

`.github/workflows/deploy.yml` 하나로 게이트 + 배포를 처리합니다.

- 트리거: `main` push 또는 수동(workflow_dispatch).
- 단계: `npm ci` → lint → `tsc --noEmit` → test → build → Firebase Hosting **live** 배포.
- 빌드 env 고정: `VITE_API_BASE_URL=https://api.stdiodh.xyz/api/v1`, `VITE_DEMO_MODE=true`.
- 필요한 GitHub Secret은 **`FIREBASE_SERVICE_ACCOUNT` 하나**뿐(레포 → Settings → Secrets and variables → **Actions**). 자세한 건 `.github/SECRETS_REQUIRED_FE.md`.

## MVP 한계 (현재 데모 범위)

- 실제 인증·실데이터·서버 푸시는 미연동(현재 `VITE_DEMO_MODE=true`, mock).
- 알림은 앱 내 알림 화면 + (권한 시)브라우저 로컬 알림으로 시연. 앱이 닫힌 상태의 실제 푸시/카카오 알림톡은 BE 연동 필요.
- 카메라 복약 사진은 실제 촬영되지만, 가족 공유는 현재 같은 세션 내 인메모리(실전파는 BE 필요).
- 로드맵과 BE 계약은 `specs/003-productionization-plan.md` 참고.
