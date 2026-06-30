import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MemoryCardPreview } from '../components/MemoryCardPreview';
import { getSharedCard } from '../lib/api';
import type { SharedCard } from '../lib/types';

const SHARED_STORAGE_PREFIX = 'shared-memory-card:';

function readStoredSharedCard(shareToken: string): SharedCard | null {
  const rawCard = sessionStorage.getItem(`${SHARED_STORAGE_PREFIX}${shareToken}`);

  if (!rawCard) {
    return null;
  }

  try {
    return JSON.parse(rawCard) as SharedCard;
  } catch {
    return null;
  }
}

export function SharedCardPage() {
  const { shareToken } = useParams();
  const [card, setCard] = useState<SharedCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!shareToken) {
      setErrorMessage('공유 토큰이 없어요.');
      setIsLoading(false);
      return;
    }

    const storedCard = readStoredSharedCard(shareToken);
    if (storedCard) {
      setCard(storedCard);
      setIsLoading(false);
      return;
    }

    getSharedCard(shareToken)
      .then((item) => {
        if (isMounted) {
          setCard(item);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage('공유 카드를 불러오지 못했어요.');
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
  }, [shareToken]);

  if (isLoading) {
    return <LoadingState message="공유 카드를 불러오는 중이에요." />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  if (!card) {
    return <ErrorState message="표시할 카드가 없어요." />;
  }

  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="text-lg font-bold text-warm-700">공유 기억카드</p>
        <h1 className="mt-2 text-4xl font-bold text-stone-950">함께 보는 이야기</h1>
      </div>
      <MemoryCardPreview card={card} />
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-warm-700 px-6 py-4 text-lg font-bold text-white hover:bg-warm-500"
      >
        처음으로
      </Link>
    </section>
  );
}
