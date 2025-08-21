import { type Request, type Response } from "express";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "generated/prisma/runtime/library";

import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";

import { ENV } from "@/config/env";
import { ErrorResponse } from "@/exception-filters";

type PrismaError =
  | PrismaClientInitializationError
  | PrismaClientKnownRequestError
  | PrismaClientRustPanicError
  | PrismaClientUnknownRequestError
  | PrismaClientValidationError;

@Catch(
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError
)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(error: PrismaError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponse = {
      status: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      path: request.url,
      method: request.method,
      name: error.name,
      message: "There was an error, please try again later.",
      details: error.message,
      timestamp: new Date().toISOString(),
      stack: ENV.NODE_ENV === "development" ? error.stack : undefined,
    };

    if (error instanceof PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2002": // Unique constraint failed
          errorResponse.statusCode = HttpStatus.CONFLICT;
          errorResponse.message = "Invalid Input: Trying to create a record that already exists.";
          break;
        case "P2025": // Record not found
          errorResponse.statusCode = HttpStatus.NOT_FOUND;
          errorResponse.message = `${error.meta?.modelName} not found.`;
          break;
        case "P2003": // Foreign key constraint failed
          errorResponse.statusCode = HttpStatus.BAD_REQUEST;
          errorResponse.message = "Invalid Input: The referenced data does not exist.";
          break;
        default:
          break;
      }
    }

    Logger.error(errorResponse, PrismaExceptionFilter.name);

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
