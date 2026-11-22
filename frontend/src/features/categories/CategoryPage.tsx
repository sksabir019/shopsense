import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { productApi } from '../../services/products';
import { ProductGrid } from '../products/components/ProductGrid';

export function CategoryPage() {
  const { category = '' } = useParams();
  const query = useQuery({ queryKey: ['category', category], queryFn: () => productApi.category(category) });

  if (query.isLoading) return <main><p>Loading category...</p></main>;
  if (query.isError) return <main><p role="alert">Unable to load this category.</p></main>;

  return (
    <main className="section">
      <p className="eyebrow">CATEGORY</p>
      <h1 className="page-title">{category}</h1>
      <h2>Featured in {category}</h2>
      <ProductGrid products={query.data?.featured ?? []} />
      <h2 className="subheading">More products</h2>
      <ProductGrid products={query.data?.additional ?? []} />
    </main>
  );
}
