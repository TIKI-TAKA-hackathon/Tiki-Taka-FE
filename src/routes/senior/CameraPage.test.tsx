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

// A 1x1 transparent PNG as a real File so FileReader produces a data URL.
const PNG_BYTES = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  ),
  (c) => c.charCodeAt(0),
);

function pngFile() {
  return new File([PNG_BYTES], 'meds.png', { type: 'image/png' });
}

describe('senior camera → self-check → done flow', () => {
  afterEach(() => cleanup());

  it('selects a photo, self-confirms, shares it, and lands on the done screen with the disclaimer', async () => {
    const { container } = renderAt('/senior/camera');

    expect(await screen.findByRole('heading', { name: '약 봉지 사진' })).toBeInTheDocument();

    // "앨범에서 선택" is backed by a hidden file input. Pick the album input (not capture=).
    const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
    const albumInput = Array.from(fileInputs).find((input) => !input.hasAttribute('capture'));
    expect(albumInput).toBeDefined();

    fireEvent.change(albumInput as HTMLInputElement, { target: { files: [pngFile()] } });

    // Self-check step appears once FileReader resolves the data URL.
    expect(await screen.findByRole('heading', { name: '이 사진이 약이 맞나요?' })).toBeInTheDocument();
    const preview = screen.getByAltText('넣은 약 봉지 사진') as HTMLImageElement;
    expect(preview.src).toMatch(/^data:image\/png/);

    // Only "네, 맞아요" shares the photo and navigates to /senior/done.
    fireEvent.click(screen.getByRole('button', { name: /네, 맞아요/ }));

    expect(await screen.findByRole('heading', { name: '잘 하셨어요!' })).toBeInTheDocument();
    const shared = screen.getByAltText('보호자에게 보낸 약 사진') as HTMLImageElement;
    expect(shared.src).toMatch(/^data:image\/png/);
    expect(screen.getByText('사진은 참고용이며 복용 증명은 아니에요.')).toBeInTheDocument();
  });

  it('"다시" clears the preview and returns to the capture/select step', async () => {
    const { container } = renderAt('/senior/camera');
    await screen.findByRole('heading', { name: '약 봉지 사진' });

    const albumInput = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="file"]'),
    ).find((input) => !input.hasAttribute('capture'));
    fireEvent.change(albumInput as HTMLInputElement, { target: { files: [pngFile()] } });

    await screen.findByRole('heading', { name: '이 사진이 약이 맞나요?' });
    fireEvent.click(screen.getByRole('button', { name: /다시/ }));

    // Back to the select step: the album button is shown again, no self-check heading.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /앨범에서 선택/ })).toBeInTheDocument(),
    );
    expect(screen.queryByRole('heading', { name: '이 사진이 약이 맞나요?' })).not.toBeInTheDocument();
  });
});
