export type Topic = {
  id: number;
  title: string;
  description: string;
  questionCount?: number;
};

export type Question = {
  id: number;
  topicId: number;
  displayText: string;
  ttsText: string;
  audioUrl?: string | null;
  readSpeed?: number;
  sortOrder?: number;
};

export type CreateMemorySessionPayload = {
  topicId: string | number;
  questionId: string | number;
};

export type MemorySession = {
  id: string;
  topicId: string | number;
  questionId: string | number;
  createdAt: string;
};

export type MemoryAnswerPayload = {
  questionId: string | number;
  seniorAnswer: string;
  youthReply: string;
};

export type MemoryCardBase = {
  id: string;
  topicTitle: string;
  questionText: string;
  seniorAnswer: string;
  youthReply: string;
  createdAt: string;
};

export type CardDraft = MemoryCardBase & {
  status: 'draft';
};

export type SharedCard = MemoryCardBase & {
  shareToken: string;
  publishedAt: string;
};

export type PublishResult = {
  shareToken: string;
  shareUrl: string;
};
