import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CheckCircle, DemoImage, PrimaryButton, SeniorActionZone, SeniorHomeButton } from '../../components/ui';
import { fetchPrescriptionByCode, getMealTimes } from '../../lib/api';
import { buildPrescriptionAlarmPreviews, type PrescriptionAlarmPreview } from '../../lib/prescriptionSchedule';
import { loadSession } from '../../lib/session';
import { seniorNameWithHonorific } from '../../lib/seniorName';
import type { ConfirmMedsView } from '../../lib/types';
import { useCaregiverExitAlert } from '../../lib/useCaregiverExitAlert';

type Step = 'scan' | 'place' | 'medicines' | 'alarms' | 'done';

const DEMO_REGISTRATION_CODE = 'RX0012024';
const DEMO_SENIOR_ID = 'demo-senior';

export function SeniorAddPrescriptionPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [step, setStep] = useState<Step>('scan');
  const [view, setView] = useState<ConfirmMedsView | null>(null);
  const [alarmPreviews, setAlarmPreviews] = useState<PrescriptionAlarmPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [completed, setCompleted] = useState(false);

  const seniorLabel = seniorNameWithHonorific(view?.seniorDisplayName);

  useCaregiverExitAlert(!completed, {
    id: 'senior-prescription-exit',
    title: '약 등록 중 앱을 벗어났어요',
    body: '어르신이 처방 QR 등록을 마치지 못했어요. 확인이 필요해요.',
  });

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (step !== 'scan' || scanComplete) {
      return undefined;
    }
    let cancelled = false;
    setCameraReady(false);
    setCameraError(false);

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera unavailable');
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setCameraReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        if (!cancelled) {
          setCameraReady(false);
          setCameraError(true);
        }
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [scanComplete, step, stopStream]);

  useEffect(() => {
    if (cameraReady && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraReady]);

  const completeScan = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    stopStream();
    try {
      const seniorId = loadSession()?.seniorId ?? DEMO_SENIOR_ID;
      const [prescription, mealTimes] = await Promise.all([
        fetchPrescriptionByCode(DEMO_REGISTRATION_CODE),
        getMealTimes(seniorId),
      ]);
      setView(prescription);
      setAlarmPreviews(buildPrescriptionAlarmPreviews(prescription.schedules, mealTimes));
      setScanComplete(true);
    } finally {
      setLoading(false);
    }
  }, [loading, stopStream]);

  function captureQr() {
    const video = videoRef.current;
    if (video && cameraReady && video.videoWidth > 0 && video.videoHeight > 0) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch {
        // 캡처 실패 시에도 데모 QR 검증은 버튼 입력으로 진행한다.
      }
    }
    void completeScan();
  }

  function confirm() {
    if (step === 'scan') {
      if (!scanComplete) {
        return;
      }
      setStep('place');
      return;
    }
    if (step === 'place') {
      setStep('medicines');
      return;
    }
    if (step === 'medicines') {
      setStep('alarms');
      return;
    }
    if (step === 'alarms') {
      setCompleted(true);
      setStep('done');
      return;
    }
    setCompleted(true);
    navigate('/senior/today', { replace: true });
  }

  return (
    <div className="relative flex min-h-full flex-col px-[var(--gjb-screen-x)] pt-[var(--gjb-screen-top)]">
      <SeniorHomeButton />
      {step === 'scan' && (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="gjb-senior-scan-shell mx-auto mt-3 flex aspect-square shrink-0 items-center justify-center overflow-hidden bg-stone-900 shadow-[var(--gjb-shadow-soft)]">
            <div className="relative h-full w-full">
              {scanComplete ? (
                <div className="flex h-full w-full items-center justify-center rounded-3xl bg-success-50">
                  <span className="text-[length:var(--gjb-senior-icon)] text-success-700">✓</span>
                </div>
              ) : (
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full rounded-3xl bg-stone-800 object-cover" />
              )}
              {!scanComplete && !cameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-stone-800">
                  <span className="text-[length:var(--gjb-senior-icon)]">▦</span>
                </div>
              )}
              {!scanComplete && cameraError && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-stone-800 p-6 text-center text-lg font-bold text-white">
                  카메라를 사용할 수 없어요.
                </div>
              )}
              <ScanFrame />
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center text-center">
            <h1 className="gjb-senior-title font-extrabold text-stone-900">
              {scanComplete ? '처방 QR을 읽었어요' : '처방 QR을 비춰주세요'}
            </h1>
            <p className="gjb-senior-copy mt-3 text-stone-500">
              {loading ? (
                <>
                  QR 내용을
                  <br />
                  확인하고 있어요.
                </>
              ) : scanComplete ? (
                <>
                  이제 하나씩 확인하면
                  <br />
                  약 알림이 등록돼요.
                </>
              ) : cameraError ? (
                <>
                  데모 QR로
                  <br />
                  계속 진행할게요.
                </>
              ) : (
                <>
                  약국에서 받은 QR을
                  <br />
                  카메라에 보여주세요.
                </>
              )}
            </p>
          </div>
          {scanComplete ? (
            <ConfirmButton onClick={confirm} />
          ) : (
            <SeniorActionZone className="pb-8 pt-4">
              <PrimaryButton size="xl" tone="success" className="flex-1" disabled={loading} onClick={captureQr}>
                {loading ? 'QR 확인 중…' : cameraError ? '데모 QR로 계속하기' : 'QR 촬영하기'}
              </PrimaryButton>
            </SeniorActionZone>
          )}
        </div>
      )}

      {step === 'place' && view && (
        <StepLayout title="처방된 곳이에요" description={`${seniorLabel} 약으로 확인됐어요.`} onConfirm={confirm}>
          <Card className="space-y-4 p-5">
            <InfoRow label="처방 병원" value={view.hospitalName ?? '처방 병원'} />
            <InfoRow label="조제 약국" value={view.pharmacyName} />
            <InfoRow label="처방 날짜" value={view.prescribedDateLabel} />
          </Card>
        </StepLayout>
      )}

      {step === 'medicines' && view && (
        <StepLayout title="등록할 약이에요" description="약 종류를 확인했어요." onConfirm={confirm}>
          <div className="space-y-3">
            {(view.medicines ?? []).map((medicine) => (
              <Card key={medicine.name} className="flex items-center gap-4 p-5">
                <DemoImage
                  src={medicine.image ?? '/mock/pill-placeholder.jpg'}
                  alt={`${medicine.name} 사진`}
                  className="h-24 w-24 shrink-0 rounded-3xl object-cover"
                  fallback={
                    <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-stone-100 text-5xl">
                      💊
                    </span>
                  }
                />
                <div>
                  <h2 className="text-2xl font-extrabold text-stone-900">{medicine.name}</h2>
                  <p className="mt-2 text-lg leading-relaxed text-stone-500">{medicine.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </StepLayout>
      )}

      {step === 'alarms' && (
        <StepLayout title="식사 시간에 맞춰 알려드릴게요" description="보호자가 정한 식사 시간으로 계산했어요." onConfirm={confirm}>
          <div className="space-y-3">
            {alarmPreviews.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-stone-900">{item.displayName}</h2>
                    <p className="mt-1 text-lg font-semibold text-brand-700">{item.alarmLabel}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-base font-bold text-stone-500">
                    {item.packetLabel}
                  </span>
                </div>
                <p className="mt-3 text-base font-semibold text-stone-500">{item.mealLabel}</p>
                <p className="mt-1 text-base text-stone-500">
                  {item.basisLabel} · {item.pillText}
                </p>
              </Card>
            ))}
          </div>
        </StepLayout>
      )}

      {step === 'done' && (
        <div className="flex min-h-0 flex-1 flex-col px-1 text-center">
          <div className="flex flex-1 flex-col items-center justify-center">
            <CheckCircle />
            <h1 className="gjb-senior-title mt-6 font-extrabold text-stone-900">약 등록이 끝났어요</h1>
            <p className="gjb-senior-copy mt-3 text-stone-500">
              {seniorLabel} 오늘 약 홈에
              <br />
              새 알림을 넣었어요.
            </p>
          </div>
          <ConfirmButton onClick={confirm} />
        </div>
      )}
    </div>
  );
}

