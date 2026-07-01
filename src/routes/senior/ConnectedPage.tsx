import { useNavigate } from 'react-router-dom';
import { CheckCircle, PrimaryButton } from '../../components/ui';

export function ConnectedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col px-6 pb-8">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <CheckCircle />
        <h1 className="mt-6 text-3xl font-extrabold text-stone-900">연결됐어요!</h1>
        <p className="mt-3 text-xl leading-relaxed text-stone-500">
          이제 알림에 응답만
          <br />
          하면 돼요.
        </p>
        <div className="mt-6 w-full rounded-2xl bg-brand-50 px-5 py-4 text-center text-base font-semibold leading-relaxed text-brand-700">
          복잡한 설정은 없어요.
          <br />
          알림이 오면 버튼 하나만 누르면 됩니다.
        </div>
      </div>

      <PrimaryButton onClick={() => navigate('/senior')}>시작하기</PrimaryButton>
    </div>
  );
}
