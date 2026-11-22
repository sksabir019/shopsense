// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productApi } from '../../services/products';
import { renderFeature } from '../../test-utils/renderFeature';
import { testProduct } from '../../test-utils/products';
import { SearchPage } from './SearchPage';

vi.mock('../../services/products', () => ({
  productApi: { search: vi.fn() }
}));

describe('Search feature', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('prompts for a term without calling the API when the query is empty', () => {
    renderFeature(<SearchPage />, '/search', '/search');

    expect(screen.getByText('Enter a search term above to find products.')).toBeInTheDocument();
    expect(productApi.search).not.toHaveBeenCalled();
  });

  it('renders products for the query in the URL', async () => {
    vi.mocked(productApi.search).mockResolvedValueOnce([testProduct]);
    renderFeature(<SearchPage />, '/search', '/search?q=jacket');

    expect(await screen.findByRole('heading', { name: 'Results for “jacket”' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Test product/ })).toHaveAttribute('href', '/products/1');
    expect(productApi.search).toHaveBeenCalledWith('jacket');
  });
});
