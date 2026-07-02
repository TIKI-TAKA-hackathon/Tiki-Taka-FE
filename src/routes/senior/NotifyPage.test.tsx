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

  it('shows the push notification with the next dose and app name', () => {
    renderAt('/senior/notify');
    expect(screen.getByText('저녁약 드실 시간이에요')).toBeInTheDocument();
    expect(screen.getByText('지금 눌러서 확인하세요')).toBeInTheDocument();
    expect(screen.getByText('고찌봄')).toBeInTheDocument();
  });

  it('tapping the notification card opens the alarm screen', () => {
    renderAt('/senior/notify');
    fireEvent.click(screen.getByRole('button', { name: /저녁약 드실 시간이에요/ }));
    expect(screen.getByRole('heading', { name: '약 드실 시간이에요' })).toBeInTheDocument();
  });
});
