# FE GitHub Secrets

## Required Secrets

```text
FIREBASE_PROJECT_ID
FIREBASE_SERVICE_ACCOUNT
VITE_API_BASE_URL
VITE_FRONTEND_BASE_URL
VITE_USE_MOCK_API
```

## 설명

```text
FIREBASE_PROJECT_ID: Firebase 프로젝트 ID
FIREBASE_SERVICE_ACCOUNT: Firebase Hosting 배포 권한이 있는 서비스 계정 JSON 전체
VITE_API_BASE_URL: AWS API 서버 주소, 예: https://api.tikitaka.example.com
VITE_FRONTEND_BASE_URL: Firebase Hosting 주소, 예: https://tikitaka.web.app
VITE_USE_MOCK_API: true 또는 false
```

## gh CLI 등록 예시

```bash
gh secret set FIREBASE_PROJECT_ID --body "your-firebase-project-id"
gh secret set FIREBASE_SERVICE_ACCOUNT < firebase-service-account.json
gh secret set VITE_API_BASE_URL --body "https://api.example.com"
gh secret set VITE_FRONTEND_BASE_URL --body "https://example.web.app"
gh secret set VITE_USE_MOCK_API --body "false"
```

서비스 계정 JSON은 절대 레포지토리에 커밋하지 마세요. 로컬에 받은 `firebase-service-account.json` 파일은 `.gitignore`에 포함되어 있지만, 커밋 전 `git status`로 반드시 확인하세요.
