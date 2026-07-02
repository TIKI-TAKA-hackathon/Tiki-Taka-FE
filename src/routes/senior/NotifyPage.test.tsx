import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('senior lock-screen notification', () => {
  afterEach(() => cleanup());

  it('opens the demo notification preview from the senior home CTA', async () => {
    renderAt('/senior/today');

    const preview = await screen.findByRole('button', { name: /데모 알림 미리보기/ });
    expect(screen.getByText('실제 사용자는 오후 7:30에 복약 알림을 받아요')).toBeInTheDocument();

    fireEvent.click(preview);

    expect(await screen.findByText('저녁약 드실 시간이에요')).toBeInTheDocument();
  });

  it('shows the push notification with the next dose and app name', async () => {
    renderAt('/senior/notify');
    expect(await screen.findByText('저녁약 드실 시간이에요')).toBeInTheDocument();
    expect(screen.getByText('지금 눌러서 확인하세요')).toBeInTheDocument();
    expect(screen.getByText('고찌봄')).toBeInTheDocument();
  });

  it('tapping the notification card opens the dose screen', async () => {
    renderAt('/senior/notify');
    fireEvent.click(await screen.findByRole('button', { name: /저녁약 드실 시간이에요/ }));
    expect(await screen.findByRole('heading', { name: '지금 드실 약이에요' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '네, 먹었어요 ✓' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '10분 뒤에 다시 알림' })).not.toBeInTheDocument();
  });

  it('redirects the old alarm route to the dose screen', async () => {
    renderAt('/senior/alarm');
    expect(await screen.findByRole('heading', { name: '지금 드실 약이에요' })).toBeInTheDocument();
  });
});
