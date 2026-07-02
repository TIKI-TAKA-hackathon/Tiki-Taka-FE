import { useCallback, useState } from 'react';
import { BackHeader, Badge, Card, ErrorNote, Loading, SecondaryButton } from '../../components/ui';
import type { BadgeTone } from '../../components/ui';
import { fetchCaregiverPhotos, reviewDosePhoto } from '../../lib/api';
import { loadSession } from '../../lib/session';
import { useAsync } from '../../lib/useAsync';
import type { ConfirmMethod, DosePhoto, ReviewStatus } from '../../lib/types';

const REVIEW_LABEL: Record<ReviewStatus, string> = {
  pending: '확인 전',
  reviewed: '확인함',
  flagged: '다시 요청함',
};

const REVIEW_TONE: Record<ReviewStatus, BadgeTone> = {
  pending: 'neutral',
  reviewed: 'success',
  flagged: 'warn',
};

const METHOD_LABEL: Record<ConfirmMethod, string> = {
  voice: '음성 확인',
  button: '버튼 확인',
};

// The contract sends display strings (e.g. '오전 8:32', '어제 오전 8:29'), so group by a
// simple day prefix rather than parsing dates on the frontend.
function dayGroupLabel(takenAtLabel: string): string {
  if (takenAtLabel.startsWith('어제')) {
    return '어제';
  }
  return '오늘';
}

function groupByDay(photos: DosePhoto[]): { day: string; photos: DosePhoto[] }[] {
  const groups = new Map<string, DosePhoto[]>();
  for (const photo of photos) {
    const day = dayGroupLabel(photo.takenAtLabel);
    const bucket = groups.get(day);
    if (bucket) {
      bucket.push(photo);
    } else {
      groups.set(day, [photo]);
    }
  }
  return Array.from(groups, ([day, items]) => ({ day, photos: items }));
}

function ReviewBadge({ status }: { status: ReviewStatus }) {
  return <Badge tone={REVIEW_TONE[status]}>{REVIEW_LABEL[status]}</Badge>;
}

function PhotoDetail({
  photo,
  onClose,
  onFlag,
  flagging,
}: {
  photo: DosePhoto;
  onClose: () => void;
  onFlag: () => void;
  flagging: boolean;
}) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col bg-black/60">
      <div className="mt-auto flex max-h-[92%] flex-col overflow-y-auto rounded-t-3xl bg-white pb-8">
        <div className="flex items-center justify-between px-6 pt-4">
          <h2 className="text-xl font-bold text-stone-900">
            {photo.doseLabel} <span className="text-base font-medium text-stone-400">· {photo.takenAtLabel}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 px-6">
          <img
            src={photo.photoUrl}
            alt={`${photo.doseLabel} 복약 사진`}
            className="w-full rounded-2xl border border-stone-100 object-cover"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 px-6">
          <ReviewBadge status={photo.reviewStatus} />
          {photo.method && <Badge tone="info">{METHOD_LABEL[photo.method]}</Badge>}
        </div>

        <p className="mx-6 mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-relaxed text-stone-500">
          사진은 참고용이며 복용 증명은 아니에요.
        </p>

        <div className="mt-4 px-6">
          <SecondaryButton onClick={onFlag}>
            {flagging ? '요청 중…' : '사진이 이상해요 / 다시 요청'}
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}

export function PhotoGalleryPage() {
  const careGroupId = loadSession()?.careGroupId;
  const actorUserId = loadSession()?.ownerUserId ?? 'demo-owner';
  const loadPhotos = useCallback(() => fetchCaregiverPhotos(careGroupId), [careGroupId]);
  const { data, loading, error } = useAsync(loadPhotos);

  // Local copy so optimistic review updates survive without a refetch.
  const [photos, setPhotos] = useState<DosePhoto[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flagging, setFlagging] = useState(false);

  const items = photos ?? data;
  if (loading) {
    return <Loading label="복약 사진을 불러오는 중…" />;
  }
  if (error || !items) {
    return <ErrorNote message={error ?? '복약 사진을 불러오지 못했어요.'} />;
  }

  const selected = items.find((photo) => photo.doseEventId === selectedId) ?? null;

  async function handleFlag(photo: DosePhoto) {
    setFlagging(true);
    // Optimistic update first, then reconcile with the server response.
    const next = (items ?? []).map((item) =>
      item.doseEventId === photo.doseEventId ? { ...item, reviewStatus: 'flagged' as ReviewStatus } : item,
    );
    setPhotos(next);
    try {
      const updated = await reviewDosePhoto(photo.doseEventId, 'flagged', actorUserId);
      setPhotos((current) =>
        (current ?? next).map((item) => (item.doseEventId === updated.doseEventId ? updated : item)),
      );
    } finally {
      setFlagging(false);
    }
  }

  const groups = groupByDay(items);

  return (
    <div className="flex min-h-full flex-col pb-10">
      <BackHeader title="복약 사진" />

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <span className="text-5xl">📷</span>
          <p className="text-lg font-bold text-stone-700">아직 복약 사진이 없어요</p>
          <p className="text-sm text-stone-400">어르신이 복약 사진을 보내면 여기에 모아서 보여드려요.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-6 pt-1">
          <p className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-stone-500">
            사진은 참고용이며 복용 증명은 아니에요.
          </p>
          {groups.map((group) => (
            <section key={group.day}>
              <h2 className="mb-2 text-sm font-bold text-stone-400">{group.day}</h2>
              <div className="grid grid-cols-2 gap-3">
                {group.photos.map((photo) => (
                  <Card key={photo.doseEventId} className="overflow-hidden p-0">
                    <button
                      type="button"
                      onClick={() => setSelectedId(photo.doseEventId)}
                      className="flex w-full flex-col text-left"
                      aria-label={`${photo.doseLabel} ${photo.takenAtLabel} 사진 보기`}
                    >
                      <img
                        src={photo.thumbnailUrl}
                        alt={`${photo.doseLabel} 복약 사진`}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="flex flex-col gap-1.5 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{photo.doseLabel}</span>
                          <span className="text-xs text-stone-400">{photo.takenAtLabel}</span>
                        </div>
                        <ReviewBadge status={photo.reviewStatus} />
                      </div>
                    </button>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected && (
        <PhotoDetail
          photo={selected}
          flagging={flagging}
          onClose={() => setSelectedId(null)}
          onFlag={() => void handleFlag(selected)}
        />
      )}
    </div>
  );
}
