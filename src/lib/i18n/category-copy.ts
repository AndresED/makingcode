import type { PostCategory } from '@/lib/posts/categories';
import type { Locale } from '@/lib/i18n/dictionary';

export const CATEGORY_COPY: Record<PostCategory, { en: string; es: string }> = {
  backend: {
    en: 'APIs, NestJS modules, validation, and patterns you can ship without rewriting in six months. Focus on maintainable TypeScript backends.',
    es: 'APIs, módulos NestJS, validación y patrones que puedes llevar a producción sin reescribir en seis meses. TypeScript backend mantenible.',
  },
  cloud: {
    en: 'AWS primitives in practice — Lambda, ECS, Cognito, S3, and IAM with least privilege. Real trade-offs, not console screenshots.',
    es: 'AWS en la práctica: Lambda, ECS, Cognito, S3 e IAM con mínimo privilegio. Trade-offs reales, no capturas del consola.',
  },
  architecture: {
    en: 'Hexagonal boundaries, modular monoliths, and when microservices actually help. Design for change without ceremony.',
    es: 'Límites hexagonales, monolitos modulares y cuándo los microservicios sí aportan. Diseño para el cambio sin ceremonia.',
  },
  algorithms: {
    en: 'Data structures and complexity with a production lens — when Big-O matters on real workloads and when it does not.',
    es: 'Estructuras de datos y complejidad con foco en producción: cuándo importa el Big-O en cargas reales y cuándo no.',
  },
  security: {
    en: 'Auth, RLS, secrets, and crypto basics for backend teams. Practical hardening without security theater.',
    es: 'Auth, RLS, secretos y cripto básica para equipos backend. Endurecimiento práctico sin teatro de seguridad.',
  },
  ai: {
    en: 'Applied ML and generative AI on AWS — RAG, Bedrock, agents, and cost-aware patterns for real products.',
    es: 'ML aplicado e IA generativa en AWS: RAG, Bedrock, agentes y patrones conscientes del coste en productos reales.',
  },
  devops: {
    en: 'CI/CD, Docker, observability, and platform work that keeps deploys boring — in the good way.',
    es: 'CI/CD, Docker, observabilidad y plataforma para que los deploys sean aburridos — en el buen sentido.',
  },
};

export function categoryDescription(locale: Locale, category: PostCategory): string {
  const copy = CATEGORY_COPY[category];
  return locale === 'es' ? copy.es : copy.en;
}
