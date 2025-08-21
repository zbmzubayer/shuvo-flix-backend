export const ADMIN_ROLE = {
  superAdmin: "Super Admin",
  admin: "Admin",
} as const;

export type AdminRole = (typeof ADMIN_ROLE)[keyof typeof ADMIN_ROLE];
