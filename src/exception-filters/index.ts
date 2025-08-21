export type ErrorResponse = {
  status: boolean;
  statusCode: number;
  path: string;
  method: string;
  name: string;
  message: string | string[];
  details: string | string[] | object;
  stack?: string;
  timestamp: string;
};

export * from "./all-exception.filter";
export * from "./prisma-exception.filter";
