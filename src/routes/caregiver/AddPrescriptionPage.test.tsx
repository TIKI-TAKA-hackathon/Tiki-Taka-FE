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

describe('add-prescription', () => {
  afterEach(() => cleanup());

  it('renders the scan screen with a manual code fallback', async () => {
    renderAt('/caregiver/add-prescription');
    expect(await screen.findByRole('heading', { name: '처방 QR을 스캔해요' })).toBeInTheDocument();
    expect(screen.getByLabelText('등록 코드 직접 입력')).toBeInTheDocument();
  });

  it('shows the confirm-meds view after entering a code (demo fallback)', async () => {
    renderAt('/caregiver/add-prescription');

    fireEvent.change(await screen.findByLabelText('등록 코드 직접 입력'), { target: { value: 'RX-DEMO-001' } });
    fireEvent.click(screen.getByRole('button', { name: '코드로 등록하기' }));

    // Demo mode resolves fetchPrescriptionByCode to the fixture (senior 김순자).
    expect(await screen.findByRole('heading', { name: '김순자님 약이 맞나요?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '맞아요' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 스캔' })).toBeInTheDocument();
  });
});
