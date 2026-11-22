import { afterEach, describe, expect, it, vi } from 'vitest';
import { FakeStoreProductProvider } from '../src/providers/product/fake-store.provider.js';

const fakeProduct = {
  id: 1,
  title: 'Test product',
  description: 'A test description',
  price: 12.5,
  category: 'electronics',
  image: 'https://fakestoreapi.com/img/test.jpg',
  rating: { rate: 4.2, count: 10 }
};

function stubFetch(payload: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('FakeStoreProductProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps validated provider DTOs into catalogue products and caches the result', async () => {
    const fetchMock = stubFetch([fakeProduct]);
    const provider = new FakeStoreProductProvider('https://fakestoreapi.com', 60_000);

    expect(await provider.getProducts()).toEqual([fakeProduct]);
    expect(await provider.getProducts()).toEqual([fakeProduct]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects malformed product data instead of exposing an unchecked cast', async () => {
    stubFetch([{ ...fakeProduct, price: '12.50' }]);
    const provider = new FakeStoreProductProvider('https://fakestoreapi.com', 60_000);

    await expect(provider.getProducts()).rejects.toMatchObject({
      statusCode: 502,
      code: 'PRODUCT_PROVIDER_INVALID_RESPONSE'
    });
  });

  it('rejects non-success provider responses', async () => {
    stubFetch({ message: 'unavailable' }, 503);
    const provider = new FakeStoreProductProvider('https://fakestoreapi.com', 60_000);

    await expect(provider.getProducts()).rejects.toMatchObject({
      statusCode: 502,
      code: 'PRODUCT_PROVIDER_ERROR'
    });
  });
});
