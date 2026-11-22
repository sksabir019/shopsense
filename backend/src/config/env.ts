import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
dotenv.config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

const featuredProductIdsSchema = z.string()
  .trim()
  .min(1)
  .transform((value) => value.split(',').map((id) => id.trim()))
  .pipe(z.array(z.string().min(1).pipe(z.coerce.number().int().positive().safe())).length(5))
  .superRefine((ids, context) => {
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Featured product IDs must be unique.' });
    }
  });

const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  TRUST_PROXY_HOPS: z.coerce.number().int().nonnegative().max(10).default(0),
  FAKE_STORE_API_BASE_URL: z.string().url().refine((value) => ['http:', 'https:'].includes(new URL(value).protocol)).default('https://fakestoreapi.com'),
  PRODUCT_CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(60_000),
  FEATURED_PRODUCT_IDS: featuredProductIdsSchema.default('1,2,3,4,5'),
  SALES_INBOX: z.string().email().default('sales@example.test'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  SMTP_USER: z.string().trim().default(''),
  SMTP_PASS: z.string().default(''),
  MAIL_FROM: z.string().default('Product Catalogue <no-reply@example.test>')
}).superRefine(({ SMTP_USER, SMTP_PASS }, context) => {
  if (Boolean(SMTP_USER) !== Boolean(SMTP_PASS)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [SMTP_USER ? 'SMTP_PASS' : 'SMTP_USER'],
      message: 'SMTP_USER and SMTP_PASS must be provided together.'
    });
  }
});

export const envSchema = baseEnvSchema.transform((values) => {
  const SMTP_PASS = values.SMTP_HOST.toLowerCase() === 'smtp.gmail.com'
    ? values.SMTP_PASS.replace(/\s/g, '')
    : values.SMTP_PASS;
  return { ...values, SMTP_PASS };
});

export const env = envSchema.parse(process.env);
export const featuredProductIds = env.FEATURED_PRODUCT_IDS;
