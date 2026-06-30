import { useCallback, useEffect, useRef, useState } from 'react';
import { speakKoreanText, stopSpeechSynthesis } from '../lib/tts';
import type { Question } from '../lib/types';

type PlaybackMode = 'idle' | 'mp3' | 'tts';

type QuestionVoiceCardProps = {
  question: Question;
};

export function QuestionVoiceCard({ question }: QuestionVoiceCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('idle');
  const [message, setMessage] = useState('버튼을 누르면 질문을 들을 수 있어요.');

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    stopSpeechSynthesis();
    setPlaybackMode('idle');
    setMessage('재생이 멈췄어요.');
  }, []);

  const startTts = useCallback(
    (rate: number) => {
      const didStart = speakKoreanText({
        text: question.ttsText,
        rate,
        onStart: () => {
          setPlaybackMode('tts');
          setMessage('브라우저 음성으로 읽는 중이에요.');
        },
        onEnd: () => {
          setPlaybackMode('idle');
          setMessage('질문을 다 들었어요.');
        },
        onError: () => {
          setPlaybackMode('idle');
          setMessage('음성 읽기에 실패했어요. 화면의 질문을 읽어 주세요.');
        },
      });

      if (!didStart) {
        setPlaybackMode('idle');
        setMessage('이 브라우저는 음성 읽기를 지원하지 않아요.');
      }
    },
    [question.ttsText],
  );

  const playQuestion = useCallback(
    async (slow: boolean) => {
      stopPlayback();
      const baseRate = question.readSpeed ?? 0.85;
      const ttsRate = slow ? Math.max(0.6, baseRate - 0.15) : baseRate;

      if (!question.audioUrl) {
        startTts(ttsRate);
        return;
      }

      const audio = new Audio(question.audioUrl);
      audioRef.current = audio;
      setPlaybackMode('mp3');
      setMessage('녹음된 질문을 재생하는 중이에요.');

      audio.onended = () => {
        setPlaybackMode('idle');
        setMessage('질문을 다 들었어요.');
      };
      audio.onerror = () => {
        audioRef.current = null;
        startTts(ttsRate);
      };

      try {
        await audio.play();
      } catch {
        audioRef.current = null;
        startTts(ttsRate);
      }
    },
    [question.audioUrl, question.readSpeed, startTts, stopPlayback],
  );

  useEffect(() => {
    setPlaybackMode('idle');
    setMessage('버튼을 누르면 질문을 들을 수 있어요.');

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopSpeechSynthesis();
    };
  }, [question.id]);

  return (
    <section className="rounded-lg border-2 border-warm-200 bg-white p-6 shadow-sm">
      <p className="text-3xl font-bold leading-snug text-stone-950">{question.displayText}</p>
      <p className="mt-4 rounded-lg bg-warm-50 px-4 py-3 font-semibold text-warm-700" aria-live="polite">
        {message}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => playQuestion(true)}
          className="rounded-lg bg-leaf-700 px-6 py-4 text-lg font-bold text-white shadow-sm hover:bg-leaf-500"
        >
          천천히 듣기
        </button>
        <button
          type="button"
          onClick={() => playQuestion(false)}
          className="rounded-lg bg-warm-700 px-6 py-4 text-lg font-bold text-white shadow-sm hover:bg-warm-500"
        >
          다시 듣기
        </button>
        <button
          type="button"
          onClick={stopPlayback}
          disabled={playbackMode === 'idle'}
          className="rounded-lg border-2 border-stone-300 bg-white px-6 py-4 text-lg font-bold text-stone-800 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          정지
        </button>
      </div>
    </section>
  );
}
