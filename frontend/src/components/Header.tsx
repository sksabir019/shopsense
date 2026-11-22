import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export function Header() {
  const [term, setTerm] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlQuery = searchParams.get('q') ?? '';

  useEffect(() => {
    setTerm(urlQuery);
  }, [urlQuery]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const query = term.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="header">
      <Link to="/" className="brand">ShopSense<span>.</span></Link>
      <form onSubmit={submit} className="search">
        <input
          aria-label="Search products"
          placeholder="Search products..."
          required
          value={term}
          onChange={(event) => setTerm(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>
    </header>
  );
}
