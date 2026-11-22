import type { Product } from '../types/product';

export const testProduct: Product = {
  id: 1,
  title: 'Test product',
  description: 'A test description',
  price: 12.5,
  category: 'electronics',
  image: 'https://fakestoreapi.com/img/test.jpg',
  rating: { rate: 4.2, count: 10 }
};

export const additionalTestProduct: Product = {
  ...testProduct,
  id: 2,
  title: 'Additional product'
};
