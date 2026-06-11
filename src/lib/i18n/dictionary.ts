export const dictionary = {
  en: {
    'nav.home': 'Home',
    'nav.blog': 'Blog',
    'nav.about': 'About',
    'nav.portfolio': 'Portfolio',
    'home.title': 'Making Code',
    'home.subtitle': 'Technical writing on backend, cloud, and architecture.',
    'home.empty': 'No posts yet — new articles coming soon.',
    'footer.built': 'Built with',
    'category.backend': 'Backend',
    'category.cloud': 'Cloud & AWS',
    'category.architecture': 'Architecture',
    'category.algorithms': 'Algorithms',
    'category.security': 'Security & Crypto',
    'category.ai': 'AI & Applied ML',
    'category.devops': 'DevOps & Platform',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.blog': 'Blog',
    'nav.about': 'Acerca de',
    'nav.portfolio': 'Portafolio',
    'home.title': 'Making Code',
    'home.subtitle': 'Escritura técnica sobre backend, cloud y arquitectura.',
    'home.empty': 'Aún no hay publicaciones — pronto habrá artículos nuevos.',
    'footer.built': 'Hecho con',
    'category.backend': 'Backend',
    'category.cloud': 'Cloud y AWS',
    'category.architecture': 'Arquitectura',
    'category.algorithms': 'Algoritmos',
    'category.security': 'Seguridad y cripto',
    'category.ai': 'IA aplicada',
    'category.devops': 'DevOps y plataforma',
  },
} as const;

export type Locale = keyof typeof dictionary;
export type DictionaryKey = keyof (typeof dictionary)['en'];

export function t(locale: Locale, key: DictionaryKey): string {
  return dictionary[locale][key];
}
