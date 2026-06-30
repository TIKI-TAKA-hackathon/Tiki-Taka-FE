type SpeakOptions = {
  text: string;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
};

export function canUseSpeechSynthesis(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

export function stopSpeechSynthesis() {
  if (canUseSpeechSynthesis()) {
    window.speechSynthesis.cancel();
  }
}

export function speakKoreanText({ text, rate = 0.85, onStart, onEnd, onError }: SpeakOptions): boolean {
  if (!canUseSpeechSynthesis()) {
    return false;
  }

  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = rate;
  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onError?.();

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
