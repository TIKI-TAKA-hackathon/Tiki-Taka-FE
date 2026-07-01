import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, PrimaryButton, SecondaryButton } from '../../components/ui';
import { seniorDay } from '../../lib/mock';
import { shareDosePhoto } from '../../lib/shareStore';

export function CameraPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
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
          setError('카메라를 사용할 수 없어요. 카메라 권한을 허용했는지 확인해주세요.');
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

  function send() {
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

  return (
    <div className="flex min-h-full flex-col px-6 pb-8">
      <BackHeader title="약 봉지 사진" />
      <p className="text-base text-stone-500">약 봉지를 찍어 가족에게 보여주세요.</p>

      <div className="mt-4 flex-1">
        {error ? (
          <div className="rounded-3xl bg-warn-50 p-6 text-center text-base font-semibold text-warn-700">
            {error}
          </div>
        ) : photo ? (
          <img src={photo} alt="촬영한 약 봉지" className="aspect-[3/4] w-full rounded-3xl object-cover" />
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
        {!error && !photo && (
          <PrimaryButton onClick={capture}>📷 촬영하기</PrimaryButton>
        )}
        {photo && (
          <>
            <PrimaryButton tone="success" onClick={send}>
              가족에게 보내기
            </PrimaryButton>
            <SecondaryButton onClick={() => setPhoto(null)}>다시 찍기</SecondaryButton>
          </>
        )}
        <button
          type="button"
          onClick={() => navigate('/senior/done')}
          className="w-full py-2 text-base font-semibold text-stone-400 underline underline-offset-4"
        >
          사진 없이 완료
        </button>
      </div>
    </div>
  );
}
