import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../../services/products';

export function ProductPage() {
  const { id } = useParams();
  const productId = Number(id);
  const query = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.byId(productId),
    enabled: Number.isInteger(productId) && productId > 0
  });

  if (query.isLoading) return <main><p>Loading product...</p></main>;
  if (query.isError || !query.data) return <main><p role="alert">Product could not be found.</p></main>;

  return (
    <main className="detail">
      <img src={query.data.image} alt={query.data.title} />
      <div>
        <p className="eyebrow">{query.data.category}</p>
        <h1>{query.data.title}</h1>
        <p>{query.data.description}</p>
        <h2>${query.data.price.toFixed(2)}</h2>
        <p className="muted">Rating {query.data.rating.rate}/5 · {query.data.rating.count} reviews</p>
        <Link className="primary" to={`/products/${query.data.id}/enquire`}>Enquire about this product</Link>
      </div>
    </main>
  );
}
