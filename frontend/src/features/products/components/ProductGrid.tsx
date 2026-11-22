import type { Product } from '../../../types/product';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  return products.length
    ? <div className="grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    : <p className="muted">No products found.</p>;
}
