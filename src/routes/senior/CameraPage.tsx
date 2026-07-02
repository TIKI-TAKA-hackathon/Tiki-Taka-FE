import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, DemoImage, PrimaryButton, SecondaryButton } from '../../components/ui';
import { DEMO_DAYS } from '../../lib/demoImages';
import { seniorDay } from '../../lib/mock';
import { shareDosePhoto } from '../../lib/shareStore';

// Preset demo photos for the "예시 봉지 사진" quick-pick. All demo images are emptied
// medicine pouches; tapping one selects it as the photo (its src is a /mock/... path)
// and enters the same self-check step. day1/day4 are both 아침 pouch shots.
const DEMO_PRESETS = [
  { src: DEMO_DAYS[0].path, label: '아침 봉지' },
  { src: DEMO_DAYS[3].path, label: '아침 봉지' },
] as const;

export function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
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
          setError('카메라를 사용할 수 없어요. 아래 “앨범에서 선택”으로 사진을 넣어주세요.');
        }
      }
    }

    if (!photo) {
      void start();
    }

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [photo]);

  function capture() {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setPhoto(canvas.toDataURL('image/jpeg', 0.8));
  }

  // File upload (camera or album). Reads the selected image to a data URL so the
  // photo works with no backend on demo laptops without a camera.
  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Allow re-selecting the same file after a "다시".
    event.target.value = '';
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setError(null);
        setPhoto(reader.result);
      }
    };
    reader.onerror = () => {
      setError('사진을 불러오지 못했어요. 다시 시도해주세요.');
    };
    reader.readAsDataURL(file);
  }

  // Self-check confirmation: only "네, 맞아요" shares the photo and moves on.
  function confirmPhoto() {
    if (!photo) {
      return;
    }
    shareDosePhoto({
      dataUrl: photo,
      doseLabel: seniorDay.nextDose.label,
      at: seniorDay.nextDose.doneTimeLabel,
    });
    navigate('/senior/done');
  }

  // Quick-pick a preset demo photo (a /mock/... path). Stops the camera and enters
  // the same self-check step as a captured/uploaded photo.
  function pickPreset(src: string) {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setError(null);
    setPhoto(src);
  }

  function retake() {
    setPhoto(null);
    setError(null);
  }

  return (
    <div className="flex min-h-full flex-col px-6 pb-8">
      <BackHeader title="약 봉지 사진" />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onFileSelected}
      />
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      {photo ? (
        <>
          <h1 className="mt-1 text-2xl font-extrabold text-stone-900">이 사진이 약이 맞나요?</h1>
          <p className="mt-1 text-base text-stone-500">맞으면 보호자에게 보여드릴게요.</p>
          <div className="mt-4 flex-1">
            <DemoImage
              src={photo}
              alt="넣은 약 봉지 사진"
              className="aspect-[3/4] w-full rounded-3xl object-cover"
              fallback={
                <div className="flex aspect-[3/4] w-full items-center justify-center rounded-3xl bg-stone-100 p-6 text-center text-base font-semibold text-stone-400">
                  예시 사진을 아직 준비 중이에요.
                </div>
              }
            />
          </div>
          <div className="mt-4 space-y-3">
            <PrimaryButton tone="success" size="lg" onClick={confirmPhoto}>
              ✓ 네, 맞아요
            </PrimaryButton>
            <SecondaryButton size="lg" onClick={retake}>
              ↻ 다시
            </SecondaryButton>
          </div>
        </>
      ) : (
        <>
          <p className="text-base text-stone-500">약 봉지를 사진으로 남겨 보호자에게 보여주세요.</p>

          <div className="mt-4 flex-1">
            {error ? (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-3xl bg-warn-50 p-6 text-center text-base font-semibold text-warn-700">
                {error}
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="aspect-[3/4] w-full rounded-3xl bg-stone-900 object-cover"
              />
            )}
          </div>

          <div className="mt-4 space-y-3">
            {!error && (
              <PrimaryButton size="lg" onClick={capture}>
                📷 사진 촬영
              </PrimaryButton>
            )}
            {error && (
              <PrimaryButton size="lg" onClick={() => cameraInputRef.current?.click()}>
                📷 사진 촬영
              </PrimaryButton>
            )}
            <SecondaryButton size="lg" onClick={() => albumInputRef.current?.click()}>
              🖼 앨범에서 선택
            </SecondaryButton>

            <div className="pt-1">
              <p className="text-sm font-semibold text-stone-400">예시 봉지 사진</p>
              <div className="mt-2 flex gap-2">
                {DEMO_PRESETS.map((preset, index) => (
                  <button
                    key={preset.src}
                    type="button"
                    onClick={() => pickPreset(preset.src)}
                    aria-label={`예시 ${preset.label} 사진 ${index + 1}`}
                    className="flex flex-1 flex-col items-center gap-1 overflow-hidden rounded-2xl border-2 border-stone-200 p-2"
                  >
                    <DemoImage
                      src={preset.src}
                      alt={`예시 ${preset.label} 사진 ${index + 1}`}
                      className="h-16 w-full rounded-xl object-cover"
                      fallback={
                        <span className="flex h-16 w-full items-center justify-center rounded-xl bg-stone-100 text-2xl">
                          💊
                        </span>
                      }
                    />
                    <span className="text-sm font-semibold text-stone-600">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/senior/done')}
              className="w-full py-2 text-sm text-stone-400 underline underline-offset-4"
            >
              사진 없이 완료
            </button>
          </div>
        </>
      )}
    </div>
  );
}
