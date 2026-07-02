// 음성 안내(TTS) 카탈로그.
// 샘플 mp3는 미리 생성해 public/audio/voices/ 에 정적 배포한다(라이브 합성 호출 없이 fetch → 비용 0).
// BE voice-guide/voice-settings API가 붙기 전까지 FE는 이 카탈로그의 기본 음성을 재생한다.

export type VoiceId = 'kore' | 'aoede' | 'leda' | 'zephyr' | 'charon' | 'orus' | 'iapetus';

export type VoiceOption = {
  id: VoiceId;
  label: string;
  description: string;
  gender: 'female' | 'male';
  sampleUrl: string;
};

export const VOICE_CATALOG: VoiceOption[] = [
  { id: 'kore', label: 'Kore', description: '따뜻하고 친근한', gender: 'female', sampleUrl: '/audio/voices/kore.mp3' },
  { id: 'aoede', label: 'Aoede', description: '또렷하고 신뢰감 있는', gender: 'female', sampleUrl: '/audio/voices/aoede.mp3' },
  { id: 'leda', label: 'Leda', description: '부드럽고 차분한', gender: 'female', sampleUrl: '/audio/voices/leda.mp3' },
  { id: 'zephyr', label: 'Zephyr', description: '활기차고 밝은', gender: 'female', sampleUrl: '/audio/voices/zephyr.mp3' },
  { id: 'charon', label: 'Charon', description: '깊고 안정감 있는', gender: 'male', sampleUrl: '/audio/voices/charon.mp3' },
  { id: 'orus', label: 'Orus', description: '따뜻하고 친근한', gender: 'male', sampleUrl: '/audio/voices/orus.mp3' },
  { id: 'iapetus', label: 'Iapetus', description: '차분하고 안정적인', gender: 'male', sampleUrl: '/audio/voices/iapetus.mp3' },
];

// 기본 음성: 어르신 대상 복약 안내에 적합한 따뜻하고 친근한 톤.
export const DEFAULT_VOICE_ID: VoiceId = 'kore';

export function getVoice(id: VoiceId = DEFAULT_VOICE_ID): VoiceOption {
  return VOICE_CATALOG.find((voice) => voice.id === id) ?? VOICE_CATALOG[0];
}
