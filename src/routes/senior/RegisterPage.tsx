import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// BarcodeDetector is not in the TS DOM lib yet; describe the minimal shape we use.
type DetectedBarcode = { rawValue: string };
type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]> };
type BarcodeDetectorCtor = new (options?: { formats: string[] }) => BarcodeDetectorLike;

export function RegisterPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'qr' | 'code'>('qr');
  const [scanned, setScanned] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (tab !== 'qr' || scanned) {
      return;
    }
    let cancelled = false;
    let frame = 0;

    function proceed() {
      if (cancelled) {
        return;
      }
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setScanned(true);
      window.setTimeout(() => navigate('/senior/connected'), 1200);
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
      if (Ctor) {
        try {
          detector = new Ctor({ formats: ['qr_code'] });
        } catch {
          detector = null;
        }
      }

      async function tick() {
        if (cancelled || !detector || !videoRef.current) {
          return;
        }
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            proceed();
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
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [tab, scanned, navigate]);

  function connectManually() {
    setScanned(true);
    window.setTimeout(() => navigate('/senior/connected'), 1200);
  }

  return (
    <div className="flex min-h-full flex-col px-6 pb-8 pt-1">
      <div className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          aria-label="뒤로"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-stone-900">어르신 기기 등록</h1>
      </div>

      <h2 className="mt-3 text-3xl font-extrabold leading-snug text-stone-900">
        어르신 휴대폰을
        <br />
        등록해요
      </h2>
      <p className="mt-3 text-base leading-relaxed text-stone-500">
        보호자가 만든 가족방에 이 기기를 연결해요.
        <br />
        이후에는 로그인 없이 큰 화면으로 쓸 수 있어요.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1">
        {(['qr', 'code'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl py-3 text-base font-bold transition ${
              tab === key ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-500'
            }`}
          >
            {key === 'qr' ? 'QR 스캔 (추천)' : '연결 코드'}
          </button>
        ))}
      </div>

      {tab === 'qr' ? (
        <div className="mt-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-[#0e1726] p-4">
          {scanned ? (
            <div className="flex flex-col items-center gap-4 text-white">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-500">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-lg font-bold">QR 스캔 완료!</p>
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
                아래 버튼이나 ‘연결 코드’로 진행해주세요.
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
                보호자에게 받은 QR을 비춰주세요
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-stone-200 p-6">
          <p className="text-center text-base text-stone-500">가족방 연결 코드 6자리를 입력하세요</p>
          <div className="mt-4 flex justify-center gap-2">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <span
                key={index}
                className="flex h-12 w-10 items-center justify-center rounded-xl border-2 border-stone-200 text-xl font-bold text-stone-300"
              >
                •
              </span>
            ))}
          </div>
        </div>
      )}

      {!scanned && (
        <button
          type="button"
          onClick={connectManually}
          className="mt-4 w-full rounded-2xl bg-success-50 py-4 text-base font-bold text-success-700"
        >
          {tab === 'qr' ? 'QR 없이 연결하기 (데모)' : '연결 코드 확인 →'}
        </button>
      )}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-stone-400">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        연결되면 이 기기에서는 로그인이 필요 없어요.
      </p>
    </div>
  );
}
