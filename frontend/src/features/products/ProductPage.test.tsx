// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productApi } from '../../services/products';
import { renderFeature } from '../../test-utils/renderFeature';
import { testProduct } from '../../test-utils/products';
import { ProductPage } from './ProductPage';

vi.mock('../../services/products', () => ({
  productApi: { byId: vi.fn() }
}));

describe('Product feature', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('renders product details and the enquiry link', async () => {
    vi.mocked(productApi.byId).mockResolvedValueOnce(testProduct);
    renderFeature(<ProductPage />, '/products/:id', '/products/1');

    expect(await screen.findByRole('heading', { name: 'Test product' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Enquire about this product' })).toHaveAttribute('href', '/products/1/enquire');
  });

  it('shows the not-found state when the product request fails', async () => {
    vi.mocked(productApi.byId).mockRejectedValueOnce(new Error('Product unavailable'));
    renderFeature(<ProductPage />, '/products/:id', '/products/1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Product could not be found.');
  });
});
