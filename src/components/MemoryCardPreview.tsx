import type { CardDraft, SharedCard } from '../lib/types';

type MemoryCardPreviewProps = {
  card: CardDraft | SharedCard;
};

export function MemoryCardPreview({ card }: MemoryCardPreviewProps) {
  return (
    <article className="rounded-lg border-2 border-warm-200 bg-white p-6 shadow-md">
      <div className="border-b border-warm-200 pb-5">
        <p className="text-lg font-bold text-warm-700">{card.topicTitle}</p>
        <h2 className="mt-2 text-3xl font-bold leading-tight text-stone-950">기억카드</h2>
      </div>
      <div className="space-y-6 py-6">
        <section>
          <h3 className="text-lg font-bold text-stone-700">질문</h3>
          <p className="mt-2 text-2xl font-semibold leading-relaxed text-stone-950">{card.questionText}</p>
        </section>
        <section className="rounded-lg bg-warm-50 p-5">
          <h3 className="text-lg font-bold text-warm-700">어르신 이야기</h3>
          <p className="mt-3 whitespace-pre-wrap text-xl leading-relaxed text-stone-900">{card.seniorAnswer}</p>
        </section>
        <section className="rounded-lg bg-leaf-50 p-5">
          <h3 className="text-lg font-bold text-leaf-700">청년 답장</h3>
          <p className="mt-3 whitespace-pre-wrap text-xl leading-relaxed text-stone-900">{card.youthReply}</p>
        </section>
      </div>
      <p className="border-t border-warm-200 pt-4 text-sm font-semibold text-stone-500">
        만든 날 {new Date(card.createdAt).toLocaleDateString('ko-KR')}
      </p>
    </article>
  );
}
