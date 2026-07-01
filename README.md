# 티키타카 기억카드 FE

어르신의 추억 이야기를 청년의 질문과 답장으로 기록하고, 한 장의 기억카드로 만드는 해커톤용 웹앱 FE입니다. Firebase Hosting에 배포 가능한 정적 React SPA 뼈대이며, BE API가 준비되지 않아도 데모(mock) 데이터로 시연할 수 있습니다.

## 프로젝트 구조

현재 레포 루트가 FE 루트입니다. 별도의 `frontend/` 폴더를 만들지 않았습니다.

```text
.
├── public/audio/questions/
├── src/
│   ├── components/
│   ├── lib/
│   ├── routes/
│   └── styles/
├── prompts/reviewer.md
├── specs/
├── .github/workflows/deploy.yml
├── AGENTS.md
├── CLAUDE.md
├── loop.sh
├── firebase.json
├── .firebaserc
├── package.json
└── vite.config.ts
```

## 로컬 실행 방법

```bash
npm install
cp .env.example .env
npm run dev
```

기본 개발 서버는 Vite 기본값인 `http://localhost:5173`입니다.

## 환경변수

`.env.example`을 `.env`로 복사한 뒤 값을 채웁니다.

```text
VITE_API_BASE_URL=https://api.stdiodh.xyz/api
VITE_FRONTEND_BASE_URL=https://gojjibom.web.app
VITE_DEMO_MODE=false
```

- `VITE_API_BASE_URL`: BE API 서버 주소
- `VITE_FRONTEND_BASE_URL`: Firebase Hosting 주소 (미설정 시 브라우저 `window.location.origin` 사용)
- `VITE_DEMO_MODE`: `true`면 API 호출 없이 데모(mock) 데이터를 사용합니다. `false`여도 API 실패 시 mock fallback이 동작합니다.

## 개발 루프 (구현 -> 게이트 -> 리뷰)

기능 작업은 `specs/`에 스펙을 작성한 뒤 `loop.sh`로 돌립니다. Claude가 구현하고, 게이트(lint·type·test·build)를 통과하면 Codex가 read-only 리뷰어로 검토하여 PASS/FAIL을 냅니다.

```bash
./loop.sh specs/<task>.md [max_iters]
```

- 구현 규칙은 `CLAUDE.md`, 리뷰 체크리스트와 검증 게이트는 `AGENTS.md`, 리뷰어 프롬프트는 `prompts/reviewer.md`에 있습니다.
- 스펙 템플릿: `specs/_template.md`.

검증 게이트를 로컬에서 직접 실행할 때:

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

## Firebase Hosting 배포

`.firebaserc`에 프로젝트 ID가 `gojjibom`으로 지정되어 있습니다.

로컬 수동 배포:

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json`은 Vite build 결과인 `dist`를 배포하고, SPA 라우팅을 위해 모든 요청을 `/index.html`로 rewrite합니다. `/audio/**`는 긴 캐시 헤더를 사용합니다.

## CI/CD (자동 배포)

`.github/workflows/deploy.yml` 하나로 게이트와 배포를 처리합니다.

- 트리거: `main` push 또는 수동 실행(workflow_dispatch)
- 단계: `npm ci` -> `npm run lint` -> `npx tsc --noEmit` -> `npm test` -> `npm run build` -> Firebase Hosting **live** 채널 배포
- 빌드 환경변수는 워크플로우에 고정되어 있습니다: `VITE_API_BASE_URL=https://api.stdiodh.xyz/api`, `VITE_DEMO_MODE=true`
- 프로젝트 ID(`gojjibom`)는 `.firebaserc`와 워크플로우에 반영되어 있습니다.
- lint·type·test·build 중 하나라도 실패하면 배포하지 않습니다.

### 필요한 GitHub Secret (딱 하나)

레포 -> Settings -> Secrets and variables -> **Actions** -> New repository secret

```text
FIREBASE_SERVICE_ACCOUNT   # Firebase Hosting 배포 권한이 있는 서비스 계정 JSON 전체
```

또는 gh CLI:

```bash
gh secret set FIREBASE_SERVICE_ACCOUNT < firebase-service-account.json
```

Firebase 서비스 계정 JSON은 절대 레포지토리에 커밋하지 마세요. 자세한 내용은 `.github/SECRETS_REQUIRED_FE.md`를 참고하세요.

## 질문 MP3 파일 관리 방법

질문 음성 MP3는 `public/audio/questions/` 아래에 넣습니다.

```text
public/audio/questions/topic-1-question-101.mp3
```

배포 후에는 다음 경로로 접근할 수 있습니다.

```text
/audio/questions/topic-1-question-101.mp3
```

API의 `audioUrl`은 위 경로 또는 절대 URL을 내려주면 됩니다. MP3가 없거나 재생에 실패하면 브라우저 `SpeechSynthesis`가 `ko-KR`로 `ttsText`를 읽습니다. 브라우저 자동재생 정책 때문에 음성은 사용자가 버튼을 누른 뒤에만 재생됩니다.

## API 서버 연결 방법

API base URL은 `VITE_API_BASE_URL`에서 읽습니다. API 함수는 `src/lib/api.ts`에 모여 있습니다.

```ts
getTopics()
getQuestions(topicId)
createMemorySession(payload)
saveMemoryAnswer(sessionId, payload)
createCardDraft(sessionId)
publishMemoryCard(cardId)
getSharedCard(shareToken)
```

현재 endpoint path는 FE 뼈대 기준으로 작성했습니다. BE 계약이 확정되면 `src/lib/api.ts`의 path와 payload만 맞추면 됩니다. API 실패 시 화면 전체가 죽지 않도록 mock fallback을 사용합니다.

## MVP 한계

- 실제 회원, 인증, 권한 관리는 없습니다.
- 카드 저장과 공유는 BE API가 실패하면 세션 저장소와 mock 데이터로만 이어집니다.
- 질문은 주제별 첫 번째 질문만 표시합니다.
- MP3 파일 업로드 UI는 없습니다. 파일은 레포의 `public/audio/questions/`에 직접 추가합니다.
- 자동 음성 인터뷰나 AI 질문 생성은 포함하지 않았습니다.
