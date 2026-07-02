import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, Card, PrimaryButton, SecondaryButton, TextField } from '../../components/ui';
import { createPrescription } from '../../lib/api';
import { loadSession } from '../../lib/session';
import type { CreatePrescriptionRequest } from '../../lib/types';

// Pharmacy-side registration (D-A): the pharmacist pre-creates the prescription and hands
// the senior/caregiver the issued registration code, which is later scanned or entered.

// A simple preset dose schedule so the create body is valid without building a full editor.
function buildRequest(
  pharmacistUserId: number,
  pharmacyName: string,
  registrationCode: string,
): CreatePrescriptionRequest {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  return {
    pharmacistUserId,
    pharmacy: { name: pharmacyName, phone: '02-000-0000' },
    prescribedDate: today,
    startDate: today,
    dispensingType: 'POUCH',
    registrationCode,
    schedules: [
      {
        slot: 'MORNING',
        label: '아침약',
        scheduledTime: '08:30:00',
        mealRelation: 'AFTER_MEAL',
        pillCount: 3,
        doseBasis: 'AFTER_MEAL',
        items: [{ medicationName: '혈압약', count: 1 }],
      },
      {
        slot: 'DINNER',
        label: '저녁약',
        scheduledTime: '19:30:00',
        mealRelation: 'AFTER_MEAL',
        pillCount: 3,
        doseBasis: 'AFTER_MEAL',
        items: [{ medicationName: '혈압약', count: 1 }],
      },
    ],
  };
}

// RX + 6 digits, e.g. 'RX482013'.
function generateCode(): string {
  return `RX${Math.floor(100000 + Math.random() * 900000)}`;
}

export function RegisterPrescriptionPage() {
  const navigate = useNavigate();
  const session = loadSession();
  const [pharmacyName, setPharmacyName] = useState('행복약국');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    const code = generateCode();
    try {
      const seniorId = session?.seniorId ?? 'demo-senior';
      const pharmacistUserId = Number(session?.ownerUserId) || 1;
      const result = await createPrescription(seniorId, buildRequest(pharmacistUserId, pharmacyName.trim(), code));
      setIssuedCode(result.registrationCode ?? code);
    } catch {
      setError('처방 등록에 실패했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!issuedCode) {
      return;
    }
    try {
      await navigator.clipboard.writeText(issuedCode);
      setCopied(true);
    } catch {
      // Clipboard may be unavailable; the code is still shown for manual entry.
      setCopied(false);
    }
  }

  if (issuedCode) {
    return (
      <div className="flex min-h-full flex-col gap-4 px-6 pb-10 pt-1">
        <BackHeader title="약국 처방 등록" />
        <h2 className="text-2xl font-extrabold text-stone-900">처방이 등록됐어요</h2>
        <p className="text-base leading-relaxed text-stone-500">
          아래 등록 코드를 어르신 앱에서 스캔하거나
          <br />
          직접 입력하면 복약 정보가 연결돼요.
        </p>

        <Card className="p-6 text-center">
          <p className="text-sm font-semibold text-stone-400">등록 코드</p>
          <p className="mt-2 select-all text-4xl font-extrabold tracking-widest text-brand-700">{issuedCode}</p>
        </Card>

        <div className="mt-2 space-y-3">
          <PrimaryButton onClick={copyCode}>{copied ? '복사됐어요 ✓' : '코드 복사하기'}</PrimaryButton>
          <SecondaryButton onClick={() => navigate('/caregiver')}>완료</SecondaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-4 px-6 pb-10 pt-1">
      <BackHeader title="약국 처방 등록" />
      <h2 className="text-2xl font-extrabold text-stone-900">처방을 등록해요</h2>
      <p className="text-base leading-relaxed text-stone-500">
        약국 정보를 입력하면 등록 코드가 발급돼요.
        <br />
        발급된 코드는 어르신 앱에서 스캔·입력해 연결해요.
      </p>

      <div className="mt-2 space-y-4">
        <TextField
          id="pharmacy-name"
          label="약국 이름"
          value={pharmacyName}
          onChange={setPharmacyName}
          placeholder="예) 행복약국"
        />
        <TextField
          id="display-name"
          label="처방 이름 (선택)"
          value={displayName}
          onChange={setDisplayName}
          placeholder="예) 6월 정기 처방"
          hint="보호자 방에서 이 처방을 구분하는 이름이에요."
        />
      </div>

      {error && <p className="mt-1 text-base font-semibold text-warn-700">{error}</p>}

      <div className="mt-2">
        <PrimaryButton onClick={() => void submit()} disabled={loading || pharmacyName.trim().length === 0}>
          {loading ? '등록하는 중…' : '처방 등록하고 코드 발급'}
        </PrimaryButton>
      </div>
    </div>
  );
}
