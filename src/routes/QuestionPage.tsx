import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnswerForm } from '../components/AnswerForm';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { QuestionVoiceCard } from '../components/QuestionVoiceCard';
import { createCardDraft, createMemorySession, getQuestions, saveMemoryAnswer } from '../lib/api';
import { findMockTopic } from '../lib/mock';
import type { CardDraft, Question } from '../lib/types';

const DRAFT_STORAGE_PREFIX = 'memory-card-draft:';
const LATEST_DRAFT_KEY = 'latest-memory-card-draft';

export function QuestionPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [seniorAnswer, setSeniorAnswer] = useState('');
  const [youthReply, setYouthReply] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const question = questions[0];
  const topic = useMemo(() => findMockTopic(topicId ?? 1), [topicId]);

  useEffect(() => {
    let isMounted = true;

    if (!topicId) {
      setErrorMessage('주제 정보가 없어요. 주제를 다시 선택해 주세요.');
      setIsLoading(false);
      return;
    }

    getQuestions(topicId)
      .then((items) => {
        if (isMounted) {
          setQuestions(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage('질문을 불러오지 못했어요. 주제를 다시 선택해 주세요.');
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
  }, [topicId]);

  const handleSubmit = async () => {
    if (!topicId || !question) {
      setErrorMessage('질문 정보가 없어요. 주제를 다시 선택해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const session = await createMemorySession({ topicId, questionId: question.id });
      await saveMemoryAnswer(session.id, {
        questionId: question.id,
        seniorAnswer,
        youthReply,
      });
      const apiDraft = await createCardDraft(session.id);
      const draft: CardDraft = {
        ...apiDraft,
        topicTitle: topic.title,
        questionText: question.displayText,
        seniorAnswer,
        youthReply,
      };

      sessionStorage.setItem(`${DRAFT_STORAGE_PREFIX}${draft.id}`, JSON.stringify(draft));
      sessionStorage.setItem(LATEST_DRAFT_KEY, JSON.stringify(draft));
      navigate(`/preview/${draft.id}`);
    } catch {
      setErrorMessage('카드를 만드는 중 문제가 생겼어요. 입력 내용을 확인해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="질문을 준비하는 중이에요." />;
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  if (!question) {
    return <ErrorState message="표시할 질문이 없어요. 다른 주제를 선택해 주세요." />;
  }

  return (
    <section>
      <div className="mb-6">
        <p className="text-lg font-bold text-warm-700">{topic.title}</p>
        <h1 className="mt-2 text-4xl font-bold text-stone-950">질문을 듣고 답을 적어 주세요</h1>
      </div>
      <QuestionVoiceCard question={question} />
      <AnswerForm
        seniorAnswer={seniorAnswer}
        youthReply={youthReply}
        isSubmitting={isSubmitting}
        onSeniorAnswerChange={setSeniorAnswer}
        onYouthReplyChange={setYouthReply}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
