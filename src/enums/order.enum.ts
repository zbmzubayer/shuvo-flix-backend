export const ORDER_STATUS = {
  paid: "Paid",
  due: "Due",
  unpaid: "Unpaid",
  gift: "Gift",
  combo: "Combo",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_ACCOUNT_TYPE = {
  personal: "Personal",
  shared: "Shared",
} as const;

export type OrderAccountType = (typeof ORDER_ACCOUNT_TYPE)[keyof typeof ORDER_ACCOUNT_TYPE];
