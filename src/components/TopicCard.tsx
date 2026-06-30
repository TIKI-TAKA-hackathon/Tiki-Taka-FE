import type { Topic } from '../lib/types';

type TopicCardProps = {
  topic: Topic;
  onSelect: (topic: Topic) => void;
};

export function TopicCard({ topic, onSelect }: TopicCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(topic)}
      className="w-full rounded-lg border-2 border-warm-200 bg-white p-6 text-left shadow-sm transition hover:border-warm-500 hover:shadow-md"
    >
      <span className="block text-2xl font-bold text-stone-900">{topic.title}</span>
      <span className="mt-3 block text-lg leading-relaxed text-stone-700">{topic.description}</span>
      {topic.questionCount ? (
        <span className="mt-4 inline-block rounded-full bg-leaf-50 px-4 py-2 font-semibold text-leaf-700">
          질문 {topic.questionCount}개
        </span>
      ) : null}
    </button>
  );
}
