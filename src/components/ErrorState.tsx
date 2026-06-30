type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({ title = '잠시 문제가 생겼어요', message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 text-stone-900" role="alert">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-3 text-lg leading-relaxed">{message}</p>
    </div>
  );
}
