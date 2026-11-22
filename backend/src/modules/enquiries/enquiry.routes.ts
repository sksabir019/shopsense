import { Router } from 'express';
import type { ProductService } from '../products/product.service.js';
import type { EmailProvider } from '../../providers/email/email-provider.js';
import { enquirySchema } from './enquiry.schema.js';
import { logger } from '../../utils/logger.js';
import { HttpError } from '../../utils/http-error.js';
import { createEnquiryRateLimiter } from '../../middleware/enquiry-rate-limit.js';

export function enquiryRoutes(products: ProductService, email: EmailProvider): Router {
  const router = Router();
  router.post('/', createEnquiryRateLimiter(), async (req, res, next) => {
    try {
      const parsed = enquirySchema.safeParse(req.body);
      if (!parsed.success) { res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Please check the enquiry details.', details: parsed.error.flatten().fieldErrors } }); return; }
      const product = await products.getById(parsed.data.productId);
      if (!product) { res.status(404).json({ error: { code: 'PRODUCT_NOT_FOUND', message: 'The selected product was not found.' } }); return; }
      try {
        await email.sendEnquiry(parsed.data, product);
      } catch (error) {
        throw new HttpError(502, 'EMAIL_DELIVERY_FAILED', 'The enquiry could not be sent. Please try again.', { cause: error });
      }
      logger.info({ productId: product.id }, 'Enquiry email sent');
      res.status(202).json({ data: { accepted: true, message: 'Thank you. Your enquiry has been sent.' } });
    } catch (error) { next(error); }
  });
  return router;
}
