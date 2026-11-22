import type { Product } from '../../types/product.js';
import { HttpError } from '../../utils/http-error.js';
import type { ProductProvider } from './product-provider.js';
import { z } from 'zod';

const fakeStoreProductSchema = z.object({
  id: z.number().int().positive().safe(),
  title: z.string().min(1),
  description: z.string(),
  price: z.number().finite().nonnegative(),
  category: z.string().trim().min(1),
  image: z.string().url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol)),
  rating: z.object({
    rate: z.number().finite().min(0).max(5),
    count: z.number().int().nonnegative()
  }).optional()
});

const fakeStoreProductsSchema = z.array(fakeStoreProductSchema);
const fakeStoreCategoriesSchema = z.array(z.string().trim().min(1));
type FakeStoreProduct = z.infer<typeof fakeStoreProductSchema>;

export class FakeStoreProductProvider implements ProductProvider {
  private cache: { products: Product[]; expiresAt: number } | null = null;

  constructor(private readonly baseUrl: string, private readonly ttlMs: number) {}

  private async request(path: string): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, { signal: AbortSignal.timeout(5_000) });
    } catch (error) {
      throw new HttpError(502, 'PRODUCT_PROVIDER_UNAVAILABLE', 'The product catalogue is temporarily unavailable.', { cause: error });
    }
    if (!response.ok) {
      throw new HttpError(502, 'PRODUCT_PROVIDER_ERROR', 'The product catalogue is temporarily unavailable.');
    }
    try {
      return await response.json() as unknown;
    } catch (error) {
      throw new HttpError(502, 'PRODUCT_PROVIDER_INVALID_RESPONSE', 'The product catalogue returned an invalid response.', { cause: error });
    }
  }

  private parse<T>(schema: z.ZodType<T>, input: unknown): T {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      throw new HttpError(502, 'PRODUCT_PROVIDER_INVALID_RESPONSE', 'The product catalogue returned an invalid response.', { cause: parsed.error });
    }
    return parsed.data;
  }

  private mapProduct(raw: FakeStoreProduct): Product {
    return {
      id: raw.id, title: raw.title, description: raw.description, price: raw.price,
      category: raw.category, image: raw.image,
      rating: { rate: raw.rating?.rate ?? 0, count: raw.rating?.count ?? 0 }
    };
  }

  async getProducts(): Promise<Product[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.products;
    const raw = this.parse(fakeStoreProductsSchema, await this.request('/products'));
    const products = raw.map((item) => this.mapProduct(item));
    this.cache = { products, expiresAt: Date.now() + this.ttlMs };
    return products;
  }

  async getProductById(id: number): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((product) => product.id === id) ?? null;
  }

  async getCategories(): Promise<string[]> {
    return this.parse(fakeStoreCategoriesSchema, await this.request('/products/categories'));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((product) => product.category.toLowerCase() === category.toLowerCase());
  }
}
