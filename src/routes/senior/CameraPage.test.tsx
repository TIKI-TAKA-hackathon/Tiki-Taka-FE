import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

describe('senior camera → self-check → done flow', () => {
  afterEach(() => cleanup());

  it('continues with a fallback photo, self-confirms, shares it, and lands on the done screen', async () => {
    renderAt('/senior/camera');

    expect(await screen.findByRole('heading', { name: '약 봉지 사진' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /앨범에서 선택/ })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: /예시 사진으로 계속/ }));

    expect(await screen.findByRole('heading', { name: '이 사진이 약이 맞나요?' })).toBeInTheDocument();
    const preview = screen.getByAltText('넣은 약 봉지 사진') as HTMLImageElement;
    expect(preview.src).toContain('/mock/');

    fireEvent.click(screen.getByRole('button', { name: /네, 맞아요/ }));

    expect(await screen.findByRole('heading', { name: '잘 하셨어요!' })).toBeInTheDocument();
    const shared = screen.getByAltText('보호자에게 보낸 약 사진') as HTMLImageElement;
    expect(shared.src).toContain('/mock/');
    expect(screen.getByText('사진은 참고용이며 복용 증명은 아니에요.')).toBeInTheDocument();
  });

  it('"다시" clears the preview and returns to the capture/select step', async () => {
    renderAt('/senior/camera');
    await screen.findByRole('heading', { name: '약 봉지 사진' });

    fireEvent.click(await screen.findByRole('button', { name: /예시 사진으로 계속/ }));

    await screen.findByRole('heading', { name: '이 사진이 약이 맞나요?' });
    fireEvent.click(screen.getByRole('button', { name: /다시/ }));

    // Back to the capture step: album selection stays removed.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /예시 사진으로 계속/ })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('button', { name: /앨범에서 선택/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '이 사진이 약이 맞나요?' })).not.toBeInTheDocument();
  });

  it('offers a caregiver call after three retakes', async () => {
    renderAt('/senior/camera');
    await screen.findByRole('heading', { name: '약 봉지 사진' });

    for (let index = 0; index < 3; index += 1) {
      fireEvent.click(await screen.findByRole('button', { name: /예시 사진으로 계속/ }));
      await screen.findByRole('heading', { name: '이 사진이 약이 맞나요?' });
      fireEvent.click(screen.getByRole('button', { name: /다시/ }));
      if (index < 2) {
        await waitFor(() =>
          expect(screen.getByRole('button', { name: /예시 사진으로 계속/ })).toBeInTheDocument(),
        );
      }
    }

    expect(await screen.findByRole('link', { name: /보호자에게 전화하기/ })).toHaveAttribute(
      'href',
      'tel:01012345678',
    );
    expect(screen.getByRole('heading', { name: '대표 보호자에게 전화하세요' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /네, 맞아요/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /다시/ })).not.toBeInTheDocument();
  });
});
