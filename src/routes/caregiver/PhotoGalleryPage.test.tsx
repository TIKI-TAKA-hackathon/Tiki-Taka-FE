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

describe('photo-gallery', () => {
  afterEach(() => cleanup());

  it('renders the 7-day taken photo set from the data layer (demo fallback)', async () => {
    renderAt('/caregiver/photos');

    expect(await screen.findByRole('heading', { name: '복약 사진' })).toBeInTheDocument();
    // The fixture is the 7-day 복용 완료 set; each day renders as a tappable thumbnail.
    expect(screen.getAllByRole('button', { name: /사진 보기/ }).length).toBe(7);
    // Labels combine slot + 관리번호 (e.g. '아침 · 001-A'), all marked 확인함.
    expect(screen.getByRole('button', { name: /아침 · 001-A .* 사진 보기/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /저녁 · 007-B .* 사진 보기/ })).toBeInTheDocument();
    expect(screen.getAllByText('확인함').length).toBe(7);
  });

  it('opens the detail view and flags a photo with an optimistic update', async () => {
    renderAt('/caregiver/photos');

    // Open the newest photo (day7, '저녁 · 007-B').
    fireEvent.click(await screen.findByRole('button', { name: /저녁 · 007-B .* 사진 보기/ }));

    // Detail view shows the reference-only disclaimer and the flag action.
    expect(screen.getAllByText('사진은 참고용이며 복용 증명은 아니에요.').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: '사진이 이상해요 / 다시 요청' }));

    // Optimistic update marks the photo as flagged (다시 요청함).
    const flagged = await screen.findAllByText('다시 요청함');
    expect(flagged.length).toBeGreaterThan(0);
  });
});
