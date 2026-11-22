import { describe, expect, it } from 'vitest';
import { ProductService } from '../src/modules/products/product.service.js';
import type { ProductProvider } from '../src/providers/product/product-provider.js';
import type { Product } from '../src/types/product.js';

const products: Product[] = [1, 2, 3].map((id) => ({ id, title: `Item ${id}`, description: 'Useful gadget', price: 10, category: 'electronics', image: '', rating: { rate: 4, count: 10 } }));
const provider: ProductProvider = {
  getProducts: async () => products,
  getProductById: async (id) => products.find((p) => p.id === id) ?? null,
  getCategories: async () => ['electronics'],
  getProductsByCategory: async () => products
};

describe('ProductService', () => {
  it('returns configured featured products in configured order', async () => {
    const service = new ProductService(provider, [3, 1, 2]);
    expect((await service.getFeatured()).map((p) => p.id)).toEqual([3, 1, 2]);
  });
  it('fails explicitly when a configured featured product is unavailable', async () => {
    const service = new ProductService(provider, [1, 2, 99]);

    await expect(service.getFeatured()).rejects.toMatchObject({
      statusCode: 502,
      code: 'FEATURED_PRODUCTS_UNAVAILABLE'
    });
  });
  it('searches title and description without case sensitivity', async () => {
    const service = new ProductService(provider, [1, 2, 3]);
    expect((await service.search('GADGET')).length).toBe(3);
    expect(await service.search('   ')).toEqual([]);
  });
  it('matches category text in search results', async () => {
    const categorizedProduct = { ...products[0], category: 'jewelery' };
    const categoryProvider: ProductProvider = {
      ...provider,
      getProducts: async () => [categorizedProduct]
    };
    const service = new ProductService(categoryProvider, []);

    expect(await service.search('jewel')).toEqual([categorizedProduct]);
  });
  it('separates featured and additional products within a category', async () => {
    const service = new ProductService(provider, [2]);
    const result = await service.getCategoryProducts('electronics');
    expect(result).not.toBeNull();
    expect(result?.featured.map((p) => p.id)).toEqual([2]);
    expect(result?.additional.map((p) => p.id)).toEqual([1, 3]);
  });

  it('distinguishes an unknown category from a known category with no products', async () => {
    const emptyCategoryProvider: ProductProvider = {
      ...provider,
      getProductsByCategory: async () => []
    };
    const service = new ProductService(emptyCategoryProvider, []);

    expect(await service.getCategoryProducts('electronics')).toEqual({ featured: [], additional: [] });
    expect(await service.getCategoryProducts('unknown')).toBeNull();
  });
});
