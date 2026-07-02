import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { pushCaregiverAlert } from '../lib/caregiverAlerts';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('in-app notifications', () => {
  afterEach(() => {
    window.localStorage.clear();
    cleanup();
  });

  it('senior alerts render notification records from the data layer (demo fallback)', async () => {
    renderAt('/senior/alerts');

    expect(await screen.findByRole('heading', { name: '알림함' })).toBeInTheDocument();
    // Missed-dose item uses reassuring, non-emergency wording.
    expect(screen.getByText('저녁약 미확인')).toBeInTheDocument();
    // Unread items are emphasized with a "새 알림" badge.
    expect(screen.getAllByText('새 알림').length).toBeGreaterThan(0);
  });

  it('caregiver timeline lists notifications and marks one read on tap', async () => {
    renderAt('/caregiver/timeline');

    expect(await screen.findByRole('heading', { name: '오늘 타임라인' })).toBeInTheDocument();
    const item = await screen.findByText('저녁약 미확인');
    // Unread markers present before interaction.
    expect(screen.getAllByLabelText('읽지 않음').length).toBeGreaterThan(0);

    const unreadBefore = screen.getAllByLabelText('읽지 않음').length;
    fireEvent.click(item);
    // Tapping an unread item optimistically clears its unread marker.
    expect(screen.getAllByLabelText('읽지 않음').length).toBe(unreadBefore - 1);
  });

  it('shows locally stored caregiver alerts from senior active flows', async () => {
    pushCaregiverAlert({
      id: 'senior-dose-exit',
      title: '복약 확인 중 앱을 벗어났어요',
      body: '어르신이 복약 확인을 마치지 못했어요. 확인이 필요해요.',
    });

    renderAt('/caregiver/timeline');

    expect(await screen.findByText('복약 확인 중 앱을 벗어났어요')).toBeInTheDocument();
    expect(screen.getByText('어르신이 복약 확인을 마치지 못했어요. 확인이 필요해요.')).toBeInTheDocument();
  });
});
