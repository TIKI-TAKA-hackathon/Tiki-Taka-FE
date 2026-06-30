type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = '불러오는 중이에요.' }: LoadingStateProps) {
  return (
    <div className="rounded-lg border-2 border-warm-200 bg-white p-8 text-center text-xl font-bold text-stone-700">
      {message}
    </div>
  );
}
