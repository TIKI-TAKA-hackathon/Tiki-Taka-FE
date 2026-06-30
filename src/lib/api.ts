import { env } from './env';
import {
  findMockQuestions,
  mockCardDraft,
  mockSession,
  mockSharedCard,
  mockTopics,
} from './mock';
import type {
  CardDraft,
  CreateMemorySessionPayload,
  MemoryAnswerPayload,
  MemorySession,
  PublishResult,
  Question,
  SharedCard,
  Topic,
} from './types';

type ApiRequestInit = Omit<RequestInit, 'body'> & {
  body?: object;
};

async function requestJson<T>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const url = `${env.apiBaseUrl}${path}`;
  const { body: requestBody, headers, ...requestInit } = init;
  const body = requestBody ? JSON.stringify(requestBody) : undefined;
  const response = await fetch(url, {
    ...requestInit,
    body,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function withMockFallback<T>(producer: () => Promise<T>, fallback: () => T): Promise<T> {
  if (env.useMockApi) {
    return fallback();
  }

  try {
    return await producer();
  } catch (error) {
    console.warn('API failed. Using mock fallback.', error);
    return fallback();
  }
}

export function getTopics(): Promise<Topic[]> {
  return withMockFallback(() => requestJson<Topic[]>('/topics'), () => mockTopics);
}

export function getQuestions(topicId: string | number): Promise<Question[]> {
  return withMockFallback(
    () => requestJson<Question[]>(`/topics/${topicId}/questions`),
    () => findMockQuestions(topicId),
  );
}

export function createMemorySession(payload: CreateMemorySessionPayload): Promise<MemorySession> {
  return withMockFallback(
    () =>
      requestJson<MemorySession>('/memory-sessions', {
        method: 'POST',
        body: payload,
      }),
    () => ({
      ...mockSession,
      id: `mock-session-${Date.now()}`,
      topicId: payload.topicId,
      questionId: payload.questionId,
      createdAt: new Date().toISOString(),
    }),
  );
}

export function saveMemoryAnswer(
  sessionId: string,
  payload: MemoryAnswerPayload,
): Promise<MemorySession> {
  return withMockFallback(
    () =>
      requestJson<MemorySession>(`/memory-sessions/${sessionId}/answers`, {
        method: 'POST',
        body: payload,
      }),
    () => ({
      ...mockSession,
      id: sessionId,
      questionId: payload.questionId,
    }),
  );
}

export function createCardDraft(sessionId: string): Promise<CardDraft> {
  return withMockFallback(
    () =>
      requestJson<CardDraft>(`/memory-sessions/${sessionId}/cards`, {
        method: 'POST',
      }),
    () => ({
      ...mockCardDraft,
      id: `mock-card-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }),
  );
}

export function publishMemoryCard(cardId: string): Promise<PublishResult> {
  return withMockFallback(
    () =>
      requestJson<PublishResult>(`/memory-cards/${cardId}/publish`, {
        method: 'POST',
      }),
    () => {
      const shareToken = `mock-${cardId}`;
      return {
        shareToken,
        shareUrl: `${env.frontendBaseUrl}/t/${shareToken}`,
      };
    },
  );
}

export function getSharedCard(shareToken: string): Promise<SharedCard> {
  return withMockFallback(
    () => requestJson<SharedCard>(`/memory-cards/shared/${shareToken}`),
    () => ({
      ...mockSharedCard,
      shareToken,
    }),
  );
}
