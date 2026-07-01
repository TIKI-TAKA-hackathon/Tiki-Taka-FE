import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { env } from './lib/env';

describe('App', () => {
  it('renders the home screen and shows the configured API base URL', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('기억카드 만들기')).toBeInTheDocument();
    expect(screen.getByTestId('api-base')).toHaveTextContent(env.apiBaseUrl);
  });
});
