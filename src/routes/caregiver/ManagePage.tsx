import { BackHeader } from '../../components/ui';

const members = [
  { emoji: '👩', name: '어머니', role: '어르신 · 기기 연결됨' },
  { emoji: '👦', name: '김영수', role: '보호자 · 아들' },
  { emoji: '👧', name: '김지은', role: '보호자 · 딸' },
  { emoji: '🏥', name: '행복복지관', role: '사회복지사' },
];

export function ManagePage() {
  return (
    <div className="flex min-h-full flex-col pb-8">
      <BackHeader title="가족방 관리" />
      <div className="px-5">
        <h2 className="mb-2 text-base font-bold text-stone-500">구성원</h2>
        <ul className="space-y-2.5">
          {members.map((member) => (
            <li
              key={member.name}
              className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-white p-3.5 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-2xl">
                {member.emoji}
              </span>
              <div>
                <p className="font-bold text-stone-900">{member.name}</p>
                <p className="text-sm text-stone-400">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50 p-5 text-center">
          <p className="text-base font-bold text-brand-700">어르신 기기 초대</p>
          <p className="mt-1 text-sm text-stone-500">
            어르신 휴대폰에서 아래 코드를 입력하거나 QR을 스캔하세요.
          </p>
          <p className="mt-3 text-3xl font-black tracking-[0.3em] text-stone-900">842 196</p>
          <button type="button" className="mt-3 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white">
            QR 코드 보기
          </button>
        </div>
      </div>
    </div>
  );
}
