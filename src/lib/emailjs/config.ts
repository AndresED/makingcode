export interface EmailJsConfig {
  serviceId: string;
  publicKey: string;
  newsletterWelcomeTemplateId: string;
}

export function getEmailJsConfig(): EmailJsConfig | null {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID?.trim();
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY?.trim();
  const newsletterWelcomeTemplateId =
    process.env.NEXT_PUBLIC_EMAILJS_NEWSLETTER_WELCOME_TEMPLATE_ID?.trim();

  if (!serviceId || !publicKey || !newsletterWelcomeTemplateId) {
    return null;
  }

  return {
    serviceId,
    publicKey,
    newsletterWelcomeTemplateId,
  };
}
