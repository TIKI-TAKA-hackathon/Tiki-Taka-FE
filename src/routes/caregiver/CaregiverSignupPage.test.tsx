import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../../App';

// Tests run with env.demoMode === true (see src/test/setup.ts), so the demo
// prefill applies here: the signup form should arrive filled with an enabled
// advance button, letting the presenter click straight through.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('caregiver signup (demo prefill)', () => {
  afterEach(() => cleanup());

  it('arrives with the owner step prefilled and 인증번호 받기 enabled', async () => {
    renderAt('/caregiver/signup');

    expect(await screen.findByLabelText('이름')).toHaveValue('김보호');
    expect(screen.getByLabelText('휴대폰 번호')).toHaveValue('010-1234-5678');
    expect(screen.getByRole('button', { name: '인증번호 받기' })).toBeEnabled();
  });
});
