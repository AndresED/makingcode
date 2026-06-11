export const siteConfig = {
  name: 'Making Code',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  description:
    'Technical writing on backend engineering, cloud architecture, and software craft.',
  author: {
    name: 'Andrés Esquivel',
    role: 'Senior Backend Engineer',
    url: 'https://www.andresed.dev',
    email: 'andres30xed@gmail.com',
    twitter: '@andres30xed',
    cvUrl: 'https://www.andresed.dev/cv.pdf',
    socials: [
      {
        id: 'website',
        label: { en: 'Portfolio', es: 'Portafolio' },
        href: 'https://www.andresed.dev',
      },
      {
        id: 'github',
        label: { en: 'GitHub', es: 'GitHub' },
        href: 'https://github.com/AndresED',
      },
      {
        id: 'linkedin',
        label: { en: 'LinkedIn', es: 'LinkedIn' },
        href: 'https://www.linkedin.com/in/andresedev/',
      },
      {
        id: 'medium',
        label: { en: 'Medium', es: 'Medium' },
        href: 'https://medium.com/@andres30xed',
      },
    ],
  },
  defaultLocale: 'en' as const,
};
