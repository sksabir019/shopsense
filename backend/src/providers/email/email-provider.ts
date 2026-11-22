import type { EnquiryInput } from '../../modules/enquiries/enquiry.schema.js';
import type { Product } from '../../types/product.js';
export interface EmailProvider { sendEnquiry(input: EnquiryInput, product: Product): Promise<void>; }
