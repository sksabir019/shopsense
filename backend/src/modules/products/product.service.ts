import type { ProductProvider } from '../../providers/product/product-provider.js';
import type { Product } from '../../types/product.js';
import { HttpError } from '../../utils/http-error.js';

export class ProductService {
  constructor(private readonly provider: ProductProvider, private readonly featuredIds: readonly number[]) {}

  async getFeatured(): Promise<Product[]> {
    const products = await this.provider.getProducts();
    const byId = new Map(products.map((product) => [product.id, product]));
    const featuredProducts: Product[] = [];
    for (const id of this.featuredIds) {
      const product = byId.get(id);
      if (!product) {
        throw new HttpError(502, 'FEATURED_PRODUCTS_UNAVAILABLE', 'Configured featured products could not be loaded.');
      }
      featuredProducts.push(product);
    }
    return featuredProducts;
  }

  getCategories(): Promise<string[]> { return this.provider.getCategories(); }

  async getCategoryProducts(category: string): Promise<{ featured: Product[]; additional: Product[] } | null> {
    const products = await this.provider.getProductsByCategory(category);
    if (products.length === 0) {
      const categories = await this.provider.getCategories();
      if (!categories.some((item) => item.toLowerCase() === category.toLowerCase())) return null;
    }
    const featuredSet = new Set(this.featuredIds);
    return {
      featured: products.filter((product) => featuredSet.has(product.id)),
      additional: products.filter((product) => !featuredSet.has(product.id))
    };
  }

  async search(query: string): Promise<Product[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    const products = await this.provider.getProducts();
    return products.filter((product) => product.title.toLowerCase().includes(normalized)
      || product.description.toLowerCase().includes(normalized)
      || product.category.toLowerCase().includes(normalized));
  }

  getById(id: number): Promise<Product | null> { return this.provider.getProductById(id); }
}
