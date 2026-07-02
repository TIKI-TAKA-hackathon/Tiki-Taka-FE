import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, Card, CheckCircle, PrimaryButton, SecondaryButton, TextField } from '../../components/ui';
import { fetchPrescriptionByCode } from '../../lib/api';
import { env } from '../../lib/env';
import { pouchLabelForSchedule } from '../../lib/prescriptionSchedule';
import type { ConfirmMedsView } from '../../lib/types';

// BarcodeDetector is not in the TS DOM lib yet; describe the minimal shape we use.
type DetectedBarcode = { rawValue: string };
type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]> };
type BarcodeDetectorCtor = new (options?: { formats: string[] }) => BarcodeDetectorLike;

type Step = 'scan' | 'confirm' | 'done';

// '식후' + 30분 → '식후 30분' / '식전' + 0 → '식전'. offsetMin is minutes relative to the meal.
function basisLabel(doseBasis: string, offsetMin: number): string {
  return offsetMin > 0 ? `${doseBasis} ${offsetMin}분` : doseBasis;
}

export function AddPrescriptionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('scan');
  const [cameraError, setCameraError] = useState(false);
  // Demo mode pre-fills a manual registration code so "코드로 등록하기" works in one tap
  // (fetchPrescriptionByCode falls back to the fixture regardless of the code value).
  const [manualCode, setManualCode] = useState(env.demoMode ? 'RX0012024' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ConfirmMedsView | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const lookup = useCallback(async (code: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await fetchPrescriptionByCode(code);
      setView(result);
      setStep('confirm');
    } catch {
      setError('처방 정보를 불러오지 못했어요. 코드를 확인하고 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Live camera QR scan (BarcodeDetector). Falls back to manual code entry when unavailable.
  useEffect(() => {
    if (step !== 'scan') {
      return;
    }
    let cancelled = false;
    let frame = 0;

    function stopStream() {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    async function start() {
      let detector: BarcodeDetectorLike | null = null;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) {
          setCameraError(true);
        }
        return;
      }

      const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (!Ctor) {
        // Camera works but QR decoding is unsupported: keep the preview and offer manual entry.
        setCameraError(true);
        return;
      }
      try {
        detector = new Ctor({ formats: ['qr_code'] });
      } catch {
        setCameraError(true);
        return;
      }

      async function tick() {
        if (cancelled || !detector || !videoRef.current) {
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          const raw = codes[0]?.rawValue;
          if (raw) {
            cancelled = true;
            stopStream();
            void lookup(raw);
            return;
          }
        } catch {
          // ignore per-frame detection errors
        }
        frame = window.requestAnimationFrame(() => void tick());
      }

      frame = window.requestAnimationFrame(() => void tick());
    }

    void start();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      stopStream();
    };
  }, [step, lookup]);

  function rescan() {
    setView(null);
    setError(null);
    setManualCode('');
    setCameraError(false);
    setStep('scan');
  }

  // D-A: the prescription is already persisted + ACTIVE (created by the pharmacy).
  // "맞아요" is an activation confirmation — no POST is issued here.
  if (step === 'done' && view) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 pb-10 pt-1 text-center">
        <CheckCircle />
        <h2 className="text-2xl font-extrabold text-stone-900">{view.seniorDisplayName}님 약이 등록됐어요</h2>
        <p className="text-base leading-relaxed text-stone-500">
          이제 복약 시간에 맞춰
          <br />
          알림이 전달돼요.
        </p>
        <div className="mt-2 w-full">
          <PrimaryButton tone="success" onClick={() => navigate('/caregiver')}>
            복약 상태 보기
          </PrimaryButton>
        </div>
      </div>
    );
  }

  if (step === 'confirm' && view) {
    return (
      <div className="flex min-h-full flex-col gap-4 px-6 pb-10 pt-1">
        <BackHeader title="약 등록" />
        <h2 className="text-2xl font-extrabold text-stone-900">
          {view.seniorDisplayName}님 약이 맞나요?
        </h2>
        <p className="text-base text-stone-500">
          {view.pharmacyName} · {view.prescribedDateLabel} 조제
        </p>

        <ul className="space-y-2.5">
          {view.schedules.map((schedule, index) => (
            <Card key={`${schedule.displayName}-${index}`} className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900">{schedule.displayName}</h3>
                <span className="text-sm font-semibold text-stone-400">
                  {pouchLabelForSchedule(schedule.displayName, schedule.dispensingNumber)}
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-stone-400">복용 기준</dt>
                <dd className="text-right font-semibold text-stone-700">
                  {basisLabel(schedule.doseBasis, schedule.offsetMin)}
                </dd>
                <dt className="text-stone-400">하루 횟수</dt>
                <dd className="text-right font-semibold text-stone-700">{schedule.timesPerDay}회</dd>
                <dt className="text-stone-400">1회 복용량</dt>
                <dd className="text-right font-semibold text-stone-700">{schedule.pillCount}개</dd>
                <dt className="text-stone-400">조제일수</dt>
                <dd className="text-right font-semibold text-stone-700">{schedule.dispensedDays}일분</dd>
              </dl>
              {schedule.dispensedDays > 1 && (
                <p className="mt-3 rounded-2xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                  매일 같은 복용 순서로 반복돼요.
                </p>
              )}
            </Card>
          ))}
        </ul>

        <div className="mt-2 space-y-3">
          <PrimaryButton tone="success" onClick={() => setStep('done')}>
            맞아요
          </PrimaryButton>
          <SecondaryButton onClick={rescan}>다시 스캔</SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col px-6 pb-8 pt-1">
      <BackHeader title="약 등록" />
      <h2 className="mt-1 text-2xl font-extrabold text-stone-900">처방 QR을 스캔해요</h2>
      <p className="mt-2 text-base leading-relaxed text-stone-500">
        약국에서 받은 처방 등록 QR을 비추면
        <br />
        복약 정보가 자동으로 등록돼요.
      </p>

      <div className="mt-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-[#0e1726] p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3 text-white">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            <p className="text-base font-bold">처방 정보를 불러오는 중…</p>
          </div>
        ) : cameraError ? (
          <div className="flex flex-col items-center gap-3 px-4 text-center text-stone-300">
            <svg className="h-9 w-9 text-success-500" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="6" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            <p className="text-sm">
              카메라를 켤 수 없어요.
              <br />
              아래에 등록 코드를 직접 입력해주세요.
            </p>
          </div>
        ) : (
          <div className="relative h-full w-full">
            <video ref={videoRef} autoPlay muted playsInline className="h-full w-full rounded-2xl object-cover" />
            <span className="absolute left-1 top-1 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-success-500" />
            <span className="absolute right-1 top-1 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-success-500" />
            <span className="absolute bottom-1 left-1 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-success-500" />
            <span className="absolute bottom-1 right-1 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-success-500" />
            <p className="absolute inset-x-0 bottom-3 text-center text-sm font-medium text-white/85">
              처방 QR을 비춰주세요
            </p>
          </div>
        )}
      </div>

      <div className="mt-5">
        <TextField
          id="prescription-code"
          label="등록 코드 직접 입력"
          value={manualCode}
          onChange={setManualCode}
          placeholder="약국에서 받은 코드"
          hint="QR을 스캔할 수 없을 때 코드를 직접 입력하세요."
        />
      </div>
      {error && <p className="mt-3 text-base font-semibold text-warn-700">{error}</p>}
      <div className="mt-4">
        <PrimaryButton onClick={() => void lookup(manualCode.trim())} disabled={loading || manualCode.trim().length === 0}>
          {loading ? '불러오는 중…' : '코드로 등록하기'}
        </PrimaryButton>
      </div>
    </div>
  );
}
