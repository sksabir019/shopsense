import { api } from './api';
import type { CategoryProducts, Product } from '../types/product';
export const productApi = {
  featured: async () => (await api.get<{ data: Product[] }>('/products/featured')).data.data,
  categories: async () => (await api.get<{ data: string[] }>('/categories')).data.data,
  category: async (category: string) => (await api.get<{ data: CategoryProducts }>(`/categories/${encodeURIComponent(category)}/products`)).data.data,
  search: async (q: string) => (await api.get<{ data: Product[] }>('/products/search', { params: { q } })).data.data,
  byId: async (id: number) => (await api.get<{ data: Product }>(`/products/${id}`)).data.data,
  submitEnquiry: async (input: { productId: number; name: string; email: string; phone: string; message: string }) =>
    (await api.post<{ data: { accepted: true; message: string } }>('/enquiries', input)).data.data
};
