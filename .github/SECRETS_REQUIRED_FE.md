# FE GitHub Secrets

## Required secret

CI/CD를 위해 필요한 secret은 **하나뿐**입니다.

```text
FIREBASE_SERVICE_ACCOUNT
```

## 설명

```text
FIREBASE_SERVICE_ACCOUNT: Firebase Hosting 배포 권한이 있는 서비스 계정 JSON 전체
```

Firebase 프로젝트 ID(`gojjibom`), API 주소(`https://api.stdiodh.xyz/api`), 데모 모드(`VITE_DEMO_MODE=true`)는
`.firebaserc`와 `.github/workflows/deploy.yml`에 이미 반영되어 있어 별도 secret이 필요 없습니다.

## 등록 방법

GitHub 레포 -> Settings -> Secrets and variables -> **Actions** -> **New repository secret**

- Name: `FIREBASE_SERVICE_ACCOUNT`
- Secret: 서비스 계정 JSON 전체 (Variables 탭이 아니라 Secrets 탭이어야 합니다)

또는 gh CLI:

```bash
gh secret set FIREBASE_SERVICE_ACCOUNT < firebase-service-account.json
```

서비스 계정 JSON은 절대 레포지토리에 커밋하지 마세요. `firebase-service-account.json`은 `.gitignore`에 포함되어 있지만, 커밋 전 `git status`로 반드시 확인하세요.
