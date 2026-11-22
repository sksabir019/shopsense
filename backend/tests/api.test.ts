import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import type { EmailProvider } from '../src/providers/email/email-provider.js';
import type { ProductProvider } from '../src/providers/product/product-provider.js';
import type { Product } from '../src/types/product.js';

const product: Product = {
  id: 1,
  title: 'Test product',
  description: 'A useful product',
  price: 12.5,
  category: 'electronics',
  image: 'https://fakestoreapi.com/img/test.jpg',
  rating: { rate: 4.2, count: 10 }
};

const productProvider: ProductProvider = {
  getProducts: vi.fn().mockResolvedValue([product]),
  getProductById: vi.fn().mockResolvedValue(product),
  getCategories: vi.fn().mockResolvedValue(['electronics']),
  getProductsByCategory: vi.fn().mockImplementation(async (category: string) =>
    category.toLowerCase() === product.category ? [product] : [])
};

const emailProvider: EmailProvider = {
  sendEnquiry: vi.fn().mockResolvedValue(undefined)
};

const app = createApp({
  productProvider,
  emailProvider,
  featuredIds: [1]
});

describe('API contracts', () => {
  it('returns a JSON 404 for an unknown API route', async () => {
    const response = await request(app).get('/api/v1/unknown');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('distinguishes an unknown category from an empty category', async () => {
    const response = await request(app).get('/api/v1/categories/unknown/products');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('rejects malformed product IDs with a JSON validation error', async () => {
    const response = await request(app).get('/api/v1/products/not-an-id');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_ID');
  });

  it('returns an explicit upstream error instead of a partial featured list', async () => {
    const incompleteApp = createApp({
      productProvider,
      emailProvider,
      featuredIds: [1, 2, 3, 4, 5]
    });

    const response = await request(incompleteApp).get('/api/v1/products/featured');

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('FEATURED_PRODUCTS_UNAVAILABLE');
  });

  it('accepts an enquiry only after the email provider succeeds', async () => {
    const response = await request(app).post('/api/v1/enquiries').send({
      productId: 1,
      name: 'Taylor Example',
      email: 'taylor@example.test',
      phone: '+1 555 123 4567',
      message: 'Please send me more information.'
    });

    expect(response.status).toBe(202);
    expect(response.body.data.accepted).toBe(true);
    expect(emailProvider.sendEnquiry).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'taylor@example.test' }),
      product
    );
  });

  it('does not report success when email delivery fails', async () => {
    vi.mocked(emailProvider.sendEnquiry).mockRejectedValueOnce(new Error('SMTP internal detail'));

    const response = await request(app).post('/api/v1/enquiries').send({
      productId: 1,
      name: 'Taylor Example',
      email: 'taylor@example.test',
      phone: '+1 555 123 4567',
      message: 'Please send me more information.'
    });

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('EMAIL_DELIVERY_FAILED');
    expect(JSON.stringify(response.body)).not.toContain('SMTP internal detail');
  });

  it('rejects phone values without enough digits', async () => {
    const response = await request(app).post('/api/v1/enquiries').send({
      productId: 1,
      name: 'Taylor Example',
      email: 'taylor@example.test',
      phone: '--------',
      message: 'Please send me more information.'
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('limits enquiry submissions from the same client IP', async () => {
    const limitedApp = createApp({
      productProvider,
      emailProvider,
      featuredIds: [1]
    });
    const enquiry = {
      productId: 1,
      name: 'Taylor Example',
      email: 'taylor@example.test',
      phone: '+1 555 123 4567',
      message: 'Please send me more information.'
    };
    const statuses: number[] = [];
    let finalBody: unknown;
    let retryAfter: string | undefined;

    for (let index = 0; index < 6; index += 1) {
      const response = await request(limitedApp).post('/api/v1/enquiries').send(enquiry);
      statuses.push(response.status);
      if (index === 5) {
        finalBody = response.body;
        retryAfter = response.headers['retry-after'];
      }
    }

    expect(statuses).toEqual([202, 202, 202, 202, 202, 429]);
    expect(finalBody).toMatchObject({ error: { code: 'ENQUIRY_RATE_LIMITED' } });
    expect(retryAfter).toBeDefined();
  });
});
