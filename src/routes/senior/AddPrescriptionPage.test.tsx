import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../App';

const originalMediaDevices = navigator.mediaDevices;

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('senior prescription registration', () => {
  afterEach(() => {
    cleanup();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: originalMediaDevices,
    });
    vi.restoreAllMocks();
  });

  it('continues with the demo QR when camera is unavailable and advances with confirm-only steps', async () => {
    renderAt('/senior/today');

    fireEvent.click(await screen.findByRole('button', { name: /처방 QR로 약 등록하기/ }));
    expect(await screen.findByRole('heading', { name: '처방 QR을 비춰주세요' })).toBeInTheDocument();

    expect(await screen.findByText('데모 QR로 등록할게요')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: '데모 QR로 계속하기' }));
    expect(await screen.findByRole('heading', { name: '처방 QR을 읽었어요' })).toBeInTheDocument();
    expect(screen.queryByLabelText('등록 코드 직접 입력')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(await screen.findByRole('heading', { name: '처방된 곳이에요' })).toBeInTheDocument();
    expect(screen.getByText('김순자님 약으로 확인됐어요.')).toBeInTheDocument();
    expect(screen.getByText('제주한라병원')).toBeInTheDocument();
    expect(screen.getByText('늘푸른약국')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(await screen.findByRole('heading', { name: '등록할 약이에요' })).toBeInTheDocument();
    expect(screen.getByText('혈압약')).toBeInTheDocument();
    expect(screen.getByText('당뇨약')).toBeInTheDocument();
    expect(screen.getByText('위장약')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(await screen.findByRole('heading', { name: '식사 시간에 맞춰 알려드릴게요' })).toBeInTheDocument();
    expect(screen.getByText('저녁 식사 오후 7시 기준')).toBeInTheDocument();
    expect(screen.getByText('오후 7시 30분 알림')).toBeInTheDocument();
    expect(screen.getByText('저녁용 봉지')).toBeInTheDocument();
    expect(screen.getAllByText('30일 동안 매일 같은 순서로 반복돼요.').length).toBeGreaterThan(0);
    expect(screen.queryByText('3번 봉지')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(await screen.findByRole('heading', { name: '약 등록이 끝났어요' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '오늘 먹을 약' })).toBeInTheDocument(),
    );
  });

  it('starts the camera and advances after the QR capture action', async () => {
    const getUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia },
    });

    renderAt('/senior/add-prescription');

    expect(await screen.findByRole('heading', { name: '처방 QR을 비춰주세요' })).toBeInTheDocument();
    await waitFor(() => expect(getUserMedia).toHaveBeenCalledWith({ video: { facingMode: 'environment' }, audio: false }));

    fireEvent.click(screen.getByRole('button', { name: 'QR 촬영하기' }));

    expect(await screen.findByRole('heading', { name: '처방 QR을 읽었어요' })).toBeInTheDocument();
  });
});
