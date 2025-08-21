import { type Request, type Response } from "express";

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

import { ENV } from "@/config/env";
import { ErrorResponse } from "@/exception-filters";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception?.message || "Something went wrong, please try again later.";
    let name = "Error";
    let details: string | object = "Internal Server Error";

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      name = exception.name;
      details = exception.getResponse();
    }

    const errorResponse: ErrorResponse = {
      status: false,
      statusCode,
      path: req.url,
      method: req.method,
      name,
      message,
      details,
      timestamp: new Date().toISOString(),
      stack: ENV.NODE_ENV === "development" ? exception.stack : undefined,
    };

    Logger.error(errorResponse, AllExceptionsFilter.name);

    res.status(statusCode).json(errorResponse);
  }
}
