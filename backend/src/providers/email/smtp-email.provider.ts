import nodemailer from 'nodemailer';
import type { EmailProvider } from './email-provider.js';
import type { EnquiryInput } from '../../modules/enquiries/enquiry.schema.js';
import type { Product } from '../../types/product.js';

export class SmtpEmailProvider implements EmailProvider {
  private readonly transporter;
  constructor(private readonly options: { host: string; port: number; secure: boolean; user: string; pass: string; from: string; salesInbox: string }) {
    this.transporter = nodemailer.createTransport({
      host: options.host, port: options.port, secure: options.secure,
      ...(options.user ? { auth: { user: options.user, pass: options.pass } } : {})
    });
  }
  async sendEnquiry(input: EnquiryInput, product: Product): Promise<void> {
    await this.transporter.sendMail({
      from: this.options.from, to: this.options.salesInbox,
      replyTo: input.email, subject: `Product enquiry: ${product.title}`,
      text: `Customer: ${input.name}\nEmail: ${input.email}\nPhone: ${input.phone}\nProduct: ${product.title} (ID ${product.id})\n\nMessage:\n${input.message}`
    });
  }
}
