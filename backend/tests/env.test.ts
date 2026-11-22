import { describe, expect, it } from 'vitest';
import { envSchema } from '../src/config/env.js';

describe('environment configuration', () => {
  it('parses featured IDs and SMTP secure mode into validated values', () => {
    const parsed = envSchema.parse({
      FEATURED_PRODUCT_IDS: '5, 2, 9, 7, 4',
      SMTP_SECURE: 'true'
    });

    expect(parsed.FEATURED_PRODUCT_IDS).toEqual([5, 2, 9, 7, 4]);
    expect(parsed.SMTP_SECURE).toBe(true);
  });

  it.each(['', '1,,3', '1,1,2,3,4', '0,2,3,4,5', '-1,2,3,4,5', '1.5,2,3,4,5', 'bad,2,3,4,5', '1,2,3,4'])(
    'rejects invalid featured ID configuration: %s',
    (ids) => {
      expect(envSchema.safeParse({ FEATURED_PRODUCT_IDS: ids }).success).toBe(false);
    }
  );

  it('rejects invalid SMTP secure values', () => {
    expect(envSchema.safeParse({ SMTP_SECURE: 'yes' }).success).toBe(false);
  });

  it('validates the trusted proxy hop count', () => {
    expect(envSchema.parse({ TRUST_PROXY_HOPS: '2' }).TRUST_PROXY_HOPS).toBe(2);
    expect(envSchema.safeParse({ TRUST_PROXY_HOPS: '-1' }).success).toBe(false);
  });

  it('requires SMTP credentials to be provided together', () => {
    expect(envSchema.safeParse({ SMTP_USER: 'user@gmail.com' }).success).toBe(false);
    expect(envSchema.safeParse({ SMTP_PASS: 'app-password' }).success).toBe(false);
  });

  it('removes Gmail App Password grouping whitespace but preserves other SMTP passwords', () => {
    expect(envSchema.parse({
      SMTP_HOST: 'smtp.gmail.com',
      SMTP_USER: 'user@gmail.com',
      SMTP_PASS: 'abcd efgh ijkl mnop'
    }).SMTP_PASS).toBe('abcdefghijklmnop');

    expect(envSchema.parse({
      SMTP_HOST: 'smtp.example.test',
      SMTP_USER: 'user@example.test',
      SMTP_PASS: 'pass word'
    }).SMTP_PASS).toBe('pass word');
  });
});
