import { useCallback, useState } from 'react';
import { Badge, BackHeader, Card, Loading, PrimaryButton, TextField } from '../../components/ui';
import { createPairingCode, getCareGroup } from '../../lib/api';
import {
  addLocalCaregiverMember,
  localCaregiverMemberToCareGroupMember,
  removeLocalCaregiverMember,
} from '../../lib/caregiverMembers';
import { digitsOnly, formatPhone, isValidPhone } from '../../lib/phone';
import { loadSession } from '../../lib/session';
import { seniorNameWithHonorific } from '../../lib/seniorName';
import { useAsync } from '../../lib/useAsync';
import type { CareGroupMember, MemberRole, PairingCode } from '../../lib/types';

const ROLE_LABEL: Record<MemberRole, string> = {
  OWNER: '주 보호자',
  FAMILY: '가족',
  SOCIAL_WORKER: '사회복지사',
};

const ROLE_EMOJI: Record<MemberRole, string> = {
  OWNER: '👤',
  FAMILY: '👨‍👩‍👧',
  SOCIAL_WORKER: '🏥',
};

const DEMO_MEMBER_NAME = '김초대';
const DEMO_MEMBER_PHONE = '010-2222-3333';

export function ManagePage() {
  const session = loadSession();
  const careGroupId = session?.careGroupId;
  const loadGroup = useCallback(() => getCareGroup(careGroupId ?? 'latest'), [careGroupId]);
  const { data: group, loading } = useAsync(loadGroup);

  const [addedMembers, setAddedMembers] = useState<CareGroupMember[]>([]);
  const [pairingBusy, setPairingBusy] = useState(false);
  const [pairingCode, setPairingCode] = useState<PairingCode | null>(null);
  const [resentTo, setResentTo] = useState<string | null>(null);
  const [addingMember, setAddingMember] = useState(false);
  const [memberName, setMemberName] = useState(DEMO_MEMBER_NAME);
  const [memberPhone, setMemberPhone] = useState(DEMO_MEMBER_PHONE);
  const [memberRole, setMemberRole] = useState<Extract<MemberRole, 'FAMILY' | 'SOCIAL_WORKER'>>('FAMILY');
  const [memberMessage, setMemberMessage] = useState<string | null>(null);
  const [removedMemberIds, setRemovedMemberIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<CareGroupMember | null>(null);

  if (loading) {
    return <Loading label="보호자 방을 불러오는 중…" />;
  }

  const members = mergeMembers(group?.members ?? [], addedMembers).filter(
    (member) => !removedMemberIds.includes(member.id),
  );
  const senior = group?.senior;
  const seniorLabel = seniorNameWithHonorific(senior?.name);
  // Senior membership is represented by whether any member has connected as senior.
  const seniorConnected = members.some((member) => member.user.userType === 'SENIOR' && member.status === 'CONNECTED');

  async function createCode() {
    if (!group) {
      return;
    }
    setPairingBusy(true);
    try {
      const code = await createPairingCode(group.id);
      setPairingCode(code);
    } finally {
      setPairingBusy(false);
    }
  }

  function addMember() {
    setMemberMessage(null);
    setDeleteTarget(null);
    if (!group || memberName.trim().length === 0 || !isValidPhone(memberPhone)) {
      setMemberMessage('이름과 휴대폰 번호를 확인해주세요.');
      return;
    }
    const added = addLocalCaregiverMember({
      careGroupId: group.id,
      name: memberName.trim(),
      phone: digitsOnly(memberPhone),
      role: memberRole,
    });
    const addedMember = localCaregiverMemberToCareGroupMember(added);
    setAddedMembers((current) => [
      ...current.filter((member) => member.id !== addedMember.id),
      addedMember,
    ]);
    setMemberName(DEMO_MEMBER_NAME);
    setMemberPhone(DEMO_MEMBER_PHONE);
    setMemberRole('FAMILY');
    setAddingMember(false);
    setMemberMessage('구성원을 추가했어요. 같은 번호로 가입하면 이 방에 연결돼요.');
  }

  function toggleAddMember() {
    if (addingMember) {
      setAddingMember(false);
      return;
    }
    setMemberName(DEMO_MEMBER_NAME);
    setMemberPhone(DEMO_MEMBER_PHONE);
    setMemberRole('FAMILY');
    setMemberMessage(null);
    setDeleteTarget(null);
    setAddingMember(true);
  }

  function requestDeleteMember(member: CareGroupMember) {
    setAddingMember(false);
    setMemberMessage(null);
    setDeleteTarget(member);
  }

  function deleteMember() {
    if (!deleteTarget) {
      return;
    }
    removeLocalCaregiverMember(deleteTarget.id);
    setAddedMembers((current) => current.filter((member) => member.id !== deleteTarget.id));
    setRemovedMemberIds((current) => (current.includes(deleteTarget.id) ? current : [...current, deleteTarget.id]));
    setMemberMessage(`${deleteTarget.user.name}님을 구성원에서 삭제했어요.`);
    setDeleteTarget(null);
  }

  return (
    <div className="flex min-h-full flex-col gap-4 pb-8">
      <BackHeader title="구성원 편집" />
      <div className="flex flex-col gap-4 px-6">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-500">구성원 계정</h2>
            <button
              type="button"
              onClick={toggleAddMember}
              className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-bold text-brand-700"
            >
              구성원 추가
            </button>
          </div>
          {addingMember && (
            <Card className="mb-3 space-y-3 p-4">
              <TextField
                id="member-name"
                label="구성원 이름"
                value={memberName}
                onChange={setMemberName}
                placeholder="예) 김지은"
              />
              <TextField
                id="member-phone"
                label="구성원 휴대폰 번호"
                type="tel"
                inputMode="tel"
                value={memberPhone}
                onChange={(value) => setMemberPhone(formatPhone(value))}
                placeholder="010-0000-0000"
                maxLength={13}
              />
              <div>
                <p className="text-base font-semibold text-stone-700">역할</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      ['FAMILY', '가족'],
                      ['SOCIAL_WORKER', '사회복지사'],
                    ] as const
                  ).map(([role, label]) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setMemberRole(role)}
                      className={`rounded-2xl py-3 text-base font-bold ${
                        memberRole === role ? 'bg-brand-600 text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <PrimaryButton onClick={addMember}>추가하기</PrimaryButton>
            </Card>
          )}
          {memberMessage && <p className="mb-3 text-sm font-semibold text-stone-600">{memberMessage}</p>}
          <ul className="space-y-2.5">
            {members.map((member: CareGroupMember) => (
              <li
                key={member.id}
                className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3.5 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-2xl">
                  {ROLE_EMOJI[member.role]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-stone-900">{member.user.name}</p>
                    {member.isPrimary && <Badge tone="info">대표자</Badge>}
                    {member.viewerOnly && <span aria-label="보기 전용">🔒</span>}
                  </div>
                  <p className="text-sm text-stone-400">
                    {ROLE_LABEL[member.role]}
                    {member.status === 'INVITED' ? ' · 초대됨' : member.status === 'CONNECTED' ? ' · 연결됨' : ''}
                  </p>
                </div>
                {!member.isPrimary && (
                  <button
                    type="button"
                    onClick={() => requestDeleteMember(member)}
                    aria-label={`${member.user.name} 삭제`}
                    className="rounded-full bg-warn-50 px-3 py-2 text-sm font-bold text-warn-700"
                  >
                    삭제
                  </button>
                )}
              </li>
            ))}
          </ul>
          {deleteTarget && (
            <div className="mt-3 space-y-3 rounded-[var(--gjb-radius-card)] border border-warn-100 bg-warn-50 p-4 shadow-[var(--gjb-shadow-soft)]">
              <div>
                <p className="text-base font-bold text-warn-700">구성원 삭제</p>
                <p className="mt-1 text-sm font-semibold text-stone-600">
                  {deleteTarget.user.name}님을 구성원에서 삭제할까요?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={deleteMember}
                  className="rounded-2xl bg-warn-700 py-3 text-base font-bold text-white"
                >
                  삭제하기
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-2xl bg-white py-3 text-base font-bold text-stone-600"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </section>

        <Card className="p-4">
          <h2 className="text-base font-bold text-stone-900">어르신 연결</h2>
          {senior ? (
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-stone-900">{seniorLabel}</p>
                <p className="text-sm text-stone-400">등록된 어르신</p>
              </div>
              {seniorConnected ? (
                <Badge tone="success">연결됨</Badge>
              ) : (
                <Badge tone="next">초대됨</Badge>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-stone-400">등록된 어르신이 없어요.</p>
          )}
          {!seniorConnected && senior && (
            <button
              type="button"
              onClick={() => setResentTo(seniorLabel)}
              className="mt-3 w-full rounded-2xl bg-brand-50 py-3 text-base font-bold text-brand-700"
            >
              연결 안내 다시 보내기
            </button>
          )}
          {resentTo && (
            <p className="mt-2 text-sm font-semibold text-stone-600">
              {resentTo}께 연결 안내를 다시 보냈어요.
            </p>
          )}
          <p className="mt-2 text-sm text-stone-400">
            어르신 기기나 초대받은 구성원이 아래 6자리 코드를 입력하면 이 보호자 방에 연결돼요.
          </p>
        </Card>

        <Card className="p-4">
          <h2 className="text-base font-bold text-stone-900">보호자 방 연결 코드</h2>
          <p className="mt-1 text-sm text-stone-400">
            어르신 기기와 보호자 가입 화면에서 입력할 6자리 숫자를 만들어요.
          </p>
          {pairingCode ? (
            <div className="mt-3 rounded-2xl bg-brand-50 p-4 text-center">
              <p className="text-sm font-semibold text-stone-500">연결 코드</p>
              <p
                aria-label={`연결 코드 ${pairingCode.code}`}
                className="mt-1 font-mono text-4xl font-extrabold tracking-[0.32em] text-brand-700"
              >
                {pairingCode.code}
              </p>
              <p className="mt-2 text-sm text-stone-500">10분 동안 사용할 수 있어요.</p>
              <div className="mt-3">
                <PrimaryButton onClick={createCode} disabled={pairingBusy}>
                  {pairingBusy ? '새 코드 만드는 중…' : '새 코드 만들기'}
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <PrimaryButton onClick={createCode} disabled={pairingBusy}>
                {pairingBusy ? '코드 만드는 중…' : '6자리 코드 만들기'}
              </PrimaryButton>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function mergeMembers(base: CareGroupMember[], added: CareGroupMember[]): CareGroupMember[] {
  const ids = new Set(base.map((member) => member.id));
  return [...base, ...added.filter((member) => !ids.has(member.id))];
}
