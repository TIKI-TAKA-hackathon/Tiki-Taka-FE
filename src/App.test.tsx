import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { env } from './lib/env';

describe('App', () => {
  it('renders the 고찌봄 onboarding and shows the configured API base URL', () => {
    render(
      <MemoryRouter initialEntries={['/onboarding']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '고찌봄' })).toBeInTheDocument();
    expect(screen.getByTestId('api-base')).toHaveTextContent(env.apiBaseUrl);
  });

  it('shows the caregiver monitoring dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/caregiver']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '어머니 복약 상태' })).toBeInTheDocument();
  });
});
