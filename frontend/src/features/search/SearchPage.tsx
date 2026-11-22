import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../../services/products';
import { ProductGrid } from '../products/components/ProductGrid';

export function SearchPage() {
  const [params] = useSearchParams();
  const queryText = params.get('q')?.trim() ?? '';
  const query = useQuery({
    queryKey: ['search', queryText],
    queryFn: () => productApi.search(queryText),
    enabled: !!queryText
  });

  return (
    <main className="section">
      <p className="eyebrow">SEARCH RESULTS</p>
      <h1 className="page-title">Results for “{queryText}”</h1>
      {!queryText
        ? <p className="muted">Enter a search term above to find products.</p>
        : query.isLoading
          ? <p>Searching...</p>
          : query.isError
            ? <p role="alert">Search is temporarily unavailable.</p>
            : <ProductGrid products={query.data ?? []} />}
    </main>
  );
}
