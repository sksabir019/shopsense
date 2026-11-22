// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { productApi } from '../../services/products';
import { renderFeature } from '../../test-utils/renderFeature';
import { testProduct } from '../../test-utils/products';
import { EnquiryPage } from './EnquiryPage';

vi.mock('../../services/products', () => ({
  productApi: { byId: vi.fn(), submitEnquiry: vi.fn() }
}));

async function fillEnquiryForm(phone = '+1 555 123 4567') {
  fireEvent.change(await screen.findByLabelText('Full name'), { target: { value: 'Taylor Example' } });
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'taylor@example.test' } });
  fireEvent.change(screen.getByLabelText('Phone number'), { target: { value: phone } });
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Please send me more information.' } });
}

describe('Enquiry feature', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('submits a valid enquiry and shows success', async () => {
    vi.mocked(productApi.byId).mockResolvedValueOnce(testProduct);
    vi.mocked(productApi.submitEnquiry).mockResolvedValueOnce({
      accepted: true,
      message: 'Thank you. Your enquiry has been sent.'
    });
    renderFeature(<EnquiryPage />, '/products/:id/enquire', '/products/1/enquire');
    await fillEnquiryForm();

    fireEvent.click(screen.getByRole('button', { name: 'Submit enquiry' }));

    expect(await screen.findByText('Your enquiry for Test product has been submitted.')).toBeInTheDocument();
    expect(productApi.submitEnquiry).toHaveBeenCalledWith({
      productId: 1,
      name: 'Taylor Example',
      email: 'taylor@example.test',
      phone: '+1 555 123 4567',
      message: 'Please send me more information.'
    });
  });

  it('shows a retryable error when the API rejects the enquiry', async () => {
    vi.mocked(productApi.byId).mockResolvedValueOnce(testProduct);
    vi.mocked(productApi.submitEnquiry).mockRejectedValueOnce(new Error('SMTP unavailable'));
    renderFeature(<EnquiryPage />, '/products/:id/enquire', '/products/1/enquire');
    await fillEnquiryForm();

    fireEvent.click(screen.getByRole('button', { name: 'Submit enquiry' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("We couldn't submit your enquiry. Please try again.");
  });

  it('rejects invalid phone numbers before calling the API', async () => {
    vi.mocked(productApi.byId).mockResolvedValueOnce(testProduct);
    renderFeature(<EnquiryPage />, '/products/:id/enquire', '/products/1/enquire');
    await fillEnquiryForm('--------');

    fireEvent.click(screen.getByRole('button', { name: 'Submit enquiry' }));

    expect(await screen.findByText(/at least 7 digits/)).toBeInTheDocument();
    expect(productApi.submitEnquiry).not.toHaveBeenCalled();
  });
});
