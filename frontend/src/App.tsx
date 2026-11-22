import { Link, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { CategoryPage } from './features/categories/CategoryPage';
import { EnquiryPage } from './features/enquiries/EnquiryPage';
import { Home } from './features/home/Home';
import { ProductPage } from './features/products/ProductPage';
import { SearchPage } from './features/search/SearchPage';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories/:category" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="/products/:id/enquire" element={<EnquiryPage />} />
        <Route path="*" element={<main><h1>Page not found</h1><Link to="/">Return home</Link></main>} />
      </Routes>
      <footer>© {new Date().getFullYear()} ShopSense. Built with care.</footer>
    </>
  );
}
