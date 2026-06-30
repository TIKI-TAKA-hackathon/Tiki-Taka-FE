# 질문 MP3 파일 관리

이 폴더는 Firebase Hosting 정적 파일로 배포되는 질문 음성 MP3를 보관합니다.

## 경로 규칙

- 파일 위치: `public/audio/questions/`
- 배포 후 URL 예시: `/audio/questions/topic-1-question-1.mp3`
- API의 `audioUrl` 값은 위와 같은 public 경로 또는 절대 URL을 내려주면 됩니다.

## 권장 파일명

```text
topic-{topicId}-question-{questionId}.mp3
```

예:

```text
topic-1-question-1.mp3
```

## 주의사항

- MP3 파일이 없거나 재생에 실패하면 브라우저 `SpeechSynthesis`가 `ko-KR`로 질문을 읽습니다.
- Firebase Hosting은 `/audio/**`에 긴 캐시 헤더를 적용합니다. 같은 파일명으로 음성을 바꾸면 사용자 브라우저에 이전 파일이 남을 수 있으므로 파일명을 변경하세요.
- 실제 개인정보가 포함된 음성 파일은 넣지 마세요.
