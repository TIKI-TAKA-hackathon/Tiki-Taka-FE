import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, PrimaryButton, TextField } from '../../components/ui';
import { requestOtp, verifyOtp } from '../../lib/api';
import { digitsOnly, formatPhone, isValidPhone } from '../../lib/phone';

export function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const phoneValid = isValidPhone(phone);
  const codeValid = /^\d{6}$/.test(code);

  async function sendCode() {
    setError(null);
    if (!phoneValid) {
      setError('휴대폰 번호를 정확히 입력해주세요.');
      return;
    }
    await requestOtp(digitsOnly(phone));
    setCodeSent(true);
  }

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const ok = await verifyOtp(digitsOnly(phone), code);
      if (!ok) {
        setError('인증 코드 6자리를 정확히 입력해주세요.');
        return;
      }
      navigate('/caregiver');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="로그인" />
      <div className="flex flex-1 flex-col gap-4 px-6">
        <TextField
          id="phone"
          label="휴대폰 번호"
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(value) => setPhone(formatPhone(value))}
          placeholder="010-0000-0000"
          maxLength={13}
          autoFocus
        />
        {!codeSent ? (
          <PrimaryButton onClick={sendCode} disabled={!phoneValid}>
            인증번호 받기
          </PrimaryButton>
        ) : (
          <>
            <TextField
              id="code"
              label="인증 코드"
              inputMode="numeric"
              value={code}
              onChange={(value) => setCode(digitsOnly(value).slice(0, 6))}
              placeholder="6자리 숫자"
              maxLength={6}
            />
            <PrimaryButton onClick={submit} disabled={!codeValid || busy}>
              {busy ? '로그인 중…' : '로그인'}
            </PrimaryButton>
          </>
        )}
        {error && <p className="text-sm font-semibold text-warn-700">{error}</p>}
        <p className="mt-2 text-center text-sm text-stone-400">
          어르신 기기는 로그인 없이 휴대폰 번호로 연결할 수 있어요.
        </p>
      </div>
    </div>
  );
}
