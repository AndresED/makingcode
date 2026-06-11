export const ADMIN_EMAILS = ['andres30xed@gmail.com'] as const;

export type AdminEmail = (typeof ADMIN_EMAILS)[number];

export function isAdminEmail(email: string): email is AdminEmail {
  return (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase());
}
