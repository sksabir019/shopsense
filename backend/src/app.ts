import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, featuredProductIds } from './config/env.js';
import { FakeStoreProductProvider } from './providers/product/fake-store.provider.js';
import { SmtpEmailProvider } from './providers/email/smtp-email.provider.js';
import { ProductService } from './modules/products/product.service.js';
import { productRoutes } from './modules/products/product.routes.js';
import { enquiryRoutes } from './modules/enquiries/enquiry.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import type { ProductProvider } from './providers/product/product-provider.js';
import type { EmailProvider } from './providers/email/email-provider.js';
import { z } from 'zod';

interface AppDependencies {
  productProvider?: ProductProvider;
  emailProvider?: EmailProvider;
  featuredIds?: readonly number[];
}

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  app.set('trust proxy', env.TRUST_PROXY_HOPS);
  const productProvider = dependencies.productProvider
    ?? new FakeStoreProductProvider(env.FAKE_STORE_API_BASE_URL, env.PRODUCT_CACHE_TTL_MS);
  const productService = new ProductService(productProvider, dependencies.featuredIds ?? featuredProductIds);
  const emailProvider = dependencies.emailProvider ?? new SmtpEmailProvider({
    host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE,
    user: env.SMTP_USER, pass: env.SMTP_PASS, from: env.MAIL_FROM, salesInbox: env.SALES_INBOX
  });
  const categoryParamsSchema = z.object({ category: z.string().trim().min(1).max(100) });

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_ORIGIN }));
  app.use(express.json({ limit: '20kb' }));
  app.get('/api/v1/health', (_req, res) => res.json({ data: { status: 'ok' } }));
  app.get('/api/v1/categories', async (_req, res, next) => {
    try { res.json({ data: await productService.getCategories() }); } catch (error) { next(error); }
  });
  app.get('/api/v1/categories/:category/products', async (req, res, next) => {
    try {
      const parsed = categoryParamsSchema.safeParse(req.params);
      if (!parsed.success) { res.status(400).json({ error: { code: 'INVALID_CATEGORY', message: 'A valid category is required.' } }); return; }
      const products = await productService.getCategoryProducts(parsed.data.category);
      if (!products) { res.status(404).json({ error: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found.' } }); return; }
      res.json({ data: products });
    } catch (error) { next(error); }
  });
  app.use('/api/v1/products', productRoutes(productService));
  app.use('/api/v1/enquiries', enquiryRoutes(productService, emailProvider));
  app.use('/api/v1', (_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API route not found.' } });
  });
  app.use(errorHandler);
  return app;
}
