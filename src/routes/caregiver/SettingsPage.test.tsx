import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';
import { saveSession } from '../../lib/session';

function renderSettings() {
  saveSession({
    careGroupId: 'demo-group',
    seniorId: 'demo-senior',
    ownerUserId: 'demo-owner',
  });

  return render(
    <MemoryRouter initialEntries={['/caregiver/settings']}>
      <App />
    </MemoryRouter>,
  );
}

describe('caregiver settings', () => {
  afterEach(() => {
    window.localStorage.clear();
    cleanup();
  });

  it('uses shorter preset notification options and custom input buttons', async () => {
    renderSettings();

    const intervalGroup = await screen.findByRole('group', { name: '재알림 간격 선택' });
    expect(within(intervalGroup).getByRole('button', { name: '5분' })).toBeInTheDocument();
    expect(within(intervalGroup).getByRole('button', { name: '10분' })).toBeInTheDocument();
    expect(within(intervalGroup).getByRole('button', { name: '직접 입력' })).toBeInTheDocument();
    expect(within(intervalGroup).queryByRole('button', { name: '30분' })).not.toBeInTheDocument();

    const retryGroup = screen.getByRole('group', { name: '최대 재시도 선택' });
    expect(within(retryGroup).getByRole('button', { name: '1회' })).toBeInTheDocument();
    expect(within(retryGroup).getByRole('button', { name: '3회' })).toBeInTheDocument();
    expect(within(retryGroup).getByRole('button', { name: '직접 입력' })).toBeInTheDocument();
    expect(within(retryGroup).queryByRole('button', { name: '5회' })).not.toBeInTheDocument();
  });

  it('saves valid custom notification settings', async () => {
    renderSettings();

    fireEvent.click(within(await screen.findByRole('group', { name: '재알림 간격 선택' })).getByRole('button', { name: '직접 입력' }));
    fireEvent.change(screen.getByLabelText('재알림 간격 직접 입력'), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: '재알림 간격 적용' }));

    expect(await screen.findByText('알림 설정을 저장했어요.')).toBeInTheDocument();
  });

  it('highlights only direct input while custom notification inputs are open', async () => {
    renderSettings();

    const intervalGroup = await screen.findByRole('group', { name: '재알림 간격 선택' });
    fireEvent.click(within(intervalGroup).getByRole('button', { name: '직접 입력' }));
    expect(within(intervalGroup).getByRole('button', { name: '10분' })).toHaveClass('bg-stone-100');
    expect(within(intervalGroup).getByRole('button', { name: '직접 입력' })).toHaveClass('bg-brand-600');

    const retryGroup = screen.getByRole('group', { name: '최대 재시도 선택' });
    fireEvent.click(within(retryGroup).getByRole('button', { name: '직접 입력' }));
    expect(within(retryGroup).getByRole('button', { name: '3회' })).toHaveClass('bg-stone-100');
    expect(within(retryGroup).getByRole('button', { name: '직접 입력' })).toHaveClass('bg-brand-600');
  });

  it('persists edited meal times for demo scheduling', async () => {
    const { unmount } = renderSettings();

    await screen.findByRole('group', { name: '재알림 간격 선택' });
    fireEvent.change(screen.getByLabelText('아침'), { target: { value: '07:30' } });
    fireEvent.click(screen.getByRole('button', { name: '식사시간 저장' }));

    expect(await screen.findByText('식사시간을 저장했어요. 어르신·보호자에게 알림이 갑니다.')).toBeInTheDocument();

    unmount();
    renderSettings();

    await waitFor(() => expect(screen.getByLabelText('아침')).toHaveValue('07:30'));
  });

  it('blocks custom values outside the allowed range', async () => {
    renderSettings();

    fireEvent.click(within(await screen.findByRole('group', { name: '재알림 간격 선택' })).getByRole('button', { name: '직접 입력' }));
    fireEvent.change(screen.getByLabelText('재알림 간격 직접 입력'), { target: { value: '21' } });
    fireEvent.click(screen.getByRole('button', { name: '재알림 간격 적용' }));
    expect(screen.getByText('재알림 간격은 1~20분 사이로 입력해주세요.')).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('group', { name: '최대 재시도 선택' })).getByRole('button', { name: '직접 입력' }));
    fireEvent.change(screen.getByLabelText('최대 재시도 직접 입력'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: '최대 재시도 적용' }));
    expect(screen.getByText('최대 재시도는 1~5회 사이로 입력해주세요.')).toBeInTheDocument();
  });
});
