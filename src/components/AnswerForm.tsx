import type { FormEvent } from 'react';

type AnswerFormProps = {
  seniorAnswer: string;
  youthReply: string;
  isSubmitting: boolean;
  onSeniorAnswerChange: (value: string) => void;
  onYouthReplyChange: (value: string) => void;
  onSubmit: () => void;
};

export function AnswerForm({
  seniorAnswer,
  youthReply,
  isSubmitting,
  onSeniorAnswerChange,
  onYouthReplyChange,
  onSubmit,
}: AnswerFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <label className="block">
        <span className="text-xl font-bold text-stone-900">어르신 답변</span>
        <textarea
          value={seniorAnswer}
          onChange={(event) => onSeniorAnswerChange(event.target.value)}
          rows={5}
          required
          placeholder="떠오르는 장면을 편하게 적어 주세요."
          className="mt-3 w-full rounded-lg border-2 border-warm-200 bg-white p-4 text-xl leading-relaxed shadow-sm"
        />
      </label>
      <label className="block">
        <span className="text-xl font-bold text-stone-900">청년 답장</span>
        <textarea
          value={youthReply}
          onChange={(event) => onYouthReplyChange(event.target.value)}
          rows={4}
          required
          placeholder="이야기를 듣고 전하고 싶은 답장을 적어 주세요."
          className="mt-3 w-full rounded-lg border-2 border-warm-200 bg-white p-4 text-xl leading-relaxed shadow-sm"
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-leaf-700 px-6 py-5 text-xl font-bold text-white shadow-sm hover:bg-leaf-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? '카드 만드는 중' : '다음으로'}
      </button>
    </form>
  );
}
