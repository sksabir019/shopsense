import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { productApi } from '../../services/products';
import { ProductGrid } from '../products/components/ProductGrid';

export function Home() {
  const featured = useQuery({ queryKey: ['featured'], queryFn: productApi.featured });
  const categories = useQuery({ queryKey: ['categories'], queryFn: productApi.categories });

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">CURATED COLLECTION</p>
        <h1>Find something<br />worth keeping.</h1>
        <p>Explore our product catalogue and discover your next favourite.</p>
      </section>
      <section className="section">
        <div className="section-heading">
          <div><p className="eyebrow">HANDPICKED</p><h2>Featured products</h2></div>
        </div>
        {featured.isLoading
          ? <p>Loading featured products...</p>
          : featured.isError
            ? <p role="alert">Unable to load featured products. Please refresh.</p>
            : <ProductGrid products={featured.data ?? []} />}
      </section>
      <section className="section">
        <p className="eyebrow">BROWSE</p>
        <h2>Shop by category</h2>
        {categories.isLoading
          ? <p>Loading categories...</p>
          : categories.isError
            ? <p role="alert">Unable to load categories.</p>
            : (
              <div className="category-list">
                {categories.data?.map((category) => (
                  <Link key={category} to={`/categories/${encodeURIComponent(category)}`}>
                    {category}<span>↗</span>
                  </Link>
                ))}
              </div>
            )}
      </section>
    </main>
  );
}
