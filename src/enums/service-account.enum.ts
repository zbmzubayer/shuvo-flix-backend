export const SERVICE_ACCOUNT_PAYMENT = {
  paid: "Paid",
  due: "Due",
  unpaid: "Unpaid",
} as const;

export type ServiceAccountPayment =
  (typeof SERVICE_ACCOUNT_PAYMENT)[keyof typeof SERVICE_ACCOUNT_PAYMENT];
