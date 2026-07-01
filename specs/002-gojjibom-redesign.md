# 002 — 고찌봄 redesign (medication check-in app)

## Goal
Replace the "기억카드" (memory-card) app with **고찌봄**, a family medication check-in app, matching
the Figma wireframe (https://show-vital-49401643.figma.site). Two roles share one app shell:
어르신 (senior) and 보호자·복지사 (caregiver / social worker).

## Assumptions
- Wireframe fidelity: match layout, copy (Korean), flow, and the design system below. Pixel-perfect
  is not required; faithful structure + tokens is.
- No real backend in this task. Use static mock data (domain in `src/lib/`), consistent with the
  prior mock pattern. Today is fixed to the wireframe's "2026년 7월 2일 목요일".
- The wireframe's top 어르신/보호자·복지사 toggle is reproduced as a preview switch in the app shell.
- Senior screens are large / high-contrast (accessibility); caregiver screens are denser.

## Design system (tokens)
- Brand (primary): royal blue. `brand-600 #3b5bdb` (buttons, active tab, links), `brand-50/100` for
  info surfaces.
- Success: green. `success-600 #1c8f4d`, `success-100 #d6f4e0` (완료 badges, check circles, meal chips).
- Warn: amber. `warn-100 #fef3c7`, `warn-700 #b45309` (확인 필요 alert, missed-day dot).
- Neutrals: headings `stone-900`, body `stone-500/600`, chips `stone-100`, card border `stone-200`,
  surface white. Page background white/`stone-50`.
- Radius: cards `rounded-3xl` (~24px), buttons/chips `rounded-xl/rounded-full`.
- Type: system-ui / Apple SD Gothic Neo / Noto Sans KR (existing). Senior body ~ text-xl/2xl.
- Shell: iPhone frame (dynamic island, 9:41 status bar, home indicator) around a 390px-wide viewport,
  with the role toggle above it — mirrors the wireframe.

## Routes
- `/` → redirect to `/onboarding`.
- Senior: `/onboarding` (intro), `/senior/register` (QR/코드), `/senior/connected`, `/senior` (home
  "오늘 먹을 약"), `/senior/dose` (check-in "지금 드실 약이에요"), `/senior/done` ("잘 하셨어요").
- Caregiver: `/caregiver` (dashboard "어머니 복약 상태").
- Top toggle: 어르신 → `/senior`, 보호자·복지사 → `/caregiver`.

## Screens
### Senior
1. **Onboarding `/onboarding`** — 💊 pill, "고찌봄", "가족이 함께 챙기는 복약 안부"; primary
   "보호자·복지사로 시작하기" (→ /caregiver), secondary "어르신 기기로 시작하기" (→ /senior/register);
   "이미 계정이 있어요 · 로그인" link; disclaimer "약을 추천하지 않습니다. 약국에서 등록한 복약 정보만 안내합니다."
2. **Register `/senior/register`** — back + "어르신 기기 등록"; "어르신 휴대폰을 등록해요" + body; segmented
   "QR 스캔 (추천)" / "연결 코드"; dark scanner box (green corner marks, camera) "보호자에게 받은 QR을 비춰주세요";
   "QR 스캔 시뮬레이션 →" (shows "QR 스캔 완료!" success, then → /senior/connected); footnote shield line.
3. **Connected `/senior/connected`** — green check, "연결됐어요!", "이제 알림에 응답만 하면 돼요.", blue callout
   "복잡한 설정은 없어요. 알림이 오면 버튼 하나만 누르면 됩니다."; bottom primary "오늘 약 보기" (→ /senior).
4. **Home `/senior` "오늘 먹을 약"** — date + bell; next-dose card: "⏰ 다음 약" badge + "오후 7:30",
   "저녁약 · 1번 봉지", meta "약 3개 · 🍽 식후 30분 · 오후 7:30 알림", info chip "💊 혈압약이 포함돼 있어요",
   outlined "📷 약 사진 보기"; section "오늘 복약 현황": rows [아침약 08:30 식후30분 · 3개 모두 드셨어요 · 완료],
   [점심약 12:00 식전30분 · 완료], [저녁약 19:30 식후30분 · 잠시 후 알림이 와요 · 예정]. Tapping upcoming → /senior/dose.
5. **Check-in `/senior/dose` "지금 드실 약이에요"** — voice banner "🔊 음성 안내 중" + "다시 듣기"; huge "오후 7:30";
   "저녁 식사 오후 7시 기준"; dashed box w/ pill + packet "1"; "저녁약 · 1번 봉지 / 약 3개"; quote box
   "저녁 식사 30분 후...1번 봉지를 꺼내 약 3개를 모두 드세요."; "약 사진 보기"; primary "네, 먹었어요 ✓" (→ /senior/done);
   secondary red "📞 도와주세요".
6. **Done `/senior/done` "잘 하셨어요!"** — green check, "저녁약을 드셨어요.", blue callout "👥 가족에게도 전해졌어요.",
   chip "오후 7:32 · 저녁약 1번 봉지 · 완료", primary "오늘 약 홈으로" (→ /senior).

### Caregiver
7. **Dashboard `/caregiver` "어머니 복약 상태"** — eyebrow "복약 모니터링"; title + avatars; chips "가족 2명",
   "사회복지사 1명" + "관리 →"; **오늘 복약** list (아침/점심 완료, 저녁 예정); **✓ 오늘의 복용 확인** (완료 아침약
   08:32·음성 확인, 완료 점심약 12:08·버튼 확인, 예정 저녁약) + footnote "앱의 확인 결과는 보조 정보입니다.";
   **💊 약 개수 추적** (blue-accent card): 3개 남은 개수 / 7월 14일 예상 소진일 / D-13 재처방 D-day + "개수 상세 보기";
   **최근 7일 요약**: 7 day dots (월–금 완료, 토 경고, 일 없음); **확인 필요 — 저녁약** (amber alert): "마지막 알림
   오후 7:30 · 재알림 3회 · 15분 경과", chips [1차 +5분][2차 10분][3차 15분][에스컬레이션], "타임라인 보기" / "📞 전화하기".

## Domain (mock, `src/lib/types.ts` + `mock.ts`)
- `DoseStatus = 'done' | 'upcoming' | 'missed'`, `ConfirmMethod = 'voice' | 'button'`.
- `Dose { id, label('아침약'), time('08:30'), mealTag('식후 30분'|'식전 30분'), pillCount, packetNo,
  status, note, confirmedAt?, confirmMethod? }`.
- `NextDose` (subset of Dose + alarmTime, includesNote '혈압약이 포함돼 있어요', spokenText).
- `PillTracking { remaining, runOutDate, refillDDay }`, `WeekDay { label, status }`,
  `EscalationAlert { doseLabel, lastAlarm, retries, minutesElapsed, steps[] }`,
  `CareCircle { family, social }`.
- Static fixture for "어머니", date "2026년 7월 2일 목요일".

## Acceptance criteria
- [ ] All routes above render; senior + caregiver reachable via the top toggle.
- [ ] Copy and layout match the wireframe screens; design tokens applied.
- [ ] Old memory-card code (routes/components/lib/tests) removed; no dead imports.
- [ ] `index.html` title/description → 고찌봄; smoke test updated.
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` all pass on clean `npm ci`.

## Out of scope
- Real auth/backend, real QR camera, push notifications, TTS audio (use existing SpeechSynthesis only if trivial; otherwise omit).
- Fully fleshed secondary screens (개수 상세, 타임라인, 관리, 약 사진, 알림함, 로그인, 도와주세요): provide
  reachable lightweight stubs or no-op affordances; note as follow-ups. Core captured screens are full.
