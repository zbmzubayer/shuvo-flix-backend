export const CUSTOMER_SOCIAL = {
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  twitter: "Twitter",
  instagram: "Instagram",
} as const;

export type CustomerSocial = (typeof CUSTOMER_SOCIAL)[keyof typeof CUSTOMER_SOCIAL];
