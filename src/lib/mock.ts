import type { CardDraft, MemorySession, Question, SharedCard, Topic } from './types';

export const mockTopics: Topic[] = [
  {
    id: 1,
    title: '어릴 적 동네',
    description: '살던 동네, 골목, 친구들과의 기억을 떠올려요.',
    questionCount: 2,
  },
  {
    id: 2,
    title: '가족의 한 장면',
    description: '가족과 함께했던 따뜻한 순간을 기록해요.',
    questionCount: 2,
  },
  {
    id: 3,
    title: '처음 해본 일',
    description: '처음 일하거나 배웠던 날의 이야기를 남겨요.',
    questionCount: 1,
  },
];

export const mockQuestions: Question[] = [
  {
    id: 101,
    topicId: 1,
    displayText: '어릴 적 가장 자주 걷던 길은 어떤 모습이었나요?',
    ttsText: '어릴 적 가장 자주 걷던 길은 어떤 모습이었나요? 천천히 떠오르는 장면부터 말씀해 주세요.',
    audioUrl: '/audio/questions/topic-1-question-101.mp3',
    readSpeed: 0.85,
    sortOrder: 1,
  },
  {
    id: 102,
    topicId: 1,
    displayText: '그 길에서 누구를 자주 만나셨나요?',
    ttsText: '그 길에서 누구를 자주 만나셨나요? 이름이 기억나지 않아도 괜찮아요.',
    audioUrl: null,
    readSpeed: 0.85,
    sortOrder: 2,
  },
  {
    id: 201,
    topicId: 2,
    displayText: '가족과 함께 먹었던 음식 중 가장 기억나는 것은 무엇인가요?',
    ttsText: '가족과 함께 먹었던 음식 중 가장 기억나는 것은 무엇인가요? 그때의 냄새와 분위기도 함께 말해주세요.',
    audioUrl: null,
    readSpeed: 0.85,
    sortOrder: 1,
  },
  {
    id: 202,
    topicId: 2,
    displayText: '가족에게 아직 전하고 싶은 말이 있나요?',
    ttsText: '가족에게 아직 전하고 싶은 말이 있나요? 짧은 말이어도 충분합니다.',
    audioUrl: null,
    readSpeed: 0.85,
    sortOrder: 2,
  },
  {
    id: 301,
    topicId: 3,
    displayText: '처음으로 스스로 해냈다고 느낀 일은 무엇인가요?',
    ttsText: '처음으로 스스로 해냈다고 느낀 일은 무엇인가요? 그때 마음이 어땠는지 들려주세요.',
    audioUrl: null,
    readSpeed: 0.85,
    sortOrder: 1,
  },
];

export const mockSession: MemorySession = {
  id: 'mock-session-1',
  topicId: 1,
  questionId: 101,
  createdAt: new Date().toISOString(),
};

export const mockCardDraft: CardDraft = {
  id: 'mock-card-1',
  status: 'draft',
  topicTitle: '어릴 적 동네',
  questionText: '어릴 적 가장 자주 걷던 길은 어떤 모습이었나요?',
  seniorAnswer: '학교 가는 길에 큰 느티나무가 있었고, 친구들과 그 아래에서 자주 쉬었습니다.',
  youthReply: '그 길과 나무가 오래도록 마음에 남아 있었다는 점이 참 따뜻하게 느껴져요.',
  createdAt: new Date().toISOString(),
};

export const mockSharedCard: SharedCard = {
  ...mockCardDraft,
  id: 'shared-mock-card-1',
  shareToken: 'sample-memory',
  publishedAt: new Date().toISOString(),
};

export function findMockTopic(topicId: string | number): Topic {
  return mockTopics.find((topic) => String(topic.id) === String(topicId)) ?? mockTopics[0];
}

export function findMockQuestions(topicId: string | number): Question[] {
  const questions = mockQuestions.filter((question) => String(question.topicId) === String(topicId));
  return questions.length > 0 ? questions : mockQuestions.slice(0, 1);
}
