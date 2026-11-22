// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productApi } from '../../services/products';
import { additionalTestProduct, testProduct } from '../../test-utils/products';
import { renderFeature } from '../../test-utils/renderFeature';
import { CategoryPage } from './CategoryPage';

vi.mock('../../services/products', () => ({
  productApi: { category: vi.fn() }
}));

describe('Category feature', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('shows featured and additional products and preserves percent characters in category names', async () => {
    vi.mocked(productApi.category).mockResolvedValueOnce({
      featured: [testProduct],
      additional: [additionalTestProduct]
    });
    renderFeature(<CategoryPage />, '/categories/:category', '/categories/cotton%25%20blend');

    expect(await screen.findByRole('heading', { name: 'Featured in cotton% blend' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Test product/ })).toHaveAttribute('href', '/products/1');
    expect(screen.getByRole('link', { name: /Additional product/ })).toHaveAttribute('href', '/products/2');
    expect(productApi.category).toHaveBeenCalledWith('cotton% blend');
  });

  it('shows an error when the category request fails', async () => {
    vi.mocked(productApi.category).mockRejectedValueOnce(new Error('API unavailable'));
    renderFeature(<CategoryPage />, '/categories/:category', '/categories/electronics');

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load this category.');
  });
});
