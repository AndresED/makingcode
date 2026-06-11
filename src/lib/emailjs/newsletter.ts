import type { Locale } from '@/lib/i18n/dictionary';
import { siteConfig } from '@/lib/seo/site';
import { sendEmailJsTemplate } from './client';
import { getEmailJsConfig } from './config';

/** Welcome email to the subscriber only (no admin notification). */
export async function sendNewsletterWelcomeEmail(
  subscriberEmail: string,
  locale: Locale,
): Promise<void> {
  const config = getEmailJsConfig();
  if (!config) return;

  const siteUrl = siteConfig.url;
  const siteName = siteConfig.name;
  const welcomeSubject =
    locale === 'es' ? `Te suscribiste a ${siteName}` : `You subscribed to ${siteName}`;
  const welcomeMessage =
    locale === 'es'
      ? `Gracias por suscribirte a ${siteName}. Te avisaré cuando publique artículos nuevos en ${siteUrl}.`
      : `Thanks for subscribing to ${siteName}. I'll notify you when new articles go live at ${siteUrl}.`;

  await sendEmailJsTemplate(
    config.serviceId,
    config.newsletterWelcomeTemplateId,
    {
      to_email: subscriberEmail,
      subscriber_email: subscriberEmail,
      locale,
      site_name: siteName,
      site_url: siteUrl,
      subject: welcomeSubject,
      message: welcomeMessage,
    },
    config.publicKey,
  );
}
