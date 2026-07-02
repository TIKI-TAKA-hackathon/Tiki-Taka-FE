import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('entry points', () => {
  afterEach(() => cleanup());

  it('caregiver signup renders the first step (owner info)', () => {
    renderAt('/caregiver/signup');
    expect(screen.getByRole('heading', { name: '보호자 정보를 입력해요' })).toBeInTheDocument();
    expect(screen.getByLabelText('휴대폰 번호')).toBeInTheDocument();
  });

  it('senior register has no QR/camera and asks for a phone number', () => {
    renderAt('/senior/register');
    expect(screen.getByRole('heading', { name: '어르신 기기 연결' })).toBeInTheDocument();
    expect(screen.getByLabelText('휴대폰 번호')).toBeInTheDocument();
    expect(screen.queryByText(/QR/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/데모/)).not.toBeInTheDocument();
  });

  it('legacy /senior/login redirects to /login', () => {
    renderAt('/senior/login');
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
  });
});
