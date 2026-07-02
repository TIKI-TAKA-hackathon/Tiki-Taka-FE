import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackHeader, PrimaryButton, TextField } from '../../components/ui';
import {
  createCareGroup,
  getCareGroup,
  requestOtp,
  saveSession,
  verifyOtp,
  verifyPairingCode,
} from '../../lib/api';
import { connectLocalCaregiverMember, findLocalCaregiverMemberByPhone } from '../../lib/caregiverMembers';
import { env } from '../../lib/env';
import { digitsOnly, formatPhone, isValidPhone } from '../../lib/phone';

type Step = 'owner' | 'otp' | 'roomCode' | 'group';

export function CaregiverSignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('owner');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: caregiver identity (demo mode pre-fills so the presenter can advance in one tap)
  const [ownerName, setOwnerName] = useState(env.demoMode ? '김보호' : '');
  const [ownerPhone, setOwnerPhone] = useState(env.demoMode ? '010-1234-5678' : '');

  // Step 2: OTP
  const [otp, setOtp] = useState(env.demoMode ? '123456' : '');
  const [roomCode, setRoomCode] = useState(env.demoMode ? '123456' : '');
  const [invitedMemberId, setInvitedMemberId] = useState<string | null>(null);
  const [invitedCareGroupId, setInvitedCareGroupId] = useState<string | null>(null);

  // Step 3: family group + senior
  const [groupName, setGroupName] = useState(env.demoMode ? '우리 엄마 방' : '');
  const [seniorName, setSeniorName] = useState(env.demoMode ? '김순자' : '');
  const [seniorPhone, setSeniorPhone] = useState(env.demoMode ? '010-9876-5432' : '');
  const [seniorBirth, setSeniorBirth] = useState('');
  const [relationship, setRelationship] = useState(env.demoMode ? '딸' : '');

  const ownerValid = ownerName.trim().length > 0 && isValidPhone(ownerPhone);
  const otpValid = /^\d{6}$/.test(otp);
  const roomCodeValid = /^\d{6}$/.test(roomCode);
  const groupValid =
    groupName.trim().length > 0 && seniorName.trim().length > 0 && isValidPhone(seniorPhone);

  async function goToOtp() {
    setError(null);
    setInvitedMemberId(null);
    setInvitedCareGroupId(null);
    if (!ownerValid) {
      setError('이름과 휴대폰 번호를 확인해주세요.');
      return;
    }
    await requestOtp(digitsOnly(ownerPhone));
    setStep('otp');
  }

  async function confirmOtp() {
    setError(null);
    const ok = await verifyOtp(digitsOnly(ownerPhone), otp);
    if (!ok) {
      setError('인증 코드 6자리를 정확히 입력해주세요.');
      return;
    }
    const invite = findLocalCaregiverMemberByPhone(ownerPhone);
    if (invite) {
      setInvitedMemberId(invite.id);
      setInvitedCareGroupId(invite.careGroupId);
      setRoomCode(env.demoMode ? '123456' : '');
      setStep('roomCode');
      return;
    }
    setStep('group');
  }

  async function confirmRoomCode() {
    setError(null);
    if (!roomCodeValid || !invitedMemberId || !invitedCareGroupId) {
      setError('대표자에게 받은 방 코드 6자리를 확인해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const pairing = await verifyPairingCode(roomCode);
      if (pairing.careGroupId !== invitedCareGroupId) {
        setError('초대된 보호자 방의 코드가 아니에요.');
        return;
      }
      const group = await getCareGroup(pairing.careGroupId);
      const hasPrimaryOwner = group.members.some(
        (member) => member.role === 'OWNER' && member.isPrimary && member.status === 'CONNECTED',
      );
      if (!hasPrimaryOwner) {
        setError('대표자가 있는 보호자 방 코드만 사용할 수 있어요.');
        return;
      }
      const connected = connectLocalCaregiverMember(invitedMemberId);
      saveSession({
        careGroupId: group.id,
        seniorId: group.senior.id,
        ownerUserId: connected?.id ?? invitedMemberId,
      });
      navigate('/caregiver');
    } catch {
      setError('대표자에게 받은 방 코드 6자리를 다시 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submit() {
    setError(null);
    if (!groupValid) {
      setError('보호자 방 이름과 어르신 정보를 확인해주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const group = await createCareGroup({
        name: groupName.trim(),
        senior: {
          name: seniorName.trim(),
          phone: digitsOnly(seniorPhone),
          birthDate: seniorBirth || undefined,
        },
        owner: { name: ownerName.trim(), phone: digitsOnly(ownerPhone) },
      });
      const owner = group.members.find((member) => member.role === 'OWNER') ?? group.members[0];
      saveSession({
        careGroupId: group.id,
        seniorId: group.senior.id,
        ownerUserId: owner?.user.id ?? group.senior.id,
        seniorPhone: digitsOnly(seniorPhone),
      });
      navigate('/caregiver');
    } catch {
      setError('보호자 방을 만들지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="보호자 가입" />
      <div className="flex flex-1 flex-col gap-4 px-6">
        {step === 'owner' && (
          <>
            <h2 className="text-2xl font-extrabold text-stone-900">보호자 정보를 입력해요</h2>
            <p className="text-base text-stone-500">복약 상태를 함께 챙길 보호자 본인 정보예요.</p>
            <TextField
              id="owner-name"
              label="이름"
              value={ownerName}
              onChange={setOwnerName}
              placeholder="예) 김영수"
              autoFocus
            />
            <TextField
              id="owner-phone"
              label="휴대폰 번호"
              type="tel"
              inputMode="tel"
              value={ownerPhone}
              onChange={(value) => setOwnerPhone(formatPhone(value))}
              placeholder="010-0000-0000"
              maxLength={13}
            />
            {error && <p className="text-sm font-semibold text-warn-700">{error}</p>}
            <div className="mt-auto pt-4">
              <PrimaryButton onClick={goToOtp} disabled={!ownerValid}>
                인증번호 받기
              </PrimaryButton>
            </div>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="text-2xl font-extrabold text-stone-900">인증번호를 입력해요</h2>
            <p className="text-base text-stone-500">
              {formatPhone(ownerPhone)}로 보낸 6자리 숫자를 입력해주세요.
            </p>
            <TextField
              id="owner-otp"
              label="인증 코드"
              inputMode="numeric"
              value={otp}
              onChange={(value) => setOtp(digitsOnly(value).slice(0, 6))}
              placeholder="6자리 숫자"
              maxLength={6}
              autoFocus
            />
            {error && <p className="text-sm font-semibold text-warn-700">{error}</p>}
            <div className="mt-auto pt-4">
              <PrimaryButton onClick={confirmOtp} disabled={!otpValid}>
                확인
              </PrimaryButton>
            </div>
          </>
        )}

        {step === 'roomCode' && (
          <>
            <h2 className="text-2xl font-extrabold text-stone-900">보호자 방을 인증해요</h2>
            <p className="text-base text-stone-500">
              대표자가 만든 6자리 방 코드를 입력해주세요.
            </p>
            <TextField
              id="caregiver-room-code"
              label="보호자 방 코드"
              inputMode="numeric"
              value={roomCode}
              onChange={(value) => setRoomCode(digitsOnly(value).slice(0, 6))}
              placeholder="6자리 숫자"
              maxLength={6}
              autoFocus
            />
            {error && <p className="text-sm font-semibold text-warn-700">{error}</p>}
            <div className="mt-auto pt-4">
              <PrimaryButton onClick={confirmRoomCode} disabled={!roomCodeValid || submitting}>
                {submitting ? '보호자 방 확인 중…' : '방 연결하기'}
              </PrimaryButton>
            </div>
          </>
        )}

        {step === 'group' && (
          <>
            <h2 className="text-2xl font-extrabold text-stone-900">보호자 방을 만들어요</h2>
            <p className="text-base text-stone-500">어르신을 등록하면 보호자가 함께 복약을 챙길 수 있어요.</p>
            <TextField
              id="group-name"
              label="보호자 방 이름"
              value={groupName}
              onChange={setGroupName}
              placeholder="예) 우리 엄마 방"
              autoFocus
            />
            <TextField
              id="senior-name"
              label="어르신 이름"
              value={seniorName}
              onChange={setSeniorName}
              placeholder="예) 김순자"
            />
            <TextField
              id="senior-phone"
              label="어르신 휴대폰 번호"
              type="tel"
              inputMode="tel"
              value={seniorPhone}
              onChange={(value) => setSeniorPhone(formatPhone(value))}
              placeholder="010-0000-0000"
              maxLength={13}
              hint="어르신이 이 번호로 기기를 연결해요."
            />
            <TextField
              id="senior-relationship"
              label="관계 (선택)"
              value={relationship}
              onChange={setRelationship}
              placeholder="예) 딸"
            />
            <TextField
              id="senior-birth"
              label="어르신 생년월일 (선택)"
              type="date"
              value={seniorBirth}
              onChange={setSeniorBirth}
            />
            {error && <p className="text-sm font-semibold text-warn-700">{error}</p>}
            <div className="mt-auto pt-4">
              <PrimaryButton onClick={submit} disabled={!groupValid || submitting}>
                {submitting ? '보호자 방 만드는 중…' : '보호자 방 만들기'}
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
