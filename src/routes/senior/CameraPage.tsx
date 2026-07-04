import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DemoImage, PrimaryButton, SecondaryButton, SeniorActionZone, SeniorHomeButton } from '../../components/ui';
import { DEMO_DAYS } from '../../lib/demoImages';
import { seniorDay } from '../../lib/mock';
import { shareDosePhoto } from '../../lib/shareStore';
import { useCaregiverExitAlert } from '../../lib/useCaregiverExitAlert';

const DEMO_FALLBACK_PHOTO = DEMO_DAYS[0].path;
const CAREGIVER_PHONE = '01012345678';

export function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [retakeCount, setRetakeCount] = useState(0);
  const shouldCallCaregiver = retakeCount >= 3;

  useCaregiverExitAlert(!completed, {
    id: 'senior-camera-exit',
    title: '사진 확인 중 앱을 벗어났어요',
    body: '어르신이 복약 사진 확인을 마치지 못했어요. 확인이 필요해요.',
  });

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
          setError('카메라를 사용할 수 없어 예시 사진으로 계속할게요.');
        }
      }
    }

    if (!photo && !shouldCallCaregiver) {
      void start();
    }

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [photo, shouldCallCaregiver]);

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
    setCompleted(true);
    navigate('/senior/done');
  }

  function useFallbackPhoto() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setError(null);
    setPhoto(DEMO_FALLBACK_PHOTO);
  }

  function retake() {
    setRetakeCount((count) => count + 1);
    setPhoto(null);
    setError(null);
  }

  return (
    <div className="relative flex min-h-full flex-col px-[var(--gjb-screen-x)] pt-[var(--gjb-screen-top)]">
      <SeniorHomeButton />
      {photo ? (
        <>
          <h1 className="text-[length:var(--gjb-senior-subtitle)] font-extrabold leading-snug text-stone-900">이 사진이 약이 맞나요?</h1>
          <p className="mt-1 text-base text-stone-500">
            {shouldCallCaregiver ? '사진이 헷갈리면 보호자에게 바로 전화하세요.' : '맞으면 보호자에게 보여드릴게요.'}
          </p>
          <div className="mt-4 min-h-0 flex-1">
            <DemoImage
              src={photo}
              alt="넣은 약 봉지 사진"
              className="h-full max-h-full w-full rounded-3xl object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center rounded-3xl bg-stone-100 p-6 text-center text-base font-semibold text-stone-400">
                  예시 사진을 아직 준비 중이에요.
                </div>
              }
            />
          </div>
          <SeniorActionZone className="pb-8 pt-4">
            {shouldCallCaregiver ? (
              <a
                href={`tel:${CAREGIVER_PHONE}`}
                className="gjb-pill-btn gjb-senior-action-link flex w-full flex-1 items-center justify-center gap-2 px-5 font-extrabold text-stone-900 transition active:scale-[0.99]"
              >
                📞 보호자에게 전화하기
              </a>
            ) : (
              <PrimaryButton tone="success" size="xl" className="flex-1" onClick={confirmPhoto}>
                ✓ 네, 맞아요
              </PrimaryButton>
            )}
            {!shouldCallCaregiver && (
              <SecondaryButton size="lg" onClick={retake}>
                ↻ 다시
              </SecondaryButton>
            )}
          </SeniorActionZone>
        </>
      ) : (
        <>
          <h1 className="text-[length:var(--gjb-senior-subtitle)] font-extrabold leading-snug text-stone-900">
            {shouldCallCaregiver ? '대표 보호자에게 전화하세요' : '약 봉지 사진'}
          </h1>
          <p className="text-base text-stone-500">
            {shouldCallCaregiver ? '사진이 계속 헷갈리면 보호자가 함께 확인할게요.' : '약 봉지를 사진으로 남겨 보호자에게 보여주세요.'}
          </p>

          <div className="mt-4 min-h-0 flex-1">
            {shouldCallCaregiver ? (
              <div className="flex h-full min-h-[clamp(16rem,46dvh,18rem)] w-full items-center justify-center rounded-3xl bg-warn-50 p-6 text-center text-base font-semibold text-warn-700">
                사진을 다시 확인하기 어려우면 대표 보호자에게 바로 전화하세요.
              </div>
            ) : error ? (
              <div className="flex h-full min-h-[clamp(16rem,46dvh,18rem)] w-full items-center justify-center rounded-3xl bg-warn-50 p-6 text-center text-base font-semibold text-warn-700">
                {error}
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full min-h-[clamp(16rem,46dvh,18rem)] w-full rounded-3xl bg-stone-900 object-cover"
              />
            )}
          </div>

          <SeniorActionZone className="pb-8 pt-4">
            {shouldCallCaregiver ? (
              <a
                href={`tel:${CAREGIVER_PHONE}`}
                className="gjb-pill-btn gjb-senior-action-link flex w-full flex-1 items-center justify-center gap-2 px-5 font-extrabold text-stone-900 transition active:scale-[0.99]"
              >
                📞 보호자에게 전화하기
              </a>
            ) : !error ? (
              <PrimaryButton size="xl" className="flex-1" onClick={capture}>
                📷 사진 촬영
              </PrimaryButton>
            ) : (
              <PrimaryButton size="xl" className="flex-1" onClick={useFallbackPhoto}>
                📷 예시 사진으로 계속
              </PrimaryButton>
            )}
          </SeniorActionZone>
        </>
      )}
    </div>
  );
}
