import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, TextField } from '../../components/ui';
import { getCareGroup, verifyPairingCode } from '../../lib/api';
import { env } from '../../lib/env';
import { digitsOnly, formatPhone, isValidPhone } from '../../lib/phone';
import { loadSession, saveSession } from '../../lib/session';

export function RegisterPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(env.demoMode ? '010-9876-5432' : '');
  const [code, setCode] = useState(env.demoMode ? '123456' : '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const phoneValid = isValidPhone(phone);
  const codeValid = /^\d{6}$/.test(code);

  async function connect() {
    setError(null);
    if (!phoneValid) {
      setError('보호자가 등록한 휴대폰 번호를 정확히 입력해주세요.');
      return;
    }
    if (!codeValid) {
      setError('연결 코드 6자리를 정확히 입력해주세요.');
      return;
    }
    setBusy(true);
    try {
      const pairing = await verifyPairingCode(code);
      const group = await getCareGroup(pairing.careGroupId);
      const owner = group.members.find((member) => member.role === 'OWNER') ?? group.members[0];
      const existing = loadSession();
      saveSession({
        careGroupId: group.id,
        seniorId: pairing.seniorId,
        ownerUserId: existing?.ownerUserId ?? owner?.user.id ?? group.senior.id,
        seniorPhone: digitsOnly(phone),
      });
      navigate('/senior/connected');
    } catch {
      setError('보호자 화면의 6자리 숫자를 다시 확인해주세요.');
    } finally {
      setBusy(false);
    }
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
        <h1 className="text-xl font-bold text-stone-900">어르신 기기 연결</h1>
      </div>

      <div className="flex flex-1 flex-col">
        <h2 className="mt-3 text-3xl font-extrabold leading-snug text-stone-900">
          휴대폰 번호와
          <br />
          숫자 6자리를 넣어주세요
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-stone-500">
          보호자가 등록한 번호와
          <br />
          연결 코드를 입력하면 바로 연결돼요.
        </p>
        <div className="mt-8 space-y-4">
          <TextField
            id="senior-phone"
            label="어르신 휴대폰 번호"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(value) => setPhone(formatPhone(value))}
            placeholder="010-0000-0000"
            maxLength={13}
            autoFocus
          />
          <TextField
            id="senior-pairing-code"
            label="연결 코드"
            inputMode="numeric"
            value={code}
            onChange={(value) => setCode(digitsOnly(value).slice(0, 6))}
            placeholder="6자리 숫자"
            maxLength={6}
          />
        </div>
        {error && <p className="mt-3 text-base font-semibold text-warn-700">{error}</p>}
        <div className="mt-auto pt-6">
          <PrimaryButton size="lg" onClick={connect} disabled={!phoneValid || !codeValid || busy}>
            {busy ? '연결하는 중…' : '연결하기'}
          </PrimaryButton>
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-stone-400">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
        연결되면 이 기기에서는 로그인이 필요 없어요.
      </p>
    </div>
  );
}
