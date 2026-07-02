import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('refill + weather (mock demo)', () => {
  afterEach(() => cleanup());

  it('senior home shows the depleted-refill hospital card, weather chip, and rain caution', async () => {
    renderAt('/senior/today');

    // Reassuring 소진 card with hospital name + address.
    expect(await screen.findByText('약이 다 떨어졌어요 💊')).toBeInTheDocument();
    expect(screen.getByText('🏥 제주한라병원')).toBeInTheDocument();
    expect(screen.getByText('제주특별자치도 제주시 도령로 65')).toBeInTheDocument();

    // Big 전화하기 action links to the hospital number (digits only).
    expect(screen.getByRole('link', { name: /전화하기/ })).toHaveAttribute('href', 'tel:0647405000');

    // Weather chip + rain caution line (depleted + rain).
    expect(screen.getByText(/제주 ☔ 비 19°/)).toBeInTheDocument();
    expect(screen.getByText(/오늘 제주에 비가 와요 — 병원 방문은 내일로 권해요\./)).toBeInTheDocument();
  });

  it('caregiver dashboard shows the 재처방 필요 alert with rain note', async () => {
    renderAt('/caregiver');

    expect(await screen.findByText('💊 재처방 필요')).toBeInTheDocument();
    expect(screen.getByText(/약이 소진됐어요 · 제주한라병원 재처방 필요/)).toBeInTheDocument();
    expect(screen.getByText(/제주 우천 — 재처방 방문은 내일 권장/)).toBeInTheDocument();
  });

  it('refill + weather caregiver notifications surface in the timeline', async () => {
    renderAt('/caregiver/timeline');

    expect(await screen.findByRole('heading', { name: '오늘 타임라인' })).toBeInTheDocument();
    expect(screen.getByText('어머니 약이 소진됐어요')).toBeInTheDocument();
    expect(screen.getByText('☔ 제주 우천 — 재처방 방문 내일 권장')).toBeInTheDocument();
  });

  it('refill notification also surfaces in the senior alerts feed', async () => {
    renderAt('/senior/alerts');

    expect(await screen.findByRole('heading', { name: '알림함' })).toBeInTheDocument();
    expect(screen.getByText('어머니 약이 소진됐어요')).toBeInTheDocument();
  });
});
