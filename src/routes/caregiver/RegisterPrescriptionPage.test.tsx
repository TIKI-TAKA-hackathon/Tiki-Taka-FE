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

describe('register-prescription', () => {
  afterEach(() => cleanup());

  it('renders the pharmacy registration form', () => {
    renderAt('/caregiver/register-prescription');
    expect(screen.getByRole('heading', { name: '처방을 등록해요' })).toBeInTheDocument();
    expect(screen.getByLabelText('약국 이름')).toBeInTheDocument();
  });

  it('issues a registration code after submitting (demo fallback)', async () => {
    renderAt('/caregiver/register-prescription');

    fireEvent.change(screen.getByLabelText('약국 이름'), { target: { value: '행복약국' } });
    fireEvent.click(screen.getByRole('button', { name: '처방 등록하고 코드 발급' }));

    // createPrescription resolves (real POST or demo fallback) and the issued code is shown for scanning/entry.
    expect(await screen.findByRole('heading', { name: '처방이 등록됐어요' })).toBeInTheDocument();
    const code = screen.getByText(/^RX\d{6}$/);
    expect(code).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '코드 복사하기' })).toBeInTheDocument();
  });
});
