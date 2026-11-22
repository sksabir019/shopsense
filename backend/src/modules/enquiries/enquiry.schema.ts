import { z } from 'zod';
export const enquirySchema = z.object({
  productId: z.number().int().positive().safe(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(20)
    .regex(/^\+?[0-9\s().-]+$/)
    .refine((value) => (value.match(/[0-9]/g)?.length ?? 0) >= 7, 'Enter at least 7 digits.'),
  message: z.string().trim().min(5).max(2000)
});
export type EnquiryInput = z.infer<typeof enquirySchema>;
