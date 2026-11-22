// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Header } from './Header';
import { renderFeature } from '../test-utils/renderFeature';

describe('Header search', () => {
  afterEach(cleanup);

  it('requires a search term', () => {
    renderFeature(<Header />, '*', '/');

    expect(screen.getByRole('textbox', { name: 'Search products' })).toBeRequired();
  });

  it('syncs the input with the URL and navigates with a trimmed query', async () => {
    renderFeature(<Header />, '*', '/search?q=boots');
    const input = screen.getByRole('textbox', { name: 'Search products' });

    expect(input).toHaveValue('boots');
    fireEvent.change(input, { target: { value: '  jacket  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    await waitFor(() => expect(input).toHaveValue('jacket'));
  });
});
