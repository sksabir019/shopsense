import { createServer } from 'node:net';
import { describe, expect, it } from 'vitest';
import { SmtpEmailProvider } from '../src/providers/email/smtp-email.provider.js';
import type { EnquiryInput } from '../src/modules/enquiries/enquiry.schema.js';
import type { Product } from '../src/types/product.js';

const product: Product = {
  id: 1,
  title: 'Test product',
  description: 'A useful product',
  price: 12.5,
  category: 'electronics',
  image: 'https://fakestoreapi.com/img/test.jpg',
  rating: { rate: 4.2, count: 10 }
};

const enquiry: EnquiryInput = {
  productId: 1,
  name: 'Taylor Example',
  email: 'taylor@example.test',
  phone: '+1 555 123 4567',
  message: 'Please send me more information.'
};

describe('SmtpEmailProvider', () => {
  it('delivers an enquiry through an SMTP server and formats the message', async () => {
    let resolveMessage: (message: string) => void = () => {};
    const receivedMessage = new Promise<string>((resolve) => {
      resolveMessage = resolve;
    });
    const server = createServer((socket) => {
      let buffer = '';
      let collectingData = false;
      const messageLines: string[] = [];
      socket.write('220 local.test ESMTP\r\n');

      socket.on('data', (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
        let lineEnd = buffer.indexOf('\r\n');
        while (lineEnd !== -1) {
          const line = buffer.slice(0, lineEnd);
          buffer = buffer.slice(lineEnd + 2);

          if (collectingData) {
            if (line === '.') {
              collectingData = false;
              resolveMessage(messageLines.join('\r\n'));
              socket.write('250 2.0.0 Message accepted\r\n');
            } else {
              messageLines.push(line.startsWith('..') ? line.slice(1) : line);
            }
          } else if (line.startsWith('EHLO ') || line.startsWith('HELO ')) {
            socket.write('250 local.test\r\n');
          } else if (line.startsWith('MAIL FROM:') || line.startsWith('RCPT TO:')) {
            socket.write('250 2.1.0 OK\r\n');
          } else if (line === 'DATA') {
            collectingData = true;
            socket.write('354 End data with <CR><LF>.<CR><LF>\r\n');
          } else if (line === 'QUIT') {
            socket.write('221 2.0.0 Bye\r\n');
            socket.end();
          } else {
            socket.write('250 OK\r\n');
          }

          lineEnd = buffer.indexOf('\r\n');
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });

    try {
      const address = server.address();
      if (!address || typeof address === 'string') {
        throw new Error('SMTP test server did not bind to a TCP address.');
      }
      const provider = new SmtpEmailProvider({
        host: '127.0.0.1',
        port: address.port,
        secure: false,
        user: '',
        pass: '',
        from: 'Product Sales <sales@example.test>',
        salesInbox: 'inbox@example.test'
      });

      await provider.sendEnquiry(enquiry, product);
      const message = await receivedMessage;

      expect(message).toContain('From: Product Sales <sales@example.test>');
      expect(message).toContain('To: inbox@example.test');
      expect(message).toContain('Reply-To: taylor@example.test');
      expect(message).toContain('Subject: Product enquiry: Test product');
      expect(message).toContain('Customer: Taylor Example');
      expect(message).toContain('Product: Test product (ID 1)');
      expect(message).toContain('Please send me more information.');
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
  }, 10_000);
});
