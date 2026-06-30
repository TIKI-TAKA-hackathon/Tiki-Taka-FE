import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryCardPreview } from './MemoryCardPreview';
import type { CardDraft } from '../lib/types';

describe('MemoryCardPreview', () => {
  it('renders the required card text', () => {
    const card: CardDraft = {
      id: 'card-1',
      status: 'draft',
      topicTitle: '가족의 한 장면',
      questionText: '가족과 함께 먹었던 음식 중 가장 기억나는 것은 무엇인가요?',
      seniorAnswer: '명절마다 온 가족이 모여 만두를 빚었습니다.',
      youthReply: '함께 손으로 만든 시간이 오래 남았다는 점이 좋습니다.',
      createdAt: '2026-06-30T00:00:00.000Z',
    };

    render(<MemoryCardPreview card={card} />);

    expect(screen.getByText('가족의 한 장면')).toBeInTheDocument();
    expect(screen.getByText(card.questionText)).toBeInTheDocument();
    expect(screen.getByText(card.seniorAnswer)).toBeInTheDocument();
    expect(screen.getByText(card.youthReply)).toBeInTheDocument();
  });
});
