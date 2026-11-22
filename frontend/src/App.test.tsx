// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { renderFeature } from './test-utils/renderFeature';

vi.mock('./services/products', () => ({
  productApi: {
    featured: vi.fn().mockResolvedValue([]),
    categories: vi.fn().mockResolvedValue([])
  }
}));

describe('App shell', () => {
  afterEach(cleanup);

  it('composes the shared header, home route, and footer', async () => {
    renderFeature(<App />, '*', '/');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /Find something/ })).toBeInTheDocument();
    expect(screen.getByText(/ShopSense\. Built with care\./)).toBeInTheDocument();
  });
});
