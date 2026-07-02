// 실제 복약 안내 음성(TTS) 정적 클립 — templateVersion v1.
// 미리 생성해 public/audio/guide/ 에 정적 배포한다(재생 시 라이브 합성 호출 없이 fetch → 비용 0).
// 문구:
//   detailEnvelope "저녁 식사 30분 후, 약을 드실 시간입니다. 봉지를 꺼내 약을 모두 드세요." (봉지)
//   detailPill     "저녁 식사 30분 후, 약을 드실 시간입니다. 이번 칸의 약을 모두 드세요." (약통)
//   done           "잘하셨어요. 가족에게 알렸어요."
//   help           "가족에게 도움 요청을 보냈어요."

const GUIDE_AUDIO_CACHE_VERSION = '20260703-tts';

export const GUIDE_AUDIO = {
  detailEnvelope: `/audio/guide/detail_envelope.mp3?v=${GUIDE_AUDIO_CACHE_VERSION}`,
  detailPill: `/audio/guide/detail_pill.mp3?v=${GUIDE_AUDIO_CACHE_VERSION}`,
  done: `/audio/guide/done.mp3?v=${GUIDE_AUDIO_CACHE_VERSION}`,
  help: `/audio/guide/help.mp3?v=${GUIDE_AUDIO_CACHE_VERSION}`,
} as const;

export type DispensingType = 'pouch' | 'organizer';

// 조제형태에 따라 상세 안내 클립을 고른다: 봉지(pouch)=envelope, 약통(organizer)=칸(pill).
export function detailGuideUrl(dispensingType: DispensingType = 'pouch'): string {
  return dispensingType === 'organizer' ? GUIDE_AUDIO.detailPill : GUIDE_AUDIO.detailEnvelope;
}
