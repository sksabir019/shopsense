import type { Product } from '../../types/product.js';

export interface ProductProvider {
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  getCategories(): Promise<string[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
}
