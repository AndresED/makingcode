import { resolveSiteUrl } from './resolve-site-url';

export const siteConfig = {
  name: 'Making Code',
  url: resolveSiteUrl(),
  description:
    'Senior Backend Engineer writing about NestJS, AWS, and distributed systems built in production.',
  author: {
    name: 'Andrés Esquivel',
    role: 'Senior Backend Engineer',
    location: 'Peru',
    avatarPath: '/images/andres-esquivel.jpg',
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
