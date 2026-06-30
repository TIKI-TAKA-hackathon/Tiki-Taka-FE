import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MemoryCardPreview } from '../components/MemoryCardPreview';
import { publishMemoryCard } from '../lib/api';
import { mockCardDraft } from '../lib/mock';
import type { CardDraft, SharedCard } from '../lib/types';

const DRAFT_STORAGE_PREFIX = 'memory-card-draft:';
const LATEST_DRAFT_KEY = 'latest-memory-card-draft';
const SHARED_STORAGE_PREFIX = 'shared-memory-card:';

function readDraft(cardId: string | undefined): CardDraft {
  const exactDraft = cardId ? sessionStorage.getItem(`${DRAFT_STORAGE_PREFIX}${cardId}`) : null;
  const latestDraft = sessionStorage.getItem(LATEST_DRAFT_KEY);
  const rawDraft = exactDraft ?? latestDraft;

  if (!rawDraft) {
    return mockCardDraft;
  }

  try {
    return JSON.parse(rawDraft) as CardDraft;
  } catch {
    return mockCardDraft;
  }
}

export function CardPreviewPage() {
  const { cardId } = useParams();
  const [card, setCard] = useState<CardDraft | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCard(readDraft(cardId));
  }, [cardId]);

  const handlePublish = async () => {
    if (!card) {
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const result = await publishMemoryCard(card.id);
      const sharedCard: SharedCard = {
        ...card,
        shareToken: result.shareToken,
        publishedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(`${SHARED_STORAGE_PREFIX}${result.shareToken}`, JSON.stringify(sharedCard));
      setShareUrl(result.shareUrl);
    } catch {
      setErrorMessage('공유 링크를 만드는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!card) {
    return <LoadingState message="카드를 준비하는 중이에요." />;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <p className="text-lg font-bold text-warm-700">카드 미리보기</p>
        <h1 className="mt-2 text-4xl font-bold text-stone-950">이렇게 기억카드가 만들어져요</h1>
        <div className="mt-6">
          <MemoryCardPreview card={card} />
        </div>
      </div>
      <aside className="self-start rounded-lg border-2 border-warm-200 bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-bold text-stone-950">공유하기</h2>
        <p className="mt-3 leading-relaxed text-stone-700">링크를 만들면 공유 카드 화면에서 볼 수 있어요.</p>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="mt-5 w-full rounded-lg bg-leaf-700 px-5 py-4 text-lg font-bold text-white hover:bg-leaf-500 disabled:opacity-60"
        >
          {isPublishing ? '링크 만드는 중' : '공유 링크 보기'}
        </button>
        {shareUrl ? (
          <div className="mt-5 rounded-lg bg-leaf-50 p-4">
            <p className="font-bold text-leaf-700">공유 링크</p>
            <Link to={new URL(shareUrl).pathname} className="mt-2 block break-all text-lg font-semibold underline">
              {shareUrl}
            </Link>
          </div>
        ) : null}
        {errorMessage ? <div className="mt-5"><ErrorState message={errorMessage} /></div> : null}
      </aside>
    </section>
  );
}
