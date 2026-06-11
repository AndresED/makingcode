export const siteConfig = {
  name: 'Making Code',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  description:
    'Technical writing on backend engineering, cloud architecture, and software craft.',
  author: {
    name: 'Andrés Esquivel',
    url: 'https://www.andresed.dev',
    twitter: '@andres30xed',
  },
  defaultLocale: 'en' as const,
};
