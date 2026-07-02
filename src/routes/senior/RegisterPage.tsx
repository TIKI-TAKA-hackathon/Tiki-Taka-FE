import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton, TextField } from '../../components/ui';
import { findCareGroupBySeniorPhone, getCareGroup, requestOtp, verifyOtp } from '../../lib/api';
import { env } from '../../lib/env';
import { digitsOnly, formatPhone, isValidPhone } from '../../lib/phone';
import { loadSession, saveSession } from '../../lib/session';

type Step = 'phone' | 'otp';

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  // Demo mode pre-fills the senior's registered phone + OTP so the flow is 1-tap.
  const [phone, setPhone] = useState(env.demoMode ? '010-9876-5432' : '');
  const [otp, setOtp] = useState(env.demoMode ? '123456' : '');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const phoneValid = isValidPhone(phone);
  const otpValid = /^\d{6}$/.test(otp);

  async function sendCode() {
    setError(null);
    if (!phoneValid) {
      setError('휴대폰 번호를 정확히 입력해주세요.');
      return;
    }
    await requestOtp(digitsOnly(phone));
    setStep('otp');
  }

  async function connect() {
    setError(null);
    setBusy(true);
    try {
      const ok = await verifyOtp(digitsOnly(phone), otp);
      if (!ok) {
        setError('인증 코드 6자리를 정확히 입력해주세요.');
        return;
      }
      // Find the care group the caregiver registered this phone into, then confirm it exists.
      const pairing = await findCareGroupBySeniorPhone(phone);
      const group = await getCareGroup(pairing.careGroupId);
      const existing = loadSession();
      saveSession({
        careGroupId: group.id,
        seniorId: group.senior.id,
        ownerUserId: existing?.ownerUserId ?? group.senior.id,
        seniorPhone: digitsOnly(phone),
      });
      navigate('/senior/connected');
    } catch {
      setError('연결하지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col px-6 pb-8 pt-1">
      <div className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={() => (step === 'otp' ? setStep('phone') : navigate('/onboarding'))}
          aria-label="뒤로"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-600"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-stone-900">어르신 기기 연결</h1>
      </div>

      {step === 'phone' ? (
        <div className="flex flex-1 flex-col">
          <h2 className="mt-3 text-3xl font-extrabold leading-snug text-stone-900">
            휴대폰 번호를
            <br />
            입력해주세요
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-stone-500">
            보호자가 등록한 번호를 넣으면
            <br />
            보호자 방에 연결돼요.
          </p>
          <div className="mt-8">
            <TextField
              id="senior-phone"
              label="휴대폰 번호"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(value) => setPhone(formatPhone(value))}
              placeholder="010-0000-0000"
              maxLength={13}
              autoFocus
            />
          </div>
          {error && <p className="mt-3 text-base font-semibold text-warn-700">{error}</p>}
          <div className="mt-auto pt-6">
            <PrimaryButton size="lg" onClick={sendCode} disabled={!phoneValid}>
              인증번호 받기
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <h2 className="mt-3 text-3xl font-extrabold leading-snug text-stone-900">
            문자로 받은
            <br />
            숫자 6자리를 넣어주세요
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-stone-500">{formatPhone(phone)}로 보냈어요.</p>
          <div className="mt-8">
            <TextField
              id="senior-otp"
              label="인증 코드"
              inputMode="numeric"
              value={otp}
              onChange={(value) => setOtp(digitsOnly(value).slice(0, 6))}
              placeholder="6자리 숫자"
              maxLength={6}
              autoFocus
            />
          </div>
          {error && <p className="mt-3 text-base font-semibold text-warn-700">{error}</p>}
          <div className="mt-auto pt-6">
            <PrimaryButton size="lg" onClick={connect} disabled={!otpValid || busy}>
              {busy ? '연결하는 중…' : '연결하기'}
            </PrimaryButton>
          </div>
        </div>
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
