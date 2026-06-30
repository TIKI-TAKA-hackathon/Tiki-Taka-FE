import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { TopicCard } from '../components/TopicCard';
import { getTopics } from '../lib/api';
import type { Topic } from '../lib/types';

export function TopicsPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    getTopics()
      .then((items) => {
        if (isMounted) {
          setTopics(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage('주제를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <LoadingState message="기억 주제를 불러오는 중이에요." />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-lg font-bold text-warm-700">기억 주제 선택</p>
        <h1 className="mt-2 text-4xl font-bold text-stone-950">어떤 이야기를 남겨볼까요?</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            onSelect={() => navigate(`/topics/${topic.id}/question`)}
          />
        ))}
      </div>
    </section>
  );
}
