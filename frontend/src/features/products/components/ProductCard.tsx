import { Link } from 'react-router-dom';
import type { Product } from '../../../types/product';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link className="product-card" to={`/products/${product.id}`}>
      <img src={product.image} alt={product.title} />
      <div className="card-copy">
        <span className="muted">{product.category}</span>
        <h3>{product.title}</h3>
        <strong>${product.price.toFixed(2)}</strong>
      </div>
    </Link>
  );
}
