export const SERVICE_ACCOUNT_PAYMENT = {
  paid: "Paid",
  due: "Due",
  unpaid: "Unpaid",
} as const;

export type ServiceAccountPayment =
  (typeof SERVICE_ACCOUNT_PAYMENT)[keyof typeof SERVICE_ACCOUNT_PAYMENT];

export const SERVICE_ACCOUNT_STATUS = {
  new: "New",
  partial: "Partial",
  full: "Full",
  disabled: "Disabled",
} as const;

export type ServiceAccountStatus =
  (typeof SERVICE_ACCOUNT_STATUS)[keyof typeof SERVICE_ACCOUNT_STATUS];
