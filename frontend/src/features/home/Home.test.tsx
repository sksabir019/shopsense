// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productApi } from '../../services/products';
import { renderFeature } from '../../test-utils/renderFeature';
import { testProduct } from '../../test-utils/products';
import { Home } from './Home';

vi.mock('../../services/products', () => ({
  productApi: {
    featured: vi.fn(),
    categories: vi.fn()
  }
}));

describe('Home feature', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('renders featured products and category navigation', async () => {
    vi.mocked(productApi.featured).mockResolvedValueOnce([testProduct]);
    vi.mocked(productApi.categories).mockResolvedValueOnce(['electronics']);
    renderFeature(<Home />, '/');

    expect(await screen.findByRole('link', { name: /Test product/ })).toHaveAttribute('href', '/products/1');
    expect(await screen.findByRole('link', { name: /↗/ })).toHaveAttribute('href', '/categories/electronics');
  });

  it('shows the empty-product state when no featured products are returned', async () => {
    vi.mocked(productApi.featured).mockResolvedValueOnce([]);
    vi.mocked(productApi.categories).mockResolvedValueOnce([]);
    renderFeature(<Home />, '/');

    expect(await screen.findByText('No products found.')).toBeInTheDocument();
  });
});
