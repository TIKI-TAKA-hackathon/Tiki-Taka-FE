import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, BackHeader, Card, Loading, PrimaryButton } from '../../components/ui';
import { createInviteLink, getCareGroup } from '../../lib/api';
import { env } from '../../lib/env';
import { loadSession } from '../../lib/session';
import { useAsync } from '../../lib/useAsync';
import type { CareGroupMember, MemberRole } from '../../lib/types';

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

export function ManagePage() {
  const navigate = useNavigate();
  const session = loadSession();
  const careGroupId = session?.careGroupId;
  const loadGroup = useCallback(() => getCareGroup(careGroupId ?? 'latest'), [careGroupId]);
  const { data: group, loading } = useAsync(loadGroup);

  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [resentTo, setResentTo] = useState<string | null>(null);

  if (loading) {
    return <Loading label="가족방을 불러오는 중…" />;
  }

  const members = group?.members ?? [];
  const senior = group?.senior;
  // Senior membership is represented by whether any member has connected as senior; in practice
  // the senior is registered at signup, so we show the registered phone + connection state.
  const seniorConnected = members.some((member) => member.user.userType === 'SENIOR' && member.status === 'CONNECTED');

  async function invite() {
    if (!group) {
      return;
    }
    setInviteBusy(true);
    try {
      const owner = group.members.find((member) => member.role === 'OWNER') ?? group.members[0];
      const link = await createInviteLink(group.id, session?.ownerUserId ?? owner?.user.id ?? group.senior.id);
      setInviteUrl(`${env.frontendBaseUrl}/invites/${link.token}`);
    } finally {
      setInviteBusy(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col gap-4 pb-8">
      <BackHeader title="가족방 관리" />
      <div className="flex flex-col gap-4 px-6">
        <section>
          <h2 className="mb-2 text-base font-bold text-stone-500">구성원</h2>
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
              </li>
            ))}
          </ul>
        </section>

        <Card className="p-4">
          <h2 className="text-base font-bold text-stone-900">어르신 연결</h2>
          {senior ? (
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-stone-900">{senior.name}</p>
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
              onClick={() => setResentTo(senior.name)}
              className="mt-3 w-full rounded-2xl bg-brand-50 py-3 text-base font-bold text-brand-700"
            >
              연결 안내 다시 보내기
            </button>
          )}
          {resentTo && (
            <p className="mt-2 text-sm font-semibold text-stone-600">
              {resentTo}님께 연결 안내를 다시 보냈어요.
            </p>
          )}
          <p className="mt-2 text-sm text-stone-400">
            어르신은 등록된 휴대폰 번호로 인증하면 이 가족방에 연결돼요.
          </p>
        </Card>

        <Card className="p-4">
          <h2 className="text-base font-bold text-stone-900">약 등록</h2>
          <p className="mt-1 text-sm text-stone-400">약국에서 받은 처방 QR을 스캔해 복약 정보를 등록해요.</p>
          <div className="mt-3">
            <PrimaryButton onClick={() => navigate('/caregiver/add-prescription')}>
              💊 처방 QR 등록하기
            </PrimaryButton>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-base font-bold text-stone-900">가족 초대</h2>
          <p className="mt-1 text-sm text-stone-400">초대 링크를 만들어 가족·복지사에게 보내세요.</p>
          {inviteUrl ? (
            <div className="mt-3 rounded-2xl bg-stone-50 p-3">
              <p className="break-all text-sm font-semibold text-brand-700">{inviteUrl}</p>
            </div>
          ) : (
            <div className="mt-3">
              <PrimaryButton onClick={invite} disabled={inviteBusy}>
                {inviteBusy ? '초대 링크 만드는 중…' : '초대 링크 만들기'}
              </PrimaryButton>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
