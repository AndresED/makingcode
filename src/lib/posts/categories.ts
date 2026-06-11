export const POST_CATEGORIES = [
  'backend',
  'cloud',
  'architecture',
  'algorithms',
  'security',
  'ai',
  'devops',
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export function isPostCategory(value: string): value is PostCategory {
  return (POST_CATEGORIES as readonly string[]).includes(value);
}
