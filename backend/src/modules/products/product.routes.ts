import { Router } from 'express';
import { z } from 'zod';
import type { ProductService } from './product.service.js';

export function productRoutes(service: ProductService): Router {
  const router = Router();
  const searchQuerySchema = z.object({ q: z.string().trim().min(1).max(100) });
  const productIdSchema = z.coerce.number().int().positive().safe();
  router.get('/featured', async (_req, res, next) => {
    try { res.json({ data: await service.getFeatured() }); } catch (error) { next(error); }
  });
  router.get('/search', async (req, res, next) => {
    try {
      const parsed = searchQuerySchema.safeParse(req.query);
      if (!parsed.success) { res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'A search term between 1 and 100 characters is required.' } }); return; }
      res.json({ data: await service.search(parsed.data.q) });
    } catch (error) { next(error); }
  });
  router.get('/:id', async (req, res, next) => {
    try {
      const parsed = productIdSchema.safeParse(req.params.id);
      if (!parsed.success) { res.status(400).json({ error: { code: 'INVALID_ID', message: 'Product ID must be a positive integer.' } }); return; }
      const product = await service.getById(parsed.data);
      if (!product) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found.' } }); return; }
      res.json({ data: product });
    } catch (error) { next(error); }
  });
  return router;
}
