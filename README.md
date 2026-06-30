# 티키타카 기억카드 FE

어르신의 추억 이야기를 청년의 질문과 답장으로 기록하고, 한 장의 기억카드로 만드는 해커톤용 웹앱 FE입니다. Firebase Hosting에 배포 가능한 정적 React SPA 뼈대이며, BE API가 준비되지 않아도 mock fallback으로 시연할 수 있습니다.

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
├── .github/workflows/
├── firebase.json
├── package.json
└── vite.config.ts
```

## 로컬 실행 방법

```bash
npm ci
cp .env.example .env
npm run dev
```

기본 개발 서버는 Vite 기본값인 `http://localhost:5173`입니다.

## 환경변수

`.env.example`을 `.env`로 복사한 뒤 값을 채웁니다.

```text
VITE_API_BASE_URL=https://api.example.com
VITE_FRONTEND_BASE_URL=https://example.web.app
VITE_USE_MOCK_API=false
```

- `VITE_API_BASE_URL`: AWS BE API 서버 주소
- `VITE_FRONTEND_BASE_URL`: Firebase Hosting 주소
- `VITE_USE_MOCK_API`: `true`면 API 호출 없이 mock 데이터를 사용합니다. `false`여도 API 실패 시 mock fallback이 동작합니다.

## Firebase Hosting 배포 준비

Firebase 프로젝트를 만든 뒤 `.firebaserc.example`을 복사해 실제 프로젝트 ID를 입력합니다.

```bash
cp .firebaserc.example .firebaserc
```

```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

로컬 수동 배포:

```bash
npm run build
firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID
```

`firebase.json`은 Vite build 결과인 `dist`를 배포하고, SPA 라우팅을 위해 모든 요청을 `/index.html`로 rewrite합니다. `/audio/**`는 긴 캐시 헤더를 사용합니다.

## GitHub Secrets 등록 방법

필수 Secret 목록은 `.github/SECRETS_REQUIRED_FE.md`에도 정리되어 있습니다.

```text
FIREBASE_PROJECT_ID
FIREBASE_SERVICE_ACCOUNT
VITE_API_BASE_URL
VITE_FRONTEND_BASE_URL
VITE_USE_MOCK_API
```

등록 예시:

```bash
gh secret set FIREBASE_PROJECT_ID --body "your-firebase-project-id"
gh secret set FIREBASE_SERVICE_ACCOUNT < firebase-service-account.json
gh secret set VITE_API_BASE_URL --body "https://api.example.com"
gh secret set VITE_FRONTEND_BASE_URL --body "https://example.web.app"
gh secret set VITE_USE_MOCK_API --body "false"
```

Firebase 서비스 계정 JSON은 절대 레포지토리에 커밋하지 마세요.

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

## CI/CD 설명

- `.github/workflows/fe-ci.yml`
  - `main`, `develop` 대상 push와 pull request에서 실행
  - `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test -- --run`, `npm run build`
  - GitHub Secrets가 없어도 fallback env로 CI가 깨지지 않게 구성
- `.github/workflows/fe-deploy-firebase.yml`
  - `main` push 또는 수동 실행에서 Firebase Hosting 배포
  - `FIREBASE_SERVICE_ACCOUNT` Secret을 임시 파일로 쓰고 `GOOGLE_APPLICATION_CREDENTIALS`로 인증
  - `FIREBASE_PROJECT_ID` Secret을 project id로 사용

## MVP 한계

- 실제 회원, 인증, 권한 관리는 없습니다.
- 카드 저장과 공유는 BE API가 실패하면 세션 저장소와 mock 데이터로만 이어집니다.
- 질문은 주제별 첫 번째 질문만 표시합니다.
- MP3 파일 업로드 UI는 없습니다. 파일은 레포의 `public/audio/questions/`에 직접 추가합니다.
- 자동 음성 인터뷰나 AI 질문 생성은 포함하지 않았습니다.
