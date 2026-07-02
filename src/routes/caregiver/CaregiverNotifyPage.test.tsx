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

describe('caregiver lock-screen notification', () => {
  afterEach(() => cleanup());

  it('opens the demo notification preview from the caregiver dashboard CTA', async () => {
    renderAt('/caregiver');

    const preview = await screen.findByRole('button', { name: /데모 알림 미리보기/ });
    expect(screen.getByText('실제 보호자는 복용 완료·확인 필요 알림을 받아요')).toBeInTheDocument();

    fireEvent.click(preview);

    expect(await screen.findByText(/저녁약을 드셨어요/)).toBeInTheDocument();
  });

  it('renders the three caregiver push-notification bodies', async () => {
    renderAt('/caregiver/notify');
    expect(await screen.findByText(/저녁약을 드셨어요/)).toBeInTheDocument();
    expect(screen.getByText(/아침약을 아직 안 드셨어요/)).toBeInTheDocument();
    expect(screen.getByText(/오늘 병원 방문은 내일로 권해요/)).toBeInTheDocument();
  });

  it('exposes a 전화하기 action as a tel: link', async () => {
    renderAt('/caregiver/notify');
    expect(await screen.findByRole('link', { name: /전화하기/ })).toHaveAttribute('href', 'tel:01012345678');
  });

  it('tapping the 복용 완료 card navigates to the photo gallery', async () => {
    renderAt('/caregiver/notify');
    fireEvent.click(await screen.findByRole('button', { name: /저녁약을 드셨어요/ }));
    // The photo gallery header (async fixture load) replaces the lock-screen.
    expect(await screen.findByRole('heading', { name: '복약 사진' })).toBeInTheDocument();
    expect(screen.queryByText('밀어서 확인 ›')).not.toBeInTheDocument();
  });
});
