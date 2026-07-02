import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, PrimaryButton, SecondaryButton } from '../../components/ui';
import { seniorDay } from '../../lib/mock';
import { shareDosePhoto } from '../../lib/shareStore';

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
          <p className="mt-1 text-base text-stone-500">맞으면 가족에게 보여드릴게요.</p>
          <div className="mt-4 flex-1">
            <img
              src={photo}
              alt="넣은 약 봉지 사진"
              className="aspect-[3/4] w-full rounded-3xl object-cover"
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
          <p className="text-base text-stone-500">약 봉지를 사진으로 남겨 가족에게 보여주세요.</p>

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