function StepLayout({
  children,
  description,
  onConfirm,
  title,
}: {
  children: ReactNode;
  description: string;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="py-4">
        <h1 className="gjb-senior-title font-extrabold text-stone-900">{title}</h1>
        <p className="gjb-senior-copy mt-3 text-stone-500">{description}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-5">{children}</div>
      <ConfirmButton onClick={onConfirm} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-base font-semibold text-stone-400">{label}</p>
      <p className="mt-1 text-[length:var(--gjb-senior-subtitle)] font-extrabold leading-snug text-stone-900">{value}</p>
    </div>
  );
}

function ConfirmButton({ onClick }: { onClick: () => void }) {
  return (
    <SeniorActionZone className="pb-8 pt-4">
      <PrimaryButton size="xl" tone="success" className="flex-1" onClick={onClick}>
        확인
      </PrimaryButton>
    </SeniorActionZone>
  );
}

function ScanFrame() {
  return (
    <>
      <span className="absolute left-4 top-4 h-10 w-10 rounded-tl-2xl border-l-4 border-t-4 border-success-500" />
      <span className="absolute right-4 top-4 h-10 w-10 rounded-tr-2xl border-r-4 border-t-4 border-success-500" />
      <span className="absolute bottom-4 left-4 h-10 w-10 rounded-bl-2xl border-b-4 border-l-4 border-success-500" />
      <span className="absolute bottom-4 right-4 h-10 w-10 rounded-br-2xl border-b-4 border-r-4 border-success-500" />
      <span className="absolute left-8 right-8 top-1/2 h-1 -translate-y-1/2 rounded-full bg-success-500" />
    </>
  );
}
