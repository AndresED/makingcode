import { randomUUID } from 'node:crypto';

export function createNewsletterUnsubscribeToken(): string {
  return randomUUID();
}
